export class HttrackCommandBuilder {
  static build(url, outputDir, mergedConfig) {
    const httrackConfig = mergedConfig.httrack || {};
    const extDepth = httrackConfig.extDepth;
    const sockets = httrackConfig.sockets;
    const args = [
      url,
      '-O', outputDir,
      `--depth=${mergedConfig.depth}`,
      `--ext-depth=${extDepth}`,
      `--sockets=${sockets}`,
      `--timeout=${mergedConfig.timeout}`,
      '-a', // stay on same host
      '--verbose' // output to console
    ];

    // Add configurable options
    if (httrackConfig.debugLog) args.push('--debug-log');
    if (httrackConfig.near) args.push('--near');

    // Handle dir_up_down option for directory traversal
    if (httrackConfig.dir_up_down === 'up') {
      args.push('-U');
    } else if (httrackConfig.dir_up_down === 'down') {
      args.push('-D');
    } else if (httrackConfig.dir_up_down === 'both') {
      args.push('-B');
    }

    // HTTP User-Agent
    if (mergedConfig.userAgent) {
      // The user agent needs to be wrapped in quotes because it contains spaces and special chars
      args.push(`--user-agent='${mergedConfig.userAgent}'`);
    }

    // Proxy settings
    if (mergedConfig.noProxy) {
      // Skip proxy configuration even if proxy is set
    } else if (mergedConfig.proxy) {
      this.addProxyArgs(args, mergedConfig.proxy);
    }

    if (httrackConfig.keepLinks !== undefined) args.push(`--keep-links=${httrackConfig.keepLinks}`);
    if (httrackConfig.robots !== undefined) args.push(`--robots=${httrackConfig.robots}`);
    if (httrackConfig.connections_per_second !== undefined) args.push(`-%c${httrackConfig.connections_per_second}`);
    if (httrackConfig.updatehack) args.push('--updatehack');
    if (httrackConfig.mirror) args.push('--mirror');

    // Flow control options
    if (mergedConfig.retries !== undefined) args.push(`-R${mergedConfig.retries}`);
    if (mergedConfig.hostControl !== undefined) args.push(`-H${mergedConfig.hostControl}`);

    // Process filters
    const filters = this.buildFilterList(url, httrackConfig, mergedConfig);
    args.push(...filters);

    return {
      command: 'httrack',
      args: args
    };
  }

  static addProxyArgs(args, proxyUrl) {
    // Handle proxy URL - httrack uses -P format: proxy:port or user:pass@proxy:port
    let proxyArg = proxyUrl;

    // Remove protocol prefix if present since httrack -P doesn't expect it
    proxyArg = proxyArg.replace(/^https?:\/\//, '');

    args.push(`-P ${proxyArg}`);
  }

  static buildFilterList(url, httrackConfig, mergedConfig) {
    const domain = new URL(url).hostname;
    const filters = [];

    // Always add domain-specific filters first to restrict to target domain
    filters.push('-*'); // Reject all URLs
    filters.push(`+https://${domain}/*`); // Allow URLs from target domain

    // Check if CLI filters are provided (non-empty arrays)
    const excludeFiltersArray = mergedConfig.excludeFilters || [];
    const includeFiltersArray = mergedConfig.includeFilters || [];

    const cliExcludeFilters = excludeFiltersArray.map(filter =>
      filter.startsWith('-') ? filter : `-${filter}`
    );
    const cliIncludeFilters = includeFiltersArray.map(filter =>
      filter.startsWith('+') ? filter : `+${filter}`
    );

    const hasCliFilters = excludeFiltersArray.length > 0 || includeFiltersArray.length > 0;

    if (hasCliFilters) {
      // If CLI filters are provided, use only CLI filters (ignore config filters)
      filters.push(...cliExcludeFilters);
      filters.push(...cliIncludeFilters);
    } else {
      // If no CLI filters, use config filters
      const configFilters = httrackConfig.filters || [];
      const processedConfigFilters = configFilters.map(filter =>
        filter.replace(/\{domain\}/g, domain)
      );
      filters.push(...processedConfigFilters);
    }

    return filters;
  }
}
