# The Post Editor’s Data

Namespace: `core/editor`.

## [Selectors](#selectors)

### [canInsertBlockType](#caninsertblocktype)

*Related*

-   canInsertBlockType in core/block-editor store.

### [canUserUseUnfilteredHTML](#canuseruseunfilteredhtml)

Returns whether or not the user has the unfiltered\_html capability.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `boolean`: Whether the user can or can’t post unfiltered HTML.

### [didPostSaveRequestFail](#didpostsaverequestfail)

Returns true if a previous post save was attempted but failed, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post save failed.

### [didPostSaveRequestSucceed](#didpostsaverequestsucceed)

Returns true if a previous post save was attempted successfully, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post was saved successfully.

### [getActivePostLock](#getactivepostlock)

Returns the active post lock.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: The lock object.

### [getAdjacentBlockClientId](#getadjacentblockclientid)

*Related*

-   getAdjacentBlockClientId in core/block-editor store.

### [getAutosaveAttribute](#getautosaveattribute)

> **Deprecated** since 5.6. Callers should use the `getAutosave( postType, postId, userId )` selector from the ‘@wordpress/core-data’ package and access properties on the returned autosave object using getPostRawValue.

Returns an attribute value of the current autosave revision for a post, or null if there is no autosave for the post.

*Parameters*

-   *state* `Object`: Global application state.
-   *attributeName* `string`: Autosave attribute name.

*Returns*

-   `*`: Autosave attribute value.

### [getBlock](#getblock)

*Related*

-   getBlock in core/block-editor store.

### [getBlockAttributes](#getblockattributes)

*Related*

-   getBlockAttributes in core/block-editor store.

### [getBlockCount](#getblockcount)

*Related*

-   getBlockCount in core/block-editor store.

### [getBlockHierarchyRootClientId](#getblockhierarchyrootclientid)

*Related*

-   getBlockHierarchyRootClientId in core/block-editor store.

### [getBlockIndex](#getblockindex)

*Related*

-   getBlockIndex in core/block-editor store.

### [getBlockInsertionPoint](#getblockinsertionpoint)

*Related*

-   getBlockInsertionPoint in core/block-editor store.

### [getBlockListSettings](#getblocklistsettings)

*Related*

-   getBlockListSettings in core/block-editor store.

### [getBlockMode](#getblockmode)

*Related*

-   getBlockMode in core/block-editor store.

### [getBlockName](#getblockname)

*Related*

-   getBlockName in core/block-editor store.

### [getBlockOrder](#getblockorder)

*Related*

-   getBlockOrder in core/block-editor store.

### [getBlockRootClientId](#getblockrootclientid)

*Related*

-   getBlockRootClientId in core/block-editor store.

### [getBlocks](#getblocks)

*Related*

-   getBlocks in core/block-editor store.

### [getBlocksByClientId](#getblocksbyclientid)

*Related*

-   getBlocksByClientId in core/block-editor store.

### [getBlockSelectionEnd](#getblockselectionend)

*Related*

-   getBlockSelectionEnd in core/block-editor store.

### [getBlockSelectionStart](#getblockselectionstart)

*Related*

-   getBlockSelectionStart in core/block-editor store.

### [getClientIdsOfDescendants](#getclientidsofdescendants)

*Related*

-   getClientIdsOfDescendants in core/block-editor store.

### [getClientIdsWithDescendants](#getclientidswithdescendants)

*Related*

-   getClientIdsWithDescendants in core/block-editor store.

### [getCurrentPost](#getcurrentpost)

Returns the post currently being edited in its last known saved state, not including unsaved edits. Returns an object containing relevant default post values if the post has not yet been saved.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Post object.

### [getCurrentPostAttribute](#getcurrentpostattribute)

Returns an attribute value of the saved post.

*Parameters*

-   *state* `Object`: Global application state.
-   *attributeName* `string`: Post attribute name.

*Returns*

-   `*`: Post attribute value.

### [getCurrentPostId](#getcurrentpostid)

Returns the ID of the post currently being edited, or null if the post has not yet been saved.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?(number|string)`: The current post ID (number) or template slug (string).

### [getCurrentPostLastRevisionId](#getcurrentpostlastrevisionid)

Returns the last revision ID of the post currently being edited, or null if the post has no revisions.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?number`: ID of the last revision.

### [getCurrentPostRevisionsCount](#getcurrentpostrevisionscount)

Returns the number of revisions of the post currently being edited.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `number`: Number of revisions.

### [getCurrentPostType](#getcurrentposttype)

Returns the post type of the post currently being edited.

*Usage*

```
const currentPostType = wp.data.select( 'core/editor' ).getCurrentPostType();

```

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Post type.

### [getCurrentTemplateId](#getcurrenttemplateid)

Returns the template ID currently being rendered/edited

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?string`: Template ID.

### [getDeviceType](#getdevicetype)

Returns the current editing canvas device type.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Device type.

### [getEditedPostAttribute](#geteditedpostattribute)

Returns a single attribute of the post being edited, preferring the unsaved edit if one exists, but falling back to the attribute for the last known saved state of the post.

*Usage*

```
// Get specific media size based on the featured media ID
// Note: change sizes?.large for any registered size
const getFeaturedMediaUrl = useSelect( ( select ) => {
    const getFeaturedMediaId =
        select( 'core/editor' ).getEditedPostAttribute( 'featured_media' );
    const media = select( 'core' ).getEntityRecord(
        'postType',
        'attachment',
        getFeaturedMediaId
    );

    return (
        media?.media_details?.sizes?.large?.source_url ||
        media?.source_url ||
        ''
    );
}, [] );

```

*Parameters*

-   *state* `Object`: Global application state.
-   *attributeName* `string`: Post attribute name.

*Returns*

-   `*`: Post attribute value.

### [getEditedPostContent](#geteditedpostcontent)

Returns the content of the post being edited.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Post content.

### [getEditedPostPreviewLink](#geteditedpostpreviewlink)

Returns the post preview link

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string | undefined`: Preview Link.

### [getEditedPostSlug](#geteditedpostslug)

Returns the slug for the post being edited, preferring a manually edited value if one exists, then a sanitized version of the current post title, and finally the post ID.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `string`: The current slug to be displayed in the editor

### [getEditedPostVisibility](#geteditedpostvisibility)

Returns the current visibility of the post being edited, preferring the unsaved value if different than the saved post. The return value is one of “private”, “password”, or “public”.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Post visibility.

### [getEditorBlocks](#geteditorblocks)

Return the current block list.

*Parameters*

-   *state* `Object`:

*Returns*

-   `Array`: Block list.

### [getEditorMode](#geteditormode)

Returns the current editing mode.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Editing mode.

### [getEditorSelection](#geteditorselection)

Returns the current selection.

*Parameters*

-   *state* `Object`:

*Returns*

-   `WPBlockSelection`: The selection end.

### [getEditorSelectionEnd](#geteditorselectionend)

> **Deprecated** since Gutenberg 10.0.0.

Returns the current selection end.

*Parameters*

-   *state* `Object`:

*Returns*

-   `WPBlockSelection`: The selection end.

### [getEditorSelectionStart](#geteditorselectionstart)

> **Deprecated** since Gutenberg 10.0.0.

Returns the current selection start.

*Parameters*

-   *state* `Object`:

*Returns*

-   `WPBlockSelection`: The selection start.

### [getEditorSettings](#geteditorsettings)

Returns the post editor settings.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `Object`: The editor settings object.

### [getFirstMultiSelectedBlockClientId](#getfirstmultiselectedblockclientid)

*Related*

-   getFirstMultiSelectedBlockClientId in core/block-editor store.

### [getGlobalBlockCount](#getglobalblockcount)

*Related*

-   getGlobalBlockCount in core/block-editor store.

### [getInserterItems](#getinserteritems)

*Related*

-   getInserterItems in core/block-editor store.

### [getLastMultiSelectedBlockClientId](#getlastmultiselectedblockclientid)

*Related*

-   getLastMultiSelectedBlockClientId in core/block-editor store.

### [getMultiSelectedBlockClientIds](#getmultiselectedblockclientids)

*Related*

-   getMultiSelectedBlockClientIds in core/block-editor store.

### [getMultiSelectedBlocks](#getmultiselectedblocks)

*Related*

-   getMultiSelectedBlocks in core/block-editor store.

### [getMultiSelectedBlocksEndClientId](#getmultiselectedblocksendclientid)

*Related*

-   getMultiSelectedBlocksEndClientId in core/block-editor store.

### [getMultiSelectedBlocksStartClientId](#getmultiselectedblocksstartclientid)

*Related*

-   getMultiSelectedBlocksStartClientId in core/block-editor store.

### [getNextBlockClientId](#getnextblockclientid)

*Related*

-   getNextBlockClientId in core/block-editor store.

### [getPermalink](#getpermalink)

Returns the permalink for the post.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `?string`: The permalink, or null if the post is not viewable.

### [getPermalinkParts](#getpermalinkparts)

Returns the permalink for a post, split into its three parts: the prefix, the postName, and the suffix.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `Object`: An object containing the prefix, postName, and suffix for the permalink, or null if the post is not viewable.

### [getPostEdits](#getpostedits)

Returns any post values which have been changed in the editor but not yet been saved.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Object of key value pairs comprising unsaved edits.

### [getPostLockUser](#getpostlockuser)

Returns details about the post lock user.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: A user object.

### [getPostTypeLabel](#getposttypelabel)

Returns a post type label depending on the current post.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string|undefined`: The post type label if available, otherwise undefined.

### [getPreviousBlockClientId](#getpreviousblockclientid)

*Related*

-   getPreviousBlockClientId in core/block-editor store.

### [getRenderingMode](#getrenderingmode)

Returns the post editor’s rendering mode.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `string`: Rendering mode.

### [getSelectedBlock](#getselectedblock)

*Related*

-   getSelectedBlock in core/block-editor store.

### [getSelectedBlockClientId](#getselectedblockclientid)

*Related*

-   getSelectedBlockClientId in core/block-editor store.

### [getSelectedBlockCount](#getselectedblockcount)

*Related*

-   getSelectedBlockCount in core/block-editor store.

### [getSelectedBlocksInitialCaretPosition](#getselectedblocksinitialcaretposition)

*Related*

-   getSelectedBlocksInitialCaretPosition in core/block-editor store.

### [getStateBeforeOptimisticTransaction](#getstatebeforeoptimistictransaction)

> **Deprecated** since Gutenberg 9.7.0.

Returns state object prior to a specified optimist transaction ID, or `null` if the transaction corresponding to the given ID cannot be found.

### [getSuggestedPostFormat](#getsuggestedpostformat)

Returns a suggested post format for the current post, inferred only if there is a single block within the post and it is of a type known to match a default post format. Returns null if the format cannot be determined.

*Returns*

-   `?string`: Suggested post format.

### [getTemplate](#gettemplate)

*Related*

-   getTemplate in core/block-editor store.

### [getTemplateLock](#gettemplatelock)

*Related*

-   getTemplateLock in core/block-editor store.

### [hasChangedContent](#haschangedcontent)

Returns true if content includes unsaved changes, or false otherwise.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `boolean`: Whether content includes unsaved changes.

### [hasEditorRedo](#haseditorredo)

Returns true if any future editor history snapshots exist, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether redo history exists.

### [hasEditorUndo](#haseditorundo)

Returns true if any past editor history snapshots exist, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether undo history exists.

### [hasInserterItems](#hasinserteritems)

*Related*

-   hasInserterItems in core/block-editor store.

### [hasMultiSelection](#hasmultiselection)

*Related*

-   hasMultiSelection in core/block-editor store.

### [hasNonPostEntityChanges](#hasnonpostentitychanges)

Returns true if there are unsaved edits for entities other than the editor’s post, and false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether there are edits or not.

### [hasSelectedBlock](#hasselectedblock)

*Related*

-   hasSelectedBlock in core/block-editor store.

### [hasSelectedInnerBlock](#hasselectedinnerblock)

*Related*

-   hasSelectedInnerBlock in core/block-editor store.

### [inSomeHistory](#insomehistory)

> **Deprecated** since Gutenberg 9.7.0.

Returns true if an optimistic transaction is pending commit, for which the before state satisfies the given predicate function.

### [isAncestorMultiSelected](#isancestormultiselected)

*Related*

-   isAncestorMultiSelected in core/block-editor store.

### [isAutosavingPost](#isautosavingpost)

Returns true if the post is autosaving, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post is autosaving.

### [isBlockInsertionPointVisible](#isblockinsertionpointvisible)

*Related*

-   isBlockInsertionPointVisible in core/block-editor store.

### [isBlockMultiSelected](#isblockmultiselected)

*Related*

-   isBlockMultiSelected in core/block-editor store.

### [isBlockSelected](#isblockselected)

*Related*

-   isBlockSelected in core/block-editor store.

### [isBlockValid](#isblockvalid)

*Related*

-   isBlockValid in core/block-editor store.

### [isBlockWithinSelection](#isblockwithinselection)

*Related*

-   isBlockWithinSelection in core/block-editor store.

### [isCaretWithinFormattedText](#iscaretwithinformattedtext)

*Related*

-   isCaretWithinFormattedText in core/block-editor store.

### [isCleanNewPost](#iscleannewpost)

Returns true if there are no unsaved values for the current edit session and if the currently edited post is new (has never been saved before).

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether new post and unsaved values exist.

### [isCollaborationEnabledForCurrentPost](#iscollaborationenabledforcurrentpost)

Returns whether the collaboration is enabled for the current post.

*Returns*

-   `boolean`: Whether collaboration is enabled.

### [isCurrentPostPending](#iscurrentpostpending)

Returns true if post is pending review.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether current post is pending review.

### [isCurrentPostPublished](#iscurrentpostpublished)

Return true if the current post has already been published.

*Parameters*

-   *state* `Object`: Global application state.
-   *currentPost* `[Object]`: Explicit current post for bypassing registry selector.

*Returns*

-   `boolean`: Whether the post has been published.

### [isCurrentPostScheduled](#iscurrentpostscheduled)

Returns true if post is already scheduled.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether current post is scheduled to be posted.

### [isDeletingPost](#isdeletingpost)

Returns true if the post is currently being deleted, or false otherwise.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `boolean`: Whether post is being deleted.

### [isEditedPostAutosaveable](#iseditedpostautosaveable)

Returns true if the post can be autosaved, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.
-   *autosave* `Object`: A raw autosave object from the REST API.

*Returns*

-   `boolean`: Whether the post can be autosaved.

### [isEditedPostBeingScheduled](#iseditedpostbeingscheduled)

Return true if the post being edited is being scheduled. Preferring the unsaved status values.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post has been published.

### [isEditedPostDateFloating](#iseditedpostdatefloating)

Returns whether the current post should be considered to have a “floating” date (i.e. that it would publish “Immediately” rather than at a set time).

Unlike in the PHP backend, the REST API returns a full date string for posts where the 0000-00-00T00:00:00 placeholder is present in the database. To infer that a post is set to publish “Immediately” we check whether the date and modified date are the same.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `boolean`: Whether the edited post has a floating date value.

### [isEditedPostDirty](#iseditedpostdirty)

Returns true if there are unsaved values for the current edit session, or false if the editing state matches the saved or new post.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether unsaved values exist.

### [isEditedPostEmpty](#iseditedpostempty)

Returns true if the edited post has content. A post has content if it has at least one saveable block or otherwise has a non-empty content property assigned.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether post has content.

### [isEditedPostNew](#iseditedpostnew)

Returns true if the currently edited post is yet to be saved, or false if the post has been saved.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post is new.

### [isEditedPostPublishable](#iseditedpostpublishable)

Return true if the post being edited can be published.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post can been published.

### [isEditedPostSaveable](#iseditedpostsaveable)

Returns true if the post can be saved, or false otherwise. A post must contain a title, an excerpt, or non-empty content to be valid for save.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post can be saved.

### [isEditorPanelEnabled](#iseditorpanelenabled)

Returns true if the given panel is enabled, or false otherwise. Panels are enabled by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is enabled.

### [isEditorPanelOpened](#iseditorpanelopened)

Returns true if the given panel is open, or false otherwise. Panels are closed by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is open.

### [isEditorPanelRemoved](#iseditorpanelremoved)

Returns true if the given panel was programmatically removed, or false otherwise. All panels are not removed by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is removed.

### [isFirstMultiSelectedBlock](#isfirstmultiselectedblock)

*Related*

-   isFirstMultiSelectedBlock in core/block-editor store.

### [isInserterOpened](#isinserteropened)

Returns true if the inserter is opened.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the inserter is opened.

### [isListViewOpened](#islistviewopened)

Returns true if the list view is opened.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the list view is opened.

### [isMultiSelecting](#ismultiselecting)

*Related*

-   isMultiSelecting in core/block-editor store.

### [isPermalinkEditable](#ispermalinkeditable)

Returns whether the permalink is editable or not.

*Parameters*

-   *state* `Object`: Editor state.

*Returns*

-   `boolean`: Whether or not the permalink is editable.

### [isPostAutosavingLocked](#ispostautosavinglocked)

Returns whether post autosaving is locked.

*Usage*

```
import { __ } from '@wordpress/i18n';
import { store as editorStore } from '@wordpress/editor';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const isAutoSavingLocked = useSelect(
        ( select ) => select( editorStore ).isPostAutosavingLocked(),
        []
    );

    return isAutoSavingLocked ? (
        <p>{ __( 'Post auto saving is locked' ) }</p>
    ) : (
        <p>{ __( 'Post auto saving is not locked' ) }</p>
    );
};

```

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Is locked.

### [isPostLocked](#ispostlocked)

Returns whether the post is locked.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Is locked.

### [isPostLockTakeover](#ispostlocktakeover)

Returns whether the edition of the post has been taken over.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Is post lock takeover.

### [isPostSavingLocked](#ispostsavinglocked)

Returns whether post saving is locked.

*Usage*

```
import { __ } from '@wordpress/i18n';
import { store as editorStore } from '@wordpress/editor';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const isSavingLocked = useSelect(
        ( select ) => select( editorStore ).isPostSavingLocked(),
        []
    );

    return isSavingLocked ? (
        <p>{ __( 'Post saving is locked' ) }</p>
    ) : (
        <p>{ __( 'Post saving is not locked' ) }</p>
    );
};

```

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Is locked.

### [isPreviewingPost](#ispreviewingpost)

Returns true if the post is being previewed, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the post is being previewed.

### [isPublishingPost](#ispublishingpost)

Returns true if the post is being published, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether post is being published.

Returns whether the pre-publish panel should be shown or skipped when the user clicks the “publish” button.

*Returns*

-   `boolean`: Whether the pre-publish panel should be shown or not.

Returns true if the publish sidebar is opened.

*Parameters*

-   *state* `Object`: Global application state

*Returns*

-   `boolean`: Whether the publish sidebar is open.

### [isSavingNonPostEntityChanges](#issavingnonpostentitychanges)

Returns true if non-post entities are currently being saved, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether non-post entities are being saved.

### [isSavingPost](#issavingpost)

Returns true if the post is currently being saved, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether post is being saved.

### [isSelectionEnabled](#isselectionenabled)

*Related*

-   isSelectionEnabled in core/block-editor store.

### [isTyping](#istyping)

*Related*

-   isTyping in core/block-editor store.

### [isValidTemplate](#isvalidtemplate)

*Related*

-   isValidTemplate in core/block-editor store.

## [Actions](#actions)

### [autosave](#autosave)

Action that autosaves the current post. This includes server-side autosaving (default) and client-side (a.k.a. local) autosaving (e.g. on the Web, the post might be committed to Session Storage).

*Parameters*

-   *options* `[Object]`: Extra flags to identify the autosave.
-   *options.local* `[boolean]`: Whether to perform a local autosave.

### [clearSelectedBlock](#clearselectedblock)

*Related*

-   clearSelectedBlock in core/block-editor store.

Returns an action object used in signalling that the user closed the publish sidebar.

*Returns*

-   `Object`: Action object.

### [createUndoLevel](#createundolevel)

> **Deprecated** Since WordPress 6.0

Action that creates an undo history record.

Disables the publish sidebar.

### [editPost](#editpost)

Returns an action object used in signalling that attributes of the post have been edited.

*Usage*

```
// Update the post title
wp.data.dispatch( 'core/editor' ).editPost( { title: `${ newTitle }` } );

```

*Parameters*

-   *edits* `Object`: Post attributes to edit.
-   *options* `[Object]`: Options for the edit.

*Returns*

-   `Object`: Action object

Enable the publish sidebar.

### [enterFormattedText](#enterformattedtext)

*Related*

-   enterFormattedText in core/block-editor store.

### [exitFormattedText](#exitformattedtext)

*Related*

-   exitFormattedText in core/block-editor store.

### [hideInsertionPoint](#hideinsertionpoint)

*Related*

-   hideInsertionPoint in core/block-editor store.

### [insertBlock](#insertblock)

*Related*

-   insertBlock in core/block-editor store.

### [insertBlocks](#insertblocks)

*Related*

-   insertBlocks in core/block-editor store.

### [insertDefaultBlock](#insertdefaultblock)

*Related*

-   insertDefaultBlock in core/block-editor store.

### [lockPostAutosaving](#lockpostautosaving)

Action that locks post autosaving.

*Usage*

```
// Lock post autosaving with the lock key `mylock`:
wp.data.dispatch( 'core/editor' ).lockPostAutosaving( 'mylock' );

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object

### [lockPostSaving](#lockpostsaving)

Action that locks post saving.

*Usage*

```
const { subscribe } = wp.data;

const initialPostStatus = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'status' );

// Only allow publishing posts that are set to a future date.
if ( 'publish' !== initialPostStatus ) {

    // Track locking.
    let locked = false;

    // Watch for the publish event.
    let unssubscribe = subscribe( () => {
        const currentPostStatus = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'status' );
        if ( 'publish' !== currentPostStatus ) {

            // Compare the post date to the current date, lock the post if the date isn't in the future.
            const postDate = new Date( wp.data.select( 'core/editor' ).getEditedPostAttribute( 'date' ) );
            const currentDate = new Date();
            if ( postDate.getTime() <= currentDate.getTime() ) {
                if ( ! locked ) {
                    locked = true;
                    wp.data.dispatch( 'core/editor' ).lockPostSaving( 'futurelock' );
                }
            } else {
                if ( locked ) {
                    locked = false;
                    wp.data.dispatch( 'core/editor' ).unlockPostSaving( 'futurelock' );
                }
            }
        }
    } );
}

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object

### [mergeBlocks](#mergeblocks)

*Related*

-   mergeBlocks in core/block-editor store.

### [moveBlocksDown](#moveblocksdown)

*Related*

-   moveBlocksDown in core/block-editor store.

### [moveBlocksUp](#moveblocksup)

*Related*

-   moveBlocksUp in core/block-editor store.

### [moveBlockToPosition](#moveblocktoposition)

*Related*

-   moveBlockToPosition in core/block-editor store.

### [multiSelect](#multiselect)

*Related*

-   multiSelect in core/block-editor store.

Returns an action object used in signalling that the user opened the publish sidebar.

*Returns*

-   `Object`: Action object

### [receiveBlocks](#receiveblocks)

*Related*

-   receiveBlocks in core/block-editor store.

### [redo](#redo)

Action that restores last popped state in undo history.

### [refreshPost](#refreshpost)

> **Deprecated** Since WordPress 6.0.

Action for refreshing the current post.

### [removeBlock](#removeblock)

*Related*

-   removeBlock in core/block-editor store.

### [removeBlocks](#removeblocks)

*Related*

-   removeBlocks in core/block-editor store.

### [removeEditorPanel](#removeeditorpanel)

Returns an action object used to remove a panel from the editor.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to remove.

*Returns*

-   `Object`: Action object.

### [replaceBlock](#replaceblock)

*Related*

-   replaceBlock in core/block-editor store.

### [replaceBlocks](#replaceblocks)

*Related*

-   replaceBlocks in core/block-editor store.

### [resetBlocks](#resetblocks)

*Related*

-   resetBlocks in core/block-editor store.

### [resetEditorBlocks](#reseteditorblocks)

Returns an action object used to signal that the blocks have been updated.

*Parameters*

-   *blocks* `Array`: Block Array.
-   *options* `[Object]`: Optional options.

### [resetPost](#resetpost)

> **Deprecated** Since WordPress 6.0.

Returns an action object used in signalling that the latest version of the post has been received, either by initialization or save.

### [savePost](#savepost)

Action for saving the current post in the editor.

*Parameters*

-   *options* `[Object]`:

### [selectBlock](#selectblock)

*Related*

-   selectBlock in core/block-editor store.

### [setDeviceType](#setdevicetype)

Action that changes the width of the editing canvas.

*Parameters*

-   *deviceType* `string`:

*Returns*

-   `Object`: Action object.

### [setEditedPost](#seteditedpost)

Returns an action that sets the current post Type and post ID.

*Parameters*

-   *postType* `string`: Post Type.
-   *postId* `string`: Post ID.

*Returns*

-   `Object`: Action object.

### [setIsInserterOpened](#setisinserteropened)

Returns an action object used to open/close the inserter.

*Parameters*

-   *value* `boolean|Object`: Whether the inserter should be opened (true) or closed (false). To specify an insertion point, use an object.
-   *value.rootClientId* `string`: The root client ID to insert at.
-   *value.insertionIndex* `number`: The index to insert at.
-   *value.filterValue* `string`: A query to filter the inserter results.
-   *value.onSelect* `Function`: A callback when an item is selected.
-   *value.tab* `string`: The tab to open in the inserter.
-   *value.category* `string`: The category to initialize in the inserter.

*Returns*

-   `Object`: Action object.

### [setIsListViewOpened](#setislistviewopened)

Returns an action object used to open/close the list view.

*Parameters*

-   *isOpen* `boolean`: A boolean representing whether the list view should be opened or closed.

*Returns*

-   `Object`: Action object.

### [setRenderingMode](#setrenderingmode)

Returns an action used to set the rendering mode of the post editor. We support multiple rendering modes:

-   `post-only`: This mode extracts the post blocks from the template and renders only those. The idea is to allow the user to edit the post/page in isolation without the wrapping template.
-   `template-locked`: This mode renders both the template and the post blocks but the template blocks are locked and can’t be edited. The post blocks are editable.

*Parameters*

-   *mode* `string`: Mode (one of ‘post-only’ or ‘template-locked’).

### [setTemplateValidity](#settemplatevalidity)

*Related*

-   setTemplateValidity in core/block-editor store.

### [setupEditor](#setupeditor)

Returns an action generator used in signalling that editor has initialized with the specified post object and editor settings.

*Parameters*

-   *post* `Object`: Post object.
-   *edits* `Object`: Initial edited attributes object.
-   *template* `[Array]`: Block Template.

### [setupEditorState](#setupeditorstate)

> **Deprecated**

Setup the editor state.

*Parameters*

-   *post* `Object`: Post object.

### [showInsertionPoint](#showinsertionpoint)

*Related*

-   showInsertionPoint in core/block-editor store.

### [startMultiSelect](#startmultiselect)

*Related*

-   startMultiSelect in core/block-editor store.

### [startTyping](#starttyping)

*Related*

-   startTyping in core/block-editor store.

### [stopMultiSelect](#stopmultiselect)

*Related*

-   stopMultiSelect in core/block-editor store.

### [stopTyping](#stoptyping)

*Related*

-   stopTyping in core/block-editor store.

### [switchEditorMode](#switcheditormode)

Triggers an action used to switch editor mode.

*Parameters*

-   *mode* `string`: The editor mode.

### [synchronizeTemplate](#synchronizetemplate)

*Related*

-   synchronizeTemplate in core/block-editor store.

### [toggleBlockMode](#toggleblockmode)

*Related*

-   toggleBlockMode in core/block-editor store.

### [toggleDistractionFree](#toggledistractionfree)

Action that toggles Distraction free mode. Distraction free mode expects there are no sidebars, as due to the z-index values set, you can’t close sidebars.

*Parameters*

-   *options* `[Object]`: Optional configuration object
-   *options.createNotice* `[boolean]`: Whether to create a notice

### [toggleEditorPanelEnabled](#toggleeditorpanelenabled)

Returns an action object used to enable or disable a panel in the editor.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to enable or disable.

*Returns*

-   `Object`: Action object.

### [toggleEditorPanelOpened](#toggleeditorpanelopened)

Opens a closed panel and closes an open panel.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to open or close.

Returns an action object used in signalling that the user toggles the publish sidebar.

*Returns*

-   `Object`: Action object

### [toggleSelection](#toggleselection)

*Related*

-   toggleSelection in core/block-editor store.

### [toggleSpotlightMode](#togglespotlightmode)

Action that toggles the Spotlight Mode view option.

### [toggleTopToolbar](#toggletoptoolbar)

Action that toggles the Top Toolbar view option.

### [trashPost](#trashpost)

Action for trashing the current post in the editor.

### [undo](#undo)

Action that pops a record from undo history and undoes the edit.

### [unlockPostAutosaving](#unlockpostautosaving)

Action that unlocks post autosaving.

*Usage*

```
// Unlock post saving with the lock key `mylock`:
wp.data.dispatch( 'core/editor' ).unlockPostAutosaving( 'mylock' );

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object

### [unlockPostSaving](#unlockpostsaving)

Action that unlocks post saving.

*Usage*

```
// Unlock post saving with the lock key `mylock`:
wp.data.dispatch( 'core/editor' ).unlockPostSaving( 'mylock' );

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object

### [updateBlock](#updateblock)

*Related*

-   updateBlock in core/block-editor store.

### [updateBlockAttributes](#updateblockattributes)

*Related*

-   updateBlockAttributes in core/block-editor store.

### [updateBlockListSettings](#updateblocklistsettings)

*Related*

-   updateBlockListSettings in core/block-editor store.

### [updateEditorSettings](#updateeditorsettings)

Undocumented declaration.

### [updatePost](#updatepost)

> **Deprecated** since Gutenberg 9.7.0.

Returns an action object used in signalling that a patch of updates for the latest version of the post have been received.

*Returns*

-   `Object`: Action object.

### [updatePostLock](#updatepostlock)

Action that locks the editor.

*Parameters*

-   *lock* `Object`: Details about the post lock status, user, and nonce.

*Returns*

-   `Object`: Action object.