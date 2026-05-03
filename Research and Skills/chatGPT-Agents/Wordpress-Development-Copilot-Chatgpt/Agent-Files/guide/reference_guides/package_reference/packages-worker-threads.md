# @wordpress/worker-threads – Block Editor Handbook | Developer.WordPress.org

Utilities for type-safe Web Worker communication with RPC (Remote Procedure Call).

This package provides a simple and efficient way to communicate between the main thread and Web Workers, automatically handling:

-   Promise-based async method calls
-   Automatic transferable detection (ArrayBuffer, etc.)
-   Type-safe API with full TypeScript support
-   Error propagation from worker to main thread

## [Installation](#installation)

Install the module:

```
npm install @wordpress/worker-threads

```

## [Usage](#usage)

### [Worker Thread](#worker-thread)

Create a worker file that exposes methods to the main thread:

```
// worker.ts
import { expose } from '@wordpress/worker-threads/worker';

const api = {
    async processImage( buffer: ArrayBuffer, quality: number ): Promise<ArrayBuffer> {
        // ... image processing logic
        return resultBuffer;
    },

    async calculateSum( a: number, b: number ): Promise<number> {
        return a + b;
    },
};

expose( api );

// Export the type for use with wrap() on the main thread
export type WorkerAPI = typeof api;

```

### [Main Thread](#main-thread)

Wrap the worker to get a type-safe proxy:

```
// main.ts
import { wrap, terminate } from '@wordpress/worker-threads';
import type { WorkerAPI } from './worker';

// Create the worker
const worker = new Worker( new URL( './worker.js', import.meta.url ), {
    type: 'module',
} );

// Wrap it to get the RPC proxy
const api = wrap<WorkerAPI>( worker );

// Call methods as async functions
const result = await api.processImage( imageBuffer, 0.82 );
const sum = await api.calculateSum( 1, 2 );

// Clean up when done
terminate( api );

```

## [API Reference](#api-reference)

### [Main Thread API](#main-thread-api)

#### [wrap<T>( worker: Worker ): Remote<T>](#wrapt-worker-worker-remotet)

Wraps a Worker to provide a type-safe RPC interface. The returned proxy object allows calling methods on the worker as if they were local async functions.

#### [terminate( remote: Remote<unknown> ): void](#terminate-remote-remoteunknown-void)

Terminates a wrapped worker and cleans up resources. Any pending calls will be rejected.

### [Worker Thread API](#worker-thread-api)

#### [expose<T>( target: T ): void](#exposet-target-t-void)

Exposes an object’s methods to be called from the main thread. Should be called once in the worker script.

### [Types](#types)

#### [Remote<T>](#remotet)

A type that converts all methods of `T` to their async versions. Each method returns `Promise<Awaited<ReturnType>>`.

## [Features](#features)

### [Automatic Transferable Detection](#automatic-transferable-detection)

The package automatically detects and transfers `ArrayBuffer` and other transferable objects, providing zero-copy performance for large data:

```
// ArrayBuffers are automatically transferred, not copied
const result = await api.processImage( largeImageBuffer );

```

### [Error Handling](#error-handling)

Errors thrown in the worker are properly propagated to the main thread:

```
try {
    await api.riskyOperation();
} catch ( error ) {
    console.error( 'Worker error:', error.message );
}

```

### [TypeScript Support](#typescript-support)

Full type inference for method signatures:

```
// TypeScript knows the return type and parameter types
const result: ArrayBuffer = await api.processImage( buffer, 0.82 );

```

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).