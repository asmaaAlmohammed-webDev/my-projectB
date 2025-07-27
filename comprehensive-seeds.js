const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

// ENHANCED: Comprehensive seed data including admin, categories, and products
// This moves all mock data from frontend to backend database

// Admin user configuration
const admin = {
  name: 'admin',
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  phone: '0956565656',
  role: 'ADMIN',
};

// ADDED: Test users for different scenarios
const testUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '0555123456',
    role: 'USER',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '0555654321',
    role: 'USER',
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testuser123',
    phone: '0555999888',
    role: 'USER',
  }
];

// ADDED: Categories seed data
// These categories match the frontend mock data structure
const categories = [
  {
    name: 'Fiction',
    descrption: 'Fictional stories and novels',
    photo: 'fiction.jpg'
  },
  {
    name: 'Romance',
    descrption: 'Love stories and romantic novels',
    photo: 'romance.jpg'
  },
  {
    name: 'Mystery',
    descrption: 'Mystery and thriller books',
    photo: 'mystery.jpg'
  },
  {
    name: 'Science Fiction',
    descrption: 'Science fiction and fantasy books',
    photo: 'scifi.jpg'
  },
  {
    name: 'Biography',
    descrption: 'Biographies and memoirs',
    photo: 'biography.jpg'
  },
  {
    name: 'History',
    descrption: 'Historical books and documentaries',
    photo: 'history.jpg'
  }
];

// ADDED: Products seed data
// This data is moved from frontend mock data files (PopularBooksData.jsx, CategoriesBooksData.jsx, NewArrivalsData.jsx)
const products = [
  // Popular Books (from PopularBooksData.jsx)
  {
    name: 'Shadows of the Past',
    description: 'Unravel secrets hidden deep within a mysterious forest.',
    price: 15.00,
    image: 'book_14.png',
    categoryName: 'Fiction'
  },
  {
    name: 'Eternal Love',
    description: 'A heartwarming romance that transcends time and space.',
    price: 5.00,
    image: 'book_4.png',
    categoryName: 'Romance'
  },
  {
    name: 'Mystic River',
    description: 'A thrilling mystery that will keep you on the edge.',
    price: 8.00,
    image: 'book_5.png',
    categoryName: 'Mystery'
  },
  {
    name: 'Digital Dreams',
    description: 'Explore the future in this captivating sci-fi novel.',
    price: 12.00,
    image: 'book_12.png',
    categoryName: 'Science Fiction'
  },
  {
    name: 'Journey Within',
    description: 'A profound journey of self-discovery and growth.',
    price: 10.00,
    image: 'book_16.png',
    categoryName: 'Biography'
  },
  
  // New Arrivals (from NewArrivalsData.jsx)
  {
    name: 'The Great Adventure',
    description: 'An epic tale of courage and discovery.',
    price: 18.99,
    image: 'book_1.png',
    categoryName: 'Fiction'
  },
  {
    name: 'Love in Paris',
    description: 'A romantic story set in the city of lights.',
    price: 14.50,
    image: 'book_2.png',
    categoryName: 'Romance'
  },
  {
    name: 'The Last Detective',
    description: 'A gripping crime thriller with unexpected twists.',
    price: 16.25,
    image: 'book_3.png',
    categoryName: 'Mystery'
  },
  
  // Additional Fiction Books
  {
    name: 'Winds of Change',
    description: 'A powerful story about transformation and hope.',
    price: 13.75,
    image: 'book_6.png',
    categoryName: 'Fiction'
  },
  {
    name: 'The Secret Garden',
    description: 'A classic tale of magic and friendship.',
    price: 11.99,
    image: 'book_7.png',
    categoryName: 'Fiction'
  },
  
  // Science Fiction
  {
    name: 'Galactic Empire',
    description: 'Space opera spanning multiple galaxies.',
    price: 19.99,
    image: 'book_8.png',
    categoryName: 'Science Fiction'
  },
  {
    name: 'Time Traveler',
    description: 'Adventures through different time periods.',
    price: 17.50,
    image: 'book_9.png',
    categoryName: 'Science Fiction'
  },
  
  // History Books
  {
    name: 'Ancient Civilizations',
    description: 'Explore the mysteries of ancient worlds.',
    price: 22.00,
    image: 'book_10.png',
    categoryName: 'History'
  },
  {
    name: 'World War Stories',
    description: 'Untold stories from the great wars.',
    price: 20.50,
    image: 'book_11.png',
    categoryName: 'History'
  },
  
  // More Romance
  {
    name: 'Summer Romance',
    description: 'A sweet love story under the summer sun.',
    price: 12.75,
    image: 'book_13.png',
    categoryName: 'Romance'
  },
  {
    name: 'Forever Yours',
    description: 'An emotional journey of love and loss.',
    price: 15.25,
    image: 'book_15.png',
    categoryName: 'Romance'
  }
];

// ENHANCED: Improved seeding function with proper error handling and relationship management
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    await User.create(admin);
    console.log('✅ Admin user created successfully');
    
    // 2. Create test users
    console.log('👥 Creating test users...');
    await User.create(testUsers);
    console.log(`✅ ${testUsers.length} test users created successfully`);
    
    // 3. Create categories
    console.log('📚 Creating categories...');
    const createdCategories = await Category.create(categories);
    console.log(`✅ ${createdCategories.length} categories created successfully`);
    
    // 3. Create products with category references
    console.log('📖 Creating products...');
    const productsWithCategoryIds = await Promise.all(
      products.map(async (product) => {
        const category = createdCategories.find(cat => cat.name === product.categoryName);
        if (!category) {
          throw new Error(`Category ${product.categoryName} not found`);
        }
        
        return {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: category._id
        };
      })
    );
    
    const createdProducts = await Product.create(productsWithCategoryIds);
    console.log(`✅ ${createdProducts.length} products created successfully`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Admin users: 1
    - Test users: ${testUsers.length}
    - Categories: ${createdCategories.length}
    - Products: ${createdProducts.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Database connection and seeding execution
if (process.env.NODE_ENV === 'development') {
  mongoose
    .connect(process.env.DATABASE_LOCAL)
    .then(async () => {
      console.log('🔌 Connected to local MongoDB database');
      await seedDatabase();
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database connection error:', err);
      mongoose.connection.close();
      process.exit(1);
    });
} else {
  mongoose
    .connect(process.env.DATABASE)
    .then(async () => {
      console.log('🔌 Connected to production MongoDB database');
      await seedDatabase();
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database connection error:', err);
      mongoose.connection.close();
      process.exit(1);
    });
}
