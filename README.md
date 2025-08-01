# Ecstatic

A CLI tool for website optimization that automates the process of downloading, optimizing, and deploying static websites for maximum performance and Core Web Vitals compliance.

## Installation

### Local Development
```bash
git clone <repository>
cd ecstatic
npm install
npm link  # Creates global 'ecstatic' command
```

### Global Installation (when published)
```bash
npm install -g ecstatic
```

## Quick Start

### Complete Pipeline
Run the entire optimization pipeline with a single command:
```bash
ecstatic all https://example.com
```

### Individual Steps
Or run each step individually:
```bash
# 1. Download website
ecstatic scrape https://example.com

# 2. Optimize assets (Parcel + Jampack)
ecstatic optimize

# 3. Deploy to CDN
ecstatic deploy
```

## Commands

### `ecstatic scrape <url>`
Downloads a website as static files using httrack or wget.

**Options:**
- `-o, --output <dir>` - Output directory (default: `./scraped`)
- `-d, --depth <number>` - Mirror depth (default: 3)
- `-m, --method <method>` - Scraping method: `httrack` or `wget` (default: `httrack`)

**Example:**
```bash
ecstatic scrape https://example.com --depth 2 --output ./my-site
```

### `ecstatic optimize [input-dir]`
Optimizes HTML and assets using Parcel and Jampack.

**Options:**
- `-o, --output <dir>` - Output directory (default: `./dist`)
- `--skip-parcel` - Skip Parcel optimization step
- `--skip-jampack` - Skip Jampack optimization step
- `--skip-partytown` - Skip Partytown web worker setup

**Example:**
```bash
ecstatic optimize ./scraped/web --output ./optimized
```

### `ecstatic deploy [dist-dir]`
Uploads optimized files to BunnyCDN.

**Options:**
- `-c, --config <file>` - Load additional environment config file

**Example:**
```bash
ecstatic deploy ./dist --config .env.production
```

### `ecstatic all <url>`
Runs the complete pipeline: scrape → optimize → deploy.

**Options:**
- Combines all options from individual commands
- `--skip-deploy` - Skip the deployment step

**Example:**
```bash
ecstatic all https://example.com --skip-jampack --skip-deploy
```

## Configuration

### Environment Variables
Create a `.env` file for deployment configuration:

```bash
BUNNY_ACCESS_KEY=your_access_key
BUNNY_GLOBAL_API_KEY=your_global_api_key
BUNNY_STORAGE_ZONE=your_storage_zone
BUNNY_REGION=your_region  # Optional
BUNNY_PURGE_URL=https://your-cdn-url.com
```

### Parcel Configuration
The tool uses the existing `.parcelrc` configuration and custom plugins:
- `html-defer` - Externalizes inline scripts and defers all scripts
- `html-partytown` - Offloads scripts to Web Workers
- `html-defer-js` - Uses defer.js library for script deferring

## Migration from npm scripts

The tool maintains backward compatibility with existing npm scripts:

```bash
# Old way
npm run scrape
npm run parcel
npm run jampack
npm run deploy

# New way (equivalent)
npm run scrape     # Uses: ecstatic scrape
npm run optimize   # Uses: ecstatic optimize
npm run deploy     # Uses: ecstatic deploy
npm run all        # Uses: ecstatic all
```

## Architecture

```
ecstatic/
├── bin/ecstatic           # CLI entry point
├── src/
│   ├── commands/          # Command implementations
│   │   ├── scrape.js     # Website downloading
│   │   ├── optimize.js   # Parcel + Jampack optimization
│   │   ├── deploy.js     # CDN deployment
│   │   └── all.js        # Complete pipeline
│   └── utils/            # Shared utilities
│       ├── config.js     # Configuration management
│       ├── logger.js     # Consistent logging
│       └── paths.js      # File system utilities
├── lib/parcel/           # Custom Parcel plugins
└── bin/                  # Shell scripts (used internally)
```

## Optimization Features

- **Parcel**: Minification, bundling, and content hashing
- **Jampack**: Critical CSS optimization and lazy loading
- **Partytown**: Web Worker script execution for better performance
- **defer.js**: Advanced script deferring strategies
- **Asset optimization**: Images, fonts, and other static assets

## Common Use Cases

### Development Workflow
```bash
# Download and optimize a site for testing
ecstatic all https://staging.example.com --skip-deploy

# Make changes to optimization, then re-optimize
ecstatic optimize --skip-parcel  # Skip slow Parcel step

# Deploy when ready
ecstatic deploy
```

### Production Deployment
```bash
# Complete pipeline with all optimizations
ecstatic all https://production.example.com
```

### Custom Optimization
```bash
# Fine-tune optimization steps
ecstatic optimize --skip-jampack  # Use only Parcel
ecstatic optimize --skip-parcel   # Use only Jampack
```

## Troubleshooting

### Common Issues

**Command not found: ecstatic**
```bash
npm link  # Re-link the global command
```

**Deployment fails with missing environment variables**
```bash
# Check your .env file has all required variables
ecstatic deploy --help  # See required environment variables
```

**Scraping fails or incomplete**
```bash
# Try different scraping method
ecstatic scrape https://example.com --method wget

# Increase depth for more complete scraping
ecstatic scrape https://example.com --depth 5
```

**Optimization takes too long**
```bash
# Skip slow optimization steps during development
ecstatic optimize --skip-jampack
```

## Contributing

The tool is built with modularity in mind. Each command is self-contained and can be extended independently. Custom Parcel plugins are located in `lib/parcel/` and follow the Parcel plugin architecture.