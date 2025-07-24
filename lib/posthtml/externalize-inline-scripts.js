// ES module version
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default function externalise(opts = {}) {
    const outDir = opts.dir || 'inline';
    
    return function (tree) {
        tree.match({ tag: 'script' }, node => {
            // Handle external scripts - just add defer attribute
            if (node.attrs && node.attrs.src) {
                node.attrs = { ...(node.attrs || {}), defer: '' };
                return node;
            }
            
            const code = (node.content || []).join('').trim();
            if (!code) return node; // nothing to do

            // deterministic file name based on content hash
            const hash = crypto.createHash('sha1').update(code).digest('hex').slice(0, 8);
            const fileName = `${outDir}/inline-${hash}.js`;

            // make sure directory exists and write the file once
            // Write relative to the HTML file's directory
            const htmlDir = path.dirname(path.resolve(process.cwd(), './scraped/web/index.html'));
            const filePath = path.resolve(htmlDir, fileName);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, code, 'utf8');
            }

            // swap inline for external script with defer
            node.attrs = { ...(node.attrs || {}), src: fileName, defer: '' };
            delete node.content;
            return node;
        });

        return tree;
    };
}
