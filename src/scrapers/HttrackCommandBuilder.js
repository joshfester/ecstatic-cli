export class HttrackCommandBuilder {
  static build(url, outputDir, mergedConfig) {
    const httrackConfig = mergedConfig.httrack || {};
    const extDepth = httrackConfig.extDepth;
    const sockets = httrackConfig.sockets || 16;
    const args = [
      url,
      '-O', outputDir,
      `--depth=${mergedConfig.depth}`,
      `--ext-depth=${extDepth}`,
      `--sockets=${sockets}`,
      `--timeout=${mergedConfig.timeout}`
    ];

    // Add configurable options
    if (httrackConfig.debugLog) args.push('--debug-log');
    if (httrackConfig.near) args.push('--near');

    // Always pass -a flag (stay on same host)
    args.push('-a');

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
    if (httrackConfig.connections_per_second) args.push(`-%c${httrackConfig.connections_per_second}`);
    if (httrackConfig.updatehack) args.push('--updatehack');
    if (httrackConfig.mirror) args.push('--mirror');

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

    // Start with config filters and substitute domain placeholders
    const configFilters = httrackConfig.filters || [];
    const processedConfigFilters = configFilters.map(filter =>
      filter.replace(/\{domain\}/g, domain)
    );

    // Add CLI exclude filters (with - prefix)
    const cliExcludeFilters = (mergedConfig.excludeFilters || []).map(filter =>
      filter.startsWith('-') ? filter : `-${filter}`
    );

    // Add CLI include filters (with + prefix)  
    const cliIncludeFilters = (mergedConfig.includeFilters || []).map(filter =>
      filter.startsWith('+') ? filter : `+${filter}`
    );

    // Combine all filters: config filters first, then CLI filters
    // CLI filters have precedence due to httrack's last-rule-wins behavior
    filters.push(...processedConfigFilters);
    filters.push(...cliExcludeFilters);
    filters.push(...cliIncludeFilters);

    return filters;
  }
}