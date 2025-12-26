// ===== PRODUCTS MANAGEMENT =====
let currentEditingProductId = null;

function displayProducts() {
    const products = StorageManager.getProducts();
    const tableBody = document.getElementById('productsTableBody');
    const noProductsMsg = document.getElementById('noProductsMsg');
    const productsTable = document.getElementById('productsTable');

    tableBody.innerHTML = '';

    if (products.length === 0) {
        noProductsMsg.style.display = 'block';
        productsTable.style.display = 'none';
        return;
    }

    noProductsMsg.style.display = 'none';
    productsTable.style.display = 'table';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="product-img-thumb admin-product-img" title="Click to view details" style="cursor: pointer;"></td>
            <td><span class="admin-product-name" style="cursor: pointer; color: #007bff; text-decoration: underline;">${product.name}</span></td>
            <td>${product.category}</td>
            <td>₹${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" data-edit-id="${product.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-delete-id="${product.id}">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // attach listeners for details
        const imgEl = row.querySelector('.admin-product-img');
        const nameEl = row.querySelector('.admin-product-name');
        if (imgEl) imgEl.addEventListener('click', () => showProductDetails(product.id));
        if (nameEl) nameEl.addEventListener('click', () => showProductDetails(product.id));

        // attach listeners for action buttons
        const editBtn = row.querySelector('[data-edit-id]');
        const deleteBtn = row.querySelector('[data-delete-id]');
        if (editBtn) editBtn.addEventListener('click', () => editProduct(product.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteProduct(product.id));
    });
}

function showProductDetails(productId) {
    const products = StorageManager.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    document.getElementById('detailProductName').textContent = product.name;
    document.getElementById('detailProductImage').src = product.image;
    document.getElementById('detailCategory').textContent = product.category;
    document.getElementById('detailPrice').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('detailStock').textContent = `${product.stock} units`;
    document.getElementById('detailDescription').textContent = product.description;

    const modal = document.getElementById('productDetailsModal');
    modal.classList.add('show');

    document.getElementById('editProductFromDetail').onclick = () => {
        modal.classList.remove('show');
        editProduct(productId);
    };
}

function toggleProductForm() {
    const formSection = document.getElementById('productFormSection');
    formSection.classList.toggle('hidden');
}

function openProductForm() {
    currentEditingProductId = null;
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '<p style="color: #6c757d; margin: 0;">Image preview will appear here</p>';
    toggleProductForm();
}

function editProduct(productId) {
    const products = StorageManager.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    currentEditingProductId = productId;
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = productId;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDesc').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    // We cannot programmatically set the value of a file input.
    // We'll just clear it. The user can upload a new file if they want to change the image.
    document.getElementById('productImage').value = '';
    document.getElementById('productImageBase64').value = product.image;
    updateImagePreview(product.image);

    document.getElementById('productFormSection').classList.remove('hidden');
    document.getElementById('productFormSection').scrollIntoView({ behavior: 'smooth' });
}

function updateImagePreview(imageUrl) {
    // This function now handles both Base64 strings and URLs for backward compatibility
    const imagePreview = document.getElementById('imagePreview');
    if (imageUrl) {
        imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
        document.getElementById('productImageBase64').value = imageUrl;
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = StorageManager.getProducts();
        products = products.filter(p => p.id !== productId);
        StorageManager.setProducts(products);
        displayProducts();
    }
}

function saveProduct(e) {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDesc').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImageBase64').value
    };

    // Image is required for new products, but not when editing an existing one (if it already has an image)
    if (!productData.name || !productData.category || !productData.description || isNaN(productData.price) || !productData.image) {
        alert('Please fill in all fields');
        return;
    }

    let products = StorageManager.getProducts();

    if (productId) {
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        const newProduct = {
            id: (products.length > 0 ? Math.max(...products.map(p => p.id)) : 0) + 1,
            ...productData
        };
        products.push(newProduct);
    }

    StorageManager.setProducts(products);
    displayProducts();
    toggleProductForm();
    alert('Product saved successfully!');
}

function setupProductPage() {
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    document.getElementById('addProductBtn').addEventListener('click', openProductForm);
    document.getElementById('cancelFormBtn').addEventListener('click', toggleProductForm);
    document.getElementById('addFirstProduct').addEventListener('click', (e) => {
        e.preventDefault();
        openProductForm();
    });

    const productImageInput = document.getElementById('productImage');
    productImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                updateImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    const modal = document.getElementById('productDetailsModal');
    modal.querySelector('.close').addEventListener('click', () => modal.classList.remove('show'));
    document.getElementById('closeDetailBtn').addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.remove('show');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();
    displayProducts();
    setupProductPage();
});
