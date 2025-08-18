# Resolver

Resolver plugins are responsible for turning a dependency specifier into a full file path that will be processed by transformers. Resolvers run in a pipeline until one of them returns a result. See [Dependency resolution](https://parceljs.org/features/dependency-resolution/) for details on how the default resolver works.

## Example

[#](#example)

This example overrides the resolution of 
```
special-module
```
, and otherwise returns 
```
null
```
 to allow the next resolver in the pipeline to handle the dependency. See [Resolvers](https://parceljs.org/features/plugins/#resolvers) in the Parcel configuration docs for details on how this works.

```javascript
import {Resolver} from '@parcel/plugin';  
import path from 'path';

export default new Resolver({  
  async resolve({specifier}) {  
    if (specifier === 'special-module') {  
      return {  
        filePath: path.join(__dirname, 'special-module.js')  
      };  
    }

    // Let the next resolver in the pipeline handle  
    // this dependency.  
    return null;  
  }  
});


```

## Loading configuration

[#](#loading-configuration)

Loading configuration from the user’s project should be done in the 
```
loadConfig
```
 method of a Resolver plugin. See [Loading configuration](https://parceljs.org/plugin-system/authoring-plugins/#loading-configuration) for details on how to do this.

**Note**: It's important to use Parcel's config loading mechanism so that the cache can be properly invalidated. Avoid loading files directly from the file system.

## Virtual modules

[#](#virtual-modules)

Rather than resolving to a file on the file system, Resolvers may also return 
```
code
```
 directly. This allows programmatically generating virtual modules on demand. You must still return a 
```
filePath
```
 as well, however, as this indicates where any dependencies in the code should be resolved relative to, as well as how the source code should be processed by transformers (e.g. by file extension).

```javascript
import {Resolver} from '@parcel/plugin';  
import path from 'path';  
  
export default new Resolver({  
  async resolve({specifier}) {  
    if (specifier === 'special-module') {  
      return {  
        filePath: path.join(__dirname, 'special-module.js'),  
        code: 'export default "This is a special module!";'  
      };  
    }  
  
    return null;  
  }  
});
```
[#](#dependency-metadata)

In addition to the 
```
specifier
```
, Resolver plugins also receive a full [
```
Dependency
```
](https://parceljs.org/plugin-system/transformer/#Dependency) object, which includes additional metadata about the dependency. The 
```
specifierType
```
 property indicates how the 
```
specifier
```
 should be interpreted (e.g. ESM, CommonJS, URL, etc.). The 
```
resolveFrom
```
 property specifies the file path where the dependency should be resolved from (e.g. if the specifier is a relative path).

This example resolves relative URLs and paths depending on the 
```
specifierType
```
.

```javascript
import {Resolver} from '@parcel/plugin';  
import path from 'path';  
import {fileURLToPath, pathToFileURL} from 'url';

export default new Resolver({  
  async resolve({specifier, dependency}) {  
    return {  
      filePath: dependency.specifierType === 'url'  
        ? fileURLToPath(  
          new URL(specifier, pathToFileURL(dependency.resolveFrom))  
        )  
        : path.resolve(dependency.resolveFrom, specifier)  
    };  
  }  
});


```

## Excluding modules

[#](#excluding-modules)

The 
```
isExcluded
```
 property can be returned to indicate that a module should be excluded from the build. This example excludes 
```
aws-sdk
```
 which is included in the AWS hosting environment automatically and does not need to be bundled.

```javascript
import {Resolver} from '@parcel/plugin';  
  
export default new Resolver({  
  async resolve({specifier}) {  
    if (specifier === 'aws-sdk') {  
      return {isExcluded: true};  
    }  
  
    return null;  
  }  
});
```

## Cache invalidation

[#](#cache-invalidation)

The results of Resolver plugins are cached by Parcel automatically. If you read any files from the file system during resolution, you’ll need to tell Parcel about them so it can watch them and invalidate the resolution when they change.

The 
```
invalidateOnFileChange
```
 property should be set to an array of all files that were successfully read during resolution. The 
```
invalidateOnFileCreate
```
 property should be set to an array of [
```
FileCreateInvalidation
```
](https://parceljs.org/plugin-system/api/#FileCreateInvalidation) objects describing files that should invalidate the resolution if they were created.

```javascript
import {Resolver} from '@parcel/plugin';  
import path from 'path';  
  
export default new Resolver({  
  async resolve({specifier, options}) {  
    let aliasFile = path.join(options.projectRoot, 'alias.json');  
  
    try {  
      let aliasConfig = await options.inputFS.readFile(aliasFile);  
      let aliases = JSON.parse(aliasConfig);  
      return {  
        filePath: aliases[specifier] || null,  
        invalidateOnFileChange: [aliasFile]  
      };  
    } catch (err) {  
      return {  
        invalidateOnFileCreate: [{filePath: aliasFile}]  
      };  
    }  
  }  
});
```

## Diagnostics

[#](#diagnostics)

A Resolver plugin may encounter errors during resolution. When this happens, it may either 
```
throw
```
 an error or return 
```
diagnostics
```
. If a Resolver throws, the resolution process is immediately halted, and the error is shown to the user.

If a Resolver instead returns 
```
diagnostics
```
, resolution continues to the next Resolver plugin. If none of the Resolver plugins are able to resolve the dependency, then all diagnostics from all Resolver plugins are shown to the user.

```javascript
import {Resolver} from '@parcel/plugin';  
import path from 'path';  
  
export default new Resolver({  
  async resolve({specifier, options}) {  
    let aliasFile = path.join(options.projectRoot, 'alias.json');  
  
    try {  
      let aliasConfig = await options.inputFS.readFile(aliasFile);  
      let aliases = JSON.parse(aliasConfig);  
      return {  
        filePath: aliases[specifier] || null,  
        invalidateOnFileChange: [aliasFile]  
      };  
    } catch (err) {  
      return {  
        invalidateOnFileCreate: [{filePath: aliasFile}],  
        diagnostics: [  
        {  
          message: 'Could not read alias.json',  
          hints: ['Create an alias.json file in the project root.']  
        }]  
      };  
    }  
  }  
});
```

See [Diagnostics](https://parceljs.org/plugin-system/logging/#diagnostics) for more detail.

## Side effects

[#](#side-effects)

Resolvers may also return a 
```
sideEffects
```
 property which indicates whether the asset may have side effects when executed. This usually corresponds to the same property in 
```
package.json
```
, and is used for [scope hoisting](https://parceljs.org/features/scope-hoisting/).

## Relevant API

[#](#relevant-api)

#### ResolveResult [_parcel/packages/core/types/index.js:1539_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1539)

```
type ResolveResult = {|
```
```
  +filePath?: [FilePath](https://parceljs.org/plugin-system/api/#FilePath),
```

An absolute path to the resolved file.

```
  +pipeline?: ?string,
```

An optional named pipeline to use to compile the resolved file.

```
  +query?: URLSearchParams,
```

Query parameters to be used by transformers when compiling the resolved file.

```
  +isExcluded?: boolean,
```

Whether the resolved file should be excluded from the build.

```
  +priority?: [DependencyPriority](https://parceljs.org/plugin-system/api/#DependencyPriority),
```

Overrides the priority set on the dependency.

```
  +sideEffects?: boolean,
```

Corresponds to [BaseAsset](https://parceljs.org/plugin-system/transformer/#BaseAsset)'s 
```
sideEffects
```
.

```
  +code?: string,
```

The code of the resolved asset. If provided, this is used rather than reading the file from disk.

```
  +canDefer?: boolean,
```

Whether this dependency can be deferred by Parcel itself (true by default).

```
  +diagnostics?: [Diagnostic](https://parceljs.org/plugin-system/logging/#Diagnostic) | Array<[Diagnostic](https://parceljs.org/plugin-system/logging/#Diagnostic)>,
```

A resolver might return diagnostics to also run subsequent resolvers while still providing a reason why it failed.

```
  +meta?: [JSONObject](https://parceljs.org/plugin-system/api/#JSONObject),
```

Is spread (shallowly merged) onto the request's dependency.meta

```
  +invalidateOnFileCreate?: Array<[FileCreateInvalidation](https://parceljs.org/plugin-system/api/#FileCreateInvalidation)>,
```

A list of file paths or patterns that should invalidate the resolution if created.

```
  +invalidateOnFileChange?: Array<[FilePath](https://parceljs.org/plugin-system/api/#FilePath)>,
```

A list of files that should invalidate the resolution if modified or deleted.

```
  +invalidateOnEnvChange?: Array<string>,
```

Invalidates the resolution when the given environment variable changes.

```
|}
```

##### Referenced by:

[Resolver](https://parceljs.org/plugin-system/resolver/#Resolver)

#### Resolver [_parcel/packages/core/types/index.js:1723_](https://github.com/parcel-bundler/parcel/blob/0b7187b63729ff1020d0e620967a811c8272ad45/packages/core/types/index.js#L1723)

```
type Resolver<ConfigType> = {|
```
```
  loadConfig?: ({|
    config: [Config](https://parceljs.org/plugin-system/transformer/#Config),
    options: [PluginOptions](https://parceljs.org/plugin-system/api/#PluginOptions),
    logger: [PluginLogger](https://parceljs.org/plugin-system/logging/#PluginLogger),
  |}) => Promise<ConfigType> | ConfigType,
```
```
  resolve({|
    dependency: [Dependency](https://parceljs.org/plugin-system/transformer/#Dependency),
    options: [PluginOptions](https://parceljs.org/plugin-system/api/#PluginOptions),
    logger: [PluginLogger](https://parceljs.org/plugin-system/logging/#PluginLogger),
    specifier: [FilePath](https://parceljs.org/plugin-system/api/#FilePath),
    pipeline: ?string,
    config: ConfigType,
  |}): [Async](https://parceljs.org/plugin-system/api/#Async)<?[ResolveResult](https://parceljs.org/plugin-system/resolver/#ResolveResult)>,
```
```
|}
```