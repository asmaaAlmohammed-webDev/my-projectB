const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

// Import all models
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const Review = require('./models/reviewModel');
const Conact = require('./models/conactModel');

// COMPREHENSIVE SEEDER - All data in one place
// This replaces: comprehensive-seeds.js, reviews-seed.js, seed-reviews.js, requests-seed.js

// =============================================================================
// ADMIN USER CONFIGURATION
// =============================================================================
const admin = {
  name: 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  phone: '0956565656',
  role: 'ADMIN',
};

// =============================================================================
// CATEGORIES DATA
// =============================================================================
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
  },
  {
    name: 'Self Help',
    descrption: 'Personal development and self-improvement',
    photo: 'selfhelp.jpg'
  },
  {
    name: 'Technology',
    descrption: 'Programming, AI, and technology books',
    photo: 'technology.jpg'
  }
];

// =============================================================================
// SAMPLE USERS DATA
// =============================================================================
const sampleUsers = [
  {
    name: 'John Reader',
    email: 'john@example.com',
    password: 'password123',
    phone: '1234567890',
    role: 'USER'
  },
  {
    name: 'Sarah Bookworm',
    email: 'sarah@example.com',
    password: 'password123',
    phone: '2345678901',
    role: 'USER'
  },
  {
    name: 'Mike Literature',
    email: 'mike@example.com',
    password: 'password123',
    phone: '3456789012',
    role: 'USER'
  },
  {
    name: 'Emily Stories',
    email: 'emily@example.com',
    password: 'password123',
    phone: '4567890123',
    role: 'USER'
  }
];

// =============================================================================
// PRODUCTS DATA (will be linked to categories)
// =============================================================================
const productsTemplate = [
  // Fiction Books
  {
    name: 'The Great Gatsby',
    description: 'A classic American novel set in the Jazz Age',
    price: 15.99,
    image: 'gatsby.jpg',
    categoryName: 'Fiction'
  },
  {
    name: 'To Kill a Mockingbird',
    description: 'A powerful story of racial injustice and childhood',
    price: 14.50,
    image: 'mockingbird.jpg',
    categoryName: 'Fiction'
  },
  // Romance Books
  {
    name: 'Pride and Prejudice',
    description: 'Jane Austen\'s beloved romantic classic',
    price: 12.99,
    image: 'pride-prejudice.jpg',
    categoryName: 'Romance'
  },
  {
    name: 'The Notebook',
    description: 'A touching love story that spans decades',
    price: 13.75,
    image: 'notebook.jpg',
    categoryName: 'Romance'
  },
  // Mystery Books
  {
    name: 'The Girl with the Dragon Tattoo',
    description: 'A gripping Swedish crime thriller',
    price: 16.99,
    image: 'dragon-tattoo.jpg',
    categoryName: 'Mystery'
  },
  {
    name: 'Gone Girl',
    description: 'A psychological thriller about a missing wife',
    price: 15.25,
    image: 'gone-girl.jpg',
    categoryName: 'Mystery'
  },
  // Science Fiction Books
  {
    name: 'Dune',
    description: 'Epic space opera set on the desert planet Arrakis',
    price: 18.99,
    image: 'dune.jpg',
    categoryName: 'Science Fiction'
  },
  {
    name: 'The Martian',
    description: 'Survival story of an astronaut stranded on Mars',
    price: 14.99,
    image: 'martian.jpg',
    categoryName: 'Science Fiction'
  },
  // Biography Books
  {
    name: 'Steve Jobs',
    description: 'The official biography of Apple\'s co-founder',
    price: 19.99,
    image: 'steve-jobs.jpg',
    categoryName: 'Biography'
  },
  {
    name: 'Becoming',
    description: 'Michelle Obama\'s inspiring memoir',
    price: 17.50,
    image: 'becoming.jpg',
    categoryName: 'Biography'
  },
  // Technology Books
  {
    name: 'Clean Code',
    description: 'A handbook of agile software craftsmanship',
    price: 24.99,
    image: 'clean-code.jpg',
    categoryName: 'Technology'
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'Your journey to mastery in programming',
    price: 22.75,
    image: 'pragmatic-programmer.jpg',
    categoryName: 'Technology'
  }
];

// =============================================================================
// REVIEWS DATA
// =============================================================================
const reviewsTemplate = [
  {
    message: "Absolutely loved this book! The storyline was captivating and I couldn't put it down. Highly recommended for anyone who enjoys a good thriller.",
    rate: 5
  },
  {
    message: "Great read with interesting characters. The plot was well-developed though it took a while to get going. Worth the read overall.",
    rate: 4
  },
  {
    message: "Good book but not what I expected. The writing style was a bit dry for my taste, but the story was decent.",
    rate: 3
  },
  {
    message: "One of the best books I've read this year! The author's writing is beautiful and the story is deeply moving. A must-read!",
    rate: 5
  },
  {
    message: "Decent book with some good moments. The ending was a bit rushed but overall it was an enjoyable read.",
    rate: 4
  },
  {
    message: "Not impressed with this one. The plot was predictable and the characters lacked depth. Expected more based on the reviews.",
    rate: 2
  },
  {
    message: "Fantastic book with great character development! The author really knows how to build suspense. Looking forward to more from this author.",
    rate: 5
  },
  {
    message: "Pretty good book overall. Some parts were a bit slow but it picked up towards the end. Would recommend to fans of the genre.",
    rate: 4
  },
  {
    message: "Interesting concept but poor execution. The story had potential but felt underdeveloped. Might appeal to some readers.",
    rate: 3
  },
  {
    message: "Amazing storytelling! This book kept me on the edge of my seat from start to finish. Beautifully written and emotionally engaging.",
    rate: 5
  },
  {
    message: "Good book but had some pacing issues. The middle section dragged a bit but the beginning and end were solid.",
    rate: 3
  },
  {
    message: "Loved the unique perspective and writing style. The author brings a fresh voice to the genre. Definitely worth reading!",
    rate: 4
  }
];

// =============================================================================
// CONTACT REQUESTS DATA
// =============================================================================
const contactRequests = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    message: 'Hello! I am interested in learning more about your book collection. Do you have any recommendations for science fiction novels? I am particularly interested in space exploration themes.'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    message: 'Hi there, I placed an order last week but haven\'t received a confirmation email. Could you please check the status of my order? My order number is #12345.'
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@gmail.com',
    message: 'I love your bookstore! The staff is amazing and the selection is fantastic. I wanted to suggest adding more mystery novels to your collection. Keep up the great work!'
  },
  {
    name: 'Emily Brown',
    email: 'emily.brown@hotmail.com',
    message: 'Do you offer book clubs or reading groups? I\'m new to the area and would love to meet other book lovers. Please let me know about any upcoming events.'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@yahoo.com',
    message: 'I\'m having trouble with the website. When I try to add items to my cart, it doesn\'t seem to work properly. Could you help me with this issue?'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    message: 'Thank you for the excellent service! I received my books quickly and they were in perfect condition. I will definitely be ordering again soon.'
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@gmail.com',
    message: 'I\'m looking for a specific book titled "The Art of Programming" by Donald Knuth. Do you have it in stock? If not, can you order it for me?'
  },
  {
    name: 'Jennifer Martinez',
    email: 'jen.martinez@example.com',
    message: 'Could you please provide information about your return policy? I purchased a book that arrived damaged and would like to exchange it.'
  },
  {
    name: 'Christopher Lee',
    email: 'chris.lee@outlook.com',
    message: 'Hi! I\'m a teacher and I\'m interested in bulk purchasing for my classroom library. Do you offer educational discounts? Please contact me with more information.'
  },
  {
    name: 'Amanda White',
    email: 'amanda.white@example.com',
    message: 'Your bookstore has an amazing atmosphere! I spent hours browsing yesterday. Do you have any author events or book signings coming up? I\'d love to attend.'
  }
];

// =============================================================================
// MAIN SEEDING FUNCTION
// =============================================================================
async function seedAllData() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    console.log('=' * 60);

    // 1. Clear all existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Conact.deleteMany({})
    ]);
    console.log('✅ All collections cleared');

    // 2. Create Admin User
    console.log('\n👤 Creating admin user...');
    const adminUser = await User.create(admin);
    console.log(`✅ Admin created: ${adminUser.email}`);

    // 3. Create Sample Users
    console.log('\n👥 Creating sample users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} sample users`);

    // 4. Create Categories
    console.log('\n📚 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 5. Create Products (linked to categories)
    console.log('\n📖 Creating products...');
    const products = [];
    for (const productTemplate of productsTemplate) {
      const category = createdCategories.find(cat => cat.name === productTemplate.categoryName);
      if (category) {
        const product = {
          name: productTemplate.name,
          description: productTemplate.description,
          price: productTemplate.price,
          image: productTemplate.image,
          categoryId: category._id
        };
        products.push(product);
      }
    }
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // 6. Create Reviews (linked to users)
    console.log('\n⭐ Creating reviews...');
    const reviews = reviewsTemplate.map(reviewTemplate => ({
      ...reviewTemplate,
      userId: users[Math.floor(Math.random() * users.length)]._id
    }));
    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // 7. Create Sample Orders (linked to users and products)
    console.log('\n🛒 Creating sample orders...');
    const orders = [];
    for (let i = 0; i < 8; i++) {
      const user = users[i % users.length];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const cart = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const amount = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        cart.push({
          productId: product._id,
          amount: amount,
          price: product.price
        });
        total += product.price * amount;
      }

      const statuses = ['wating', 'preparing', 'dlivery', 'done'];
      const paymentMethods = ['cash', 'bank'];
      
      orders.push({
        userId: user._id,
        cart: cart,
        total: total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        methodePayment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          region: 'Downtown',
          descreption: 'Near the central library'
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
    }
    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // 8. Create Contact Requests
    console.log('\n📧 Creating contact requests...');
    const requests = contactRequests.map((request, index) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        ...request,
        createdAt,
        updatedAt: createdAt
      };
    });
    const createdRequests = await Conact.insertMany(requests);
    console.log(`✅ Created ${createdRequests.length} contact requests`);

    // 9. Display Summary
    console.log('\n' + '=' * 60);
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('=' * 60);
    console.log(`👤 Admin Users: 1`);
    console.log(`👥 Regular Users: ${users.length}`);
    console.log(`📚 Categories: ${createdCategories.length}`);
    console.log(`📖 Products: ${createdProducts.length}`);
    console.log(`🛒 Orders: ${createdOrders.length}`);
    console.log(`⭐ Reviews: ${createdReviews.length}`);
    console.log(`📧 Contact Requests: ${createdRequests.length}`);

    // Statistics breakdown
    const orderStats = {
      wating: createdOrders.filter(o => o.status === 'wating').length,
      preparing: createdOrders.filter(o => o.status === 'preparing').length,
      dlivery: createdOrders.filter(o => o.status === 'dlivery').length,
      done: createdOrders.filter(o => o.status === 'done').length
    };

    const reviewStats = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: createdReviews.filter(r => r.rate === rating).length
    }));

    const avgRating = createdReviews.reduce((sum, r) => sum + r.rate, 0) / createdReviews.length;
    const totalRevenue = createdOrders.filter(o => o.status === 'done').reduce((sum, o) => sum + o.total, 0);

    console.log('\n📈 DETAILED STATISTICS');
    console.log('─'.repeat(30));
    console.log('Order Status:');
    Object.entries(orderStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });

    console.log('\nReview Ratings:');
    reviewStats.forEach(({ rating, count }) => {
      console.log(`   ${rating} star${rating > 1 ? 's' : ''}: ${count} reviews`);
    });
    console.log(`   Average Rating: ${avgRating.toFixed(1)} stars`);

    console.log(`\nRevenue: $${totalRevenue.toFixed(2)}`);

    console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('All admin features now have realistic data to work with.');

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
    throw error;
  }
}

// =============================================================================
// DATABASE CONNECTION AND EXECUTION
// =============================================================================
const DB_URL = process.env.NODE_ENV === 'development' 
  ? process.env.DATABASE_LOCAL 
  : process.env.DATABASE;

console.log('🔌 Connecting to database...');
mongoose
  .connect(DB_URL)
  .then(async () => {
    console.log('✅ Database connected successfully');
    await seedAllData();
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    mongoose.connection.close();
    process.exit(1);
  });
