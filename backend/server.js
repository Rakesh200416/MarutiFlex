const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// connect database
connectDB();

// middleware
app.use(express.json());
app.use(cors());
// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/financial-creditibility', require('./routes/financial-creditibility'));
app.use('/api/management-approval', require('./routes/management-approval'));
app.use('/api/final-order', require('./routes/final-order'));
app.use('/api/arrange-vehicle', require('./routes/arrange-vehicle'));
app.use('/api/billing-eway', require('./routes/billing-eway'));
app.use('/api/receipt-from-client', require('./routes/receipt-from-client'));
app.use('/api/status-of-material', require('./routes/status-of-material'));
app.use('/api/delivery-info-to-client', require('./routes/delivery-info-to-client'));
app.use('/api/order-invoice', require('./routes/order-invoice'));
app.use('/api/feedback-call', require('./routes/feedback-call'));

// protected route to get user info
const auth = require('./middleware/auth');
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await require('./models/User').findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
