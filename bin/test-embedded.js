#!/usr/bin/env node

// Test embedded files
if (typeof Bun !== 'undefined' && Bun.embeddedFiles) {
  console.log('Embedded files found:', Bun.embeddedFiles.length);
  for (const file of Bun.embeddedFiles) {
    console.log('  -', file.name, `(${file.size} bytes)`);
  }
} else {
  console.log('No embedded files or not running in Bun');
}

// Test SiteOneCommandBuilder
import { SiteOneCommandBuilder } from '../src/scrapers/SiteOneCommandBuilder.js';
const config = { siteone: { workers: 2, maxReqsPerSec: 2, memoryLimit: '1024M', includeRegex: [], ignoreRegex: [], ignoreRobotsTxt: false, offlineExportNoAutoRedirectHtml: false } };
const result = SiteOneCommandBuilder.build('https://example.com', './test-output', config);
console.log('Detected crawler path:', result.command);