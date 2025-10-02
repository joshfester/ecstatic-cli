import fs from 'fs';
import path from 'path';

// CDN domain to prepend to relative URLs
const CDN_DOMAIN = 'https://shefinds.b-cdn.net';

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.error('Usage: node encode.js <html-file-path>');
    process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
}

try {
    // Read the HTML file
    let html = fs.readFileSync(filePath, 'utf8');

    // Regular expression to match data-src attributes
    // This captures: data-src="..." or data-src='...'
    const dataSrcRegex = /data-src=(["'])(.*?)\1/g;

    // Regular expression to match data-bg attributes with url()
    // This captures: data-bg="url('...')" or data-bg="url("...")" or data-bg='url("...")' etc.
    const dataBgRegex = /data-bg=(["'])url\((["'])(.*?)\2\)\1/g;

    let matchCount = 0;

    // Replace all data-src attributes with URL-encoded versions
    html = html.replace(dataSrcRegex, (match, quote, url) => {
        matchCount++;
        // Add CDN domain if URL is relative (starts with / or doesn't have a protocol)
        const fullUrl = (url.startsWith('/') || !url.match(/^https?:\/\//)) ? CDN_DOMAIN + (url.startsWith('/') ? url : '/' + url) : url;
        // URL-encode the attribute value while preserving slashes
        const encodedUrl = fullUrl.split('/').map(segment => encodeURIComponent(segment)).join('/');
        // Fix the protocol part (https:// shouldn't be encoded)
        const finalUrl = encodedUrl.replace('https%3A', 'https:');
        return `data-src=${quote}${finalUrl}${quote}`;
    });

    // Replace all data-bg attributes with URL-encoded versions
    html = html.replace(dataBgRegex, (match, outerQuote, innerQuote, url) => {
        matchCount++;
        // Add CDN domain if URL is relative (starts with / or doesn't have a protocol)
        const fullUrl = (url.startsWith('/') || !url.match(/^https?:\/\//)) ? CDN_DOMAIN + (url.startsWith('/') ? url : '/' + url) : url;
        // URL-encode the attribute value while preserving slashes
        const encodedUrl = fullUrl.split('/').map(segment => encodeURIComponent(segment)).join('/');
        // Fix the protocol part (https:// shouldn't be encoded)
        const finalUrl = encodedUrl.replace('https%3A', 'https:');
        return `data-bg=${outerQuote}url(${innerQuote}${finalUrl}${innerQuote})${outerQuote}`;
    });

    // Write the modified HTML back to the file
    fs.writeFileSync(filePath, html, 'utf8');

    console.log(`✓ Successfully encoded ${matchCount} data-src and data-bg attribute(s) in ${filePath}`);

} catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
}