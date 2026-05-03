# @wordpress/html-entities – Block Editor Handbook | Developer.WordPress.org

HTML entity utilities for WordPress.

## [Installation](#installation)

Install the module

```
npm install @wordpress/html-entities --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [decodeEntities](#decodeentities)

Decodes the HTML entities from a given string.

*Usage*

```
import { decodeEntities } from '@wordpress/html-entities';

const result = decodeEntities( '&aacute;' );
console.log( result ); // result will be "á"

```

*Parameters*

-   *html* `string`: String that contain HTML entities.

*Returns*

-   `string`: The decoded string.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).