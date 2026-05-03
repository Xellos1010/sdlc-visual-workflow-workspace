# @wordpress/notices – Block Editor Handbook | Developer.WordPress.org

State management and UI components for notices.

## [Installation](#installation)

Install the module

```
npm install @wordpress/notices

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Usage](#usage)

When imported, the notices module registers a data store on the `core/notices` namespace. In WordPress, this is accessed from `wp.data.dispatch( 'core/notices' )`.

For more information about consuming from a data store, refer to [the `@wordpress/data` documentation on *Data Access and Manipulation*](https://github.com/WordPress/gutenberg/tree/HEAD/packages/data/README.md#data-access-and-manipulation).

For a full list of actions and selectors available in the `core/notices` namespace, refer to the [*Notices Data* Handbook page](https://github.com/WordPress/gutenberg/tree/HEAD/docs/reference-guides/data/data-core-notices.md).

## [Components](#components)

The package also exports ready-to-use notice UI components powered by the `core/notices` store.

### [InlineNotices](#inlinenotices)

Renders notice lists for notices with type `default`:

-   non-dismissible notices in a pinned list.
-   dismissible notices in a removable list.

`children` are rendered inside the dismissible list.

*Props*

-   `children: ReactNode` (optional): Additional content rendered in the dismissible notice list.
-   `pinnedNoticesClassName: string` (optional): Extra class name added to the pinned list.
-   `dismissibleNoticesClassName: string` (optional): Extra class name added to the dismissible list.
-   `context: string` (optional): Notice context to read and remove notices from. Defaults to `default`.

### [SnackbarNotices](#snackbarnotices)

Renders notices with type `snackbar` using `SnackbarList`.

-   It renders the last three snackbar notices.
-   Dismiss actions are wired to `removeNotice`.

*Props*

-   `className: string` (optional): Extra class name added to the snackbar list.
-   `context: string` (optional): Notice context to read and remove notices from. Defaults to `default`.

## [Example](#example)

```
import { useDispatch } from '@wordpress/data';
import {
    InlineNotices,
    SnackbarNotices,
    store as noticesStore,
} from '@wordpress/notices';

function AppNotices() {
    const { createSuccessNotice } = useDispatch( noticesStore );
    const noticeContext = 'my-plugin/screen';

    return (
        <>
            <button
                onClick={ () =>
                    createSuccessNotice( 'Saved successfully.', {
                        type: 'snackbar',
                        context: noticeContext,
                    } )
                }
            >
                Create snackbar notice
            </button>

            <InlineNotices
                pinnedNoticesClassName="my-plugin-notices__pinned"
                dismissibleNoticesClassName="my-plugin-notices__dismissible"
                context={ noticeContext }
            />
            <SnackbarNotices
                className="my-plugin-notices__snackbar"
                context={ noticeContext }
            />
        </>
    );
}

```

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).