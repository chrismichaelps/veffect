#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the benchmark name from CLI arguments
const benchmarkName = process.argv[2];

// Print runtime info
console.log(`runtime: node ${process.version} (${process.platform})`);
console.log(' ');

if (!benchmarkName) {
  console.log('Please specify a benchmark to run:');
  console.log('npm run bench [benchmark-name]');
  console.log('\nAvailable benchmarks:');

  // Find all benchmark files
  const benchmarkFiles = fs
    .readdirSync(__dirname)
    .filter(
      (file) => file.endsWith('-validation.js') || file.includes('showcase')
    )
    .map((file) => path.basename(file).replace('.js', ''));

  benchmarkFiles.sort().forEach((file) => {
    console.log(`- ${file}`);
  });

  console.log('\nOr run all benchmarks with:');
  console.log('npm run bench:all');

  process.exit(1);
}

// Map benchmark name to file
let benchmarkFile;

if (benchmarkName.endsWith('-validation')) {
  benchmarkFile = path.join(__dirname, `${benchmarkName}.js`);
} else {
  benchmarkFile = path.join(__dirname, `${benchmarkName}-validation.js`);

  // If file doesn't exist with -validation suffix, try the name directly
  if (!fs.existsSync(benchmarkFile)) {
    benchmarkFile = path.join(__dirname, `${benchmarkName}.js`);
  }
}

// Check if the benchmark file exists
if (!fs.existsSync(benchmarkFile)) {
  console.error(`Benchmark file not found: ${benchmarkFile}`);
  process.exit(1);
}

// Execute the benchmark file
try {
  require(benchmarkFile);
} catch (err) {
  console.error(`Error running benchmark: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}
