# Edit Widgets – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/edit-widgets`.

## [Selectors](#selectors)

### [canInsertBlockInWidgetArea](#caninsertblockinwidgetarea)

Returns true if a block can be inserted into a widget area.

*Parameters*

-   *state* `Array`: The open state of the widget areas.
-   *blockName* `string`: The name of the block being inserted.

*Returns*

-   `boolean`: True if the block can be inserted in a widget area.

### [getEditedWidgetAreas](#geteditedwidgetareas)

Returns all edited widget area entity records.

*Returns*

-   `Object[]`: List of edited widget area entity records.

### [getIsWidgetAreaOpen](#getiswidgetareaopen)

Gets whether the widget area is opened.

*Parameters*

-   *state* `Array`: The open state of the widget areas.
-   *clientId* `string`: The clientId of the widget area.

*Returns*

-   `boolean`: True if the widget area is open.

### [getParentWidgetAreaBlock](#getparentwidgetareablock)

Given a child client id, returns the parent widget area block.

*Parameters*

-   *clientId* `string`: The client id of a block in a widget area.

*Returns*

-   `WPBlock`: The widget area block.

### [getReferenceWidgetBlocks](#getreferencewidgetblocks)

Returns all blocks representing reference widgets.

*Parameters*

-   *referenceWidgetName* `string`: Optional. If given, only reference widgets with this name will be returned.

*Returns*

-   `Array`: List of all blocks representing reference widgets

### [getWidget](#getwidget)

Returns API widget data for a particular widget ID.

*Parameters*

-   *id* `number`: Widget ID.

*Returns*

-   `Object`: API widget data for a particular widget ID.

### [getWidgetAreaForWidgetId](#getwidgetareaforwidgetid)

Returns widgetArea containing a block identify by given widgetId

*Parameters*

-   *widgetId* `string`: The ID of the widget.

*Returns*

-   `Object`: Containing widget area.

### [getWidgetAreas](#getwidgetareas)

Returns all API widget areas.

*Returns*

-   `Object[]`: API List of widget areas.

### [getWidgets](#getwidgets)

Returns all API widgets.

*Returns*

-   `Object[]`: API List of widgets.

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

### [isSavingWidgetAreas](#issavingwidgetareas)

Returns true if any widget area is currently being saved.

*Returns*

-   `boolean`: True if any widget area is currently being saved. False otherwise.

### [isWidgetSavingLocked](#iswidgetsavinglocked)

Returns whether widget saving is locked.

*Usage*

```
import { __ } from '@wordpress/i18n';
import { store as widgetStore } from '@wordpress/edit-widgets';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const isSavingLocked = useSelect(
        ( select ) => select( widgetStore ).isWidgetSavingLocked(),
        []
    );

    return isSavingLocked ? (
        <p>{ __( 'Widget saving is locked' ) }</p>
    ) : (
        <p>{ __( 'Widget saving is not locked' ) }</p>
    );
};

```

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Is locked.

## [Actions](#actions)

Returns an action object signalling that the user closed the sidebar.

*Returns*

-   `Object`: Action creator.

### [lockWidgetSaving](#lockwidgetsaving)

Returns an action object used to signal that widget saving is locked.

*Usage*

```
import { store as widgetStore } from '@wordpress/edit-widgets';
import { useDispatch } from '@wordpress/data';

const ExampleComponent = () => {
    const { lockWidgetSaving } = useDispatch( widgetStore );
    return (
        <Button onClick={ () => lockWidgetSaving( 'lockName' ) }>
            { __( 'Lock Widget Saving' ) }
        </Button>
    );
};

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object

### [moveBlockToWidgetArea](#moveblocktowidgetarea)

Action that handles moving a block between widget areas

*Parameters*

-   *clientId* `string`: The clientId of the block to move.
-   *widgetAreaId* `string`: The id of the widget area to move the block to.

### [persistStubPost](#persiststubpost)

Persists a stub post with given ID to core data store. The post is meant to be in-memory only and shouldn’t be saved via the API.

*Parameters*

-   *id* `string`: Post ID.
-   *blocks* `Array`: Blocks the post should consist of.

*Returns*

-   `Object`: The post object.

### [saveEditedWidgetAreas](#saveeditedwidgetareas)

Converts all the blocks from edited widget areas into widgets, and submits a batch request to save everything at once.

Creates a snackbar notice on either success or error.

*Returns*

-   `Function`: An action creator.

### [saveWidgetArea](#savewidgetarea)

Converts all the blocks from a widget area specified by ID into widgets, and submits a batch request to save everything at once.

*Parameters*

-   *widgetAreaId* `string`: ID of the widget area to process.

*Returns*

-   `Function`: An action creator.

### [saveWidgetAreas](#savewidgetareas)

Converts all the blocks from specified widget areas into widgets, and submits a batch request to save everything at once.

*Parameters*

-   *widgetAreas* `Object[]`: Widget areas to save.

*Returns*

-   `Function`: An action creator.

### [setIsInserterOpened](#setisinserteropened)

Returns an action object used to open/close the inserter.

*Parameters*

-   *value* `boolean|Object`: Whether the inserter should be opened (true) or closed (false). To specify an insertion point, use an object.
-   *value.rootClientId* `string`: The root client ID to insert at.
-   *value.insertionIndex* `number`: The index to insert at.

*Returns*

-   `Object`: Action object.

### [setIsListViewOpened](#setislistviewopened)

Returns an action object used to open/close the list view.

*Parameters*

-   *isOpen* `boolean`: A boolean representing whether the list view should be opened or closed.

*Returns*

-   `Object`: Action object.

### [setIsWidgetAreaOpen](#setiswidgetareaopen)

Sets the open state of the widget area.

*Parameters*

-   *clientId* `string`: The clientId of the widget area.
-   *isOpen* `boolean`: Whether the widget area should be opened.

*Returns*

-   `Object`: Action.

### [setWidgetAreasOpenState](#setwidgetareasopenstate)

Sets the open state of all the widget areas.

*Parameters*

-   *widgetAreasOpenState* `Object`: The open states of all the widget areas.

*Returns*

-   `Object`: Action.

### [setWidgetIdForClientId](#setwidgetidforclientid)

Sets the clientId stored for a particular widgetId.

*Parameters*

-   *clientId* `number`: Client id.
-   *widgetId* `number`: Widget id.

*Returns*

-   `Object`: Action.

### [unlockWidgetSaving](#unlockwidgetsaving)

Returns an action object used to signal that widget saving is unlocked.

*Usage*

```
import { store as widgetStore } from '@wordpress/edit-widgets';
import { useDispatch } from '@wordpress/data';

const ExampleComponent = () => {
    const { unlockWidgetSaving } = useDispatch( widgetStore );
    return (
        <Button onClick={ () => unlockWidgetSaving( 'lockName' ) }>
            { __( 'Unlock Widget Saving' ) }
        </Button>
    );
};

```

*Parameters*

-   *lockName* `string`: The lock name.

*Returns*

-   `Object`: Action object