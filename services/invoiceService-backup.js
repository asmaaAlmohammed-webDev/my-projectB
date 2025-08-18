const fs = require('fs').promises;
const path = require('path');

class InvoiceService {
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
   * Generate invoice HTML template with i18n support
   * @param {Object} order - Order object with all details
   * @param {Object} user - User object
   * @param {String} language - Language code ('en' or 'ar')
   * @returns {String} HTML template
   */
  generateInvoiceHTML(order, user, language = 'en') {
    console.log('Generating invoice HTML for order:', order._id);
    console.log('User data received:', user);
    console.log('Language:', language);
    
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

    // RTL support for Arabic
    const isRTL = language === 'ar';
    const direction = isRTL ? 'rtl' : 'ltr';
    const textAlign = isRTL ? 'right' : 'left';
    const reverseAlign = isRTL ? 'left' : 'right';

    // Translations
    const translations = {
      en: {
        invoice: 'INVOICE',
        invoiceNumber: 'Invoice #',
        date: 'Date',
        status: 'Status',
        billTo: 'Bill To',
        shipTo: 'Ship To',
        item: 'Item',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax (10%)',
        paymentInfo: 'Payment Information',
        paymentMethod: 'Payment Method',
        orderId: 'Order ID',
        cashOnDelivery: 'Cash on Delivery',
        bankTransfer: 'Bank Transfer',
        thankYou: 'Thank you for your business!',
        computerGenerated: 'This is a computer-generated invoice. No signature required.'
      },
      ar: {
        invoice: 'فاتورة',
        invoiceNumber: 'رقم الفاتورة',
        date: 'التاريخ',
        status: 'الحالة',
        billTo: 'إرسال الفاتورة إلى',
        shipTo: 'الشحن إلى',
        item: 'العنصر',
        qty: 'الكمية',
        unitPrice: 'سعر الوحدة',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة (10%)',
        paymentInfo: 'معلومات الدفع',
        paymentMethod: 'طريقة الدفع',
        orderId: 'رقم الطلب',
        cashOnDelivery: 'الدفع عند التسليم',
        bankTransfer: 'تحويل بنكي',
        thankYou: 'شكراً لك على تعاملك معنا!',
        computerGenerated: 'هذه فاتورة مُولّدة بواسطة الكمبيوتر. لا توقيع مطلوب.'
      }
    };

    const t = translations[language] || translations.en;

    return `
    <!DOCTYPE html>
    <html lang="${language}" dir="${direction}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.invoice} ${invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: ${isRTL ? "'Arial', 'Tahoma', 'DejaVu Sans', sans-serif" : "'Arial', sans-serif"};
                line-height: 1.6;
                color: #333;
                background: #fff;
                direction: ${direction};
                text-align: ${textAlign};
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
            }
            
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #8e44ad;
                ${isRTL ? 'flex-direction: row-reverse;' : ''}
                gap: 60px;
            }
            
            .company-info {
                flex: 1;
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
                min-width: 0;
                max-width: 45%;
            }
            
            .company-info h1 {
                color: #8e44ad;
                font-size: 28px;
                margin-bottom: 10px;
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
            }
            
            .company-info p {
                margin: 5px 0;
                color: #666;
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
            }
            
            .invoice-details {
                flex: 1;
                ${isRTL ? 'text-align: left;' : 'text-align: right;'}
                min-width: 0;
                max-width: 45%;
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
                ${isRTL ? 'flex-direction: row-reverse;' : ''}
                gap: 20px;
            }
            
            .bill-to, .ship-to {
                flex: 1;
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
                min-width: 0;
            }
            
            .bill-to h3, .ship-to h3 {
                color: #8e44ad;
                margin-bottom: 10px;
                font-size: 18px;
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
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
                text-align: ${textAlign};
                font-weight: 600;
            }
            
            .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
                text-align: ${textAlign};
            }
            
            .items-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .items-table tr:hover {
                background: #f5f5f5;
            }
            
            .text-right {
                text-align: ${reverseAlign} !important;
            }
            
            .text-center {
                text-align: center !important;
            }
            
            .totals-section {
                margin-top: 30px;
                float: ${reverseAlign};
                width: 300px;
            }
            
            .totals-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .totals-table td {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                text-align: ${textAlign};
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
            
            @media print {
                .invoice-container {
                    padding: 20px;
                }
                
                .no-print {
                    display: none !important;
                }
            }
            
            /* Mobile responsive for RTL */
            @media (max-width: 768px) {
                .invoice-header {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .invoice-details {
                    ${isRTL ? 'text-align: right;' : 'text-align: left;'}
                }
                
                .customer-section {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .bill-to, .ship-to {
                    ${isRTL ? 'text-align: right;' : 'text-align: left;'}
                }
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
                    <p>${isRTL ? 'الهاتف' : 'Phone'}: ${this.companyInfo.phone}</p>
                    <p>${isRTL ? 'البريد الإلكتروني' : 'Email'}: ${this.companyInfo.email}</p>
                    <p>${isRTL ? 'الموقع' : 'Website'}: ${this.companyInfo.website}</p>
                </div>
                <div class="invoice-details">
                    <h2>${t.invoice}</h2>
                    <p><strong>${t.invoiceNumber}:</strong> ${invoiceNumber}</p>
                    <p><strong>${t.date}:</strong> ${invoiceDate}</p>
                    <p><strong>${t.status}:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
                </div>
            </div>
            
            <!-- Customer Information -->
            <div class="customer-section">
                <div class="bill-to">
                    <h3>${t.billTo}:</h3>
                    <div class="customer-details">
                        <p><strong>${userName}</strong></p>
                        <p>${userEmail}</p>
                        <p>${userPhone}</p>
                    </div>
                </div>
                <div class="ship-to">
                    <h3>${t.shipTo}:</h3>
                    <div class="customer-details">
                        <p>${order.address ? order.address.street : (isRTL ? 'لا يوجد عنوان' : 'No address provided')}</p>
                        <p>${order.address ? order.address.region : ''}</p>
                        <p>${order.address ? order.address.descreption : ''}</p>
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>${t.item}</th>
                        <th class="text-center">${t.qty}</th>
                        <th class="text-right">${t.unitPrice}</th>
                        <th class="text-right">${t.total}</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.cart || []).map(item => `
                        <tr>
                            <td>
                                <strong>${item.productId?.name || (isRTL ? 'منتج' : 'Product')}</strong>
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
                        <td>${t.subtotal}:</td>
                        <td class="text-right">$${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>${t.tax}:</td>
                        <td class="text-right">$${tax.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>${t.total}:</td>
                        <td class="text-right">$${total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Payment Information -->
            <div class="payment-info">
                <h3>${t.paymentInfo}</h3>
                <p><strong>${t.paymentMethod}:</strong> ${(order.methodePayment === 'cash') ? t.cashOnDelivery : t.bankTransfer}</p>
                <p><strong>${t.orderId}:</strong> ${orderId || 'N/A'}</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>${t.thankYou}</p>
                <p>${t.computerGenerated}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new InvoiceService();
    `;
  }
}

module.exports = new InvoiceService();
    `;
  }

  /**
   * @param {String} html - HTML content
   * @returns {Buffer} PDF buffer
   */
  async generatePDF(html) {
    let browser = null;
    
    try {
      // Determine the correct Chrome executable path based on platform
      const os = require('os');
      const path = require('path');
      let executablePath;
      
      const platform = os.platform();
      if (platform === 'win32') {
        executablePath = path.resolve(process.env.PUPPETEER_EXECUTABLE_PATH_WIN || './binaries/chrome-win64/chrome.exe');
      } else if (platform === 'darwin') {
        executablePath = path.resolve(process.env.PUPPETEER_EXECUTABLE_PATH_MAC || './binaries/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      } else if (platform === 'linux') {
        executablePath = path.resolve(process.env.PUPPETEER_EXECUTABLE_PATH_LINUX || './binaries/chrome-linux64/chrome');
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      
      console.log(`Platform: ${platform}`);
      console.log(`Using Chrome binary at: ${executablePath}`);
      
      // Check if the executable exists
      const fs = require('fs');
      if (!fs.existsSync(executablePath)) {
        throw new Error(`Chrome executable not found at: ${executablePath}`);
      }
      
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: executablePath,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate invoice PDF for an order
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @returns {Buffer} PDF buffer
   */
  async generateInvoice(order, user) {
    const html = this.generateInvoiceHTML(order, user);
    return await this.generatePDF(html);
  }
}

module.exports = new InvoiceService();
