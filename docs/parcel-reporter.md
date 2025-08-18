# Reporter

Reporter plugins receive events from Parcel as they happen throughout the build process. For example, reporters may write status information to stdout, run a dev server, or generate a bundle analysis report at the end of a build.

## Example

[#](#example)

This example writes the number of bundles and build time to stdout when a build is successful.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'buildSuccess') {  
      let bundles = event.bundleGraph.getBundles();  
      process.stdout.write(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!\n`);  
    }  
  }  
});


```

**Note**: Do not use 
```
console.log
```
 in Reporter plugins. Parcel overrides 
```
console
```
 methods and routes messages to Reporter plugins. This can create an infinite loop in your Reporter. If you intend to write to stdout/stderr, use 
```
process.stdout
```
/
```
process.stderr
```
 instead. If another reporter will handle log events, use the provided 
```
logger
```
. See [Logging](https://parceljs.org/plugin-system/logging/) for more details.

## Build start

[#](#build-start)

The 
```
buildStart
```
 event is emitted when a build is started. In watch mode, it is emitted at the start of each rebuild.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'buildStart') {  
      process.stdout.write('Started build!\n');  
    }  
  }  
});


```

## Build progress

[#](#build-progress)

The 
```
buildProgress
```
 event is emitted throughout the build. It includes a 
```
phase
```
 property that indicates which phase of the build is occurring, and events include additional information specific to the phase. For example, events in the 
```
transforming
```
 phase include a 
```
filePath
```
 property of the asset being transformed. See [
```
BuildProgressEvent
```
](#BuildProgressEvent).

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'buildProgress') {  
      switch (event.phase) {  
        case 'transforming':  
          process.stdout.write(`Transforming ${event.filePath}...\n`);  
          break;  
        case 'resolving':  
          process.stdout.write(`Resolving ${event.dependency.specifier}...\n`);  
          break;  
        case 'bundling':  
          process.stdout.write('Bundling...\n');  
          break;  
        case 'packaging':  
          process.stdout.write(`Packaging ${event.bundle.displayName}...\n`);  
          break;  
        case 'optimizing':  
          process.stdout.write(`Optimizing ${event.bundle.displayName}...\n`);  
         break;  
      }  
    }  
  }  
});


```

## Build success

[#](#build-success)

The 
```
buildSuccess
```
 event is emitted when a build completes successfully. It includes the full 
```
bundleGraph
```
 that was built, the 
```
buildTime
```
, and a list of 
```
changedAssets
```
.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'buildSuccess') {  
      process.stdout.write(`✨ Rebuilt ${event.changedAssets.size} assets in ${event.buildTime}ms!\n`);  
    }  
  }  
});


```

## Build failure

[#](#build-failure)

The 
```
buildFailure
```
 event is emitted when a build is completes with errors. It includes a list of [
```
Diagnostic
```
](https://parceljs.org/plugin-system/logging/#Diagnostic) objects describing the errors. See [Diagnostics](https://parceljs.org/plugin-system/logging/#diagnostics) for details.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'buildFailure') {  
      process.stdout.write(`🚨 Build failed with ${event.diagnostics.length} errors.\n`);  
    }  
  }  
});


```

## Logging

[#](#logging)

All logging in Parcel is routed through Reporter plugins. The 
```
level
```
 property indicates the type of each 
```
log
```
 event. The 
```
info
```
, 
```
warn
```
, 
```
error
```
, and 
```
verbose
```
 log levels include a [
```
Diagnostic
```
](https://parceljs.org/plugin-system/logging/#Diagnostic) object, which provides detail about the context of the log. Other log levels include only a 
```
message
```
 property.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'log') {  
      switch (event.level) {  
        case 'info':  
        case 'verbose':  
          process.stdout.write(`ℹ️ ${event.diagnostic.message}\n`);  
          break;  
        case 'warn':  
          process.stdout.write(`⚠️ ${event.diagnostic.message}\n`);  
          break;  
        case 'error':  
          process.stdout.write(`🚨 ${event.diagnostic.message}\n`);  
          break;  
      }  
    }  
  }  
});


```

**Note**: Do not use 
```
console.log
```
 in Reporter plugins, especially when handling 
```
log
```
 events. Parcel overrides 
```
console
```
 methods and routes messages to Reporter plugins. This will create an infinite loop in your Reporter. Use 
```
process.stdout
```
/
```
process.stderr
```
 instead.

## Watcher events

[#](#watcher-events)

The 
```
watchStart
```
 and 
```
watchEnd
```
 events are emitted when watch mode starts and ends. Unlike 
```
buildStart
```
 and 
```
buildSuccess
```
/
```
buildFailure
```
, the watcher events are only fired once rather than for each build.

```javascript
import {Reporter} from '@parcel/plugin';

export default new Reporter({  
  report({event}) {  
    if (event.type === 'watchStart') {  
      process.stdout.write(`Watching started\n`);  
    } else if (event.type === 'watchEnd') {  
      process.stdout.write(`Watching ended\n`);  
    }  
  }  
});


```

## Relevant API

[#](#relevant-api)

#### ProgressLogEvent [_parcel/packages/core/types/index.js:1742_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1742)

```
type ProgressLogEvent = {|
```
```
  +type: 'log',
```
```
  +level: 'progress',
```
```
  +phase?: string,
```
```
  +message: string,
```
```
|}
```

##### Referenced by:

[LogEvent](https://parceljs.org/plugin-system/reporter/#LogEvent)

#### DiagnosticLogEvent [_parcel/packages/core/types/index.js:1753_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1753)

A log event with a rich diagnostic

```
type DiagnosticLogEvent = {|
```
```
  +type: 'log',
```
```
  +level: 'error' | 'warn' | 'info' | 'verbose',
```
```
  +diagnostics: Array<[Diagnostic](https://parceljs.org/plugin-system/logging/#Diagnostic)>,
```
```
|}
```

##### Referenced by:

[LogEvent](https://parceljs.org/plugin-system/reporter/#LogEvent)

#### TextLogEvent [_parcel/packages/core/types/index.js:1762_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1762)

```
type TextLogEvent = {|
```
```
  +type: 'log',
```
```
  +level: 'success',
```
```
  +message: string,
```
```
|}
```

##### Referenced by:

[LogEvent](https://parceljs.org/plugin-system/reporter/#LogEvent)

#### BuildStartEvent [_parcel/packages/core/types/index.js:1777_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1777)

The build just started.

```
type BuildStartEvent = {|
```
```
  +type: 'buildStart',
```
```
|}
```

##### Referenced by:

[ReporterEvent](https://parceljs.org/plugin-system/reporter/#ReporterEvent)

#### WatchStartEvent [_parcel/packages/core/types/index.js:1785_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1785)

The build just started in watch mode.

```
type WatchStartEvent = {|
```
```
  +type: 'watchStart',
```
```
|}
```

##### Referenced by:

[ReporterEvent](https://parceljs.org/plugin-system/reporter/#ReporterEvent)

#### WatchEndEvent [_parcel/packages/core/types/index.js:1793_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1793)

The build just ended in watch mode.

```
type WatchEndEvent = {|
```
```
  +type: 'watchEnd',
```
```
|}
```

##### Referenced by:

[ReporterEvent](https://parceljs.org/plugin-system/reporter/#ReporterEvent)

#### ResolvingProgressEvent [_parcel/packages/core/types/index.js:1801_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1801)

A new [Dependency](https://parceljs.org/plugin-system/transformer/#Dependency) is being resolved.

```
type ResolvingProgressEvent = {|
```
```
  +type: 'buildProgress',
```
```
  +phase: 'resolving',
```
```
  +dependency: [Dependency](https://parceljs.org/plugin-system/transformer/#Dependency),
```
```
|}
```

##### Referenced by:

[BuildProgressEvent](https://parceljs.org/plugin-system/reporter/#BuildProgressEvent)

#### TransformingProgressEvent [_parcel/packages/core/types/index.js:1811_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1811)

A new [Asset](https://parceljs.org/plugin-system/transformer/#Asset) is being transformed.

```
type TransformingProgressEvent = {|
```
```
  +type: 'buildProgress',
```
```
  +phase: 'transforming',
```
```
  +filePath: [FilePath](https://parceljs.org/plugin-system/api/#FilePath),
```
```
|}
```

##### Referenced by:

[BuildProgressEvent](https://parceljs.org/plugin-system/reporter/#BuildProgressEvent)

#### BundlingProgressEvent [_parcel/packages/core/types/index.js:1821_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1821)

The [BundleGraph](https://parceljs.org/plugin-system/bundler/#BundleGraph) is generated.

```
type BundlingProgressEvent = {|
```
```
  +type: 'buildProgress',
```
```
  +phase: 'bundling',
```
```
|}
```

##### Referenced by:

[BuildProgressEvent](https://parceljs.org/plugin-system/reporter/#BuildProgressEvent)

#### PackagingProgressEvent [_parcel/packages/core/types/index.js:1837_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1837)

A new [Bundle](https://parceljs.org/plugin-system/bundler/#Bundle) is being packaged.

```
type PackagingProgressEvent = {|
```
```
  +type: 'buildProgress',
```
```
  +phase: 'packaging',
```
```
  +bundle: [NamedBundle](https://parceljs.org/plugin-system/bundler/#NamedBundle),
```
```
|}
```

##### Referenced by:

[BuildProgressEvent](https://parceljs.org/plugin-system/reporter/#BuildProgressEvent)

#### OptimizingProgressEvent [_parcel/packages/core/types/index.js:1847_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1847)

A new [Bundle](https://parceljs.org/plugin-system/bundler/#Bundle) is being optimized.

```
type OptimizingProgressEvent = {|
```
```
  +type: 'buildProgress',
```
```
  +phase: 'optimizing',
```
```
  +bundle: [NamedBundle](https://parceljs.org/plugin-system/bundler/#NamedBundle),
```
```
|}
```

##### Referenced by:

[BuildProgressEvent](https://parceljs.org/plugin-system/reporter/#BuildProgressEvent)

#### BuildSuccessEvent [_parcel/packages/core/types/index.js:1868_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1868)

The build was successful.

```
type BuildSuccessEvent = {|
```
```
  +type: 'buildSuccess',
```
```
  +bundleGraph: [BundleGraph](https://parceljs.org/plugin-system/bundler/#BundleGraph)<[PackagedBundle](https://parceljs.org/plugin-system/api/#PackagedBundle)>,
```
```
  +buildTime: number,
```
```
  +changedAssets: Map<string, [Asset](https://parceljs.org/plugin-system/transformer/#Asset)>,
```
```
  +requestBundle: (bundle: [NamedBundle](https://parceljs.org/plugin-system/bundler/#NamedBundle)) => Promise<[BuildSuccessEvent](https://parceljs.org/plugin-system/reporter/#BuildSuccessEvent)>,
```
```
|}
```

##### Referenced by:

[BuildEvent](https://parceljs.org/plugin-system/reporter/#BuildEvent), [ReporterEvent](https://parceljs.org/plugin-system/reporter/#ReporterEvent)

#### BuildFailureEvent [_parcel/packages/core/types/index.js:1880_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1880)

The build failed.

```
type BuildFailureEvent = {|
```
```
  +type: 'buildFailure',
```
```
  +diagnostics: Array<[Diagnostic](https://parceljs.org/plugin-system/logging/#Diagnostic)>,
```
```
|}
```

##### Referenced by:

[BuildEvent](https://parceljs.org/plugin-system/reporter/#BuildEvent), [ReporterEvent](https://parceljs.org/plugin-system/reporter/#ReporterEvent)

#### ValidationEvent [_parcel/packages/core/types/index.js:1894_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1894)

A new file is being validated.

```
type ValidationEvent = {|
```
```
  +type: 'validation',
```
```
  +filePath: [FilePath](https://parceljs.org/plugin-system/api/#FilePath),
```
```
|}
```