# @wordpress/sync – Block Editor Handbook | Developer.WordPress.org

Sync entity data between peers for real-time collaboration using [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) documents.

This package provides the syncing layer for real-time collaboration in the WordPress editor. It is built on [Yjs](https://docs.yjs.dev/), a CRDT implementation that enables multiple users to edit shared data concurrently without conflicts.

See [CODE.md](https://developer.chrome.com/CODE.md) for architecture details.

## [Installation](#installation)

Install the module

```
npm install @wordpress/sync --save

```

## [API](#api)

### [Awareness](#awareness)

The Awareness protocol should not be considered a public API. It is a third-party library that will experience breaking changes in the future.

In general, awareness for core entity types is implemented by the `core-data` package and third-party Yjs providers should not provide their own awareness implementation. However, it may be desirable for custom entities to have a custom awareness implementation.

### [privateApis](#privateapis)

Private @wordpress/sync APIs.

### [Y](#y)

Yjs should not be considered a public API. It is a third-party library that *will* experience breaking changes in the future. However, in order to allow third-party plugins to provide their own Yjs providers / sync transport, they must import and consume **our instance** of Yjs due to this bug / feature:

[https://github.com/yjs/yjs/issues/438](https://github.com/yjs/yjs/issues/438)

In other words, external code must be able to import Yjs from the `@wordpress/sync` package in their code, e.g.:

```
import { Y } from '@wordpress/sync';

```

Additionally, this import must resolve to `wp.sync` via `DependencyExtractionWebpackPlugin`. If you are using an older version of `@wordpress/scripts` that does not treat `@wordpress/sync` as an unbundled package, then you can use Webpack externals to manually resolve the package to the global `wp.sync` variable:

```
externals: {
  ...existingConfig.externals,
  // Resolve @wordpress/sync to the global `wp.sync` provided by WordPress.
  '@wordpress/sync': 'wp.sync',

  // Resolve Yjs to the global `wp.sync.Y` provided by the sync package.
  // Since dependencies import 'yjs' directly, we need to avoid importing
  // and packaging two different Yjs instances, which would result in this
  // conflict:
  //
  // https://github.com/yjs/yjs/issues/438
  yjs: 'wp.sync.Y',
},

```

### [YJS\_VERSION](#yjs_version)

The major version of Yjs that is bundled and exported by this package. This can be used by third-party code to ensure that they are targeting a compatible version of Yjs.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).