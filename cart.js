// ===== CART PAGE FUNCTIONALITY =====

function displayCartItems() {
    const cart = StorageManager.getCart();
    const cartItemsBody = document.getElementById('cartItemsBody');
    const emptyCartMsg = document.getElementById('emptyCartMsg');
    const cartTable = document.getElementById('cartTable');

    cartItemsBody.innerHTML = '';

    if (cart.length === 0) {
        cartTable.style.display = 'none';
        emptyCartMsg.style.display = 'block';
        return;
    }

    cartTable.style.display = 'table';
    emptyCartMsg.style.display = 'none';

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${item.image}" style="width: 50px; border-radius: 4px; margin-right: 10px;">${item.name}
            </td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                    onchange="updateQuantity(${item.id}, this.value)">
            </td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <a href="#" class="remove-btn" onclick="removeItem(${item.id}); return false;">Remove</a>
            </td>
        `;
        cartItemsBody.appendChild(row);
    });

    updateCartSummary();
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item?')) {
        CartManager.removeFromCart(productId);
        CartManager.updateCartBadge();
        displayCartItems();
    }
}

function updateQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    if (quantity > 0) {
        CartManager.updateCartItemQuantity(productId, quantity);
        CartManager.updateCartBadge();
        displayCartItems();
    }
}

function updateCartSummary() {
    const { subtotal, shipping, tax, total } = CartManager.calculateTotals();

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `₹${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = StorageManager.getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();
    displayCartItems();
    setupCheckoutButton();
});
