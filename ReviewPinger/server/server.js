// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageTemplateRoutes = require("./routes/messageTemplateRoutes");
const smsTemplateRoutes = require("./routes/smsTemplateRoutes");
const smsRoutes = require("./routes/smsRoutes");
const urlRoutes = require("./routes/urlRoutes");
const reportRoutes = require("./routes/reportRoutes");
const { connectDB } = require("./config/database");
const cors = require("cors");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// City Routes
app.use('/api/cities', cityRoutes);
// Technician Routes
app.use('/api/technicians', technicianRoutes);
// Admin Routes
app.use('/api/admin', adminRoutes);
// Message Template Routes (admin)
app.use('/api/admin', messageTemplateRoutes);
// SMS Template Routes
app.use('/api/sms-templates', smsTemplateRoutes);
// SMS Routes
app.use('/api/sms', smsRoutes);
// URL Routes
app.use('/api/url', urlRoutes);
// Report Routes
app.use('/api/reports', reportRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});