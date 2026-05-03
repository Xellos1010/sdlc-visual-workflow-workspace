# @wordpress/keyboard-shortcuts – Block Editor Handbook | Developer.WordPress.org

Keyboard shortcuts is a generic package that allows registering and modifying shortcuts.

## [Installation](#installation)

Install the module

```
npm install @wordpress/keyboard-shortcuts --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [ShortcutProvider](#shortcutprovider)

Handles callbacks added to context by `useShortcut`. Adding a provider allows to register contextual shortcuts that are only active when a certain part of the UI is focused.

*Parameters*

-   *props* `ShortcutProviderProps`: Props to pass to `div`.

*Returns*

-   Component.

### [store](#store)

Store definition for the keyboard shortcuts namespace.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore](https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore)

### [useShortcut](#useshortcut)

Attach a keyboard shortcut handler.

*Parameters*

-   *name* `string`: Shortcut name.
-   *callback* `( event: KeyboardEvent ) => void`: Shortcut callback.
-   *options* `UseShortcutOptions`: Shortcut options.
-   *options.isDisabled* `UseShortcutOptions[ 'isDisabled' ]`: Whether to disable the shortcut.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).