const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

// Import all models
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const Review = require('./models/reviewModel');
const Conact = require('./models/conactModel');
const Publisher = require('./models/publisherModel');
const Notification = require('./models/notificationModel');
const Promotion = require('./models/promotionModel');

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
// PUBLISHERS DATA
// =============================================================================
const publishers = [
  {
    name: 'Penguin Random House',
    email: 'orders@penguinrandomhouse.com',
    phone: '+1-555-0123',
    address: '1745 Broadway, New York, NY 10019',
    contactPerson: 'Sarah Publishing Manager',
    website: 'https://www.penguinrandomhouse.com',
    isActive: true
  },
  {
    name: 'HarperCollins Publishers',
    email: 'procurement@harpercollins.com',
    phone: '+1-555-0124',
    address: '195 Broadway, New York, NY 10007',
    contactPerson: 'Michael Book Manager',
    website: 'https://www.harpercollins.com',
    isActive: true
  },
  {
    name: 'Macmillan Publishers',
    email: 'orders@macmillan.com',
    phone: '+1-555-0125',
    address: '120 Broadway, New York, NY 10271',
    contactPerson: 'Emma Sales Director',
    website: 'https://www.macmillan.com',
    isActive: true
  },
  {
    name: 'Simon & Schuster',
    email: 'sales@simonandschuster.com',
    phone: '+1-555-0126',
    address: '1230 Avenue of the Americas, New York, NY 10020',
    contactPerson: 'David Distribution Manager',
    website: 'https://www.simonandschuster.com',
    isActive: true
  },
  {
    name: 'Hachette Book Group',
    email: 'orders@hachettebookgroup.com',
    phone: '+1-555-0127',
    address: '1290 Avenue of the Americas, New York, NY 10104',
    contactPerson: 'Lisa Operations Manager',
    website: 'https://www.hachettebookgroup.com',
    isActive: true
  }
];

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
    role: 'USER',
    loyaltyTier: 'silver',
    loyaltyPoints: 250,
    totalSpent: 320,
    orderCount: 5,
    firstPurchaseCompleted: true
  },
  {
    name: 'Sarah Bookworm',
    email: 'sarah@example.com',
    password: 'password123',
    phone: '2345678901',
    role: 'USER',
    loyaltyTier: 'gold',
    loyaltyPoints: 750,
    totalSpent: 650,
    orderCount: 12,
    firstPurchaseCompleted: true
  },
  {
    name: 'Mike Literature',
    email: 'mike@example.com',
    password: 'password123',
    phone: '3456789012',
    role: 'USER',
    loyaltyTier: 'bronze',
    loyaltyPoints: 50,
    totalSpent: 45,
    orderCount: 2,
    firstPurchaseCompleted: true
  },
  {
    name: 'Emily Stories',
    email: 'emily@example.com',
    password: 'password123',
    phone: '4567890123',
    role: 'USER',
    loyaltyTier: 'platinum',
    loyaltyPoints: 1500,
    totalSpent: 1200,
    orderCount: 25,
    firstPurchaseCompleted: true
  },
  {
    name: 'Alex NewReader',
    email: 'alex@example.com',
    password: 'password123',
    phone: '5678901234',
    role: 'USER',
    loyaltyTier: 'bronze',
    loyaltyPoints: 0,
    totalSpent: 0,
    orderCount: 0,
    firstPurchaseCompleted: false
  }
];

// =============================================================================
// PRODUCTS DATA (will be linked to categories)
// UPDATED: Fixed image mapping to match original frontend + added Arabic support
// =============================================================================
const productsTemplate = [
  // Popular Books (first 5) - matching PopularBooksData.jsx images and descriptions
  {
    name: 'Shadows of the Past',
    description_en: 'Unravel secrets hidden deep within a mysterious forest.',
    description_ar: 'اكتشف الأسرار المخفية في أعماق غابة غامضة.',
    price: 15.00,
    image: 'book_14.png', // Original popular book #1
    categoryName: 'Fiction',
    stock: 25,
    minStockLevel: 5,
    publisherName: 'Penguin Random House'
  },
  {
    name: 'Eternal Love',
    description_en: 'A heartwarming romance that transcends time and space.',
    description_ar: 'قصة حب دافئة تتجاوز الزمان والمكان.',
    price: 5.00,
    image: 'book_4.png', // Original popular book #2
    categoryName: 'Romance',
    stock: 40,
    minStockLevel: 8,
    publisherName: 'HarperCollins Publishers'
  },
  {
    name: 'Toy Adventures',
    description_en: 'Follow a group of toys on their magical adventures.',
    description_ar: 'تابع مجموعة من الألعاب في مغامراتها السحرية.',
    price: 10.00,
    image: 'book_5.png', // Original popular book #3
    categoryName: 'Fiction',
    stock: 3, // Low stock for demo
    minStockLevel: 5,
    publisherName: 'Penguin Random House'
  },
  {
    name: 'Animal Wisdom',
    description_en: 'A delightful story about animals who share their wisdom.',
    description_ar: 'قصة ممتعة عن الحيوانات التي تشارك حكمتها.',
    price: 15.00,
    image: 'book_12.png', // Original popular book #4
    categoryName: 'Fiction',
    stock: 18,
    minStockLevel: 6,
    publisherName: 'Macmillan Publishers'
  },
  {
    name: 'Giant\'s Treasure',
    description_en: 'An exciting journey to outsmart a giant and find treasure.',
    description_ar: 'رحلة مثيرة للتغلب على عملاق والعثور على الكنز.',
    price: 10.00,
    image: 'book_16.png', // Original popular book #5
    categoryName: 'Fiction',
    stock: 0, // Out of stock for demo
    minStockLevel: 4,
    publisherName: 'Simon & Schuster'
  },
  // New Arrivals (last 4) - matching NewArrivalsData.jsx images and descriptions  
  {
    name: 'Survival Tale',
    description_en: 'A gripping tale of survival in uncharted lands.',
    description_ar: 'حكاية مثيرة عن البقاء في أراضٍ مجهولة.',
    price: 18.99,
    image: 'book_11.png', // Original new arrival #1
    categoryName: 'Fiction',
    stock: 15,
    minStockLevel: 5,
    publisherName: 'Hachette Book Group'
  },
  {
    name: 'Enchanted Stories',
    description_en: 'A collection of enchanting stories full of wonder.',
    description_ar: 'مجموعة من القصص الساحرة المليئة بالعجائب.',
    price: 14.50,
    image: 'book_13.png', // Original new arrival #2
    categoryName: 'Fiction',
    stock: 2, // Low stock
    minStockLevel: 6,
    publisherName: 'Penguin Random House'
  },
  {
    name: 'Time Journey',
    description_en: 'Embark on a journey through time to save humanity.',
    description_ar: 'انطلق في رحلة عبر الزمن لإنقاذ البشرية.',
    price: 22.00,
    image: 'book_18.png', // Original new arrival #3
    categoryName: 'Science Fiction',
    stock: 12,
    minStockLevel: 4,
    publisherName: 'HarperCollins Publishers'
  },
  {
    name: 'Forest Secrets',
    description_en: 'Unravel secrets hidden deep within a mysterious forest.',
    description_ar: 'اكتشف الأسرار المخفية في أعماق غابة غامضة.',
    price: 19.99,
    image: 'book_22.png', // Original new arrival #4
    categoryName: 'Mystery',
    stock: 8,
    minStockLevel: 5,
    publisherName: 'Macmillan Publishers'
  },
  // Additional Books
  {
    name: 'The Great Gatsby',
    description_en: 'A classic American novel set in the Jazz Age',
    description_ar: 'رواية أمريكية كلاسيكية تدور أحداثها في عصر الجاز',
    price: 15.99,
    image: 'book_1.png',
    categoryName: 'Fiction',
    stock: 30,
    minStockLevel: 10,
    publisherName: 'Simon & Schuster'
  },
  {
    name: 'To Kill a Mockingbird',
    description_en: 'A powerful story of racial injustice and childhood',
    description_ar: 'قصة قوية عن الظلم العنصري والطفولة',
    price: 14.50,
    image: 'book_2.png',
    categoryName: 'Fiction'
  },
  {
    name: 'Pride and Prejudice',
    description_en: 'Jane Austen\'s beloved romantic classic',
    description_ar: 'تحفة جين أوستن الرومانسية المحبوبة',
    price: 12.99,
    image: 'book_3.png',
    categoryName: 'Romance'
  },
  {
    name: 'Gone Girl',
    description_en: 'A psychological thriller about a missing wife',
    description_ar: 'رواية نفسية مثيرة عن زوجة مفقودة',
    price: 15.25,
    image: 'book_6.png',
    categoryName: 'Mystery'
  },
  // Science Fiction Books
  {
    name: 'Dune',
    description_en: 'Epic space opera set on the desert planet Arrakis',
    description_ar: 'ملحمة فضائية عظيمة تدور على كوكب أراكيس الصحراوي',
    price: 18.99,
    image: 'book_7.png',
    categoryName: 'Science Fiction'
  },
  {
    name: 'The Martian',
    description_en: 'Survival story of an astronaut stranded on Mars',
    description_ar: 'قصة بقاء رائد فضاء عالق على المريخ',
    price: 14.99,
    image: 'book_8.png',
    categoryName: 'Science Fiction'
  },
  // Biography Books
  {
    name: 'Steve Jobs',
    description_en: 'The official biography of Apple\'s co-founder',
    description_ar: 'السيرة الذاتية الرسمية لمؤسس شركة أبل',
    price: 19.99,
    image: 'book_9.png',
    categoryName: 'Biography'
  },
  {
    name: 'Becoming',
    description_en: 'Michelle Obama\'s inspiring memoir',
    description_ar: 'مذكرات ميشيل أوباما الملهمة',
    price: 17.50,
    image: 'book_10.png',
    categoryName: 'Biography'
  },
  // Technology Books
  {
    name: 'Clean Code',
    description_en: 'A handbook of agile software craftsmanship',
    description_ar: 'دليل لحرفية البرمجيات المرنة',
    price: 24.99,
    image: 'book_24.png',
    categoryName: 'Technology'
  },
  {
    name: 'The Pragmatic Programmer',
    description_en: 'Your journey to mastery in programming',
    description_ar: 'رحلتك نحو إتقان البرمجة',
    price: 22.75,
    image: 'book_25.png',
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
// NOTIFICATIONS DATA
// =============================================================================
const notifications = [
  {
    title: 'Welcome to BookHub!',
    message: 'Thank you for joining our community. Explore thousands of books!',
    titleAr: 'مرحباً بك في بوك هاب!',
    messageAr: 'شكراً لانضمامك إلى مجتمعنا. استكشف آلاف الكتب!',
    type: 'general',
    priority: 'medium',
    isActive: true,
    targetAudience: 'new_customers',
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'First Time Buyer Discount!',
    message: 'Get 15% off your first order with code WELCOME15',
    titleAr: 'خصم أول مشترٍ!',
    messageAr: 'احصل على خصم 15% على طلبك الأول برمز WELCOME15',
    type: 'promotion',
    priority: 'high',
    isActive: true,
    targetAudience: 'new_customers',
    promotionData: {
      discountPercentage: 15,
      promoCode: 'WELCOME15',
      actionUrl: '/shop',
      actionText: 'Shop Now'
    },
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  {
    title: 'Summer Reading Sale!',
    message: 'Hot deals on fiction books - 25% off with code SUMMER25!',
    titleAr: 'تخفيضات القراءة الصيفية!',
    messageAr: 'عروض رائعة على كتب الخيال - خصم 25% برمز SUMMER25!',
    type: 'promotion',
    priority: 'high',
    isActive: true,
    targetAudience: 'all',
    promotionData: {
      discountPercentage: 25,
      promoCode: 'SUMMER25',
      actionUrl: '/categories/fiction',
      actionText: 'Browse Fiction'
    },
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
  },
  {
    title: 'Loyalty Member Special',
    message: 'Exclusive 15% discount for our Gold members!',
    titleAr: 'عرض خاص لأعضاء الولاء',
    messageAr: 'خصم حصري 15% لأعضائنا الذهبيين!',
    type: 'promotion',
    priority: 'high',
    isActive: true,
    targetAudience: 'returning_customers',
    promotionData: {
      discountPercentage: 15,
      promoCode: 'GOLD15',
      actionUrl: '/shop',
      actionText: 'Shop with Discount'
    },
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
  },
  {
    title: 'Order Status Update',
    message: 'Your order has been shipped and is on its way!',
    titleAr: 'تحديث حالة الطلب',
    messageAr: 'تم شحن طلبك وهو في الطريق إليك!',
    type: 'order',
    priority: 'medium',
    isActive: true,
    targetAudience: 'all',
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    title: 'System Maintenance Notice',
    message: 'Scheduled maintenance on Sunday 2AM-4AM. Service may be temporarily unavailable.',
    titleAr: 'إشعار صيانة النظام',
    messageAr: 'صيانة مجدولة يوم الأحد من 2 ص إلى 4 ص. قد تكون الخدمة غير متاحة مؤقتاً.',
    type: 'system',
    priority: 'urgent',
    isActive: true,
    targetAudience: 'all',
    scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
  }
];

// =============================================================================
// PROMOTIONS DATA
// =============================================================================
const promotions = [
  {
    name: 'First Time Buyer Discount',
    description: 'Welcome! Get 15% off your first order',
    type: 'first_time_buyer',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscountAmount: 50,
    promoCode: 'WELCOME15',
    autoApply: true,
    minOrderAmount: 25,
    maxUsagePerUser: 1,
    totalUsageLimit: 1000,
    targetAudience: 'new_customers',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    isActive: true
  },
  {
    name: 'Silver Member Discount',
    description: 'Exclusive 5% discount for Silver members',
    type: 'loyalty_tier',
    discountType: 'percentage',
    discountValue: 5,
    autoApply: true,
    maxUsagePerUser: 1,
    targetAudience: 'loyalty_tier',
    loyaltyTierRequired: 'silver',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: 'Gold Member Discount',
    description: 'Exclusive 10% discount for Gold members',
    type: 'loyalty_tier',
    discountType: 'percentage',
    discountValue: 10,
    autoApply: true,
    maxUsagePerUser: 1,
    targetAudience: 'loyalty_tier',
    loyaltyTierRequired: 'gold',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: 'Platinum Member Discount',
    description: 'Exclusive 15% discount for Platinum members',
    type: 'loyalty_tier',
    discountType: 'percentage',
    discountValue: 15,
    autoApply: true,
    maxUsagePerUser: 1,
    targetAudience: 'loyalty_tier',
    loyaltyTierRequired: 'platinum',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: 'Summer Reading Sale',
    description: 'Hot summer deals - 25% off all fiction books!',
    type: 'special_campaign',
    discountType: 'percentage',
    discountValue: 25,
    promoCode: 'SUMMER25',
    minOrderAmount: 30,
    maxUsagePerUser: 3,
    totalUsageLimit: 500,
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    isActive: true
  },
  {
    name: 'Back to School Special',
    description: 'Student discount - $10 off orders over $50',
    type: 'special_campaign',
    discountType: 'fixed_amount',
    discountValue: 10,
    promoCode: 'STUDENT10',
    minOrderAmount: 50,
    maxUsagePerUser: 2,
    totalUsageLimit: 200,
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    isActive: true
  },
  {
    name: 'Free Shipping Friday',
    description: 'Free shipping on all orders this Friday!',
    type: 'special_campaign',
    discountType: 'free_shipping',
    discountValue: 0,
    promoCode: 'FREESHIP',
    autoApply: false,
    maxUsagePerUser: 1,
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true
  },
  {
    name: 'Bulk Order Discount',
    description: '20% off when you buy 5 or more books',
    type: 'bulk_discount',
    discountType: 'percentage',
    discountValue: 20,
    promoCode: 'BULK20',
    minOrderAmount: 75,
    maxUsagePerUser: 5,
    targetAudience: 'all',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true
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
      Conact.deleteMany({}),
      Publisher.deleteMany({}),
      Notification.deleteMany({}),
      Promotion.deleteMany({})
    ]);
    console.log('✅ All collections cleared');

    // 2. Create Publishers
    console.log('\n🏢 Creating publishers...');
    const createdPublishers = await Publisher.insertMany(publishers);
    console.log(`✅ Created ${createdPublishers.length} publishers`);

    // 3. Create Admin User
    console.log('\n👤 Creating admin user...');
    const adminUser = await User.create(admin);
    console.log(`✅ Admin created: ${adminUser.email}`);

    // 3. Create Sample Users (one by one to trigger password hashing)
    console.log('\n👥 Creating sample users...');
    const users = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✅ Created user: ${user.email}`);
    }
    console.log(`✅ Created ${users.length} sample users`);

    // 5. Create Categories
    console.log('\n📚 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 6. Create Products (linked to categories and publishers)
    console.log('\n📖 Creating products...');
    const products = [];
    for (const productTemplate of productsTemplate) {
      const category = createdCategories.find(cat => cat.name === productTemplate.categoryName);
      const publisher = createdPublishers.find(pub => pub.name === productTemplate.publisherName);
      
      if (category) {
        const product = {
          name: productTemplate.name,
          description_en: productTemplate.description_en,
          description_ar: productTemplate.description_ar,
          price: productTemplate.price,
          image: productTemplate.image,
          categoryId: category._id,
          stock: productTemplate.stock || Math.floor(Math.random() * 50) + 10, // Random stock 10-60 if not specified
          minStockLevel: productTemplate.minStockLevel || Math.floor(Math.random() * 5) + 3, // Random min level 3-8 if not specified
          publisherEmail: publisher ? publisher.email : undefined
        };
        products.push(product);
      }
    }
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // 7. Create Reviews (linked to users)
    console.log('\n⭐ Creating reviews...');
    const reviews = reviewsTemplate.map(reviewTemplate => ({
      ...reviewTemplate,
      userId: users[Math.floor(Math.random() * users.length)]._id
    }));
    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // 8. Create Sample Orders (linked to users and products)
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
      
      // Calculate subtotal and discounts
      const subtotal = total;
      const discountAmount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 30% chance of 10% discount
      const finalTotal = subtotal - discountAmount;
      
      orders.push({
        userId: user._id,
        cart: cart,
        subtotal: subtotal,
        discountAmount: discountAmount,
        total: finalTotal,
        loyaltyPointsEarned: Math.floor(finalTotal * 0.1), // 1 point per 10 units spent
        loyaltyPointsUsed: 0,
        isFirstPurchase: Math.random() > 0.8, // 20% chance of being first purchase
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

    // 9. Create Contact Requests
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

    // 10. Create Promotions
    console.log('\n🎯 Creating promotions...');
    const promotionsWithCreator = promotions.map(promo => {
      const cleanPromo = {
        ...promo,
        createdBy: adminUser._id
      };
      
      // Only include loyaltyTierRequired for loyalty_tier type promotions
      if (promo.type !== 'loyalty_tier' && cleanPromo.loyaltyTierRequired === undefined) {
        delete cleanPromo.loyaltyTierRequired;
      }
      
      return cleanPromo;
    });
    const createdPromotions = await Promotion.insertMany(promotionsWithCreator);
    console.log(`✅ Created ${createdPromotions.length} promotions`);

    // 11. Create Notifications
    console.log('\n🔔 Creating notifications...');
    const notificationsWithCreator = notifications.map(notif => ({
      ...notif,
      createdBy: adminUser._id
    }));
    const createdNotifications = await Notification.insertMany(notificationsWithCreator);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // 10. Display Summary
    console.log('\n' + '=' * 60);
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('=' * 60);
    console.log(`👤 Admin Users: 1`);
    console.log(`👥 Regular Users: ${users.length}`);
    console.log(`🏢 Publishers: ${createdPublishers.length}`);
    console.log(`📚 Categories: ${createdCategories.length}`);
    console.log(`📖 Products: ${createdProducts.length}`);
    console.log(`🛒 Orders: ${createdOrders.length}`);
    console.log(`⭐ Reviews: ${createdReviews.length}`);
    console.log(`📧 Contact Requests: ${createdRequests.length}`);
    console.log(`🎯 Promotions: ${createdPromotions.length}`);
    console.log(`🔔 Notifications: ${createdNotifications.length}`);

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

    // Inventory statistics
    const inventoryStats = {
      totalStock: createdProducts.reduce((sum, p) => sum + p.stock, 0),
      outOfStock: createdProducts.filter(p => p.stock === 0).length,
      lowStock: createdProducts.filter(p => p.stock <= p.minStockLevel).length,
      averageStock: Math.round(createdProducts.reduce((sum, p) => sum + p.stock, 0) / createdProducts.length),
      totalValue: createdProducts.reduce((sum, p) => sum + (p.stock * p.price), 0)
    };

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

    console.log('\nInventory:');
    console.log(`   Total Stock: ${inventoryStats.totalStock} units`);
    console.log(`   Out of Stock: ${inventoryStats.outOfStock} products`);
    console.log(`   Low Stock: ${inventoryStats.lowStock} products`);
    console.log(`   Average Stock per Product: ${inventoryStats.averageStock} units`);
    console.log(`   Total Inventory Value: $${inventoryStats.totalValue.toFixed(2)}`);

    console.log(`\nRevenue: $${totalRevenue.toFixed(2)}`);

    // Inventory Statistics
    const lowStockProducts = createdProducts.filter(p => p.stock <= p.minStockLevel);
    const outOfStockProducts = createdProducts.filter(p => p.stock === 0);
    const totalInventoryValue = createdProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
    
    console.log('\n📦 INVENTORY STATISTICS');
    console.log('─'.repeat(30));
    console.log(`Total Products: ${createdProducts.length}`);
    console.log(`Low Stock Products: ${lowStockProducts.length}`);
    console.log(`Out of Stock Products: ${outOfStockProducts.length}`);
    console.log(`Total Inventory Value: $${totalInventoryValue.toFixed(2)}`);
    
    if (lowStockProducts.length > 0) {
      console.log('\n🚨 LOW STOCK ALERTS:');
      lowStockProducts.forEach(product => {
        console.log(`   ⚠️  ${product.name}: ${product.stock}/${product.minStockLevel} units`);
      });
    }

    console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('All admin features now have realistic data to work with.');
    console.log('\n🚀 PROMOTION & LOYALTY SYSTEM READY:');
    console.log('─'.repeat(40));
    console.log('• First-time buyer discounts available');
    console.log('• Loyalty tier system with 4 tiers');
    console.log('• Special campaigns and seasonal promotions');
    console.log('• Login notifications for promotions');
    console.log('• Admin can manage all promotions at /admin/promotions');
    console.log('• Users will see notifications when they log in');
    console.log('• Automatic discount application during checkout');

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
