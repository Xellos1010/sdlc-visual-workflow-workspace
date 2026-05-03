# Edit Site – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/edit-site`.

## [Selectors](#selectors)

### [getCanUserCreateMedia](#getcanusercreatemedia)

Returns whether the current user can create media or not.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Whether the current user can create media or not.

> **Deprecated**

### [getCurrentTemplateTemplateParts](#getcurrenttemplatetemplateparts)

> **Deprecated**

Returns the template parts and their blocks for the current edited template.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: Template parts and their blocks in an array.

### [getEditedPostContext](#geteditedpostcontext)

> **Deprecated**

Returns the edited post’s context object.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Page.

### [getEditedPostId](#geteditedpostid)

> **Deprecated**

Returns the ID of the currently edited template or template part.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?string`: Post ID.

### [getEditedPostType](#geteditedposttype)

> **Deprecated**

Returns the current edited post type (wp\_template or wp\_template\_part).

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `?TemplateType`: Template type.

### [getEditorMode](#geteditormode)

Returns the current editing mode.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `string`: Editing mode.

### [getHomeTemplateId](#gethometemplateid)

> **Deprecated**

> **Deprecated**

### [getPage](#getpage)

> **Deprecated**

Returns the current page object.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Page.

### [getReusableBlocks](#getreusableblocks)

Returns any available Reusable blocks.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Array`: The available reusable blocks.

### [getSettings](#getsettings)

Returns the site editor settings.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `Object`: Settings.

### [hasPageContentFocus](#haspagecontentfocus)

> **Deprecated**

Whether or not the editor allows only page content to be edited.

*Returns*

-   `boolean`: Whether or not focus is on editing page content.

### [isFeatureActive](#isfeatureactive)

> **Deprecated**

Returns whether the given feature is enabled or not.

*Parameters*

-   *state* `Object`: Global application state.
-   *featureName* `string`: Feature slug.

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

### [isNavigationOpened](#isnavigationopened)

> **Deprecated**

### [isPage](#ispage)

> **Deprecated**

Whether or not the editor has a page loaded into it.

*Related*

-   setPage

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether or not the editor has a page loaded into it.

### [isSaveViewOpened](#issaveviewopened)

Returns the current opened/closed state of the save panel.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: True if the save panel should be open; false if closed.

## [Actions](#actions)

### [addTemplate](#addtemplate)

> **Deprecated**

Action that adds a new template and sets it as the current template.

*Parameters*

-   *template* `Object`: The template.

*Returns*

-   `Object`: Action object used to set the current template.

Action that closes the sidebar.

Action that opens an editor sidebar.

*Parameters*

-   *name* `?string`: Sidebar name to be opened.

> **Deprecated**

Opens the navigation panel and sets its active menu at the same time.

### [removeTemplate](#removetemplate)

Action that removes a template.

*Parameters*

-   *template* `Object`: The template object.

### [revertTemplate](#reverttemplate)

Reverts a template to its original theme-provided file.

*Parameters*

-   *template* `Object`: The template to revert.
-   *options* `[Object]`:
-   *options.allowUndo* `[boolean]`: Whether to allow the user to undo reverting the template. Default true.

### [setEditedEntity](#seteditedentity)

> **Deprecated**

Action that sets an edited entity.

*Parameters*

-   *postType* `string`: The entity’s post type.
-   *postId* `string`: The entity’s ID.
-   *context* `Object`: The entity’s context.

*Returns*

-   `Object`: Action object.

### [setEditedPostContext](#seteditedpostcontext)

> **Deprecated**

Set’s the current block editor context.

*Parameters*

-   *context* `Object`: The context object.

*Returns*

-   `Object`: Action object.

### [setHasPageContentFocus](#sethaspagecontentfocus)

Sets whether or not the editor allows only page content to be edited.

*Parameters*

-   *hasPageContentFocus* `boolean`: True to allow only page content to be edited, false to allow template to be edited.

### [setHomeTemplateId](#sethometemplateid)

> **Deprecated**

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

### [setIsNavigationPanelOpened](#setisnavigationpanelopened)

> **Deprecated**

Sets whether the navigation panel should be open.

### [setIsSaveViewOpened](#setissaveviewopened)

Sets whether the save view panel should be open.

*Parameters*

-   *isOpen* `boolean`: If true, opens the save view. If false, closes it. It does not toggle the state, but sets it directly.

> **Deprecated**

Action that sets a navigation menu.

*Parameters*

-   *navigationMenuId* `string`: The Navigation Menu Post ID.

*Returns*

-   `Object`: Action object.

> **Deprecated**

Action that sets the active navigation panel menu.

*Returns*

-   `Object`: Action object.

### [setPage](#setpage)

> **Deprecated**

Resolves the template for a page and displays both. If no path is given, attempts to use the postId to generate a path like `?p=${ postId }`.

*Returns*

-   `Object`: Action object.

### [setTemplate](#settemplate)

Action that sets a template, optionally fetching it from REST API.

*Returns*

-   `Object`: Action object.

### [setTemplatePart](#settemplatepart)

> **Deprecated**

Action that sets a template part.

*Parameters*

-   *templatePartId* `string`: The template part ID.

*Returns*

-   `Object`: Action object.

### [switchEditorMode](#switcheditormode)

> **Deprecated**

Triggers an action used to switch editor mode.

*Parameters*

-   *mode* `string`: The editor mode.

### [toggleDistractionFree](#toggledistractionfree)

> **Deprecated**

Action that toggles Distraction free mode. Distraction free mode expects there are no sidebars, as due to the z-index values set, you can’t close sidebars.

### [toggleFeature](#togglefeature)

Dispatches an action that toggles a feature flag.

*Parameters*

-   *featureName* `string`: Feature name.

### [updateSettings](#updatesettings)

Returns an action object used to update the settings.

*Parameters*

-   *settings* `Object`: New settings.

*Returns*

-   `Object`: Action object.