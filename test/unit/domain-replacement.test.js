import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { replaceDomains } from '../../src/utils/domain-replacement.js';

// Helper function to create temporary test directory
function createTempDir() {
  const tempDir = path.join(process.cwd(), 'test-temp-' + Date.now());
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

test('replaceDomains - basic functionality', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create test HTML file
    createTestFile(tempDir, 'index.html', 
      '<a href="https://example.com/page">Link to example.com</a>'
    );

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Verify return values
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 2);

    // Verify file content
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, '<a href="https://new-domain.com/page">Link to new-domain.com</a>');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - multiple files', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create multiple test HTML files
    createTestFile(tempDir, 'page1.html', '<img src="https://example.com/image.jpg" />');
    createTestFile(tempDir, 'page2.html', '<link href="https://example.com/style.css" rel="stylesheet" />');
    createTestFile(tempDir, 'page3.html', '<script src="https://other-domain.com/script.js"></script>');

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Verify return values - should process 2 files (page1 and page2), skip page3
    assert.strictEqual(result.processedFiles, 2);
    assert.strictEqual(result.totalReplacements, 2);

    // Verify file contents
    const content1 = fs.readFileSync(path.join(tempDir, 'page1.html'), 'utf8');
    assert.strictEqual(content1, '<img src="https://new-domain.com/image.jpg" />');

    const content2 = fs.readFileSync(path.join(tempDir, 'page2.html'), 'utf8');
    assert.strictEqual(content2, '<link href="https://new-domain.com/style.css" rel="stylesheet" />');

    // page3 should remain unchanged
    const content3 = fs.readFileSync(path.join(tempDir, 'page3.html'), 'utf8');
    assert.strictEqual(content3, '<script src="https://other-domain.com/script.js"></script>');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - multiple occurrences in same file', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create test file with multiple domain occurrences
    createTestFile(tempDir, 'index.html', `
      <a href="https://example.com/page1">Link 1</a>
      <img src="https://example.com/image.jpg" />
      <p>Visit example.com for more info</p>
      <form action="https://example.com/submit" method="post"></form>
    `);

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Verify return values
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 4);

    // Verify all occurrences were replaced
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.match(content, /new-domain\.com/g);
    assert.doesNotMatch(content, /example\.com/);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - special characters in domain', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create test file with domain containing dots
    createTestFile(tempDir, 'index.html', 
      '<a href="https://sub.example.com/page">Link</a><p>Visit sub.example.com</p>'
    );

    const result = await replaceDomains(tempDir, 'sub.example.com', 'new.domain.com');

    // Verify return values
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 2);

    // Verify content
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, '<a href="https://new.domain.com/page">Link</a><p>Visit new.domain.com</p>');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - no HTML files', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create non-HTML files
    createTestFile(tempDir, 'style.css', '.class { background: url(https://example.com/bg.jpg); }');
    createTestFile(tempDir, 'script.js', 'const url = "https://example.com/api";');
    createTestFile(tempDir, 'data.json', '{"url": "https://example.com/endpoint"}');

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Should process no files
    assert.strictEqual(result.processedFiles, 0);
    assert.strictEqual(result.totalReplacements, 0);

    // Verify files remain unchanged
    const cssContent = fs.readFileSync(path.join(tempDir, 'style.css'), 'utf8');
    assert.match(cssContent, /example\.com/);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - no matches found', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create HTML file without target domain
    createTestFile(tempDir, 'index.html', 
      '<a href="https://other-domain.com/page">Link</a>'
    );

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Should process no files
    assert.strictEqual(result.processedFiles, 0);
    assert.strictEqual(result.totalReplacements, 0);

    // Verify file remains unchanged
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(content, '<a href="https://other-domain.com/page">Link</a>');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - empty directory', async () => {
  const tempDir = createTempDir();
  
  try {
    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Should process no files
    assert.strictEqual(result.processedFiles, 0);
    assert.strictEqual(result.totalReplacements, 0);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - nested directories', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create nested directory structure
    const subDir = path.join(tempDir, 'subdir');
    fs.mkdirSync(subDir, { recursive: true });
    
    createTestFile(tempDir, 'index.html', '<a href="https://example.com">Root</a>');
    createTestFile(subDir, 'page.html', '<a href="https://example.com">Sub</a>');

    const result = await replaceDomains(tempDir, 'example.com', 'new-domain.com');

    // Should process both files
    assert.strictEqual(result.processedFiles, 2);
    assert.strictEqual(result.totalReplacements, 2);

    // Verify both files were updated
    const rootContent = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.strictEqual(rootContent, '<a href="https://new-domain.com">Root</a>');

    const subContent = fs.readFileSync(path.join(subDir, 'page.html'), 'utf8');
    assert.strictEqual(subContent, '<a href="https://new-domain.com">Sub</a>');
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - invalid directory', async () => {
  await assert.rejects(
    async () => {
      await replaceDomains('/non/existent/directory', 'example.com', 'new-domain.com');
    },
    {
      message: /Scraped directory not found/
    }
  );
});

test('replaceDomains - missing parameters', async () => {
  const tempDir = createTempDir();
  
  try {
    // Test missing source domain
    await assert.rejects(
      async () => {
        await replaceDomains(tempDir, '', 'new-domain.com');
      },
      {
        message: /Both source and target domains are required/
      }
    );

    // Test missing target domain
    await assert.rejects(
      async () => {
        await replaceDomains(tempDir, 'example.com', '');
      },
      {
        message: /Both source and target domains are required/
      }
    );
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - subdomain preservation', async () => {
  const tempDir = createTempDir();
  
  try {
    // Create test file with subdomains that should NOT be replaced
    createTestFile(tempDir, 'index.html', `
      <a href="https://api.example.com:8080/endpoint">API</a>
      <img src="//cdn.example.com/image.jpg" />
      <script>var url = "https://example.com/api/v1/data";</script>
      <p>Contact us at support@example.com</p>
      <link href="https://sub-example.com/style.css" />
    `);

    const result = await replaceDomains(tempDir, 'example.com', 'newsite.com');

    // Should only replace exact domain matches, not subdomains or emails
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 1); // Only the URL, not the email

    // Verify content - subdomains and emails should remain unchanged
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    assert.match(content, /api\.example\.com:8080/); // Subdomain unchanged
    assert.match(content, /cdn\.example\.com/); // Subdomain unchanged
    assert.match(content, /newsite\.com\/api\/v1/); // Exact match replaced
    assert.match(content, /support@example\.com/); // Email unchanged
    assert.match(content, /sub-example\.com/); // Hyphenated subdomain unchanged
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - email preservation', async () => {
  const tempDir = createTempDir();
  
  try {
    // Test file with various email formats that should be preserved
    createTestFile(tempDir, 'index.html', `
      <p>Contact us at support@example.com for help</p>
      <p>Sales: sales@example.com</p>
      <p>Technical support: tech-support@example.com</p>
      <a href="mailto:info@example.com">Email us</a>
      <script>const email = "admin@example.com";</script>
      
      <!-- These should still be replaced (URLs, not emails) -->
      <a href="https://example.com/contact">Visit our website</a>
      <img src="//example.com/logo.jpg" alt="Logo" />
      <p>Visit example.com for more information</p>
    `);

    const result = await replaceDomains(tempDir, 'example.com', 'newsite.org');

    // Should only replace URLs, not emails
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 3); // Only the 3 URLs

    // Verify content
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    
    // These should be replaced (URLs)
    assert.match(content, /https:\/\/newsite\.org\/contact/);
    assert.match(content, /\/\/newsite\.org\/logo\.jpg/);
    assert.match(content, /Visit newsite\.org for more/);
    
    // These should NOT be replaced (emails)
    assert.match(content, /support@example\.com/);
    assert.match(content, /sales@example\.com/);
    assert.match(content, /tech-support@example\.com/);
    assert.match(content, /mailto:info@example\.com/);
    assert.match(content, /admin@example\.com/);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('replaceDomains - exact domain matching only', async () => {
  const tempDir = createTempDir();
  
  try {
    // Test various scenarios where exact domain should/shouldn't be replaced
    createTestFile(tempDir, 'index.html', 
      `<a href="//example.com/page">Protocol relative</a>
      <a href="https://example.com/page">HTTPS</a>
      <a href="http://example.com/page">HTTP</a>
      <a href="https://api.example.com/page">Subdomain</a>
      <a href="https://sub.example.com/page">Subdomain</a>
      <span>Visit example.com today</span>
      <span>Email: contact@example.com</span>
      <script>const url = "example.com/api";</script>
      <script>const url = 'example.com/api';</script>`);

    const result = await replaceDomains(tempDir, 'example.com', 'newdomain.com');

    // Verify return values
    assert.strictEqual(result.processedFiles, 1);
    assert.strictEqual(result.totalReplacements, 6); // Exact matches excluding emails

    // Verify content
    const content = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
    
    // These should be replaced (exact domain matches, not emails)
    assert.match(content, /\/\/newdomain\.com\/page/);
    assert.match(content, /https:\/\/newdomain\.com\/page/);
    assert.match(content, /http:\/\/newdomain\.com\/page/);
    assert.match(content, /Visit newdomain\.com today/);
    assert.match(content, /"newdomain\.com\/api"/);
    assert.match(content, /'newdomain\.com\/api'/);
    
    // These should NOT be replaced (subdomains and emails)
    assert.match(content, /api\.example\.com/);
    assert.match(content, /sub\.example\.com/);
    assert.match(content, /contact@example\.com/);
  } finally {
    cleanupTempDir(tempDir);
  }
});