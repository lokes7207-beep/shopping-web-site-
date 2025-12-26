// ===== ADMIN PAGE FUNCTIONALITY =====

// Tab switching
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.admin-tab');
    const menuLinks = document.querySelectorAll('.menu-link');

    tabs.forEach(tab => tab.classList.remove('active'));
    menuLinks.forEach(link => link.classList.remove('active'));

    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const selectedLink = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedLink) {
        selectedLink.classList.add('active');
    }
}

// ===== DASHBOARD =====
function displayDashboard() {
    const products = StorageManager.getProducts();
    const orders = StorageManager.getOrders();

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

// ===== ORDERS MANAGEMENT =====
let currentOrderForModal = null;

function displayOrders() {
    const orders = StorageManager.getOrders();
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const tableBody = document.getElementById('ordersTableBody');
    const noOrdersMsg = document.getElementById('noOrdersMsg');

    tableBody.innerHTML = '';

    const filteredOrders = statusFilter
        ? orders.filter(order => order.status === statusFilter)
        : orders;

    if (filteredOrders.length === 0) {
        noOrdersMsg.style.display = 'block';
        document.getElementById('ordersTable').style.display = 'none';
        return;
    }

    noOrdersMsg.style.display = 'none';
    document.getElementById('ordersTable').style.display = 'table';

    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        const statusColor = order.status === 'pending' ? '#ffc107' : 
                          order.status === 'confirmed' ? '#17a2b8' :
                          order.status === 'shipped' ? '#007bff' :
                          order.status === 'delivered' ? '#28a745' : '#dc3545';
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer.name}</td>
            <td>₹${order.totals.total.toFixed(2)}</td>
            <td>${order.payment.method.toUpperCase()}</td>
            <td>
                <span style="padding: 5px 10px; background-color: ${statusColor}; color: white; border-radius: 4px; font-size: 12px;">
                    ${order.status}
                </span>
            </td>
            <td>${order.date}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewOrderDetails('${order.id}')">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewOrderDetails(orderId) {
    const orders = StorageManager.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    currentOrderForModal = orderId;

    document.getElementById('modalOrderId').textContent = order.id;
    document.getElementById('modalCustomerName').textContent = order.customer.name;
    document.getElementById('modalCustomerEmail').textContent = order.customer.email;
    document.getElementById('modalCustomerPhone').textContent = order.customer.phone;
    document.getElementById('modalCustomerAddress').textContent = order.customer.address;
    document.getElementById('modalPaymentMethod').textContent = order.payment.method.toUpperCase();

    // Display order items
    const itemsList = document.getElementById('orderItemsList');
    itemsList.innerHTML = '';
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        `;
        itemsList.appendChild(row);
    });

    document.getElementById('modalOrderTotal').textContent = `₹${order.totals.total.toFixed(2)}`;
    document.getElementById('orderStatus').value = order.status;

    const modal = document.getElementById('orderModal');
    modal.classList.add('show');
}

function updateOrderStatus() {
    if (!currentOrderForModal) return;

    const newStatus = document.getElementById('orderStatus').value;
    let orders = StorageManager.getOrders();

    const orderIndex = orders.findIndex(o => o.id === currentOrderForModal);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        StorageManager.setOrders(orders);
        displayOrders();
        alert(`Order status updated to: ${newStatus}`);
        const modal = document.getElementById('orderModal');
        modal.classList.remove('show');
    }
}

function setupOrdersFilter() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', displayOrders);
    }
}

function setupOrderModal() {
    const modal = document.getElementById('orderModal');
    const closeBtn = modal.querySelector('.close');
    const updateStatusBtn = document.getElementById('updateStatusBtn');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    updateStatusBtn.addEventListener('click', updateOrderStatus);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ===== MENU SETUP =====
function setupAdminMenu() {
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (!tabName) { // It's a link to another page
                window.location.href = link.getAttribute('href');
                return;
            }
            switchTab(tabName);

            if (tabName === 'dashboard') {
                displayDashboard();
            } else if (tabName === 'orders') {
                displayOrders();
            }
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();
    displayDashboard();
    displayOrders();

    setupAdminMenu();
    setupOrdersFilter();
    setupOrderModal();

    // Initialize first tab as active
    switchTab('dashboard');
});
