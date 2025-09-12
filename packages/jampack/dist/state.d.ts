export type Args = {
    nowrite?: boolean;
    nocache?: boolean;
    cache_folder?: string;
    sequential_compress?: boolean;
};
export type ReportItem = {
    action: string;
    originalSize: number;
    compressedSize: number;
};
type Summary = {
    nbFiles: number;
    nbFilesCompressed: number;
    dataLenUncompressed: number;
    dataLenCompressed: number;
};
type Issue = {
    type: 'invalid' | 'a11y' | 'perf' | 'erro' | 'fix' | 'warn';
    msg: string;
};
export declare class GlobalState {
    dir: string;
    args: Args;
    options: import("./config-types.js").Options;
    targets: import("lightningcss").Targets;
    compressedFiles: Set<string>;
    hasOffloadedScripts: boolean;
    issues: Map<string, Issue[]>;
    installed_dependencies: Set<string>;
    summary: Summary;
    summaryByExtension: Record<string, Summary>;
    vfs?: typeof import('fs/promises');
    onAnalysedFile?: (file: string) => void;
    reportIssue(sourceFile: string, issue: Issue): void;
    reportSummary(r: ReportItem): void;
}
export {};
