const { performance } = require('perf_hooks');

/**
 * Runs a benchmark for a specific validation function
 * @param {string} name - Name of the benchmark
 * @param {Function} fn - Function to benchmark
 * @param {number} iterations - Number of iterations to run
 * @param {any[]} args - Arguments to pass to the function
 * @returns {Object} - Benchmark results
 */
function runBenchmark(name, fn, iterations = 10000, ...args) {
  // Warm up
  for (let i = 0; i < 100; i++) {
    fn(...args);
  }

  const times = [];

  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(...args);
    const end = performance.now();
    times.push(end - start);
  }

  // Calculate statistics
  times.sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const total = times.reduce((acc, time) => acc + time, 0);
  const avg = total / times.length;
  const p75 = times[Math.floor(times.length * 0.75)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const p999 = times[Math.floor(times.length * 0.999)];

  return {
    name,
    avg,
    min,
    max,
    p75,
    p99,
    p999,
    total,
    iterations,
  };
}

/**
 * Format time in microseconds with SI notation
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} - Formatted time string
 */
function formatTime(timeMs) {
  const microSeconds = timeMs * 1000;

  if (microSeconds >= 1000) {
    const thousands = Math.floor(microSeconds / 1000);
    const remainder = Math.floor(microSeconds % 1000);
    return `${thousands}'${remainder.toString().padStart(3, '0')} µs/iter`;
  }

  return `${Math.floor(microSeconds)} µs/iter`;
}

/**
 * Format time range with SI notation
 * @param {number} min - Minimum time in milliseconds
 * @param {number} max - Maximum time in milliseconds
 * @returns {string} - Formatted time range
 */
function formatTimeRange(min, max) {
  const minMicro = min * 1000;
  const maxMicro = max * 1000;

  // Format min value
  const minFormatted = Math.floor(minMicro);

  // Format max value with SI notation
  let maxFormatted;
  if (maxMicro >= 1000) {
    const thousands = Math.floor(maxMicro / 1000);
    const remainder = Math.floor(maxMicro % 1000);
    maxFormatted = `${thousands}'${remainder.toString().padStart(3, '0')}`;
  } else {
    maxFormatted = Math.floor(maxMicro);
  }

  return `(${minFormatted} µs … ${maxFormatted} µs)`;
}

/**
 * Format percentile with SI notation
 * @param {number} time - Time in milliseconds
 * @returns {string} - Formatted percentile
 */
function formatPercentile(time) {
  const microSeconds = time * 1000;

  if (microSeconds >= 1000) {
    const thousands = Math.floor(microSeconds / 1000);
    const remainder = Math.floor(microSeconds % 1000);
    return `${thousands}'${remainder.toString().padStart(3, '0')} µs`;
  }

  return `${Math.floor(microSeconds)} µs`;
}

/**
 * Print benchmark results
 * @param {string} title - Benchmark title
 * @param {Object[]} results - Array of benchmark results
 */
function printResults(title, results) {
  console.log(`• ${title}`);
  console.log(
    '------------------------------------------------- -----------------------------'
  );

  // Print individual results
  results.forEach((result) => {
    console.log(
      `${result.name.padEnd(14)}${formatTime(result.avg).padEnd(18)}` +
        `${formatTimeRange(result.min, result.max).padEnd(28)}` +
        `${formatPercentile(result.p75).padEnd(10)}` +
        `${formatPercentile(result.p99).padEnd(10)}` +
        `${formatPercentile(result.p999)}`
    );
  });

  // Print summary
  if (results.length > 1) {
    console.log(' ');
    console.log(`summary for ${title}`);

    // Sort by average time (fastest first)
    results.sort((a, b) => a.avg - b.avg);
    const fastest = results[0];

    for (let i = 1; i < results.length; i++) {
      const result = results[i];
      const ratio = result.avg / fastest.avg;
      console.log(`  ${fastest.name}`);
      console.log(`   ${ratio.toFixed(2)}x faster than ${result.name}`);
    }
  }
}

/**
 * Run and print benchmark suite
 * @param {string} title - Benchmark title
 * @param {Object} benchmarks - Object mapping names to benchmark functions
 * @param {number} iterations - Number of iterations to run
 * @param {any[]} args - Arguments to pass to the function
 */
function runSuite(title, benchmarks, iterations = 10000, ...args) {
  console.log(
    `benchmark      time (avg)             (min … max)       p75       p99      p999`
  );
  console.log(
    '------------------------------------------------- -----------------------------'
  );

  const results = [];

  for (const [name, fn] of Object.entries(benchmarks)) {
    const result = runBenchmark(name, fn, iterations, ...args);
    results.push(result);
  }

  printResults(title, results);
}

module.exports = {
  runBenchmark,
  printResults,
  runSuite,
};
