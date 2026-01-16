/**
 * Excel to CSV Converter for Tour Packages
 *
 * Usage:
 *   1. npm install xlsx
 *   2. node src/utils/excelToCSV.js
 *
 * This script reads "Website Product.xlsx" from the root folder
 * and outputs the structure so we can map it to tour_packages table.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const EXCEL_FILE = path.join(ROOT_DIR, 'Website Product.xlsx');
const OUTPUT_CSV = path.join(ROOT_DIR, 'Tour_Packages_From_Excel.csv');

function readExcelFile() {
  console.log('\n========================================');
  console.log('Excel to CSV Converter for Tour Packages');
  console.log('========================================\n');

  // Check if file exists
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`ERROR: Excel file not found at: ${EXCEL_FILE}`);
    process.exit(1);
  }

  console.log(`Reading: ${EXCEL_FILE}\n`);

  // Read the workbook
  const workbook = XLSX.readFile(EXCEL_FILE);

  // Get sheet names
  console.log('Sheet Names:', workbook.SheetNames);
  console.log('');

  // Read first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to raw array (all rows)
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`Total Rows in Excel: ${rawData.length}\n`);

  // Find the actual header row (row with "Package Name")
  let headerRowIndex = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row.some(cell => cell && String(cell).includes('Package Name'))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error('Could not find header row with "Package Name"');
    process.exit(1);
  }

  console.log(`Header row found at index: ${headerRowIndex}`);

  // Get headers
  const headers = rawData[headerRowIndex];
  console.log('\nColumn Headers:');
  console.log('---------------');
  headers.forEach((header, index) => {
    if (header) {
      console.log(`  ${index}: "${header}"`);
    }
  });

  // Get data rows (skip header row)
  const dataRows = rawData.slice(headerRowIndex + 1).filter(row => {
    // Filter out empty rows and rows that are just numbers
    if (!row || row.length === 0) return false;
    // Check if row has actual package data (more than just a number)
    const hasContent = row.some((cell, idx) => idx > 0 && cell && String(cell).trim() !== '');
    return hasContent;
  });

  console.log(`\nData Rows: ${dataRows.length} packages\n`);

  // Show all packages
  console.log('All Packages Found:');
  console.log('===================');
  dataRows.forEach((row, index) => {
    const packageName = row[1] || row[0];  // Package Name is usually column 1
    const type = row[2] || '';
    const price = row[3] || '';
    const duration = row[4] || '';
    console.log(`${index + 1}. ${packageName} | ${type} | ${price} | ${duration}`);
  });

  // Show detailed structure of first 3 packages
  console.log('\n\nDetailed Data (First 3 packages):');
  console.log('===================================');

  for (let i = 0; i < Math.min(3, dataRows.length); i++) {
    const row = dataRows[i];
    console.log(`\n--- Package ${i + 1} ---`);
    headers.forEach((header, j) => {
      if (header && row[j] !== undefined && row[j] !== null) {
        let value = String(row[j]);
        if (value.length > 150) {
          value = value.substring(0, 150) + '...';
        }
        console.log(`  ${header}: ${value}`);
      }
    });
  }

  return { headers, dataRows, rawData };
}

// Run if called directly
if (require.main === module) {
  try {
    readExcelFile();
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure you have installed xlsx package:');
    console.log('  cd backend/package-service');
    console.log('  npm install xlsx');
  }
}

module.exports = { readExcelFile };
