# Preferences – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/preferences`.

## [Selectors](#selectors)

### [get](#get)

Returns a boolean indicating whether a prefer is active for a particular scope.

*Parameters*

-   *state* `StoreState`: The store state.
-   *scope* `string`: The scope of the feature (e.g. core/edit-post).
-   *name* `string`: The name of the feature.

*Returns*

-   `*`: Is the feature enabled?

## [Actions](#actions)

### [set](#set)

Returns an action object used in signalling that a preference should be set to a value

*Parameters*

-   *scope* `string`: The preference scope (e.g. core/edit-post).
-   *name* `string`: The preference name.
-   *value* `*`: The value to set.

*Returns*

-   `SetAction`: Action object.

### [setDefaults](#setdefaults)

Returns an action object used in signalling that preference defaults should be set.

*Parameters*

-   *scope* `string`: The preference scope (e.g. core/edit-post).
-   *defaults* `ScopedDefaults`: A key/value map of preference names to values.

*Returns*

-   `SetDefaultsAction`: Action object.

### [setPersistenceLayer](#setpersistencelayer)

Sets the persistence layer.

When a persistence layer is set, the preferences store will:

-   call `get` immediately and update the store state to the value returned.
-   call `set` with all preferences whenever a preference changes value.

`setPersistenceLayer` should ideally be dispatched at the start of an application’s lifecycle, before any other actions have been dispatched to the preferences store.

*Parameters*

-   *persistenceLayer* `WPPreferencesPersistenceLayer< D >`: The persistence layer.

*Returns*

-   `Promise< SetPersistenceLayerAction< D > >`: Action object.

### [toggle](#toggle)

Returns an action object used in signalling that a preference should be toggled.

*Parameters*

-   *scope* `string`: The preference scope (e.g. core/edit-post).
-   *name* `string`: The preference name.