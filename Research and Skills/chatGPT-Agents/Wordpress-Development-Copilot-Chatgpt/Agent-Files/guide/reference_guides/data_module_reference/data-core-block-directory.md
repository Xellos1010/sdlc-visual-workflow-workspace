# Block directory – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/block-directory`.

## [Selectors](#selectors)

### [getDownloadableBlocks](#getdownloadableblocks)

Returns the available uninstalled blocks.

*Parameters*

-   *state* `Object`: Global application state.
-   *filterValue* `string`: Search string.

*Returns*

-   `Array`: Downloadable blocks.

### [getErrorNoticeForBlock](#geterrornoticeforblock)

Returns the error notice for a given block.

*Parameters*

-   *state* `Object`: Global application state.
-   *blockId* `string`: The ID of the block plugin. eg: my-block

*Returns*

-   `string|boolean`: The error text, or false if no error.

### [getErrorNotices](#geterrornotices)

Returns all block error notices.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Object with error notices.

### [getInstalledBlockTypes](#getinstalledblocktypes)

Returns the block types that have been installed on the server in this session.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: Block type items

### [getNewBlockTypes](#getnewblocktypes)

Returns block types that have been installed on the server and used in the current post.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: Block type items.

### [getUnusedBlockTypes](#getunusedblocktypes)

Returns the block types that have been installed on the server but are not used in the current post.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: Block type items.

### [isInstalling](#isinstalling)

Returns true if a block plugin install is in progress.

*Parameters*

-   *state* `Object`: Global application state.
-   *blockId* `string`: Id of the block.

*Returns*

-   `boolean`: Whether this block is currently being installed.

### [isRequestingDownloadableBlocks](#isrequestingdownloadableblocks)

Returns true if application is requesting for downloadable blocks.

*Parameters*

-   *state* `Object`: Global application state.
-   *filterValue* `string`: Search string.

*Returns*

-   `boolean`: Whether a request is in progress for the blocks list.

## [Actions](#actions)

### [addInstalledBlockType](#addinstalledblocktype)

Returns an action object used to add a block type to the “newly installed” tracking list.

*Parameters*

-   *item* `Object`: The block item with the block id and name.

*Returns*

-   `Object`: Action object.

### [clearErrorNotice](#clearerrornotice)

Sets the error notice to empty for specific block.

*Parameters*

-   *blockId* `string`: The ID of the block plugin. eg: my-block

*Returns*

-   `Object`: Action object.

### [fetchDownloadableBlocks](#fetchdownloadableblocks)

Returns an action object used in signalling that the downloadable blocks have been requested and are loading.

*Parameters*

-   *filterValue* `string`: Search string.

*Returns*

-   `Object`: Action object.

### [installBlockType](#installblocktype)

Action triggered to install a block plugin.

*Parameters*

-   *block* `Object`: The block item returned by search.

*Returns*

-   `boolean`: Whether the block was successfully installed & loaded.

### [receiveDownloadableBlocks](#receivedownloadableblocks)

Returns an action object used in signalling that the downloadable blocks have been updated.

*Parameters*

-   *downloadableBlocks* `Array`: Downloadable blocks.
-   *filterValue* `string`: Search string.

*Returns*

-   `Object`: Action object.

### [removeInstalledBlockType](#removeinstalledblocktype)

Returns an action object used to remove a block type from the “newly installed” tracking list.

*Parameters*

-   *item* `string`: The block item with the block id and name.

*Returns*

-   `Object`: Action object.

### [setErrorNotice](#seterrornotice)

Sets an error notice to be displayed to the user for a given block.

*Parameters*

-   *blockId* `string`: The ID of the block plugin. eg: my-block
-   *message* `string`: The message shown in the notice.
-   *isFatal* `boolean`: Whether the user can recover from the error.

*Returns*

-   `Object`: Action object.

### [setIsInstalling](#setisinstalling)

Returns an action object used to indicate install in progress.

*Parameters*

-   *blockId* `string`:
-   *isInstalling* `boolean`:

*Returns*

-   `Object`: Action object.

### [uninstallBlockType](#uninstallblocktype)

Action triggered to uninstall a block plugin.

*Parameters*

-   *block* `Object`: The blockType object.