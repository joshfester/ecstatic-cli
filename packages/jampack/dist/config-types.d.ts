import type { UrlTransformer } from 'unpic';
export type WebpOptions = {
    effort: number;
    mode: 'lossless' | 'lossly';
    quality: number;
};
export type Options = {
    general: {
        browserslist: string;
    };
    html: {
        add_css_reset_as: 'inline' | 'off';
        sort_attributes: boolean;
    };
    js: {
        compressor: 'esbuild' | 'swc';
        defer: {
            when: 'never' | 'below-the-fold' | 'always';
            src_include: RegExp[];
            content_include: RegExp[];
        };
        offload: {
            when: 'never' | 'below-the-fold' | 'always';
            src_include: RegExp[];
            content_include: RegExp[];
        };
    };
    css: {
        inline_critical_css: boolean;
        browserslist?: string;
    };
    image: {
        embed_size: number;
        srcset_min_width: number;
        srcset_max_width: number;
        srcset_step: number;
        max_width: number;
        src_include: RegExp;
        src_exclude: RegExp | null;
        external: {
            process: 'off' | 'download' | ((attrib_src: string) => Promise<string>);
            src_include: RegExp;
            src_exclude: RegExp | null;
        };
        cdn: {
            process: 'off' | 'optimize';
            src_include: RegExp | null;
            src_exclude: RegExp | null;
            transformer?: UrlTransformer;
        };
        compress: boolean;
        jpeg: {
            options: {
                quality: number;
                mozjpeg: boolean;
            };
        };
        png: {
            options: {
                compressionLevel: number;
            };
        };
        webp: {
            options_lossless: WebpOptions;
            options_lossly: WebpOptions;
        };
        svg: {
            optimization: boolean;
            add_width_and_height: boolean;
        };
    };
    iframe: {
        lazyload: {
            when: 'never' | 'below-the-fold' | 'always';
            how: 'native' | 'js';
        };
    };
    video: {
        autoplay_lazyload: {
            when: 'never' | 'below-the-fold' | 'always';
            how: 'js';
        };
    };
    misc: {
        prefetch_links: 'in-viewport' | 'off';
    };
};
