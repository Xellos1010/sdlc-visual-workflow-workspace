# Scripts – Block Editor Handbook | Developer.WordPress.org

The editor provides several vendor and internal scripts to plugin developers. Script names, handles, and descriptions are documented in the table below.

## [WordPress scripts](#wordpress-scripts)

The editor includes a number of packages to enable various pieces of functionality. Plugin developers can utilize them to create blocks, editor plugins, or generic plugins.

Script Name

Handle

Description

[Blob](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-blob/)

wp-blob

Blob utilities

[Block Library](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-block-library/)

wp-block-library

Block library for the editor

[Blocks](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-blocks/)

wp-blocks

Block creations

[Block Serialization Default Parser](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-block-serialization-default-parser/)

wp-block-serialization-default-parser

Default block serialization parser implementations for WordPress documents

[Block Serialization Spec Parser](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-block-serialization-spec-parser/)

wp-block-serialization-spec-parser

Grammar file (grammar.pegjs) for WordPress posts

[Components](https://developer.wordpress.org/block-editor/reference-guide/components/)

wp-components

Generic components to be used for creating common UI elements

[Compose](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-compose/)

wp-compose

Collection of handy Higher Order Components (HOCs)

[Core Data](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-core-data/)

wp-core-data

Simplify access to and manipulation of core WordPress entities

[Data](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-data/)

wp-data

Data module serves as a hub to manage application state for both plugins and WordPress itself

[Date](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-date/)

wp-date

Date module for WordPress

[Deprecated](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-deprecated/)

wp-deprecated

Utility to log a message to notify developers about a deprecated feature

[Dom](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-dom/)

wp-dom

DOM utilities module for WordPress

[Dom Ready](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-dom-ready/)

wp-dom-ready

Execute callback after the DOM is loaded

[Editor](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-editor/)

wp-editor

Building blocks for WordPress editors

[Edit Post](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-edit-post/)

wp-edit-post

Edit Post Module for WordPress

[Element](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-element/)

wp-element

Element is, quite simply, an abstraction layer atop [React](https://reactjs.org/)

[Escape Html](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-escape-html/)

wp-escape-html

Escape HTML utils

[Hooks](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-hooks/)

wp-hooks

A lightweight and efficient EventManager for JavaScript

[Html Entities](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-html-entities/)

wp-html-entities

HTML entity utilities for WordPress

[I18N](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-i18n/)

wp-i18n

Internationalization utilities for client-side localization

[Is Shallow Equal](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-is-shallow-equal/)

wp-is-shallow-equal

A function for performing a shallow comparison between two objects or arrays

[Keycodes](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-keycodes/)

wp-keycodes

Keycodes utilities for WordPress, used to check the key pressed in events like `onKeyDown`

[List Reusable blocks](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-list-reusable-blocks/)

wp-list-reusable-blocks

Package used to add import/export links to the listing page of the reusable blocks

[NUX](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-nux/)

wp-nux

Components, and wp.data methods useful for onboarding a new user to the WordPress admin interface

[Plugins](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-plugins/)

wp-plugins

Plugins module for WordPress

[Redux Routine](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-redux-routine/)

wp-redux-routine

Redux middleware for generator coroutines

[Rich Text](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-rich-text/)

wp-rich-text

Helper functions to convert HTML or a DOM tree into a rich text value and back

[Shortcode](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-shortcode/)

wp-shortcode

Shortcode module for WordPress

[Token List](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-token-list/)

wp-token-list

Constructable, plain JavaScript [DOMTokenList](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList) implementation, supporting non-browser runtimes

[URL](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-url/)

wp-url

A collection of utilities to manipulate URLs

[Viewport](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-viewport/)

wp-viewport

Module for responding to changes in the browser viewport size

[Wordcount](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-wordcount/)

wp-wordcount

WordPress word count utility

## [Vendor scripts](#vendor-scripts)

The editor also uses some popular third-party packages and scripts. Plugin developers can use these scripts as well without bundling them in their code (and increasing file sizes).

Script Name

Handle

Description

[React](https://reactjs.org/)

react

React is a JavaScript library for building user interfaces

[React Dom](https://reactjs.org/docs/react-dom.html)

react-dom

Serves as the entry point to the DOM and server renderers for React, intended to be paired with React

[Moment](https://momentjs.com/)

moment

Parse, validate, manipulate, and display dates and times in JavaScript

[Lodash](https://lodash.com/)

lodash

Lodash is a JavaScript library which provides utility functions for common programming tasks

## [Polyfill scripts](#polyfill-scripts)

The editor also provides polyfills for certain features that may not be available in all modern browsers.

It is recommended to use the main `wp-polyfill` script handle which takes care of loading all the below mentioned polyfills.

Script Name

Handle

Description

[Babel Polyfill](https://babeljs.io/docs/en/babel-polyfill)

wp-polyfill

Emulate a full ES2015+ environment. Main script to load all the below mentioned additional polyfills

[Fetch Polyfill](https://www.npmjs.com/package/whatwg-fetch)

wp-polyfill-fetch

Polyfill that implements a subset of the standard Fetch specification

[Promise Polyfill](https://www.npmjs.com/package/promise-polyfill)

wp-polyfill-promise

Lightweight ES6 Promise polyfill for the browser and node

[Formdata Polyfill](https://www.npmjs.com/package/formdata-polyfill)

wp-polyfill-formdata

Polyfill conditionally replaces the native implementation

[Node Contains Polyfill](https://www.npmjs.com/package/polyfill-library)

wp-polyfill-node-contains

Polyfill for Node.contains

[Element Closest Polyfill](https://www.npmjs.com/package/element-closest)

wp-polyfill-element-closest

Return the closest element matching a selector up the DOM tree

## [Bundling and code sharing](#bundling-and-code-sharing)

When using a JavaScript bundler like [webpack](https://webpack.js.org/), the scripts mentioned here can be excluded from the bundle and provided by WordPress in the form of script dependencies see [`wp_enqueue_script`](https://developer.wordpress.org/reference/functions/wp_enqueue_script/#default-scripts-included-and-registered-by-wordpress).

The [`@wordpress/dependency-extraction-webpack-plugin`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/dependency-extraction-webpack-plugin) provides a webpack plugin to help extract WordPress dependencies from bundles. The `@wordpress/scripts` [`build`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/scripts#build) script includes the plugin by default.