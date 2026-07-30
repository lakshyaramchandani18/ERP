const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

function getTemplateDir(baseDataDir) {
  const tDir = path.join(baseDataDir, 'Invoice Templates');
  if (!fs.existsSync(tDir)) {
    fs.mkdirSync(tDir, { recursive: true });
  }
  return tDir;
}

function getRegistryFile(baseDataDir) {
  const tDir = getTemplateDir(baseDataDir);
  const regPath = path.join(tDir, 'templates.json');
  if (!fs.existsSync(regPath)) {
    fs.writeFileSync(regPath, JSON.stringify([], null, 2));
  }
  return regPath;
}

function listCustomTemplates(baseDataDir) {
  const regPath = getRegistryFile(baseDataDir);
  try {
    const raw = fs.readFileSync(regPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveCustomTemplates(baseDataDir, templates) {
  const regPath = getRegistryFile(baseDataDir);
  fs.writeFileSync(regPath, JSON.stringify(templates, null, 2));
}

function saveUploadedTemplateFile({ baseDataDir, fileBase64, fileName, templateName, paperSize = 'A4', orientation = 'Portrait', notes = '' }) {
  const tDir = getTemplateDir(baseDataDir);
  const ext = path.extname(fileName).toLowerCase();
  const fileId = `custom_t_${Date.now()}`;
  const localFileName = `${fileId}${ext}`;
  const localFilePath = path.join(tDir, localFileName);

  const buffer = Buffer.from(fileBase64, 'base64');
  fs.writeFileSync(localFilePath, buffer);

  const templates = listCustomTemplates(baseDataDir);
  const newEntry = {
    id: fileId,
    name: templateName || fileName,
    fileName: localFileName,
    originalFileName: fileName,
    fileType: ext === '.pdf' ? 'pdf' : 'docx',
    uploadDate: new Date().toISOString(),
    paperSize,
    orientation,
    status: 'Active',
    notes,
    isDefault: templates.length === 0,
    fieldMappings: {},
  };

  templates.push(newEntry);
  saveCustomTemplates(baseDataDir, templates);

  return { success: true, template: newEntry };
}

function deleteCustomTemplate(baseDataDir, templateId) {
  const templates = listCustomTemplates(baseDataDir);
  const target = templates.find((t) => t.id === templateId);
  if (!target) return { success: false, error: 'Template not found' };

  const tDir = getTemplateDir(baseDataDir);
  const filePath = path.join(tDir, target.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const updated = templates.filter((t) => t.id !== templateId);
  saveCustomTemplates(baseDataDir, updated);
  return { success: true };
}

// Generate HTML table for {{PRODUCT_TABLE}}
function buildHtmlProductTable(items = []) {
  let rowsHtml = '';
  items.forEach((item, idx) => {
    rowsHtml += `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 8px;">
          <strong>${item.variant?.product?.name || 'Item'}</strong><br/>
          <span style="font-size: 11px; color: #6b7280;">SKU: ${item.variant?.sku || ''}</span>
        </td>
        <td style="padding: 8px; text-align: center;">${item.variant?.product?.hsnCode || '-'}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right; font-family: monospace;">₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding: 8px; text-align: right; font-family: monospace;">₹${(item.discount || 0).toFixed(2)}</td>
        <td style="padding: 8px; text-align: right; font-family: monospace; font-weight: bold;">₹${(item.total || 0).toFixed(2)}</td>
      </tr>
    `;
  });

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background-color: #111827; color: #ffffff; text-transform: uppercase; font-size: 11px;">
          <th style="padding: 8px;">#</th>
          <th style="padding: 8px; text-align: left;">Item & Description</th>
          <th style="padding: 8px; text-align: center;">HSN</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Price</th>
          <th style="padding: 8px; text-align: right;">Disc</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

// Process Template Placeholder Replacement
async function processCustomTemplate({ baseDataDir, templateId, sale, shopConfig = {} }) {
  const templates = listCustomTemplates(baseDataDir);
  const target = templates.find((t) => t.id === templateId) || templates[0];
  if (!target) throw new Error('No custom template found');

  const tDir = getTemplateDir(baseDataDir);
  const filePath = path.join(tDir, target.fileName);
  if (!fs.existsSync(filePath)) throw new Error('Template file missing at ' + filePath);

  const replacements = {
    '{{SHOP_NAME}}': shopConfig.shopName || 'Clothing ERP Store',
    '{{SHOP_ADDRESS}}': shopConfig.shopAddress || '',
    '{{GST_NUMBER}}': shopConfig.gstin || '',
    '{{PHONE}}': shopConfig.shopPhone || '',
    '{{EMAIL}}': shopConfig.shopEmail || '',
    '{{CUSTOMER_NAME}}': sale.customer?.name || 'Walk-in Customer',
    '{{CUSTOMER_PHONE}}': sale.customer?.mobile || '',
    '{{CUSTOMER_ADDRESS}}': sale.customer?.address || '',
    '{{INVOICE_NUMBER}}': sale.invoiceNumber || 'INV-0001',
    '{{INVOICE_DATE}}': new Date(sale.saleDate || Date.now()).toLocaleDateString('en-IN'),
    '{{PAYMENT_METHOD}}': sale.paymentMethod || 'CASH',
    '{{PRODUCT_TABLE}}': buildHtmlProductTable(sale.items || []),
    '{{SUBTOTAL}}': `₹${(sale.subTotal || 0).toFixed(2)}`,
    '{{DISCOUNT}}': `₹${(sale.totalDiscount || 0).toFixed(2)}`,
    '{{GST}}': `₹${(sale.totalTax || 0).toFixed(2)}`,
    '{{GRAND_TOTAL}}': `₹${(sale.grandTotal || 0).toFixed(2)}`,
    '{{FOOTER}}': shopConfig.footerMessage || 'Thank you for shopping with us!',
    '{{TERMS}}': shopConfig.termsAndConditions || 'Terms & Conditions apply.',
    '{{SIGNATURE}}': `Authorized Signatory for ${shopConfig.shopName || 'Store'}`,
  };

  if (target.fileType === 'docx') {
    // Render DOCX -> HTML via Mammoth
    const result = await mammoth.convertToHtml({ path: filePath });
    let html = result.value;

    Object.keys(replacements).forEach((tag) => {
      const regex = new RegExp(tag, 'g');
      html = html.replace(regex, replacements[tag]);
    });

    return {
      success: true,
      fileType: 'docx',
      renderedHtml: html,
      template: target,
    };
  } else if (target.fileType === 'pdf') {
    // Overlay text on PDF template via pdf-lib
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Basic overlay text on page top header & footer
    firstPage.drawText(`Invoice #: ${replacements['{{INVOICE_NUMBER}}']}`, {
      x: 50,
      y: firstPage.getHeight() - 40,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`Billed To: ${replacements['{{CUSTOMER_NAME}}']}`, {
      x: 50,
      y: firstPage.getHeight() - 60,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    firstPage.drawText(`Grand Total: ${replacements['{{GRAND_TOTAL}}']}`, {
      x: 50,
      y: 50,
      size: 14,
      font,
      color: rgb(0.1, 0.5, 0.2),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const base64Pdf = Buffer.from(modifiedPdfBytes).toString('base64');

    return {
      success: true,
      fileType: 'pdf',
      pdfBase64: base64Pdf,
      template: target,
    };
  }
}

module.exports = {
  listCustomTemplates,
  saveUploadedTemplateFile,
  deleteCustomTemplate,
  processCustomTemplate,
};
