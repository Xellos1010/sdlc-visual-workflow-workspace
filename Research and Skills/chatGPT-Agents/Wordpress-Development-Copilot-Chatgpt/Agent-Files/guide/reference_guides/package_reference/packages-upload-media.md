# @wordpress/upload-media – Block Editor Handbook | Developer.WordPress.org

This package is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.

This module is a media upload handler with a queue-like system that is implemented using a custom `@wordpress/data` store.

Such a system is useful for additional client-side processing of media files (e.g. image compression) before uploading them to a server.

It is typically used by `@wordpress/block-editor` but can also be leveraged outside of it.

## [Installation](#installation)

Install the module

```
npm install @wordpress/upload-media --save

```

## [Usage](#usage)

This is a basic example of how one can interact with the upload data store:

```
import { store as uploadStore } from '@wordpress/upload-media';
import { dispatch } from '@wordpress/data';

dispatch( uploadStore ).updateSettings( /* ... */ );
dispatch( uploadStore ).addItems( [
    /* ... */
] );

```

Refer to the API reference below or the TypeScript types for further help.

## [API Reference](#api-reference)

### [Actions](#actions)

The following set of dispatching action creators are available on the object returned by `wp.data.dispatch( 'core/upload-media' )`:

#### [addItems](#additems)

Adds a new item to the upload queue.

*Parameters*

-   *$0* `AddItemsArgs`:
-   *$0.files* `AddItemsArgs[ 'files' ]`: Files
-   *$0.onChange* `[AddItemsArgs[ 'onChange' ]]`: Function called each time a file or a temporary representation of the file is available.
-   *$0.onSuccess* `[AddItemsArgs[ 'onSuccess' ]]`: Function called after the file is uploaded.
-   *$0.onBatchSuccess* `[AddItemsArgs[ 'onBatchSuccess' ]]`: Function called after a batch of files is uploaded.
-   *$0.onError* `[AddItemsArgs[ 'onError' ]]`: Function called when an error happens.
-   *$0.additionalData* `[AddItemsArgs[ 'additionalData' ]]`: Additional data to include in the request.
-   *$0.allowedTypes* `[AddItemsArgs[ 'allowedTypes' ]]`: Array with the types of media that can be uploaded, if unset all types are allowed.

#### [cancelItem](#cancelitem)

Cancels an item in the queue based on an error.

*Parameters*

-   *id* `QueueItemId`: Item ID.
-   *error* `Error`: Error instance.
-   *silent* Whether to cancel the item silently, without invoking its `onError` callback.

#### [retryItem](#retryitem)

Retries a failed item in the queue.

*Parameters*

-   *id* `QueueItemId`: Item ID.

### [Selectors](#selectors)

The following selectors are available on the object returned by `wp.data.select( 'core/upload-media' )`:

#### [getItems](#getitems)

Returns all items currently being uploaded.

*Parameters*

-   *state* `State`: Upload state.

*Returns*

-   `QueueItem[]`: Queue items.

#### [getSettings](#getsettings)

Returns the media upload settings.

*Parameters*

-   *state* `State`: Upload state.

*Returns*

-   `Settings`: Settings

#### [isUploading](#isuploading)

Determines whether any upload is currently in progress.

*Parameters*

-   *state* `State`: Upload state.

*Returns*

-   `boolean`: Whether any upload is currently in progress.

#### [isUploadingById](#isuploadingbyid)

Determines whether an upload is currently in progress given an attachment ID.

*Parameters*

-   *state* `State`: Upload state.
-   *attachmentId* `number`: Attachment ID.

*Returns*

-   `boolean`: Whether upload is currently in progress for the given attachment.

#### [isUploadingByUrl](#isuploadingbyurl)

Determines whether an upload is currently in progress given an attachment URL.

*Parameters*

-   *state* `State`: Upload state.
-   *url* `string`: Attachment URL.

*Returns*

-   `boolean`: Whether upload is currently in progress for the given attachment.