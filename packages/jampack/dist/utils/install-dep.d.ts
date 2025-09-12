import { GlobalState } from '../state.js';
export declare function install_dependency(state: GlobalState, html_file: string, options: {
    source: {
        npm_package_name: string;
        absolute_path_to_file: string;
        filename: string;
    };
    destination: {
        folder_name: string;
        code_loader: string;
    };
}, appendToBody: Record<string, string>): Promise<void>;
export declare function install_lozad(state: GlobalState, html_file: string, appendToBody: Record<string, string>): Promise<void>;
export declare function install_defer_js(state: GlobalState, _html_file: string, appendToBody: Record<string, string>): Promise<void>;
