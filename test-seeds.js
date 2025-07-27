const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

// Admin user configuration
const admin = {
  name: 'admin',
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  phone: '0956565656',
  role: 'ADMIN',
};

// Categories with real image URLs for testing
const categories = [
  {
    name: 'Fiction',
    descrption: 'Fictional stories and novels',
    photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
  },
  {
    name: 'Romance',
    descrption: 'Love stories and romantic novels',
    photo: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=400&h=300&fit=crop'
  },
  {
    name: 'Mystery',
    descrption: 'Mystery and thriller books',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  },
  {
    name: 'Science Fiction',
    descrption: 'Science fiction and fantasy books',
    photo: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop'
  },
  {
    name: 'Biography',
    descrption: 'Biographies and memoirs',
    photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop'
  },
  {
    name: 'History',
    descrption: 'Historical books and documentaries',
    photo: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop'
  }
];

// Products with real image URLs and proper category references
const getProducts = (categoryIds) => [
  {
    name: 'The Great Gatsby',
    description: 'A classic American novel by F. Scott Fitzgerald',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    categoryId: categoryIds[0] // Fiction
  },
  {
    name: 'To Kill a Mockingbird',
    description: 'Harper Lee\'s timeless classic about justice and morality',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    categoryId: categoryIds[0] // Fiction
  },
  {
    name: 'Pride and Prejudice',
    description: 'Jane Austen\'s beloved romance novel',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    categoryId: categoryIds[1] // Romance
  },
  {
    name: 'The Notebook',
    description: 'Nicholas Sparks\' touching love story',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    categoryId: categoryIds[1] // Romance
  },
  {
    name: 'Gone Girl',
    description: 'Gillian Flynn\'s psychological thriller',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    categoryId: categoryIds[2] // Mystery
  },
  {
    name: 'The Girl with the Dragon Tattoo',
    description: 'Stieg Larsson\'s gripping mystery',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    categoryId: categoryIds[2] // Mystery
  },
  {
    name: 'Dune',
    description: 'Frank Herbert\'s epic science fiction masterpiece',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop',
    categoryId: categoryIds[3] // Science Fiction
  },
  {
    name: 'The Martian',
    description: 'Andy Weir\'s thrilling space survival story',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1516981442399-233d7b4834a3?w=400&h=600&fit=crop',
    categoryId: categoryIds[3] // Science Fiction
  },
  {
    name: 'Steve Jobs',
    description: 'Walter Isaacson\'s definitive biography',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    categoryId: categoryIds[4] // Biography
  },
  {
    name: 'Becoming',
    description: 'Michelle Obama\'s inspiring memoir',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=600&fit=crop',
    categoryId: categoryIds[4] // Biography
  },
  {
    name: 'Sapiens',
    description: 'Yuval Noah Harari\'s brief history of humankind',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
    categoryId: categoryIds[5] // History
  },
  {
    name: 'The Guns of August',
    description: 'Barbara Tuchman\'s Pulitzer Prize-winning history',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop',
    categoryId: categoryIds[5] // History
  }
];

// Database connection
const DATABASE_URL = process.env.DATABASE_LOCAL || 'mongodb://127.0.0.1:27017/DatabaseAuthUser';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create(admin);
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create categories
    console.log('📂 Creating categories...');
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Get category IDs for products
    const categoryIds = createdCategories.map(cat => cat._id);

    // Create products
    console.log('📚 Creating products...');
    const productData = getProducts(categoryIds);
    const createdProducts = await Product.create(productData);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Admin Users: 1`);
    console.log(`   • Categories: ${createdCategories.length}`);
    console.log(`   • Products: ${createdProducts.length}`);
    console.log('\n💡 You can now:');
    console.log('   • Login as admin with your configured credentials');
    console.log('   • View categories and products in the admin panel');
    console.log('   • Test image uploads (requires Cloudinary setup)');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 This error usually means data already exists.');
      console.log('   Clear the database first or use different data.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
