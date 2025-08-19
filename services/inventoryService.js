const Product = require('../models/productModel');
const Publisher = require('../models/publisherModel');
const Email = require('../config/email');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class InventoryService {
  
  // Check if product has sufficient stock
  static async checkStock(productId, requestedQuantity) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    return {
      available: product.stock >= requestedQuantity,
      currentStock: product.stock,
      requested: requestedQuantity,
      product: product
    };
  }
  
  // Reduce stock when order is placed
  static async reduceStock(productId, quantity) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.stock < quantity) {
      throw new AppError(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`, 400);
    }
    
    product.stock -= quantity;
    await product.save();
    
    // Check if stock is below minimum level
    if (product.stock <= product.minStockLevel) {
      await this.triggerLowStockAlert(product);
    }
    
    return product;
  }
  
  // Restore stock (in case of order cancellation)
  static async restoreStock(productId, quantity) {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    );
    
    return product;
  }
  
  // Get low stock products
  static async getLowStockProducts() {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$minStockLevel'] }
    }).populate('categoryId', 'name');
    
    return products;
  }
  
  // Get out of stock products
  static async getOutOfStockProducts() {
    const products = await Product.find({ stock: 0 }).populate('categoryId', 'name');
    return products;
  }
  
  // Trigger low stock alert
  static async triggerLowStockAlert(product) {
    try {
      console.log(`🚨 LOW STOCK ALERT: ${product.name} - Stock: ${product.stock}, Min Level: ${product.minStockLevel}`);
      
      // If product has publisher email, send reorder notification
      if (product.publisherEmail) {
        await this.sendReorderNotification(product);
      }
      
      // Here you can add other notification methods like:
      // - Admin dashboard notifications
      // - Slack/Discord notifications
      // - SMS alerts
      
    } catch (error) {
      console.error('Error triggering low stock alert:', error);
    }
  }
  
  // Send email to publisher for reorder
  static async sendReorderNotification(product) {
    try {
      const subject = `Low Stock Alert - Reorder Request for "${product.name}"`;
      const reorderQuantity = Math.max(product.minStockLevel * 3, 50); // Suggest reorder quantity
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">📚 Low Stock Alert - Reorder Required</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Product Information</h3>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Current Stock:</strong> <span style="color: #e74c3c; font-weight: bold;">${product.stock} units</span></p>
            <p><strong>Minimum Level:</strong> ${product.minStockLevel} units</p>
            <p><strong>Suggested Reorder Quantity:</strong> <span style="color: #27ae60; font-weight: bold;">${reorderQuantity} units</span></p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Action Required</h4>
            <p style="color: #856404; margin-bottom: 0;">
              The stock level for "${product.name}" has fallen below the minimum threshold. 
              Please prepare a new shipment to avoid stockouts.
            </p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated notification from BookStore Inventory Management System.<br>
              Please contact our procurement team if you have any questions.
            </p>
          </div>
          
          <div style="border-top: 1px solid #dee2e6; padding-top: 20px; color: #6c757d; font-size: 12px;">
            <p><strong>BookStore Management</strong><br>
            Email: procurement@bookstore.com<br>
            Phone: +1 (555) 123-4567</p>
          </div>
        </div>
      `;
      
      // Create a temporary user object for the email service
      const publisherUser = {
        email: product.publisherEmail,
        name: 'Publisher'
      };
      
      // Since we don't have a direct HTML email method, we'll use nodemailer directly
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@bookstore.com',
        to: product.publisherEmail,
        subject: subject,
        html: emailContent,
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Reorder notification sent to ${product.publisherEmail} for ${product.name}`);
      
    } catch (error) {
      console.error('Error sending reorder notification:', error);
    }
  }
  
  // Get inventory statistics for admin dashboard
  static async getInventoryStats() {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minStockLevel'] }
    });
    const inStockProducts = totalProducts - outOfStock;
    
    // Calculate total stock quantity across all products
    const totalStockQuantity = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' }
        }
      }
    ]);
    
    const totalValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      }
    ]);
    
    return {
      totalProducts,
      inStockProducts, // Number of products with stock > 0
      totalStockQuantity: totalStockQuantity[0]?.totalStock || 0, // Total quantity of all books
      outOfStock,
      lowStock,
      totalInventoryValue: totalValue[0]?.total || 0
    };
  }
  
  // Bulk update stock levels
  static async bulkUpdateStock(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.productId },
        update: { $set: { stock: update.newStock } }
      }
    }));
    
    const result = await Product.bulkWrite(operations);
    return result;
  }
}

module.exports = InventoryService;
