# The Editor’s UI Data – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/edit-post`.

## [Selectors](#selectors)

### [areMetaBoxesInitialized](#aremetaboxesinitialized)

Returns true if meta boxes are initialized.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether meta boxes are initialized.

Returns the current active general sidebar name, or null if there is no general sidebar active. The active general sidebar is a unique name to identify either an editor or plugin sidebar.

Examples:

-   `edit-post/document`
-   `my-plugin/insert-image-sidebar`

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?string`: Active general sidebar name.

### [getActiveMetaBoxLocations](#getactivemetaboxlocations)

Returns an array of active meta box locations.

*Parameters*

-   *state* `Object`: Post editor state.

*Returns*

-   `string[]`: Active meta box locations.

### [getAllMetaBoxes](#getallmetaboxes)

Returns the list of all the available meta boxes.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: List of meta boxes.

### [getEditedPostTemplate](#geteditedposttemplate)

Retrieves the template of the currently edited post.

*Returns*

-   `?Object`: Post Template.

### [getEditorMode](#geteditormode)

Returns the current editing mode.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Editing mode.

### [getHiddenBlockTypes](#gethiddenblocktypes)

Returns an array of blocks that are hidden.

*Returns*

-   `Array`: A list of the hidden block types

### [getMetaBoxesPerLocation](#getmetaboxesperlocation)

Returns the list of all the available meta boxes for a given location.

*Parameters*

-   *state* `Object`: Global application state.
-   *location* `string`: Meta box location to test.

*Returns*

-   `?Array`: List of meta boxes.

### [getPreference](#getpreference)

*Parameters*

-   *state* `Object`: Global application state.
-   *preferenceKey* `string`: Preference Key.
-   *defaultValue* `*`: Default Value.

*Returns*

-   `*`: Preference Value.

### [getPreferences](#getpreferences)

Returns the preferences (these preferences are persisted locally).

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Preferences Object.

### [hasMetaBoxes](#hasmetaboxes)

Returns true if the post is using Meta Boxes

*Parameters*

-   *state* `Object`: Global application state

*Returns*

-   `boolean`: Whether there are metaboxes or not.

### [isEditingTemplate](#iseditingtemplate)

> **Deprecated**

Returns true if the template editing mode is enabled.

### [isEditorPanelEnabled](#iseditorpanelenabled)

> **Deprecated**

Returns true if the given panel is enabled, or false otherwise. Panels are enabled by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is enabled.

### [isEditorPanelOpened](#iseditorpanelopened)

> **Deprecated**

Returns true if the given panel is open, or false otherwise. Panels are closed by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is open.

### [isEditorPanelRemoved](#iseditorpanelremoved)

> **Deprecated**

Returns true if the given panel was programmatically removed, or false otherwise. All panels are not removed by default.

*Parameters*

-   *state* `Object`: Global application state.
-   *panelName* `string`: A string that identifies the panel.

*Returns*

-   `boolean`: Whether or not the panel is removed.

Returns true if the editor sidebar is opened.

*Parameters*

-   *state* `Object`: Global application state

*Returns*

-   `boolean`: Whether the editor sidebar is opened.

### [isFeatureActive](#isfeatureactive)

Returns whether the given feature is enabled or not.

*Parameters*

-   *state* `Object`: Global application state.
-   *feature* `string`: Feature slug.

*Returns*

-   `boolean`: Is active.

### [isInserterOpened](#isinserteropened)

> **Deprecated**

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

### [isMetaBoxLocationActive](#ismetaboxlocationactive)

Returns true if there is an active meta box in the given location, or false otherwise.

*Parameters*

-   *state* `Object`: Post editor state.
-   *location* `string`: Meta box location to test.

*Returns*

-   `boolean`: Whether the meta box location is active.

### [isMetaBoxLocationVisible](#ismetaboxlocationvisible)

Returns true if a metabox location is active and visible

*Parameters*

-   *state* `Object`: Post editor state.
-   *location* `string`: Meta box location to test.

*Returns*

-   `boolean`: Whether the meta box location is active and visible.

### [isModalActive](#ismodalactive)

> **Deprecated** since WP 6.3 use `core/interface` store’s selector with the same name instead.

Returns true if a modal is active, or false otherwise.

*Parameters*

-   *state* `Object`: Global application state.
-   *modalName* `string`: A string that uniquely identifies the modal.

*Returns*

-   `boolean`: Whether the modal is active.

### [isPluginItemPinned](#ispluginitempinned)

Returns true if the plugin item is pinned to the header. When the value is not set it defaults to true.

*Parameters*

-   *state* `Object`: Global application state.
-   *pluginName* `string`: Plugin item name.

*Returns*

-   `boolean`: Whether the plugin item is pinned.

Returns true if the plugin sidebar is opened.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the plugin sidebar is opened.

> **Deprecated**

Returns true if the publish sidebar is opened.

*Parameters*

-   *state* `Object`: Global application state

*Returns*

-   `boolean`: Whether the publish sidebar is open.

### [isSavingMetaBoxes](#issavingmetaboxes)

Returns true if the Meta Boxes are being saved.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the metaboxes are being saved.

## [Actions](#actions)

Returns an action object signalling that the user closed the sidebar.

### [closeModal](#closemodal)

> **Deprecated** since WP 6.3 use `core/interface` store’s action with the same name instead.

Returns an action object signalling that the user closed a modal.

*Returns*

-   `Object`: Action object.

> **Deprecated**

Returns an action object used in signalling that the user closed the publish sidebar.

*Returns*

-   `Object`: Action object.

### [hideBlockTypes](#hideblocktypes)

Update the provided block types to be hidden.

*Parameters*

-   *blockNames* `string[]`: Names of block types to hide.

### [initializeMetaBoxes](#initializemetaboxes)

Initializes WordPress `postboxes` script and the logic for saving meta boxes.

### [metaBoxUpdatesFailure](#metaboxupdatesfailure)

Returns an action object used to signal a failed meta box update.

*Returns*

-   `Object`: Action object.

### [metaBoxUpdatesSuccess](#metaboxupdatessuccess)

Returns an action object used to signal a successful meta box update.

*Returns*

-   `Object`: Action object.

Returns an action object used in signalling that the user opened an editor sidebar.

*Parameters*

-   *name* `?string`: Sidebar name to be opened.

### [openModal](#openmodal)

> **Deprecated** since WP 6.3 use `core/interface` store’s action with the same name instead.

Returns an action object used in signalling that the user opened a modal.

*Parameters*

-   *name* `string`: A string that uniquely identifies the modal.

*Returns*

-   `Object`: Action object.

> **Deprecated**

Returns an action object used in signalling that the user opened the publish sidebar.

*Returns*

-   `Object`: Action object

### [removeEditorPanel](#removeeditorpanel)

> **Deprecated**

Returns an action object used to remove a panel from the editor.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to remove.

*Returns*

-   `Object`: Action object.

### [requestMetaBoxUpdates](#requestmetaboxupdates)

Update a metabox.

### [setAvailableMetaBoxesPerLocation](#setavailablemetaboxesperlocation)

Stores info about which Meta boxes are available in which location.

*Parameters*

-   *metaBoxesPerLocation* `Object`: Meta boxes per location.

### [setIsEditingTemplate](#setiseditingtemplate)

> **Deprecated**

Returns an action object used to switch to template editing.

### [setIsInserterOpened](#setisinserteropened)

> **Deprecated**

Returns an action object used to open/close the inserter.

*Parameters*

-   *value* `boolean|Object`: Whether the inserter should be opened (true) or closed (false).

### [setIsListViewOpened](#setislistviewopened)

> **Deprecated**

Returns an action object used to open/close the list view.

*Parameters*

-   *isOpen* `boolean`: A boolean representing whether the list view should be opened or closed.

### [showBlockTypes](#showblocktypes)

Update the provided block types to be visible.

*Parameters*

-   *blockNames* `string[]`: Names of block types to show.

### [switchEditorMode](#switcheditormode)

> **Deprecated**

Triggers an action used to switch editor mode.

*Parameters*

-   *mode* `string`: The editor mode.

### [toggleDistractionFree](#toggledistractionfree)

> **Deprecated**

Action that toggles Distraction free mode. Distraction free mode expects there are no sidebars, as due to the z-index values set, you can’t close sidebars.

### [toggleEditorPanelEnabled](#toggleeditorpanelenabled)

> **Deprecated**

Returns an action object used to enable or disable a panel in the editor.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to enable or disable.

*Returns*

-   `Object`: Action object.

### [toggleEditorPanelOpened](#toggleeditorpanelopened)

> **Deprecated**

Opens a closed panel and closes an open panel.

*Parameters*

-   *panelName* `string`: A string that identifies the panel to open or close.

### [toggleFeature](#togglefeature)

Triggers an action used to toggle a feature flag.

*Parameters*

-   *feature* `string`: Feature name.

### [toggleFullscreenMode](#togglefullscreenmode)

Action that toggles the Fullscreen Mode view option.

### [togglePinnedPluginItem](#togglepinnedpluginitem)

Triggers an action object used to toggle a plugin name flag.

*Parameters*

-   *pluginName* `string`: Plugin name.

> **Deprecated**

Returns an action object used in signalling that the user toggles the publish sidebar.

*Returns*

-   `Object`: Action object

### [updatePreferredStyleVariations](#updatepreferredstylevariations)

> **Deprecated**

Returns an action object used in signaling that a style should be auto-applied when a block is created.