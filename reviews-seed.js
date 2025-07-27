const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

// Sample reviews data
const sampleReviews = [
  {
    message: "This book completely changed my perspective on life! The storytelling is incredible and the characters feel so real. I couldn't put it down once I started reading.",
    rate: 5
  },
  {
    message: "A wonderful read that kept me engaged from start to finish. The plot twists were unexpected and well-crafted.",
    rate: 4
  },
  {
    message: "Good book overall, though some parts felt a bit slow. The ending was satisfying and made up for the pacing issues.",
    rate: 3
  },
  {
    message: "Absolutely loved this! One of the best books I've read this year. Highly recommend to anyone looking for a great story.",
    rate: 5
  },
  {
    message: "The book was okay but didn't meet my expectations. Some interesting ideas but could have been executed better.",
    rate: 2
  },
  {
    message: "An amazing journey through the pages! The author's writing style is captivating and the themes are thought-provoking.",
    rate: 5
  },
  {
    message: "Pretty good read with solid character development. A few plot holes here and there but overall enjoyable.",
    rate: 4
  },
  {
    message: "This book is a masterpiece! Every chapter reveals something new and exciting. Can't wait to read more from this author.",
    rate: 5
  },
  {
    message: "Not bad, but not great either. The story was predictable and the writing felt rushed in places.",
    rate: 3
  },
  {
    message: "A decent book that serves its purpose. Good for a casual read but nothing that will stay with you long-term.",
    rate: 3
  },
  {
    message: "Fantastic storytelling with deep emotional resonance. Made me laugh, cry, and think. A truly memorable experience.",
    rate: 5
  },
  {
    message: "The book started strong but lost momentum in the middle. The conclusion was satisfying though.",
    rate: 4
  },
  {
    message: "Loved every page! The author has a gift for creating vivid worlds and complex characters. Will definitely read again.",
    rate: 5
  },
  {
    message: "An average read that didn't particularly stand out. Some good moments but overall forgettable.",
    rate: 3
  },
  {
    message: "Disappointing compared to the hype. The story felt disjointed and the characters were underdeveloped.",
    rate: 2
  },
  {
    message: "Brilliant work that tackles important themes with sensitivity and intelligence. A must-read for everyone.",
    rate: 5
  },
  {
    message: "Good entertainment value with some genuinely funny moments. Light reading that doesn't take itself too seriously.",
    rate: 4
  },
  {
    message: "The book has its merits but feels incomplete. Like the author had great ideas but struggled with execution.",
    rate: 3
  },
  {
    message: "Exceeded all my expectations! The research that went into this book is evident and the writing is superb.",
    rate: 5
  },
  {
    message: "A solid addition to my library. Well-written with interesting perspectives, though not groundbreaking.",
    rate: 4
  }
];

// Function to seed reviews
async function seedReviews() {
  try {
    console.log('🌱 Starting reviews seeding process...');

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    // Get all users to assign reviews to
    const users = await User.find({ role: 'USER' });
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Creating a sample user first...');
      
      // Create a sample user for reviews
      const sampleUser = await User.create({
        name: 'John Reviewer',
        email: 'reviewer@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'USER'
      });
      
      users.push(sampleUser);
      console.log('✅ Created sample user for reviews');
    }

    // Create reviews with random user assignments
    const reviewsToCreate = sampleReviews.map(review => ({
      ...review,
      userId: users[Math.floor(Math.random() * users.length)]._id
    }));

    const createdReviews = await Review.insertMany(reviewsToCreate);
    console.log(`✅ Created ${createdReviews.length} reviews successfully`);

    // Display summary
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: createdReviews.filter(review => review.rate === rating).length
    }));

    console.log('\n📊 Reviews Summary:');
    ratingCounts.forEach(({ rating, count }) => {
      console.log(`   ${rating} star${rating > 1 ? 's' : ''}: ${count} reviews`);
    });

    const avgRating = createdReviews.reduce((sum, review) => sum + review.rate, 0) / createdReviews.length;
    console.log(`   Average rating: ${avgRating.toFixed(1)} stars`);

    console.log('\n🎉 Reviews seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  }
}

// Database connection and execution
if (process.env.NODE_ENV === 'development') {
  mongoose
    .connect(process.env.DATABASE_LOCAL)
    .then(async () => {
      console.log('🔌 Connected to local MongoDB database');
      await seedReviews();
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
      await seedReviews();
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database connection error:', err);
      mongoose.connection.close();
      process.exit(1);
    });
}
