const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MENU_FILE = path.join(__dirname, 'menu-data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper functions
async function readMenuData() {
  try {
    const data = await fs.readFile(MENU_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Create initial menu data if file doesn't exist
    const initialData = {
      categories: [
        { id: 1, name: 'South Indian Starters', description: 'Traditional South Indian appetizers' },
        { id: 2, name: 'Dosas & Uttapams', description: 'Crispy dosas and savory pancakes' },
        { id: 3, name: 'Curries & Gravies', description: 'Authentic South Indian curries' },
        { id: 4, name: 'Rice & Biryani', description: 'Flavorful rice dishes' },
        { id: 5, name: 'South Indian Sweets', description: 'Delicious traditional desserts' },
        { id: 6, name: 'Beverages & Filters Coffee', description: 'South Indian specialty drinks' }
      ],
      items: [
        { id: 1, name: 'Masala Vada', price: 80, description: 'Crispy lentil fritters with onions and spices', category_id: 1 },
        { id: 2, name: 'Medu Vada', price: 70, description: 'Savory lentil donuts, crispy outside and soft inside', category_id: 1 },
        { id: 3, name: 'Onion Pakoda', price: 60, description: 'Deep-fried onion fritters with gram flour', category_id: 1 },
        { id: 4, name: 'Ghee Roast Dosa', price: 150, description: 'Crispy paper dosa roasted in ghee', category_id: 2 },
        { id: 5, name: 'Masala Dosa', price: 140, description: 'Crispy dosa filled with spiced potato mixture', category_id: 2 },
        { id: 6, name: 'Onion Uttapam', price: 160, description: 'Thick pancake with toppings of onion and tomatoes', category_id: 2 },
        { id: 7, name: 'Plain Dosa', price: 120, description: 'Classic crispy South Indian crepe', category_id: 2 },
        { id: 8, name: 'Sambar', price: 90, description: 'Tangy lentil stew with vegetables and tamarind', category_id: 3 },
        { id: 9, name: 'Rasam', price: 80, description: 'Spicy tamarind soup with tomatoes and herbs', category_id: 3 },
        { id: 10, name: 'Gutti Vankaya', price: 180, description: 'Stuffed eggplant curry with peanuts and spices', category_id: 3 },
        { id: 11, name: 'Chicken Curry', price: 220, description: 'Spicy South Indian chicken curry with coconut', category_id: 3 },
        { id: 12, name: 'Hyderabadi Biryani', price: 280, description: 'Fragrant basmati rice with aromatic spices and meat', category_id: 4 },
        { id: 13, name: 'Curd Rice', price: 100, description: 'Cooling yogurt rice with mustard seeds', category_id: 4 },
        { id: 14, name: 'Lemon Rice', price: 110, description: 'Tangy rice with lemon juice and peanuts', category_id: 4 },
        { id: 15, name: 'Coconut Rice', price: 120, description: 'Aromatic rice with fresh coconut and seasonings', category_id: 4 },
        { id: 16, name: 'Mysore Pak', price: 90, description: 'Rich sweet made from gram flour, sugar and ghee', category_id: 5 },
        { id: 17, name: 'Rava Kesari', price: 80, description: 'Sweet semolina dessert with saffron and nuts', category_id: 5 },
        { id: 18, name: 'Double Ka Meetha', price: 70, description: 'Hyderabadi bread pudding with nuts and cardamom', category_id: 5 },
        { id: 19, name: 'Filter Coffee', price: 50, description: 'Traditional South Indian filter coffee', category_id: 6 },
        { id: 20, name: 'Badam Milk', price: 60, description: 'Nutritious almond milk with cardamom', category_id: 6 },
        { id: 21, name: 'Buttermilk', price: 40, description: 'Tangy spiced buttermilk with curry leaves', category_id: 6 }
      ]
    };
    await fs.writeFile(MENU_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

async function writeMenuData(data) {
  await fs.writeFile(MENU_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const data = await readMenuData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read categories' });
  }
});

// Get all menu items with optional filtering
app.get('/api/menu-items', async (req, res) => {
  try {
    const data = await readMenuData();
    let items = data.items;
    
    // Filter by category if specified
    if (req.query.category_id) {
      items = items.filter(item => item.category_id == req.query.category_id);
    }
    
    // Search by name if specified
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by price range if specified
    if (req.query.min_price) {
      items = items.filter(item => item.price >= parseFloat(req.query.min_price));
    }
    if (req.query.max_price) {
      items = items.filter(item => item.price <= parseFloat(req.query.max_price));
    }
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read menu items' });
  }
});

// Get single menu item
app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const data = await readMenuData();
    const item = data.items.find(item => item.id == req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read menu item' });
  }
});

// Add new menu item
app.post('/api/menu-items', async (req, res) => {
  try {
    const data = await readMenuData();
    const newItem = {
      id: Math.max(...data.items.map(item => item.id)) + 1,
      name: req.body.name,
      price: parseFloat(req.body.price),
      description: req.body.description,
      category_id: parseInt(req.body.category_id)
    };
    
    // Basic validation
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      return res.status(400).json({ error: 'Name, price, and category_id are required' });
    }
    
    data.items.push(newItem);
    await writeMenuData(data);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const data = await readMenuData();
    const itemIndex = data.items.findIndex(item => item.id == req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const updatedItem = {
      ...data.items[itemIndex],
      name: req.body.name || data.items[itemIndex].name,
      price: req.body.price ? parseFloat(req.body.price) : data.items[itemIndex].price,
      description: req.body.description || data.items[itemIndex].description,
      category_id: req.body.category_id ? parseInt(req.body.category_id) : data.items[itemIndex].category_id
    };
    
    data.items[itemIndex] = updatedItem;
    await writeMenuData(data);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const data = await readMenuData();
    const itemIndex = data.items.findIndex(item => item.id == req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    data.items.splice(itemIndex, 1);
    await writeMenuData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Serve frontend for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Restaurant Menu Service running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend available at http://localhost:${PORT}/`);
});

module.exports = app;
