const Product = require('../models/productModel');
const Order = require('../models/orderModel');

/**
 * K-Means Service for Product Similarity Clustering
 * Clusters products based on price, category, popularity, and stock levels
 */
class KMeansService {
  
  /**
   * Calculate feature vector for a product
   * @param {Object} product - Product document
   * @param {Object} stats - Global statistics for normalization
   * @returns {Array} Feature vector [priceScore, categoryVector..., popularityScore, stockScore]
   */
  static calculateProductFeatures(product, stats) {
    const features = [];
    
    // 1. Price Score (normalized within category)
    const categoryStats = stats.categoryStats[product.categoryId.name] || { avgPrice: product.price, maxPrice: product.price };
    const priceScore = Math.min(product.price / (categoryStats.maxPrice || 1), 1);
    features.push(priceScore);
    
    // 2. Category One-Hot Encoding (simplified to major categories)
    const majorCategories = ['Fiction', 'Science Fiction', 'Romance', 'History', 'Business', 'Technology', 'Education', 'Children'];
    majorCategories.forEach(category => {
      features.push(product.categoryId.name === category ? 1 : 0);
    });
    
    // 3. Popularity Score (based on order frequency)
    const popularityScore = Math.min((stats.productPopularity[product._id] || 0) / (stats.maxPopularity || 1), 1);
    features.push(popularityScore);
    
    // 4. Stock Level Score (normalized)
    const stockScore = Math.min(product.stock / (stats.maxStock || 1), 1);
    features.push(stockScore);
    
    // 5. Price Range Category (budget/mid/premium)
    const globalAvgPrice = stats.globalAvgPrice || 20;
    let priceRange = 0;
    if (product.price < globalAvgPrice * 0.7) priceRange = 1; // Budget
    else if (product.price < globalAvgPrice * 1.3) priceRange = 0.5; // Mid-range
    else priceRange = 0; // Premium
    features.push(priceRange);
    
    return features;
  }
  
  /**
   * Calculate Euclidean distance between two feature vectors
   */
  static calculateDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
  }
  
  /**
   * K-means clustering algorithm
   * @param {Array} dataPoints - Array of {product, features} objects
   * @param {Number} k - Number of clusters
   * @param {Number} maxIterations - Maximum iterations
   * @returns {Object} Clustering results
   */
  static async runKMeansClustering(dataPoints, k = 5, maxIterations = 100) {
    if (dataPoints.length < k) {
      k = Math.max(2, dataPoints.length);
    }
    
    const numFeatures = dataPoints[0].features.length;
    
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      const randomPoint = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      centroids.push([...randomPoint.features]);
    }
    
    let clusters = [];
    let iterations = 0;
    
    while (iterations < maxIterations) {
      // Assign points to nearest centroid
      clusters = Array(k).fill(null).map(() => []);
      
      dataPoints.forEach((point, pointIndex) => {
        let nearestCentroid = 0;
        let minDistance = Infinity;
        
        centroids.forEach((centroid, centroidIndex) => {
          const distance = this.calculateDistance(point.features, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCentroid = centroidIndex;
          }
        });
        
        clusters[nearestCentroid].push({
          ...point,
          distance: minDistance,
          index: pointIndex
        });
      });
      
      // Update centroids
      const newCentroids = [];
      for (let i = 0; i < k; i++) {
        if (clusters[i].length === 0) {
          // Keep old centroid if cluster is empty
          newCentroids.push([...centroids[i]]);
          continue;
        }
        
        const newCentroid = Array(numFeatures).fill(0);
        clusters[i].forEach(point => {
          point.features.forEach((feature, featureIndex) => {
            newCentroid[featureIndex] += feature;
          });
        });
        
        // Average the features
        newCentroid.forEach((sum, index) => {
          newCentroid[index] = sum / clusters[i].length;
        });
        
        newCentroids.push(newCentroid);
      }
      
      // Check for convergence
      let converged = true;
      for (let i = 0; i < k; i++) {
        const distance = this.calculateDistance(centroids[i], newCentroids[i]);
        if (distance > 0.001) {
          converged = false;
          break;
        }
      }
      
      centroids = newCentroids;
      iterations++;
      
      if (converged) break;
    }
    
    return {
      clusters,
      centroids,
      iterations,
      converged: iterations < maxIterations
    };
  }
  
  /**
   * Get statistics needed for feature normalization
   */
  static async getGlobalStatistics() {
    // Get all products with category info
    const products = await Product.find({}).populate('categoryId', 'name');
    
    // Calculate category statistics
    const categoryStats = {};
    let globalMaxPrice = 0;
    let globalTotalPrice = 0;
    let maxStock = 0;
    
    products.forEach(product => {
      const categoryName = product.categoryId.name;
      
      // Track global stats
      globalMaxPrice = Math.max(globalMaxPrice, product.price);
      globalTotalPrice += product.price;
      maxStock = Math.max(maxStock, product.stock);
      
      // Track category stats
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          totalPrice: 0,
          count: 0,
          maxPrice: 0,
          products: []
        };
      }
      
      categoryStats[categoryName].totalPrice += product.price;
      categoryStats[categoryName].count++;
      categoryStats[categoryName].maxPrice = Math.max(categoryStats[categoryName].maxPrice, product.price);
      categoryStats[categoryName].products.push(product._id);
    });
    
    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].avgPrice = categoryStats[category].totalPrice / categoryStats[category].count;
    });
    
    // Get product popularity from orders
    const orderAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$cart' },
      {
        $group: {
          _id: '$cart.productId',
          totalOrders: { $sum: '$cart.amount' }
        }
      },
      { $sort: { totalOrders: -1 } }
    ]);
    
    const productPopularity = {};
    let maxPopularity = 0;
    
    orderAggregation.forEach(item => {
      productPopularity[item._id] = item.totalOrders;
      maxPopularity = Math.max(maxPopularity, item.totalOrders);
    });
    
    return {
      categoryStats,
      productPopularity,
      maxPopularity,
      maxStock,
      globalAvgPrice: globalTotalPrice / products.length,
      totalProducts: products.length
    };
  }
  
  /**
   * Find similar products for a given product
   * @param {String} productId - Product ID to find similarities for
   * @param {Number} limit - Number of similar products to return
   * @returns {Array} Array of similar products
   */
  static async findSimilarProducts(productId, limit = 6) {
    try {
      // Get the target product
      const targetProduct = await Product.findById(productId).populate('categoryId', 'name');
      if (!targetProduct) {
        throw new Error('Product not found');
      }
      
      // Get all products for clustering
      const allProducts = await Product.find({
        _id: { $ne: productId } // Exclude the target product
      }).populate('categoryId', 'name');
      
      if (allProducts.length < 3) {
        // Not enough products for meaningful clustering, return category-based recommendations
        return await this.getCategoryBasedRecommendations(targetProduct, limit);
      }
      
      // Get global statistics
      const stats = await this.getGlobalStatistics();
      
      // Calculate features for all products including target
      const allProductsWithTarget = [targetProduct, ...allProducts];
      const dataPoints = allProductsWithTarget.map(product => ({
        product,
        features: this.calculateProductFeatures(product, stats)
      }));
      
      // Run K-means clustering
      const numClusters = Math.min(5, Math.floor(allProducts.length / 3));
      const clusterResult = await this.runKMeansClustering(dataPoints, numClusters);
      
      // Find which cluster contains our target product
      let targetClusterIndex = -1;
      let targetProductInCluster = null;
      
      clusterResult.clusters.forEach((cluster, clusterIndex) => {
        const targetInThisCluster = cluster.find(item => 
          item.product._id.toString() === productId
        );
        if (targetInThisCluster) {
          targetClusterIndex = clusterIndex;
          targetProductInCluster = targetInThisCluster;
        }
      });
      
      if (targetClusterIndex === -1 || clusterResult.clusters[targetClusterIndex].length < 2) {
        // Target product not found in any cluster or cluster too small
        return await this.getCategoryBasedRecommendations(targetProduct, limit);
      }
      
      // Get similar products from the same cluster (excluding target product)
      const similarProducts = clusterResult.clusters[targetClusterIndex]
        .filter(item => item.product._id.toString() !== productId)
        .sort((a, b) => a.distance - b.distance) // Sort by similarity (lower distance = more similar)
        .slice(0, limit)
        .map(item => ({
          ...item.product.toObject(),
          similarityScore: Math.max(0, 1 - (item.distance / 2)), // Convert distance to similarity score (0-1)
          clusterInfo: {
            clusterId: targetClusterIndex,
            totalInCluster: clusterResult.clusters[targetClusterIndex].length,
            reason: 'Similar features and characteristics'
          }
        }));
      
      // If we don't have enough similar products, supplement with category-based
      if (similarProducts.length < limit) {
        const categoryRecommendations = await this.getCategoryBasedRecommendations(
          targetProduct, 
          limit - similarProducts.length
        );
        
        // Avoid duplicates
        const existingIds = similarProducts.map(p => p._id.toString());
        const additionalProducts = categoryRecommendations.filter(p => 
          !existingIds.includes(p._id.toString())
        );
        
        similarProducts.push(...additionalProducts);
      }
      
      return similarProducts.slice(0, limit);
      
    } catch (error) {
      console.error('Error in K-means similarity search:', error);
      // Fallback to category-based recommendations
      const targetProduct = await Product.findById(productId).populate('categoryId', 'name');
      if (targetProduct) {
        return await this.getCategoryBasedRecommendations(targetProduct, limit);
      }
      return [];
    }
  }
  
  /**
   * Fallback: Category-based recommendations
   */
  static async getCategoryBasedRecommendations(targetProduct, limit) {
    const categoryProducts = await Product.find({
      categoryId: targetProduct.categoryId._id,
      _id: { $ne: targetProduct._id }
    }).populate('categoryId', 'name').limit(limit);
    
    return categoryProducts.map(product => ({
      ...product.toObject(),
      similarityScore: 0.7, // Fixed similarity score for category-based
      clusterInfo: {
        clusterId: 'category-based',
        reason: `Same category: ${targetProduct.categoryId.name}`
      }
    }));
  }
  
  /**
   * Batch update product clusters (can be run periodically)
   */
  static async updateProductClusters() {
    try {
      console.log('🔄 Starting product clustering update...');
      
      const allProducts = await Product.find({}).populate('categoryId', 'name');
      const stats = await this.getGlobalStatistics();
      
      const dataPoints = allProducts.map(product => ({
        product,
        features: this.calculateProductFeatures(product, stats)
      }));
      
      const numClusters = Math.min(8, Math.floor(allProducts.length / 4));
      const clusterResult = await this.runKMeansClustering(dataPoints, numClusters);
      
      console.log(`✅ Clustering completed: ${clusterResult.clusters.length} clusters, ${clusterResult.iterations} iterations`);
      
      // Here you could cache cluster results in Redis or database for faster access
      return {
        clustersCount: clusterResult.clusters.length,
        iterations: clusterResult.iterations,
        converged: clusterResult.converged,
        productsProcessed: allProducts.length
      };
      
    } catch (error) {
      console.error('❌ Error updating product clusters:', error);
      throw error;
    }
  }
}

module.exports = KMeansService;
