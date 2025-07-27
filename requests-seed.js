const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Conact = require('./models/conactModel');

// Sample contact requests data
const sampleRequests = [
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

// Function to seed contact requests
async function seedRequests() {
  try {
    console.log('🌱 Starting contact requests seeding process...');

    // Clear existing requests
    await Conact.deleteMany({});
    console.log('🗑️  Cleared existing contact requests');

    // Create requests with some having different creation dates for testing
    const requestsToCreate = sampleRequests.map((request, index) => {
      // Spread requests over the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      return {
        ...request,
        createdAt,
        updatedAt: createdAt
      };
    });

    const createdRequests = await Conact.insertMany(requestsToCreate);
    console.log(`✅ Created ${createdRequests.length} contact requests successfully`);

    // Display summary
    const today = new Date();
    const todayRequests = createdRequests.filter(r => 
      r.createdAt.toDateString() === today.toDateString()
    ).length;
    
    const thisWeek = createdRequests.filter(r => 
      r.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    console.log('\n📊 Requests Summary:');
    console.log(`   Total Requests: ${createdRequests.length}`);
    console.log(`   Today: ${todayRequests}`);
    console.log(`   This Week: ${thisWeek}`);

    console.log('\n🎉 Contact requests seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding contact requests:', error);
    throw error;
  }
}

// Database connection and execution
if (process.env.NODE_ENV === 'development') {
  mongoose
    .connect(process.env.DATABASE_LOCAL)
    .then(async () => {
      console.log('🔌 Connected to local MongoDB database');
      await seedRequests();
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
      await seedRequests();
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database connection error:', err);
      mongoose.connection.close();
      process.exit(1);
    });
}
