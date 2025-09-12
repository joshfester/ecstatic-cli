import browserslist from 'browserslist';
import { browserslistToTargets, transform as lightcss, transformStyleAttribute as lightcssStyleAttribute, } from 'lightningcss';
export const defaultTargets = () => browserslistToTargets(browserslist('defaults'));
export async function compressCSS({ targets }, originalCode, type) {
    // Compress with lightningcss
    let lightCSSData = undefined;
    try {
        const options = {
            code: originalCode,
            minify: true,
            sourceMap: false,
            targets,
        };
        if (type === 'inline') {
            lightCSSData = lightcssStyleAttribute(options).code;
        }
        else {
            lightCSSData = lightcss({
                filename: 'style.css',
                ...options,
            }).code;
        }
    }
    catch (e) {
        // Error while processing with lightningcss
        // Take original code
        // TODO catch SyntaxError and report a Warning
    }
    let resultBuffer = undefined;
    if (lightCSSData && lightCSSData.length < originalCode.length) {
        resultBuffer = Buffer.from(lightCSSData);
    }
    return resultBuffer || originalCode;
}
export function loadConfigCSS(state) {
    const { options } = state;
}
