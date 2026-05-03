# @wordpress/prettier-config – Block Editor Handbook | Developer.WordPress.org

WordPress Prettier shareable config for [Prettier](https://prettier.io/).

## [Installation](#installation)

Install the module

```
$ npm install @wordpress/prettier-config --save-dev

```

**Note**: This package requires Node.js version with long-term support status (check [Active LTS or Maintenance LTS releases](https://nodejs.org/en/about/previous-releases)). It is not compatible with older versions.

## [Usage](#usage)

Add this to your `package.json` file:

```
"prettier": "@wordpress/prettier-config"

```

Alternatively, add this to `.prettierrc` file:

```
"@wordpress/prettier-config"

```

Or add this to `.prettierrc.js` file:

```
module.exports = require( '@wordpress/prettier-config' );

```

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).