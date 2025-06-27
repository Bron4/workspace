require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const City = require('../models/City');
const Technician = require('../models/Technician');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');

const seedCities = async () => {
  console.log('Seeding cities...');
  
  const cities = [
    { name: 'Atlanta', googleReviewLink: 'https://g.page/r/bates-electric-atlanta/review' },
    { name: 'Birmingham', googleReviewLink: 'https://g.page/r/bates-electric-birmingham/review' },
    { name: 'Charlotte', googleReviewLink: 'https://g.page/r/bates-electric-charlotte/review' },
    { name: 'Nashville', googleReviewLink: 'https://g.page/r/bates-electric-nashville/review' },
    { name: 'Memphis', googleReviewLink: 'https://g.page/r/bates-electric-memphis/review' },
    { name: 'Jacksonville', googleReviewLink: 'https://g.page/r/bates-electric-jacksonville/review' },
    { name: 'Tampa', googleReviewLink: 'https://g.page/r/bates-electric-tampa/review' },
    { name: 'Orlando', googleReviewLink: 'https://g.page/r/bates-electric-orlando/review' },
  ];

  try {
    // Clear existing cities
    await City.deleteMany({});
    console.log('Cleared existing cities');

    // Insert new cities
    const insertedCities = await City.insertMany(cities);
    console.log(`Successfully seeded ${insertedCities.length} cities`);
    
    return insertedCities;
  } catch (error) {
    console.error('Error seeding cities:', error);
    throw error;
  }
};

const seedTechnicians = async (cities) => {
  console.log('Seeding technicians...');
  
  const technicians = [
    { name: 'John Smith', email: 'john.smith@bateselectric.com', phone: '555-0101', cityId: cities[0]._id },
    { name: 'Mike Johnson', email: 'mike.johnson@bateselectric.com', phone: '555-0102', cityId: cities[1]._id },
    { name: 'David Wilson', email: 'david.wilson@bateselectric.com', phone: '555-0103', cityId: cities[2]._id },
    { name: 'Chris Brown', email: 'chris.brown@bateselectric.com', phone: '555-0104', cityId: cities[3]._id },
    { name: 'Robert Davis', email: 'robert.davis@bateselectric.com', phone: '555-0105', cityId: cities[4]._id },
    { name: 'James Miller', email: 'james.miller@bateselectric.com', phone: '555-0106', cityId: cities[5]._id },
    { name: 'William Garcia', email: 'william.garcia@bateselectric.com', phone: '555-0107', cityId: cities[6]._id },
    { name: 'Thomas Anderson', email: 'thomas.anderson@bateselectric.com', phone: '555-0108', cityId: cities[7]._id },
  ];

  try {
    // Clear existing technicians
    await Technician.deleteMany({});
    console.log('Cleared existing technicians');

    // Insert new technicians
    const insertedTechnicians = await Technician.insertMany(technicians);
    console.log(`Successfully seeded ${insertedTechnicians.length} technicians`);
    
    return insertedTechnicians;
  } catch (error) {
    console.error('Error seeding technicians:', error);
    throw error;
  }
};

const seedAdminUser = async () => {
  console.log('Seeding admin user...');
  
  const adminEmail = 'admin@bateselectric.com';
  const adminPassword = 'admin123';
  
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
      return existingAdmin;
    }

    // Hash the password
    const hashedPassword = await hashPassword(adminPassword);
    
    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log(`Successfully created admin user with email: ${adminEmail}`);
    console.log(`Admin password: ${adminPassword}`);
    
    return adminUser;
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed cities first
    const cities = await seedCities();
    
    // Seed technicians with city references
    const technicians = await seedTechnicians(cities);
    
    // Seed admin user
    const adminUser = await seedAdminUser();
    
    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`- Cities: ${cities.length}`);
    console.log(`- Technicians: ${technicians.length}`);
    console.log(`- Admin user: ${adminUser.email}`);
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedCities, seedTechnicians, seedAdminUser };