const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Banner display
console.log('\n');
console.log(
  '╔════════════════════════════════════════════════════════════════╗'
);
console.log(
  '║                                                                ║'
);
console.log(
  '║                 VEffect Validation Benchmarks                  ║'
);
console.log(
  '║                                                                ║'
);
console.log(
  '╚════════════════════════════════════════════════════════════════╝'
);
console.log('\n');

// Get all benchmark files (except this one and index.js)
const benchmarkFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('-validation.js'))
  .map((file) => path.join(__dirname, file));

// Run benchmarks in sequence
console.log(`Found ${benchmarkFiles.length} benchmark types to run\n`);

benchmarkFiles.forEach((file, index) => {
  const fileName = path.basename(file);
  const testType = fileName.replace('-validation.js', '');

  console.log(
    `\n[${index + 1}/${
      benchmarkFiles.length
    }] Running ${testType} validation benchmarks...`
  );
  console.log(
    '----------------------------------------------------------------'
  );

  try {
    execSync(`node ${file}`, { stdio: 'inherit' });
    console.log(
      '----------------------------------------------------------------'
    );
    console.log(`✓ ${testType} validation benchmarks completed`);
  } catch (error) {
    console.error(
      `✗ Error running ${testType} validation benchmarks:`,
      error.message
    );
  }
});

// Summary
console.log('\n');
console.log(
  '╔════════════════════════════════════════════════════════════════╗'
);
console.log(
  '║                                                                ║'
);
console.log(
  '║                  All Benchmarks Completed                      ║'
);
console.log(
  '║                                                                ║'
);
console.log(
  '╚════════════════════════════════════════════════════════════════╝'
);
console.log('\n');
