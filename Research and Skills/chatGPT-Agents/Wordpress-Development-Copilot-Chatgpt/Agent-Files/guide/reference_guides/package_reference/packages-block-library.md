# @wordpress/block-library – Block Editor Handbook | Developer.WordPress.org

Block library for the WordPress editor.

## [Installation](#installation)

Install the module

```
npm install @wordpress/block-library --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [registerCoreBlocks](#registercoreblocks)

Function to register core blocks provided by the block editor.

*Usage*

```
import { registerCoreBlocks } from '@wordpress/block-library';

registerCoreBlocks();

```

*Parameters*

-   *blocks* `Array`: An optional array of the core blocks being registered.

## [Registering individual blocks](#registering-individual-blocks)

1.  When you only care about registering the block when file gets imported:
    ```
    import '@wordpress/block-library/build-module/verse/init';
    
    ```
    
2.  When you want to use the reference to the block after it gets automatically registered:
    ```
    import verseBlock from '@wordpress/block-library/build-module/verse/init';
    
    ```
    
3.  When you need a full control over when the block gets registered:
    ```
    import { init } from '@wordpress/block-library/build-module/verse';
    
    const verseBlock = init();
    
    ```
    

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).

### [Adding new blocks](#adding-new-blocks)

![⚠️](https://s.w.org/images/core/emoji/17.0.2/svg/26a0.svg) Adding new blocks to this package **requires** additional steps!

1.  Do not forget to register a new core block in the [`index.js`](https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/index.js) file of this package. For example, if you were to add the new core block called `core/blinking-paragraph`, you would have to add something like:
    ```
    // packages/block-library/src/index.js
    import * as blinkingParagraph from './blinking-paragraph';
    
    ```
    
    Then add `blinkingParagraph` to the list in the `getAllBlocks()` function.
    
    If it’s experimental, add the following property to `block.json`:
    
    ```
    {
        "__experimental": "true"
    }
    
    ```
    
2.  Register the block in the `gutenberg_reregister_core_block_types()` function of the [`lib/blocks.php`](https://github.com/WordPress/gutenberg/blob/trunk/lib/blocks.php) file. Add it to the `block_folders` array if it’s a [static block](https://developer.wordpress.org/block-editor/getting-started/glossary/#static-block) or to the `block_names` array if it’s a [dynamic block](https://developer.wordpress.org/block-editor/getting-started/glossary/#dynamic-block).
3.  Add `init.js` file to the directory of the new block:
    
    ```
    /**
     * Internal dependencies
     */
    import { init } from './';
    
    export default init();
    
    ```
    
    This file is used when using the option to register individual block from the `@wordpress/block-library` package.
    
4.  If the block exposes a script module on the front end, it must be included in the package’s `package.json` file in the `wpScriptModules` object. This will include the script module when it’s bundled for use in WordPress. See [the packages README for more details.](https://developer.chrome.com/README.md):
    
    ```
    {
        "name": "@wordpress/block-library",
        "wpScriptModuleExports": {
            "./blinking-paragraph/view": "./build-module/blinking-paragraph/view.js",
            "./image/view": "./build-module/image/view.js"
            // Add any new script modules here.
        }
    }
    
    ```
    
    For every dynamic block, you need to manually enqueue the view script module in `render_callback` of the block, example:
    
    ```
    function render_block_core_blinking_paragraph( $attributes, $content ) {
        $should_load_view_script = ! empty( $attributes['isInteractive'] );
        if ( $should_load_view_script ) {
            wp_enqueue_script_module( '@wordpress/block-library/blinking-paragraph' );
        }
    
        return $content;
    }
    
    ```
    

### [Naming convention for PHP functions](#naming-convention-for-php-functions)

All PHP function names declared within the subdirectories of the `packages/block-library/src/` directory should start with one of the following prefixes:

-   `block_core_<directory_name>`
-   `render_block_core_<directory_name>`
-   `register_block_core_<directory_name>`

In this context, `<directory_name>` represents the name of the directory where the corresponding `.php` file is located.  
The directory name is converted to lowercase, and any characters except for letters and digits are replaced with underscores.

#### [Example:](#example)

For the PHP functions declared in the `packages/block-library/src/my-block/index.php` file, the correct prefixes would be:

-   `block_core_my_block`
-   `render_block_core_my_block`
-   `register_block_core_my_block`

#### [Using plugin-specific prefixes/suffixes](#using-plugin-specific-prefixes-suffixes)

Unlike in [PHP code in the /lib directory](https://github.com/WordPress/gutenberg/blob/trunk/lib/README.md), you should generally avoid applying plugin-specific prefixes/suffixes such as `gutenberg_` to functions and other code in block PHP files.

There are times, however, when blocks may need to use Gutenberg functions even when a Core-equivalent exists, for example, where a Gutenberg function relies on code that is only available in the plugin.

In such cases, you can use the corresponding Core `wp_` function in the block PHP code, and add its name to a list of prefixed functions in the package.json.

At build time, Webpack will search for `wp_` functions in that list and replace them with their `gutenberg_` equivalents. This process ensures that the plugin calls the `gutenberg_` functions, but the block will still call the Core `wp_` function when updates are back ported.

Webpack assumes that, prefixes aside, the functions’ names are identical: `wp_get_something_useful()` will be replaced with `gutenberg_get_something_useful()`.