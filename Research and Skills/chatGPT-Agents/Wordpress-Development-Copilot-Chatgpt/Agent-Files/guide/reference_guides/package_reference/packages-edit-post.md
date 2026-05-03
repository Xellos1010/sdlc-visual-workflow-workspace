# @wordpress/edit-post – Block Editor Handbook | Developer.WordPress.org

Edit Post Module for WordPress.

> This package is meant to be used only with WordPress core. Feel free to use it in your own project but please keep in mind that it might never get fully documented.

## [Installation](#installation)

Install the module

```
npm install @wordpress/edit-post

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Extending the post editor UI](#extending-the-post-editor-ui)

Extending the editor UI can be accomplished with the `registerPlugin` API, allowing you to define all your plugin’s UI elements in one place.

Refer to [the plugins module documentation](https://github.com/WordPress/gutenberg/tree/HEAD/packages/plugins/README.md) for more information.

The components exported through the API can be used with the `registerPlugin` ([see documentation](https://github.com/WordPress/gutenberg/tree/HEAD/packages/plugins/README.md)) API.  
They can be found in the global variable `wp.editPost` when defining `wp-edit-post` as a script dependency.

## [API](#api)

### [initializeEditor](#initializeeditor)

Initializes and returns an instance of Editor.

*Parameters*

-   *id* `string`: Unique identifier for editor instance.
-   *postType* `string`: Post type of the post to edit.
-   *postId* `Object`: ID of the post to edit.
-   *settings* `?Object`: Editor settings object.
-   *initialEdits* `Object`: Programmatic edits to apply initially, to be considered as non-user-initiated (bypass for unsaved changes prompt).

*Related*

-   PluginBlockSettingsMenuItem in @wordpress/editor package.

### [PluginDocumentSettingPanel](#plugindocumentsettingpanel)

*Related*

-   PluginDocumentSettingPanel in @wordpress/editor package.

*Related*

-   PluginMoreMenuItem in @wordpress/editor package.

### [PluginPostPublishPanel](#pluginpostpublishpanel)

*Related*

-   PluginPostPublishPanel in @wordpress/editor package.

### [PluginPostStatusInfo](#pluginpoststatusinfo)

*Related*

-   PluginPostStatusInfo in @wordpress/editor package.

### [PluginPrePublishPanel](#pluginprepublishpanel)

*Related*

-   PluginPrePublishPanel in @wordpress/editor package.

*Related*

-   PluginSidebar in @wordpress/editor package.

*Related*

-   PluginSidebarMoreMenuItem in @wordpress/editor package.

### [reinitializeEditor](#reinitializeeditor)

Used to reinitialize the editor after an error. Now it’s a deprecated noop function.

### [store](#store)

Store definition for the edit post namespace.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore](https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore)

*Type*

-   `Object`

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).