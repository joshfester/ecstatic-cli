import { defaultTargets } from './compressors/css.js';
import default_options from './config-default.js';
export class GlobalState {
    constructor() {
        this.dir = 'dist';
        this.args = {};
        this.options = default_options;
        this.targets = defaultTargets();
        this.compressedFiles = new Set();
        this.hasOffloadedScripts = false;
        this.issues = new Map();
        this.installed_dependencies = new Set();
        this.summary = {
            nbFiles: 0,
            nbFilesCompressed: 0,
            dataLenCompressed: 0,
            dataLenUncompressed: 0,
        };
        this.summaryByExtension = {};
    }
    reportIssue(sourceFile, issue) {
        let issueList = this.issues.get(sourceFile);
        if (issueList === undefined) {
            issueList = [];
            this.issues.set(sourceFile, issueList);
        }
        issueList.push(issue);
    }
    reportSummary(r) {
        const isCompressed = r.compressedSize < r.originalSize ? 1 : 0;
        this.summary.nbFiles++;
        this.summary.nbFilesCompressed += isCompressed;
        this.summary.dataLenUncompressed += r.originalSize;
        this.summary.dataLenCompressed += r.compressedSize;
        if (r.action) {
            let summary = this.summaryByExtension[r.action];
            if (!summary) {
                summary = {
                    nbFiles: 0,
                    nbFilesCompressed: 0,
                    dataLenUncompressed: 0,
                    dataLenCompressed: 0,
                };
                this.summaryByExtension[r.action] = summary;
            }
            summary.nbFiles++;
            summary.nbFilesCompressed += isCompressed;
            summary.dataLenUncompressed += r.originalSize;
            summary.dataLenCompressed += r.compressedSize;
        }
    }
}
