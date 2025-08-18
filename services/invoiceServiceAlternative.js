const { JSDOM } = require('jsdom');

class InvoiceServiceAlternative {
  constructor() {
    this.companyInfo = {
      name: "Book Store",
      address: "123 Book Street, Reading City",
      phone: "+1 (555) 123-4567",
      email: "info@bookstore.com",
      website: "www.bookstore.com"
    };
  }

  /**
   * Generate invoice HTML template (same as before)
   * @param {Object} order - Order object with all details
   * @param {Object} user - User object
   * @returns {String} HTML template
   */
  generateInvoiceHTML(order, user) {
    console.log('Generating invoice HTML for order:', order._id);
    console.log('User data received:', user);
    
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString();
    const orderId = order._id || order.id;
    const invoiceNumber = `INV-${orderId ? orderId.toString().slice(-8).toUpperCase() : 'UNKNOWN'}`;
    
    // Ensure user data is available
    const userData = user || {};
    const userName = userData.name || 'Customer';
    const userEmail = userData.email || 'No email provided';
    const userPhone = userData.phone || 'No phone provided';
    
    // Calculate totals
    const subtotal = order.cart ? order.cart.reduce((sum, item) => sum + (item.price * item.amount), 0) : 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = order.total || subtotal + tax;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                padding: 20px;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
                border: 1px solid #ddd;
            }
            
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #8e44ad;
            }
            
            .company-info {
                flex: 1;
            }
            
            .company-info h1 {
                color: #8e44ad;
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .company-info p {
                margin: 5px 0;
                color: #666;
            }
            
            .invoice-details {
                text-align: right;
                flex: 1;
            }
            
            .invoice-details h2 {
                color: #8e44ad;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .invoice-details p {
                margin: 5px 0;
                font-size: 16px;
            }
            
            .customer-section {
                margin: 30px 0;
                display: flex;
                justify-content: space-between;
            }
            
            .bill-to, .ship-to {
                flex: 1;
                margin-right: 20px;
            }
            
            .bill-to h3, .ship-to h3 {
                color: #8e44ad;
                margin-bottom: 10px;
                font-size: 18px;
            }
            
            .customer-details p {
                margin: 5px 0;
                color: #555;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .items-table th {
                background: #8e44ad;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }
            
            .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .items-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .totals-section {
                margin-top: 30px;
                float: right;
                width: 300px;
            }
            
            .totals-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .totals-table td {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .totals-table .total-row {
                background: #8e44ad;
                color: white;
                font-weight: bold;
                font-size: 18px;
            }
            
            .payment-info {
                margin-top: 40px;
                clear: both;
                padding-top: 20px;
                border-top: 1px solid #ddd;
            }
            
            .payment-info h3 {
                color: #8e44ad;
                margin-bottom: 10px;
            }
            
            .status-badge {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
            }
            
            .status-wating { background-color: #f39c12; }
            .status-preparing { background-color: #3498db; }
            .status-dlivery { background-color: #9b59b6; }
            .status-done { background-color: #27ae60; }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
                <div class="company-info">
                    <h1>${this.companyInfo.name}</h1>
                    <p>${this.companyInfo.address}</p>
                    <p>Phone: ${this.companyInfo.phone}</p>
                    <p>Email: ${this.companyInfo.email}</p>
                    <p>Website: ${this.companyInfo.website}</p>
                </div>
                <div class="invoice-details">
                    <h2>INVOICE</h2>
                    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p><strong>Date:</strong> ${invoiceDate}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
                </div>
            </div>
            
            <!-- Customer Information -->
            <div class="customer-section">
                <div class="bill-to">
                    <h3>Bill To:</h3>
                    <div class="customer-details">
                        <p><strong>${userName}</strong></p>
                        <p>${userEmail}</p>
                        <p>${userPhone}</p>
                    </div>
                </div>
                <div class="ship-to">
                    <h3>Ship To:</h3>
                    <div class="customer-details">
                        <p>${order.address ? order.address.street : 'No address provided'}</p>
                        <p>${order.address ? order.address.region : ''}</p>
                        <p>${order.address ? order.address.descreption : ''}</p>
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.cart || []).map(item => `
                        <tr>
                            <td>
                                <strong>${item.productId?.name || 'Product'}</strong>
                                <br>
                                <small style="color: #666;">${item.productId?.description || ''}</small>
                            </td>
                            <td class="text-center">${item.amount || 0}</td>
                            <td class="text-right">$${(item.price || 0).toFixed(2)}</td>
                            <td class="text-right">$${((item.price || 0) * (item.amount || 0)).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">$${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax (10%):</td>
                        <td class="text-right">$${tax.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total:</td>
                        <td class="text-right">$${total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Payment Information -->
            <div class="payment-info">
                <h3>Payment Information</h3>
                <p><strong>Payment Method:</strong> ${(order.methodePayment === 'cash') ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated invoice. No signature required.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate simple text-based invoice (fallback for areas with restrictions)
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @returns {String} Text invoice
   */
  generateTextInvoice(order, user) {
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString();
    const orderId = order._id || order.id;
    const invoiceNumber = `INV-${orderId ? orderId.toString().slice(-8).toUpperCase() : 'UNKNOWN'}`;
    
    const userData = user || {};
    const userName = userData.name || 'Customer';
    const userEmail = userData.email || 'No email provided';
    const userPhone = userData.phone || 'No phone provided';
    
    const subtotal = order.cart ? order.cart.reduce((sum, item) => sum + (item.price * item.amount), 0) : 0;
    const tax = subtotal * 0.1;
    const total = order.total || subtotal + tax;

    let textInvoice = `
===============================================
                INVOICE
===============================================

Company: ${this.companyInfo.name}
Address: ${this.companyInfo.address}
Phone: ${this.companyInfo.phone}
Email: ${this.companyInfo.email}

-----------------------------------------------

Invoice #: ${invoiceNumber}
Date: ${invoiceDate}
Status: ${order.status.toUpperCase()}

-----------------------------------------------
BILL TO:
${userName}
${userEmail}
${userPhone}

-----------------------------------------------
SHIP TO:
${order.address ? order.address.street : 'No address provided'}
${order.address ? order.address.region : ''}
${order.address ? order.address.descreption : ''}

-----------------------------------------------
ITEMS:
-----------------------------------------------
`;

    // Add items
    (order.cart || []).forEach(item => {
      const itemTotal = (item.price || 0) * (item.amount || 0);
      textInvoice += `${item.productId?.name || 'Product'} x${item.amount || 0} @ $${(item.price || 0).toFixed(2)} = $${itemTotal.toFixed(2)}\n`;
    });

    textInvoice += `
-----------------------------------------------
Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}
-----------------------------------------------

Payment Method: ${(order.methodePayment === 'cash') ? 'Cash on Delivery' : 'Bank Transfer'}
Order ID: ${orderId || 'N/A'}

Thank you for your business!
===============================================
`;

    return textInvoice;
  }

  /**
   * Generate invoice without external dependencies
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @param {String} format - 'html' or 'text'
   * @returns {String} Invoice content
   */
  async generateInvoice(order, user, format = 'html') {
    try {
      if (format === 'text') {
        return this.generateTextInvoice(order, user);
      } else {
        return this.generateInvoiceHTML(order, user);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }
}

module.exports = new InvoiceServiceAlternative();
