import Inventory from '../models/Inventory.js';
// Get inventory summary for all blood groups
export const getInventorySummary = async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    // Calculate stats
    const totalUnits = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
    const criticalTypes = inventory.filter(item => item.availableUnits < 10).length; // threshold for critical
    const expiringSoon = inventory.reduce((sum, item) => sum + item.expiringUnits, 0);
    const avgCapacity = inventory.length ? Math.round((totalUnits / (inventory.length * 50)) * 100) : 0; // assuming 50 is max per type
    res.json({
      totalUnits,
      criticalTypes,
      expiringSoon,
      avgCapacity,
      inventory
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

// Add stock to a blood group
export const addStock = async (req, res) => {
  try {
    let { bloodGroup, units, expiryDate } = req.body;
    if (!bloodGroup || !units) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // If expiryDate not provided, set to 30 days from now
    if (!expiryDate) {
      const today = new Date();
      const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      expiryDate = expiry;
    }
    let inv = await Inventory.findOne({ bloodGroup });
    if (!inv) {
      inv = new Inventory({ bloodGroup, availableUnits: 0, expiringUnits: 0, expiryDetails: [] });
    }
    inv.availableUnits += Number(units);
    // Add expiry details
    inv.expiryDetails.push({ units: Number(units), expiryDate: new Date(expiryDate) });
    // Update expiringUnits (units expiring in next 7 days)
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    inv.expiringUnits = inv.expiryDetails.filter(e => new Date(e.expiryDate) <= soon).reduce((sum, e) => sum + e.units, 0);
    inv.lastUpdated = new Date();
    await inv.save();
    res.json({ success: true, inventory: inv });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add stock', details: err.message });
  }
};

export default {
  getInventorySummary,
  addStock
};
