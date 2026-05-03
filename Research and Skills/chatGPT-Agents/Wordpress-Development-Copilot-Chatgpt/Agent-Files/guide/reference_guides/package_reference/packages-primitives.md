# @wordpress/primitives

Primitives to be used cross-platform.

## [Installation](#installation)

Install the module

```
npm install @wordpress/primitives --save

```

## [Usage](#usage)

```
import { SVG, Path } from '@wordpress/primitives';

const myElement = (
    <SVG
        width="18"
        height="18"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
    >
        <Path d="M4.5 9l5.6-5.7 1.4 1.5L7.3 9l4.2 4.2-1.4 1.5L4.5 9z" />
    </SVG>
);

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).