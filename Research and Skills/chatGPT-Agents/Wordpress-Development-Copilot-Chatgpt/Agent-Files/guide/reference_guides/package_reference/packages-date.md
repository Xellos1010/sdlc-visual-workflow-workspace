# @wordpress/date

Date module for WordPress.

## [Installation](#installation)

Install the module

```
npm install @wordpress/date --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [date](#date)

Formats a date (like `date()` in PHP).

*Related*

-   [https://en.wikipedia.org/wiki/List\_of\_tz\_database\_time\_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
-   [https://en.wikipedia.org/wiki/ISO\_8601#Time\_offsets\_from\_UTC](https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC)

*Parameters*

-   *dateFormat* `string`: PHP-style formatting string. See [php.net/date](https://www.php.net/manual/en/function.date.php).
-   *dateValue* `Moment | Date | string | number`: Date object or string, parsable by moment.js.
-   *timezone* `string`: Timezone to output result in or a UTC offset. Defaults to timezone from site.

*Returns*

-   `string`: Formatted date in English.

### [dateI18n](#datei18n)

Formats a date (like `wp_date()` in PHP), translating it into site’s locale.

Backward Compatibility Notice: if `timezone` is set to `true`, the function behaves like `gmdateI18n`.

*Related*

-   [https://en.wikipedia.org/wiki/List\_of\_tz\_database\_time\_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
-   [https://en.wikipedia.org/wiki/ISO\_8601#Time\_offsets\_from\_UTC](https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC)

*Parameters*

-   *dateFormat* `string`: PHP-style formatting string. See [php.net/date](https://www.php.net/manual/en/function.date.php).
-   *dateValue* `Moment | Date | string | number`: Date object or string, parsable by moment.js.
-   *timezone* `string | number | boolean`: Timezone to output result in or a UTC offset. Defaults to timezone from site. Notice: `boolean` is effectively deprecated, but still supported for backward compatibility reasons.

*Returns*

-   Formatted date.

### [format](#format)

Formats a date. Does not alter the date’s timezone.

*Parameters*

-   *dateFormat* `string`: PHP-style formatting string. See [php.net/date](https://www.php.net/manual/en/function.date.php).
-   *dateValue* `Moment | Date | string | number`: Date object or string, parsable by moment.js.

*Returns*

-   Formatted date.

### [getDate](#getdate)

Create and return a JavaScript Date Object from a date string in the WP timezone.

*Parameters*

-   *dateString* `string | null`: Date formatted in the WP timezone.

*Returns*

-   Date

### [getSettings](#getsettings)

Returns the currently defined date settings.

*Returns*

-   `DateSettings`: Settings, including locale data.

### [gmdate](#gmdate)

Formats a date (like `date()` in PHP), in the UTC timezone.

*Parameters*

-   *dateFormat* `string`: PHP-style formatting string. See [php.net/date](https://www.php.net/manual/en/function.date.php).
-   *dateValue* `Moment | Date | string | number`: Date object or string, parsable by moment.js.

*Returns*

-   Formatted date in English.

### [gmdateI18n](#gmdatei18n)

Formats a date (like `wp_date()` in PHP), translating it into site’s locale and using the UTC timezone.

*Parameters*

-   *dateFormat* `string`: PHP-style formatting string. See [php.net/date](https://www.php.net/manual/en/function.date.php).
-   *dateValue* `Moment | Date | string | number`: Date object or string, parsable by moment.js.

*Returns*

-   Formatted date.

### [humanTimeDiff](#humantimediff)

Returns a human-readable time difference between two dates, like [human\_time\_diff()](https://developer.wordpress.org/reference/functions/human_time_diff/) in PHP.

*Parameters*

-   *from* `Moment | Date | string | number`: From date, in the WP timezone.
-   *to* `Moment | Date | string | number`: To date, formatted in the WP timezone.

*Returns*

-   Human-readable time difference.

### [isInTheFuture](#isinthefuture)

Check whether a date is considered in the future according to the WordPress settings.

*Parameters*

-   *dateValue* `Date | string | number`: Date String or Date object in the Defined WP Timezone.

*Returns*

-   Is in the future.

### [setSettings](#setsettings)

Adds a locale to moment, using the format supplied by `wp_localize_script()`.

*Parameters*

-   *dateSettings* `DateSettings`: Settings, including locale data.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).