# @wordpress/escape-html – Block Editor Handbook | Developer.WordPress.org

Escape HTML utils.

## [Installation](#installation)

Install the module

```
npm install @wordpress/escape-html

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [escapeAmpersand](#escapeampersand)

Returns a string with ampersands escaped. Note that this is an imperfect implementation, where only ampersands which do not appear as a pattern of named, decimal, or hexadecimal character references are escaped. Invalid named references (i.e. ambiguous ampersand) are still permitted.

*Related*

-   [https://w3c.github.io/html/syntax.html#character-references](https://w3c.github.io/html/syntax.html#character-references)
-   [https://w3c.github.io/html/syntax.html#ambiguous-ampersand](https://w3c.github.io/html/syntax.html#ambiguous-ampersand)
-   [https://w3c.github.io/html/syntax.html#named-character-references](https://w3c.github.io/html/syntax.html#named-character-references)

*Parameters*

-   *value* `string`: Original string.

*Returns*

-   `string`: Escaped string.

### [escapeAttribute](#escapeattribute)

Returns an escaped attribute value.

*Related*

-   [https://w3c.github.io/html/syntax.html#elements-attributes](https://w3c.github.io/html/syntax.html#elements-attributes) “\[…\] the text cannot contain an ambiguous ampersand \[…\] must not contain  
    any literal U+0022 QUOTATION MARK characters (“)”

Note we also escape the greater than symbol, as this is used by wptexturize to  
split HTML strings. This is a WordPress specific fix

Note that if a resolution for Trac#45387 comes to fruition, it is no longer  
necessary for `__unstableEscapeGreaterThan` to be used.

Note we also escape the less-than symbol to prevent HTML injection vulnerabilities  
and parsing issues, particularly for users without the unfiltered\_html capability.

See: [https://core.trac.wordpress.org/ticket/45387](https://core.trac.wordpress.org/ticket/45387)

*Parameters*

-   *value* `string`: Attribute value.

*Returns*

-   `string`: Escaped attribute value.

### [escapeEditableHTML](#escapeeditablehtml)

Returns an escaped Editable HTML element value. This is different from `escapeHTML`, because for editable HTML, ALL ampersands must be escaped in order to render the content correctly on the page.

*Parameters*

-   *value* `string`: Element value.

*Returns*

-   `string`: Escaped HTML element value.

### [escapeHTML](#escapehtml)

Returns an escaped HTML element value.

*Related*

-   [https://w3c.github.io/html/syntax.html#writing-html-documents-elements](https://w3c.github.io/html/syntax.html#writing-html-documents-elements) “the text must not contain the character U+003C LESS-THAN SIGN (\\<) or an  
    ambiguous ampersand.”

*Parameters*

-   *value* `string`: Element value.

*Returns*

-   `string`: Escaped HTML element value.

### [escapeLessThan](#escapelessthan)

Returns a string with less-than sign replaced.

*Parameters*

-   *value* `string`: Original string.

*Returns*

-   `string`: Escaped string.

### [escapeQuotationMark](#escapequotationmark)

Returns a string with quotation marks replaced.

*Parameters*

-   *value* `string`: Original string.

*Returns*

-   `string`: Escaped string.

### [isValidAttributeName](#isvalidattributename)

Returns true if the given attribute name is valid, or false otherwise.

*Parameters*

-   *name* `string`: Attribute name to test.

*Returns*

-   `boolean`: Whether attribute is valid.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).