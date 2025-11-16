class RestaurantMenu {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadMenuItems();
        this.setupEventListeners();
        this.populateCategoryFilters();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load categories');
        }
    }

    async loadMenuItems(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/menu-items?${queryString}`);
            this.menuItems = await response.json();
            this.renderMenuItems();
        } catch (error) {
            console.error('Error loading menu items:', error);
            this.showError('Failed to load menu items');
        }
    }

    renderMenuItems() {
        const menuGrid = document.getElementById('menuGrid');
        
        if (this.menuItems.length === 0) {
            menuGrid.innerHTML = '<div class="loading">No menu items found</div>';
            return;
        }

        menuGrid.innerHTML = this.menuItems.map(item => {
            const category = this.categories.find(cat => cat.id === item.category_id);
            return `
                <div class="menu-item" data-id="${item.id}">
                    <h3>${this.escapeHtml(item.name)}</h3>
                    <div class="price">₹${item.price}</div>
                    <div class="description">${this.escapeHtml(item.description)}</div>
                    <div class="category">${category ? this.escapeHtml(category.name) : 'Unknown'}</div>
                    <div class="actions">
                        <button class="btn-small edit" onclick="menuApp.editItem(${item.id})">Edit</button>
                        <button class="btn-small delete" onclick="menuApp.deleteItem(${item.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    populateCategoryFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const itemCategory = document.getElementById('itemCategory');

        const categoryOptions = this.categories.map(cat => 
            `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`
        ).join('');

        categoryFilter.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
        itemCategory.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
    }

    setupEventListeners() {
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.applyFilters();
        });

        // Price filters
        document.getElementById('minPrice').addEventListener('input', () => {
            this.applyFilters();
        });

        document.getElementById('maxPrice').addEventListener('input', () => {
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Add item form
        document.getElementById('addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMenuItem();
        });
    }

    applyFilters() {
        const filters = {};
        
        const categoryId = document.getElementById('categoryFilter').value;
        if (categoryId) filters.category_id = categoryId;

        const search = document.getElementById('searchInput').value.trim();
        if (search) filters.search = search;

        const minPrice = document.getElementById('minPrice').value;
        if (minPrice) filters.min_price = minPrice;

        const maxPrice = document.getElementById('maxPrice').value;
        if (maxPrice) filters.max_price = maxPrice;

        this.loadMenuItems(filters);
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        this.loadMenuItems();
    }

    async addMenuItem() {
        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const description = document.getElementById('itemDescription').value.trim();
        const categoryId = parseInt(document.getElementById('itemCategory').value);

        if (!name || !price || !description || !categoryId) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/menu-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    price,
                    description,
                    category_id: categoryId
                })
            });

            if (response.ok) {
                this.showSuccess('Menu item added successfully!');
                document.getElementById('addItemForm').reset();
                await this.loadMenuItems();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to add menu item');
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            this.showError('Failed to add menu item');
        }
    }

    async editItem(id) {
        const item = this.menuItems.find(item => item.id === id);
        if (!item) return;

        const newItemName = prompt('Enter new name:', item.name);
        if (newItemName === null) return;

        const newItemPrice = prompt('Enter new price (₹):', item.price);
        if (newItemPrice === null) return;

        const newItemDescription = prompt('Enter new description:', item.description);
        if (newItemDescription === null) return;

        try {
            const response = await fetch(`/api/menu-items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newItemName,
                    price: parseFloat(newItemPrice),
                    description: newItemDescription
                })
            });

            if (response.ok) {
                this.showSuccess('Menu item updated successfully!');
                await this.loadMenuItems();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to update menu item');
            }
        } catch (error) {
            console.error('Error updating menu item:', error);
            this.showError('Failed to update menu item');
        }
    }

    async deleteItem(id) {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        try {
            const response = await fetch(`/api/menu-items/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Menu item deleted successfully!');
                await this.loadMenuItems();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to delete menu item');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            this.showError('Failed to delete menu item');
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.success, .error');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(messageDiv, main.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new RestaurantMenu();
});
