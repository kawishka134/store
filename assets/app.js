/**
 * ගබඩා ➜ ශොප් Inventory App
 * A single-page web application for managing warehouse and shop inventory
 */

// App Version
const APP_VERSION = "1.0.0";
const DATA_VERSION = "1.0.0";

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Initialize the app
    const app = new InventoryApp();
    app.init();
});

/**
 * Main App Class
 */
class InventoryApp {
    constructor() {
        // Initialize models
        this.itemsModel = new ItemsModel();
        this.logsModel = new LogsModel();
        this.settingsModel = new SettingsModel();
        
        // Initialize UI controllers
        this.dashboardUI = new DashboardUI(this);
        this.itemsUI = new ItemsUI(this);
        this.warehouseUI = new WarehouseUI(this);
        this.shopUI = new ShopUI(this);
        this.transferUI = new TransferUI(this);
        this.logsUI = new LogsUI(this);
        this.settingsUI = new SettingsUI(this);
        this.navUI = new NavUI(this);
        
        // Current view
        this.currentView = 'dashboard';
        
        // Debounce timers
        this.debounceTimers = {};
    }
    
    init() {
        // Initialize data
        this.itemsModel.init();
        this.logsModel.init();
        this.settingsModel.init();
        
        // Initialize UI
        this.dashboardUI.init();
        this.itemsUI.init();
        this.warehouseUI.init();
        this.shopUI.init();
        this.transferUI.init();
        this.logsUI.init();
        this.settingsUI.init();
        this.navUI.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply theme
        this.applyTheme();
        
        // Show dashboard by default
        this.showView('dashboard');
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Export CSV button
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.showExportCsvModal();
        });
        
        // Import CSV button
        document.getElementById('import-csv-btn').addEventListener('click', () => {
            this.showImportCsvModal();
        });
    }
    
    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected view
        document.getElementById(`view-${viewName}`).classList.remove('hidden');
        
        // Update navigation
        this.navUI.setActiveView(viewName);
        
        // Refresh the view
        switch(viewName) {
            case 'dashboard':
                this.dashboardUI.refresh();
                break;
            case 'items':
                this.itemsUI.refresh();
                break;
            case 'warehouse':
                this.warehouseUI.refresh();
                break;
            case 'shop':
                this.shopUI.refresh();
                break;
            case 'transfer':
                this.transferUI.refresh();
                break;
            case 'logs':
                this.logsUI.refresh();
                break;
            case 'settings':
                this.settingsUI.refresh();
                break;
        }
        
        this.currentView = viewName;
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        
        // Set icon based on type
        const icon = toast.querySelector('i');
        icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : 'alert-circle');
        
        // Set color based on type
        if (type === 'error') {
            toast.classList.add('bg-red-600');
            toast.classList.remove('bg-gray-800');
        } else {
            toast.classList.remove('bg-red-600');
            toast.classList.add('bg-gray-800');
        }
        
        // Show toast
        toast.classList.remove('hidden');
        
        // Update icon
        lucide.createIcons();
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    debounce(func, delay, id) {
        if (this.debounceTimers[id]) {
            clearTimeout(this.debounceTimers[id]);
        }
        
        this.debounceTimers[id] = setTimeout(() => {
            func();
            delete this.debounceTimers[id];
        }, delay);
    }
    
    formatCurrency(amount) {
        const currencySymbol = this.settingsModel.getSetting('currencySymbol') || 'Rs.';
        return `${currencySymbol} ${parseFloat(amount).toFixed(2)}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('si-LK', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    showExportCsvModal() {
        document.getElementById('export-csv-modal').classList.remove('hidden');
    }
    
    showImportCsvModal() {
        document.getElementById('import-csv-modal').classList.remove('hidden');
    }
}

/**
 * Items Model
 */
class ItemsModel {
    constructor() {
        this.items = [];
        this.storageKey = 'inv_items';
    }
    
    init() {
        // Load items from localStorage
        const savedItems = localStorage.getItem(this.storageKey);
        
        if (savedItems) {
            try {
                this.items = JSON.parse(savedItems);
            } catch (e) {
                console.error('Error parsing items from localStorage', e);
                this.items = [];
            }
        } else {
            // Initialize with empty array
            this.items = [];
            this.save();
        }
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            return true;
        } catch (e) {
            console.error('Error saving items to localStorage', e);
            return false;
        }
    }
    
    getAll() {
        return this.items;
    }
    
    getById(id) {
        return this.items.find(item => item.itemId === id);
    }
    
    getByName(name) {
        return this.items.find(item => item.name.toLowerCase() === name.toLowerCase());
    }
    
    add(item) {
        // Validate required fields
        if (!item.name || !item.costPrice || !item.sellPrice) {
            throw new Error('Required fields missing');
        }
        
        // Check for duplicate name (case-insensitive)
        if (this.getByName(item.name)) {
            throw new Error('Item with this name already exists');
        }
        
        // Create new item
        const newItem = {
            itemId: this.generateId(),
            name: item.name.trim(),
            category: item.category ? item.category.trim() : '',
            unit: item.unit || 'pcs',
            costPrice: parseFloat(item.costPrice),
            sellPrice: parseFloat(item.sellPrice),
            warehouseQty: parseInt(item.warehouseQty) || 0,
            shopQty: parseInt(item.shopQty) || 0,
            notes: item.notes ? item.notes.trim() : '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.items.push(newItem);
        this.save();
        
        return newItem;
    }
    
    update(id, updates) {
        const index = this.items.findIndex(item => item.itemId === id);
        
        if (index === -1) {
            throw new Error('Item not found');
        }
        
        // Check for duplicate name if name is being updated
        if (updates.name && updates.name !== this.items[index].name) {
            if (this.getByName(updates.name)) {
                throw new Error('Item with this name already exists');
            }
        }
        
        // Update item
        const updatedItem = {
            ...this.items[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Ensure numeric fields are numbers
        if (updatedItem.costPrice !== undefined) {
            updatedItem.costPrice = parseFloat(updatedItem.costPrice);
        }
        
        if (updatedItem.sellPrice !== undefined) {
            updatedItem.sellPrice = parseFloat(updatedItem.sellPrice);
        }
        
        if (updatedItem.warehouseQty !== undefined) {
            updatedItem.warehouseQty = parseInt(updatedItem.warehouseQty);
        }
        
        if (updatedItem.shopQty !== undefined) {
            updatedItem.shopQty = parseInt(updatedItem.shopQty);
        }
        
        // Trim string fields
        if (updatedItem.name !== undefined) {
            updatedItem.name = updatedItem.name.trim();
        }
        
        if (updatedItem.category !== undefined) {
            updatedItem.category = updatedItem.category.trim();
        }
        
        if (updatedItem.notes !== undefined) {
            updatedItem.notes = updatedItem.notes.trim();
        }
        
        this.items[index] = updatedItem;
        this.save();
        
        return updatedItem;
    }
    
    delete(id) {
        const index = this.items.findIndex(item => item.itemId === id);
        
        if (index === -1) {
            throw new Error('Item not found');
        }
        
        const deletedItem = this.items[index];
        this.items.splice(index, 1);
        this.save();
        
        return deletedItem;
    }
    
    getCategories() {
        const categories = new Set();
        
        this.items.forEach(item => {
            if (item.category) {
                categories.add(item.category);
            }
        });
        
        return Array.from(categories).sort();
    }
    
    getWarehouseTotal() {
        return this.items.reduce((total, item) => total + item.warehouseQty, 0);
    }
    
    getShopTotal() {
        return this.items.reduce((total, item) => total + item.shopQty, 0);
    }
    
    getWarehouseValue() {
        return this.items.reduce((total, item) => {
            return total + (item.warehouseQty * item.costPrice);
        }, 0);
    }
    
    getShopValue() {
        return this.items.reduce((total, item) => {
            return total + (item.shopQty * item.costPrice);
        }, 0);
    }
    
    getPotentialRevenue() {
        return this.items.reduce((total, item) => {
            return total + (item.shopQty * item.sellPrice);
        }, 0);
    }
    
    transferItem(itemId, quantity) {
        const item = this.getById(itemId);
        
        if (!item) {
            throw new Error('Item not found');
        }
        
        if (item.warehouseQty < quantity) {
            throw new Error('Not enough stock in warehouse');
        }
        
        // Update quantities
        item.warehouseQty -= quantity;
        item.shopQty += quantity;
        item.updatedAt = new Date().toISOString();
        
        this.save();
        
        return item;
    }
    
    bulkUpdate(location, updates) {
        updates.forEach(update => {
            const item = this.getById(update.itemId);
            
            if (item) {
                if (location === 'warehouse') {
                    item.warehouseQty = parseInt(update.quantity);
                } else {
                    item.shopQty = parseInt(update.quantity);
                }
                
                item.updatedAt = new Date().toISOString();
            }
        });
        
        this.save();
        return this.items;
    }
    
    importFromCsv(data, method = 'merge') {
        if (method === 'replace') {
            // Replace all items
            this.items = [];
        }
        
        const importedItems = [];
        
        data.forEach(row => {
            try {
                // Check if item exists by name
                const existingItem = this.getByName(row.name);
                
                if (existingItem && method === 'merge') {
                    // Update existing item
                    const updatedItem = this.update(existingItem.itemId, {
                        category: row.category,
                        unit: row.unit,
                        costPrice: row.costPrice,
                        sellPrice: row.sellPrice,
                        warehouseQty: row.warehouseQty,
                        shopQty: row.shopQty,
                        notes: row.notes
                    });
                    
                    importedItems.push(updatedItem);
                } else if (!existingItem) {
                    // Add new item
                    const newItem = this.add({
                        name: row.name,
                        category: row.category,
                        unit: row.unit,
                        costPrice: row.costPrice,
                        sellPrice: row.sellPrice,
                        warehouseQty: row.warehouseQty,
                        shopQty: row.shopQty,
                        notes: row.notes
                    });
                    
                    importedItems.push(newItem);
                }
            } catch (e) {
                console.error('Error importing item:', row, e);
            }
        });
        
        return importedItems;
    }
    
    exportToCsv() {
        const headers = [
            'itemId', 'name', 'category', 'unit', 
            'costPrice', 'sellPrice', 'warehouseQty', 
            'shopQty', 'notes'
        ];
        
        const rows = this.items.map(item => [
            item.itemId,
            item.name,
            item.category,
            item.unit,
            item.costPrice,
            item.sellPrice,
            item.warehouseQty,
            item.shopQty,
            item.notes
        ]);
        
        return {
            headers,
            rows
        };
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

/**
 * Logs Model
 */
class LogsModel {
    constructor() {
        this.logs = [];
        this.storageKey = 'inv_logs';
    }
    
    init() {
        // Load logs from localStorage
        const savedLogs = localStorage.getItem(this.storageKey);
        
        if (savedLogs) {
            try {
                this.logs = JSON.parse(savedLogs);
            } catch (e) {
                console.error('Error parsing logs from localStorage', e);
                this.logs = [];
            }
        } else {
            // Initialize with empty array
            this.logs = [];
            this.save();
        }
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
            return true;
        } catch (e) {
            console.error('Error saving logs to localStorage', e);
            return false;
        }
    }
    
    getAll() {
        // Return logs sorted by time (newest first)
        return [...this.logs].sort((a, b) => new Date(b.timeISO) - new Date(a.timeISO));
    }
    
    add(type, itemId = null, itemName = null, qty = null, details = null) {
        const newLog = {
            id: this.generateId(),
            timeISO: new Date().toISOString(),
            type,
            itemId,
            itemName,
            qty,
            details
        };
        
        this.logs.push(newLog);
        this.save();
        
        return newLog;
    }
    
    getRecent(count = 10) {
        return this.getAll().slice(0, count);
    }
    
    getRecentTransfers(count = 10) {
        return this.getAll()
            .filter(log => log.type === 'transfer')
            .slice(0, count);
    }
    
    exportToCsv() {
        const headers = [
            'time', 'type', 'itemId', 'itemName', 'qty', 'details'
        ];
        
        const rows = this.logs.map(log => [
            log.timeISO,
            log.type,
            log.itemId || '',
            log.itemName || '',
            log.qty || '',
            log.details || ''
        ]);
        
        return {
            headers,
            rows
        };
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

/**
 * Settings Model
 */
class SettingsModel {
    constructor() {
        this.settings = {
            currencySymbol: 'Rs.',
            lowStockThreshold: 5,
            language: 'si'
        };
        this.storageKey = 'inv_settings';
    }
    
    init() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem(this.storageKey);
        
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            } catch (e) {
                console.error('Error parsing settings from localStorage', e);
            }
        } else {
            // Initialize with default settings
            this.save();
        }
        
        // Save app version
        localStorage.setItem('inv_app_version', DATA_VERSION);
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            return true;
        } catch (e) {
            console.error('Error saving settings to localStorage', e);
            return false;
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.save();
        return this.settings[key];
    }
    
    updateAll(settings) {
        this.settings = { ...this.settings, ...settings };
        this.save();
        return this.settings;
    }
    
    exportData() {
        return {
            items: localStorage.getItem('inv_items'),
            logs: localStorage.getItem('inv_logs'),
            settings: localStorage.getItem('inv_settings'),
            version: localStorage.getItem('inv_app_version'),
            theme: localStorage.getItem('theme')
        };
    }
    
    importData(data) {
        try {
            if (data.items) localStorage.setItem('inv_items', data.items);
            if (data.logs) localStorage.setItem('inv_logs', data.logs);
            if (data.settings) localStorage.setItem('inv_settings', data.settings);
            if (data.version) localStorage.setItem('inv_app_version', data.version);
            if (data.theme) localStorage.setItem('theme', data.theme);
            
            return true;
        } catch (e) {
            console.error('Error importing data', e);
            return false;
        }
    }
    
    clearAllData() {
        try {
            localStorage.removeItem('inv_items');
            localStorage.removeItem('inv_logs');
            localStorage.removeItem('inv_settings');
            // Don't remove theme and app version
            
            return true;
        } catch (e) {
            console.error('Error clearing data', e);
            return false;
        }
    }
}

/**
 * Dashboard UI Controller
 */
class DashboardUI {
    constructor(app) {
        this.app = app;
    }
    
    init() {
        // Quick action buttons
        document.getElementById('quick-add-item').addEventListener('click', () => {
            this.app.showView('items');
            setTimeout(() => {
                document.getElementById('add-item-btn').click();
            }, 300);
        });
        
        document.getElementById('quick-transfer').addEventListener('click', () => {
            this.app.showView('transfer');
        });
    }
    
    refresh() {
        this.updateSummaryCards();
        this.updateRecentActivity();
    }
    
    updateSummaryCards() {
        const items = this.app.itemsModel.getAll();
        
        // Total items
        document.getElementById('total-items').textContent = items.length;
        
        // Warehouse total
        const warehouseTotal = this.app.itemsModel.getWarehouseTotal();
        document.getElementById('total-warehouse').textContent = warehouseTotal;
        
        // Shop total
        const shopTotal = this.app.itemsModel.getShopTotal();
        document.getElementById('total-shop').textContent = shopTotal;
        
        // Warehouse value
        const warehouseValue = this.app.itemsModel.getWarehouseValue();
        document.getElementById('warehouse-value').textContent = this.app.formatCurrency(warehouseValue);
        
        // Shop value
        const shopValue = this.app.itemsModel.getShopValue();
        document.getElementById('shop-value').textContent = this.app.formatCurrency(shopValue);
        
        // Potential revenue
        const potentialRevenue = this.app.itemsModel.getPotentialRevenue();
        document.getElementById('potential-revenue').textContent = this.app.formatCurrency(potentialRevenue);
    }
    
    updateRecentActivity() {
        const recentActivity = document.getElementById('recent-activity');
        const logs = this.app.logsModel.getRecent(5);
        
        if (logs.length === 0) {
            recentActivity.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">මෑත ක්‍රියාකාරකම් නැත</p>';
            return;
        }
        
        recentActivity.innerHTML = logs.map(log => {
            let icon, title, details;
            
            switch (log.type) {
                case 'create':
                    icon = 'plus-circle';
                    title = 'නව භාණ්දයක් එක් කරන ලදී';
                    details = log.itemName;
                    break;
                case 'update':
                    icon = 'edit';
                    title = 'භාණ්දය යාවත්කිරීම';
                    details = log.itemName;
                    break;
                case 'delete':
                    icon = 'trash-2';
                    title = 'භාණ්දය මකා දැමීම';
                    details = log.itemName;
                    break;
                case 'transfer':
                    icon = 'truck';
                    title = 'මාරු කිරීම';
                    details = `${log.itemName}: ${log.qty} units`;
                    break;
                case 'import':
                    icon = 'upload';
                    title = 'CSV ආයාත කිරීම';
                    details = log.details;
                    break;
                default:
                    icon = 'activity';
                    title = 'අනෙකුත් ක්‍රියාකාරකම්';
                    details = log.details;
            }
            
            return `
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="mt-0.5">
                        <i data-lucide="${icon}" class="w-5 h-5 text-primary-600 dark:text-primary-400"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between">
                            <h4 class="font-medium">${title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${this.app.formatDate(log.timeISO)}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${details}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update icons
        lucide.createIcons();
    }
}

/**
 * Items UI Controller
 */
class ItemsUI {
    constructor(app) {
        this.app = app;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.categoryFilter = '';
    }
    
    init() {
        // Add item button
        document.getElementById('add-item-btn').addEventListener('click', () => {
            this.showItemModal();
        });
        
        // Item form submission
        document.getElementById('item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });
        
        // Cancel item button
        document.getElementById('cancel-item-btn').addEventListener('click', () => {
            this.hideItemModal();
        });
        
        // Close item modal
        document.getElementById('close-item-modal').addEventListener('click', () => {
            this.hideItemModal();
        });
        
        // Search input
        document.getElementById('items-search').addEventListener('input', (e) => {
            this.app.debounce(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.refreshItemsTable();
            }, 200, 'items-search');
        });
        
        // Category filter
        document.getElementById('items-category-filter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.currentPage = 1;
            this.refreshItemsTable();
        });
        
        // Sort button
        document.getElementById('items-sort-btn').addEventListener('click', () => {
            this.cycleSort();
            this.refreshItemsTable();
        });
        
        // Pagination buttons
        document.getElementById('items-pagination-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.refreshItemsTable();
            }
        });
        
        document.getElementById('items-pagination-next').addEventListener('click', () => {
            const filteredItems = this.getFilteredItems();
            const totalPages = Math.ceil(filteredItems.length / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.refreshItemsTable();
            }
        });
        
        // Items per page selector (if we add one later)
        // This would allow users to change how many items they see per page
    }
    
    refresh() {
        this.refreshCategoryFilter();
        this.refreshItemsTable();
    }
    
    refreshCategoryFilter() {
        const categoryFilter = document.getElementById('items-category-filter');
        const categories = this.app.itemsModel.getCategories();
        
        // Save current selection
        const currentValue = categoryFilter.value;
        
        // Clear options except "All Categories"
        categoryFilter.innerHTML = '<option value="">සියලුම කාණ්ඩ</option>';
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Restore selection
        categoryFilter.value = currentValue;
    }
    
    refreshItemsTable() {
        const tableBody = document.getElementById('items-table-body');
        const emptyState = document.getElementById('items-empty-state');
        const filteredItems = this.getFilteredItems();
        
        // Sort items
        const sortedItems = [...filteredItems].sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Calculate pagination
        const totalPages = Math.ceil(sortedItems.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, sortedItems.length);
        const paginatedItems = sortedItems.slice(startIndex, endIndex);
        
        // Update pagination UI
        document.getElementById('items-pagination-start').textContent = sortedItems.length > 0 ? startIndex + 1 : 0;
        document.getElementById('items-pagination-end').textContent = endIndex;
        document.getElementById('items-pagination-total').textContent = sortedItems.length;
        
        document.getElementById('items-pagination-prev').disabled = this.currentPage <= 1;
        document.getElementById('items-pagination-next').disabled = this.currentPage >= totalPages;
        
        // Show/hide empty state
        if (sortedItems.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Populate table
        tableBody.innerHTML = paginatedItems.map(item => `
            <tr class="table-row-hover">
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium">${this.escapeHtml(item.name)}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm">${this.escapeHtml(item.category || '-')}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm">${this.escapeHtml(item.unit)}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm">${this.app.formatCurrency(item.costPrice)}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm">${this.app.formatCurrency(item.sellPrice)}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm table-cell-ellipsis">${this.escapeHtml(item.notes || '-')}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3" onclick="app.itemsUI.editItem('${item.itemId}')">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onclick="app.itemsUI.deleteItem('${item.itemId}')">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update icons
        lucide.createIcons();
    }
    
    getFilteredItems() {
        let items = this.app.itemsModel.getAll();
        
        // Apply search filter
        if (this.searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm) ||
                (item.category && item.category.toLowerCase().includes(this.searchTerm)) ||
                (item.notes && item.notes.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply category filter
        if (this.categoryFilter) {
            items = items.filter(item => item.category === this.categoryFilter);
        }
        
        return items;
    }
    
    cycleSort() {
        const sortFields = ['name', 'category', 'costPrice', 'sellPrice'];
        const currentIndex = sortFields.indexOf(this.sortField);
        
        this.sortField = sortFields[(currentIndex + 1) % sortFields.length];
        
        if (this.sortDirection === 'asc') {
            this.sortDirection = 'desc';
        } else {
            this.sortDirection = 'asc';
        }
    }
    
    showItemModal(item = null) {
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const form = document.getElementById('item-form');
        
        // Reset form
        form.reset();
        
        if (item) {
            // Edit mode
            title.textContent = 'භාණ්දය සංස්කරණය කරන්න';
            
            // Populate form
            document.getElementById('item-id').value = item.itemId;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-unit').value = item.unit;
            document.getElementById('item-cost-price').value = item.costPrice;
            document.getElementById('item-sell-price').value = item.sellPrice;
            document.getElementById('item-notes').value = item.notes;
        } else {
            // Add mode
            title.textContent = 'නව භාණ්දයක් එක් කරන්න';
            document.getElementById('item-id').value = '';
        }
        
        // Show modal
        modal.classList.remove('hidden');
    }
    
    hideItemModal() {
        document.getElementById('item-modal').classList.add('hidden');
    }
    
    saveItem() {
        const itemId = document.getElementById('item-id').value;
        const itemData = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            unit: document.getElementById('item-unit').value,
            costPrice: document.getElementById('item-cost-price').value,
            sellPrice: document.getElementById('item-sell-price').value,
            notes: document.getElementById('item-notes').value
        };
        
        try {
            let savedItem;
            
            if (itemId) {
                // Update existing item
                savedItem = this.app.itemsModel.update(itemId, itemData);
                this.app.logsModel.add('update', savedItem.itemId, savedItem.name);
                this.app.showToast('භාණ්දය සාර්ථකව යාවත්කිරීම කරන ලදී');
            } else {
                // Add new item
                savedItem = this.app.itemsModel.add(itemData);
                this.app.logsModel.add('create', savedItem.itemId, savedItem.name);
                this.app.showToast('නව භාණ්දය සාර්ථකව එක් කරන ලදී');
            }
            
            this.hideItemModal();
            this.refresh();
            this.app.dashboardUI.refresh();
            this.app.warehouseUI.refresh();
            this.app.shopUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
        }
    }
    
    editItem(itemId) {
        const item = this.app.itemsModel.getById(itemId);
        
        if (item) {
            this.showItemModal(item);
        }
    }
    
    deleteItem(itemId) {
        const item = this.app.itemsModel.getById(itemId);
        
        if (item) {
            // Show confirmation modal
            const modal = document.getElementById('delete-modal');
            
            // Set up confirmation buttons
            document.getElementById('confirm-delete-btn').onclick = () => {
                try {
                    this.app.itemsModel.delete(itemId);
                    this.app.logsModel.add('delete', null, item.name);
                    this.app.showToast('භාණ්දය සාර්ථකව මකා දමන ලදී');
                    
                    this.refresh();
                    this.app.dashboardUI.refresh();
                    this.app.warehouseUI.refresh();
                    this.app.shopUI.refresh();
                    
                    // Hide modal
                    modal.classList.add('hidden');
                } catch (e) {
                    this.app.showToast(e.message, 'error');
                }
            };
            
            // Cancel button
            document.getElementById('cancel-delete-btn').onclick = () => {
                modal.classList.add('hidden');
            };
            
            // Close button
            document.getElementById('close-delete-modal').onclick = () => {
                modal.classList.add('hidden');
            };
            
            // Show modal
            modal.classList.remove('hidden');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Warehouse UI Controller
 */
class WarehouseUI {
    constructor(app) {
        this.app = app;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.categoryFilter = '';
        this.stockFilter = '';
    }
    
    init() {
        // Bulk update button
        document.getElementById('warehouse-bulk-update-btn').addEventListener('click', () => {
            this.showBulkUpdateModal();
        });
        
        // Search input
        document.getElementById('warehouse-search').addEventListener('input', (e) => {
            this.app.debounce(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.refreshWarehouseTable();
            }, 200, 'warehouse-search');
        });
        
        // Category filter
        document.getElementById('warehouse-category-filter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.currentPage = 1;
            this.refreshWarehouseTable();
        });
        
        // Stock filter
        document.getElementById('warehouse-stock-filter').addEventListener('change', (e) => {
            this.stockFilter = e.target.value;
            this.currentPage = 1;
            this.refreshWarehouseTable();
        });
        
        // Sort button
        document.getElementById('warehouse-sort-btn').addEventListener('click', () => {
            this.cycleSort();
            this.refreshWarehouseTable();
        });
        
        // Pagination buttons
        document.getElementById('warehouse-pagination-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.refreshWarehouseTable();
            }
        });
        
        document.getElementById('warehouse-pagination-next').addEventListener('click', () => {
            const filteredItems = this.getFilteredItems();
            const totalPages = Math.ceil(filteredItems.length / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.refreshWarehouseTable();
            }
        });
        
        // Bulk update form
        document.getElementById('bulk-update-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBulkUpdate();
        });
        
        // Cancel bulk update button
        document.getElementById('cancel-bulk-update-btn').addEventListener('click', () => {
            this.hideBulkUpdateModal();
        });
        
        // Close bulk update modal
        document.getElementById('close-bulk-update-modal').addEventListener('click', () => {
            this.hideBulkUpdateModal();
        });
    }
    
    refresh() {
        this.refreshCategoryFilter();
        this.refreshWarehouseTable();
    }
    
    refreshCategoryFilter() {
        const categoryFilter = document.getElementById('warehouse-category-filter');
        const categories = this.app.itemsModel.getCategories();
        
        // Save current selection
        const currentValue = categoryFilter.value;
        
        // Clear options except "All Categories"
        categoryFilter.innerHTML = '<option value="">සියලුම කාණ්ඩ</option>';
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Restore selection
        categoryFilter.value = currentValue;
    }
    
    refreshWarehouseTable() {
        const tableBody = document.getElementById('warehouse-table-body');
        const emptyState = document.getElementById('warehouse-empty-state');
        const filteredItems = this.getFilteredItems();
        const lowStockThreshold = this.app.settingsModel.getSetting('lowStockThreshold');
        
        // Sort items
        const sortedItems = [...filteredItems].sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Calculate pagination
        const totalPages = Math.ceil(sortedItems.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, sortedItems.length);
        const paginatedItems = sortedItems.slice(startIndex, endIndex);
        
        // Update pagination UI
        document.getElementById('warehouse-pagination-start').textContent = sortedItems.length > 0 ? startIndex + 1 : 0;
        document.getElementById('warehouse-pagination-end').textContent = endIndex;
        document.getElementById('warehouse-pagination-total').textContent = sortedItems.length;
        
        document.getElementById('warehouse-pagination-prev').disabled = this.currentPage <= 1;
        document.getElementById('warehouse-pagination-next').disabled = this.currentPage >= totalPages;
        
        // Show/hide empty state
        if (sortedItems.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Populate table
        tableBody.innerHTML = paginatedItems.map(item => {
            const isLowStock = item.warehouseQty > 0 && item.warehouseQty <= lowStockThreshold;
            const lowStockClass = isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/20' : '';
            const lowStockBadge = isLowStock ? '<span class="inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">LOW</span>' : '';
            
            return `
                <tr class="table-row-hover ${lowStockClass}">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm font-medium">${this.escapeHtml(item.name)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.escapeHtml(item.category || '-')}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.escapeHtml(item.unit)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.app.formatCurrency(item.costPrice)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                            <input type="number" min="0" value="${item.warehouseQty}" 
                                class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                onchange="app.warehouseUI.updateWarehouseQty('${item.itemId}', this.value)">
                            ${lowStockBadge}
                        </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" onclick="app.warehouseUI.transferItem('${item.itemId}')">
                            <i data-lucide="truck" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update icons
        lucide.createIcons();
    }
    
    getFilteredItems() {
        let items = this.app.itemsModel.getAll();
        const lowStockThreshold = this.app.settingsModel.getSetting('lowStockThreshold');
        
        // Apply search filter
        if (this.searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm) ||
                (item.category && item.category.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply category filter
        if (this.categoryFilter) {
            items = items.filter(item => item.category === this.categoryFilter);
        }
        
        // Apply stock filter
        if (this.stockFilter === 'low') {
            items = items.filter(item => item.warehouseQty > 0 && item.warehouseQty <= lowStockThreshold);
        } else if (this.stockFilter === 'normal') {
            items = items.filter(item => item.warehouseQty > lowStockThreshold);
        } else if (this.stockFilter === 'zero') {
            items = items.filter(item => item.warehouseQty === 0);
        }
        
        return items;
    }
    
    cycleSort() {
        const sortFields = ['name', 'category', 'warehouseQty', 'costPrice'];
        const currentIndex = sortFields.indexOf(this.sortField);
        
        this.sortField = sortFields[(currentIndex + 1) % sortFields.length];
        
        if (this.sortDirection === 'asc') {
            this.sortDirection = 'desc';
        } else {
            this.sortDirection = 'asc';
        }
    }
    
    updateWarehouseQty(itemId, newQty) {
        try {
            const qty = parseInt(newQty);
            
            if (isNaN(qty) || qty < 0) {
                throw new Error('Invalid quantity');
            }
            
            const item = this.app.itemsModel.update(itemId, { warehouseQty: qty });
            this.app.logsModel.add('update', item.itemId, item.name, null, `Warehouse quantity updated to ${qty}`);
            
            this.refresh();
            this.app.dashboardUI.refresh();
            this.app.shopUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
            this.refresh();
        }
    }
    
    transferItem(itemId) {
        const item = this.app.itemsModel.getById(itemId);
        
        if (item) {
            this.app.showView('transfer');
            
            // Wait for the transfer view to be visible
            setTimeout(() => {
                // Set the item in the transfer form
                document.getElementById('transfer-item').value = itemId;
                
                // Trigger change event to show item details
                const event = new Event('change');
                document.getElementById('transfer-item').dispatchEvent(event);
            }, 300);
        }
    }
    
    showBulkUpdateModal() {
        const modal = document.getElementById('bulk-update-modal');
        const tableBody = document.getElementById('bulk-update-table-body');
        const locationSelect = document.getElementById('bulk-update-location');
        
        // Get all items
        const items = this.app.itemsModel.getAll();
        
        // Populate table
        tableBody.innerHTML = items.map(item => `
            <tr>
                <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm font-medium">${this.escapeHtml(item.name)}</div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm">${locationSelect.value === 'warehouse' ? item.warehouseQty : item.shopQty}</div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                    <input type="number" min="0" name="qty-${item.itemId}" 
                        value="${locationSelect.value === 'warehouse' ? item.warehouseQty : item.shopQty}"
                        class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm">
                    <input type="hidden" name="itemId" value="${item.itemId}">
                </td>
            </tr>
        `).join('');
        
        // Show modal
        modal.classList.remove('hidden');
    }
    
    hideBulkUpdateModal() {
        document.getElementById('bulk-update-modal').classList.add('hidden');
    }
    
    saveBulkUpdate() {
        const location = document.getElementById('bulk-update-location').value;
        const updates = [];
        
        // Collect updates from the form
        document.querySelectorAll('#bulk-update-table-body tr').forEach(row => {
            const itemId = row.querySelector('input[name="itemId"]').value;
            const quantity = row.querySelector(`input[name="qty-${itemId}"]`).value;
            
            updates.push({
                itemId,
                quantity: parseInt(quantity) || 0
            });
        });
        
        // Apply updates
        try {
            this.app.itemsModel.bulkUpdate(location, updates);
            
            // Log the bulk update
            this.app.logsModel.add('update', null, null, null, `Bulk update of ${location} quantities for ${updates.length} items`);
            
            this.app.showToast('Bulk update successful');
            this.hideBulkUpdateModal();
            this.refresh();
            this.app.dashboardUI.refresh();
            
            if (location === 'warehouse') {
                this.app.shopUI.refresh();
            } else {
                this.app.warehouseUI.refresh();
            }
        } catch (e) {
            this.app.showToast(e.message, 'error');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Shop UI Controller
 */
class ShopUI {
    constructor(app) {
        this.app = app;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.categoryFilter = '';
        this.stockFilter = '';
    }
    
    init() {
        // Bulk update button
        document.getElementById('shop-bulk-update-btn').addEventListener('click', () => {
            this.showBulkUpdateModal();
        });
        
        // Search input
        document.getElementById('shop-search').addEventListener('input', (e) => {
            this.app.debounce(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.refreshShopTable();
            }, 200, 'shop-search');
        });
        
        // Category filter
        document.getElementById('shop-category-filter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.currentPage = 1;
            this.refreshShopTable();
        });
        
        // Stock filter
        document.getElementById('shop-stock-filter').addEventListener('change', (e) => {
            this.stockFilter = e.target.value;
            this.currentPage = 1;
            this.refreshShopTable();
        });
        
        // Sort button
        document.getElementById('shop-sort-btn').addEventListener('click', () => {
            this.cycleSort();
            this.refreshShopTable();
        });
        
        // Pagination buttons
        document.getElementById('shop-pagination-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.refreshShopTable();
            }
        });
        
        document.getElementById('shop-pagination-next').addEventListener('click', () => {
            const filteredItems = this.getFilteredItems();
            const totalPages = Math.ceil(filteredItems.length / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.refreshShopTable();
            }
        });
        
        // Bulk update form is shared with Warehouse UI
    }
    
    refresh() {
        this.refreshCategoryFilter();
        this.refreshShopTable();
    }
    
    refreshCategoryFilter() {
        const categoryFilter = document.getElementById('shop-category-filter');
        const categories = this.app.itemsModel.getCategories();
        
        // Save current selection
        const currentValue = categoryFilter.value;
        
        // Clear options except "All Categories"
        categoryFilter.innerHTML = '<option value="">සියලුම කාණ්ඩ</option>';
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Restore selection
        categoryFilter.value = currentValue;
    }
    
    refreshShopTable() {
        const tableBody = document.getElementById('shop-table-body');
        const emptyState = document.getElementById('shop-empty-state');
        const filteredItems = this.getFilteredItems();
        const lowStockThreshold = this.app.settingsModel.getSetting('lowStockThreshold');
        
        // Sort items
        const sortedItems = [...filteredItems].sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Calculate pagination
        const totalPages = Math.ceil(sortedItems.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, sortedItems.length);
        const paginatedItems = sortedItems.slice(startIndex, endIndex);
        
        // Update pagination UI
        document.getElementById('shop-pagination-start').textContent = sortedItems.length > 0 ? startIndex + 1 : 0;
        document.getElementById('shop-pagination-end').textContent = endIndex;
        document.getElementById('shop-pagination-total').textContent = sortedItems.length;
        
        document.getElementById('shop-pagination-prev').disabled = this.currentPage <= 1;
        document.getElementById('shop-pagination-next').disabled = this.currentPage >= totalPages;
        
        // Show/hide empty state
        if (sortedItems.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Populate table
        tableBody.innerHTML = paginatedItems.map(item => {
            const isLowStock = item.shopQty > 0 && item.shopQty <= lowStockThreshold;
            const lowStockClass = isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/20' : '';
            const lowStockBadge = isLowStock ? '<span class="inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">LOW</span>' : '';
            
            return `
                <tr class="table-row-hover ${lowStockClass}">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm font-medium">${this.escapeHtml(item.name)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.escapeHtml(item.category || '-')}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.escapeHtml(item.unit)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.app.formatCurrency(item.sellPrice)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                            <input type="number" min="0" value="${item.shopQty}" 
                                class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                onchange="app.shopUI.updateShopQty('${item.itemId}', this.value)">
                            ${lowStockBadge}
                        </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onclick="app.shopUI.removeItemFromShop('${item.itemId}')">
                            <i data-lucide="minus-circle" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update icons
        lucide.createIcons();
    }
    
    getFilteredItems() {
        let items = this.app.itemsModel.getAll();
        const lowStockThreshold = this.app.settingsModel.getSetting('lowStockThreshold');
        
        // Apply search filter
        if (this.searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm) ||
                (item.category && item.category.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply category filter
        if (this.categoryFilter) {
            items = items.filter(item => item.category === this.categoryFilter);
        }
        
        // Apply stock filter
        if (this.stockFilter === 'low') {
            items = items.filter(item => item.shopQty > 0 && item.shopQty <= lowStockThreshold);
        } else if (this.stockFilter === 'normal') {
            items = items.filter(item => item.shopQty > lowStockThreshold);
        } else if (this.stockFilter === 'zero') {
            items = items.filter(item => item.shopQty === 0);
        }
        
        return items;
    }
    
    cycleSort() {
        const sortFields = ['name', 'category', 'shopQty', 'sellPrice'];
        const currentIndex = sortFields.indexOf(this.sortField);
        
        this.sortField = sortFields[(currentIndex + 1) % sortFields.length];
        
        if (this.sortDirection === 'asc') {
            this.sortDirection = 'desc';
        } else {
            this.sortDirection = 'asc';
        }
    }
    
    updateShopQty(itemId, newQty) {
        try {
            const qty = parseInt(newQty);
            
            if (isNaN(qty) || qty < 0) {
                throw new Error('Invalid quantity');
            }
            
            const item = this.app.itemsModel.update(itemId, { shopQty: qty });
            this.app.logsModel.add('update', item.itemId, item.name, null, `Shop quantity updated to ${qty}`);
            
            this.refresh();
            this.app.dashboardUI.refresh();
            this.app.warehouseUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
            this.refresh();
        }
    }
    
    removeItemFromShop(itemId) {
        try {
            const item = this.app.itemsModel.update(itemId, { shopQty: 0 });
            this.app.logsModel.add('update', item.itemId, item.name, null, 'Item removed from shop');
            
            this.app.showToast('Item removed from shop');
            this.refresh();
            this.app.dashboardUI.refresh();
            this.app.warehouseUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
        }
    }
    
    showBulkUpdateModal() {
        const modal = document.getElementById('bulk-update-modal');
        const tableBody = document.getElementById('bulk-update-table-body');
        const locationSelect = document.getElementById('bulk-update-location');
        
        // Set location to shop
        locationSelect.value = 'shop';
        
        // Get all items
        const items = this.app.itemsModel.getAll();
        
        // Populate table
        tableBody.innerHTML = items.map(item => `
            <tr>
                <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm font-medium">${this.escapeHtml(item.name)}</div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm">${item.shopQty}</div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                    <input type="number" min="0" name="qty-${item.itemId}" 
                        value="${item.shopQty}"
                        class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm">
                    <input type="hidden" name="itemId" value="${item.itemId}">
                </td>
            </tr>
        `).join('');
        
        // Show modal
        modal.classList.remove('hidden');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Transfer UI Controller
 */
class TransferUI {
    constructor(app) {
        this.app = app;
    }
    
    init() {
        // Transfer form submission
        document.getElementById('transfer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processTransfer();
        });
        
        // Reset button
        document.getElementById('transfer-reset-btn').addEventListener('click', () => {
            this.resetForm();
        });
        
        // Item selection change
        document.getElementById('transfer-item').addEventListener('change', (e) => {
            this.updateItemDetails(e.target.value);
        });
    }
    
    refresh() {
        this.populateItemSelect();
        this.updateRecentTransfers();
    }
    
    populateItemSelect() {
        const select = document.getElementById('transfer-item');
        const items = this.app.itemsModel.getAll();
        
        // Save current selection
        const currentValue = select.value;
        
        // Clear options except placeholder
        select.innerHTML = '<option value="">භාණ්දය තෝරන්න</option>';
        
        // Add items with warehouse stock
        items.forEach(item => {
            if (item.warehouseQty > 0) {
                const option = document.createElement('option');
                option.value = item.itemId;
                option.textContent = `${item.name} (${item.warehouseQty} ${item.unit})`;
                select.appendChild(option);
            }
        });
        
        // Restore selection if it still exists
        if (currentValue && items.some(item => item.itemId === currentValue && item.warehouseQty > 0)) {
            select.value = currentValue;
            this.updateItemDetails(currentValue);
        } else {
            // Hide item details
            document.getElementById('transfer-item-details').classList.add('hidden');
        }
    }
    
    updateItemDetails(itemId) {
        const detailsContainer = document.getElementById('transfer-item-details');
        
        if (!itemId) {
            detailsContainer.classList.add('hidden');
            return;
        }
        
        const item = this.app.itemsModel.getById(itemId);
        
        if (item) {
            document.getElementById('transfer-item-warehouse-qty').textContent = `${item.warehouseQty} ${item.unit}`;
            document.getElementById('transfer-item-shop-qty').textContent = `${item.shopQty} ${item.unit}`;
            
            detailsContainer.classList.remove('hidden');
        } else {
            detailsContainer.classList.add('hidden');
        }
    }
    
    processTransfer() {
        const itemId = document.getElementById('transfer-item').value;
        const quantity = parseInt(document.getElementById('transfer-quantity').value);
        const note = document.getElementById('transfer-note').value.trim();
        
        if (!itemId) {
            this.app.showToast('Please select an item', 'error');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            this.app.showToast('Please enter a valid quantity', 'error');
            return;
        }
        
        try {
            const item = this.app.itemsModel.transferItem(itemId, quantity);
            
            // Log the transfer
            this.app.logsModel.add(
                'transfer', 
                item.itemId, 
                item.name, 
                quantity, 
                note || `Transferred ${quantity} ${item.unit} from warehouse to shop`
            );
            
            this.app.showToast(`Successfully transferred ${quantity} ${item.unit} of ${item.name}`);
            
            // Reset form
            this.resetForm();
            
            // Refresh UI
            this.refresh();
            this.app.dashboardUI.refresh();
            this.app.warehouseUI.refresh();
            this.app.shopUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
        }
    }
    
    resetForm() {
        document.getElementById('transfer-form').reset();
        document.getElementById('transfer-item-details').classList.add('hidden');
    }
    
    updateRecentTransfers() {
        const container = document.getElementById('recent-transfers');
        const transfers = this.app.logsModel.getRecentTransfers(5);
        
        if (transfers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">මෑත මාරු කිරීම් නැත</p>';
            return;
        }
        
        container.innerHTML = transfers.map(transfer => `
            <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="mt-0.5">
                    <i data-lucide="truck" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between">
                        <h4 class="font-medium">Transfer: ${transfer.itemName}</h4>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${this.app.formatDate(transfer.timeISO)}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        ${transfer.qty} units moved from warehouse to shop
                        ${transfer.details ? `<br><span class="text-xs">${transfer.details}</span>` : ''}
                    </p>
                </div>
            </div>
        `).join('');
        
        // Update icons
        lucide.createIcons();
    }
}

/**
 * Logs UI Controller
 */
class LogsUI {
    constructor(app) {
        this.app = app;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'timeISO';
        this.sortDirection = 'desc';
        this.searchTerm = '';
        this.typeFilter = '';
    }
    
    init() {
        // Export logs button
        document.getElementById('export-logs-btn').addEventListener('click', () => {
            this.exportLogsToCsv();
        });
        
        // Search input
        document.getElementById('logs-search').addEventListener('input', (e) => {
            this.app.debounce(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.refreshLogsTable();
            }, 200, 'logs-search');
        });
        
        // Type filter
        document.getElementById('logs-type-filter').addEventListener('change', (e) => {
            this.typeFilter = e.target.value;
            this.currentPage = 1;
            this.refreshLogsTable();
        });
        
        // Sort button
        document.getElementById('logs-sort-btn').addEventListener('click', () => {
            this.cycleSort();
            this.refreshLogsTable();
        });
        
        // Pagination buttons
        document.getElementById('logs-pagination-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.refreshLogsTable();
            }
        });
        
        document.getElementById('logs-pagination-next').addEventListener('click', () => {
            const filteredLogs = this.getFilteredLogs();
            const totalPages = Math.ceil(filteredLogs.length / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.refreshLogsTable();
            }
        });
    }
    
    refresh() {
        this.refreshLogsTable();
    }
    
    refreshLogsTable() {
        const tableBody = document.getElementById('logs-table-body');
        const emptyState = document.getElementById('logs-empty-state');
        const filteredLogs = this.getFilteredLogs();
        
        // Sort logs
        const sortedLogs = [...filteredLogs].sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Calculate pagination
        const totalPages = Math.ceil(sortedLogs.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, sortedLogs.length);
        const paginatedLogs = sortedLogs.slice(startIndex, endIndex);
        
        // Update pagination UI
        document.getElementById('logs-pagination-start').textContent = sortedLogs.length > 0 ? startIndex + 1 : 0;
        document.getElementById('logs-pagination-end').textContent = endIndex;
        document.getElementById('logs-pagination-total').textContent = sortedLogs.length;
        
        document.getElementById('logs-pagination-prev').disabled = this.currentPage <= 1;
        document.getElementById('logs-pagination-next').disabled = this.currentPage >= totalPages;
        
        // Show/hide empty state
        if (sortedLogs.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Populate table
        tableBody.innerHTML = paginatedLogs.map(log => {
            let typeIcon, typeClass, typeText;
            
            switch (log.type) {
                case 'create':
                    typeIcon = 'plus-circle';
                    typeClass = 'text-green-600 dark:text-green-400';
                    typeText = 'නිර්මාණය';
                    break;
                case 'update':
                    typeIcon = 'edit';
                    typeClass = 'text-blue-600 dark:text-blue-400';
                    typeText = 'යාවත්කිරීම';
                    break;
                case 'delete':
                    typeIcon = 'trash-2';
                    typeClass = 'text-red-600 dark:text-red-400';
                    typeText = 'මකා දැමීම';
                    break;
                case 'transfer':
                    typeIcon = 'truck';
                    typeClass = 'text-purple-600 dark:text-purple-400';
                    typeText = 'මාරු කිරීම';
                    break;
                case 'import':
                    typeIcon = 'upload';
                    typeClass = 'text-amber-600 dark:text-amber-400';
                    typeText = 'ආයාත කිරීම';
                    break;
                default:
                    typeIcon = 'activity';
                    typeClass = 'text-gray-600 dark:text-gray-400';
                    typeText = 'වෙනත්';
            }
            
            return `
                <tr class="table-row-hover">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.app.formatDate(log.timeISO)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                            <i data-lucide="${typeIcon}" class="w-4 h-4 mr-2 ${typeClass}"></i>
                            <span class="text-sm">${typeText}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm">${this.escapeHtml(log.itemName || '-')}</div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm">
                            ${log.qty ? `Quantity: ${log.qty}<br>` : ''}
                            ${this.escapeHtml(log.details || '-')}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update icons
        lucide.createIcons();
    }
    
    getFilteredLogs() {
        let logs = this.app.logsModel.getAll();
        
        // Apply search filter
        if (this.searchTerm) {
            logs = logs.filter(log => 
                (log.itemName && log.itemName.toLowerCase().includes(this.searchTerm)) ||
                (log.details && log.details.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply type filter
        if (this.typeFilter) {
            logs = logs.filter(log => log.type === this.typeFilter);
        }
        
        return logs;
    }
    
    cycleSort() {
        const sortFields = ['timeISO', 'type', 'itemName'];
        const currentIndex = sortFields.indexOf(this.sortField);
        
        this.sortField = sortFields[(currentIndex + 1) % sortFields.length];
        
        if (this.sortDirection === 'asc') {
            this.sortDirection = 'desc';
        } else {
            this.sortDirection = 'asc';
        }
    }
    
    exportLogsToCsv() {
        const csvData = this.app.logsModel.exportToCsv();
        const csv = this.convertToCsv(csvData.headers, csvData.rows);
        this.downloadCsv(csv, 'logs.csv');
        
        this.app.showToast('Logs exported successfully');
    }
    
    convertToCsv(headers, rows) {
        const csvHeaders = headers.join(',');
        const csvRows = rows.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma or quote
                if (cell === null || cell === undefined) {
                    return '';
                }
                
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',')
        );
        
        return csvHeaders + '\n' + csvRows.join('\n');
    }
    
    downloadCsv(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Settings UI Controller
 */
class SettingsUI {
    constructor(app) {
        this.app = app;
    }
    
    init() {
        // Save settings button
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Backup data button
        document.getElementById('backup-data-btn').addEventListener('click', () => {
            this.backupData();
        });
        
        // Restore data button
        document.getElementById('restore-data-btn').addEventListener('click', () => {
            document.getElementById('restore-data-input').click();
        });
        
        // Restore data input change
        document.getElementById('restore-data-input').addEventListener('change', (e) => {
            this.restoreData(e.target.files[0]);
        });
        
        // Clear data button
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.clearData();
        });
    }
    
    refresh() {
        this.loadSettings();
        this.updateAppInfo();
    }
    
    loadSettings() {
        const settings = this.app.settingsModel;
        
        document.getElementById('currency-symbol').value = settings.getSetting('currencySymbol');
        document.getElementById('low-stock-threshold').value = settings.getSetting('lowStockThreshold');
        document.getElementById('language').value = settings.getSetting('language');
    }
    
    saveSettings() {
        try {
            const settings = {
                currencySymbol: document.getElementById('currency-symbol').value,
                lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value) || 5,
                language: document.getElementById('language').value
            };
            
            this.app.settingsModel.updateAll(settings);
            this.app.showToast('Settings saved successfully');
            
            // Refresh UI to apply new settings
            this.app.dashboardUI.refresh();
            this.app.warehouseUI.refresh();
            this.app.shopUI.refresh();
        } catch (e) {
            this.app.showToast(e.message, 'error');
        }
    }
    
    backupData() {
        const data = this.app.settingsModel.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory-backup-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.app.showToast('Data backup created successfully');
    }
    
    restoreData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (this.app.settingsModel.importData(data)) {
                    this.app.showToast('Data restored successfully');
                    
                    // Reinitialize models with new data
                    this.app.itemsModel.init();
                    this.app.logsModel.init();
                    this.app.settingsModel.init();
                    
                    // Refresh all UI
                    this.app.dashboardUI.refresh();
                    this.app.itemsUI.refresh();
                    this.app.warehouseUI.refresh();
                    this.app.shopUI.refresh();
                    this.app.transferUI.refresh();
                    this.app.logsUI.refresh();
                } else {
                    this.app.showToast('Failed to restore data', 'error');
                }
            } catch (error) {
                this.app.showToast('Invalid backup file', 'error');
                console.error('Error parsing backup file:', error);
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        document.getElementById('restore-data-input').value = '';
    }
    
    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (this.app.settingsModel.clearAllData()) {
                this.app.showToast('All data cleared successfully');
                
                // Reinitialize models with empty data
                this.app.itemsModel.init();
                this.app.logsModel.init();
                this.app.settingsModel.init();
                
                // Refresh all UI
                this.app.dashboardUI.refresh();
                this.app.itemsUI.refresh();
                this.app.warehouseUI.refresh();
                this.app.shopUI.refresh();
                this.app.transferUI.refresh();
                this.app.logsUI.refresh();
            } else {
                this.app.showToast('Failed to clear data', 'error');
            }
        }
    }
    
    updateAppInfo() {
        document.getElementById('app-version').textContent = APP_VERSION;
        document.getElementById('data-version').textContent = localStorage.getItem('inv_app_version') || 'N/A';
    }
}

/**
 * Navigation UI Controller
 */
class NavUI {
    constructor(app) {
        this.app = app;
    }
    
    init() {
        // Mobile navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.app.showView(view);
            });
        });
        
        // Set up export CSV modal buttons
        document.getElementById('export-items-csv-btn').addEventListener('click', () => {
            this.exportItemsCsv();
            document.getElementById('export-csv-modal').classList.add('hidden');
        });
        
        document.getElementById('export-logs-csv-btn').addEventListener('click', () => {
            this.exportLogsCsv();
            document.getElementById('export-csv-modal').classList.add('hidden');
        });
        
        document.getElementById('cancel-export-csv-btn').addEventListener('click', () => {
            document.getElementById('export-csv-modal').classList.add('hidden');
        });
        
        document.getElementById('close-export-csv-modal').addEventListener('click', () => {
            document.getElementById('export-csv-modal').classList.add('hidden');
        });
        
        // Set up import CSV modal
        document.getElementById('csv-file').addEventListener('change', (e) => {
            this.previewCsv(e.target.files[0]);
        });
        
        document.getElementById('confirm-import-csv-btn').addEventListener('click', () => {
            this.importCsv();
        });
        
        document.getElementById('cancel-import-csv-btn').addEventListener('click', () => {
            document.getElementById('import-csv-modal').classList.add('hidden');
            this.resetImportModal();
        });
        
        document.getElementById('close-import-csv-modal').addEventListener('click', () => {
            document.getElementById('import-csv-modal').classList.add('hidden');
            this.resetImportModal();
        });
    }
    
    setActiveView(viewName) {
        // Update mobile navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.getAttribute('data-view') === viewName) {
                btn.classList.add('text-primary-600', 'dark:text-primary-400');
                btn.classList.remove('text-gray-500', 'dark:text-gray-400');
                
                // Add active background for desktop nav
                if (btn.parentElement.tagName === 'LI') {
                    btn.classList.add('text-primary-600', 'dark:text-primary-400', 'bg-primary-50', 'dark:bg-primary-900/20');
                    btn.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                }
            } else {
                btn.classList.remove('text-primary-600', 'dark:text-primary-400');
                btn.classList.add('text-gray-500', 'dark:text-gray-400');
                
                // Remove active background for desktop nav
                if (btn.parentElement.tagName === 'LI') {
                    btn.classList.remove('text-primary-600', 'dark:text-primary-400', 'bg-primary-50', 'dark:bg-primary-900/20');
                    btn.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                }
            }
        });
    }
    
    exportItemsCsv() {
        const csvData = this.app.itemsModel.exportToCsv();
        const csv = this.convertToCsv(csvData.headers, csvData.rows);
        this.downloadCsv(csv, 'items.csv');
        
        this.app.showToast('Items exported successfully');
    }
    
    exportLogsCsv() {
        const csvData = this.app.logsModel.exportToCsv();
        const csv = this.convertToCsv(csvData.headers, csvData.rows);
        this.downloadCsv(csv, 'logs.csv');
        
        this.app.showToast('Logs exported successfully');
    }
    
    convertToCsv(headers, rows) {
        const csvHeaders = headers.join(',');
        const csvRows = rows.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma or quote
                if (cell === null || cell === undefined) {
                    return '';
                }
                
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',')
        );
        
        return csvHeaders + '\n' + csvRows.join('\n');
    }
    
    downloadCsv(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    previewCsv(file) {
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const data = this.parseCsv(csv);
                
                // Validate required columns
                const requiredColumns = ['name', 'costPrice', 'sellPrice'];
                const missingColumns = requiredColumns.filter(col => !data.headers.includes(col));
                
                if (missingColumns.length > 0) {
                    this.showCsvValidation(false, `Missing required columns: ${missingColumns.join(', ')}`);
                    return;
                }
                
                // Show preview
                this.showCsvPreview(data);
                this.showCsvValidation(true, `CSV is valid. Found ${data.rows.length} rows.`);
                
                // Enable import button
                document.getElementById('confirm-import-csv-btn').disabled = false;
            } catch (error) {
                this.showCsvValidation(false, 'Invalid CSV format');
                console.error('Error parsing CSV:', error);
            }
        };
        
        reader.readAsText(file);
    }
    
    parseCsv(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 1) {
            throw new Error('Empty CSV');
        }
        
        // Parse headers
        const headers = this.parseCsvLine(lines[0]);
        
        // Parse rows
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                rows.push(row);
            }
        }
        
        return { headers, rows };
    }
    
    parseCsvLine(line) {
        const result = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    currentValue += '"';
                    i++;
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of value
                result.push(currentValue);
                currentValue = '';
            } else {
                // Regular character
                currentValue += char;
            }
        }
        
        // Add the last value
        result.push(currentValue);
        
        return result;
    }
    
    showCsvPreview(data) {
        const container = document.getElementById('csv-preview-container');
        const headerRow = document.getElementById('csv-preview-header');
        const body = document.getElementById('csv-preview-body');
        
        // Show container
        container.classList.remove('hidden');
        
        // Clear existing content
        headerRow.innerHTML = '';
        body.innerHTML = '';
        
        // Add headers
        data.headers.forEach(header => {
            const th = document.createElement('th');
            th.className = 'px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider';
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        // Add rows (limit to 50 for preview)
        const previewRows = data.rows.slice(0, 50);
        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            
            data.headers.forEach(header => {
                const td = document.createElement('td');
                td.className = 'px-4 py-2 text-sm';
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            
            body.appendChild(tr);
        });
    }
    
    showCsvValidation(isValid, message) {
        const container = document.getElementById('csv-validation-message');
        
        container.classList.remove('hidden');
        
        if (isValid) {
            container.className = 'mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg';
        } else {
            container.className = 'mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg';
        }
        
        container.textContent = message;
    }
    
    importCsv() {
        const fileInput = document.getElementById('csv-file');
        const method = document.querySelector('input[name="import-method"]:checked').value;
        
        if (!fileInput.files.length) {
            this.app.showToast('Please select a CSV file', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const data = this.parseCsv(csv);
                
                // Import data
                const importedItems = this.app.itemsModel.importFromCsv(data.rows, method);
                
                // Log the import
                this.app.logsModel.add('import', null, null, null, `Imported ${importedItems.length} items using ${method} method`);
                
                this.app.showToast(`Successfully imported ${importedItems.length} items`);
                
                // Close modal and reset
                document.getElementById('import-csv-modal').classList.add('hidden');
                this.resetImportModal();
                
                // Refresh UI
                this.app.dashboardUI.refresh();
                this.app.itemsUI.refresh();
                this.app.warehouseUI.refresh();
                this.app.shopUI.refresh();
            } catch (error) {
                this.app.showToast(`Import failed: ${error.message}`, 'error');
                console.error('Error importing CSV:', error);
            }
        };
        
        reader.readAsText(file);
    }
    
    resetImportModal() {
        document.getElementById('csv-file').value = '';
        document.getElementById('csv-preview-container').classList.add('hidden');
        document.getElementById('csv-validation-message').classList.add('hidden');
        document.getElementById('confirm-import-csv-btn').disabled = true;
        document.querySelector('input[name="import-method"][value="merge"]').checked = true;
    }
}
