import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { replaceDomains } from '../../src/utils/domain-replacement.js';

// Mock the scrape command's runPostProcessing function
async function mockRunPostProcessing(config) {
  const domainReplacement = config?.scrape?.domainReplacement;
  if (domainReplacement?.source && domainReplacement?.target) {
    const scrapedDir = config.paths.scraped;
    await replaceDomains(scrapedDir, domainReplacement.source, domainReplacement.target);
  }
}

// Helper function to create temporary test directory
function createTempDir() {
  const tempDir = path.join(process.cwd(), 'test-integration-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to cleanup temporary directory
function cleanupTempDir(tempDir) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Helper function to create test HTML file
function createTestFile(dir, filename, content) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

test('scrape post-processing - domain replacement via config', async () => {
  const tempDir = createTempDir();

  try {
    // Create test HTML files
    createTestFile(tempDir, 'index.html',
      '<a href="https://oldsite.com/page">Visit oldsite.com</a>'
    );
    createTestFile(tempDir, 'about.html',
      '<img src="https://oldsite.com/logo.png" alt="Logo" />'
    );

    // Create mock config with domain replacement
    const config = {
      paths: {
        scraped: tempDir
      },
      scrape: {
        domainReplacement: {
          source: 'oldsite.com',
          target: 'newsite.com'
        }
      }
    };

    // Run post-processing
    await mockRunPostProcessing(config);

    // Verify files were updated
    const indexContent = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(indexContent, '<a href="https://newsite.com/page">Visit newsite.com</a>');

    const aboutContent = fs.readFileSync(path.join(tempDir, 'about.html'), 'utf8');
    assert.strictEqual(aboutContent, '<img src="https://newsite.com/logo.png" alt="Logo" />');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('scrape post-processing - no domain replacement when not configured', async () => {
  const tempDir = createTempDir();

  try {
    // Create test HTML file
    const originalContent = '<a href="https://example.com/page">Visit example.com</a>';
    createTestFile(tempDir, 'index.html', originalContent);

    // Create config without domain replacement
    const config = {
      paths: {
        scraped: tempDir
      },
      scrape: {
        // no domainReplacement configured
      }
    };

    // Run post-processing
    await mockRunPostProcessing(config);

    // Verify file remains unchanged
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, originalContent);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('scrape post-processing - incomplete domain replacement config', async () => {
  const tempDir = createTempDir();

  try {
    // Create test HTML file
    const originalContent = '<a href="https://example.com/page">Visit example.com</a>';
    createTestFile(tempDir, 'index.html', originalContent);

    // Test missing source domain
    const configMissingSource = {
      paths: {
        scraped: tempDir
      },
      scrape: {
        domainReplacement: {
          target: 'newsite.com'
          // source is missing
        }
      }
    };

    await mockRunPostProcessing(configMissingSource);

    // Verify file remains unchanged
    let content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, originalContent);

    // Test missing target domain
    const configMissingTarget = {
      paths: {
        scraped: tempDir
      },
      scrape: {
        domainReplacement: {
          source: 'example.com'
          // target is missing
        }
      }
    };

    await mockRunPostProcessing(configMissingTarget);

    // Verify file remains unchanged
    content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, originalContent);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('scrape post-processing - complex website structure', async () => {
  const tempDir = createTempDir();

  try {
    // Create complex directory structure
    const blogDir = path.join(tempDir, 'blog');
    const assetsDir = path.join(tempDir, 'assets');
    fs.mkdirSync(blogDir, { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });

    // Create various HTML files
    createTestFile(tempDir, 'index.html', `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://staging.mysite.com/css/main.css">
          <link rel="canonical" href="https://staging.mysite.com/">
        </head>
        <body>
          <nav>
            <a href="https://staging.mysite.com/about">About</a>
            <a href="https://staging.mysite.com/contact">Contact</a>
          </nav>
          <h1>Welcome to staging.mysite.com</h1>
        </body>
      </html>
    `);

    createTestFile(blogDir, 'post.html', `
      <article>
        <h2>Blog Post</h2>
        <p>Read more at <a href="https://staging.mysite.com/blog">staging.mysite.com/blog</a></p>
        <img src="https://staging.mysite.com/images/post.jpg" alt="Post image">
      </article>
    `);

    // Also create non-HTML files to ensure they're ignored
    fs.writeFileSync(path.join(assetsDir, 'script.js'),
      'const API_URL = "https://staging.mysite.com/api";'
    );

    // Create config with domain replacement
    const config = {
      paths: {
        scraped: tempDir
      },
      scrape: {
        domainReplacement: {
          source: 'staging.mysite.com',
          target: 'production.mysite.com'
        }
      }
    };

    // Run post-processing
    await mockRunPostProcessing(config);

    // Verify main page was updated
    const indexContent = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.match(indexContent, /production\.mysite\.com\/css\/main\.css/);
    assert.match(indexContent, /production\.mysite\.com\/about/);
    assert.match(indexContent, /production\.mysite\.com\/contact/);
    assert.match(indexContent, /Welcome to production\.mysite\.com/);
    assert.doesNotMatch(indexContent, /staging\.mysite\.com/);

    // Verify blog post was updated
    const blogContent = fs.readFileSync(path.join(blogDir, 'post.html'), 'utf8');
    assert.match(blogContent, /production\.mysite\.com\/blog/);
    assert.match(blogContent, /production\.mysite\.com\/images\/post\.jpg/);
    assert.doesNotMatch(blogContent, /staging\.mysite\.com/);

    // Verify JavaScript file remains unchanged (not HTML)
    const jsContent = fs.readFileSync(path.join(assetsDir, 'script.js'), 'utf8');
    assert.match(jsContent, /staging\.mysite\.com/);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('scrape post-processing - real-world config format', async () => {
  const tempDir = createTempDir();

  try {
    // Create test files
    createTestFile(tempDir, 'index.html', `
      <head>
        <meta property="og:url" content="https://dev.example.com/">
        <meta property="og:image" content="https://dev.example.com/og-image.jpg">
      </head>
      <body>
        <footer>
          <p>&copy; 2024 dev.example.com. All rights reserved.</p>
        </footer>
      </body>
    `);

    // Use realistic config structure (similar to ecstatic.config.js)
    const config = {
      paths: {
        scraped: tempDir,
        distJampack: './dist-jampack',
        dist: './dist'
      },
      scrape: {
        depth: 3,
        method: 'wget',
        timeout: 10,
        sockets: 16,
        wget: {
          mirror: true
        },
        domainReplacement: {
          source: 'dev.example.com',
          target: 'www.example.com'
        }
      }
    };

    // Run post-processing
    await mockRunPostProcessing(config);

    // Verify domain replacement worked
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.match(content, /www\.example\.com/g);
    assert.doesNotMatch(content, /dev\.example\.com/);

    // Check specific replacements
    assert.match(content, /<meta property="og:url" content="https:\/\/www\.example\.com\/">/);
    assert.match(content, /<meta property="og:image" content="https:\/\/www\.example\.com\/og-image\.jpg">/);
    assert.match(content, /&copy; 2024 www\.example\.com\. All rights reserved\./);
  } finally {
    cleanupTempDir(tempDir);
  }
});