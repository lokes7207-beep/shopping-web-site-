// ===== LOCAL STORAGE MANAGEMENT =====
class StorageManager {
    static getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    static setCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getProducts() {
        return JSON.parse(localStorage.getItem('products')) || StorageManager.getDefaultProducts();
    }

    static setProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    static setOrders(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    static getDefaultProducts() {
        return [
            {
                id: 1,
                name: 'Wireless Headphones',
                category: 'Electronics',
                description: 'High-quality wireless headphones with noise cancellation',
                price: 2999,
                stock: 15,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
            },
            {
                id: 2,
                name: 'USB-C Cable',
                category: 'Electronics',
                description: 'Fast charging USB-C cable, 6ft length',
                price: 499,
                stock: 50,
                image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop'
            },
            {
                id: 3,
                name: 'Cotton T-Shirt',
                category: 'Clothing',
                description: 'Comfortable 100% cotton t-shirt',
                price: 799,
                stock: 30,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'
            },
            {
                id: 4,
                name: 'JavaScript Book',
                category: 'Books',
                description: 'Learn JavaScript - Complete Guide',
                price: 1299,
                stock: 20,
                image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop'
            },
            {
                id: 5,
                name: 'Plant Pot',
                category: 'Home',
                description: 'Beautiful ceramic plant pot',
                price: 899,
                stock: 25,
                image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop'
            },
            {
                id: 6,
                name: 'Phone Stand',
                category: 'Electronics',
                description: 'Adjustable phone stand for desk',
                price: 599,
                stock: 40,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400&h=300&fit=crop'
            }
        ];
    }
}

// ===== AUTHENTICATION HELPER =====
class AuthManager {
    static isLoggedIn() {
        return sessionStorage.getItem('loggedInUser') !== null;
    }
}


// ===== PRODUCT MANAGEMENT =====
class ProductManager {
    static displayProducts(productsToDisplay = null) {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        const products = productsToDisplay || StorageManager.getProducts();
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                    <div class="product-desc">${product.description}</div>
                    <div class="product-price">₹${product.price.toFixed(2)}</div>
                    <div class="product-stock ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : ''}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                </div>
            `;
            // Open product modal when card is clicked
            card.addEventListener('click', (e) => {
                ProductManager.showProductModal(product);
            });
            container.appendChild(card);
        });
    }

    static showProductModal(product) {
        const modal = document.getElementById('productModal');
        document.getElementById('modalProductImg').src = product.image;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductDesc').textContent = product.description;
        document.getElementById('modalProductPrice').textContent = `₹${product.price.toFixed(2)}`;
        document.getElementById('modalProductStock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';

        const buyNowBtn = document.getElementById('buyNowBtn');
        const addToCartBtn = document.getElementById('addToCartBtn');

        buyNowBtn.onclick = () => {
            if (AuthManager.isLoggedIn()) {
                CartManager.addToCart(product);
                window.location.href = 'checkout.html';
            } else {
                // Save the intended destination and redirect to login
                sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
                window.location.href = 'login.html';
            }
        };

        addToCartBtn.onclick = () => {
            CartManager.addToCart(product);
            modal.classList.remove('show');
            CartManager.updateCartBadge();
            alert('Product added to cart!');
        };

        if (product.stock === 0) {
            buyNowBtn.disabled = true;
            addToCartBtn.disabled = true;
        } else {
            buyNowBtn.disabled = false;
            addToCartBtn.disabled = false;
        }

        modal.classList.add('show');
    }

    static filterProducts() {
        const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryValue = document.getElementById('categoryFilter')?.value || '';

        const products = StorageManager.getProducts();
        const filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchValue) ||
                                product.description.toLowerCase().includes(searchValue);
            const matchesCategory = categoryValue === '' || product.category === categoryValue;
            return matchesSearch && matchesCategory;
        });

        ProductManager.displayProducts(filtered);
    }
}

// ===== CART MANAGEMENT =====
class CartManager {
    static addToCart(product) {
        const cart = StorageManager.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        StorageManager.setCart(cart);
        CartManager.updateCartBadge();
    }

    static removeFromCart(productId) {
        let cart = StorageManager.getCart();
        cart = cart.filter(item => item.id !== productId);
        StorageManager.setCart(cart);
    }

    static updateCartItemQuantity(productId, quantity) {
        const cart = StorageManager.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                CartManager.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                StorageManager.setCart(cart);
            }
        }
    }

    static updateCartBadge() {
        const cart = StorageManager.getCart();
        const badges = document.querySelectorAll('#cart-count');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badges.forEach(badge => badge.textContent = count);
    }

    static calculateTotals() {
        const cart = StorageManager.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 10;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }
}

// ===== MODAL MANAGEMENT =====
function setupModalListeners() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ===== SEARCH AND FILTER SETUP =====
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', ProductManager.filterProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', ProductManager.filterProducts);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();

    // Initialize products on shop page
    if (document.getElementById('productsContainer')) {
        ProductManager.displayProducts();
        setupSearchAndFilter();
        setupModalListeners();
    }
});
