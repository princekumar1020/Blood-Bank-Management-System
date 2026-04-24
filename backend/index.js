require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const app = express();
app.use(express.json());
app.use(cors());
// Serve static files for uploads
app.use('/uploads', express.static(__dirname + '/public/uploads'));
app.use('/api/recipient-management', require('./routes/recipientManagement'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bloodbank')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/recipient', require('./routes/recipient'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/donor-management', require('./routes/donorManagement'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
