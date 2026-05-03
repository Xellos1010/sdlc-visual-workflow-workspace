# @wordpress/core-data – Block Editor Handbook | Developer.WordPress.org

Core Data is a [data module](https://github.com/WordPress/gutenberg/tree/HEAD/packages/data/README.md) intended to simplify access to and manipulation of core WordPress entities. It registers its own store and provides a number of selectors which resolve data from the WordPress REST API automatically, along with dispatching action creators to manipulate data. Core data is shipped with [`TypeScript definitions for WordPress data types`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/core-data/src/entity-types/README.md).

Used in combination with features of the data module such as [`subscribe`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/data/README.md#subscribe-function) or [higher-order components](https://github.com/WordPress/gutenberg/tree/HEAD/packages/data/README.md#higher-order-components), it enables a developer to easily add data into the logic and display of their plugin.

## [Installation](#installation)

Install the module

```
npm install @wordpress/core-data --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Example](#example)

Below is an example of a component which simply renders a list of authors:

```
const { useSelect } = wp.data;

function MyAuthorsListBase() {
    const authors = useSelect( ( select ) => {
        return select( 'core' ).getUsers( { who: 'authors' } );
    }, [] );

    if ( ! authors ) {
        return null;
    }

    return (
        <ul>
            { authors.map( ( author ) => (
                <li key={ author.id }>{ author.name }</li>
            ) ) }
        </ul>
    );
}

```

## [What’s an entity?](#whats-an-entity)

An entity represents a data source. Each item within the entity is called an entity record. Available entities are defined in `rootEntitiesConfig` at ./src/entities.js.

As of right now, the default entities defined by this package map to the [REST API handbook](https://developer.wordpress.org/rest-api/reference/), though there is nothing in the design that prevents it from being used to interact with any other API.

What follows is a description of some of the properties of `rootEntitiesConfig`.

### [Connecting the entity with the data source](#connecting-the-entity-with-the-data-source)

#### [baseURL](#baseurl)

-   Type: string.
-   Example: `'/wp/v2/users'`.

This property maps the entity to a given endpoint, taking its relative URL as value.

#### [baseURLParams](#baseurlparams)

-   Type: `object`.
-   Example: `{ context: 'edit' }`.

Additional parameters to the request, added as a query string. Each property will be converted into a field/value pair. For example, given the `baseURL: '/wp/v2/users'` and the `baseURLParams: { context: 'edit' }` the URL would be `/wp/v2/users?context=edit`.

#### [key](#key)

-   Type: `string`.
-   Example: `'slug'`.

The entity engine aims to convert the API response into a number of entity records. Responses can come in different shapes, which are processed differently.

Responses that represent a single object map to a single entity record. For example:

```
{
    "title": "...",
    "description": "...",
    "...": "..."
}

```

Responses that represent a collection shaped as an array, map to as many entity records as elements of the array. For example:

```
[
    { "id": 1, "name": "...", "...": "..." },
    { "id": 2, "name": "...", "...": "..." },
    { "id": 3, "name": "...", "...": "..." }
]

```

There are also cases in which a response represents a collection shaped as an object, whose key is one of the property’s values. Each of the nested objects should be its own entity record. For this case not to be confused with single object/entities, the entity configuration must provide the property key that holds the value acting as the object key. In the following example, the `slug` property’s value is acting as the object key, hence the entity config must declare `key: 'slug'` for each nested object to be processed as an individual entity record:

```
{
    "publish": { "slug": "publish", "name": "Published", "...": "..." },
    "draft": { "slug": "draft", "name": "Draft", "...": "..." },
    "future": { "slug": "future", "name": "Future", "...": "..." }
}

```

### [Interacting with entity records](#interacting-with-entity-records)

Entity records are unique. For entities that are collections, it’s assumed that each record has an `id` property which serves as an identifier to manage it. If the entity defines a `key`, that property would be used as its identifier instead of the assumed `id`.

#### [name](#name)

-   Type: `string`.
-   Example: `user`.

The name of the entity. To be used in the utilities that interact with it (selectors, actions, hooks).

#### [kind](#kind)

-   Type: `string`.
-   Example: `root`.

Entities can be grouped by `kind`. To be used in the utilities that interact with them (selectors, actions, hooks).

The package provides general methods to interact with the entities (`getEntityRecords`, `getEntityRecord`, etc.) by leveraging the `kind` and `name` properties:

```
// Get the record collection for the user entity.
wp.data.select( 'core' ).getEntityRecords( 'root', 'user' );

// Get a single record for the user entity.
wp.data.select( 'core' ).getEntityRecord( 'root', 'user', recordId );

```

#### [plural](#plural)

-   Type: `string`.
-   Example: `statuses`.

In addition to the general utilities (`getEntityRecords`, `getEntityRecord`, etc.), the package dynamically creates nicer-looking methods to interact with the entity records of the `root` kind, both the collection and single records. Compare the general and nicer-looking methods as follows:

```
// Collection
wp.data.select( 'core' ).getEntityRecords( 'root', 'user' );
wp.data.select( 'core' ).getUsers();

// Single record
wp.data.select( 'core' ).getEntityRecord( 'root', 'user', recordId );
wp.data.select( 'core' ).getUser( recordId );

```

Sometimes, the pluralized form of an entity is not regular (it is not formed by adding a `-s` suffix). The `plural` property of the entity config allows to declare an alternative pluralized form for the dynamic methods created for the entity. For example, given the `status` entity that declares the `statuses` plural, there are the following methods created for it:

```
// Collection
wp.data.select( 'core' ).getStatuses();

// Single record
wp.data.select( 'core' ).getStatus( recordId );

```

## [Actions](#actions)

The following set of dispatching action creators are available on the object returned by `wp.data.dispatch( 'core' )`:

### [addEntities](#addentities)

Returns an action object used in adding new entities.

*Parameters*

-   *entities* `Array`: Entities received.

*Returns*

-   `Object`: Action object.

### [clearEntityRecordEdits](#clearentityrecordedits)

Action triggered to clear all edits from an entity record.

*Parameters*

-   *kind* `string`: Kind of the entity.
-   *name* `string`: Name of the entity.
-   *recordId* `number|string`: Record ID of the entity record.

*Returns*

-   `Object`: Action object.

### [deleteEntityRecord](#deleteentityrecord)

Action triggered to delete an entity record.

*Parameters*

-   *kind* `string`: Kind of the deleted entity.
-   *name* `string`: Name of the deleted entity.
-   *recordId* `number|string`: Record ID of the deleted entity.
-   *query* `?Object`: Special query parameters for the DELETE API call.
-   *options* `[Object]`: Delete options.
-   *options.\_\_unstableFetch* `[Function]`: Internal use only. Function to call instead of `apiFetch()`. Must return a promise.
-   *options.throwOnError* `[boolean]`: If false, this action suppresses all the exceptions. Defaults to false.

### [editEntityRecord](#editentityrecord)

Returns an action object that triggers an edit to an entity record.

*Parameters*

-   *kind* `string`: Kind of the edited entity record.
-   *name* `string`: Name of the edited entity record.
-   *recordId* `number|string`: Record ID of the edited entity record.
-   *edits* `Object`: The edits.
-   *options* `Object`: Options for the edit.
-   *options.undoIgnore* `[boolean]`: Whether to ignore the edit in undo history or not.

*Returns*

-   `Object`: Action object.

### [receiveDefaultTemplateId](#receivedefaulttemplateid)

Returns an action object used to set the template for a given query.

*Parameters*

-   *query* `Object`: The lookup query.
-   *templateId* `string`: The resolved template id.

*Returns*

-   `Object`: Action object.

### [receiveEntityRecords](#receiveentityrecords)

Returns an action object used in signalling that entity records have been received.

*Parameters*

-   *kind* `string`: Kind of the received entity record.
-   *name* `string`: Name of the received entity record.
-   *records* `Array|Object`: Records received.
-   *query* `?Object`: Query Object.
-   *invalidateCache* `?boolean`: Should invalidate query caches.
-   *edits* `?Object`: Edits to reset.
-   *meta* `?Object`: Meta information about pagination.

*Returns*

-   `Object`: Action object.

### [receiveNavigationFallbackId](#receivenavigationfallbackid)

Returns an action object signalling that the fallback Navigation Menu id has been received.

*Parameters*

-   *fallbackId* `integer`: the id of the fallback Navigation Menu

*Returns*

-   `Object`: Action object.

### [receiveRevisions](#receiverevisions)

Action triggered to receive revision items.

*Parameters*

-   *kind* `string`: Kind of the received entity record revisions.
-   *name* `string`: Name of the received entity record revisions.
-   *recordKey* `number|string`: The key of the entity record whose revisions you want to fetch.
-   *records* `Array|Object`: Revisions received.
-   *query* `?Object`: Query Object.
-   *invalidateCache* `?boolean`: Should invalidate query caches.
-   *meta* `?Object`: Meta information about pagination.

### [receiveThemeSupports](#receivethemesupports)

> **Deprecated** since WP 5.9, this is not useful anymore, use the selector directly.

Returns an action object used in signalling that the index has been received.

*Returns*

-   `Object`: Action object.

### [receiveUploadPermissions](#receiveuploadpermissions)

> **Deprecated** since WP 5.9, use receiveUserPermission instead.

Returns an action object used in signalling that Upload permissions have been received.

*Parameters*

-   *hasUploadPermissions* `boolean`: Does the user have permission to upload files?

*Returns*

-   `Object`: Action object.

### [redo](#redo)

Action triggered to redo the last undone edit to an entity record, if any.

### [saveEditedEntityRecord](#saveeditedentityrecord)

Action triggered to save an entity record’s edits.

*Parameters*

-   *kind* `string`: Kind of the entity.
-   *name* `string`: Name of the entity.
-   *recordId* `Object`: ID of the record.
-   *options* `Object=`: Saving options.

### [saveEntityRecord](#saveentityrecord)

Action triggered to save an entity record.

*Parameters*

-   *kind* `string`: Kind of the received entity.
-   *name* `string`: Name of the received entity.
-   *record* `Object`: Record to be saved.
-   *options* `Object`: Saving options.
-   *options.isAutosave* `[boolean]`: Whether this is an autosave.
-   *options.\_\_unstableFetch* `[Function]`: Internal use only. Function to call instead of `apiFetch()`. Must return a promise.
-   *options.throwOnError* `[boolean]`: If false, this action suppresses all the exceptions. Defaults to false.

### [setSyncConnectionStatus](#setsyncconnectionstatus)

Returns an action object used to set the sync connection status for an entity or collection.

*Parameters*

-   *kind* `string`: Kind of the entity.
-   *name* `string`: Name of the entity.
-   *key* `number|string|null`: The entity key, or null for collections.
-   *status* `Object|null`: The connection state object or null on unload.

*Returns*

-   `Object`: Action object.

### [undo](#undo)

Action triggered to undo the last edit to an entity record, if any.

## [Selectors](#selectors)

The following selectors are available on the object returned by `wp.data.select( 'core' )`:

### [canUser](#canuser)

Returns whether the current user can perform the given action on the given REST resource.

Calling this may trigger an OPTIONS request to the REST API via the `canUser()` resolver.

[https://developer.wordpress.org/rest-api/reference/](https://developer.wordpress.org/rest-api/reference/)

*Parameters*

-   *state* `State`: Data state.
-   *action* `string`: Action to check. One of: ‘create’, ‘read’, ‘update’, ‘delete’.
-   *resource* `string | EntityResource`: Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }` or REST base as a string – `media`.
-   *id* `EntityRecordKey`: Optional ID of the rest resource to check.

*Returns*

-   `boolean | undefined`: Whether or not the user can perform the action, or `undefined` if the OPTIONS request is still being made.

### [canUserEditEntityRecord](#canusereditentityrecord)

Returns whether the current user can edit the given entity.

Calling this may trigger an OPTIONS request to the REST API via the `canUser()` resolver.

[https://developer.wordpress.org/rest-api/reference/](https://developer.wordpress.org/rest-api/reference/)

*Parameters*

-   *state* `State`: Data state.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record’s id.

*Returns*

-   `boolean | undefined`: Whether or not the user can edit, or `undefined` if the OPTIONS request is still being made.

> **Deprecated** since 11.3. Callers should use `select( 'core' ).getUsers({ who: 'authors' })` instead.

Returns all available authors.

*Parameters*

-   *state* `State`: Data state.
-   *query* `GetRecordsHttpQuery`: Optional object of query parameters to include with request. For valid query parameters see the [Users page](https://developer.wordpress.org/rest-api/reference/users/) in the REST API Handbook and see the arguments for [List Users](https://developer.wordpress.org/rest-api/reference/users/#list-users) and [Retrieve a User](https://developer.wordpress.org/rest-api/reference/users/#retrieve-a-user).

*Returns*

-   `ET.User[]`: Authors list.

### [getAutosave](#getautosave)

Returns the autosave for the post and author.

*Parameters*

-   *state* `State`: State tree.
-   *postType* `string`: The type of the parent post.
-   *postId* `EntityRecordKey`: The id of the parent post.
-   *authorId* `EntityRecordKey`: The id of the author.

*Returns*

-   `EntityRecord | undefined`: The autosave for the post and author.

### [getAutosaves](#getautosaves)

Returns the latest autosaves for the post.

May return multiple autosaves since the backend stores one autosave per author for each post.

*Parameters*

-   *state* `State`: State tree.
-   *postType* `string`: The type of the parent post.
-   *postId* `EntityRecordKey`: The id of the parent post.

*Returns*

-   `Array< any > | undefined`: An array of autosaves for the post, or undefined if there is none.

### [getBlockPatternCategories](#getblockpatterncategories)

Retrieve the list of registered block pattern categories.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `Array< any >`: Block pattern category list.

### [getBlockPatterns](#getblockpatterns)

Retrieve the list of registered block patterns.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `Array< any >`: Block pattern list.

### [getCurrentTheme](#getcurrenttheme)

Return the current theme.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `any`: The current theme.

### [getCurrentThemeGlobalStylesRevisions](#getcurrentthemeglobalstylesrevisions)

> **Deprecated** since WordPress 6.5.0. Callers should use `select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )` instead, where `recordKey` is the id of the global styles parent post.

Returns the revisions of the current global styles theme.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `Array< object > | null`: The current global styles.

### [getCurrentUser](#getcurrentuser)

Returns the current user.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `ET.User< 'view' >`: Current user object.

### [getDefaultTemplateId](#getdefaulttemplateid)

Returns the default template use to render a given query.

*Parameters*

-   *state* `State`: Data state.
-   *query* `TemplateQuery`: Query.

*Returns*

-   `string`: The default template id for the given query.

### [getEditedEntityRecord](#geteditedentityrecord)

Returns the specified entity record, merged with its edits.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `ET.Updatable< EntityRecord > | false`: The entity record, merged with its edits.

### [getEmbedPreview](#getembedpreview)

Returns the embed preview for the given URL.

*Parameters*

-   *state* `State`: Data state.
-   *url* `string`: Embedded URL.

*Returns*

-   `any`: Undefined if the preview has not been fetched, otherwise, the preview fetched from the embed preview API.

### [getEntitiesByKind](#getentitiesbykind)

> **Deprecated** since WordPress 6.0. Use getEntitiesConfig instead

Returns the loaded entities for the given kind.

*Parameters*

-   *state* `State`: Data state.
-   *kind* `string`: Entity kind.

*Returns*

-   `Array< any >`: Array of entities with config matching kind.

### [getEntitiesConfig](#getentitiesconfig)

Returns the loaded entities for the given kind.

*Parameters*

-   *state* `State`: Data state.
-   *kind* `string`: Entity kind.

*Returns*

-   `Array< any >`: Array of entities with config matching kind.

### [getEntity](#getentity)

> **Deprecated** since WordPress 6.0. Use getEntityConfig instead

Returns the entity config given its kind and name.

*Parameters*

-   *state* `State`: Data state.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.

*Returns*

-   `any`: Entity config

### [getEntityConfig](#getentityconfig)

Returns the entity config given its kind and name.

*Parameters*

-   *state* `State`: Data state.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.

*Returns*

-   `any`: Entity config

### [getEntityRecord](#getentityrecord)

Returns the Entity’s record object by key. Returns `null` if the value is not yet received, undefined if the value entity is known to not exist, or the entity object if it exists and is received.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *key* `EntityRecordKey`: Optional record’s key. If requesting a global record (e.g. site settings), the key can be omitted. If requesting a specific item, the key must always be included.
-   *query* `GetRecordsHttpQuery`: Optional query. If requesting specific fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available “Retrieve a \[Entity kind\]”.

*Returns*

-   `EntityRecord | undefined`: Record.

### [getEntityRecordEdits](#getentityrecordedits)

Returns the specified entity record’s edits.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `Optional< any >`: The entity record’s edits.

### [getEntityRecordNonTransientEdits](#getentityrecordnontransientedits)

Returns the specified entity record’s non transient edits.

Transient edits don’t create an undo level, and are not considered for change detection. They are defined in the entity’s config.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `Optional< any >`: The entity record’s non transient edits.

### [getEntityRecords](#getentityrecords)

Returns the Entity’s records.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *query* `GetRecordsHttpQuery`: Optional terms query. If requesting specific fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for “List \[Entity kind\]s”.

*Returns*

-   `EntityRecord[] | null`: Records.

### [getEntityRecordsTotalItems](#getentityrecordstotalitems)

Returns the Entity’s total available records for a given query (ignoring pagination).

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *query* `GetRecordsHttpQuery`: Optional terms query. If requesting specific fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for “List \[Entity kind\]s”.

*Returns*

-   `number | null`: number | null.

### [getEntityRecordsTotalPages](#getentityrecordstotalpages)

Returns the number of available pages for the given query.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *query* `GetRecordsHttpQuery`: Optional terms query. If requesting specific fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for “List \[Entity kind\]s”.

*Returns*

-   `number | null`: number | null.

### [getLastEntityDeleteError](#getlastentitydeleteerror)

Returns the specified entity record’s last delete error.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `any`: The entity record’s save error.

### [getLastEntitySaveError](#getlastentitysaveerror)

Returns the specified entity record’s last save error.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `any`: The entity record’s save error.

### [getRawEntityRecord](#getrawentityrecord)

Returns the entity’s record object by key, with its attributes mapped to their raw values.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *key* `EntityRecordKey`: Record’s key.

*Returns*

-   `EntityRecord | undefined`: Object with the entity’s raw attributes.

### [getRedoEdit](#getredoedit)

> **Deprecated** since 6.3

Returns the next edit from the current undo offset for the entity records edits history, if any.

*Parameters*

-   *state* `State`: State tree.

*Returns*

-   `Optional< any >`: The edit.

### [getReferenceByDistinctEdits](#getreferencebydistinctedits)

Returns a new reference when edited values have changed. This is useful in inferring where an edit has been made between states by comparison of the return values using strict equality.

*Usage*

```
const hasEditOccurred = (
   getReferenceByDistinctEdits( beforeState ) !==
   getReferenceByDistinctEdits( afterState )
);

```

*Parameters*

-   *state* Editor state.

*Returns*

-   A value whose reference will change only when an edit occurs.

### [getRevision](#getrevision)

Returns a single, specific revision of a parent entity.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordKey* `EntityRecordKey`: The key of the entity record whose revisions you want to fetch.
-   *revisionKey* `EntityRecordKey`: The revision’s key.
-   *query* `GetRecordsHttpQuery`: Optional query. If requesting specific fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available “Retrieve a \[entity kind\]”.

*Returns*

-   `RevisionRecord | Record< PropertyKey, never > | undefined`: Record.

### [getRevisions](#getrevisions)

Returns an entity’s revisions.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordKey* `EntityRecordKey`: The key of the entity record whose revisions you want to fetch.
-   *query* `GetRecordsHttpQuery`: Optional query. If requesting specific fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available “Retrieve a \[Entity kind\]”.

*Returns*

-   `RevisionRecord[] | null`: Record.

### [getSyncConnectionStatus](#getsyncconnectionstatus)

Returns the current sync connection status across all entities. Prioritizes disconnected states, then connecting, then connected.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `ConnectionStatus | undefined`: The current sync connection state, prioritized by importance.

### [getThemeSupports](#getthemesupports)

Return theme supports data in the index.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `any`: Index data.

### [getUndoEdit](#getundoedit)

> **Deprecated** since 6.3

Returns the previous edit from the current undo offset for the entity records edits history, if any.

*Parameters*

-   *state* `State`: State tree.

*Returns*

-   `Optional< any >`: The edit.

### [getUserPatternCategories](#getuserpatterncategories)

Retrieve the registered user pattern categories.

*Parameters*

-   *state* `State`: Data state.

*Returns*

-   `Array< UserPatternCategory >`: User patterns category array.

### [getUserQueryResults](#getuserqueryresults)

Returns all the users returned by a query ID.

*Parameters*

-   *state* `State`: Data state.
-   *queryID* `string`: Query ID.

*Returns*

-   `ET.User< 'edit' >[]`: Users list.

### [hasEditsForEntityRecord](#haseditsforentityrecord)

Returns true if the specified entity record has edits, and false otherwise.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `boolean`: Whether the entity record has edits or not.

### [hasEntityRecord](#hasentityrecord)

Returns true if a record has been received for the given set of parameters, or false otherwise.

Note: This action does not trigger a request for the entity record from the API if it’s not available in the local state.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *key* `EntityRecordKey`: Record’s key.
-   *query* `GetRecordsHttpQuery`: Optional query.

*Returns*

-   `boolean`: Whether an entity record has been received.

### [hasEntityRecords](#hasentityrecords)

Returns true if records have been received for the given set of parameters, or false otherwise.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *query* `GetRecordsHttpQuery`: Optional terms query. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for “List \[Entity kind\]s”.

*Returns*

-   `boolean`: Whether entity records have been received.

### [hasFetchedAutosaves](#hasfetchedautosaves)

Returns true if the REST request for autosaves has completed.

*Parameters*

-   *state* `State`: State tree.
-   *postType* `string`: The type of the parent post.
-   *postId* `EntityRecordKey`: The id of the parent post.

*Returns*

-   `boolean`: True if the REST request was completed. False otherwise.

### [hasRedo](#hasredo)

Returns true if there is a next edit from the current undo offset for the entity records edits history, and false otherwise.

*Parameters*

-   *state* `State`: State tree.

*Returns*

-   `boolean`: Whether there is a next edit or not.

### [hasRevision](#hasrevision)

Returns true if a revision has been received for the given set of parameters, or false otherwise.

Note: This does not trigger a request for the revision from the API if it’s not available in the local state.

*Parameters*

-   *state* `State`: State tree
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordKey* `EntityRecordKey`: The key of the entity record whose revision you want to check.
-   *revisionKey* `EntityRecordKey`: The revision’s key.
-   *query* `GetRecordsHttpQuery`: Optional query.

*Returns*

-   `boolean`: Whether a revision has been received.

### [hasUndo](#hasundo)

Returns true if there is a previous edit from the current undo offset for the entity records edits history, and false otherwise.

*Parameters*

-   *state* `State`: State tree.

*Returns*

-   `boolean`: Whether there is a previous edit or not.

### [isAutosavingEntityRecord](#isautosavingentityrecord)

Returns true if the specified entity record is autosaving, and false otherwise.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `boolean`: Whether the entity record is autosaving or not.

### [isDeletingEntityRecord](#isdeletingentityrecord)

Returns true if the specified entity record is deleting, and false otherwise.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `boolean`: Whether the entity record is deleting or not.

### [isPreviewEmbedFallback](#ispreviewembedfallback)

Determines if the returned preview is an oEmbed link fallback.

WordPress can be configured to return a simple link to a URL if it is not embeddable. We need to be able to determine if a URL is embeddable or not, based on what we get back from the oEmbed preview API.

*Parameters*

-   *state* `State`: Data state.
-   *url* `string`: Embedded URL.

*Returns*

-   `boolean`: Is the preview for the URL an oEmbed link fallback.

### [isRequestingEmbedPreview](#isrequestingembedpreview)

Returns true if a request is in progress for embed preview data, or false otherwise.

*Parameters*

-   *state* `State`: Data state.
-   *url* `string`: URL the preview would be for.

*Returns*

-   `boolean`: Whether a request is in progress for an embed preview.

### [isSavingEntityRecord](#issavingentityrecord)

Returns true if the specified entity record is saving, and false otherwise.

*Parameters*

-   *state* `State`: State tree.
-   *kind* `string`: Entity kind.
-   *name* `string`: Entity name.
-   *recordId* `EntityRecordKey`: Record ID.

*Returns*

-   `boolean`: Whether the entity record is saving or not.

## [Hooks](#hooks)

The following set of react hooks available to import from the `@wordpress/core-data` package:

### [useEntityBlockEditor](#useentityblockeditor)

Hook that returns block content getters and setters for the nearest provided entity of the specified type.

The return value has the shape `[ blocks, onInput, onChange ]`. `onInput` is for block changes that don’t create undo levels or dirty the post, non-persistent changes, and `onChange` is for persistent changes. They map directly to the props of a `BlockEditorProvider` and are intended to be used with it, or similar components or hooks.

*Parameters*

-   *kind* `string`: The entity kind.
-   *name* `string`: The entity name.
-   *options* `Object`:
-   *options.id* `[string]`: An entity ID to use instead of the context-provided one.

*Returns*

-   `[unknown[], Function, Function]`: The block array and setters.

### [useEntityId](#useentityid)

Hook that returns the ID for the nearest provided entity of the specified type.

*Parameters*

-   *kind* `string`: The entity kind.
-   *name* `string`: The entity name.

### [useEntityProp](#useentityprop)

Hook that returns the value and a setter for the specified property of the nearest provided entity of the specified type.

*Parameters*

-   *kind* `string`: The entity kind.
-   *name* `string`: The entity name.
-   *prop* `string`: The property name.
-   *\_id* `[number|string]`: An entity ID to use instead of the context-provided one.

*Returns*

-   `[*, Function, *]`: An array where the first item is the property value, the second is the setter and the third is the full value object from REST API containing more information like `raw`, `rendered` and `protected` props.

### [useEntityRecord](#useentityrecord)

Resolves the specified entity record.

*Usage*

```
import { useEntityRecord } from '@wordpress/core-data';

function PageTitleDisplay( { id } ) {
    const { record, isResolving } = useEntityRecord( 'postType', 'page', id );

    if ( isResolving ) {
        return 'Loading...';
    }

    return record.title;
}

// Rendered in the application:
// <PageTitleDisplay id={ 1 } />

```

In the above example, when `PageTitleDisplay` is rendered into an  
application, the page and the resolution details will be retrieved from  
the store state using `getEntityRecord()`, or resolved if missing.

```
import { useCallback } from 'react';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';
import { store as noticeStore } from '@wordpress/notices';
import { useEntityRecord } from '@wordpress/core-data';

function PageRenameForm( { id } ) {
    const page = useEntityRecord( 'postType', 'page', id );
    const { createSuccessNotice, createErrorNotice } =
        useDispatch( noticeStore );

    const setTitle = useCallback(
        ( title ) => {
            page.edit( { title } );
        },
        [ page.edit ]
    );

    if ( page.isResolving ) {
        return 'Loading...';
    }

    async function onRename( event ) {
        event.preventDefault();
        try {
            await page.save();
            createSuccessNotice( __( 'Page renamed.' ), {
                type: 'snackbar',
            } );
        } catch ( error ) {
            createErrorNotice( error.message, { type: 'snackbar' } );
        }
    }

    return (
        <form onSubmit={ onRename }>
            <TextControl
                __next40pxDefaultSize
                label={ __( 'Name' ) }
                value={ page.editedRecord.title }
                onChange={ setTitle }
            />
            <button type="submit">{ __( 'Save' ) }</button>
        </form>
    );
}

// Rendered in the application:
// <PageRenameForm id={ 1 } />

```

In the above example, updating and saving the page title is handled  
via the `edit()` and `save()` mutation helpers provided by  
`useEntityRecord()`;

*Parameters*

-   *kind* `string`: Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
-   *name* `string`: Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
-   *recordId* `string | number`: ID of the requested entity record.
-   *options* `Options`: Optional hook options.

*Returns*

-   `EntityRecordResolution< RecordType >`: Entity record data.

*Changelog*

`6.1.0` Introduced in WordPress core.

### [useEntityRecords](#useentityrecords)

Resolves the specified entity records.

*Usage*

```
import { useEntityRecords } from '@wordpress/core-data';

function PageTitlesList() {
    const { records, isResolving } = useEntityRecords( 'postType', 'page' );

    if ( isResolving ) {
        return 'Loading...';
    }

    return (
        <ul>
            { records.map( ( page ) => (
                <li>{ page.title }</li>
            ) ) }
        </ul>
    );
}

// Rendered in the application:
// <PageTitlesList />

```

In the above example, when `PageTitlesList` is rendered into an  
application, the list of records and the resolution details will be retrieved from  
the store state using `getEntityRecords()`, or resolved if missing.

*Parameters*

-   *kind* `string`: Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
-   *name* `string`: Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
-   *queryArgs* `Record< string, unknown >`: Optional HTTP query description for how to fetch the data, passed to the requested API endpoint.
-   *options* `Options`: Optional hook options.

*Returns*

-   `EntityRecordsResolution< RecordType >`: Entity records data.

*Changelog*

`6.1.0` Introduced in WordPress core.

### [useResourcePermissions](#useresourcepermissions)

Resolves resource permissions.

*Usage*

```
import { useResourcePermissions } from '@wordpress/core-data';

function PagesList() {
    const { canCreate, isResolving } = useResourcePermissions( {
        kind: 'postType',
        name: 'page',
    } );

    if ( isResolving ) {
        return 'Loading ...';
    }

    return (
        <div>
            { canCreate ? <button>+ Create a new page</button> : false }
            // ...
        </div>
    );
}

// Rendered in the application:
// <PagesList />

```
```
import { useResourcePermissions } from '@wordpress/core-data';

function Page( { pageId } ) {
    const { canCreate, canUpdate, canDelete, isResolving } =
        useResourcePermissions( {
            kind: 'postType',
            name: 'page',
            id: pageId,
        } );

    if ( isResolving ) {
        return 'Loading ...';
    }

    return (
        <div>
            { canCreate ? <button>+ Create a new page</button> : false }
            { canUpdate ? <button>Edit page</button> : false }
            { canDelete ? <button>Delete page</button> : false }
            // ...
        </div>
    );
}

// Rendered in the application:
// <Page pageId={ 15 } />

```

In the above example, when `PagesList` is rendered into an  
application, the appropriate permissions and the resolution details will be retrieved from  
the store state using `canUser()`, or resolved if missing.

*Parameters*

-   *resource* `string | EntityResource`: Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }` or REST base as a string – `media`.
-   *id* `IdType`: Optional ID of the resource to check, e.g. 10. Note: This argument is discouraged when using an entity object as a resource to check permissions and will be ignored.

*Returns*

-   `ResourcePermissionsResolution< IdType >`: Entity records data.

*Changelog*

`6.1.0` Introduced in WordPress core.

### [WithPermissions](#withpermissions)

Utility type that adds permissions to any record type.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).