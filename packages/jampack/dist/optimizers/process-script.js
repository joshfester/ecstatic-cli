function shouldProcessScript(options, isAboveTheFold) {
    if (options.when === 'never')
        return false;
    if (options.when === 'below-the-fold' && isAboveTheFold)
        return false;
    return true;
}
function matchesPatterns(src, innerHTML, options) {
    // For external scripts, check src patterns
    if (src && options.src_include.length > 0) {
        if (options.src_include.some(pattern => !!src.match(pattern))) {
            return true;
        }
    }
    // For inline scripts, check content patterns
    if (innerHTML && options.content_include.length > 0) {
        if (options.content_include.some(pattern => !!innerHTML.match(pattern))) {
            return true;
        }
    }
    return false;
}
export async function processScript(state, _htmlfile, script, isAboveTheFold, _appendToBody) {
    const type = script.attr('type');
    // Skip non-javascript
    if (type && type !== 'module' && type !== 'text/javascript') {
        return;
    }
    const offloadOptions = state.options.js.offload;
    const deferOptions = state.options.js.defer;
    const src = script.attr('src');
    const innerHTML = script.html();
    // Try offload first (takes priority over defer)
    if (shouldProcessScript(offloadOptions, isAboveTheFold)
        && matchesPatterns(src, innerHTML, offloadOptions)) {
        if (type) {
            script.attr('data-type', type);
        }
        // Set type to text/plain to prevent execution
        script.attr('type', 'text/plain');
        // Add data-offload attribute
        script.attr('data-offload', '');
        // Mark that we have offloaded scripts
        state.hasOffloadedScripts = true;
        return;
    }
    // Try defer if script was not offloaded
    if (shouldProcessScript(deferOptions, isAboveTheFold)
        && matchesPatterns(src, innerHTML, deferOptions)
        && !script.attr('async')) {
        script.attr('defer', '');
    }
}
