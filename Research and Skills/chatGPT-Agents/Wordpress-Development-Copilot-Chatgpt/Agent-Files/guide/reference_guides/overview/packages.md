# Package Reference – Block Editor Handbook | Developer.WordPress.org

WordPress exposes a list of JavaScript packages and tools for WordPress development.

For information on creating and managing packages in Gutenberg, see the [packages README](https://developer.chrome.com/packages/README.md). For details on the build system and package configuration, see the [@wordpress/build README](https://developer.chrome.com/packages/wp-build/README.md).

## [Package Guidelines](#package-guidelines)

Packages are the first layer of architecture in Gutenberg. Each package should have a single, clear purpose, include a README, document prerequisites and public APIs, and avoid utility/kitchen-sink patterns. Default to bundled packages unless globals or modules are necessary.

For complete guidelines, see the [package guidelines](https://developer.chrome.com/packages/README.md#package-guidelines) in the packages README.

## [Using the packages via WordPress global](#using-the-packages-via-wordpress-global)

JavaScript packages are available as a registered script in WordPress and can be accessed using the `wp` global variable.

If you wanted to use the `PlainText` component from the block editor module, first you would specify `wp-block-editor` as a dependency when you enqueue your script:

```
wp_enqueue_script(
    'my-custom-block',
    plugins_url( $block_path, __FILE__ ),
    array( 'react', 'wp-blocks', 'wp-block-editor', 'wp-i18n' )
);

```

After the dependency is declared, you can access the module in your JavaScript code using the global `wp` like so:

```
const { PlainText } = wp.blockEditor;

```

## [Using the packages via npm](#using-the-packages-via-npm)

All the packages are also available on [npm](https://www.npmjs.com/org/wordpress) if you want to bundle them in your code.

Using the same `PlainText` example, you would install the block editor module with npm:

```
npm install @wordpress/block-editor --save

```

Once installed, you can access the component in your code using:

```
import { PlainText } from '@wordpress/block-editor';

```

## [Testing JavaScript code from a specific major WordPress version](#testing-javascript-code-from-a-specific-major-wordpress-version)

There is a way to quickly install a version of the individual WordPress package used with a given WordPress major version using [npm distribution tags](https://docs.npmjs.com/cli/v8/commands/npm-dist-tag) (example for WordPress `5.8.x`):

```
npm install @wordpress/block-editor@wp-5.8

```

It’s also possible to update all existing WordPress packages in the project with a single command:

```
npx @wordpress/scripts packages-update --dist-tag=wp-5.8

```

All major WordPress versions starting from `5.7.x` are supported (e.g., `wp-5.7` or `wp-6.0`). Each individual dist-tag always points to the latest bug fix release for that major version line.