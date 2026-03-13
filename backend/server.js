const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
const studentRoutes = require('./routes/students');
const expenseRoutes = require('./routes/expenses');

app.use('/api/students', studentRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
