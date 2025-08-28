#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Quick Flaky Test Check Script
 * Lightweight check for obvious flaky behavior patterns
 */

const { execSync } = require('child_process');

class QuickFlakyCheck {
  constructor() {
    this.runs = 3; // Quick check with only 3 runs
    this.timeout = 15000; // Shorter timeout for quick checks
  }

  log(message) {
    console.log(`[QuickFlaky] ${message}`);
  }

  async runQuickCheck() {
    this.log('Running quick flaky test check...');

    const results = [];

    for (let i = 1; i <= this.runs; i++) {
      try {
        const startTime = Date.now();
        execSync(`npx jest --testTimeout=${this.timeout} --runInBand --silent --no-coverage`, {
          encoding: 'utf8',
          timeout: this.timeout + 2000,
        });
        const endTime = Date.now();

        results.push({
          run: i,
          status: 'PASSED',
          executionTime: endTime - startTime,
        });
      } catch (error) {
        results.push({
          run: i,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    const passedRuns = results.filter(r => r.status === 'PASSED').length;
    const failedRuns = results.filter(r => r.status === 'FAILED').length;

    if (failedRuns > 0 && passedRuns > 0) {
      this.log(`⚠️ Potential flaky behavior detected: ${passedRuns}/${this.runs} runs passed`);
      this.log('Consider running full flaky test detection before committing');
      return false;
    } else if (failedRuns > 0) {
      this.log('❌ All runs failed - this appears to be a consistent test failure');
      return false;
    } else {
      this.log('✅ No obvious flaky behavior detected in quick check');
      return true;
    }
  }
}

// CLI execution
if (require.main === module) {
  const checker = new QuickFlakyCheck();
  checker
    .runQuickCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Quick flaky check failed:', error);
      process.exit(1);
    });
}

module.exports = { QuickFlakyCheck };
