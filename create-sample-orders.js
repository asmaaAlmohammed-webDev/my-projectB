const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Category = require('./models/categoryModel'); // Add Category model

// Sample orders data
const createSampleOrders = async () => {
  try {
    console.log('🌱 Creating sample orders...');
    
    // Connect to database
    await mongoose.connect(process.env.DATABASE_LOCAL);
    console.log('✅ Connected to MongoDB');

    // Get existing products and users
    const products = await Product.find().limit(5);
    const users = await User.find({ role: 'USER' });
    const admin = await User.findOne({ role: 'ADMIN' });

    if (products.length === 0) {
      console.log('❌ No products found. Please run test-seeds.js first');
      process.exit(1);
    }

    // Create a regular user if none exists
    let customer = users[0];
    if (!customer) {
      customer = await User.create({
        name: 'John Customer',
        email: 'customer@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'USER'
      });
      console.log('✅ Created sample customer');
    }

    // Sample orders
    const sampleOrders = [
      {
        userId: customer._id,
        cart: [
          {
            productId: products[0]._id,
            amount: 2,
            price: products[0].price
          },
          {
            productId: products[1]._id,
            amount: 1,
            price: products[1].price
          }
        ],
        total: (products[0].price * 2) + products[1].price,
        methodePayment: 'cash',
        status: 'wating',
        address: {
          street: '123 Main Street',
          region: 'Downtown',
          descreption: 'Apartment 4B, blue door'
        }
      },
      {
        userId: customer._id,
        cart: [
          {
            productId: products[2]._id,
            amount: 1,
            price: products[2].price
          }
        ],
        total: products[2].price,
        methodePayment: 'bank',
        status: 'preparing',
        address: {
          street: '456 Oak Avenue',
          region: 'Uptown',
          descreption: 'House with red roof'
        }
      },
      {
        userId: customer._id,
        cart: [
          {
            productId: products[3]._id,
            amount: 3,
            price: products[3].price
          },
          {
            productId: products[4]._id,
            amount: 1,
            price: products[4].price
          }
        ],
        total: (products[3].price * 3) + products[4].price,
        methodePayment: 'cash',
        status: 'dlivery',
        address: {
          street: '789 Pine Road',
          region: 'Suburbs',
          descreption: 'Green fence, near the park'
        }
      },
      {
        userId: customer._id,
        cart: [
          {
            productId: products[1]._id,
            amount: 2,
            price: products[1].price
          }
        ],
        total: products[1].price * 2,
        methodePayment: 'bank',
        status: 'done',
        address: {
          street: '321 Elm Street',
          region: 'City Center',
          descreption: 'Office building, 3rd floor'
        }
      }
    ];

    // Clear existing orders
    await Order.deleteMany({});
    console.log('🧹 Cleared existing orders');

    // Create sample orders
    await Order.create(sampleOrders);
    console.log(`✅ Created ${sampleOrders.length} sample orders`);

    console.log('\n🎉 Sample orders created successfully!');
    console.log('📊 Order Summary:');
    console.log('   • Waiting: 1 order');
    console.log('   • Preparing: 1 order');
    console.log('   • In Delivery: 1 order');
    console.log('   • Completed: 1 order');
    console.log('\n💡 You can now view orders in the admin panel at /admin/orders');

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

createSampleOrders();
