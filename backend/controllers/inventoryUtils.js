const Inventory = require('../models/Inventory');

// Decrease inventory units for a blood group
exports.decreaseInventory = async (bloodGroup, units) => {
  if (!bloodGroup || !units) return;
  const inv = await Inventory.findOne({ bloodGroup });
  if (!inv || inv.availableUnits < units) return;
  inv.availableUnits -= units;
  // Remove from expiryDetails (oldest first)
  let left = units;
  inv.expiryDetails = inv.expiryDetails.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  for (let i = 0; i < inv.expiryDetails.length && left > 0; i++) {
    if (inv.expiryDetails[i].units > left) {
      inv.expiryDetails[i].units -= left;
      left = 0;
    } else {
      left -= inv.expiryDetails[i].units;
      inv.expiryDetails[i].units = 0;
    }
  }
  inv.expiryDetails = inv.expiryDetails.filter(e => e.units > 0);
  // Update expiringUnits
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  inv.expiringUnits = inv.expiryDetails.filter(e => new Date(e.expiryDate) <= soon).reduce((sum, e) => sum + e.units, 0);
  inv.lastUpdated = new Date();
  await inv.save();
};
