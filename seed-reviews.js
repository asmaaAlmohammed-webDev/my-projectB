const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

// Sample reviews data
const reviewsData = [
  {
    message: "Absolutely loved this book! The storyline was captivating and I couldn't put it down. Highly recommended for anyone who enjoys a good thriller.",
    rate: 5,
    userEmail: 'user@example.com'
  },
  {
    message: "Great read with interesting characters. The plot was well-developed though it took a while to get going. Worth the read overall.",
    rate: 4,
    userEmail: 'user@example.com'
  },
  {
    message: "Good book but not what I expected. The writing style was a bit dry for my taste, but the story was decent.",
    rate: 3,
    userEmail: 'user@example.com'
  },
  {
    message: "One of the best books I've read this year! The author's writing is beautiful and the story is deeply moving. A must-read!",
    rate: 5,
    userEmail: 'user@example.com'
  },
  {
    message: "Decent book with some good moments. The ending was a bit rushed but overall it was an enjoyable read.",
    rate: 4,
    userEmail: 'user@example.com'
  },
  {
    message: "Not impressed with this one. The plot was predictable and the characters lacked depth. Expected more based on the reviews.",
    rate: 2,
    userEmail: 'user@example.com'
  },
  {
    message: "Fantastic book with great character development! The author really knows how to build suspense. Looking forward to more from this author.",
    rate: 5,
    userEmail: 'user@example.com'
  },
  {
    message: "Pretty good book overall. Some parts were a bit slow but it picked up towards the end. Would recommend to fans of the genre.",
    rate: 4,
    userEmail: 'user@example.com'
  },
  {
    message: "Interesting concept but poor execution. The story had potential but felt underdeveloped. Might appeal to some readers.",
    rate: 3,
    userEmail: 'user@example.com'
  },
  {
    message: "Amazing storytelling! This book kept me on the edge of my seat from start to finish. Beautifully written and emotionally engaging.",
    rate: 5,
    userEmail: 'user@example.com'
  },
  {
    message: "Good book but had some pacing issues. The middle section dragged a bit but the beginning and end were solid.",
    rate: 3,
    userEmail: 'user@example.com'
  },
  {
    message: "Loved the unique perspective and writing style. The author brings a fresh voice to the genre. Definitely worth reading!",
    rate: 4,
    userEmail: 'user@example.com'
  }
];

// Database connection
const DB_URL = process.env.DATABASE_LOCAL;

console.log('🌱 Starting reviews seeding process...');

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('✅ Database connected successfully');
  
  try {
    // Clear existing reviews
    console.log('🗑️  Clearing existing reviews...');
    await Review.deleteMany({});
    console.log('✅ Existing reviews cleared');

    // Find a user to associate reviews with
    console.log('👤 Finding user for reviews...');
    let user = await User.findOne({ email: 'user@example.com' });
    
    if (!user) {
      // Create a sample user if none exists
      console.log('👤 Creating sample user...');
      user = await User.create({
        name: 'Sample User',
        email: 'user@example.com',
        password: 'password123',
        phone: '0123456789',
        role: 'USER'
      });
      console.log('✅ Sample user created');
    }

    // Create reviews with actual user ID
    console.log('📝 Creating reviews...');
    const reviewsToCreate = reviewsData.map(review => ({
      message: review.message,
      rate: review.rate,
      userId: user._id
    }));

    const createdReviews = await Review.insertMany(reviewsToCreate);
    console.log(`✅ ${createdReviews.length} reviews created successfully`);

    // Display summary
    console.log('\n📊 Reviews Summary:');
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: '$rate',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    reviewStats.forEach(stat => {
      console.log(`   ${stat._id} stars: ${stat.count} reviews`);
    });

    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rate' }
        }
      }
    ]);

    console.log(`\n   Total Reviews: ${totalReviews}`);
    console.log(`   Average Rating: ${avgRating[0]?.averageRating.toFixed(1)} stars`);

    console.log('\n🎉 Reviews seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});
