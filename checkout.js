// ===== CHECKOUT PAGE FUNCTIONALITY =====

function displayCheckoutItems() {
    const cart = StorageManager.getCart();
    const checkoutItems = document.getElementById('checkoutItems');
    checkoutItems.innerHTML = '';

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItems.appendChild(itemDiv);
    });

    updateCheckoutSummary();
}5

function updateCheckoutSummary() {
    const { subtotal, shipping, tax, total } = CartManager.calculateTotals();

    document.getElementById('checkoutSubtotal').textContent = `₹{subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = `₹{shipping.toFixed(2)}`;
    document.getElementById('checkoutTax').textContent = `₹{tax.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `₹{total.toFixed(2)}`;
}

function validateAddressForm() {
    const form = document.getElementById('addressForm');
    const formData = new FormData(form);

    for (let [key, value] of formData.entries()) {
        if (!value.trim()) {
            alert(`Please fill in all required fields. ${key} is empty.`);
            return false;
        }
    }

    // Validate email
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Validate phone
    const phone = document.getElementById('phone').value;
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        alert('Please enter a valid phone number (10 digits)');
        return false;
    }

    // Validate zipcode
    const zipcode = document.getElementById('zipcode').value;
    if (!/^\d{5,6}$/.test(zipcode)) {
        alert('Please enter a valid zip code');
        return false;
    }

    return true;
}

function getAddressData() {
    return {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        addressDetails: document.getElementById('addressDetails').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value,
        country: document.getElementById('country').value,
        saveAddress: document.getElementById('saveAddress').checked
    };
}

function getPaymentData() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const paymentData = { method: paymentMethod };

    if (paymentMethod === 'card') {
        paymentData.cardName = document.getElementById('cardName').value;
        paymentData.cardNumber = document.getElementById('cardNumber').value;
        paymentData.expiry = document.getElementById('expiry').value;
        paymentData.cvv = document.getElementById('cvv').value;

        if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
            alert('Please fill in all card details');
            return null;
        }

        if (!/^\d{13,19}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
            alert('Please enter a valid card number');
            return null;
        }
    }

    return paymentData;
}

function generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function createOrder(addressData, paymentData) {
    const cart = StorageManager.getCart();
    const { subtotal, shipping, tax, total } = CartManager.calculateTotals();
    const orders = StorageManager.getOrders();

    const order = {
        id: generateOrderNumber(),
        date: new Date().toLocaleString(),
        customer: {
            name: addressData.firstName + ' ' + addressData.lastName,
            email: addressData.email,
            phone: addressData.phone,
            address: addressData.address + ', ' + addressData.addressDetails + ', ' + 
                    addressData.city + ', ' + addressData.state + ' ' + addressData.zipcode + ', ' + addressData.country
        },
        items: cart,
        totals: {
            subtotal,
            shipping,
            tax,
            total
        },
        payment: paymentData,
        status: 'pending'
    };

    orders.push(order);
    StorageManager.setOrders(orders);
    return order;
}

function placeOrder() {
    // Validate address
    if (!validateAddressForm()) {
        return;
    }

    const addressData = getAddressData();
    const paymentData = getPaymentData();

    if (!paymentData) {
        return;
    }

    // Create order
    const order = createOrder(addressData, paymentData);

    // Clear cart
    StorageManager.setCart([]);
    CartManager.updateCartBadge();

    // Show success modal
    const modal = document.getElementById('successModal');
    document.getElementById('orderNumber').textContent = `Order ID: ${order.id}`;
    modal.classList.add('show');

    // Handle continue shopping
    document.getElementById('continueShopBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');

    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardDetails.classList.remove('hidden');
            } else {
                cardDetails.classList.add('hidden');
            }
        });
    });
}

function setupPlaceOrderButton() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
}

function setupSuccessModal() {
    const modal = document.getElementById('successModal');
    const closeBtn = modal.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            window.location.href = 'index.html';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            window.location.href = 'index.html';
        }
    });
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();
    displayCheckoutItems();
    setupPaymentMethodToggle();
    setupPlaceOrderButton();
    setupSuccessModal();

    // Redirect to cart if empty
    const cart = StorageManager.getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to cart...');
        window.location.href = 'cart.html';
    }
});
