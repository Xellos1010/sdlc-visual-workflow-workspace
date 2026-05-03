# @wordpress/views – Block Editor Handbook | Developer.WordPress.org

A lightweight package for managing DataViews view state with persistence using WordPress preferences.

The `@wordpress/views` package provides:

-   **Persistence**: Automatically saves and restores DataViews state using `@wordpress/preferences`
-   **View Modification Detection**: Tracks when views differ from their default state
-   **Reset Functionality**: Simple reset to default view capability
-   **Clean Integration**: Drop-in replacement for manual view state management

## [Installation](#installation)

Install the module

```
npm install @wordpress/views --save

```

## [API Reference](#api-reference)

### [loadView](#loadview)

Async function for loading view state in route loaders.

*Parameters*

-   *config* `ViewConfig`: Configuration object for loading the view.
-   *config.kind* `ViewConfig`: Entity kind (e.g., ‘postType’, ‘taxonomy’, ‘root’).
-   *config.name* `ViewConfig`: Specific entity name.
-   *config.slug* `ViewConfig`: View identifier.
-   *config.defaultView* `ViewConfig`: Default view configuration.
-   *config.activeViewOverrides* `ViewConfig`: View overrides applied on top but never persisted.
-   *config.queryParams* `ViewConfig`: Object with `page` and/or `search` from URL.

*Returns*

-   Promise resolving to the loaded view object.

### [useView](#useview)

Hook for managing DataViews view state with local persistence.

*Parameters*

-   *config* `ViewConfig`: Configuration object for loading the view.

*Returns*

-   `UseViewReturn`: Object with current view, modification state, and update functions.

### [useViewConfig](#useviewconfig)

A hook that retrieves the view configuration for a given entity from the core data store.

*Parameters*

-   *params* `Object`:
-   *params.kind* `string`: The kind of the entity.
-   *params.name* `string`: The name of the entity.

*Returns*

-   `Object`: An object containing the `default_view`, `default_layouts`, and `view_list` configuration for the entity.