export class WgetCommandBuilder {
  static build(url, outputDir, mergedConfig) {
    const host = new URL(url).hostname;
    const wgetOpts = mergedConfig.wget || {};
    const args = [
      '--domains', host,
      `--timeout=${mergedConfig.timeout || 10}`,
      `--directory-prefix=${outputDir}`
    ];

    // Execute directives
    for (const e of wgetOpts.execute || []) {
      args.push('--execute', e);
    }

    // HTTP User-Agent
    if (mergedConfig.userAgent) {
      args.push(`--user-agent='${mergedConfig.userAgent}'`);
    }

    // Simple boolean flags
    if (wgetOpts.noClobber) args.push('--no-clobber');
    if (wgetOpts.noHostDirectories) args.push('--no-host-directories');
    if (wgetOpts.adjustExtension) args.push('--adjust-extension');

    // Exclude directories
    if (wgetOpts.excludeDirectories) {
      args.push(`--exclude-directories=${wgetOpts.excludeDirectories}`);
    }

    // Reject patterns
    if (wgetOpts.reject && Array.isArray(wgetOpts.reject) && wgetOpts.reject.length > 0) {
      args.push(`--reject=${wgetOpts.reject.join(',')}`);
    }

    // Proxy settings
    if (wgetOpts.noProxy) {
      args.push('--no-proxy');
    } else if (wgetOpts.proxy) {
      this.addProxyArgs(args, wgetOpts.proxy);
    }

    // Existing options we continue to honor
    if (wgetOpts.convertLinks) args.push('--convert-links');
    if (wgetOpts.pageRequisites) args.push('--page-requisites');
    if (wgetOpts.restrictFileNames) args.push(`--restrict-file-names=${wgetOpts.restrictFileNames}`);
    if (wgetOpts.noParent) args.push('--no-parent');

    // Wait interval
    if (wgetOpts.wait !== undefined && wgetOpts.wait !== null && wgetOpts.wait !== '') {
      args.push(`--wait=${wgetOpts.wait}`);
    }

    // Mirror overrides recursive/level
    if (wgetOpts.mirror) {
      args.push('--mirror');
    } else if (wgetOpts.recursive) {
      args.push('--recursive', `--level=${mergedConfig.depth || 1}`);
    }

    args.push(url);

    return {
      command: 'wget',
      args: args
    };
  }

  static addProxyArgs(args, proxyUrl) {
    // For wget, we use --execute to set proxy
    // Using --execute is more explicit and reliable
    if (proxyUrl.startsWith('http://')) {
      args.push('--execute', `http_proxy=${proxyUrl}`);
    } else if (proxyUrl.startsWith('https://')) {
      args.push('--execute', `https_proxy=${proxyUrl}`);
    } else {
      args.push('--execute', `http_proxy=${'http://' + proxyUrl}`);
      args.push('--execute', `https_proxy=${'https://' + proxyUrl}`);
    }
  }
}