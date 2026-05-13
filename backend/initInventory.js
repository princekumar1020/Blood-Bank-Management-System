const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const bg of groups) {
      await Inventory.findOneAndUpdate(
        { bloodGroup: bg },
        { $setOnInsert: { bloodGroup: bg, availableUnits: 0 } },
        { upsert: true }
      );
    }
    console.log('Inventory initialized');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
