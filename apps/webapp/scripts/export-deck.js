/**
 * Export pitch deck to PDF using Playwright
 * 
 * Usage:
 *   node scripts/export-deck.js
 *   node scripts/export-deck.js --url http://localhost:3000/slides
 *   node scripts/export-deck.js --output custom-deck.pdf
 */

const { chromium } = require('playwright');
const path = require('path');

async function exportDeck() {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const outputIndex = args.indexOf('--output');
  
  const url = urlIndex !== -1 ? args[urlIndex + 1] : 'http://localhost:3000/slides';
  const outputPath = outputIndex !== -1 
    ? args[outputIndex + 1] 
    : path.join(process.cwd(), 'Vexa-Seed-Deck.pdf');

  console.log('🚀 Starting PDF export...');
  console.log(`📄 URL: ${url}`);
  console.log(`💾 Output: ${outputPath}`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to slides
    console.log('🌐 Loading slides...');
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit for fonts and images to load
    await page.waitForTimeout(2000);

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Generate PDF
    console.log('📝 Generating PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '16mm',
        right: '16mm',
        bottom: '16mm',
        left: '16mm'
      },
      preferCSSPageSize: true,
    });

    console.log('✅ PDF exported successfully!');
    console.log(`📁 Location: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error exporting PDF:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

exportDeck();





