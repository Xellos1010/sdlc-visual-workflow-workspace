# @wordpress/rich-text – Block Editor Handbook | Developer.WordPress.org

This module contains helper functions to convert HTML or a DOM tree into a rich text value and back, and to modify the value with functions that are similar to `String` methods, plus some additional ones for formatting.

## [Installation](#installation)

Install the module

```
npm install @wordpress/rich-text

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Usage](#usage)

The Rich Text package is designed to aid in the manipulation of plain text strings in order that they can represent complex formatting.

By using a `RichTextValue` value object (referred to from here on as `value`) it is possible to separate text from formatting, thereby affording the ability to easily search and manipulate rich formats.

Examples of rich formats include:

-   bold, italic, superscript (etc)
-   links
-   unordered/ordered lists

### [The RichTextValue object](#the-richtextvalue-object)

The value object is comprised of the following:

-   `text` – the string of text to which rich formats are to be applied.
-   `formats` – a sparse array of the same length as `text` that is filled with [formats](https://developer.wordpress.org/block-editor/how-to-guides/format-api/) (e.g. `core/link`, `core/bold` etc.) at the positions where the text is formatted.
-   `start` – an index in the `text` representing the *start* of the currently active selection.
-   `end` – an index in the `text` representing the *end* of the currently active selection.

You should not attempt to create your own `value` objects. Rather you should rely on the built in methods of the `@wordpress/rich-text` package to build these for you.

It is important to understand how a value represents richly formatted text. Here is an example to illustrate.

If `text` is formatted from position 2-5 in bold (`core/bold`) and from position 2-8 with a link (`core/link`), then you’ll find:

-   arrays within the sparse array at positions 2-5 that include the `core/bold` format
-   arrays within the sparse array at positions 2-8 that include the `core/link` format

Here’s how that would look:

```
{
  text: 'Hello world', // length 11
  formats: [
    [], // 0
    [],
    [ // 2
      {
        type: 'core/bold',
      },
      {
        type: 'core/link',
      }
    ],
    [
      {
        type: 'core/bold',
      },
      {
        type: 'core/link',
      }
    ],
    [
      {
        type: 'core/bold',
      },
      {
        type: 'core/link',
      }
    ],
    [
      {
        type: 'core/bold',
      },
      {
        type: 'core/link',
      }
    ],
    [ // 6
      {
        type: 'core/link',
      }
    ]
    [
      {
        type: 'core/link',
      }
    ],
    [
      {
        type: 'core/link',
      }
    ],
    [], // 9
    [], // 10
    [], // 11
  ]
}

```

### [Selections](#selections)

Let’s continue to consider the above example with the text `Hello world`.

If, as a user, I make a selection of the word `Hello` this would result in a value object with `start` and `end` as `0` and `5` respectively.

In general, this is useful for knowing which portion of the text is selected. However, we need to consider that selections may also be “collapsed”.

#### [Collapsed selections](#collapsed-selections)

A collapsed selection is one where `start` and `end` values are *identical* (e.g. `start: 4, end: 4`). This happens when no characters are selected, but there is a caret present. This most often occurs when a user places the cursor/caret within a string of text but does not make a selection.

Given that the selection has no “range” (i.e. there is no difference between `start` and `end` indices), finding the currently selected portion of text from collapsed values can be challenging.

## [API](#api)

### [applyFormat](#applyformat)

Apply a format object to a Rich Text value from the given `startIndex` to the given `endIndex`. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *format* `RichTextFormat`: Format to apply.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new value with the format applied.

### [concat](#concat)

Combine all Rich Text values into one. This is similar to `String.prototype.concat`.

*Parameters*

-   *values* `...RichTextValue`: Objects to combine.

*Returns*

-   `RichTextValue`: A new value combining all given records.

### [create](#create)

Create a RichText value from an `Element` tree (DOM), an HTML string or a plain text string, with optionally a `Range` object to set the selection. If called without any input, an empty value will be created. The optional functions can be used to filter out content.

A value will have the following shape, which you are strongly encouraged not to modify without the use of helper functions:

```
{
  text: string,
  formats: Array,
  replacements: Array,
  ?start: number,
  ?end: number,
}

```

As you can see, text and formatting are separated. `text` holds the text, including any replacement characters for objects and lines. `formats`, `objects` and `lines` are all sparse arrays of the same length as `text`. It holds information about the formatting at the relevant text indices. Finally `start` and `end` state which text indices are selected. They are only provided if a `Range` was given.

*Parameters*

-   *$1* `[Object]`: Optional named arguments.
-   *$1.element* `[Element]`: Element to create value from.
-   *$1.text* `[string]`: Text to create value from.
-   *$1.html* `[string]`: HTML to create value from.
-   *$1.range* `[Range]`: Range to create value from.
-   *$1.\_\_unstableIsEditableTree* `[boolean]`:

*Returns*

-   `RichTextValue`: A rich text value.

### [getActiveFormat](#getactiveformat)

Gets the format object by type at the start of the selection. This can be used to get e.g. the URL of a link format at the current selection, but also to check if a format is active at the selection. Returns undefined if there is no format at the selection.

*Parameters*

-   *value* `RichTextValue`: Value to inspect.
-   *formatType* `string`: Format type to look for.

*Returns*

-   `RichTextFormat|undefined`: Active format object of the specified type, or undefined.

### [getActiveFormats](#getactiveformats)

Gets the all format objects at the start of the selection.

*Parameters*

-   *value* `RichTextValue`: Value to inspect.
-   *EMPTY\_ACTIVE\_FORMATS* `Array`: Array to return if there are no active formats.

*Returns*

-   `RichTextFormatList`: Active format objects.

### [getActiveObject](#getactiveobject)

Gets the active object, if there is any.

*Parameters*

-   *value* `RichTextValue`: Value to inspect.

*Returns*

-   `RichTextFormat|void`: Active object, or undefined.

### [getTextContent](#gettextcontent)

Get the textual content of a Rich Text value. This is similar to `Element.textContent`.

*Parameters*

-   *value* `RichTextValue`: Value to use.

*Returns*

-   `string`: The text content.

### [insert](#insert)

Insert a Rich Text value, an HTML string, or a plain text string, into a Rich Text value at the given `startIndex`. Any content between `startIndex` and `endIndex` will be removed. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *valueToInsert* `RichTextValue|string`: Value to insert.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new value with the value inserted.

### [insertObject](#insertobject)

Insert a format as an object into a Rich Text value at the given `startIndex`. Any content between `startIndex` and `endIndex` will be removed. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *formatToInsert* `RichTextFormat`: Format to insert as object.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new value with the object inserted.

### [isCollapsed](#iscollapsed)

Check if the selection of a Rich Text value is collapsed or not. Collapsed means that no characters are selected, but there is a caret present. If there is no selection, `undefined` will be returned. This is similar to `window.getSelection().isCollapsed()`.

*Parameters*

-   *props* `RichTextValue`: The rich text value to check.
-   *props.start* `RichTextValue[ 'start' ]`:
-   *props.end* `RichTextValue[ 'end' ]`:

*Returns*

-   `boolean | undefined`: True if the selection is collapsed, false if not, undefined if there is no selection.

### [isEmpty](#isempty)

Check if a Rich Text value is Empty, meaning it contains no text or any objects (such as images).

*Parameters*

-   *value* `RichTextValue`: Value to use.

*Returns*

-   `boolean`: True if the value is empty, false if not.

### [join](#join)

Combine an array of Rich Text values into one, optionally separated by `separator`, which can be a Rich Text value, HTML string, or plain text string. This is similar to `Array.prototype.join`.

*Parameters*

-   *values* `Array<RichTextValue>`: An array of values to join.
-   *separator* `[string|RichTextValue]`: Separator string or value.

*Returns*

-   `RichTextValue`: A new combined value.

### [privateApis](#privateapis)

Private @wordpress/rich-text APIs.

### [registerFormatType](#registerformattype)

Registers a new format provided a unique name and an object defining its behavior.

*Parameters*

-   *name* `string`: Format name.
-   *settings* `WPFormat`: Format settings.

*Returns*

-   `WPFormat|undefined`: The format, if it has been successfully registered; otherwise `undefined`.

### [remove](#remove)

Remove content from a Rich Text value between the given `startIndex` and `endIndex`. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new value with the content removed.

### [removeFormat](#removeformat)

Remove any format object from a Rich Text value by type from the given `startIndex` to the given `endIndex`. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *formatType* `string`: Format type to remove.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new value with the format applied.

### [replace](#replace)

Search a Rich Text value and replace the match(es) with `replacement`. This is similar to `String.prototype.replace`.

*Parameters*

-   *value* `RichTextValue`: The value to modify.
-   *pattern* `RegExp|string`: A RegExp object or literal. Can also be a string. It is treated as a verbatim string and is not interpreted as a regular expression. Only the first occurrence will be replaced.
-   *replacement* `Function|string`: The match or matches are replaced with the specified or the value returned by the specified function.

*Returns*

-   `RichTextValue`: A new value with replacements applied.

### [RichTextData](#richtextdata)

The RichTextData class is used to instantiate a wrapper around rich text values, with methods that can be used to transform or manipulate the data.

-   Create an empty instance: `new RichTextData()`.
-   Create one from an HTML string: `RichTextData.fromHTMLString(   '<em>hello</em>' )`.
-   Create one from a wrapper HTMLElement: `RichTextData.fromHTMLElement(   document.querySelector( 'p' ) )`.
-   Create one from plain text: `RichTextData.fromPlainText( '1\n2' )`.
-   Create one from a rich text value: `new RichTextData( { text: '...',   formats: [ ... ] } )`.

### [RichTextValue](#richtextvalue)

An object which represents a formatted string. See main `@wordpress/rich-text` documentation for more information.

### [slice](#slice)

Slice a Rich Text value from `startIndex` to `endIndex`. Indices are retrieved from the selection if none are provided. This is similar to `String.prototype.slice`.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *startIndex* `[number]`: Start index.
-   *endIndex* `[number]`: End index.

*Returns*

-   `RichTextValue`: A new extracted value.

### [split](#split)

Split a Rich Text value in two at the given `startIndex` and `endIndex`, or split at the given separator. This is similar to `String.prototype.split`. Indices are retrieved from the selection if none are provided.

*Parameters*

-   *value* `RichTextValue`:
-   *string* `[number|string]`: Start index, or string at which to split.

*Returns*

-   `Array<RichTextValue>|undefined`: An array of new values.

### [store](#store)

Store definition for the rich-text namespace.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore](https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore)

*Type*

-   `Object`

### [toggleFormat](#toggleformat)

Toggles a format object to a Rich Text value at the current selection.

*Parameters*

-   *value* `RichTextValue`: Value to modify.
-   *format* `RichTextFormat`: Format to apply or remove.

*Returns*

-   `RichTextValue`: A new value with the format applied or removed.

### [toHTMLString](#tohtmlstring)

Create an HTML string from a Rich Text value.

*Parameters*

-   *$1* `Object`: Named arguments.
-   *$1.value* `RichTextValue`: Rich text value.
-   *$1.preserveWhiteSpace* `[boolean]`: Preserves newlines if true.

*Returns*

-   `string`: HTML string.

### [unregisterFormatType](#unregisterformattype)

Unregisters a format.

*Parameters*

-   *name* `string`: Format name.

*Returns*

-   `WPFormat|undefined`: The previous format value, if it has been successfully unregistered; otherwise `undefined`.

### [useAnchor](#useanchor)

This hook, to be used in a format type’s Edit component, returns the active element that is formatted, or a virtual element for the selection range if no format is active. The returned value is meant to be used for positioning UI, e.g. by passing it to the `Popover` component via the `anchor` prop.

*Parameters*

-   *obj* `{ editableContentElement: HTMLElement | null; settings?: WPFormat; }`: Named parameters.
-   *obj.editableContentElement* `HTMLElement | null`: The element containing the editable content.
-   *obj.settings* `WPFormat`: The format type’s settings.

*Returns*

-   `Element | VirtualAnchorElement | undefined | null`: The active element or selection range.

### [useAnchorRef](#useanchorref)

This hook, to be used in a format type’s Edit component, returns the active element that is formatted, or the selection range if no format is active. The returned value is meant to be used for positioning UI, e.g. by passing it to the `Popover` component.

*Parameters*

-   *$1* `Object`: Named parameters.
-   *$1.ref* `RefObject<HTMLElement>`: React ref of the element containing the editable content.
-   *$1.value* `RichTextValue`: Value to check for selection.
-   *$1.settings* `WPFormat`: The format type’s settings.

*Returns*

-   `Element|Range`: The active element or selection range.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).