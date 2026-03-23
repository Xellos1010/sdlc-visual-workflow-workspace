# Master chrome-ext-api Documentation

Generated on: 2025-11-06T19:23:40.307Z

This file contains all documentation from 70 markdown files found in the `chrome-ext-api` folder and its subfolders.

---

## 1. CHROME_EXTENSIONS_API_REFERENCE

*File: CHROME_EXTENSIONS_API_REFERENCE.md*

# Chrome Extensions API Reference

This document contains the complete Chrome Extensions API reference for Manifest V3.

## Table of Contents

- [action](#action)
- [alarms](#alarms)

---

# action {#action}

<br />

<br />

## Description

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.
The action icons are displayed in the browser toolbar next to the [omnibox](https://en.wiktionary.org/wiki/omnibox). After installation, these appear in the extensions menu (the puzzle piece icon). Users can pin your extension icon to the toolbar.

<br />

<br />

<br />

## Availability

Chrome 88+ MV3+

<br />

<br />

## Manifest

The following keys must be declared [in the manifest](https://developer.chrome.com/docs/extensions/mv3/manifest) to use this API.
`"action"`  

<br />

To use the `chrome.action` API, specify a `"manifest_version"` of `3` and include
the `"action"` key in your [manifest file](https://developer.chrome.com/docs/extensions/reference/manifest).
**Note:** Every extension has an icon in the Chrome toolbar, even if the `"action"` key isn't added to the manifest.  

    {
      "name": "Action Extension",
      ...
      "action": {
        "default_icon": {              // optional
          "16": "images/icon16.png",   // optional
          "24": "images/icon24.png",   // optional
          "32": "images/icon32.png"    // optional
        },
        "default_title": "Click Me",   // optional, shown in tooltip
        "default_popup": "popup.html"  // optional
      },
      ...
    }

The `"action"` key (along with its children) is optional. When it isn't included, your extension is still shown in the toolbar to provide access to the extension's menu. For this reason, we recommend that you always include at least the `"action"` and `"default_icon"` keys.

## Concepts and usage

### Parts of the UI

#### Icon

The icon is the main image on the toolbar for your extension, and is set by the `"default_icon"` key in
your manifest's `"action"` key. Icons must be 16 device-independent pixels (DIPs) wide and tall.

The `"default_icon"` key is a dictionary of sizes to image paths. Chrome uses these icons
to choose which image scale to use. If an exact match is not found, Chrome selects the closest
available and scales it to fit the image, which might affect image quality.

Because devices with less-common scale factors like 1.5x or 1.2x are becoming more
common, we encourage you to provide multiple sizes for your icons. This also
futureproofs your extension against potential icon display size changes. However,
if only providing a single size, the `"default_icon"` key can also be set to a
string with the path to a single icon instead of a dictionary.

You can also call `action.setIcon()` to set your extension's icon programmatically
by specifying a different image path or providing a dynamically-generated icon using the [HTML canvas
element](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement), or, if setting from an extension service worker, the [offscreen
canvas](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas) API.  

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = '#00FF00';  // Green
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });

| **Note:** The `action.setIcon()` API is intended to set a static image. Don't use animated images for your icons.

For packed extensions (installed from a .crx file), images can be in most formats that the Blink
rendering engine can display, including PNG, JPEG, BMP, ICO, and others. SVG isn't supported.
Unpacked extensions must use PNG images.

#### Tooltip (title)

The tooltip, or title, appears when the user holds their mouse pointer over the extension's icon in the
toolbar. It's also included in the accessible text spoken by screen readers when the button gets
focus.

The default tooltip is set using the `"default_title"` field of the `"action"` key in `manifest.json`.
You can also set it programmatically by calling `action.setTitle()`.

#### Badge

Actions can optionally display a "badge" --- a bit of text layered over the icon. This lets you
update the action to display a small amount of information about the state of the extension,
such as a counter. The badge has a text component and a background color. Because space is limited,
we recommend that badge text use four or fewer characters.

To create a badge, set it programmatically by calling `action.setBadgeBackgroundColor()` and
`action.setBadgeText()`. There isn't a default badge setting in the manifest. Badge color values
can be either an array of four integers between 0 and 255 that make up the RGBA color of the
badge or a string with a [CSS color](https://developer.mozilla.org/docs/Web/CSS/color) value.  

    chrome.action.setBadgeBackgroundColor(
      {color: [0, 255, 0, 0]},  // Green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: '#00FF00'},  // Also green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: 'green'},  // Also, also green
      () => { /* ... */ },
    );

#### Popup

An action's popup is shown when the user clicks on the extension's action button in the
toolbar. The popup can contain any HTML contents you like, and will be automatically sized to fit
its contents. The popup's size must be between 25x25 and 800x600 pixels.

The popup is initially set by the `"default_popup"` property in the `"action"` key in the
`manifest.json` file. If present, this property should point to a relative path within the extension
directory. It can also be updated dynamically to point to a different relative path using the
`action.setPopup()` method.
| **Note:** The `action.onClicked` event won't be sent if the extension action has specified a popup to show on click of the current tab.

## Use cases

### Per-tab state

Extension actions can have different states for each tab. To set a value for an individual
tab, use the `tabId` property in the `action` API's setting methods. For example, to
set the badge text for a specific tab, do something like the following:  

    function getTabId() { /* ... */}
    function getTabBadge() { /* ... */}

    chrome.action.setBadgeText(
      {
        text: getTabBadge(tabId),
        tabId: getTabId(),
      },
      () => { ... }
    );

If the `tabId` property is left out, the setting is treated as a global setting. Tab-specific
settings take priority over global settings.

### Enabled state

By default, toolbar actions are enabled (clickable) on every tab. You can change this default
by setting the `default_state` property in the `action` key of the manifest. If
`default_state` is set to `"disabled"`, the action is disabled by default and must be enabled
programmatically to be clickable. If `default_state` is set to `"enabled"` (the default),
the action is enabled and clickable by default.

You can control the state programmatically using the `action.enable()` and `action.disable()`
methods. This only affects whether the popup (if any) or `action.onClicked` event is sent
to your extension; it doesn't affect the action's presence in the toolbar.

## Examples

The following examples show some common ways that actions are used in extensions. To try this API,
install the [Action API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Show a popup

It's common for an extension to display a popup when the user clicks the extension's action. To
implement this in your own extension, declare the popup in your `manifest.json` and specify the
content that Chrome should display in the popup.  

    // manifest.json
    {
      "name": "Action popup demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to view a popup",
        "default_popup": "popup.html"
      }
    }

    <!-- popup.html -->
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html {
          min-height: 5em;
          min-width: 10em;
          background: salmon;
        }
      </style>
    </head>
    <body>
      <p>Hello, world!</p>
    </body>
    </html>

### Inject a content script on click

A common pattern for extensions is to expose their primary feature using the extension's
action. The following example demonstrates this pattern. When the user clicks the action, the extension
injects a content script into the current page. The content script then displays an alert to verify
that everything worked as expected.  

    // manifest.json
    {
      "name": "Action script injection demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to show an alert"
      },
      "permissions": ["activeTab", "scripting"],
      "background": {
        "service_worker": "background.js"
      }
    }

    // background.js
    chrome.action.onClicked.addListener((tab) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
    });

    // content.js
    alert('Hello, world!');

### Emulate actions with declarativeContent

This example shows how an extension's background logic can (a) disable an action by default and (b)
use [declarativeContent](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent) to enable the action on specific sites.  

    // service-worker.js

    // Wrap in an onInstalled callback to avoid unnecessary work
    // every time the service worker is run
    chrome.runtime.onInstalled.addListener(() => {
      // Page actions are disabled by default and enabled on select tabs
      chrome.action.disable();

      // Clear all rules to ensure only our expected rules are set
      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let exampleRule = {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostSuffix: '.example.com'},
            })
          ],
          actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        let rules = [exampleRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
      });
    });

<br />

## Types

### OpenPopupOptions

Chrome 99+  

#### Properties

  - windowId  
  number optional

The ID of the window to open the action popup in. Defaults to the currently-active window if unspecified.  

### TabDetails

#### Properties

  - tabId  
  number optional

The ID of the tab to query state for. If no tab is specified, the non-tab-specific state is returned.  

### UserSettings

Chrome 91+

The collection of user-specified settings relating to an extension's action.  

#### Properties

  - isOnToolbar  
  boolean

Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).  

### UserSettingsChange

Chrome 130+  

#### Properties

  - isOnToolbar  
  boolean optional

  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

## Methods

### disable()

```typescript
chrome.action.disable(
  tabId?: number,
): Promise<void>
```

Disables the action for a tab.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### enable()

```typescript
chrome.action.enable(
  tabId?: number,
): Promise<void>
```

Enables the action for a tab. By default, actions are enabled.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### getBadgeBackgroundColor()

```typescript
chrome.action.getBadgeBackgroundColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the background color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getBadgeText()

```typescript
chrome.action.getBadgeText(
  details: TabDetails,
): Promise<string>
```

Gets the badge text of the action. If no tab is specified, the non-tab-specific badge text is returned. If [displayActionCountAsBadgeText](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#setExtensionActionOptions) is enabled, a placeholder text will be returned unless the [declarativeNetRequestFeedback](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#declarativeNetRequestFeedback) permission is present or tab-specific badge text was provided.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getBadgeTextColor()

Chrome 110+

```typescript
chrome.action.getBadgeTextColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the text color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getPopup()

```typescript
chrome.action.getPopup(
  details: TabDetails,
): Promise<string>
```

Gets the html document set as the popup for this action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getTitle()

```typescript
chrome.action.getTitle(
  details: TabDetails,
): Promise<string>
```

Gets the title of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getUserSettings()

Chrome 91+

```typescript
chrome.action.getUserSettings(): Promise<https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings>
```

Returns the user-specified settings relating to an extension's action.  

#### Returns

- Promise\<[UserSettings](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings)\>  

### isEnabled()

Chrome 110+

```typescript
chrome.action.isEnabled(
  tabId?: number,
): Promise<boolean>
```

Indicates whether the extension action is enabled for a tab (or globally if no `tabId` is provided). Actions enabled using only [`declarativeContent`](https://developer.chrome.com/docs/extensions/reference/declarativeContent/) always return false.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want check enabled status.  

#### Returns

- Promise\<boolean\>  

### openPopup()

Chrome 127+

```typescript
chrome.action.openPopup(
  options?: OpenPopupOptions,
): Promise<void>
```

Opens the extension's popup. Between Chrome 118 and Chrome 126, this is only available to policy installed extensions.  

#### Parameters

  - options  
  [OpenPopupOptions](https://developer.chrome.com/docs/extensions/reference/api/action#type-OpenPopupOptions) optional

Specifies options for opening the popup.  

#### Returns

- Promise\<void\>  

### setBadgeBackgroundColor()

```typescript
chrome.action.setBadgeBackgroundColor(
  details: object,
): Promise<void>
```

Sets the background color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setBadgeText()

```typescript
chrome.action.setBadgeText(
  details: object,
): Promise<void>
```

Sets the badge text for the action. The badge is displayed on top of the icon.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - text  
    string optional

Any number of characters can be passed, but only about four can fit in the space. If an empty string (`''`) is passed, the badge text is cleared. If `tabId` is specified and `text` is null, the text for the specified tab is cleared and defaults to the global badge text.  

#### Returns

- Promise\<void\>  

### setBadgeTextColor()

Chrome 110+

```typescript
chrome.action.setBadgeTextColor(
  details: object,
): Promise<void>
```

Sets the text color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`. Not setting this value will cause a color to be automatically chosen that will contrast with the badge's background color so the text will be visible. Colors with alpha values equivalent to 0 will not be set and will return an error.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setIcon()

```typescript
chrome.action.setIcon(
  details: object,
): Promise<void>
```

Sets the icon for the action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the **path** or the **imageData** property must be specified.  

#### Parameters

  - details  
  object  
    - imageData  
    ImageData \| object optional

    Either an ImageData object or a dictionary {size -\> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
    - path  
    string \| object optional

    Either a relative image path or a dictionary {size -\> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### setPopup()

```typescript
chrome.action.setPopup(
  details: object,
): Promise<void>
```

Sets the HTML document to be opened as a popup when the user clicks on the action's icon.  

#### Parameters

  - details  
  object  
    - popup  
    string

    The relative path to the HTML file to show in a popup. If set to the empty string (`''`), no popup is shown.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setTitle()

```typescript
chrome.action.setTitle(
  details: object,
): Promise<void>
```

Sets the title of the action. This shows up in the tooltip.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - title  
    string

The string the action should display when moused over.  

#### Returns

- Promise\<void\>

## Events

### onClicked

```typescript
chrome.action.onClicked.addListener(
  callback: function,
)
```

Fired when an action icon is clicked. This event will not fire if the action has a popup.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (tab: tabs.Tab) => void
  ```

  <br />

    - tab  
[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  

### onUserSettingsChanged

Chrome 130+

```typescript
chrome.action.onUserSettingsChanged.addListener(
  callback: function,
)
```

Fired when user-specified settings relating to an extension's action change.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (change: UserSettingsChange) => void
  ```

  <br />

    - change  
    [UserSettingsChange](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettingsChange)

<br />

---

# alarms {#alarms}

<br />

<br />

## Description

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.
The action icons are displayed in the browser toolbar next to the [omnibox](https://en.wiktionary.org/wiki/omnibox). After installation, these appear in the extensions menu (the puzzle piece icon). Users can pin your extension icon to the toolbar.

<br />

<br />

<br />

## Availability

Chrome 88+ MV3+

<br />

<br />

## Manifest

The following keys must be declared [in the manifest](https://developer.chrome.com/docs/extensions/mv3/manifest) to use this API.
`"action"`  

<br />

To use the `chrome.action` API, specify a `"manifest_version"` of `3` and include
the `"action"` key in your [manifest file](https://developer.chrome.com/docs/extensions/reference/manifest).
**Note:** Every extension has an icon in the Chrome toolbar, even if the `"action"` key isn't added to the manifest.  

    {
      "name": "Action Extension",
      ...
      "action": {
        "default_icon": {              // optional
          "16": "images/icon16.png",   // optional
          "24": "images/icon24.png",   // optional
          "32": "images/icon32.png"    // optional
        },
        "default_title": "Click Me",   // optional, shown in tooltip
        "default_popup": "popup.html"  // optional
      },
      ...
    }

The `"action"` key (along with its children) is optional. When it isn't included, your extension is still shown in the toolbar to provide access to the extension's menu. For this reason, we recommend that you always include at least the `"action"` and `"default_icon"` keys.

## Concepts and usage

### Parts of the UI

#### Icon

The icon is the main image on the toolbar for your extension, and is set by the `"default_icon"` key in
your manifest's `"action"` key. Icons must be 16 device-independent pixels (DIPs) wide and tall.

The `"default_icon"` key is a dictionary of sizes to image paths. Chrome uses these icons
to choose which image scale to use. If an exact match is not found, Chrome selects the closest
available and scales it to fit the image, which might affect image quality.

Because devices with less-common scale factors like 1.5x or 1.2x are becoming more
common, we encourage you to provide multiple sizes for your icons. This also
futureproofs your extension against potential icon display size changes. However,
if only providing a single size, the `"default_icon"` key can also be set to a
string with the path to a single icon instead of a dictionary.

You can also call `action.setIcon()` to set your extension's icon programmatically
by specifying a different image path or providing a dynamically-generated icon using the [HTML canvas
element](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement), or, if setting from an extension service worker, the [offscreen
canvas](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas) API.  

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = '#00FF00';  // Green
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });

| **Note:** The `action.setIcon()` API is intended to set a static image. Don't use animated images for your icons.

For packed extensions (installed from a .crx file), images can be in most formats that the Blink
rendering engine can display, including PNG, JPEG, BMP, ICO, and others. SVG isn't supported.
Unpacked extensions must use PNG images.

#### Tooltip (title)

The tooltip, or title, appears when the user holds their mouse pointer over the extension's icon in the
toolbar. It's also included in the accessible text spoken by screen readers when the button gets
focus.

The default tooltip is set using the `"default_title"` field of the `"action"` key in `manifest.json`.
You can also set it programmatically by calling `action.setTitle()`.

#### Badge

Actions can optionally display a "badge" --- a bit of text layered over the icon. This lets you
update the action to display a small amount of information about the state of the extension,
such as a counter. The badge has a text component and a background color. Because space is limited,
we recommend that badge text use four or fewer characters.

To create a badge, set it programmatically by calling `action.setBadgeBackgroundColor()` and
`action.setBadgeText()`. There isn't a default badge setting in the manifest. Badge color values
can be either an array of four integers between 0 and 255 that make up the RGBA color of the
badge or a string with a [CSS color](https://developer.mozilla.org/docs/Web/CSS/color) value.  

    chrome.action.setBadgeBackgroundColor(
      {color: [0, 255, 0, 0]},  // Green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: '#00FF00'},  // Also green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: 'green'},  // Also, also green
      () => { /* ... */ },
    );

#### Popup

An action's popup is shown when the user clicks on the extension's action button in the
toolbar. The popup can contain any HTML contents you like, and will be automatically sized to fit
its contents. The popup's size must be between 25x25 and 800x600 pixels.

The popup is initially set by the `"default_popup"` property in the `"action"` key in the
`manifest.json` file. If present, this property should point to a relative path within the extension
directory. It can also be updated dynamically to point to a different relative path using the
`action.setPopup()` method.
| **Note:** The `action.onClicked` event won't be sent if the extension action has specified a popup to show on click of the current tab.

## Use cases

### Per-tab state

Extension actions can have different states for each tab. To set a value for an individual
tab, use the `tabId` property in the `action` API's setting methods. For example, to
set the badge text for a specific tab, do something like the following:  

    function getTabId() { /* ... */}
    function getTabBadge() { /* ... */}

    chrome.action.setBadgeText(
      {
        text: getTabBadge(tabId),
        tabId: getTabId(),
      },
      () => { ... }
    );

If the `tabId` property is left out, the setting is treated as a global setting. Tab-specific
settings take priority over global settings.

### Enabled state

By default, toolbar actions are enabled (clickable) on every tab. You can change this default
by setting the `default_state` property in the `action` key of the manifest. If
`default_state` is set to `"disabled"`, the action is disabled by default and must be enabled
programmatically to be clickable. If `default_state` is set to `"enabled"` (the default),
the action is enabled and clickable by default.

You can control the state programmatically using the `action.enable()` and `action.disable()`
methods. This only affects whether the popup (if any) or `action.onClicked` event is sent
to your extension; it doesn't affect the action's presence in the toolbar.

## Examples

The following examples show some common ways that actions are used in extensions. To try this API,
install the [Action API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Show a popup

It's common for an extension to display a popup when the user clicks the extension's action. To
implement this in your own extension, declare the popup in your `manifest.json` and specify the
content that Chrome should display in the popup.  

    // manifest.json
    {
      "name": "Action popup demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to view a popup",
        "default_popup": "popup.html"
      }
    }

    <!-- popup.html -->
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html {
          min-height: 5em;
          min-width: 10em;
          background: salmon;
        }
      </style>
    </head>
    <body>
      <p>Hello, world!</p>
    </body>
    </html>

### Inject a content script on click

A common pattern for extensions is to expose their primary feature using the extension's
action. The following example demonstrates this pattern. When the user clicks the action, the extension
injects a content script into the current page. The content script then displays an alert to verify
that everything worked as expected.  

    // manifest.json
    {
      "name": "Action script injection demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to show an alert"
      },
      "permissions": ["activeTab", "scripting"],
      "background": {
        "service_worker": "background.js"
      }
    }

    // background.js
    chrome.action.onClicked.addListener((tab) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
    });

    // content.js
    alert('Hello, world!');

### Emulate actions with declarativeContent

This example shows how an extension's background logic can (a) disable an action by default and (b)
use [declarativeContent](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent) to enable the action on specific sites.  

    // service-worker.js

    // Wrap in an onInstalled callback to avoid unnecessary work
    // every time the service worker is run
    chrome.runtime.onInstalled.addListener(() => {
      // Page actions are disabled by default and enabled on select tabs
      chrome.action.disable();

      // Clear all rules to ensure only our expected rules are set
      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let exampleRule = {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostSuffix: '.example.com'},
            })
          ],
          actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        let rules = [exampleRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
      });
    });

<br />

## Types

### OpenPopupOptions

Chrome 99+  

#### Properties

  - windowId  
  number optional

The ID of the window to open the action popup in. Defaults to the currently-active window if unspecified.  

### TabDetails

#### Properties

  - tabId  
  number optional

The ID of the tab to query state for. If no tab is specified, the non-tab-specific state is returned.  

### UserSettings

Chrome 91+

The collection of user-specified settings relating to an extension's action.  

#### Properties

  - isOnToolbar  
  boolean

Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).  

### UserSettingsChange

Chrome 130+  

#### Properties

  - isOnToolbar  
  boolean optional

  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

## Methods

### disable()

```typescript
chrome.action.disable(
  tabId?: number,
): Promise<void>
```

Disables the action for a tab.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### enable()

```typescript
chrome.action.enable(
  tabId?: number,
): Promise<void>
```

Enables the action for a tab. By default, actions are enabled.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### getBadgeBackgroundColor()

```typescript
chrome.action.getBadgeBackgroundColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the background color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getBadgeText()

```typescript
chrome.action.getBadgeText(
  details: TabDetails,
): Promise<string>
```

Gets the badge text of the action. If no tab is specified, the non-tab-specific badge text is returned. If [displayActionCountAsBadgeText](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#setExtensionActionOptions) is enabled, a placeholder text will be returned unless the [declarativeNetRequestFeedback](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#declarativeNetRequestFeedback) permission is present or tab-specific badge text was provided.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getBadgeTextColor()

Chrome 110+

```typescript
chrome.action.getBadgeTextColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the text color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getPopup()

```typescript
chrome.action.getPopup(
  details: TabDetails,
): Promise<string>
```

Gets the html document set as the popup for this action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getTitle()

```typescript
chrome.action.getTitle(
  details: TabDetails,
): Promise<string>
```

Gets the title of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getUserSettings()

Chrome 91+

```typescript
chrome.action.getUserSettings(): Promise<https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings>
```

Returns the user-specified settings relating to an extension's action.  

#### Returns

- Promise\<[UserSettings](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings)\>  

### isEnabled()

Chrome 110+

```typescript
chrome.action.isEnabled(
  tabId?: number,
): Promise<boolean>
```

Indicates whether the extension action is enabled for a tab (or globally if no `tabId` is provided). Actions enabled using only [`declarativeContent`](https://developer.chrome.com/docs/extensions/reference/declarativeContent/) always return false.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want check enabled status.  

#### Returns

- Promise\<boolean\>  

### openPopup()

Chrome 127+

```typescript
chrome.action.openPopup(
  options?: OpenPopupOptions,
): Promise<void>
```

Opens the extension's popup. Between Chrome 118 and Chrome 126, this is only available to policy installed extensions.  

#### Parameters

  - options  
  [OpenPopupOptions](https://developer.chrome.com/docs/extensions/reference/api/action#type-OpenPopupOptions) optional

Specifies options for opening the popup.  

#### Returns

- Promise\<void\>  

### setBadgeBackgroundColor()

```typescript
chrome.action.setBadgeBackgroundColor(
  details: object,
): Promise<void>
```

Sets the background color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setBadgeText()

```typescript
chrome.action.setBadgeText(
  details: object,
): Promise<void>
```

Sets the badge text for the action. The badge is displayed on top of the icon.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - text  
    string optional

Any number of characters can be passed, but only about four can fit in the space. If an empty string (`''`) is passed, the badge text is cleared. If `tabId` is specified and `text` is null, the text for the specified tab is cleared and defaults to the global badge text.  

#### Returns

- Promise\<void\>  

### setBadgeTextColor()

Chrome 110+

```typescript
chrome.action.setBadgeTextColor(
  details: object,
): Promise<void>
```

Sets the text color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`. Not setting this value will cause a color to be automatically chosen that will contrast with the badge's background color so the text will be visible. Colors with alpha values equivalent to 0 will not be set and will return an error.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setIcon()

```typescript
chrome.action.setIcon(
  details: object,
): Promise<void>
```

Sets the icon for the action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the **path** or the **imageData** property must be specified.  

#### Parameters

  - details  
  object  
    - imageData  
    ImageData \| object optional

    Either an ImageData object or a dictionary {size -\> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
    - path  
    string \| object optional

    Either a relative image path or a dictionary {size -\> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### setPopup()

```typescript
chrome.action.setPopup(
  details: object,
): Promise<void>
```

Sets the HTML document to be opened as a popup when the user clicks on the action's icon.  

#### Parameters

  - details  
  object  
    - popup  
    string

    The relative path to the HTML file to show in a popup. If set to the empty string (`''`), no popup is shown.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setTitle()

```typescript
chrome.action.setTitle(
  details: object,
): Promise<void>
```

Sets the title of the action. This shows up in the tooltip.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - title  
    string

The string the action should display when moused over.  

#### Returns

- Promise\<void\>

## Events

### onClicked

```typescript
chrome.action.onClicked.addListener(
  callback: function,
)
```

Fired when an action icon is clicked. This event will not fire if the action has a popup.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (tab: tabs.Tab) => void
  ```

  <br />

    - tab  
[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  

### onUserSettingsChanged

Chrome 130+

```typescript
chrome.action.onUserSettingsChanged.addListener(
  callback: function,
)
```

Fired when user-specified settings relating to an extension's action change.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (change: UserSettingsChange) => void
  ```

  <br />

    - change  
    [UserSettingsChange](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettingsChange)

<br />


---

## 2. accessibilityFeatures

*File: pages/accessibilityFeatures.md*

# chrome.alarms

<br />

| **Chrome 120:** Starting in Chrome 120, the minimum alarm interval has been reduced from 1 minute to 30 seconds. For an alarm to trigger in 30 seconds, set `periodInMinutes: 0.5`.   
| **Chrome 117:** Starting in Chrome 117, the number of active alarms is limited to 500. Once this limit is reached, `chrome.alarms.create()` will fail. When using a callback, [`chrome.runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/api/runtime#property-lastError) will be set. When using promises, the promise will be rejected.

<br />

## Description

Use the `chrome.alarms` API to schedule code to run periodically or at a specified time in the future.

<br />

<br />

## Permissions

`alarms`  

<br />

<br />

<br />

To use the `chrome.alarms` API, declare the `"alarms"` permission in the [manifest](https://developer.chrome.com/docs/extensions/reference/manifest):  

    {
      "name": "My extension",
      ...
      "permissions": [
        "alarms"
      ],
      ...
    }

## Concepts and usage

To ensure reliable behavior, it is helpful to understand how the API behaves.

### Device sleep

Alarms continue to run while a device is sleeping. However, an alarm will not
wake up a device. When the device wakes up, any missed alarms will fire.
Repeating alarms will fire at most once and then be rescheduled using the
specified period starting from when the device wakes, not taking into account
any time that has already elapsed since the alarm was originally set to run.

### Persistence

Alarms generally persist until an extension is updated. However, this is not guaranteed, and alarms
may be cleared when the browser is restarted. Consequently, consider setting a value in storage
when an alarm is created, and then ensure it exists each time your service worker starts up. For example:  

    const STORAGE_KEY = "user-preference-alarm-enabled";

    async function checkAlarmState() {
      const { alarmEnabled } = await chrome.storage.get(STORAGE_KEY);

      if (alarmEnabled) {
        const alarm = await chrome.alarms.get("my-alarm");

        if (!alarm) {
          await chrome.alarms.create({ periodInMinutes: 1 });
        }
      }
    }

    checkAlarmState();

## Examples

The following examples show how to use and respond to an alarm. To try this API,
install the [Alarm API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/alarms) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Set an alarm

The following example sets an alarm in the service worker when the extension is installed:

service-worker.js:  

    chrome.runtime.onInstalled.addListener(async ({ reason }) => {
      if (reason !== 'install') {
        return;
      }

      // Create an alarm so we have something to look at in the demo
      await chrome.alarms.create('demo-default-alarm', {
        delayInMinutes: 1,
        periodInMinutes: 1
      });
    });

### Respond to an alarm

The following example sets the [action toolbar icon](https://developer.chrome.com/docs/extensions/reference/api/action#icon) based on the name of the alarm that went off.

service-worker.js:  

    chrome.alarms.onAlarm.addListener((alarm) => {
      chrome.action.setIcon({
        path: getIconPath(alarm.name),
      });
    });

<br />

## Types

### Alarm

#### Properties

  - name  
  string

  Name of this alarm.
  - periodInMinutes  
  number optional

  If not null, the alarm is a repeating alarm and will fire again in `periodInMinutes` minutes.
  - scheduledTime  
  number

Time at which this alarm was scheduled to fire, in milliseconds past the epoch (e.g. `Date.now() + n`). For performance reasons, the alarm may have been delayed an arbitrary amount beyond this.  

### AlarmCreateInfo

#### Properties

  - delayInMinutes  
  number optional

  Length of time in minutes after which the `onAlarm` event should fire.
  - periodInMinutes  
  number optional

  If set, the onAlarm event should fire every `periodInMinutes` minutes after the initial event specified by `when` or `delayInMinutes`. If not set, the alarm will only fire once.
  - when  
  number optional

  Time at which the alarm should fire, in milliseconds past the epoch (e.g. `Date.now() + n`).

## Methods

### clear()

```typescript
chrome.alarms.clear(
  name?: string,
): Promise<boolean>
```

Clears the alarm with the given name.  

#### Parameters

  - name  
  string optional

The name of the alarm to clear. Defaults to the empty string.  

#### Returns

  - Promise\<boolean\>  
Chrome 91+  

### clearAll()

```typescript
chrome.alarms.clearAll(): Promise<boolean>
```

Clears all alarms.  

#### Returns

  - Promise\<boolean\>  
Chrome 91+  

### create()

```typescript
chrome.alarms.create(
  name?: string,
  alarmInfo: AlarmCreateInfo,
): Promise<void>
```

Creates an alarm. Near the time(s) specified by `alarmInfo`, the `onAlarm` event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.

In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 30 seconds but may delay them an arbitrary amount more. That is, setting `delayInMinutes` or `periodInMinutes` to less than `0.5` will not be honored and will cause a warning. `when` can be set to less than 30 seconds after "now" without warning but won't actually cause the alarm to fire for at least 30 seconds.

To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.  

#### Parameters

  - name  
  string optional

  Optional name to identify this alarm. Defaults to the empty string.
  - alarmInfo  
  [AlarmCreateInfo](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-AlarmCreateInfo)

Describes when the alarm should fire. The initial time must be specified by either `when` or `delayInMinutes` (but not both). If `periodInMinutes` is set, the alarm will repeat every `periodInMinutes` minutes after the initial event. If neither `when` or `delayInMinutes` is set for a repeating alarm, `periodInMinutes` is used as the default for `delayInMinutes`.  

#### Returns

  - Promise\<void\>  
Chrome 111+  

### get()

```typescript
chrome.alarms.get(
  name?: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm | undefined>
```

Retrieves details about the specified alarm.  

#### Parameters

  - name  
  string optional

The name of the alarm to get. Defaults to the empty string.  

#### Returns

  - Promise\<[Alarm](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm) \| undefined\>  
Chrome 91+  

### getAll()

```typescript
chrome.alarms.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm[]>
```

Gets an array of all the alarms.  

#### Returns

  - Promise\<[Alarm](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm)\[\]\>  
  Chrome 91+

## Events

### onAlarm

```typescript
chrome.alarms.onAlarm.addListener(
  callback: function,
)
```

Fired when an alarm has elapsed. Useful for event pages.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (alarm: Alarm) => void
  ```

  <br />

    - alarm  
    [Alarm](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm)

<br />

---

## 3. action

*File: pages/action.md*

# chrome.action

<br />

<br />

## Description

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.
The action icons are displayed in the browser toolbar next to the [omnibox](https://en.wiktionary.org/wiki/omnibox). After installation, these appear in the extensions menu (the puzzle piece icon). Users can pin your extension icon to the toolbar.

<br />

<br />

<br />

## Availability

Chrome 88+ MV3+

<br />

<br />

## Manifest

The following keys must be declared [in the manifest](https://developer.chrome.com/docs/extensions/mv3/manifest) to use this API.
`"action"`  

<br />

To use the `chrome.action` API, specify a `"manifest_version"` of `3` and include
the `"action"` key in your [manifest file](https://developer.chrome.com/docs/extensions/reference/manifest).
**Note:** Every extension has an icon in the Chrome toolbar, even if the `"action"` key isn't added to the manifest.  

    {
      "name": "Action Extension",
      ...
      "action": {
        "default_icon": {              // optional
          "16": "images/icon16.png",   // optional
          "24": "images/icon24.png",   // optional
          "32": "images/icon32.png"    // optional
        },
        "default_title": "Click Me",   // optional, shown in tooltip
        "default_popup": "popup.html"  // optional
      },
      ...
    }

The `"action"` key (along with its children) is optional. When it isn't included, your extension is still shown in the toolbar to provide access to the extension's menu. For this reason, we recommend that you always include at least the `"action"` and `"default_icon"` keys.

## Concepts and usage

### Parts of the UI

#### Icon

The icon is the main image on the toolbar for your extension, and is set by the `"default_icon"` key in
your manifest's `"action"` key. Icons must be 16 device-independent pixels (DIPs) wide and tall.

The `"default_icon"` key is a dictionary of sizes to image paths. Chrome uses these icons
to choose which image scale to use. If an exact match is not found, Chrome selects the closest
available and scales it to fit the image, which might affect image quality.

Because devices with less-common scale factors like 1.5x or 1.2x are becoming more
common, we encourage you to provide multiple sizes for your icons. This also
futureproofs your extension against potential icon display size changes. However,
if only providing a single size, the `"default_icon"` key can also be set to a
string with the path to a single icon instead of a dictionary.

You can also call `action.setIcon()` to set your extension's icon programmatically
by specifying a different image path or providing a dynamically-generated icon using the [HTML canvas
element](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement), or, if setting from an extension service worker, the [offscreen
canvas](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas) API.  

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = '#00FF00';  // Green
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });

| **Note:** The `action.setIcon()` API is intended to set a static image. Don't use animated images for your icons.

For packed extensions (installed from a .crx file), images can be in most formats that the Blink
rendering engine can display, including PNG, JPEG, BMP, ICO, and others. SVG isn't supported.
Unpacked extensions must use PNG images.

#### Tooltip (title)

The tooltip, or title, appears when the user holds their mouse pointer over the extension's icon in the
toolbar. It's also included in the accessible text spoken by screen readers when the button gets
focus.

The default tooltip is set using the `"default_title"` field of the `"action"` key in `manifest.json`.
You can also set it programmatically by calling `action.setTitle()`.

#### Badge

Actions can optionally display a "badge" --- a bit of text layered over the icon. This lets you
update the action to display a small amount of information about the state of the extension,
such as a counter. The badge has a text component and a background color. Because space is limited,
we recommend that badge text use four or fewer characters.

To create a badge, set it programmatically by calling `action.setBadgeBackgroundColor()` and
`action.setBadgeText()`. There isn't a default badge setting in the manifest. Badge color values
can be either an array of four integers between 0 and 255 that make up the RGBA color of the
badge or a string with a [CSS color](https://developer.mozilla.org/docs/Web/CSS/color) value.  

    chrome.action.setBadgeBackgroundColor(
      {color: [0, 255, 0, 0]},  // Green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: '#00FF00'},  // Also green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: 'green'},  // Also, also green
      () => { /* ... */ },
    );

#### Popup

An action's popup is shown when the user clicks on the extension's action button in the
toolbar. The popup can contain any HTML contents you like, and will be automatically sized to fit
its contents. The popup's size must be between 25x25 and 800x600 pixels.

The popup is initially set by the `"default_popup"` property in the `"action"` key in the
`manifest.json` file. If present, this property should point to a relative path within the extension
directory. It can also be updated dynamically to point to a different relative path using the
`action.setPopup()` method.
| **Note:** The `action.onClicked` event won't be sent if the extension action has specified a popup to show on click of the current tab.

## Use cases

### Per-tab state

Extension actions can have different states for each tab. To set a value for an individual
tab, use the `tabId` property in the `action` API's setting methods. For example, to
set the badge text for a specific tab, do something like the following:  

    function getTabId() { /* ... */}
    function getTabBadge() { /* ... */}

    chrome.action.setBadgeText(
      {
        text: getTabBadge(tabId),
        tabId: getTabId(),
      },
      () => { ... }
    );

If the `tabId` property is left out, the setting is treated as a global setting. Tab-specific
settings take priority over global settings.

### Enabled state

By default, toolbar actions are enabled (clickable) on every tab. You can change this default
by setting the `default_state` property in the `action` key of the manifest. If
`default_state` is set to `"disabled"`, the action is disabled by default and must be enabled
programmatically to be clickable. If `default_state` is set to `"enabled"` (the default),
the action is enabled and clickable by default.

You can control the state programmatically using the `action.enable()` and `action.disable()`
methods. This only affects whether the popup (if any) or `action.onClicked` event is sent
to your extension; it doesn't affect the action's presence in the toolbar.

## Examples

The following examples show some common ways that actions are used in extensions. To try this API,
install the [Action API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Show a popup

It's common for an extension to display a popup when the user clicks the extension's action. To
implement this in your own extension, declare the popup in your `manifest.json` and specify the
content that Chrome should display in the popup.  

    // manifest.json
    {
      "name": "Action popup demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to view a popup",
        "default_popup": "popup.html"
      }
    }

    <!-- popup.html -->
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html {
          min-height: 5em;
          min-width: 10em;
          background: salmon;
        }
      </style>
    </head>
    <body>
      <p>Hello, world!</p>
    </body>
    </html>

### Inject a content script on click

A common pattern for extensions is to expose their primary feature using the extension's
action. The following example demonstrates this pattern. When the user clicks the action, the extension
injects a content script into the current page. The content script then displays an alert to verify
that everything worked as expected.  

    // manifest.json
    {
      "name": "Action script injection demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to show an alert"
      },
      "permissions": ["activeTab", "scripting"],
      "background": {
        "service_worker": "background.js"
      }
    }

    // background.js
    chrome.action.onClicked.addListener((tab) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
    });

    // content.js
    alert('Hello, world!');

### Emulate actions with declarativeContent

This example shows how an extension's background logic can (a) disable an action by default and (b)
use [declarativeContent](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent) to enable the action on specific sites.  

    // service-worker.js

    // Wrap in an onInstalled callback to avoid unnecessary work
    // every time the service worker is run
    chrome.runtime.onInstalled.addListener(() => {
      // Page actions are disabled by default and enabled on select tabs
      chrome.action.disable();

      // Clear all rules to ensure only our expected rules are set
      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let exampleRule = {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostSuffix: '.example.com'},
            })
          ],
          actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        let rules = [exampleRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
      });
    });

<br />

## Types

### OpenPopupOptions

Chrome 99+  

#### Properties

  - windowId  
  number optional

The ID of the window to open the action popup in. Defaults to the currently-active window if unspecified.  

### TabDetails

#### Properties

  - tabId  
  number optional

The ID of the tab to query state for. If no tab is specified, the non-tab-specific state is returned.  

### UserSettings

Chrome 91+

The collection of user-specified settings relating to an extension's action.  

#### Properties

  - isOnToolbar  
  boolean

Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).  

### UserSettingsChange

Chrome 130+  

#### Properties

  - isOnToolbar  
  boolean optional

  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

## Methods

### disable()

```typescript
chrome.action.disable(
  tabId?: number,
): Promise<void>
```

Disables the action for a tab.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### enable()

```typescript
chrome.action.enable(
  tabId?: number,
): Promise<void>
```

Enables the action for a tab. By default, actions are enabled.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### getBadgeBackgroundColor()

```typescript
chrome.action.getBadgeBackgroundColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the background color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getBadgeText()

```typescript
chrome.action.getBadgeText(
  details: TabDetails,
): Promise<string>
```

Gets the badge text of the action. If no tab is specified, the non-tab-specific badge text is returned. If [displayActionCountAsBadgeText](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#setExtensionActionOptions) is enabled, a placeholder text will be returned unless the [declarativeNetRequestFeedback](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#declarativeNetRequestFeedback) permission is present or tab-specific badge text was provided.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getBadgeTextColor()

Chrome 110+

```typescript
chrome.action.getBadgeTextColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the text color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getPopup()

```typescript
chrome.action.getPopup(
  details: TabDetails,
): Promise<string>
```

Gets the html document set as the popup for this action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getTitle()

```typescript
chrome.action.getTitle(
  details: TabDetails,
): Promise<string>
```

Gets the title of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getUserSettings()

Chrome 91+

```typescript
chrome.action.getUserSettings(): Promise<https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings>
```

Returns the user-specified settings relating to an extension's action.  

#### Returns

- Promise\<[UserSettings](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings)\>  

### isEnabled()

Chrome 110+

```typescript
chrome.action.isEnabled(
  tabId?: number,
): Promise<boolean>
```

Indicates whether the extension action is enabled for a tab (or globally if no `tabId` is provided). Actions enabled using only [`declarativeContent`](https://developer.chrome.com/docs/extensions/reference/declarativeContent/) always return false.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want check enabled status.  

#### Returns

- Promise\<boolean\>  

### openPopup()

Chrome 127+

```typescript
chrome.action.openPopup(
  options?: OpenPopupOptions,
): Promise<void>
```

Opens the extension's popup. Between Chrome 118 and Chrome 126, this is only available to policy installed extensions.  

#### Parameters

  - options  
  [OpenPopupOptions](https://developer.chrome.com/docs/extensions/reference/api/action#type-OpenPopupOptions) optional

Specifies options for opening the popup.  

#### Returns

- Promise\<void\>  

### setBadgeBackgroundColor()

```typescript
chrome.action.setBadgeBackgroundColor(
  details: object,
): Promise<void>
```

Sets the background color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setBadgeText()

```typescript
chrome.action.setBadgeText(
  details: object,
): Promise<void>
```

Sets the badge text for the action. The badge is displayed on top of the icon.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - text  
    string optional

Any number of characters can be passed, but only about four can fit in the space. If an empty string (`''`) is passed, the badge text is cleared. If `tabId` is specified and `text` is null, the text for the specified tab is cleared and defaults to the global badge text.  

#### Returns

- Promise\<void\>  

### setBadgeTextColor()

Chrome 110+

```typescript
chrome.action.setBadgeTextColor(
  details: object,
): Promise<void>
```

Sets the text color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`. Not setting this value will cause a color to be automatically chosen that will contrast with the badge's background color so the text will be visible. Colors with alpha values equivalent to 0 will not be set and will return an error.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setIcon()

```typescript
chrome.action.setIcon(
  details: object,
): Promise<void>
```

Sets the icon for the action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the **path** or the **imageData** property must be specified.  

#### Parameters

  - details  
  object  
    - imageData  
    ImageData \| object optional

    Either an ImageData object or a dictionary {size -\> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
    - path  
    string \| object optional

    Either a relative image path or a dictionary {size -\> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### setPopup()

```typescript
chrome.action.setPopup(
  details: object,
): Promise<void>
```

Sets the HTML document to be opened as a popup when the user clicks on the action's icon.  

#### Parameters

  - details  
  object  
    - popup  
    string

    The relative path to the HTML file to show in a popup. If set to the empty string (`''`), no popup is shown.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setTitle()

```typescript
chrome.action.setTitle(
  details: object,
): Promise<void>
```

Sets the title of the action. This shows up in the tooltip.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - title  
    string

The string the action should display when moused over.  

#### Returns

- Promise\<void\>

## Events

### onClicked

```typescript
chrome.action.onClicked.addListener(
  callback: function,
)
```

Fired when an action icon is clicked. This event will not fire if the action has a popup.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (tab: tabs.Tab) => void
  ```

  <br />

    - tab  
[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  

### onUserSettingsChanged

Chrome 130+

```typescript
chrome.action.onUserSettingsChanged.addListener(
  callback: function,
)
```

Fired when user-specified settings relating to an extension's action change.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (change: UserSettingsChange) => void
  ```

  <br />

    - change  
    [UserSettingsChange](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettingsChange)

<br />

---

## 4. alarms

*File: pages/alarms.md*

# chrome.action

<br />

<br />

## Description

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.
The action icons are displayed in the browser toolbar next to the [omnibox](https://en.wiktionary.org/wiki/omnibox). After installation, these appear in the extensions menu (the puzzle piece icon). Users can pin your extension icon to the toolbar.

<br />

<br />

<br />

## Availability

Chrome 88+ MV3+

<br />

<br />

## Manifest

The following keys must be declared [in the manifest](https://developer.chrome.com/docs/extensions/mv3/manifest) to use this API.
`"action"`  

<br />

To use the `chrome.action` API, specify a `"manifest_version"` of `3` and include
the `"action"` key in your [manifest file](https://developer.chrome.com/docs/extensions/reference/manifest).
**Note:** Every extension has an icon in the Chrome toolbar, even if the `"action"` key isn't added to the manifest.  

    {
      "name": "Action Extension",
      ...
      "action": {
        "default_icon": {              // optional
          "16": "images/icon16.png",   // optional
          "24": "images/icon24.png",   // optional
          "32": "images/icon32.png"    // optional
        },
        "default_title": "Click Me",   // optional, shown in tooltip
        "default_popup": "popup.html"  // optional
      },
      ...
    }

The `"action"` key (along with its children) is optional. When it isn't included, your extension is still shown in the toolbar to provide access to the extension's menu. For this reason, we recommend that you always include at least the `"action"` and `"default_icon"` keys.

## Concepts and usage

### Parts of the UI

#### Icon

The icon is the main image on the toolbar for your extension, and is set by the `"default_icon"` key in
your manifest's `"action"` key. Icons must be 16 device-independent pixels (DIPs) wide and tall.

The `"default_icon"` key is a dictionary of sizes to image paths. Chrome uses these icons
to choose which image scale to use. If an exact match is not found, Chrome selects the closest
available and scales it to fit the image, which might affect image quality.

Because devices with less-common scale factors like 1.5x or 1.2x are becoming more
common, we encourage you to provide multiple sizes for your icons. This also
futureproofs your extension against potential icon display size changes. However,
if only providing a single size, the `"default_icon"` key can also be set to a
string with the path to a single icon instead of a dictionary.

You can also call `action.setIcon()` to set your extension's icon programmatically
by specifying a different image path or providing a dynamically-generated icon using the [HTML canvas
element](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement), or, if setting from an extension service worker, the [offscreen
canvas](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas) API.  

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = '#00FF00';  // Green
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });

| **Note:** The `action.setIcon()` API is intended to set a static image. Don't use animated images for your icons.

For packed extensions (installed from a .crx file), images can be in most formats that the Blink
rendering engine can display, including PNG, JPEG, BMP, ICO, and others. SVG isn't supported.
Unpacked extensions must use PNG images.

#### Tooltip (title)

The tooltip, or title, appears when the user holds their mouse pointer over the extension's icon in the
toolbar. It's also included in the accessible text spoken by screen readers when the button gets
focus.

The default tooltip is set using the `"default_title"` field of the `"action"` key in `manifest.json`.
You can also set it programmatically by calling `action.setTitle()`.

#### Badge

Actions can optionally display a "badge" --- a bit of text layered over the icon. This lets you
update the action to display a small amount of information about the state of the extension,
such as a counter. The badge has a text component and a background color. Because space is limited,
we recommend that badge text use four or fewer characters.

To create a badge, set it programmatically by calling `action.setBadgeBackgroundColor()` and
`action.setBadgeText()`. There isn't a default badge setting in the manifest. Badge color values
can be either an array of four integers between 0 and 255 that make up the RGBA color of the
badge or a string with a [CSS color](https://developer.mozilla.org/docs/Web/CSS/color) value.  

    chrome.action.setBadgeBackgroundColor(
      {color: [0, 255, 0, 0]},  // Green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: '#00FF00'},  // Also green
      () => { /* ... */ },
    );

    chrome.action.setBadgeBackgroundColor(
      {color: 'green'},  // Also, also green
      () => { /* ... */ },
    );

#### Popup

An action's popup is shown when the user clicks on the extension's action button in the
toolbar. The popup can contain any HTML contents you like, and will be automatically sized to fit
its contents. The popup's size must be between 25x25 and 800x600 pixels.

The popup is initially set by the `"default_popup"` property in the `"action"` key in the
`manifest.json` file. If present, this property should point to a relative path within the extension
directory. It can also be updated dynamically to point to a different relative path using the
`action.setPopup()` method.
| **Note:** The `action.onClicked` event won't be sent if the extension action has specified a popup to show on click of the current tab.

## Use cases

### Per-tab state

Extension actions can have different states for each tab. To set a value for an individual
tab, use the `tabId` property in the `action` API's setting methods. For example, to
set the badge text for a specific tab, do something like the following:  

    function getTabId() { /* ... */}
    function getTabBadge() { /* ... */}

    chrome.action.setBadgeText(
      {
        text: getTabBadge(tabId),
        tabId: getTabId(),
      },
      () => { ... }
    );

If the `tabId` property is left out, the setting is treated as a global setting. Tab-specific
settings take priority over global settings.

### Enabled state

By default, toolbar actions are enabled (clickable) on every tab. You can change this default
by setting the `default_state` property in the `action` key of the manifest. If
`default_state` is set to `"disabled"`, the action is disabled by default and must be enabled
programmatically to be clickable. If `default_state` is set to `"enabled"` (the default),
the action is enabled and clickable by default.

You can control the state programmatically using the `action.enable()` and `action.disable()`
methods. This only affects whether the popup (if any) or `action.onClicked` event is sent
to your extension; it doesn't affect the action's presence in the toolbar.

## Examples

The following examples show some common ways that actions are used in extensions. To try this API,
install the [Action API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Show a popup

It's common for an extension to display a popup when the user clicks the extension's action. To
implement this in your own extension, declare the popup in your `manifest.json` and specify the
content that Chrome should display in the popup.  

    // manifest.json
    {
      "name": "Action popup demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to view a popup",
        "default_popup": "popup.html"
      }
    }

    <!-- popup.html -->
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html {
          min-height: 5em;
          min-width: 10em;
          background: salmon;
        }
      </style>
    </head>
    <body>
      <p>Hello, world!</p>
    </body>
    </html>

### Inject a content script on click

A common pattern for extensions is to expose their primary feature using the extension's
action. The following example demonstrates this pattern. When the user clicks the action, the extension
injects a content script into the current page. The content script then displays an alert to verify
that everything worked as expected.  

    // manifest.json
    {
      "name": "Action script injection demo",
      "version": "1.0",
      "manifest_version": 3,
      "action": {
        "default_title": "Click to show an alert"
      },
      "permissions": ["activeTab", "scripting"],
      "background": {
        "service_worker": "background.js"
      }
    }

    // background.js
    chrome.action.onClicked.addListener((tab) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
    });

    // content.js
    alert('Hello, world!');

### Emulate actions with declarativeContent

This example shows how an extension's background logic can (a) disable an action by default and (b)
use [declarativeContent](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent) to enable the action on specific sites.  

    // service-worker.js

    // Wrap in an onInstalled callback to avoid unnecessary work
    // every time the service worker is run
    chrome.runtime.onInstalled.addListener(() => {
      // Page actions are disabled by default and enabled on select tabs
      chrome.action.disable();

      // Clear all rules to ensure only our expected rules are set
      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let exampleRule = {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostSuffix: '.example.com'},
            })
          ],
          actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        let rules = [exampleRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
      });
    });

<br />

## Types

### OpenPopupOptions

Chrome 99+  

#### Properties

  - windowId  
  number optional

The ID of the window to open the action popup in. Defaults to the currently-active window if unspecified.  

### TabDetails

#### Properties

  - tabId  
  number optional

The ID of the tab to query state for. If no tab is specified, the non-tab-specific state is returned.  

### UserSettings

Chrome 91+

The collection of user-specified settings relating to an extension's action.  

#### Properties

  - isOnToolbar  
  boolean

Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).  

### UserSettingsChange

Chrome 130+  

#### Properties

  - isOnToolbar  
  boolean optional

  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

## Methods

### disable()

```typescript
chrome.action.disable(
  tabId?: number,
): Promise<void>
```

Disables the action for a tab.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### enable()

```typescript
chrome.action.enable(
  tabId?: number,
): Promise<void>
```

Enables the action for a tab. By default, actions are enabled.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want to modify the action.  

#### Returns

- Promise\<void\>  

### getBadgeBackgroundColor()

```typescript
chrome.action.getBadgeBackgroundColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the background color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getBadgeText()

```typescript
chrome.action.getBadgeText(
  details: TabDetails,
): Promise<string>
```

Gets the badge text of the action. If no tab is specified, the non-tab-specific badge text is returned. If [displayActionCountAsBadgeText](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#setExtensionActionOptions) is enabled, a placeholder text will be returned unless the [declarativeNetRequestFeedback](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#declarativeNetRequestFeedback) permission is present or tab-specific badge text was provided.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getBadgeTextColor()

Chrome 110+

```typescript
chrome.action.getBadgeTextColor(
  details: TabDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/extensionTypes#type-ColorArray.ColorArray>
```

Gets the text color of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)\>  

### getPopup()

```typescript
chrome.action.getPopup(
  details: TabDetails,
): Promise<string>
```

Gets the html document set as the popup for this action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getTitle()

```typescript
chrome.action.getTitle(
  details: TabDetails,
): Promise<string>
```

Gets the title of the action.  

#### Parameters

  - details  
[TabDetails](https://developer.chrome.com/docs/extensions/reference/api/action#type-TabDetails)  

#### Returns

- Promise\<string\>  

### getUserSettings()

Chrome 91+

```typescript
chrome.action.getUserSettings(): Promise<https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings>
```

Returns the user-specified settings relating to an extension's action.  

#### Returns

- Promise\<[UserSettings](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettings)\>  

### isEnabled()

Chrome 110+

```typescript
chrome.action.isEnabled(
  tabId?: number,
): Promise<boolean>
```

Indicates whether the extension action is enabled for a tab (or globally if no `tabId` is provided). Actions enabled using only [`declarativeContent`](https://developer.chrome.com/docs/extensions/reference/declarativeContent/) always return false.  

#### Parameters

  - tabId  
  number optional

The ID of the tab for which you want check enabled status.  

#### Returns

- Promise\<boolean\>  

### openPopup()

Chrome 127+

```typescript
chrome.action.openPopup(
  options?: OpenPopupOptions,
): Promise<void>
```

Opens the extension's popup. Between Chrome 118 and Chrome 126, this is only available to policy installed extensions.  

#### Parameters

  - options  
  [OpenPopupOptions](https://developer.chrome.com/docs/extensions/reference/api/action#type-OpenPopupOptions) optional

Specifies options for opening the popup.  

#### Returns

- Promise\<void\>  

### setBadgeBackgroundColor()

```typescript
chrome.action.setBadgeBackgroundColor(
  details: object,
): Promise<void>
```

Sets the background color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setBadgeText()

```typescript
chrome.action.setBadgeText(
  details: object,
): Promise<void>
```

Sets the badge text for the action. The badge is displayed on top of the icon.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - text  
    string optional

Any number of characters can be passed, but only about four can fit in the space. If an empty string (`''`) is passed, the badge text is cleared. If `tabId` is specified and `text` is null, the text for the specified tab is cleared and defaults to the global badge text.  

#### Returns

- Promise\<void\>  

### setBadgeTextColor()

Chrome 110+

```typescript
chrome.action.setBadgeTextColor(
  details: object,
): Promise<void>
```

Sets the text color for the badge.  

#### Parameters

  - details  
  object  
    - color  
    string \| [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)

    An array of four integers in the range \[0,255\] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`. Not setting this value will cause a color to be automatically chosen that will contrast with the badge's background color so the text will be visible. Colors with alpha values equivalent to 0 will not be set and will return an error.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setIcon()

```typescript
chrome.action.setIcon(
  details: object,
): Promise<void>
```

Sets the icon for the action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the **path** or the **imageData** property must be specified.  

#### Parameters

  - details  
  object  
    - imageData  
    ImageData \| object optional

    Either an ImageData object or a dictionary {size -\> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
    - path  
    string \| object optional

    Either a relative image path or a dictionary {size -\> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### setPopup()

```typescript
chrome.action.setPopup(
  details: object,
): Promise<void>
```

Sets the HTML document to be opened as a popup when the user clicks on the action's icon.  

#### Parameters

  - details  
  object  
    - popup  
    string

    The relative path to the HTML file to show in a popup. If set to the empty string (`''`), no popup is shown.
    - tabId  
    number optional

Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  

#### Returns

- Promise\<void\>  

### setTitle()

```typescript
chrome.action.setTitle(
  details: object,
): Promise<void>
```

Sets the title of the action. This shows up in the tooltip.  

#### Parameters

  - details  
  object  
    - tabId  
    number optional

    Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
    - title  
    string

The string the action should display when moused over.  

#### Returns

- Promise\<void\>

## Events

### onClicked

```typescript
chrome.action.onClicked.addListener(
  callback: function,
)
```

Fired when an action icon is clicked. This event will not fire if the action has a popup.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (tab: tabs.Tab) => void
  ```

  <br />

    - tab  
[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  

### onUserSettingsChanged

Chrome 130+

```typescript
chrome.action.onUserSettingsChanged.addListener(
  callback: function,
)
```

Fired when user-specified settings relating to an extension's action change.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (change: UserSettingsChange) => void
  ```

  <br />

    - change  
    [UserSettingsChange](https://developer.chrome.com/docs/extensions/reference/api/action#type-UserSettingsChange)

<br />

---

## 5. audio

*File: pages/audio.md*

# chrome.accessibilityFeatures

<br />

<br />

## Description

Use the `chrome.accessibilityFeatures` API to manage Chrome's accessibility features. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting individual accessibility features. In order to get feature states the extension must request `accessibilityFeatures.read` permission. For modifying feature state, the extension needs `accessibilityFeatures.modify` permission. Note that `accessibilityFeatures.modify` does not imply `accessibilityFeatures.read` permission.

<br />

<br />

## Permissions

`accessibilityFeatures.modify`  
`accessibilityFeatures.read`  

<br />

<br />

<br />

<br />

## Properties

### animationPolicy

`get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<"allowed"   
\| "once"   
\| "none"   
\>  

### autoclick

**ChromeOS only.**

Auto mouse click after mouse stops moving. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### caretHighlight

Chrome 51+

**ChromeOS only.**

Caret highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorColor

Chrome 85+

**ChromeOS only.**

Cursor color. The value indicates whether the feature is enabled or not, doesn't indicate the color of it. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorHighlight

Chrome 51+

**ChromeOS only.**

Cursor highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dictation

Chrome 90+

**ChromeOS only.**

Dictation. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dockedMagnifier

Chrome 87+

**ChromeOS only.**

Docked magnifier. The value indicates whether docked magnifier feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### focusHighlight

Chrome 51+

**ChromeOS only.**

Focus highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### highContrast

**ChromeOS only.**

High contrast rendering mode. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### largeCursor

**ChromeOS only.**

Enlarged cursor. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### screenMagnifier

**ChromeOS only.**

Full screen magnification. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### selectToSpeak

Chrome 51+

**ChromeOS only.**

Select-to-speak. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### spokenFeedback

**ChromeOS only.**

Spoken feedback (text-to-speech). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### stickyKeys

**ChromeOS only.**

Sticky modifier keys (like shift or alt). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### switchAccess

Chrome 51+

**ChromeOS only.**

Switch Access. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### virtualKeyboard

**ChromeOS only.**

Virtual on-screen keyboard. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>

<br />

---

## 6. bookmarks

*File: pages/bookmarks.md*

# chrome.accessibilityFeatures

<br />

<br />

## Description

Use the `chrome.accessibilityFeatures` API to manage Chrome's accessibility features. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting individual accessibility features. In order to get feature states the extension must request `accessibilityFeatures.read` permission. For modifying feature state, the extension needs `accessibilityFeatures.modify` permission. Note that `accessibilityFeatures.modify` does not imply `accessibilityFeatures.read` permission.

<br />

<br />

## Permissions

`accessibilityFeatures.modify`  
`accessibilityFeatures.read`  

<br />

<br />

<br />

<br />

## Properties

### animationPolicy

`get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<"allowed"   
\| "once"   
\| "none"   
\>  

### autoclick

**ChromeOS only.**

Auto mouse click after mouse stops moving. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### caretHighlight

Chrome 51+

**ChromeOS only.**

Caret highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorColor

Chrome 85+

**ChromeOS only.**

Cursor color. The value indicates whether the feature is enabled or not, doesn't indicate the color of it. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorHighlight

Chrome 51+

**ChromeOS only.**

Cursor highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dictation

Chrome 90+

**ChromeOS only.**

Dictation. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dockedMagnifier

Chrome 87+

**ChromeOS only.**

Docked magnifier. The value indicates whether docked magnifier feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### focusHighlight

Chrome 51+

**ChromeOS only.**

Focus highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### highContrast

**ChromeOS only.**

High contrast rendering mode. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### largeCursor

**ChromeOS only.**

Enlarged cursor. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### screenMagnifier

**ChromeOS only.**

Full screen magnification. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### selectToSpeak

Chrome 51+

**ChromeOS only.**

Select-to-speak. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### spokenFeedback

**ChromeOS only.**

Spoken feedback (text-to-speech). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### stickyKeys

**ChromeOS only.**

Sticky modifier keys (like shift or alt). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### switchAccess

Chrome 51+

**ChromeOS only.**

Switch Access. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### virtualKeyboard

**ChromeOS only.**

Virtual on-screen keyboard. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>

<br />

---

## 7. browsingData

*File: pages/browsingData.md*

# chrome.accessibilityFeatures

<br />

<br />

## Description

Use the `chrome.accessibilityFeatures` API to manage Chrome's accessibility features. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting individual accessibility features. In order to get feature states the extension must request `accessibilityFeatures.read` permission. For modifying feature state, the extension needs `accessibilityFeatures.modify` permission. Note that `accessibilityFeatures.modify` does not imply `accessibilityFeatures.read` permission.

<br />

<br />

## Permissions

`accessibilityFeatures.modify`  
`accessibilityFeatures.read`  

<br />

<br />

<br />

<br />

## Properties

### animationPolicy

`get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<"allowed"   
\| "once"   
\| "none"   
\>  

### autoclick

**ChromeOS only.**

Auto mouse click after mouse stops moving. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### caretHighlight

Chrome 51+

**ChromeOS only.**

Caret highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorColor

Chrome 85+

**ChromeOS only.**

Cursor color. The value indicates whether the feature is enabled or not, doesn't indicate the color of it. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### cursorHighlight

Chrome 51+

**ChromeOS only.**

Cursor highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dictation

Chrome 90+

**ChromeOS only.**

Dictation. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### dockedMagnifier

Chrome 87+

**ChromeOS only.**

Docked magnifier. The value indicates whether docked magnifier feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### focusHighlight

Chrome 51+

**ChromeOS only.**

Focus highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### highContrast

**ChromeOS only.**

High contrast rendering mode. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### largeCursor

**ChromeOS only.**

Enlarged cursor. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### screenMagnifier

**ChromeOS only.**

Full screen magnification. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### selectToSpeak

Chrome 51+

**ChromeOS only.**

Select-to-speak. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### spokenFeedback

**ChromeOS only.**

Spoken feedback (text-to-speech). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### stickyKeys

**ChromeOS only.**

Sticky modifier keys (like shift or alt). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### switchAccess

Chrome 51+

**ChromeOS only.**

Switch Access. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>  

### virtualKeyboard

**ChromeOS only.**

Virtual on-screen keyboard. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<boolean\>

<br />

---

## 8. certificateProvider

*File: pages/certificateProvider.md*

# chrome.cookies

<br />

<br />

## Description

Use the `chrome.cookies` API to query and modify cookies, and to be notified when they change.

<br />

<br />

## Permissions

`cookies`  

<br />

<br />

<br />

To use the cookies API, declare the `"cookies"` permission in your
manifest along with [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) for any hosts whose cookies you want
to access. For example:  

    {
      "name": "My extension",
      ...
      "host_permissions": [
        "*://*.google.com/"
      ],
      "permissions": [
        "cookies"
      ],
      ...
    }

## Partitioning

[Partitioned cookies](https://developer.chrome.com/docs/privacy-sandbox/chips) allow a site to mark that certain cookies should be keyed against the
origin of the top-level frame. This means that, for example, if site A is embedded using an iframe in site B
and site C, the embedded versions of a partitioned cookie from A can have different values on B and C.

By default, all API methods operate on unpartitioned cookies. The
[`partitionKey`](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookiePartitionKey) property can be used to override this behavior.

For details on the general impact of partitioning for extensions, see
[Storage and Cookies](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies#cookies-partitioning).

## Examples

You can find a simple example of using the cookies API in the
[examples/api/cookies](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/cookies/cookie-clearer) directory. For other examples and for help in viewing
the source code, see [Samples](https://developer.chrome.com/docs/extensions/samples).

<br />

## Types

### Cookie

Represents information about an HTTP cookie.  

#### Properties

  - domain  
  string

  The domain of the cookie (e.g. "www.google.com", "example.com").
  - expirationDate  
  number optional

  The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.
  - hostOnly  
  boolean

  True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie).
  - httpOnly  
  boolean

  True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts).
  - name  
  string

  The name of the cookie.
  - partitionKey  
  [CookiePartitionKey](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookiePartitionKey) optional  
  Chrome 119+

  The partition key for reading or modifying cookies with the Partitioned attribute.
  - path  
  string

  The path of the cookie.
  - sameSite  
  [SameSiteStatus](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-SameSiteStatus)  
  Chrome 51+

  The cookie's same-site status (i.e. whether the cookie is sent with cross-site requests).
  - secure  
  boolean

  True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS).
  - session  
  boolean

  True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date.
  - storeId  
  string

  The ID of the cookie store containing this cookie, as provided in getAllCookieStores().
  - value  
  string

The value of the cookie.  

### CookieDetails

Chrome 88+

Details to identify the cookie.  

#### Properties

  - name  
  string

  The name of the cookie to access.
  - partitionKey  
  [CookiePartitionKey](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookiePartitionKey) optional  
  Chrome 119+

  The partition key for reading or modifying cookies with the Partitioned attribute.
  - storeId  
  string optional

  The ID of the cookie store in which to look for the cookie. By default, the current execution context's cookie store will be used.
  - url  
  string

The URL with which the cookie to access is associated. This argument may be a full URL, in which case any data following the URL path (e.g. the query string) is simply ignored. If host permissions for this URL are not specified in the manifest file, the API call will fail.  

### CookiePartitionKey

Chrome 119+

Represents a partitioned cookie's partition key.  

#### Properties

  - hasCrossSiteAncestor  
  boolean optional  
  Chrome 130+

  Indicates if the cookie was set in a cross-cross site context. This prevents a top-level site embedded in a cross-site context from accessing cookies set by the top-level site in a same-site context.
  - topLevelSite  
  string optional

The top-level site the partitioned cookie is available in.  

### CookieStore

Represents a cookie store in the browser. An incognito mode window, for instance, uses a separate cookie store from a non-incognito window.  

#### Properties

  - id  
  string

  The unique identifier for the cookie store.
  - tabIds  
  number\[\]

Identifiers of all the browser tabs that share this cookie store.  

### FrameDetails

Chrome 132+

Details to identify the frame.  

#### Properties

  - documentId  
  string optional

  The unique identifier for the document. If the frameId and/or tabId are provided they will be validated to match the document found by provided document ID.
  - frameId  
  number optional

  The unique identifier for the frame within the tab.
  - tabId  
  number optional

The unique identifier for the tab containing the frame.  

### OnChangedCause

Chrome 44+

The underlying reason behind the cookie's change. If a cookie was inserted, or removed via an explicit call to "chrome.cookies.remove", "cause" will be "explicit". If a cookie was automatically removed due to expiry, "cause" will be "expired". If a cookie was removed due to being overwritten with an already-expired expiration date, "cause" will be set to "expired_overwrite". If a cookie was automatically removed due to garbage collection, "cause" will be "evicted". If a cookie was automatically removed due to a "set" call that overwrote it, "cause" will be "overwrite". Plan your response accordingly.  

#### Enum

"evicted"   
"expired"   
"explicit"   
"expired_overwrite"   
"overwrite"   

<br />

### SameSiteStatus

Chrome 51+

A cookie's 'SameSite' state (https://tools.ietf.org/html/draft-west-first-party-cookies). 'no_restriction' corresponds to a cookie set with 'SameSite=None', 'lax' to 'SameSite=Lax', and 'strict' to 'SameSite=Strict'. 'unspecified' corresponds to a cookie set without the SameSite attribute.  

#### Enum

"no_restriction"   
"lax"   
"strict"   
"unspecified"   

<br />

## Methods

### get()

```typescript
chrome.cookies.get(
  details: CookieDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie | undefined>
```

Retrieves information about a single cookie. If more than one cookie of the same name exists for the given URL, the one with the longest path will be returned. For cookies with the same path length, the cookie with the earliest creation time will be returned.  

#### Parameters

  - details  
[CookieDetails](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookieDetails)  

#### Returns

  - Promise\<[Cookie](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie) \| undefined\>  
Chrome 88+  

### getAll()

```typescript
chrome.cookies.getAll(
  details: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie[]>
```

Retrieves all cookies from a single cookie store that match the given information. The cookies returned will be sorted, with those with the longest path first. If multiple cookies have the same path length, those with the earliest creation time will be first. This method only retrieves cookies for domains that the extension has host permissions to.  

#### Parameters

  - details  
  object

  Information to filter the cookies being retrieved.  
    - domain  
    string optional

    Restricts the retrieved cookies to those whose domains match or are subdomains of this one.
    - name  
    string optional

    Filters the cookies by name.
    - partitionKey  
    [CookiePartitionKey](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookiePartitionKey) optional  
    Chrome 119+

    The partition key for reading or modifying cookies with the Partitioned attribute.
    - path  
    string optional

    Restricts the retrieved cookies to those whose path exactly matches this string.
    - secure  
    boolean optional

    Filters the cookies by their Secure property.
    - session  
    boolean optional

    Filters out session vs. persistent cookies.
    - storeId  
    string optional

    The cookie store to retrieve cookies from. If omitted, the current execution context's cookie store will be used.
    - url  
    string optional

Restricts the retrieved cookies to those that would match the given URL.  

#### Returns

  - Promise\<[Cookie](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie)\[\]\>  
Chrome 88+  

### getAllCookieStores()

```typescript
chrome.cookies.getAllCookieStores(): Promise<https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookieStore[]>
```

Lists all existing cookie stores.  

#### Returns

  - Promise\<[CookieStore](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookieStore)\[\]\>  
Chrome 88+  

### getPartitionKey()

Chrome 132+

```typescript
chrome.cookies.getPartitionKey(
  details: FrameDetails,
): Promise<object>
```

The partition key for the frame indicated.  

#### Parameters

  - details  
[FrameDetails](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-FrameDetails)  

#### Returns

- Promise\<object\>  

### remove()

```typescript
chrome.cookies.remove(
  details: CookieDetails,
): Promise<object | undefined>
```

Deletes a cookie by name.  

#### Parameters

  - details  
[CookieDetails](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookieDetails)  

#### Returns

  - Promise\<object \| undefined\>  
Chrome 88+  

### set()

```typescript
chrome.cookies.set(
  details: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie | undefined>
```

Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.  

#### Parameters

  - details  
  object

  Details about the cookie being set.  
    - domain  
    string optional

    The domain of the cookie. If omitted, the cookie becomes a host-only cookie.
    - expirationDate  
    number optional

    The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.
    - httpOnly  
    boolean optional

    Whether the cookie should be marked as HttpOnly. Defaults to false.
    - name  
    string optional

    The name of the cookie. Empty by default if omitted.
    - partitionKey  
    [CookiePartitionKey](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-CookiePartitionKey) optional  
    Chrome 119+

    The partition key for reading or modifying cookies with the Partitioned attribute.
    - path  
    string optional

    The path of the cookie. Defaults to the path portion of the url parameter.
    - sameSite  
    [SameSiteStatus](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-SameSiteStatus) optional  
    Chrome 51+

    The cookie's same-site status. Defaults to "unspecified", i.e., if omitted, the cookie is set without specifying a SameSite attribute.
    - secure  
    boolean optional

    Whether the cookie should be marked as Secure. Defaults to false.
    - storeId  
    string optional

    The ID of the cookie store in which to set the cookie. By default, the cookie is set in the current execution context's cookie store.
    - url  
    string

    The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie. If host permissions for this URL are not specified in the manifest file, the API call will fail.
    - value  
    string optional

The value of the cookie. Empty by default if omitted.  

#### Returns

  - Promise\<[Cookie](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie) \| undefined\>  
  Chrome 88+

## Events

### onChanged

```typescript
chrome.cookies.onChanged.addListener(
  callback: function,
)
```

Fired when a cookie is set or removed. As a special case, note that updating a cookie's properties is implemented as a two step process: the cookie to be updated is first removed entirely, generating a notification with "cause" of "overwrite" . Afterwards, a new cookie is written with the updated values, generating a second notification with "cause" "explicit".  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (changeInfo: object) => void
  ```

  <br />

    - changeInfo  
    object  
      - cause  
      [OnChangedCause](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-OnChangedCause)

      The underlying reason behind the cookie's change.
      - cookie  
      [Cookie](https://developer.chrome.com/docs/extensions/reference/api/cookies#type-Cookie)

      Information about the cookie that was set or removed.
      - removed  
      boolean

      True if a cookie was removed.

<br />

---

## 9. commands

*File: pages/commands.md*

# chrome.declarativeContent

<br />

<br />

## Description

Use the `chrome.declarativeContent` API to take actions depending on the content of a page, without requiring permission to read the page's content.

<br />

<br />

## Permissions

`declarativeContent`  

<br />

<br />

<br />

## Concepts and usage

| **Key term:** An [extension's *action*](https://developer.chrome.com/docs/extensions/reference/api/action) controls the extension's toolbar icon.

The Declarative Content API lets you enable your extension's action depending on the URL of a
web page, or if a CSS selector matches an element on the page, without needing to
add [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions) or inject a [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).

Use the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission to interact with a page after the user clicks on the
extension's action.

### Rules

Rules consists of conditions and actions. If any of the conditions is fulfilled, all actions are
executed. The actions are [`setIcon()`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-SetIcon) and [`showAction()`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowAction).

The [`PageStateMatcher`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-PageStateMatcher) matches web pages if and only if all listed
criteria are met. It can match a [page url](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#page-url), a [css compound selector](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#css)
or the [bookmarked state](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#bookmarked) of a page. The following rule enables
the extension's action on Google pages when a password field is present:  

    let rule1 = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.google.com', schemes: ['https'] },
          css: ["input[type='password']"]
        })
      ],
      actions: [ new chrome.declarativeContent.ShowAction() ]
    };

| **Success:** All conditions and actions are created using a constructor as shown in the previous example.

To also enable the extension's action for Google sites with a video, you can add a second
condition, as each condition is sufficient to trigger all specified actions:  

    let rule2 = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.google.com', schemes: ['https'] },
          css: ["input[type='password']"]
        }),
        new chrome.declarativeContent.PageStateMatcher({
          css: ["video"]
        })
      ],
      actions: [ new chrome.declarativeContent.ShowAction() ]
    };

The [`onPageChanged`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#event-onPageChanged) event tests whether any rule has at least one fulfilled
condition and executes the actions. Rules persist across browsing sessions; therefore, during
extension installation time you should first use [`removeRules`](https://developer.chrome.com/docs/extensions/reference/api/events#remove_rules) to clear
previously installed rules and then use [`addRules`](https://developer.chrome.com/docs/extensions/reference/api/events#add_rules) to register new ones.  

    chrome.runtime.onInstalled.addListener(function(details) {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([rule2]);
      });
    });

| **Note:** You should always register or unregister rules in bulk because each of these operations recreates internal data structures. This re-creation is computationally expensive but facilitates a faster matching algorithm.

With the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission, your extension won't display any permission
warnings and when the user clicks the extension action, it will only run on relevant pages.

### Page URL matching

The [`PageStateMatcher.pageurl`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#property-PageStateMatcher-pageUrl) matches when the URL criteria are fulfilled. The
most common criteria are a concatenation of either host, path, or URL, followed by Contains, Equals, Prefix, or
Suffix. The following table contains a few examples:

|                 Criteria                  |             Matches             |
|-------------------------------------------|---------------------------------|
| `{ hostSuffix: 'google.com' }`            | All Google URLs                 |
| `{ pathPrefix: '/docs/extensions'` }      | Extension docs URLs             |
| `{ urlContains: 'developer.chrome.com'` } | All chrome developers docs URLs |

All criteria are case sensitive. For a complete list of criteria, see [UrlFilter](https://developer.chrome.com/docs/extensions/reference/api/events#type-UrlFilter).

### CSS Matching

[`PageStateMatcher.css`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#property-PageStateMatcher-css) conditions must be *[compound selectors](https://www.w3.org/TR/selectors4/#compound)* ,
meaning that you can't include [combinators](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors#combinators) like whitespace or "`>`" in your
selectors. This helps Chrome match the selectors more efficiently.

|    Compound Selectors (OK)    | Complex Selectors (Not OK) |
|-------------------------------|----------------------------|
| `a`                           | `div p`                    |
| `iframe.special[src^='http']` | `p>span.highlight`         |
| `ns|*`                        | `p + ol`                   |
| `#abcd:checked`               | `p::first-line`            |

CSS conditions only match displayed elements: if an element that matches your selector is
`display:none` or one of its parent elements is `display:none`, it doesn't cause the condition to
match. Elements styled with `visibility:hidden`, positioned off-screen, or hidden by other elements
can still make your condition match.

### Bookmarked state matching

The [`PageStateMatcher.isBookmarked`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#property-PageStateMatcher-isBookmarked) condition allows matching of the
bookmarked state of the current URL in the user's profile. To make use of this condition the
"bookmarks" permission must be declared in the extension [manifest](https://developer.chrome.com/docs/extensions/reference/manifest).

<br />

## Types

### ImageDataType

See <https://developer.mozilla.org/en-US/docs/Web/API/ImageData>.  

#### Type

ImageData  

### PageStateMatcher

Matches the state of a web page based on various criteria.  

#### Properties

  - constructor  
  void


  The `constructor` function looks like:  

  ```typescript
  (arg: PageStateMatcher) => {...}
  ```

  <br />

    - arg  
  [PageStateMatcher](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-PageStateMatcher)  
    - returns  
    [PageStateMatcher](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-PageStateMatcher)
  - css  
  string\[\] optional

  Matches if all of the CSS selectors in the array match displayed elements in a frame with the same origin as the page's main frame. All selectors in this array must be [compound selectors](https://www.w3.org/TR/selectors4/#compound) to speed up matching. Note: Listing hundreds of CSS selectors or listing CSS selectors that match hundreds of times per page can slow down web sites.
  - isBookmarked  
  boolean optional  
  Chrome 45+

  Matches if the bookmarked state of the page is equal to the specified value. Requres the [bookmarks permission](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).
  - pageUrl  
  [UrlFilter](https://developer.chrome.com/docs/extensions/reference/events/#type-UrlFilter) optional

Matches if the conditions of the `UrlFilter` are fulfilled for the top-level URL of the page.  

### RequestContentScript

Declarative event action that injects a content script.

**WARNING:** This action is still experimental and is not supported on stable builds of Chrome.  

#### Properties

  - constructor  
  void


  The `constructor` function looks like:  

  ```typescript
  (arg: RequestContentScript) => {...}
  ```

  <br />

    - arg  
  [RequestContentScript](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-RequestContentScript)  
    - returns  
    [RequestContentScript](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-RequestContentScript)
  - allFrames  
  boolean optional

  Whether the content script runs in all frames of the matching page, or in only the top frame. Default is `false`.
  - css  
  string\[\] optional

  Names of CSS files to be injected as a part of the content script.
  - js  
  string\[\] optional

  Names of JavaScript files to be injected as a part of the content script.
  - matchAboutBlank  
  boolean optional

Whether to insert the content script on `about:blank` and `about:srcdoc`. Default is `false`.  

### SetIcon

Declarative event action that sets the n-dip square icon for the extension's [page action](https://developer.chrome.com/docs/extensions/reference/pageAction/) or [browser action](https://developer.chrome.com/docs/extensions/reference/browserAction/) while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions), but the extension must have a page or browser action.

Exactly one of `imageData` or `path` must be specified. Both are dictionaries mapping a number of pixels to an image representation. The image representation in `imageData` is an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object; for example, from a `canvas` element, while the image representation in `path` is the path to an image file relative to the extension's manifest. If `scale` screen pixels fit into a device-independent pixel, the `scale * n` icon is used. If that scale is missing, another image is resized to the required size.  

#### Properties

  - constructor  
  void


  The `constructor` function looks like:  

  ```typescript
  (arg: SetIcon) => {...}
  ```

  <br />

    - arg  
  [SetIcon](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-SetIcon)  
    - returns  
    [SetIcon](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-SetIcon)
  - imageData  
  ImageData \| object optional

Either an `ImageData` object or a dictionary {size -\> ImageData} representing an icon to be set. If the icon is specified as a dictionary, the image used is chosen depending on the screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then an image with size `scale * n` is selected, where *n* is the size of the icon in the UI. At least one image must be specified. Note that `details.imageData = foo` is equivalent to `details.imageData = {'16': foo}`.  

### ShowAction

Chrome 97+

A declarative event action that sets the extension's toolbar [action](https://developer.chrome.com/docs/extensions/reference/action/) to an enabled state while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions). If the extension has the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission, clicking the page action grants access to the active tab.

On pages where the conditions are not met the extension's toolbar action will be grey-scale, and clicking it will open the context menu, instead of triggering the action.  

#### Properties

  - constructor  
  void


  The `constructor` function looks like:  

  ```typescript
  (arg: ShowAction) => {...}
  ```

  <br />

    - arg  
  [ShowAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowAction)  
    - returns  
[ShowAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowAction)  

### ShowPageAction

Deprecated since Chrome 97

Please use [`declarativeContent.ShowAction`](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowAction).

<br />

A declarative event action that sets the extension's [page action](https://developer.chrome.com/docs/extensions/reference/pageAction/) to an enabled state while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions), but the extension must have a page action. If the extension has the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission, clicking the page action grants access to the active tab.

On pages where the conditions are not met the extension's toolbar action will be grey-scale, and clicking it will open the context menu, instead of triggering the action.  

#### Properties

  - constructor  
  void


  The `constructor` function looks like:  

  ```typescript
  (arg: ShowPageAction) => {...}
  ```

  <br />

    - arg  
  [ShowPageAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowPageAction)  
    - returns  
    [ShowPageAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowPageAction)

## Events

### onPageChanged


Provides the [Declarative Event API](https://developer.chrome.com/docs/extensions/reference/api/events#declarative_event_handlers) consisting of `addRules`, `removeRules`, and `getRules`.  

#### Conditions

[PageStateMatcher](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-PageStateMatcher)

<br />

#### Actions

[RequestContentScript](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-RequestContentScript)
[SetIcon](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-SetIcon)
[ShowPageAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowPageAction)
[ShowAction](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent#type-ShowAction)

<br />

<br />

---

## 10. contentSettings

*File: pages/contentSettings.md*

# chrome.certificateProvider

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use this API to expose certificates to the platform which can use these certificates for TLS authentications.

<br />

<br />

## Permissions

`certificateProvider`  

<br />

<br />

## Availability

Chrome 46+ ChromeOS only

<br />

<br />

## Concepts and usage

Typical usage of this API to expose client certificates to ChromeOS follows these steps:

- The Extension registers for the events [`onCertificatesUpdateRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onCertificatesUpdateRequested) and [`onSignatureRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onSignatureRequested).
- The Extension calls [`setCertificates()`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates) to provide the initial list of certificates after the initialization.
- The Extension monitors the changes in the list of available certificates and calls [`setCertificates()`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates) to notify the browser about every such change.
- During a TLS handshake, the browser receives a client certificate request. With an [`onCertificatesUpdateRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onCertificatesUpdateRequested) event, the browser asks the Extension to report all certificates that it currently provides.
- The Extension reports back with the currently available certificates, using the [`setCertificates()`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates) method.
- The browser matches all available certificates with the client certificate request from the remote host. The matches are presented to the user in a selection dialog.
- The user can select a certificate and thereby approve the authentication or abort the authentication.

![Certificate selection dialog](https://developer.chrome.com/static/docs/extensions/reference/api/images/certificate_provider_selection_dialog.png) Certificate selection dialog.

- If the user aborts the authentication or no certificate matched the request, the TLS client authentication is aborted.
- Otherwise, if the user approves the authentication with a certificate provided by this Extension, the browser requests the Extension to sign the data to continue the TLS handshake. The request is sent as a [`onSignatureRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onSignatureRequested) event.
- This event contains input data, declares which algorithm has to be used to generate the signature, and refers to one of the certificates that were reported by this Extension. The Extension must create a signature for the given data using the private key associated with the referenced certificate. Creating the signature might require prepending a DigestInfo and padding the result before the actual signing.
- The Extension sends back the signature to the browser using the [`reportSignature()`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-reportSignature) method. If the signature couldn't be calculated, the method has to be called without signature.
- If the signature was provided, the browser completes the TLS handshake.

The actual sequence of steps can be different. For example, the user will not be asked to select a certificate if the enterprise policy to automatically select a certificate is used (see [`AutoSelectCertificateForUrls`](https://cloud.google.com/docs/chrome-enterprise/policies/?policy=AutoSelectCertificateForUrls) and [Chrome policies for users](https://support.google.com/chrome/a/answer/2657289#AutoSelectCertificateForUrls)).

In the Extension, this can look similar to the following snippet:  

    function collectAvailableCertificates() {
      // Return all certificates that this Extension can currently provide.
      // For example:
      return [{
        certificateChain: [new Uint8Array(...)],
        supportedAlgorithms: ['RSASSA_PKCS1_v1_5_SHA256']
      }];
    }

    // The Extension calls this function every time the currently available list of
    // certificates changes, and also once after the Extension's initialization.
    function onAvailableCertificatesChanged() {
      chrome.certificateProvider.setCertificates({
        clientCertificates: collectAvailableCertificates()
      });
    }

    function handleCertificatesUpdateRequest(request) {
      // Report the currently available certificates as a response to the request
      // event. This is important for supporting the case when the Extension is
      // unable to detect the changes proactively.
      chrome.certificateProvider.setCertificates({
        certificatesRequestId: request.certificatesRequestId,
        clientCertificates: collectAvailableCertificates()
      });
    }

    // Returns a private key handle for the given DER-encoded certificate.
    // |certificate| is an ArrayBuffer.
    function getPrivateKeyHandle(certificate) {...}

    // Digests and signs |input| with the given private key. |input| is an
    // ArrayBuffer. |algorithm| is an Algorithm.
    // Returns the signature as ArrayBuffer.
    function signUnhashedData(privateKey, input, algorithm) {...}

    function handleSignatureRequest(request) {
      // Look up the handle to the private key of |request.certificate|.
      const key = getPrivateKeyHandle(request.certificate);
      if (!key) {
        // Handle if the key isn't available.
        console.error('Key for requested certificate no available.');

        // Abort the request by reporting the error to the API.
        chrome.certificateProvider.reportSignature({
          signRequestId: request.signRequestId,
          error: 'GENERAL_ERROR'
        });
        return;
      }

      const signature = signUnhashedData(key, request.input, request.algorithm);
      chrome.certificateProvider.reportSignature({
        signRequestId: request.signRequestId,
        signature: signature
      });
    }

    chrome.certificateProvider.onCertificatesUpdateRequested.addListener(
        handleCertificatesUpdateRequest);
    chrome.certificateProvider.onSignatureRequested.addListener(
        handleSignatureRequest);

<br />

## Types

### Algorithm

Chrome 86+

Types of supported cryptographic signature algorithms.  

#### Enum

"RSASSA_PKCS1_v1_5_MD5_SHA1"   
Specifies the RSASSA PKCS#1 v1.5 signature algorithm with the MD5-SHA-1 hashing. The extension must not prepend a DigestInfo prefix but only add PKCS#1 padding. This algorithm is deprecated and will never be requested by Chrome as of version 109.
"RSASSA_PKCS1_v1_5_SHA1"   
Specifies the RSASSA PKCS#1 v1.5 signature algorithm with the SHA-1 hash function.
"RSASSA_PKCS1_v1_5_SHA256"   
Specifies the RSASSA PKCS#1 v1.5 signature algorithm with the SHA-256 hashing function.
"RSASSA_PKCS1_v1_5_SHA384"   
Specifies the RSASSA PKCS#1 v1.5 signature algorithm with the SHA-384 hashing function.
"RSASSA_PKCS1_v1_5_SHA512"   
Specifies the RSASSA PKCS#1 v1.5 signature algorithm with the SHA-512 hashing function.
"RSASSA_PSS_SHA256"   
Specifies the RSASSA PSS signature algorithm with the SHA-256 hashing function, MGF1 mask generation function and the salt of the same size as the hash.
"RSASSA_PSS_SHA384"   
Specifies the RSASSA PSS signature algorithm with the SHA-384 hashing function, MGF1 mask generation function and the salt of the same size as the hash.
"RSASSA_PSS_SHA512"   
Specifies the RSASSA PSS signature algorithm with the SHA-512 hashing function, MGF1 mask generation function and the salt of the same size as the hash.

<br />

### CertificateInfo

#### Properties

  - certificate  
  ArrayBuffer

  Must be the DER encoding of a X.509 certificate. Currently, only certificates of RSA keys are supported.
  - supportedHashes  
  [Hash](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-Hash)\[\]

Must be set to all hashes supported for this certificate. This extension will only be asked for signatures of digests calculated with one of these hash algorithms. This should be in order of decreasing hash preference.  

### CertificatesUpdateRequest

Chrome 86+  

#### Properties

  - certificatesRequestId  
  number

Request identifier to be passed to [`setCertificates`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates).  

### ClientCertificateInfo

Chrome 86+  

#### Properties

  - certificateChain  
  ArrayBuffer\[\]

  The array must contain the DER encoding of the X.509 client certificate as its first element.

  This must include exactly one certificate.
  - supportedAlgorithms  
  [Algorithm](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-Algorithm)\[\]

All algorithms supported for this certificate. The extension will only be asked for signatures using one of these algorithms.  

### Error

Chrome 86+

Types of errors that the extension can report.  

#### Value

"GENERAL_ERROR"   

### Hash

Deprecated. Replaced by [`Algorithm`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-Algorithm).  

#### Enum

"MD5_SHA1"   
Specifies the MD5 and SHA1 hashing algorithms.
"SHA1"   
Specifies the SHA1 hashing algorithm.
"SHA256"   
Specifies the SHA256 hashing algorithm.
"SHA384"   
Specifies the SHA384 hashing algorithm.
"SHA512"   
Specifies the SHA512 hashing algorithm.

<br />

### PinRequestErrorType

Chrome 57+

The types of errors that can be presented to the user through the requestPin function.  

#### Enum

"INVALID_PIN"   
Specifies the PIN is invalid.
"INVALID_PUK"   
Specifies the PUK is invalid.
"MAX_ATTEMPTS_EXCEEDED"   
Specifies the maximum attempt number has been exceeded.
"UNKNOWN_ERROR"   
Specifies that the error cannot be represented by the above types.

<br />

### PinRequestType

Chrome 57+

The type of code being requested by the extension with requestPin function.  

#### Enum

"PIN"   
Specifies the requested code is a PIN.
"PUK"   
Specifies the requested code is a PUK.

<br />

### PinResponseDetails

Chrome 57+  

#### Properties

  - userInput  
  string optional

The code provided by the user. Empty if user closed the dialog or some other error occurred.  

### ReportSignatureDetails

Chrome 86+  

#### Properties

  - error  
  "GENERAL_ERROR"   
  optional

  Error that occurred while generating the signature, if any.
  - signRequestId  
  number

  Request identifier that was received via the [`onSignatureRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onSignatureRequested) event.
  - signature  
  ArrayBuffer optional

The signature, if successfully generated.  

### RequestPinDetails

Chrome 57+  

#### Properties

  - attemptsLeft  
  number optional

  The number of attempts left. This is provided so that any UI can present this information to the user. Chrome is not expected to enforce this, instead stopPinRequest should be called by the extension with errorType = MAX_ATTEMPTS_EXCEEDED when the number of pin requests is exceeded.
  - errorType  
  [PinRequestErrorType](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-PinRequestErrorType) optional

  The error template displayed to the user. This should be set if the previous request failed, to notify the user of the failure reason.
  - requestType  
  [PinRequestType](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-PinRequestType) optional

  The type of code requested. Default is PIN.
  - signRequestId  
  number

The ID given by Chrome in SignRequest.  

### SetCertificatesDetails

Chrome 86+  

#### Properties

  - certificatesRequestId  
  number optional

  When called in response to [`onCertificatesUpdateRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onCertificatesUpdateRequested), should contain the received `certificatesRequestId` value. Otherwise, should be unset.
  - clientCertificates  
  [ClientCertificateInfo](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-ClientCertificateInfo)\[\]

  List of currently available client certificates.
  - error  
  "GENERAL_ERROR"   
  optional

Error that occurred while extracting the certificates, if any. This error will be surfaced to the user when appropriate.  

### SignatureRequest

Chrome 86+  

#### Properties

  - algorithm  
  [Algorithm](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-Algorithm)

  Signature algorithm to be used.
  - certificate  
  ArrayBuffer

  The DER encoding of a X.509 certificate. The extension must sign `input` using the associated private key.
  - input  
  ArrayBuffer

  Data to be signed. Note that the data is not hashed.
  - signRequestId  
  number

Request identifier to be passed to [`reportSignature`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-reportSignature).  

### SignRequest

#### Properties

  - certificate  
  ArrayBuffer

  The DER encoding of a X.509 certificate. The extension must sign `digest` using the associated private key.
  - digest  
  ArrayBuffer

  The digest that must be signed.
  - hash  
  [Hash](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-Hash)

  Refers to the hash algorithm that was used to create `digest`.
  - signRequestId  
  number  
  Chrome 57+

The unique ID to be used by the extension should it need to call a method that requires it, e.g. requestPin.  

### StopPinRequestDetails

Chrome 57+  

#### Properties

  - errorType  
  [PinRequestErrorType](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-PinRequestErrorType) optional

  The error template. If present it is displayed to user. Intended to contain the reason for stopping the flow if it was caused by an error, e.g. MAX_ATTEMPTS_EXCEEDED.
  - signRequestId  
  number

  The ID given by Chrome in SignRequest.

## Methods

### reportSignature()

Chrome 86+

```typescript
chrome.certificateProvider.reportSignature(
  details: ReportSignatureDetails,
): Promise<void>
```

Should be called as a response to [`onSignatureRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onSignatureRequested).

The extension must eventually call this function for every [`onSignatureRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onSignatureRequested) event; the API implementation will stop waiting for this call after some time and respond with a timeout error when this function is called.  

#### Parameters

  - details  
[ReportSignatureDetails](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-ReportSignatureDetails)  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### requestPin()

Chrome 57+

```typescript
chrome.certificateProvider.requestPin(
  details: RequestPinDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-PinResponseDetails | undefined>
```

Requests the PIN from the user. Only one ongoing request at a time is allowed. The requests issued while another flow is ongoing are rejected. It's the extension's responsibility to try again later if another flow is in progress.  

#### Parameters

  - details  
  [RequestPinDetails](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-RequestPinDetails)

Contains the details about the requested dialog.  

#### Returns

  - Promise\<[PinResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-PinResponseDetails) \| undefined\>  
Chrome 96+  

### setCertificates()

Chrome 86+

```typescript
chrome.certificateProvider.setCertificates(
  details: SetCertificatesDetails,
): Promise<void>
```

Sets a list of certificates to use in the browser.

The extension should call this function after initialization and on every change in the set of currently available certificates. The extension should also call this function in response to [`onCertificatesUpdateRequested`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#event-onCertificatesUpdateRequested) every time this event is received.  

#### Parameters

  - details  
  [SetCertificatesDetails](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-SetCertificatesDetails)

The certificates to set. Invalid certificates will be ignored.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### stopPinRequest()

Chrome 57+

```typescript
chrome.certificateProvider.stopPinRequest(
  details: StopPinRequestDetails,
): Promise<void>
```

Stops the pin request started by the [`requestPin`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-requestPin) function.  

#### Parameters

  - details  
  [StopPinRequestDetails](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-StopPinRequestDetails)

Contains the details about the reason for stopping the request flow.  

#### Returns

  - Promise\<void\>  
  Chrome 96+

## Events

### onCertificatesUpdateRequested

Chrome 86+

```typescript
chrome.certificateProvider.onCertificatesUpdateRequested.addListener(
  callback: function,
)
```

This event fires if the certificates set via [`setCertificates`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates) are insufficient or the browser requests updated information. The extension must call [`setCertificates`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates) with the updated list of certificates and the received `certificatesRequestId`.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (request: CertificatesUpdateRequest) => void
  ```

  <br />

    - request  
[CertificatesUpdateRequest](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-CertificatesUpdateRequest)  

### onSignatureRequested

Chrome 86+

```typescript
chrome.certificateProvider.onSignatureRequested.addListener(
  callback: function,
)
```

This event fires every time the browser needs to sign a message using a certificate provided by this extension via [`setCertificates`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-setCertificates).

The extension must sign the input data from `request` using the appropriate algorithm and private key and return it by calling [`reportSignature`](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#method-reportSignature) with the received `signRequestId`.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (request: SignatureRequest) => void
  ```

  <br />

    - request  
    [SignatureRequest](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider#type-SignatureRequest)

<br />

---

## 11. contextMenus

*File: pages/contextMenus.md*

# chrome.contextMenus

<br />

<br />

## Description

Use the `chrome.contextMenus` API to add items to Google Chrome's context menu. You can choose what types of objects your context menu additions apply to, such as images, hyperlinks, and pages.

<br />

<br />

## Permissions

`contextMenus`  

<br />

<br />

<br />

You must declare the `"contextMenus"` permission in your extension's manifest to use the API. Also,
you should specify a 16 by 16-pixel icon for display next to your menu item. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "contextMenus"
      ],
      "icons": {
        "16": "icon-bitty.png",
        "48": "icon-small.png",
        "128": "icon-large.png"
      },
      ...
    }

## Concepts and usage

Context menu items can appear in any document (or frame within a document), even those with file://
or chrome:// URLs. To control which documents your items can appear in, specify the
`documentUrlPatterns` field when you call the `create()` or `update()` methods.

You can create as many context menu items as you need, but if more than one from your extension is
visible at once, Google Chrome automatically collapses them into a single parent menu.

## Examples

To try this API, install the [contextMenus API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/contextMenus) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

<br />

## Types

### ContextType

Chrome 44+

The different contexts a menu can appear in. Specifying 'all' is equivalent to the combination of all other contexts except for 'launcher'. The 'launcher' context is only supported by apps and is used to add menu items to the context menu that appears when clicking the app icon in the launcher/taskbar/dock/etc. Different platforms might put limitations on what is actually supported in a launcher context menu.  

#### Enum

"all"   
"page"   
"frame"   
"selection"   
"link"   
"editable"   
"image"   
"video"   
"audio"   
"launcher"   
"browser_action"   
"page_action"   
"action"   

<br />

### CreateProperties

Chrome 123+

Properties of the new context menu item.  

#### Properties

  - checked  
  boolean optional

  The initial state of a checkbox or radio button: `true` for selected, `false` for unselected. Only one radio button can be selected at a time in a given group.
  - contexts  
  \[[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType), ...[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType)\[\]\] optional

  List of contexts this menu item will appear in. Defaults to `['page']`.
  - documentUrlPatterns  
  string\[\] optional

  Restricts the item to apply only to documents or frames whose URL matches one of the given patterns. For details on pattern formats, see [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).
  - enabled  
  boolean optional

  Whether this context menu item is enabled or disabled. Defaults to `true`.
  - id  
  string optional

  The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension.
  - parentId  
  string \| number optional

  The ID of a parent menu item; this makes the item a child of a previously added item.
  - targetUrlPatterns  
  string\[\] optional

  Similar to `documentUrlPatterns`, filters based on the `src` attribute of `img`, `audio`, and `video` tags and the `href` attribute of `a` tags.
  - title  
  string optional

  The text to display in the item; this is *required* unless `type` is `separator`. When the context is `selection`, use `%s` within the string to show the selected text. For example, if this parameter's value is "Translate '%s' to Pig Latin" and the user selects the word "cool", the context menu item for the selection is "Translate 'cool' to Pig Latin".
  - type  
  [ItemType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ItemType) optional

  The type of menu item. Defaults to `normal`.
  - visible  
  boolean optional

  Whether the item is visible in the menu.
  - onclick  
  void optional

  A function that is called back when the menu item is clicked. This is not available inside of a service worker; instead, you should register a listener for [`contextMenus.onClicked`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked).


  The `onclick` function looks like:  

  ```typescript
  (info: OnClickData, tab: Tab) => {...}
  ```

  <br />

    - info  
    [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)

    Information about the item clicked and the context where the click happened.
    - tab  
    [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)

The details of the tab where the click took place. This parameter is not present for platform apps.  

### ItemType

Chrome 44+

The type of menu item.  

#### Enum

"normal"   
"checkbox"   
"radio"   
"separator"   

<br />

### OnClickData

Information sent when a context menu item is clicked.  

#### Properties

  - checked  
  boolean optional

  A flag indicating the state of a checkbox or radio item after it is clicked.
  - editable  
  boolean

  A flag indicating whether the element is editable (text input, textarea, etc.).
  - frameId  
  number optional  
  Chrome 51+

  The [ID of the frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) of the element where the context menu was clicked, if it was in a frame.
  - frameUrl  
  string optional

  The URL of the frame of the element where the context menu was clicked, if it was in a frame.
  - linkUrl  
  string optional

  If the element is a link, the URL it points to.
  - mediaType  
  string optional

  One of 'image', 'video', or 'audio' if the context menu was activated on one of these types of elements.
  - menuItemId  
  string \| number

  The ID of the menu item that was clicked.
  - pageUrl  
  string optional

  The URL of the page where the menu item was clicked. This property is not set if the click occured in a context where there is no current page, such as in a launcher context menu.
  - parentMenuItemId  
  string \| number optional

  The parent ID, if any, for the item clicked.
  - selectionText  
  string optional

  The text for the context selection, if any.
  - srcUrl  
  string optional

  Will be present for elements with a 'src' URL.
  - wasChecked  
  boolean optional

  A flag indicating the state of a checkbox or radio item before it was clicked.

## Properties

### ACTION_MENU_TOP_LEVEL_LIMIT

The maximum number of top level extension items that can be added to an extension action context menu. Any items beyond this limit will be ignored.  

#### Value

6   

## Methods

### create()

```typescript
chrome.contextMenus.create(
  createProperties: CreateProperties,
  callback?: function,
): number | string
```

Creates a new context menu item. If an error occurs during creation, it may not be detected until the creation callback fires; details will be in [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError).  

#### Parameters

  - createProperties  
  [CreateProperties](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-CreateProperties)
  - callback  
  function optional


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

#### Returns

- number \| string

The ID of the newly created item.  

### remove()

```typescript
chrome.contextMenus.remove(
  menuItemId: string | number,
): Promise<void>
```

Removes a context menu item.  

#### Parameters

  - menuItemId  
  string \| number

The ID of the context menu item to remove.  

#### Returns

  - Promise\<void\>  
Chrome 123+  

### removeAll()

```typescript
chrome.contextMenus.removeAll(): Promise<void>
```

Removes all context menu items added by this extension.  

#### Returns

  - Promise\<void\>  
Chrome 123+  

### update()

```typescript
chrome.contextMenus.update(
  id: string | number,
  updateProperties: object,
): Promise<void>
```

Updates a previously created context menu item.  

#### Parameters

  - id  
  string \| number

  The ID of the item to update.
  - updateProperties  
  object

  The properties to update. Accepts the same values as the [`contextMenus.create`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create) function.  
    - checked  
    boolean optional
    - contexts  
    \[[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType), ...[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType)\[\]\] optional
    - documentUrlPatterns  
    string\[\] optional
    - enabled  
    boolean optional
    - parentId  
    string \| number optional

    The ID of the item to be made this item's parent. Note: You cannot set an item to become a child of its own descendant.
    - targetUrlPatterns  
    string\[\] optional
    - title  
    string optional
    - type  
    [ItemType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ItemType) optional
    - visible  
    boolean optional  
    Chrome 62+

    Whether the item is visible in the menu.
    - onclick  
    void optional


    The `onclick` function looks like:  

    ```typescript
    (info: OnClickData, tab: Tab) => {...}
    ```

    <br />

      - info  
      [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)  
      Chrome 44+
      - tab  
      [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  
      Chrome 44+

The details of the tab where the click took place. This parameter is not present for platform apps.  

#### Returns

  - Promise\<void\>  
  Chrome 123+

## Events

### onClicked

```typescript
chrome.contextMenus.onClicked.addListener(
  callback: function,
)
```

Fired when a context menu item is clicked.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: OnClickData, tab?: tabs.Tab) => void
  ```

  <br />

    - info  
    [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)
    - tab  
    [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

<br />

---

## 12. cookies

*File: pages/cookies.md*

# chrome.debugger

<br />

<br />

## Description

The `chrome.debugger` API serves as an alternate transport for Chrome's [remote debugging protocol](https://developer.chrome.com/devtools/docs/debugger-protocol). Use `chrome.debugger` to attach to one or more tabs to instrument network interaction, debug JavaScript, mutate the DOM and CSS, and more. Use the [`Debuggee`](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-Debuggee) property `tabId` to target tabs with `sendCommand` and route events by `tabId` from `onEvent` callbacks.

<br />

<br />

## Permissions

`debugger`  

<br />

You must declare the `"debugger"` permission in your extension's manifest to use this API.  

    {
      "name": "My extension",
      ...
      "permissions": [
        "debugger",
      ],
      ...
    }

<br />

<br />

## Concepts and usage

Once attached, the `chrome.debugger` API lets you send [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
(CDP) commands to a given target. Explaining the CDP in depth is out of scope
for this documentation---to learn more about CDP check out the
[official CDP documentation](https://chromedevtools.github.io/devtools-protocol/).

### Targets

Targets represent something which is being debugged---this could include a tab,
an iframe or a worker. Each target is identified by a UUID and has an associated
type (such as `iframe`, `shared_worker`, and more).

Within a target, there may be multiple execution contexts---for example same
process iframes don't get a unique target but are instead represented as
different contexts that can be accessed from a single target.

### Restricted domains

For security reasons, the `chrome.debugger` API does not provide access to all Chrome DevTools
Protocol Domains. The available domains are: [Accessibility](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility),
[Audits](https://chromedevtools.github.io/devtools-protocol/tot/Audits), [CacheStorage](https://chromedevtools.github.io/devtools-protocol/tot/CacheStorage), [Console](https://chromedevtools.github.io/devtools-protocol/tot/Console),
[CSS](https://chromedevtools.github.io/devtools-protocol/tot/CSS/), [Database](https://chromedevtools.github.io/devtools-protocol/tot/Database), [Debugger](https://chromedevtools.github.io/devtools-protocol/tot/Debugger), [DOM](https://chromedevtools.github.io/devtools-protocol/tot/DOM),
[DOMDebugger](https://chromedevtools.github.io/devtools-protocol/tot/DOMDebugger), [DOMSnapshot](https://chromedevtools.github.io/devtools-protocol/tot/DOMSnapshot),
[Emulation](https://chromedevtools.github.io/devtools-protocol/tot/Emulation), [Fetch](https://chromedevtools.github.io/devtools-protocol/tot/Fetch), [IO](https://chromedevtools.github.io/devtools-protocol/tot/IO), [Input](https://chromedevtools.github.io/devtools-protocol/tot/Input),
[Inspector](https://chromedevtools.github.io/devtools-protocol/tot/Inspector), [Log](https://chromedevtools.github.io/devtools-protocol/tot/Log), [Network](https://chromedevtools.github.io/devtools-protocol/tot/Network), [Overlay](https://chromedevtools.github.io/devtools-protocol/tot/Overlay),
[Page](https://chromedevtools.github.io/devtools-protocol/tot/Page), [Performance](https://chromedevtools.github.io/devtools-protocol/tot/Performance), [Profiler](https://chromedevtools.github.io/devtools-protocol/tot/Profiler),
[Runtime](https://chromedevtools.github.io/devtools-protocol/tot/Runtime), [Storage](https://chromedevtools.github.io/devtools-protocol/tot/Storage), [Target](https://chromedevtools.github.io/devtools-protocol/tot/Target), [Tracing](https://chromedevtools.github.io/devtools-protocol/tot/Tracing),
[WebAudio](https://chromedevtools.github.io/devtools-protocol/tot/WebAudio), and [WebAuthn](https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn).

### Work with frames

There is not a one to one mapping of frames to targets. Within a single tab,
multiple same process frames may share the same target but use a different
[execution context](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-ExecutionContextId). On the other hand, a new target may be
created for an out-of-process iframe.

To attach to all frames, you need to handle each type of frame separately:

- Listen for the `Runtime.executionContextCreated` event to identify new
  execution contexts associated with same process frames.

- Follow the steps to [attach to related targets](https://developer.chrome.com/docs/extensions/reference/api/debugger#attach_to_related_targets) to
  identify out-of-process frames.

### Attach to related targets

After connecting to a target, you may want to connect to further related targets
including out-of-process child frames or associated workers.

Starting in Chrome 125, the `chrome.debugger` API supports flat sessions. This
lets you add additional targets as children to your main debugger session and
message them without needing another call to `chrome.debugger.attach`. Instead,
you can add a `sessionId` property when calling `chrome.debugger.sendCommand` to
identify the child target you would like to send a command to.

To automatically attach to out of process child frames, first add a listener for
the `Target.attachedToTarget` event:  

    chrome.debugger.onEvent.addListener((source, method, params) => {
      if (method === "Target.attachedToTarget") {
        // `source` identifies the parent session, but we need to construct a new
        // identifier for the child session
        const session = { ...source, sessionId: params.sessionId };

        // Call any needed CDP commands for the child session
        await chrome.debugger.sendCommand(session, "Runtime.enable");
      }
    });

Then, enable [auto attach](https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-setAutoAttach) by sending the `Target.setAutoAttach` command with
the `flatten` option set to `true`:  

    await chrome.debugger.sendCommand({ tabId }, "Target.setAutoAttach", {
      autoAttach: true,
      waitForDebuggerOnStart: false,
      flatten: true,
      filter: [{ type: "iframe", exclude: false }]
    });

Auto-attach only attaches to frames the target is aware of, which is limited to
frames which are immediate children of a frame associated with it. For example,
with the frame hierarchy A -\> B -\> C (where all are cross-origin), calling
`Target.setAutoAttach` for the target associated with A would result in the
session also being attached to B. However, this is not recursive, so
`Target.setAutoAttach` also needs to be called for B to attach the session to C.

## Examples

To try this API, install the [debugger API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/debugger) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

<br />

## Types

### Debuggee

Debuggee identifier. Either tabId, extensionId or targetId must be specified  

#### Properties

  - extensionId  
  string optional

  The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the `--silent-debugger-extension-api` command-line switch is used.
  - tabId  
  number optional

  The id of the tab which you intend to debug.
  - targetId  
  string optional

The opaque id of the debug target.  

### DebuggerSession

Chrome 125+

Debugger session identifier. One of tabId, extensionId or targetId must be specified. Additionally, an optional sessionId can be provided. If sessionId is specified for arguments sent from [`onEvent`](https://developer.chrome.com/docs/extensions/reference/api/debugger#event-onEvent), it means the event is coming from a child protocol session within the root debuggee session. If sessionId is specified when passed to [`sendCommand`](https://developer.chrome.com/docs/extensions/reference/api/debugger#method-sendCommand), it targets a child protocol session within the root debuggee session.  

#### Properties

  - extensionId  
  string optional

  The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the `--silent-debugger-extension-api` command-line switch is used.
  - sessionId  
  string optional

  The opaque id of the Chrome DevTools Protocol session. Identifies a child session within the root session identified by tabId, extensionId or targetId.
  - tabId  
  number optional

  The id of the tab which you intend to debug.
  - targetId  
  string optional

The opaque id of the debug target.  

### DetachReason

Chrome 44+

Connection termination reason.  

#### Enum

"target_closed"   
"canceled_by_user"   

<br />

### TargetInfo

Debug target information  

#### Properties

  - attached  
  boolean

  True if debugger is already attached.
  - extensionId  
  string optional

  The extension id, defined if type = 'background_page'.
  - faviconUrl  
  string optional

  Target favicon URL.
  - id  
  string

  Target id.
  - tabId  
  number optional

  The tab id, defined if type == 'page'.
  - title  
  string

  Target page title.
  - type  
  [TargetInfoType](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-TargetInfoType)

  Target type.
  - url  
  string

Target URL.  

### TargetInfoType

Chrome 44+

Target type.  

#### Enum

"page"   
"background_page"   
"worker"   
"other"   

<br />

## Methods

### attach()

```typescript
chrome.debugger.attach(
  target: Debuggee,
  requiredVersion: string,
): Promise<void>
```

Attaches debugger to the given target.  

#### Parameters

  - target  
  [Debuggee](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-Debuggee)

  Debugging target to which you want to attach.
  - requiredVersion  
  string

Required debugging protocol version ("0.1"). One can only attach to the debuggee with matching major version and greater or equal minor version. List of the protocol versions can be obtained [here](https://developer.chrome.com/devtools/docs/debugger-protocol).  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### detach()

```typescript
chrome.debugger.detach(
  target: Debuggee,
): Promise<void>
```

Detaches debugger from the given target.  

#### Parameters

  - target  
  [Debuggee](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-Debuggee)

Debugging target from which you want to detach.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### getTargets()

```typescript
chrome.debugger.getTargets(): Promise<https://developer.chrome.com/docs/extensions/reference/api/debugger#type-TargetInfo[]>
```

Returns the list of available debug targets.  

#### Returns

  - Promise\<[TargetInfo](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-TargetInfo)\[\]\>  
Chrome 96+  

### sendCommand()

```typescript
chrome.debugger.sendCommand(
  target: DebuggerSession,
  method: string,
  commandParams?: object,
): Promise<object | undefined>
```

Sends given command to the debugging target.  

#### Parameters

  - target  
  [DebuggerSession](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-DebuggerSession)

  Debugging target to which you want to send the command.
  - method  
  string

  Method name. Should be one of the methods defined by the [remote debugging protocol](https://developer.chrome.com/devtools/docs/debugger-protocol).
  - commandParams  
  object optional

JSON object with request parameters. This object must conform to the remote debugging params scheme for given method.  

#### Returns

  - Promise\<object \| undefined\>  
  Chrome 96+

## Events

### onDetach

```typescript
chrome.debugger.onDetach.addListener(
  callback: function,
)
```

Fired when browser terminates debugging session for the tab. This happens when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (source: Debuggee, reason: DetachReason) => void
  ```

  <br />

    - source  
    [Debuggee](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-Debuggee)
    - reason  
[DetachReason](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-DetachReason)  

### onEvent

```typescript
chrome.debugger.onEvent.addListener(
  callback: function,
)
```

Fired whenever debugging target issues instrumentation event.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (source: DebuggerSession, method: string, params?: object) => void
  ```

  <br />

    - source  
    [DebuggerSession](https://developer.chrome.com/docs/extensions/reference/api/debugger#type-DebuggerSession)
    - method  
    string
    - params  
    object optional

<br />

---

## 13. debugger

*File: pages/debugger.md*

# chrome.contextMenus

<br />

<br />

## Description

Use the `chrome.contextMenus` API to add items to Google Chrome's context menu. You can choose what types of objects your context menu additions apply to, such as images, hyperlinks, and pages.

<br />

<br />

## Permissions

`contextMenus`  

<br />

<br />

<br />

You must declare the `"contextMenus"` permission in your extension's manifest to use the API. Also,
you should specify a 16 by 16-pixel icon for display next to your menu item. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "contextMenus"
      ],
      "icons": {
        "16": "icon-bitty.png",
        "48": "icon-small.png",
        "128": "icon-large.png"
      },
      ...
    }

## Concepts and usage

Context menu items can appear in any document (or frame within a document), even those with file://
or chrome:// URLs. To control which documents your items can appear in, specify the
`documentUrlPatterns` field when you call the `create()` or `update()` methods.

You can create as many context menu items as you need, but if more than one from your extension is
visible at once, Google Chrome automatically collapses them into a single parent menu.

## Examples

To try this API, install the [contextMenus API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/contextMenus) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

<br />

## Types

### ContextType

Chrome 44+

The different contexts a menu can appear in. Specifying 'all' is equivalent to the combination of all other contexts except for 'launcher'. The 'launcher' context is only supported by apps and is used to add menu items to the context menu that appears when clicking the app icon in the launcher/taskbar/dock/etc. Different platforms might put limitations on what is actually supported in a launcher context menu.  

#### Enum

"all"   
"page"   
"frame"   
"selection"   
"link"   
"editable"   
"image"   
"video"   
"audio"   
"launcher"   
"browser_action"   
"page_action"   
"action"   

<br />

### CreateProperties

Chrome 123+

Properties of the new context menu item.  

#### Properties

  - checked  
  boolean optional

  The initial state of a checkbox or radio button: `true` for selected, `false` for unselected. Only one radio button can be selected at a time in a given group.
  - contexts  
  \[[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType), ...[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType)\[\]\] optional

  List of contexts this menu item will appear in. Defaults to `['page']`.
  - documentUrlPatterns  
  string\[\] optional

  Restricts the item to apply only to documents or frames whose URL matches one of the given patterns. For details on pattern formats, see [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).
  - enabled  
  boolean optional

  Whether this context menu item is enabled or disabled. Defaults to `true`.
  - id  
  string optional

  The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension.
  - parentId  
  string \| number optional

  The ID of a parent menu item; this makes the item a child of a previously added item.
  - targetUrlPatterns  
  string\[\] optional

  Similar to `documentUrlPatterns`, filters based on the `src` attribute of `img`, `audio`, and `video` tags and the `href` attribute of `a` tags.
  - title  
  string optional

  The text to display in the item; this is *required* unless `type` is `separator`. When the context is `selection`, use `%s` within the string to show the selected text. For example, if this parameter's value is "Translate '%s' to Pig Latin" and the user selects the word "cool", the context menu item for the selection is "Translate 'cool' to Pig Latin".
  - type  
  [ItemType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ItemType) optional

  The type of menu item. Defaults to `normal`.
  - visible  
  boolean optional

  Whether the item is visible in the menu.
  - onclick  
  void optional

  A function that is called back when the menu item is clicked. This is not available inside of a service worker; instead, you should register a listener for [`contextMenus.onClicked`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked).


  The `onclick` function looks like:  

  ```typescript
  (info: OnClickData, tab: Tab) => {...}
  ```

  <br />

    - info  
    [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)

    Information about the item clicked and the context where the click happened.
    - tab  
    [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)

The details of the tab where the click took place. This parameter is not present for platform apps.  

### ItemType

Chrome 44+

The type of menu item.  

#### Enum

"normal"   
"checkbox"   
"radio"   
"separator"   

<br />

### OnClickData

Information sent when a context menu item is clicked.  

#### Properties

  - checked  
  boolean optional

  A flag indicating the state of a checkbox or radio item after it is clicked.
  - editable  
  boolean

  A flag indicating whether the element is editable (text input, textarea, etc.).
  - frameId  
  number optional  
  Chrome 51+

  The [ID of the frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) of the element where the context menu was clicked, if it was in a frame.
  - frameUrl  
  string optional

  The URL of the frame of the element where the context menu was clicked, if it was in a frame.
  - linkUrl  
  string optional

  If the element is a link, the URL it points to.
  - mediaType  
  string optional

  One of 'image', 'video', or 'audio' if the context menu was activated on one of these types of elements.
  - menuItemId  
  string \| number

  The ID of the menu item that was clicked.
  - pageUrl  
  string optional

  The URL of the page where the menu item was clicked. This property is not set if the click occured in a context where there is no current page, such as in a launcher context menu.
  - parentMenuItemId  
  string \| number optional

  The parent ID, if any, for the item clicked.
  - selectionText  
  string optional

  The text for the context selection, if any.
  - srcUrl  
  string optional

  Will be present for elements with a 'src' URL.
  - wasChecked  
  boolean optional

  A flag indicating the state of a checkbox or radio item before it was clicked.

## Properties

### ACTION_MENU_TOP_LEVEL_LIMIT

The maximum number of top level extension items that can be added to an extension action context menu. Any items beyond this limit will be ignored.  

#### Value

6   

## Methods

### create()

```typescript
chrome.contextMenus.create(
  createProperties: CreateProperties,
  callback?: function,
): number | string
```

Creates a new context menu item. If an error occurs during creation, it may not be detected until the creation callback fires; details will be in [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError).  

#### Parameters

  - createProperties  
  [CreateProperties](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-CreateProperties)
  - callback  
  function optional


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

#### Returns

- number \| string

The ID of the newly created item.  

### remove()

```typescript
chrome.contextMenus.remove(
  menuItemId: string | number,
): Promise<void>
```

Removes a context menu item.  

#### Parameters

  - menuItemId  
  string \| number

The ID of the context menu item to remove.  

#### Returns

  - Promise\<void\>  
Chrome 123+  

### removeAll()

```typescript
chrome.contextMenus.removeAll(): Promise<void>
```

Removes all context menu items added by this extension.  

#### Returns

  - Promise\<void\>  
Chrome 123+  

### update()

```typescript
chrome.contextMenus.update(
  id: string | number,
  updateProperties: object,
): Promise<void>
```

Updates a previously created context menu item.  

#### Parameters

  - id  
  string \| number

  The ID of the item to update.
  - updateProperties  
  object

  The properties to update. Accepts the same values as the [`contextMenus.create`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create) function.  
    - checked  
    boolean optional
    - contexts  
    \[[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType), ...[ContextType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType)\[\]\] optional
    - documentUrlPatterns  
    string\[\] optional
    - enabled  
    boolean optional
    - parentId  
    string \| number optional

    The ID of the item to be made this item's parent. Note: You cannot set an item to become a child of its own descendant.
    - targetUrlPatterns  
    string\[\] optional
    - title  
    string optional
    - type  
    [ItemType](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ItemType) optional
    - visible  
    boolean optional  
    Chrome 62+

    Whether the item is visible in the menu.
    - onclick  
    void optional


    The `onclick` function looks like:  

    ```typescript
    (info: OnClickData, tab: Tab) => {...}
    ```

    <br />

      - info  
      [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)  
      Chrome 44+
      - tab  
      [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)  
      Chrome 44+

The details of the tab where the click took place. This parameter is not present for platform apps.  

#### Returns

  - Promise\<void\>  
  Chrome 123+

## Events

### onClicked

```typescript
chrome.contextMenus.onClicked.addListener(
  callback: function,
)
```

Fired when a context menu item is clicked.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: OnClickData, tab?: tabs.Tab) => void
  ```

  <br />

    - info  
    [OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData)
    - tab  
    [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

<br />

---

## 14. declarativeContent

*File: pages/declarativeContent.md*

# chrome.desktopCapture

<br />

<br />

## Description

The Desktop Capture API captures the content of the screen, individual windows, or individual tabs.

<br />

<br />

## Permissions

`desktopCapture`  

<br />

<br />

<br />

<br />

## Types

### DesktopCaptureSourceType

Enum used to define set of desktop media sources used in chooseDesktopMedia().  

#### Enum

"screen"   
"window"   
"tab"   
"audio"   

<br />

### SelfCapturePreferenceEnum

Chrome 107+

Mirrors [SelfCapturePreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-selfcapturepreferenceenum).  

#### Enum

"include"   
"exclude"   

<br />

### SystemAudioPreferenceEnum

Chrome 105+

Mirrors [SystemAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-systemaudiopreferenceenum).  

#### Enum

"include"   
"exclude"   

<br />

### WindowAudioPreferenceEnum

Chrome 140+

Mirrors [WindowAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-windowaudiopreferenceenum).  

#### Enum

"system"   
"window"   
"exclude"   

<br />

## Methods

### cancelChooseDesktopMedia()

```typescript
chrome.desktopCapture.cancelChooseDesktopMedia(
  desktopMediaRequestId: number,
): void
```

Hides desktop media picker dialog shown by chooseDesktopMedia().  

#### Parameters

  - desktopMediaRequestId  
  number

Id returned by chooseDesktopMedia()  

### chooseDesktopMedia()

```typescript
chrome.desktopCapture.chooseDesktopMedia(
  sources: DesktopCaptureSourceType[],
  targetTab?: Tab,
  callback: function,
): number
```

Shows desktop media picker UI with the specified set of sources.  

#### Parameters

  - sources  
  [DesktopCaptureSourceType](https://developer.chrome.com/docs/extensions/reference/api/desktopCapture#type-DesktopCaptureSourceType)\[\]

  Set of sources that should be shown to the user. The sources order in the set decides the tab order in the picker.
  - targetTab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  Optional tab for which the stream is created. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches `tab.url`. The tab's origin must be a secure origin, e.g. HTTPS.
  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (streamId: string, options: object) => void
  ```

  <br />

    - streamId  
    string

    An opaque string that can be passed to `getUserMedia()` API to generate media stream that corresponds to the source selected by the user. If user didn't select any source (i.e. canceled the prompt) then the callback is called with an empty `streamId`. The created `streamId` can be used only once and expires after a few seconds when it is not used.
    - options  
    object  
    Chrome 57+

    Contains properties that describe the stream.  
      - canRequestAudioTrack  
      boolean

True if "audio" is included in parameter sources, and the end user does not uncheck the "Share audio" checkbox. Otherwise false, and in this case, one should not ask for audio stream through getUserMedia call.  

#### Returns

- number

  An id that can be passed to cancelChooseDesktopMedia() in case the prompt need to be canceled.

<br />

---

## 15. declarativeNetRequest

*File: pages/declarativeNetRequest.md*

# chrome.dns

<br />

<br />

## Description

Use the `chrome.dns` API for dns resolution.

<br />

<br />

## Permissions

`dns`  

<br />

<br />

## Availability

Dev channel

<br />

<br />

To use this API, you must declare the `"dns"` permission in the [manifest](https://developer.chrome.com/docs/extensions/mv3/manifest).  

    {
      "name": "My extension",
      ...
      "permissions": [
        "dns"
      ],
      ...
    }

| **Note:** This API is only available in [Chrome Dev](https://www.google.com/chrome/dev/). There are no foreseeable plans to move this API from the dev channel into Chrome stable.

## Usage

The following code calls [`resolve()`](https://developer.chrome.com/docs/extensions/reference/api/dns#method-resolve) to retrieve the IP address of `example.com`.

service-worker.js:  

    const resolveDNS = async () => {
        let record = await chrome.dns.resolve('example.com');
        console.log(record.address); // "192.0.2.172"
    };

    resolveDNS();

| **Key point:** Do not include the scheme or trailing slash in the hostname. For example, `https://example.com/` is invalid.

<br />

## Types

### ResolveCallbackResolveInfo

#### Properties

  - address  
  string optional

  A string representing the IP address literal. Supplied only if resultCode indicates success.
  - resultCode  
  number

  The result code. Zero indicates success.

## Methods

### resolve()

```typescript
chrome.dns.resolve(
  hostname: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/dns#type-ResolveCallbackResolveInfo>
```

Resolves the given hostname or IP address literal.  

#### Parameters

  - hostname  
  string

The hostname to resolve.  

#### Returns

- Promise\<[ResolveCallbackResolveInfo](https://developer.chrome.com/docs/extensions/reference/api/dns#type-ResolveCallbackResolveInfo)\>

<br />

---

## 16. desktopCapture

*File: pages/desktopCapture.md*

# chrome.desktopCapture

<br />

<br />

## Description

The Desktop Capture API captures the content of the screen, individual windows, or individual tabs.

<br />

<br />

## Permissions

`desktopCapture`  

<br />

<br />

<br />

<br />

## Types

### DesktopCaptureSourceType

Enum used to define set of desktop media sources used in chooseDesktopMedia().  

#### Enum

"screen"   
"window"   
"tab"   
"audio"   

<br />

### SelfCapturePreferenceEnum

Chrome 107+

Mirrors [SelfCapturePreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-selfcapturepreferenceenum).  

#### Enum

"include"   
"exclude"   

<br />

### SystemAudioPreferenceEnum

Chrome 105+

Mirrors [SystemAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-systemaudiopreferenceenum).  

#### Enum

"include"   
"exclude"   

<br />

### WindowAudioPreferenceEnum

Chrome 140+

Mirrors [WindowAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-windowaudiopreferenceenum).  

#### Enum

"system"   
"window"   
"exclude"   

<br />

## Methods

### cancelChooseDesktopMedia()

```typescript
chrome.desktopCapture.cancelChooseDesktopMedia(
  desktopMediaRequestId: number,
): void
```

Hides desktop media picker dialog shown by chooseDesktopMedia().  

#### Parameters

  - desktopMediaRequestId  
  number

Id returned by chooseDesktopMedia()  

### chooseDesktopMedia()

```typescript
chrome.desktopCapture.chooseDesktopMedia(
  sources: DesktopCaptureSourceType[],
  targetTab?: Tab,
  callback: function,
): number
```

Shows desktop media picker UI with the specified set of sources.  

#### Parameters

  - sources  
  [DesktopCaptureSourceType](https://developer.chrome.com/docs/extensions/reference/api/desktopCapture#type-DesktopCaptureSourceType)\[\]

  Set of sources that should be shown to the user. The sources order in the set decides the tab order in the picker.
  - targetTab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  Optional tab for which the stream is created. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches `tab.url`. The tab's origin must be a secure origin, e.g. HTTPS.
  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (streamId: string, options: object) => void
  ```

  <br />

    - streamId  
    string

    An opaque string that can be passed to `getUserMedia()` API to generate media stream that corresponds to the source selected by the user. If user didn't select any source (i.e. canceled the prompt) then the callback is called with an empty `streamId`. The created `streamId` can be used only once and expires after a few seconds when it is not used.
    - options  
    object  
    Chrome 57+

    Contains properties that describe the stream.  
      - canRequestAudioTrack  
      boolean

True if "audio" is included in parameter sources, and the end user does not uncheck the "Share audio" checkbox. Otherwise false, and in this case, one should not ask for audio stream through getUserMedia call.  

#### Returns

- number

  An id that can be passed to cancelChooseDesktopMedia() in case the prompt need to be canceled.

<br />

---

## 17. dns

*File: pages/dns.md*

# chrome.dns

<br />

<br />

## Description

Use the `chrome.dns` API for dns resolution.

<br />

<br />

## Permissions

`dns`  

<br />

<br />

## Availability

Dev channel

<br />

<br />

To use this API, you must declare the `"dns"` permission in the [manifest](https://developer.chrome.com/docs/extensions/mv3/manifest).  

    {
      "name": "My extension",
      ...
      "permissions": [
        "dns"
      ],
      ...
    }

| **Note:** This API is only available in [Chrome Dev](https://www.google.com/chrome/dev/). There are no foreseeable plans to move this API from the dev channel into Chrome stable.

## Usage

The following code calls [`resolve()`](https://developer.chrome.com/docs/extensions/reference/api/dns#method-resolve) to retrieve the IP address of `example.com`.

service-worker.js:  

    const resolveDNS = async () => {
        let record = await chrome.dns.resolve('example.com');
        console.log(record.address); // "192.0.2.172"
    };

    resolveDNS();

| **Key point:** Do not include the scheme or trailing slash in the hostname. For example, `https://example.com/` is invalid.

<br />

## Types

### ResolveCallbackResolveInfo

#### Properties

  - address  
  string optional

  A string representing the IP address literal. Supplied only if resultCode indicates success.
  - resultCode  
  number

  The result code. Zero indicates success.

## Methods

### resolve()

```typescript
chrome.dns.resolve(
  hostname: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/dns#type-ResolveCallbackResolveInfo>
```

Resolves the given hostname or IP address literal.  

#### Parameters

  - hostname  
  string

The hostname to resolve.  

#### Returns

- Promise\<[ResolveCallbackResolveInfo](https://developer.chrome.com/docs/extensions/reference/api/dns#type-ResolveCallbackResolveInfo)\>

<br />

---

## 18. documentScan

*File: pages/documentScan.md*

# chrome.documentScan

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.documentScan` API to discover and retrieve images from attached document scanners.

<br />

The Document Scan API is designed to allow apps and extensions to view the
content of paper documents on an attached document scanner.

<br />

## Permissions

`documentScan`  

<br />

<br />

## Availability

Chrome 44+ ChromeOS only
Availability for API members added later is shown with those members.

<br />

<br />

## Concepts and usage

This API supports two means of scanning documents. If your use case can work
with any scanner and doesn't require control of the configuration, use the
`scan()` method. More complicated use cases require a combination of methods,
which are only supported in Chrome 124 and later.

### Simple scanning

For simple use cases, meaning those that can work with any scanner and don't
require control of configuration, call `scan()`. This method takes a
`ScanOptions` object and returns a Promise that resolves with a `ScanResults`
object. The capabilities of this option are limited to the number of scans and
the MIME types that will be accepted by the caller. Scans are returned as URLs
for display in an `<img>` tag for a user interface.

### Complex scanning

Complex scans are accomplished in three phases as described in this section.
This outline does not describe every method argument or every property returned
in a response. It is only intended to give you a general guide to writing scanner
code.
| **Note:** Calling [`openScanner()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openscanner), [`getScannerList()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-getscannerlist), or [`startScan()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-startscan) more than once will cancel operations initiated by previous calls to these methods. See the descriptions of these methods for specifics.

#### Discovery

1. Call [`getScannerList()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-getscannerlist). Available scanners are
   returned in a Promise that resolves with a
   [`GetScannerListResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-getscannerlistresponse).

   - The response object contains an array of [`ScannerInfo`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-scannerinfo) objects.
   - The array may contain multiple entries for a single scanner if that scanner supports multiple protocols or connection methods.
2. Select a scanner from the returned array and save the value of its
   `scannerId` property.

   Use the properties of individual `ScannerInfo` objects
   to distinguish among multiple objects for the same scanner. Objects from the
   same scanner will have the same value for the `deviceUuid` property.
   `ScannerInfo` also contains an `imageFormats` property containing an array of
   supported image types.

#### Scanner configuration

1. Call [`openScanner()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openscanner), passing in the saved scanner ID.
   It returns a Promise that resolves with an [`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-openscannerresponse).
   The response object contains:

   - A `scannerHandle` property, which you'll need to save.

   - An options property containing scanner-specific properties, which you'll
     need to set. See Retrieve scanner options for more information.

2. (Optional) If you need the user to provide values for scanner options,
   construct a user interface. You will need the scanner options provided by the
   previous step, and you'll need to retrieve option groups provided by the
   scanner. See [Construct a user interface](https://developer.chrome.com/docs/extensions/develop/ui) for more information.

3. Construct an array of [`OptionSetting`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-optionsetting) objects using
   programmatic or user-provided values. See Set scanner options for more
   information.

4. Pass the array of `OptionSetting` objects to
   [`setOptions()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-setoptions) to set options for the scanner. It
   returns a Promise that resolves with a
   [`SetOptionsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-setoptionsresponse). This object contains an
   updated version of the scanner options retrieved in step 1 of scanner
   configuration.

   Since changing one
   option can alter constraints on another option, you may need to repeat these
   steps several times.

#### Scanning

1. Construct a [`StartScanOptions`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-startscanoptions) object and pass it
   to [`startScan()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-startscan). It returns a Promise that resolves
   with a [`StartScanResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-startscanresponse). Its `job` property is
   a handle that you will use to either read scan data or cancel the scan.

2. Pass the job handle to [`readScanData()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-readscandata). It returns a
   Promise that resolves with a
   [`ReadScanDataResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-readscandataresponse) object. If data was read
   successfully, its `result` property equals `SUCCESS` and its `data` property
   contains an
   [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
   with part of the scan. Note that `estimatedCompletion` contains an estimated
   percentage of the total data that has been delivered so far.

   | **Note:** If `result` is `SUCCESS`, but `data` is empty, delay briefly before calling `readScanData()` again.
3. Repeat the previous step until the `result` property equals `EOF` or an error.

When the end of the scan is reached, call
[`closeScanner()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-closescanner) with the scanner handle saved in step
3. It returns a Promise that resolves with a
[`CloseScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-closescannerresponse). Calling
[`cancelScan()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-cancelscan) at any time after the job is created will
end scanning.

### Response objects

All methods return a Promise that resolves with a response object of some kind.
Most of these contain a `result` property whose value is a member of
[`OperationResult`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-operationresult). Some properties of response objects
won't contain values unless the value of `result` has a specific value. These
relationships are described in the reference for each response object.

For example, `OpenScannerResponse.scannerHandle` will only have a value when
`OpenScannerResponse.result` equals `SUCCESS`.

### Scanner options

Scanner options vary considerably by device. Consequently, it's not possible to
reflect scanner options directly within the documentScan API. To get around
this, the [`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-openscannerresponse) (retrieved using
[`openScanner()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openscanner)) and the
[`SetOptionsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-setoptionsresponse) (the response object for
[`setOptions()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-setoptions)) contain an `options` property which is an
object containing scanner-specific options. Each option is a key-value mapping
where the key is a device-specific option and the value is an instance of
[`ScannerOption`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-scanneroption).

The structure generally looks like this:  

    {
      "key1": { scannerOptionInstance }
      "key2": { scannerOptionInstance }
    }

For example, imagine a scanner that returns options named "source" and
"resolution". The structure of the returned `options` object will look something
like the following example. For simplicity, only partial `ScannerOption`
responses are shown.  

    {
      "source": {
        "name": "source",
        "type": OptionType.STRING,
    ...
    },
      "resolution": {
        "name": "resolution",
        "type": OptionType.INT,
    ...
      },
    ...
    }

### Construct a user interface

Though not required to use this API, you may want a user to choose the value for
a particular option. This requires a user interface. Use the
[`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-openscannerresponse) (opened by
[`openScanner()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-openscanner)) to retrieve the options for the attached
scanner as described in the previous section.

Some scanners group options in device-specific ways. They don't affect option
behaviors, but since these groups may be mentioned in a scanner's product
documentation, such groups should be shown to the user. You can retrieve these
groups by calling [`getOptionGroups()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-getoptionsgroup). This returns a
Promise that resolves with a
[`GetOptionGroupsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-getoptiongroupsreponse) object. Its `groups`
property contains a scanner-specific array of groups. Use the information in
these groups to organize the options in the
[`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-openscannerresponse) for display.  

    {
      scannerHandle: "123456",
      result: SUCCESS,
      groups: [
        {
          title: "Standard",
          members: [ "resolution", "mode", "source" ]
        }
      ]
    }

As stated under Scanner configuration, changing one option can alter constraints
on another option. This is why
[`setOptionsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-setoptionsresponse) (the response object for
[`setOptions()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-setoptions)) contains another `options` property. Use
this to update the user interface. Then repeat as needed until all options are
set.

### Set scanner options

Set scanner options by passing an array of
[`OptionSetting`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-optionsetting) objects to
[`setOptions()`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-setoptions). For an example, see the following [Scan one letter-size page](https://developer.chrome.com/docs/extensions/reference/api/documentScan#scan_one_letter-size_page) section.

## Examples

### Retrieve a page as a blob

This example shows one way to retrieve a page from the scanner as a blob and
demonstrates use of `startScan()` and `readScanData()` using the value of
`OperationResult`.  

    async function pageAsBlob(handle) {
      let response = await chrome.documentScan.startScan(
          handle, {format: "image/jpeg"});
      if (response.result != chrome.documentScan.OperationResult.SUCCESS) {
        return null;
      }
      const job = response.job;

      let imgParts = [];
      response = await chrome.documentScan.readScanData(job);
      while (response.result == chrome.documentScan.OperationResult.SUCCESS) {
        if (response.data && response.data.byteLength > 0) {
            imgParts.push(response.data);
        } else {
          // Delay so hardware can make progress.
          await new Promise(r => setTimeout(r, 100));
        }
        response = await chrome.documentScan.readScanData(job);
      }
      if (response.result != chrome.documentScan.OperationResult.EOF) {
        return null;
      }
      if (response.data && response.data.byteLength > 0) {
        imgParts.push(response.data);
      }
      return new Blob(imgParts, { type: "image/jpeg" });
    }

### Scan one letter-size page

This example shows how to select a scanner, set its options, and open it. It
then retrieves the contents of a single page and closes the scanner. This process
demonstrates using `getScannerList()`, `openScanner()`, `setOptions()`, and
`closeScanner()`. Note that the contents of the page are retrieved by calling
the `pageAsBlob()` function from the previous example.  

    async function scan() {
        let response = await chrome.documentScan.getScannerList({ secure: true });
        let scanner = await chrome.documentScan.openScanner(
            response.scanners[0].scannerId);
        const handle = scanner.scannerHandle;

        let options = [];
        for (source of scanner.options["source"].constraint.list) {
            if (source.includes("ADF")) {
                options.push({
                    name: "source",
                    type: chrome.documentScan.OptionType.STRING,
                    value: { value: source }
                });
                break;
            }
        }
        options.push({
            name: "tl-x",
            type: chrome.documentScan.OptionType.FIXED,
            value: 0.0
        });
        options.push({
            name: "br-x",
            type: chrome.documentScan.OptionType.FIXED,
            value: 215.9  // 8.5" in mm
        });
        options.push({
            name: "tl-y",
            type: chrome.documentScan.OptionType.FIXED,
            value: 0.0
        });
        options.push({
            name: "br-y",
            type: chrome.documentScan.OptionType.FIXED,
            value: 279.4  // 11" in mm
        });
        response = await chrome.documentScan.setOptions(handle, options);

        let imgBlob = await pageAsBlob(handle);
        if (imgBlob != null) {
            // Insert imgBlob into DOM, save to disk, etc
        }
        await chrome.documentScan.closeScanner(handle);
    }

### Show the configuration

As stated elsewhere, showing a scanner's configuration options to a user requires
calling `getOptionGroups()` in addition to the scanner options returned from a
call to `openScanner()`. This is so that options can be shown to users in
manufacturer-defined groups. This example shows how to do that.  

    async function showConfig() {
      let response = await chrome.documentScan.getScannerList({ secure: true });
      let scanner = await chrome.documentScan.openScanner(
          response.scanners[0].scannerId);
      let groups = await chrome.documentScan.getOptionGroups(scanner.scannerHandle);

      for (const group of groups.groups) {
        console.log("=== " + group.title + " ===");
        for (const member of group.members) {
          const option = scanner.options[member];
          if (option.isActive) {
            console.log("  " + option.name + " = " + option.value);
          } else {
            console.log("  " + option.name + " is inactive");
          }
        }
      }
    }

<br />

## Types

### CancelScanResponse

Chrome 125+  

#### Properties

  - job  
  string

  Provides the same job handle that was passed to `cancelScan()`.
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

The backend's cancel scan result. If the result is `OperationResult.SUCCESS` or `OperationResult.CANCELLED`, the scan has been cancelled and the scanner is ready to start a new scan. If the result is `OperationResult.DEVICE_BUSY` , the scanner is still processing the requested cancellation; the caller should wait a short time and try the request again. Other result values indicate a permanent error that should not be retried.  

### CloseScannerResponse

Chrome 125+  

#### Properties

  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

  The result of closing the scanner. Even if this value is not `SUCCESS`, the handle will be invalid and should not be used for any further operations.
  - scannerHandle  
  string

The same scanner handle as was passed to [`closeScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-closeScanner).  

### Configurability

Chrome 125+

How an option can be changed.  

#### Enum

"NOT_CONFIGURABLE"   
The option is read-only.
"SOFTWARE_CONFIGURABLE"   
The option can be set in software.
"HARDWARE_CONFIGURABLE"   
The option can be set by the user toggling or pushing a button on the scanner.

<br />

### ConnectionType

Chrome 125+

Indicates how the scanner is connected to the computer.  

#### Enum

"UNSPECIFIED"   
"USB"   
"NETWORK"   

<br />

### ConstraintType

Chrome 125+

The data type of constraint represented by an [`OptionConstraint`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionConstraint).  

#### Enum

"INT_RANGE"   
The constraint on a range of `OptionType.INT` values. The `min`, `max`, and `quant` properties of `OptionConstraint` will be `long`, and its `list` propety will be unset.
"FIXED_RANGE"   
The constraint on a range of `OptionType.FIXED` values. The `min`, `max`, and `quant` properties of `OptionConstraint` will be `double`, and its `list` property will be unset.
"INT_LIST"   
The constraint on a specific list of `OptionType.INT` values. The `OptionConstraint.list` property will contain `long` values, and the other properties will be unset.
"FIXED_LIST"   
The constraint on a specific list of `OptionType.FIXED` values. The `OptionConstraint.list` property will contain `double` values, and the other properties will be unset.
"STRING_LIST"   
The constraint on a specific list of `OptionType.STRING` values. The `OptionConstraint.list` property will contain `DOMString` values, and the other properties will be unset.

<br />

### DeviceFilter

Chrome 125+  

#### Properties

  - local  
  boolean optional

  Only return scanners that are directly attached to the computer.
  - secure  
  boolean optional

Only return scanners that use a secure transport, such as USB or TLS.  

### GetOptionGroupsResponse

Chrome 125+  

#### Properties

  - groups  
  [OptionGroup](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionGroup)\[\] optional

  If `result` is `SUCCESS`, provides a list of option groups in the order supplied by the scanner driver.
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

  The result of getting the option groups. If the value of this is `SUCCESS`, the `groups` property will be populated.
  - scannerHandle  
  string

The same scanner handle as was passed to [`getOptionGroups`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-getOptionGroups).  

### GetScannerListResponse

Chrome 125+  

#### Properties

  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

  The enumeration result. Note that partial results could be returned even if this indicates an error.
  - scanners  
  [ScannerInfo](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScannerInfo)\[\]

A possibly-empty list of scanners that match the provided [`DeviceFilter`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-DeviceFilter).  

### OpenScannerResponse

Chrome 125+  

#### Properties

  - options  
  object optional

  If `result` is `SUCCESS`, provides a key-value mapping where the key is a device-specific option and the value is an instance of [`ScannerOption`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScannerOption).
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

  The result of opening the scanner. If the value of this is `SUCCESS`, the `scannerHandle` and `options` properties will be populated.
  - scannerHandle  
  string optional

  If `result` is `SUCCESS`, a handle to the scanner that can be used for further operations.
  - scannerId  
  string

The scanner ID passed to `openScanner()`.  

### OperationResult

Chrome 125+

An enum that indicates the result of each operation.  

#### Enum

"UNKNOWN"   
An unknown or generic failure occurred.
"SUCCESS"   
The operation succeeded.
"UNSUPPORTED"   
The operation is not supported.
"CANCELLED"   
The operation was cancelled.
"DEVICE_BUSY"   
The device is busy.
"INVALID"   
Either the data or an argument passed to the method is not valid.
"WRONG_TYPE"   
The supplied value is the wrong data type for the underlying option.
"EOF"   
No more data is available.
"ADF_JAMMED"   
The document feeder is jammed.
"ADF_EMPTY"   
The document feeder is empty.
"COVER_OPEN"   
The flatbed cover is open.
"IO_ERROR"   
An error occurred while communicating with the device.
"ACCESS_DENIED"   
The device requires authentication.
"NO_MEMORY"   
Not enough memory is available on the Chromebook to complete the operation.
"UNREACHABLE"   
The device is not reachable.
"MISSING"   
The device is disconnected.
"INTERNAL_ERROR"   
An error has occurred somewhere other than the calling application.

<br />

### OptionConstraint

Chrome 125+  

#### Properties

  - list  
  string\[\] \| number\[\] optional
  - max  
  number optional
  - min  
  number optional
  - quant  
  number optional
  - type  
[ConstraintType](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ConstraintType)  

### OptionGroup

Chrome 125+  

#### Properties

  - members  
  string\[\]

  An array of option names in driver-provided order.
  - title  
  string

Provides a printable title, for example "Geometry options".  

### OptionSetting

Chrome 125+  

#### Properties

  - name  
  string

  Indicates the name of the option to set.
  - type  
  [OptionType](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionType)

  Indicates the data type of the option. The requested data type must match the real data type of the underlying option.
  - value  
  string \| number \| boolean \| number\[\] optional

Indicates the value to set. Leave unset to request automatic setting for options that have `autoSettable` enabled. The data type supplied for `value` must match `type`.  

### OptionType

Chrome 125+

The data type of an option.  

#### Enum

"UNKNOWN"   
The option's data type is unknown. The `value` property will be unset.
"BOOL"   
The `value` property will be one of `true`false.
"INT"   
A signed 32-bit integer. The `value` property will be long or long\[\], depending on whether the option takes more than one value.
"FIXED"   
A double in the range -32768-32767.9999 with a resolution of 1/65535. The `value` property will be double or double\[\] depending on whether the option takes more than one value. Double values that can't be exactly represented will be rounded to the available range and precision.
"STRING"   
A sequence of any bytes except NUL ('\\0'). The `value` property will be a DOMString.
"BUTTON"   
An option of this type has no value. Instead, setting an option of this type causes an option-specific side effect in the scanner driver. For example, a button-typed option could be used by a scanner driver to provide a means to select default values or to tell an automatic document feeder to advance to the next sheet of paper.
"GROUP"   
Grouping option. No value. This is included for compatibility, but will not normally be returned in `ScannerOption` values. Use `getOptionGroups()` to retrieve the list of groups with their member options.

<br />

### OptionUnit

Chrome 125+

Indicates the data type for [`ScannerOption.unit`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#property-ScannerOption-unit).  

#### Enum

"UNITLESS"   
The value is a unitless number. For example, it can be a threshold.
"PIXEL"   
The value is a number of pixels, for example, scan dimensions.
"BIT"   
The value is the number of bits, for example, color depth.
"MM"   
The value is measured in millimeters, for example, scan dimensions.
"DPI"   
The value is measured in dots per inch, for example, resolution.
"PERCENT"   
The value is a percent, for example, brightness.
"MICROSECOND"   
The value is measured in microseconds, for example, exposure time.

<br />

### ReadScanDataResponse

Chrome 125+  

#### Properties

  - data  
  ArrayBuffer optional

  If `result` is `SUCCESS`, contains the *next* chunk of scanned image data. If `result` is `EOF`, contains the *last* chunk of scanned image data.
  - estimatedCompletion  
  number optional

  If `result` is `SUCCESS`, an estimate of how much of the total scan data has been delivered so far, in the range 0 to 100.
  - job  
  string

  Provides the job handle passed to `readScanData()`.
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

The result of reading data. If its value is `SUCCESS`, then `data` contains the *next* (possibly zero-length) chunk of image data that is ready for reading. If its value is `EOF`, the `data` contains the *last* chunk of image data.  

### ScannerInfo

Chrome 125+  

#### Properties

  - connectionType  
  [ConnectionType](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ConnectionType)

  Indicates how the scanner is connected to the computer.
  - deviceUuid  
  string

  For matching against other `ScannerInfo` entries that point to the same physical device.
  - imageFormats  
  string\[\]

  An array of MIME types that can be requested for returned scans.
  - manufacturer  
  string

  The scanner manufacturer.
  - model  
  string

  The scanner model if it is available, or a generic description.
  - name  
  string

  A human-readable name for the scanner to display in the UI.
  - protocolType  
  string

  A human-readable description of the protocol or driver used to access the scanner, such as Mopria, WSD, or epsonds. This is primarily useful for allowing a user to choose between protocols if a device supports multiple protocols.
  - scannerId  
  string

  The ID of a specific scanner.
  - secure  
  boolean

If true, the scanner connection's transport cannot be intercepted by a passive listener, such as TLS or USB.  

### ScannerOption

Chrome 125+  

#### Properties

  - configurability  
  [Configurability](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-Configurability)

  Indicates whether and how the option can be changed.
  - constraint  
  [OptionConstraint](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionConstraint) optional

  Defines [`OptionConstraint`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionConstraint) on the current scanner option.
  - description  
  string

  A longer description of the option.
  - isActive  
  boolean

  Indicates the option is active and can be set or retrieved. If false, the `value` property will not be set.
  - isAdvanced  
  boolean

  Indicates that the UI should not display this option by default.
  - isAutoSettable  
  boolean

  Can be automatically set by the scanner driver.
  - isDetectable  
  boolean

  Indicates that this option can be detected from software.
  - isEmulated  
  boolean

  Emulated by the scanner driver if true.
  - name  
  string

  The option name using lowercase ASCII letters, numbers, and dashes. Diacritics are not allowed.
  - title  
  string

  A printable one-line title.
  - type  
  [OptionType](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionType)

  The data type contained in the `value` property, which is needed for setting this option.
  - unit  
  [OptionUnit](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionUnit)

  The unit of measurement for this option.
  - value  
  string \| number \| boolean \| number\[\] optional

The current value of the option, if relevant. Note that the data type of this property must match the data type specified in `type`.  

### ScanOptions

#### Properties

  - maxImages  
  number optional

  The number of scanned images allowed. The default is 1.
  - mimeTypes  
  string\[\] optional

The MIME types that are accepted by the caller.  

### ScanResults

#### Properties

  - dataUrls  
  string\[\]

  An array of data image URLs in a form that can be passed as the "src" value to an image tag.
  - mimeType  
  string

The MIME type of the `dataUrls`.  

### SetOptionResult

Chrome 125+  

#### Properties

  - name  
  string

  Indicates the name of the option that was set.
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

Indicates the result of setting the option.  

### SetOptionsResponse

Chrome 125+  

#### Properties

  - options  
  object optional

  An updated key-value mapping from option names to [`ScannerOption`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScannerOption) values containing the new configuration after attempting to set all supplied options. This has the same structure as the `options` property in [`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OpenScannerResponse).

  This property will be set even if some options were not set successfully, but will be unset if retrieving the updated configuration fails (for example, if the scanner is disconnected in the middle of scanning).
  - results  
  [SetOptionResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-SetOptionResult)\[\]

  An array of results, one each for every passed-in `OptionSetting`.
  - scannerHandle  
  string

Provides the scanner handle passed to `setOptions()`.  

### StartScanOptions

Chrome 125+  

#### Properties

  - format  
  string

  Specifies the MIME type to return scanned data in.
  - maxReadSize  
  number optional

If a non-zero value is specified, limits the maximum scanned bytes returned in a single [`readScanData`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-readScanData) response to that value. The smallest allowed value is 32768 (32 KB). If this property is not specified, the size of a returned chunk may be as large as the entire scanned image.  

### StartScanResponse

Chrome 125+  

#### Properties

  - job  
  string optional

  If `result` is `SUCCESS`, provides a handle that can be used to read scan data or cancel the job.
  - result  
  [OperationResult](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OperationResult)

  The result of starting a scan. If the value of this is `SUCCESS`, the `job` property will be populated.
  - scannerHandle  
  string

  Provides the same scanner handle that was passed to `startScan()`.

## Methods

### cancelScan()

Chrome 125+

```typescript
chrome.documentScan.cancelScan(
  job: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CancelScanResponse>
```

Cancels a started scan and returns a Promise that resolves with a [`CancelScanResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CancelScanResponse) object. If a callback is used, the object is passed to it instead.  

#### Parameters

  - job  
  string

The handle of an active scan job previously returned from a call to [`startScan`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-startScan).  

#### Returns

- Promise\<[CancelScanResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CancelScanResponse)\>  

### closeScanner()

Chrome 125+

```typescript
chrome.documentScan.closeScanner(
  scannerHandle: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CloseScannerResponse>
```

Closes the scanner with the passed in handle and returns a Promise that resolves with a [`CloseScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CloseScannerResponse) object. If a callback is used, the object is passed to it instead. Even if the response is not a success, the supplied handle becomes invalid and should not be used for further operations.  

#### Parameters

  - scannerHandle  
  string

Specifies the handle of an open scanner that was previously returned from a call to [`openScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openScanner).  

#### Returns

- Promise\<[CloseScannerResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-CloseScannerResponse)\>  

### getOptionGroups()

Chrome 125+

```typescript
chrome.documentScan.getOptionGroups(
  scannerHandle: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetOptionGroupsResponse>
```

Gets the group names and member options from a scanner previously opened by [`openScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openScanner). This method returns a Promise that resolves with a [`GetOptionGroupsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetOptionGroupsResponse) object. If a callback is passed to this function, returned data is passed to it instead.  

#### Parameters

  - scannerHandle  
  string

The handle of an open scanner returned from a call to [`openScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openScanner).  

#### Returns

- Promise\<[GetOptionGroupsResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetOptionGroupsResponse)\>  

### getScannerList()

Chrome 125+

```typescript
chrome.documentScan.getScannerList(
  filter: DeviceFilter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetScannerListResponse>
```

Gets the list of available scanners and returns a Promise that resolves with a [`GetScannerListResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetScannerListResponse) object. If a callback is passed to this function, returned data is passed to it instead.  

#### Parameters

  - filter  
  [DeviceFilter](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-DeviceFilter)

A [`DeviceFilter`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-DeviceFilter) indicating which types of scanners should be returned.  

#### Returns

- Promise\<[GetScannerListResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-GetScannerListResponse)\>  

### openScanner()

Chrome 125+

```typescript
chrome.documentScan.openScanner(
  scannerId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OpenScannerResponse>
```

Opens a scanner for exclusive access and returns a Promise that resolves with an [`OpenScannerResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OpenScannerResponse) object. If a callback is passed to this function, returned data is passed to it instead.  

#### Parameters

  - scannerId  
  string

The ID of a scanner to be opened. This value is one returned from a previous call to [`getScannerList`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-getScannerList).  

#### Returns

- Promise\<[OpenScannerResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OpenScannerResponse)\>  

### readScanData()

Chrome 125+

```typescript
chrome.documentScan.readScanData(
  job: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ReadScanDataResponse>
```

Reads the next chunk of available image data from an active job handle, and returns a Promise that resolves with a [`ReadScanDataResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ReadScanDataResponse) object. If a callback is used, the object is passed to it instead.

\*\*Note:\*\*It is valid for a response result to be `SUCCESS` with a zero-length `data` member. This means the scanner is still working but does not yet have additional data ready. The caller should wait a short time and try again.

When the scan job completes, the response will have the result value of `EOF`. This response may contain a final non-zero `data` member.  

#### Parameters

  - job  
  string

Active job handle previously returned from [`startScan`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-startScan).  

#### Returns

- Promise\<[ReadScanDataResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ReadScanDataResponse)\>  

### scan()

```typescript
chrome.documentScan.scan(
  options: ScanOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScanResults>
```

Performs a document scan and returns a Promise that resolves with a [`ScanResults`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScanResults) object. If a callback is passed to this function, the returned data is passed to it instead.  

#### Parameters

  - options  
  [ScanOptions](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScanOptions)

An object containing scan parameters.  

#### Returns

  - Promise\<[ScanResults](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-ScanResults)\>  
Chrome 96+  

### setOptions()

Chrome 125+

```typescript
chrome.documentScan.setOptions(
  scannerHandle: string,
  options: OptionSetting[],
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-SetOptionsResponse>
```

Sets options on the specified scanner and returns a Promise that resolves with a [`SetOptionsResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-SetOptionsResponse) object containing the result of trying to set every value in the order of the passed-in [`OptionSetting`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionSetting) object. If a callback is used, the object is passed to it instead.  

#### Parameters

  - scannerHandle  
  string

  The handle of the scanner to set options on. This should be a value previously returned from a call to [`openScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openScanner).
  - options  
  [OptionSetting](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-OptionSetting)\[\]

A list of `OptionSetting` objects to be applied to the scanner.  

#### Returns

- Promise\<[SetOptionsResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-SetOptionsResponse)\>  

### startScan()

Chrome 125+

```typescript
chrome.documentScan.startScan(
  scannerHandle: string,
  options: StartScanOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-StartScanResponse>
```

Starts a scan on the specified scanner and returns a Promise that resolves with a [`StartScanResponse`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-StartScanResponse). If a callback is used, the object is passed to it instead. If the call was successful, the response includes a job handle that can be used in subsequent calls to read scan data or cancel a scan.  

#### Parameters

  - scannerHandle  
  string

  The handle of an open scanner. This should be a value previously returned from a call to [`openScanner`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#method-openScanner).
  - options  
  [StartScanOptions](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-StartScanOptions)

A [`StartScanOptions`](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-StartScanOptions) object indicating the options to be used for the scan. The `StartScanOptions.format` property must match one of the entries returned in the scanner's `ScannerInfo`.  

#### Returns

- Promise\<[StartScanResponse](https://developer.chrome.com/docs/extensions/reference/api/documentScan#type-StartScanResponse)\>

<br />

---

## 19. dom

*File: pages/dom.md*

# chrome.events

<br />

<br />

## Description

The `chrome.events` namespace contains common types used by APIs dispatching events to notify you when something interesting happens.

<br />

<br />

<br />

<br />

## Concepts and usage

An `Event` is an object that lets you be notified when something interesting happens. Here's an
example of using the `chrome.alarms.onAlarm` event to be notified whenever an alarm has elapsed:  

    chrome.alarms.onAlarm.addListener((alarm) => {
      appendToLog(`alarms.onAlarm -- name: ${alarm.name}, scheduledTime: ${alarm.scheduledTime}`);
    });

As the example shows, you register for notification using `addListener()`. The argument to
`addListener()` is always a function that you define to handle the event, but the parameters to the
function depend on which event you're handling. Checking the documentation for [`alarms.onAlarm`](https://developer.chrome.com/docs/extensions/reference/api/alarms#event-onAlarm),
you can see that the function has a single parameter: an [`alarms.Alarm`](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm) object that has details
about the elapsed alarm.

Example APIs using Events: [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n), [identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime). Most [chrome
APIs](https://developer.chrome.com/docs/extensions/reference/api) do.

### Declarative Event Handlers

The declarative event handlers provide a means to define rules consisting of declarative conditions
and actions. Conditions are evaluated in the browser rather than the JavaScript engine which reduces
roundtrip latencies and allows for very high efficiency.

Declarative event handlers are used for example in the
[Declarative Content API](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent). This page describes the underlying concepts of all declarative event
handlers.

#### Rules

The simplest possible rule consists of one or more conditions and one or more actions:  

    const rule = {
      conditions: [ /* my conditions */ ],
      actions: [ /* my actions */ ]
    };

If any of the conditions is fulfilled, all actions are executed.

In addition to conditions and actions you may give each rule an identifier, which simplifies
unregistering previously registered rules, and a priority to define precedences among rules.
Priorities are only considered if rules conflict each other or need to be executed in a specific
order. Actions are executed in descending order of the priority of their rules.  

    const rule = {
      id: "my rule",  // optional, will be generated if not set.
      priority: 100,  // optional, defaults to 100.
      conditions: [ /* my conditions */ ],
      actions: [ /* my actions */ ]
    };

#### Event objects

Event objects may support rules. These event objects don't call a callback function when
events happen but test whether any registered rule has at least one fulfilled condition and execute
the actions associated with this rule. Event objects supporting the declarative API have three
relevant methods: [`events.Event.addRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-addRules), [`events.Event.removeRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-removeRules), and
[`events.Event.getRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-getRules).

#### Add rules

To add rules call the `addRules()` function of the event object. It takes an array of rule instances
as its first parameter and a callback function that is called on completion.  

    const rule_list = [rule1, rule2, ...];
    addRules(rule_list, (details) => {...});

If the rules were inserted successfully, the `details` parameter contains an array of inserted rules
appearing in the same order as in the passed `rule_list` where the optional parameters `id` and
`priority` were filled with the generated values. If any rule is invalid, for example, because it contained
an invalid condition or action, none of the rules are added and the [runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime#property-lastError) variable
is set when the callback function is called. Each rule in `rule_list` must contain a unique
identifier that is not already used by another rule or an empty identifier.
| **Note:** Rules are persistent across browsing sessions. Therefore, you should install rules during extension installation time using the [`runtime.onInstalled`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled) event. Note that this event is also triggered when an extension is updated. Therefore, you should first clear previously installed rules and then register new rules.

#### Remove rules

To remove rules call the `removeRules()` function. It accepts an optional array of rule identifiers
as its first parameter and a callback function as its second parameter.  

    const rule_ids = ["id1", "id2", ...];
    removeRules(rule_ids, () => {...});

If `rule_ids` is an array of identifiers, all rules having identifiers listed in the array are
removed. If `rule_ids` lists an identifier, that is unknown, this identifier is silently ignored. If
`rule_ids` is `undefined`, all registered rules of this extension are removed. The `callback()`
function is called when the rules were removed.

#### Retrieve rules

To retrieve a list of registered rules, call the `getRules()` function. It accepts an
optional array of rule identifiers with the same semantics as `removeRules()` and a callback function.  

    const rule_ids = ["id1", "id2", ...];
    getRules(rule_ids, (details) => {...});

The `details` parameter passed to the `callback()` function refers to an array of rules including
filled optional parameters.

#### Performance

To achieve maximum performance, you should keep the following guidelines in mind.

**Register and unregister rules in bulk.** After each registration or unregistration, Chrome needs to
update internal data structures. This update is an expensive operation.  
Instead of  

```json
const rule1 = {...};
const rule2 = {...};
chrome.declarativeWebRequest.onRequest.addRules([rule1]);
chrome.declarativeWebRequest.onRequest.addRules([rule2]);
```  
Prefer  

```json
const rule1 = {...};
const rule2 = {...};
chrome.declarativeWebRequest.onRequest.addRules([rule1, rule2]);
```

**Prefer substring matching over regular expressions in an [events.UrlFilter](https://developer.chrome.com/docs/extensions/reference/api/events#type-UrlFilter).**
Substring based matching is extremely fast.  
Instead of  

```json
const match = new chrome.declarativeWebRequest.RequestMatcher({
  url: {urlMatches: "example.com/[^?]*foo" }
});
```  
Prefer  

```json
const match = new chrome.declarativeWebRequest.RequestMatcher({
  url: {hostSuffix: "example.com", pathContains: "foo"}
});
```

If there are many rules that share the same actions, merge the rules into one.
Rules trigger their actions as soon as a single condition is fulfilled. This speeds up the
matching and reduces memory consumption for duplicate action sets.  
Instead of  

```json
const condition1 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'example.com' }
});
const condition2 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'foobar.com' }
});
const rule1 = { conditions: [condition1],
                actions: [new chrome.declarativeWebRequest.CancelRequest()]
              };
const rule2 = { conditions: [condition2],
                actions: [new chrome.declarativeWebRequest.CancelRequest()]
              };
chrome.declarativeWebRequest.onRequest.addRules([rule1, rule2]);
```  
Prefer  

```json
const condition1 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'example.com' }
});
const condition2 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'foobar.com' }
});
const rule = { conditions: [condition1, condition2],
              actions: [new chrome.declarativeWebRequest.CancelRequest()]
             };
chrome.declarativeWebRequest.onRequest.addRules([rule]);
```

### Filtered events

Filtered events are a mechanism that allows listeners to specify a subset of events that they are
interested in. A listener that uses a filter won't be invoked for events that don't pass the
filter, which makes the listening code more declarative and efficient. A [service worker](https://developer.chrome.com/docs/extensions/mv3/service_workers) need
not be woken up to handle events it doesn't care about.

Filtered events are intended to allow a transition from manual filtering code.  
Instead of  

```json
chrome.webNavigation.onCommitted.addListener((event) => {
  if (hasHostSuffix(event.url, 'google.com') ||
      hasHostSuffix(event.url, 'google.com.au')) {
    // ...
  }
});
```  
Prefer  

```json
chrome.webNavigation.onCommitted.addListener((event) => {
  // ...
}, {url: [{hostSuffix: 'google.com'},
          {hostSuffix: 'google.com.au'}]});
```

Events support specific filters that are meaningful to that event. The list of filters that an event
supports will be listed in the documentation for that event in the "filters" section.

When matching URLs (as in the example above), event filters support the same URL matching
capabilities as expressible with a [`events.UrlFilter`](https://developer.chrome.com/docs/extensions/reference/api/events#type-UrlFilter), except for scheme and port matching.

<br />

## Types

### Event

An object which allows the addition and removal of listeners for a Chrome event.  

#### Properties

  - addListener  
  void

  Registers an event listener *callback* to an event.


  The `addListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

    Called when an event occurs. The parameters of this function depend on the type of event.
  - addRules  
  void

  Registers rules to handle events.


  The `addRules` function looks like:  

  ```typescript
  (rules: Rule<anyany>[], callback?: function) => {...}
  ```

  <br />

    - rules  
    [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

    Rules to be registered. These do not replace previously registered rules.
    - callback  
    function optional


    The `callback` parameter looks like:  

    ```typescript
    (rules: Rule<anyany>[]) => void
    ```

    <br />

      - rules  
      [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

      Rules that were registered, the optional parameters are filled with values.
  - getRules  
  void

  Returns currently registered rules.


  The `getRules` function looks like:  

  ```typescript
  (ruleIdentifiers?: string[], callback: function) => {...}
  ```

  <br />

    - ruleIdentifiers  
    string\[\] optional

    If an array is passed, only rules with identifiers contained in this array are returned.
    - callback  
    function


    The `callback` parameter looks like:  

    ```typescript
    (rules: Rule<anyany>[]) => void
    ```

    <br />

      - rules  
      [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

      Rules that were registered, the optional parameters are filled with values.
  - hasListener  
  void


  The `hasListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

  Listener whose registration status shall be tested.  
    - returns  
    boolean

    True if *callback* is registered to the event.
  - hasListeners  
  void


  The `hasListeners` function looks like:  

  ```typescript
  () => {...}
  ```

  <br />

    - returns  
    boolean

    True if any event listeners are registered to the event.
  - removeListener  
  void

  Deregisters an event listener *callback* from an event.


  The `removeListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

    Listener that shall be unregistered.
  - removeRules  
  void

  Unregisters currently registered rules.


  The `removeRules` function looks like:  

  ```typescript
  (ruleIdentifiers?: string[], callback?: function) => {...}
  ```

  <br />

    - ruleIdentifiers  
    string\[\] optional

    If an array is passed, only rules with identifiers contained in this array are unregistered.
    - callback  
    function optional


    The `callback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

### Rule

Description of a declarative rule for handling events.  

#### Properties

  - actions  
  any\[\]

  List of actions that are triggered if one of the conditions is fulfilled.
  - conditions  
  any\[\]

  List of conditions that can trigger the actions.
  - id  
  string optional

  Optional identifier that allows referencing this rule.
  - priority  
  number optional

  Optional priority of this rule. Defaults to 100.
  - tags  
  string\[\] optional

Tags can be used to annotate rules and perform operations on sets of rules.  

### UrlFilter

Filters URLs for various criteria. See [event filtering](https://developer.chrome.com/docs/extensions/reference/events/#filtered). All criteria are case sensitive.  

#### Properties

  - cidrBlocks  
  string\[\] optional  
  Chrome 123+

  Matches if the host part of the URL is an IP address and is contained in any of the CIDR blocks specified in the array.
  - hostContains  
  string optional

  Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.
  - hostEquals  
  string optional

  Matches if the host name of the URL is equal to a specified string.
  - hostPrefix  
  string optional

  Matches if the host name of the URL starts with a specified string.
  - hostSuffix  
  string optional

  Matches if the host name of the URL ends with a specified string.
  - originAndPathMatches  
  string optional

  Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the [RE2 syntax](https://github.com/google/re2/blob/master/doc/syntax.txt).
  - pathContains  
  string optional

  Matches if the path segment of the URL contains a specified string.
  - pathEquals  
  string optional

  Matches if the path segment of the URL is equal to a specified string.
  - pathPrefix  
  string optional

  Matches if the path segment of the URL starts with a specified string.
  - pathSuffix  
  string optional

  Matches if the path segment of the URL ends with a specified string.
  - ports  
  (number \| number\[\])\[\] optional

  Matches if the port of the URL is contained in any of the specified port lists. For example `[80, 443, [1000, 1200]]` matches all requests on port 80, 443 and in the range 1000-1200.
  - queryContains  
  string optional

  Matches if the query segment of the URL contains a specified string.
  - queryEquals  
  string optional

  Matches if the query segment of the URL is equal to a specified string.
  - queryPrefix  
  string optional

  Matches if the query segment of the URL starts with a specified string.
  - querySuffix  
  string optional

  Matches if the query segment of the URL ends with a specified string.
  - schemes  
  string\[\] optional

  Matches if the scheme of the URL is equal to any of the schemes specified in the array.
  - urlContains  
  string optional

  Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlEquals  
  string optional

  Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlMatches  
  string optional

  Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the [RE2 syntax](https://github.com/google/re2/blob/master/doc/syntax.txt).
  - urlPrefix  
  string optional

  Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlSuffix  
  string optional

  Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.

<br />

---

## 20. downloads

*File: pages/downloads.md*

# chrome.downloads  |  API  |  Chrome for Developers

[Skip to main content](#main-content)

-   [Docs](https://developer.chrome.com/docs)
    -   [Overview](https://developer.chrome.com/docs/extensions)
    -   [Get Started](https://developer.chrome.com/docs/extensions/get-started)
    -   [Develop](https://developer.chrome.com/docs/extensions/develop)
    -   [How To](https://developer.chrome.com/docs/extensions/how-to)
    -   [AI](https://developer.chrome.com/docs/extensions/ai)
    -   [Reference](https://developer.chrome.com/docs/extensions/reference)
    -   [Samples](https://developer.chrome.com/docs/extensions/samples)
    -   [Chrome Web Store](https://developer.chrome.com/docs/webstore)
-   [Case studies](https://developer.chrome.com/case-studies)
-   [Blog](https://developer.chrome.com/blog)
-   [New in Chrome](https://developer.chrome.com/new)

-   Manifest V3
    
-   [➡ Manifest V2](https://developer.chrome.com/docs/extensions/mv2/reference)
-   [accessibilityFeatures](https://developer.chrome.com/docs/extensions/reference/api/accessibilityFeatures)
-   [action](https://developer.chrome.com/docs/extensions/reference/api/action)
-   [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms)
-   [audio](https://developer.chrome.com/docs/extensions/reference/api/audio)
-   [bookmarks](https://developer.chrome.com/docs/extensions/reference/api/bookmarks)
-   [browsingData](https://developer.chrome.com/docs/extensions/reference/api/browsingData)
-   [certificateProvider](https://developer.chrome.com/docs/extensions/reference/api/certificateProvider)
-   [commands](https://developer.chrome.com/docs/extensions/reference/api/commands)
-   [contentSettings](https://developer.chrome.com/docs/extensions/reference/api/contentSettings)
-   [contextMenus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
-   [cookies](https://developer.chrome.com/docs/extensions/reference/api/cookies)
-   [debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger)
-   [declarativeContent](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent)
-   [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
-   [desktopCapture](https://developer.chrome.com/docs/extensions/reference/api/desktopCapture)
-   [devtools.inspectedWindow](https://developer.chrome.com/docs/extensions/reference/api/devtools/inspectedWindow)
-   [devtools.network](https://developer.chrome.com/docs/extensions/reference/api/devtools/network)
-   [devtools.panels](https://developer.chrome.com/docs/extensions/reference/api/devtools/panels)
-   [devtools.performance](https://developer.chrome.com/docs/extensions/reference/api/devtools/performance)
-   [devtools.recorder](https://developer.chrome.com/docs/extensions/reference/api/devtools/recorder)
-   [dns](https://developer.chrome.com/docs/extensions/reference/api/dns)
-   [documentScan](https://developer.chrome.com/docs/extensions/reference/api/documentScan)
-   [dom](https://developer.chrome.com/docs/extensions/reference/api/dom)
-   [downloads](https://developer.chrome.com/docs/extensions/reference/api/downloads)
-   [enterprise.deviceAttributes](https://developer.chrome.com/docs/extensions/reference/api/enterprise/deviceAttributes)
-   [enterprise.hardwarePlatform](https://developer.chrome.com/docs/extensions/reference/api/enterprise/hardwarePlatform)
-   [enterprise.login](https://developer.chrome.com/docs/extensions/reference/api/enterprise/login)
-   [enterprise.networkingAttributes](https://developer.chrome.com/docs/extensions/reference/api/enterprise/networkingAttributes)
-   [enterprise.platformKeys](https://developer.chrome.com/docs/extensions/reference/api/enterprise/platformKeys)
-   [events](https://developer.chrome.com/docs/extensions/reference/api/events)
-   [extension](https://developer.chrome.com/docs/extensions/reference/api/extension)
-   [extensionTypes](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes)
-   [fileBrowserHandler](https://developer.chrome.com/docs/extensions/reference/api/fileBrowserHandler)
-   [fileSystemProvider](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider)
-   [fontSettings](https://developer.chrome.com/docs/extensions/reference/api/fontSettings)
-   [gcm](https://developer.chrome.com/docs/extensions/reference/api/gcm)
-   [history](https://developer.chrome.com/docs/extensions/reference/api/history)
-   [i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n)
-   [identity](https://developer.chrome.com/docs/extensions/reference/api/identity)
-   [idle](https://developer.chrome.com/docs/extensions/reference/api/idle)
-   [input.ime](https://developer.chrome.com/docs/extensions/reference/api/input/ime)
-   [instanceID](https://developer.chrome.com/docs/extensions/reference/api/instanceID)
-   [loginState](https://developer.chrome.com/docs/extensions/reference/api/loginState)
-   [management](https://developer.chrome.com/docs/extensions/reference/api/management)
-   [notifications](https://developer.chrome.com/docs/extensions/reference/api/notifications)
-   [offscreen](https://developer.chrome.com/docs/extensions/reference/api/offscreen)
-   [omnibox](https://developer.chrome.com/docs/extensions/reference/api/omnibox)
-   [pageCapture](https://developer.chrome.com/docs/extensions/reference/api/pageCapture)
-   [permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
-   [platformKeys](https://developer.chrome.com/docs/extensions/reference/api/platformKeys)
-   [power](https://developer.chrome.com/docs/extensions/reference/api/power)
-   [printerProvider](https://developer.chrome.com/docs/extensions/reference/api/printerProvider)
-   [printing](https://developer.chrome.com/docs/extensions/reference/api/printing)
-   [printingMetrics](https://developer.chrome.com/docs/extensions/reference/api/printingMetrics)
-   [privacy](https://developer.chrome.com/docs/extensions/reference/api/privacy)
-   [processes](https://developer.chrome.com/docs/extensions/reference/api/processes)
-   [proxy](https://developer.chrome.com/docs/extensions/reference/api/proxy)
-   [readingList](https://developer.chrome.com/docs/extensions/reference/api/readingList)
-   [runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime)
-   [scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting)
-   [search](https://developer.chrome.com/docs/extensions/reference/api/search)
-   [sessions](https://developer.chrome.com/docs/extensions/reference/api/sessions)
-   [sidePanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
-   [storage](https://developer.chrome.com/docs/extensions/reference/api/storage)
-   [system.cpu](https://developer.chrome.com/docs/extensions/reference/api/system/cpu)
-   [system.display](https://developer.chrome.com/docs/extensions/reference/api/system/display)
-   [system.memory](https://developer.chrome.com/docs/extensions/reference/api/system/memory)
-   [system.storage](https://developer.chrome.com/docs/extensions/reference/api/system/storage)
-   [systemLog](https://developer.chrome.com/docs/extensions/reference/api/systemLog)
-   [tabCapture](https://developer.chrome.com/docs/extensions/reference/api/tabCapture)
-   [tabGroups](https://developer.chrome.com/docs/extensions/reference/api/tabGroups)
-   [tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs)
-   [topSites](https://developer.chrome.com/docs/extensions/reference/api/topSites)
-   [tts](https://developer.chrome.com/docs/extensions/reference/api/tts)
-   [ttsEngine](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine)
-   [types](https://developer.chrome.com/docs/extensions/reference/api/types)
-   [userScripts](https://developer.chrome.com/docs/extensions/reference/api/userScripts)
-   [vpnProvider](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider)
-   [wallpaper](https://developer.chrome.com/docs/extensions/reference/api/wallpaper)
-   [webAuthenticationProxy](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy)
-   [webNavigation](https://developer.chrome.com/docs/extensions/reference/api/webNavigation)
-   [webRequest](https://developer.chrome.com/docs/extensions/reference/api/webRequest)
-   [windows](https://developer.chrome.com/docs/extensions/reference/api/windows)

## chrome.downloads bookmark\_border Stay organized with collections Save and categorize content based on your preferences.

-   On this page
-   [Description](#description)
-   [Permissions](#permissions)
-   [Examples](#examples)
-   [Types](#type)
    -   [BooleanDelta](#type-BooleanDelta)
    -   [DangerType](#type-DangerType)
    -   [DoubleDelta](#type-DoubleDelta)
    -   [DownloadDelta](#type-DownloadDelta)
    -   [DownloadItem](#type-DownloadItem)
    -   [DownloadOptions](#type-DownloadOptions)
    -   [DownloadQuery](#type-DownloadQuery)
    -   [FilenameConflictAction](#type-FilenameConflictAction)
    -   [FilenameSuggestion](#type-FilenameSuggestion)
    -   [GetFileIconOptions](#type-GetFileIconOptions)
    -   [HeaderNameValuePair](#type-HeaderNameValuePair)
    -   [HttpMethod](#type-HttpMethod)
    -   [InterruptReason](#type-InterruptReason)
    -   [State](#type-State)
    -   [StringDelta](#type-StringDelta)
    -   [UiOptions](#type-UiOptions)
-   [Methods](#method)
    -   [acceptDanger()](#method-acceptDanger)
    -   [cancel()](#method-cancel)
    -   [download()](#method-download)
    -   [erase()](#method-erase)
    -   [getFileIcon()](#method-getFileIcon)
    -   [open()](#method-open)
    -   [pause()](#method-pause)
    -   [removeFile()](#method-removeFile)
    -   [resume()](#method-resume)
    -   [search()](#method-search)
    -   [setShelfEnabled()](#method-setShelfEnabled)
    -   [setUiOptions()](#method-setUiOptions)
    -   [show()](#method-show)
    -   [showDefaultFolder()](#method-showDefaultFolder)
-   [Events](#event)
    -   [onChanged](#event-onChanged)
    -   [onCreated](#event-onCreated)
    -   [onDeterminingFilename](#event-onDeterminingFilename)
    -   [onErased](#event-onErased)

## Description

Use the `chrome.downloads` API to programmatically initiate, monitor, manipulate, and search for downloads.

## Permissions

`downloads`  

You must declare the `"downloads"` permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use this API.

```
{
  "name": "My extension",
  ...
  "permissions": [
    "downloads"
  ],
}

```

## Examples

You can find simple examples of using the `chrome.downloads` API in the [examples/api/downloads](https://github.com/GoogleChrome/chrome-extensions-samples/tree/master/_archive/mv2/api/downloads/) directory. For other examples and for help in viewing the source code, see [Samples](https://developer.chrome.com/docs/extensions/mv2/samples).

## Types

### BooleanDelta

#### Properties

-   previous
    
    boolean optional
    

### DangerType

file

The download's filename is suspicious.

url

The download's URL is known to be malicious.

content

The downloaded file is known to be malicious.

uncommon

The download's URL is not commonly downloaded and could be dangerous.

host

The download came from a host known to distribute malicious binaries and is likely dangerous.

unwanted

The download is potentially unwanted or unsafe. E.g. it could make changes to browser or computer settings.

safe

The download presents no known danger to the user's computer.

accepted

The user has accepted the dangerous download.

#### Enum

"file"  

"url"  

"content"  

"uncommon"  

"host"  

"unwanted"  

"safe"  

"accepted"  

"allowlistedByPolicy"  

"asyncScanning"  

"asyncLocalPasswordScanning"  

"passwordProtected"  

"blockedTooLarge"  

"sensitiveContentWarning"  

"sensitiveContentBlock"  

"deepScannedFailed"  

"deepScannedSafe"  

"deepScannedOpenedDangerous"  

"promptForScanning"  

"promptForLocalPasswordScanning"  

"accountCompromise"  

"blockedScanFailed"  

### DoubleDelta

#### Properties

### DownloadDelta

#### Properties

-   canResume
    
    [BooleanDelta](#type-BooleanDelta) optional
    
    The change in `canResume`, if any.
    
-   danger
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `danger`, if any.
    
-   endTime
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `endTime`, if any.
    
-   error
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `error`, if any.
    
-   exists
    
    [BooleanDelta](#type-BooleanDelta) optional
    
    The change in `exists`, if any.
    
-   fileSize
    
    [DoubleDelta](#type-DoubleDelta) optional
    
    The change in `fileSize`, if any.
    
-   filename
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `filename`, if any.
    
-   finalUrl
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `finalUrl`, if any.
    
-   The `id` of the [`DownloadItem`](#type-DownloadItem) that changed.
    
-   mime
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `mime`, if any.
    
-   paused
    
    [BooleanDelta](#type-BooleanDelta) optional
    
    The change in `paused`, if any.
    
-   startTime
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `startTime`, if any.
    
-   state
    
    [StringDelta](#type-StringDelta) optional
    
    The change in `state`, if any.
    
-   totalBytes
    
    [DoubleDelta](#type-DoubleDelta) optional
    
    The change in `totalBytes`, if any.
    
-   The change in `url`, if any.
    

### DownloadItem

#### Properties

-   byExtensionId
    
    string optional
    
    The identifier for the extension that initiated this download if this download was initiated by an extension. Does not change once it is set.
    
-   byExtensionName
    
    string optional
    
    The localized name of the extension that initiated this download if this download was initiated by an extension. May change if the extension changes its name or if the user changes their locale.
    
-   Number of bytes received so far from the host, without considering file compression.
    
-   True if the download is in progress and paused, or else if it is interrupted and can be resumed starting from where it was interrupted.
    
-   Indication of whether this download is thought to be safe or known to be suspicious.
    
-   The time when the download ended in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.endTime) console.log(new Date(item.endTime))})})`
    
-   error
    
    [InterruptReason](#type-InterruptReason) optional
    
    Why the download was interrupted. Several kinds of HTTP errors may be grouped under one of the errors beginning with `SERVER_`. Errors relating to the network begin with `NETWORK_`, errors relating to the process of writing the file to the file system begin with `FILE_`, and interruptions initiated by the user begin with `USER_`.
    
-   estimatedEndTime
    
    string optional
    
    Estimated time when the download will complete in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.estimatedEndTime) console.log(new Date(item.estimatedEndTime))})})`
    
-   Whether the downloaded file still exists. This information may be out of date because Chrome does not automatically watch for file removal. Call [`search`](#method-search)() in order to trigger the check for file existence. When the existence check completes, if the file has been deleted, then an [`onChanged`](#event-onChanged) event will fire. Note that [`search`](#method-search)() does not wait for the existence check to finish before returning, so results from [`search`](#method-search)() may not accurately reflect the file system. Also, [`search`](#method-search)() may be called as often as necessary, but will not check for file existence any more frequently than once every 10 seconds.
    
-   Number of bytes in the whole file post-decompression, or -1 if unknown.
    
-   Absolute local path.
    
-   The absolute URL that this download is being made from, after all redirects.
    
-   An identifier that is persistent across browser sessions.
    
-   False if this download is recorded in the history, true if it is not recorded.
    
-   The file's MIME type.
    
-   True if the download has stopped reading data from the host, but kept the connection open.
    
-   Absolute URL.
    
-   The time when the download began in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){console.log(new Date(item.startTime))})})`
    
-   Indicates whether the download is progressing, interrupted, or complete.
    
-   Number of bytes in the whole file, without considering file compression, or -1 if unknown.
    
-   The absolute URL that this download initiated from, before any redirects.
    

### DownloadOptions

#### Properties

-   Post body.
    
-   conflictAction
    
    [FilenameConflictAction](#type-FilenameConflictAction) optional
    
    The action to take if `filename` already exists.
    
-   A file path relative to the Downloads directory to contain the downloaded file, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will cause an error. [`onDeterminingFilename`](#event-onDeterminingFilename) allows suggesting a filename after the file's MIME type and a tentative filename have been determined.
    
-   [HeaderNameValuePair](#type-HeaderNameValuePair)\[\] optional
    
    Extra HTTP headers to send with the request if the URL uses the HTTP\[s\] protocol. Each header is represented as a dictionary containing the keys `name` and either `value` or `binaryValue`, restricted to those allowed by XMLHttpRequest.
    
-   method
    
    [HttpMethod](#type-HttpMethod) optional
    
    The HTTP method to use if the URL uses the HTTP\[S\] protocol.
    
-   Use a file-chooser to allow the user to select a filename regardless of whether `filename` is set or already exists.
    
-   The URL to download.
    

### DownloadQuery

#### Properties

-   bytesReceived
    
    number optional
    
    Number of bytes received so far from the host, without considering file compression.
    
-   danger
    
    [DangerType](#type-DangerType) optional
    
    Indication of whether this download is thought to be safe or known to be suspicious.
    
-   The time when the download ended in ISO 8601 format.
    
-   endedAfter
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) that ended after the given ms in ISO 8601 format
    
-   endedBefore
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) that ended before the given ms in ISO 8601 format.
    
-   error
    
    [InterruptReason](#type-InterruptReason) optional
    
    Why a download was interrupted.
    
-   Whether the downloaded file exists;
    
-   Number of bytes in the whole file post-decompression, or -1 if unknown.
    
-   Absolute local path.
    
-   filenameRegex
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) whose `filename` matches the given regular expression.
    
-   The absolute URL that this download is being made from, after all redirects.
    
-   finalUrlRegex
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) whose `finalUrl` matches the given regular expression.
    
-   The `id` of the [`DownloadItem`](#type-DownloadItem) to query.
    
-   The maximum number of matching [`DownloadItem`](#type-DownloadItem) returned. Defaults to 1000. Set to 0 in order to return all matching [`DownloadItem`](#type-DownloadItem). See [`search`](#method-search) for how to page through results.
    
-   The file's MIME type.
    
-   orderBy
    
    string\[\] optional
    
    Set elements of this array to [`DownloadItem`](#type-DownloadItem) properties in order to sort search results. For example, setting `orderBy=['startTime']` sorts the [`DownloadItem`](#type-DownloadItem) by their start time in ascending order. To specify descending order, prefix with a hyphen: '-startTime'.
    
-   True if the download has stopped reading data from the host, but kept the connection open.
    
-   This array of search terms limits results to [`DownloadItem`](#type-DownloadItem) whose `filename` or `url` or `finalUrl` contain all of the search terms that do not begin with a dash '-' and none of the search terms that do begin with a dash.
    
-   startTime
    
    string optional
    
    The time when the download began in ISO 8601 format.
    
-   startedAfter
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) that started after the given ms in ISO 8601 format.
    
-   startedBefore
    
    string optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) that started before the given ms in ISO 8601 format.
    
-   Indicates whether the download is progressing, interrupted, or complete.
    
-   totalBytes
    
    number optional
    
    Number of bytes in the whole file, without considering file compression, or -1 if unknown.
    
-   totalBytesGreater
    
    number optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) whose `totalBytes` is greater than the given integer.
    
-   totalBytesLess
    
    number optional
    
    Limits results to [`DownloadItem`](#type-DownloadItem) whose `totalBytes` is less than the given integer.
    
-   The absolute URL that this download initiated from, before any redirects.
    
-   Limits results to [`DownloadItem`](#type-DownloadItem) whose `url` matches the given regular expression.
    

### FilenameConflictAction

uniquify

To avoid duplication, the `filename` is changed to include a counter before the filename extension.

overwrite

The existing file will be overwritten with the new file.

prompt

The user will be prompted with a file chooser dialog.

#### Enum

"uniquify"  

"overwrite"  

"prompt"  

### FilenameSuggestion

#### Properties

-   conflictAction
    
    [FilenameConflictAction](#type-FilenameConflictAction) optional
    
    The action to take if `filename` already exists.
    
-   The [`DownloadItem`](#type-DownloadItem)'s new target [`DownloadItem.filename`](#property-DownloadItem-filename), as a path relative to the user's default Downloads directory, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will be ignored. `filename` is ignored if there are any [`onDeterminingFilename`](#event-onDeterminingFilename) listeners registered by any extensions.
    

### GetFileIconOptions

#### Properties

-   The size of the returned icon. The icon will be square with dimensions size \* size pixels. The default and largest size for the icon is 32x32 pixels. The only supported sizes are 16 and 32. It is an error to specify any other size.
    

#### Properties

-   Name of the HTTP header.
    
-   Value of the HTTP header.
    

### HttpMethod

#### Enum

### InterruptReason

#### Enum

"FILE\_FAILED"  

"FILE\_ACCESS\_DENIED"  

"FILE\_NO\_SPACE"  

"FILE\_NAME\_TOO\_LONG"  

"FILE\_TOO\_LARGE"  

"FILE\_VIRUS\_INFECTED"  

"FILE\_TRANSIENT\_ERROR"  

"FILE\_BLOCKED"  

"FILE\_SECURITY\_CHECK\_FAILED"  

"FILE\_TOO\_SHORT"  

"FILE\_HASH\_MISMATCH"  

"FILE\_SAME\_AS\_SOURCE"  

"NETWORK\_FAILED"  

"NETWORK\_TIMEOUT"  

"NETWORK\_DISCONNECTED"  

"NETWORK\_SERVER\_DOWN"  

"NETWORK\_INVALID\_REQUEST"  

"SERVER\_FAILED"  

"SERVER\_NO\_RANGE"  

"SERVER\_BAD\_CONTENT"  

"SERVER\_UNAUTHORIZED"  

"SERVER\_CERT\_PROBLEM"  

"SERVER\_FORBIDDEN"  

"SERVER\_UNREACHABLE"  

"SERVER\_CONTENT\_LENGTH\_MISMATCH"  

"SERVER\_CROSS\_ORIGIN\_REDIRECT"  

"USER\_CANCELED"  

"USER\_SHUTDOWN"  

"CRASH"  

### State

in\_progress

The download is currently receiving data from the server.

interrupted

An error broke the connection with the file host.

complete

The download completed successfully.

#### Enum

"in\_progress"  

"interrupted"  

"complete"  

### StringDelta

#### Properties

### UiOptions

#### Properties

-   Enable or disable the download UI.
    

## Methods

### acceptDanger()

```
chrome.downloads.acceptDanger(  
  downloadId: number,  
): Promise<void>
```

Prompt the user to accept a dangerous download. Can only be called from a visible context (tab, window, or page/browser action popup). Does not automatically accept dangerous downloads. If the download is accepted, then an [`onChanged`](#event-onChanged) event will fire, otherwise nothing will happen. When all the data is fetched into a temporary file and either the download is not dangerous or the danger has been accepted, then the temporary file is renamed to the target filename, the `state` changes to 'complete', and [`onChanged`](#event-onChanged) fires.

#### Parameters

-   The identifier for the [`DownloadItem`](#type-DownloadItem).
    

#### Returns

### cancel()

```
chrome.downloads.cancel(  
  downloadId: number,  
): Promise<void>
```

Cancel a download. When `callback` is run, the download is cancelled, completed, interrupted or doesn't exist anymore.

#### Parameters

-   The id of the download to cancel.
    

#### Returns

### download()

```
chrome.downloads.download(  
  options: [DownloadOptions](#type-DownloadOptions),  
): Promise<number>
```

Download a URL. If the URL uses the HTTP\[S\] protocol, then the request will include all cookies currently set for its hostname. If both `filename` and `saveAs` are specified, then the Save As dialog will be displayed, pre-populated with the specified `filename`. If the download started successfully, `callback` will be called with the new [`DownloadItem`](#type-DownloadItem)'s `downloadId`. If there was an error starting the download, then `callback` will be called with `downloadId=undefined` and [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will contain a descriptive string. The error strings are not guaranteed to remain backwards compatible between releases. Extensions must not parse it.

#### Parameters

-   What to download and how.
    

#### Returns

### erase()

```
chrome.downloads.erase(  
  query: [DownloadQuery](#type-DownloadQuery),  
): Promise<number\[\]>
```

Erase matching [`DownloadItem`](#type-DownloadItem) from history without deleting the downloaded file. An [`onErased`](#event-onErased) event will fire for each [`DownloadItem`](#type-DownloadItem) that matches `query`, then `callback` will be called.

#### Parameters

#### Returns

### getFileIcon()

```
chrome.downloads.getFileIcon(  
  downloadId: number,  
  options?: [GetFileIconOptions](#type-GetFileIconOptions),  
): Promise<string | undefined\>
```

Retrieve an icon for the specified download. For new downloads, file icons are available after the [`onCreated`](#event-onCreated) event has been received. The image returned by this function while a download is in progress may be different from the image returned after the download is complete. Icon retrieval is done by querying the underlying operating system or toolkit depending on the platform. The icon that is returned will therefore depend on a number of factors including state of the download, platform, registered file types and visual theme. If a file icon cannot be determined, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will contain an error message.

#### Parameters

-   The identifier for the download.
    
-   options
    
    [GetFileIconOptions](#type-GetFileIconOptions) optional
    

#### Returns

-   Promise<string | undefined>
    

### open()

```
chrome.downloads.open(  
  downloadId: number,  
): Promise<void>
```

Opens the downloaded file now if the [`DownloadItem`](#type-DownloadItem) is complete; otherwise returns an error through [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). This method requires the `"downloads.open"` permission in addition to the `"downloads"` permission. An [`onChanged`](#event-onChanged) event fires when the item is opened for the first time. This method can only be called in response to a user gesture.

#### Parameters

-   The identifier for the downloaded file.
    

#### Returns

### pause()

```
chrome.downloads.pause(  
  downloadId: number,  
): Promise<void>
```

Pause the download. If the request was successful the download is in a paused state. Otherwise [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) contains an error message. The request will fail if the download is not active.

#### Parameters

-   The id of the download to pause.
    

#### Returns

### removeFile()

```
chrome.downloads.removeFile(  
  downloadId: number,  
): Promise<void>
```

Remove the downloaded file if it exists and the [`DownloadItem`](#type-DownloadItem) is complete; otherwise return an error through [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError).

#### Parameters

#### Returns

### resume()

```
chrome.downloads.resume(  
  downloadId: number,  
): Promise<void>
```

Resume a paused download. If the request was successful the download is in progress and unpaused. Otherwise [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) contains an error message. The request will fail if the download is not active.

#### Parameters

-   The id of the download to resume.
    

#### Returns

### search()

```
chrome.downloads.search(  
  query: [DownloadQuery](#type-DownloadQuery),  
): Promise<[DownloadItem](#type-DownloadItem)\[\]\>
```

Find [`DownloadItem`](#type-DownloadItem). Set `query` to the empty object to get all [`DownloadItem`](#type-DownloadItem). To get a specific [`DownloadItem`](#type-DownloadItem), set only the `id` field. To page through a large number of items, set `orderBy: ['-startTime']`, set `limit` to the number of items per page, and set `startedAfter` to the `startTime` of the last item from the last page.

#### Parameters

#### Returns

### setShelfEnabled()

Deprecated since Chrome 117

```
chrome.downloads.setShelfEnabled(  
  enabled: boolean,  
): void
```

Use [`setUiOptions`](#method-setUiOptions) instead.

Enable or disable the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it. Enabling the shelf while at least one other extension has disabled it will return an error through [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). Requires the `"downloads.shelf"` permission in addition to the `"downloads"` permission.

#### Parameters

### setUiOptions()

```
chrome.downloads.setUiOptions(  
  options: [UiOptions](#type-UiOptions),  
): Promise<void>
```

Change the download UI of every window associated with the current browser profile. As long as at least one extension has set [`UiOptions.enabled`](#property-UiOptions-enabled) to false, the download UI will be hidden. Setting [`UiOptions.enabled`](#property-UiOptions-enabled) to true while at least one other extension has disabled it will return an error through [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). Requires the `"downloads.ui"` permission in addition to the `"downloads"` permission.

#### Parameters

-   Encapsulate a change to the download UI.
    

#### Returns

### show()

```
chrome.downloads.show(  
  downloadId: number,  
): void
```

Show the downloaded file in its folder in a file manager.

#### Parameters

-   The identifier for the downloaded file.
    

### showDefaultFolder()

```
chrome.downloads.showDefaultFolder(): void
```

Show the default Downloads folder in a file manager.

## Events

### onChanged

```
chrome.downloads.onChanged.addListener(  
  callback: function,  
)
```

When any of a [`DownloadItem`](#type-DownloadItem)'s properties except `bytesReceived` and `estimatedEndTime` changes, this event fires with the `downloadId` and an object containing the properties that changed.

#### Parameters

-   The `callback` parameter looks like:
    
    ```
    (downloadDelta: [DownloadDelta](#type-DownloadDelta)) => void
    ```
    

### onCreated

```
chrome.downloads.onCreated.addListener(  
  callback: function,  
)
```

This event fires with the [`DownloadItem`](#type-DownloadItem) object when a download begins.

#### Parameters

-   The `callback` parameter looks like:
    
    ```
    (downloadItem: [DownloadItem](#type-DownloadItem)) => void
    ```
    

### onDeterminingFilename

```
chrome.downloads.onDeterminingFilename.addListener(  
  callback: function,  
)
```

During the filename determination process, extensions will be given the opportunity to override the target [`DownloadItem.filename`](#property-DownloadItem-filename). Each extension may not register more than one listener for this event. Each listener must call `suggest` exactly once, either synchronously or asynchronously. If the listener calls `suggest` asynchronously, then it must return `true`. If the listener neither calls `suggest` synchronously nor returns `true`, then `suggest` will be called automatically. The [`DownloadItem`](#type-DownloadItem) will not complete until all listeners have called `suggest`. Listeners may call `suggest` without any arguments in order to allow the download to use `downloadItem.filename` for its filename, or pass a `suggestion` object to `suggest` in order to override the target filename. If more than one extension overrides the filename, then the last extension installed whose listener passes a `suggestion` object to `suggest` wins. In order to avoid confusion regarding which extension will win, users should not install extensions that may conflict. If the download is initiated by [`download`](#method-download) and the target filename is known before the MIME type and tentative filename have been determined, pass `filename` to [`download`](#method-download) instead.

#### Parameters

-   The `callback` parameter looks like:
    
    ```
    (downloadItem: [DownloadItem](#type-DownloadItem), suggest: function) => void
    ```
    
    -   The `suggest` parameter looks like:
        
        ```
        (suggestion?: [FilenameSuggestion](#type-FilenameSuggestion)) => void
        ```
        
        -   suggestion
            
            [FilenameSuggestion](#type-FilenameSuggestion) optional
            
        
    

### onErased

```
chrome.downloads.onErased.addListener(  
  callback: function,  
)
```

Fires with the `downloadId` when a download is erased from history.

#### Parameters

-   The `callback` parameter looks like:
    
    ```
    (downloadId: number) => void
    ```
    

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-08-11 UTC.

---

## 21. events

*File: pages/events.md*

# chrome.events

<br />

<br />

## Description

The `chrome.events` namespace contains common types used by APIs dispatching events to notify you when something interesting happens.

<br />

<br />

<br />

<br />

## Concepts and usage

An `Event` is an object that lets you be notified when something interesting happens. Here's an
example of using the `chrome.alarms.onAlarm` event to be notified whenever an alarm has elapsed:  

    chrome.alarms.onAlarm.addListener((alarm) => {
      appendToLog(`alarms.onAlarm -- name: ${alarm.name}, scheduledTime: ${alarm.scheduledTime}`);
    });

As the example shows, you register for notification using `addListener()`. The argument to
`addListener()` is always a function that you define to handle the event, but the parameters to the
function depend on which event you're handling. Checking the documentation for [`alarms.onAlarm`](https://developer.chrome.com/docs/extensions/reference/api/alarms#event-onAlarm),
you can see that the function has a single parameter: an [`alarms.Alarm`](https://developer.chrome.com/docs/extensions/reference/api/alarms#type-Alarm) object that has details
about the elapsed alarm.

Example APIs using Events: [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n), [identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime). Most [chrome
APIs](https://developer.chrome.com/docs/extensions/reference/api) do.

### Declarative Event Handlers

The declarative event handlers provide a means to define rules consisting of declarative conditions
and actions. Conditions are evaluated in the browser rather than the JavaScript engine which reduces
roundtrip latencies and allows for very high efficiency.

Declarative event handlers are used for example in the
[Declarative Content API](https://developer.chrome.com/docs/extensions/reference/api/declarativeContent). This page describes the underlying concepts of all declarative event
handlers.

#### Rules

The simplest possible rule consists of one or more conditions and one or more actions:  

    const rule = {
      conditions: [ /* my conditions */ ],
      actions: [ /* my actions */ ]
    };

If any of the conditions is fulfilled, all actions are executed.

In addition to conditions and actions you may give each rule an identifier, which simplifies
unregistering previously registered rules, and a priority to define precedences among rules.
Priorities are only considered if rules conflict each other or need to be executed in a specific
order. Actions are executed in descending order of the priority of their rules.  

    const rule = {
      id: "my rule",  // optional, will be generated if not set.
      priority: 100,  // optional, defaults to 100.
      conditions: [ /* my conditions */ ],
      actions: [ /* my actions */ ]
    };

#### Event objects

Event objects may support rules. These event objects don't call a callback function when
events happen but test whether any registered rule has at least one fulfilled condition and execute
the actions associated with this rule. Event objects supporting the declarative API have three
relevant methods: [`events.Event.addRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-addRules), [`events.Event.removeRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-removeRules), and
[`events.Event.getRules()`](https://developer.chrome.com/docs/extensions/reference/api/events#method-Event-getRules).

#### Add rules

To add rules call the `addRules()` function of the event object. It takes an array of rule instances
as its first parameter and a callback function that is called on completion.  

    const rule_list = [rule1, rule2, ...];
    addRules(rule_list, (details) => {...});

If the rules were inserted successfully, the `details` parameter contains an array of inserted rules
appearing in the same order as in the passed `rule_list` where the optional parameters `id` and
`priority` were filled with the generated values. If any rule is invalid, for example, because it contained
an invalid condition or action, none of the rules are added and the [runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime#property-lastError) variable
is set when the callback function is called. Each rule in `rule_list` must contain a unique
identifier that is not already used by another rule or an empty identifier.
| **Note:** Rules are persistent across browsing sessions. Therefore, you should install rules during extension installation time using the [`runtime.onInstalled`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled) event. Note that this event is also triggered when an extension is updated. Therefore, you should first clear previously installed rules and then register new rules.

#### Remove rules

To remove rules call the `removeRules()` function. It accepts an optional array of rule identifiers
as its first parameter and a callback function as its second parameter.  

    const rule_ids = ["id1", "id2", ...];
    removeRules(rule_ids, () => {...});

If `rule_ids` is an array of identifiers, all rules having identifiers listed in the array are
removed. If `rule_ids` lists an identifier, that is unknown, this identifier is silently ignored. If
`rule_ids` is `undefined`, all registered rules of this extension are removed. The `callback()`
function is called when the rules were removed.

#### Retrieve rules

To retrieve a list of registered rules, call the `getRules()` function. It accepts an
optional array of rule identifiers with the same semantics as `removeRules()` and a callback function.  

    const rule_ids = ["id1", "id2", ...];
    getRules(rule_ids, (details) => {...});

The `details` parameter passed to the `callback()` function refers to an array of rules including
filled optional parameters.

#### Performance

To achieve maximum performance, you should keep the following guidelines in mind.

**Register and unregister rules in bulk.** After each registration or unregistration, Chrome needs to
update internal data structures. This update is an expensive operation.  
Instead of  

```json
const rule1 = {...};
const rule2 = {...};
chrome.declarativeWebRequest.onRequest.addRules([rule1]);
chrome.declarativeWebRequest.onRequest.addRules([rule2]);
```  
Prefer  

```json
const rule1 = {...};
const rule2 = {...};
chrome.declarativeWebRequest.onRequest.addRules([rule1, rule2]);
```

**Prefer substring matching over regular expressions in an [events.UrlFilter](https://developer.chrome.com/docs/extensions/reference/api/events#type-UrlFilter).**
Substring based matching is extremely fast.  
Instead of  

```json
const match = new chrome.declarativeWebRequest.RequestMatcher({
  url: {urlMatches: "example.com/[^?]*foo" }
});
```  
Prefer  

```json
const match = new chrome.declarativeWebRequest.RequestMatcher({
  url: {hostSuffix: "example.com", pathContains: "foo"}
});
```

If there are many rules that share the same actions, merge the rules into one.
Rules trigger their actions as soon as a single condition is fulfilled. This speeds up the
matching and reduces memory consumption for duplicate action sets.  
Instead of  

```json
const condition1 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'example.com' }
});
const condition2 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'foobar.com' }
});
const rule1 = { conditions: [condition1],
                actions: [new chrome.declarativeWebRequest.CancelRequest()]
              };
const rule2 = { conditions: [condition2],
                actions: [new chrome.declarativeWebRequest.CancelRequest()]
              };
chrome.declarativeWebRequest.onRequest.addRules([rule1, rule2]);
```  
Prefer  

```json
const condition1 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'example.com' }
});
const condition2 = new chrome.declarativeWebRequest.RequestMatcher({
  url: { hostSuffix: 'foobar.com' }
});
const rule = { conditions: [condition1, condition2],
              actions: [new chrome.declarativeWebRequest.CancelRequest()]
             };
chrome.declarativeWebRequest.onRequest.addRules([rule]);
```

### Filtered events

Filtered events are a mechanism that allows listeners to specify a subset of events that they are
interested in. A listener that uses a filter won't be invoked for events that don't pass the
filter, which makes the listening code more declarative and efficient. A [service worker](https://developer.chrome.com/docs/extensions/mv3/service_workers) need
not be woken up to handle events it doesn't care about.

Filtered events are intended to allow a transition from manual filtering code.  
Instead of  

```json
chrome.webNavigation.onCommitted.addListener((event) => {
  if (hasHostSuffix(event.url, 'google.com') ||
      hasHostSuffix(event.url, 'google.com.au')) {
    // ...
  }
});
```  
Prefer  

```json
chrome.webNavigation.onCommitted.addListener((event) => {
  // ...
}, {url: [{hostSuffix: 'google.com'},
          {hostSuffix: 'google.com.au'}]});
```

Events support specific filters that are meaningful to that event. The list of filters that an event
supports will be listed in the documentation for that event in the "filters" section.

When matching URLs (as in the example above), event filters support the same URL matching
capabilities as expressible with a [`events.UrlFilter`](https://developer.chrome.com/docs/extensions/reference/api/events#type-UrlFilter), except for scheme and port matching.

<br />

## Types

### Event

An object which allows the addition and removal of listeners for a Chrome event.  

#### Properties

  - addListener  
  void

  Registers an event listener *callback* to an event.


  The `addListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

    Called when an event occurs. The parameters of this function depend on the type of event.
  - addRules  
  void

  Registers rules to handle events.


  The `addRules` function looks like:  

  ```typescript
  (rules: Rule<anyany>[], callback?: function) => {...}
  ```

  <br />

    - rules  
    [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

    Rules to be registered. These do not replace previously registered rules.
    - callback  
    function optional


    The `callback` parameter looks like:  

    ```typescript
    (rules: Rule<anyany>[]) => void
    ```

    <br />

      - rules  
      [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

      Rules that were registered, the optional parameters are filled with values.
  - getRules  
  void

  Returns currently registered rules.


  The `getRules` function looks like:  

  ```typescript
  (ruleIdentifiers?: string[], callback: function) => {...}
  ```

  <br />

    - ruleIdentifiers  
    string\[\] optional

    If an array is passed, only rules with identifiers contained in this array are returned.
    - callback  
    function


    The `callback` parameter looks like:  

    ```typescript
    (rules: Rule<anyany>[]) => void
    ```

    <br />

      - rules  
      [Rule](https://developer.chrome.com/docs/extensions/reference/api/events#type-Rule)\<anyany\>\[\]

      Rules that were registered, the optional parameters are filled with values.
  - hasListener  
  void


  The `hasListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

  Listener whose registration status shall be tested.  
    - returns  
    boolean

    True if *callback* is registered to the event.
  - hasListeners  
  void


  The `hasListeners` function looks like:  

  ```typescript
  () => {...}
  ```

  <br />

    - returns  
    boolean

    True if any event listeners are registered to the event.
  - removeListener  
  void

  Deregisters an event listener *callback* from an event.


  The `removeListener` function looks like:  

  ```typescript
  (callback: H) => {...}
  ```

  <br />

    - callback  
    H

    Listener that shall be unregistered.
  - removeRules  
  void

  Unregisters currently registered rules.


  The `removeRules` function looks like:  

  ```typescript
  (ruleIdentifiers?: string[], callback?: function) => {...}
  ```

  <br />

    - ruleIdentifiers  
    string\[\] optional

    If an array is passed, only rules with identifiers contained in this array are unregistered.
    - callback  
    function optional


    The `callback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

### Rule

Description of a declarative rule for handling events.  

#### Properties

  - actions  
  any\[\]

  List of actions that are triggered if one of the conditions is fulfilled.
  - conditions  
  any\[\]

  List of conditions that can trigger the actions.
  - id  
  string optional

  Optional identifier that allows referencing this rule.
  - priority  
  number optional

  Optional priority of this rule. Defaults to 100.
  - tags  
  string\[\] optional

Tags can be used to annotate rules and perform operations on sets of rules.  

### UrlFilter

Filters URLs for various criteria. See [event filtering](https://developer.chrome.com/docs/extensions/reference/events/#filtered). All criteria are case sensitive.  

#### Properties

  - cidrBlocks  
  string\[\] optional  
  Chrome 123+

  Matches if the host part of the URL is an IP address and is contained in any of the CIDR blocks specified in the array.
  - hostContains  
  string optional

  Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.
  - hostEquals  
  string optional

  Matches if the host name of the URL is equal to a specified string.
  - hostPrefix  
  string optional

  Matches if the host name of the URL starts with a specified string.
  - hostSuffix  
  string optional

  Matches if the host name of the URL ends with a specified string.
  - originAndPathMatches  
  string optional

  Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the [RE2 syntax](https://github.com/google/re2/blob/master/doc/syntax.txt).
  - pathContains  
  string optional

  Matches if the path segment of the URL contains a specified string.
  - pathEquals  
  string optional

  Matches if the path segment of the URL is equal to a specified string.
  - pathPrefix  
  string optional

  Matches if the path segment of the URL starts with a specified string.
  - pathSuffix  
  string optional

  Matches if the path segment of the URL ends with a specified string.
  - ports  
  (number \| number\[\])\[\] optional

  Matches if the port of the URL is contained in any of the specified port lists. For example `[80, 443, [1000, 1200]]` matches all requests on port 80, 443 and in the range 1000-1200.
  - queryContains  
  string optional

  Matches if the query segment of the URL contains a specified string.
  - queryEquals  
  string optional

  Matches if the query segment of the URL is equal to a specified string.
  - queryPrefix  
  string optional

  Matches if the query segment of the URL starts with a specified string.
  - querySuffix  
  string optional

  Matches if the query segment of the URL ends with a specified string.
  - schemes  
  string\[\] optional

  Matches if the scheme of the URL is equal to any of the schemes specified in the array.
  - urlContains  
  string optional

  Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlEquals  
  string optional

  Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlMatches  
  string optional

  Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the [RE2 syntax](https://github.com/google/re2/blob/master/doc/syntax.txt).
  - urlPrefix  
  string optional

  Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.
  - urlSuffix  
  string optional

  Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.

<br />

---

## 22. extension

*File: pages/extension.md*

# chrome.extensionTypes

<br />

<br />

## Description

The `chrome.extensionTypes` API contains type declarations for Chrome extensions.

<br />

<br />

<br />

<br />

<br />

## Types

### ColorArray

Chrome 139+  

#### Type

\[number, number, number, number\]  

### CSSOrigin

Chrome 66+

The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of injected CSS.  

#### Enum

"author"   
"user"   

<br />

### DeleteInjectionDetails

Chrome 87+

Details of the CSS to remove. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the CSS should be removed from all frames of current page. By default, it's `false` and is only removed from the top frame. If `true` and `frameId` is set, then the code is removed from the selected frame and all of its child frames.
  - code  
  string optional

  CSS code to remove.
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to remove. Defaults to `"author"`.
  - file  
  string optional

  CSS file to remove.
  - frameId  
  number optional

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) from where the CSS should be removed. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

If matchAboutBlank is true, then the code is also removed from about:blank and about:srcdoc frames if your extension has access to its parent document. By default it is `false`.  

### DocumentLifecycle

Chrome 106+

The document lifecycle of the frame.  

#### Enum

"prerender"   
"active"   
"cached"   
"pending_deletion"   

<br />

### ExecutionWorld

Chrome 111+

The JavaScript world for a script to execute within. Can either be an isolated world unique to this extension, the main world of the DOM which is shared with the page's JavaScript, or a user scripts world that is only available for scripts registered with the User Scripts API.  

#### Enum

"ISOLATED"   
"MAIN"   
"USER_SCRIPT"   

<br />

### FrameType

Chrome 106+

The type of frame.  

#### Enum

"outermost_frame"   
"fenced_frame"   
"sub_frame"   

<br />

### ImageDataType

Chrome 139+

Pixel data for an image. Must be an ImageData object; for example, from a `canvas` element.  

#### Type

ImageData  

### ImageDetails

Details about the format, quality, and area of an image.  

#### Properties

  - format  
  [ImageFormat](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-ImageFormat) optional

  The format of the resulting image. Default is `"jpeg"`.
  - quality  
  number optional

When format is `"jpeg"`, controls the quality of the resulting image. This value is ignored for PNG images. As quality is decreased, the resulting image will have more visual artifacts, and the number of bytes needed to store it will decrease.  

### ImageFormat

Chrome 44+

The format of an image.  

#### Enum

"jpeg"   
"png"   

<br />

### InjectDetails

Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the JavaScript or CSS should be injected into all frames of current page. By default, it's `false` and is only injected into the top frame. If `true` and `frameId` is set, then the code is inserted in the selected frame and all of its child frames.
  - code  
  string optional

  JavaScript or CSS code to inject.

  **Warning:** Be careful using the `code` parameter. Incorrect use of it may open your extension to [cross site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional  
  Chrome 66+

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to inject. This may only be specified for CSS, not JavaScript. Defaults to `"author"`.
  - file  
  string optional

  JavaScript or CSS file to inject.
  - frameId  
  number optional  
  Chrome 50+

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) where the script or CSS should be injected. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

  If matchAboutBlank is true, then the code is also injected in about:blank and about:srcdoc frames if your extension has access to its parent document. Code cannot be inserted in top-level about:-frames. By default it is `false`.
  - runAt  
  [RunAt](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-RunAt) optional

The soonest that the JavaScript or CSS will be injected into the tab. Defaults to "document_idle".  

### RunAt

Chrome 44+

The soonest that the JavaScript or CSS will be injected into the tab.  

#### Enum

"document_start"   
Script is injected after any files from css, but before any other DOM is constructed or any other script is run.
"document_end"   
Script is injected immediately after the DOM is complete, but before subresources like images and frames have loaded.
"document_idle"   
The browser chooses a time to inject the script between "document_end" and immediately after the `window.onload` event fires. The exact moment of injection depends on how complex the document is and how long it is taking to load, and is optimized for page load speed. Content scripts running at "document_idle" don't need to listen for the `window.onload` event; they are guaranteed to run after the DOM completes. If a script definitely needs to run after `window.onload`, the extension can check if `onload` has already fired by using the `document.readyState` property.

<br />

<br />

---

## 23. extensionTypes

*File: pages/extensionTypes.md*

# chrome.extensionTypes

<br />

<br />

## Description

The `chrome.extensionTypes` API contains type declarations for Chrome extensions.

<br />

<br />

<br />

<br />

<br />

## Types

### ColorArray

Chrome 139+  

#### Type

\[number, number, number, number\]  

### CSSOrigin

Chrome 66+

The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of injected CSS.  

#### Enum

"author"   
"user"   

<br />

### DeleteInjectionDetails

Chrome 87+

Details of the CSS to remove. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the CSS should be removed from all frames of current page. By default, it's `false` and is only removed from the top frame. If `true` and `frameId` is set, then the code is removed from the selected frame and all of its child frames.
  - code  
  string optional

  CSS code to remove.
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to remove. Defaults to `"author"`.
  - file  
  string optional

  CSS file to remove.
  - frameId  
  number optional

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) from where the CSS should be removed. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

If matchAboutBlank is true, then the code is also removed from about:blank and about:srcdoc frames if your extension has access to its parent document. By default it is `false`.  

### DocumentLifecycle

Chrome 106+

The document lifecycle of the frame.  

#### Enum

"prerender"   
"active"   
"cached"   
"pending_deletion"   

<br />

### ExecutionWorld

Chrome 111+

The JavaScript world for a script to execute within. Can either be an isolated world unique to this extension, the main world of the DOM which is shared with the page's JavaScript, or a user scripts world that is only available for scripts registered with the User Scripts API.  

#### Enum

"ISOLATED"   
"MAIN"   
"USER_SCRIPT"   

<br />

### FrameType

Chrome 106+

The type of frame.  

#### Enum

"outermost_frame"   
"fenced_frame"   
"sub_frame"   

<br />

### ImageDataType

Chrome 139+

Pixel data for an image. Must be an ImageData object; for example, from a `canvas` element.  

#### Type

ImageData  

### ImageDetails

Details about the format, quality, and area of an image.  

#### Properties

  - format  
  [ImageFormat](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-ImageFormat) optional

  The format of the resulting image. Default is `"jpeg"`.
  - quality  
  number optional

When format is `"jpeg"`, controls the quality of the resulting image. This value is ignored for PNG images. As quality is decreased, the resulting image will have more visual artifacts, and the number of bytes needed to store it will decrease.  

### ImageFormat

Chrome 44+

The format of an image.  

#### Enum

"jpeg"   
"png"   

<br />

### InjectDetails

Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the JavaScript or CSS should be injected into all frames of current page. By default, it's `false` and is only injected into the top frame. If `true` and `frameId` is set, then the code is inserted in the selected frame and all of its child frames.
  - code  
  string optional

  JavaScript or CSS code to inject.

  **Warning:** Be careful using the `code` parameter. Incorrect use of it may open your extension to [cross site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional  
  Chrome 66+

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to inject. This may only be specified for CSS, not JavaScript. Defaults to `"author"`.
  - file  
  string optional

  JavaScript or CSS file to inject.
  - frameId  
  number optional  
  Chrome 50+

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) where the script or CSS should be injected. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

  If matchAboutBlank is true, then the code is also injected in about:blank and about:srcdoc frames if your extension has access to its parent document. Code cannot be inserted in top-level about:-frames. By default it is `false`.
  - runAt  
  [RunAt](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-RunAt) optional

The soonest that the JavaScript or CSS will be injected into the tab. Defaults to "document_idle".  

### RunAt

Chrome 44+

The soonest that the JavaScript or CSS will be injected into the tab.  

#### Enum

"document_start"   
Script is injected after any files from css, but before any other DOM is constructed or any other script is run.
"document_end"   
Script is injected immediately after the DOM is complete, but before subresources like images and frames have loaded.
"document_idle"   
The browser chooses a time to inject the script between "document_end" and immediately after the `window.onload` event fires. The exact moment of injection depends on how complex the document is and how long it is taking to load, and is optimized for page load speed. Content scripts running at "document_idle" don't need to listen for the `window.onload` event; they are guaranteed to run after the DOM completes. If a script definitely needs to run after `window.onload`, the extension can check if `onload` has already fired by using the `document.readyState` property.

<br />

<br />

---

## 24. fileBrowserHandler

*File: pages/fileBrowserHandler.md*

# chrome.extensionTypes

<br />

<br />

## Description

The `chrome.extensionTypes` API contains type declarations for Chrome extensions.

<br />

<br />

<br />

<br />

<br />

## Types

### ColorArray

Chrome 139+  

#### Type

\[number, number, number, number\]  

### CSSOrigin

Chrome 66+

The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of injected CSS.  

#### Enum

"author"   
"user"   

<br />

### DeleteInjectionDetails

Chrome 87+

Details of the CSS to remove. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the CSS should be removed from all frames of current page. By default, it's `false` and is only removed from the top frame. If `true` and `frameId` is set, then the code is removed from the selected frame and all of its child frames.
  - code  
  string optional

  CSS code to remove.
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to remove. Defaults to `"author"`.
  - file  
  string optional

  CSS file to remove.
  - frameId  
  number optional

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) from where the CSS should be removed. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

If matchAboutBlank is true, then the code is also removed from about:blank and about:srcdoc frames if your extension has access to its parent document. By default it is `false`.  

### DocumentLifecycle

Chrome 106+

The document lifecycle of the frame.  

#### Enum

"prerender"   
"active"   
"cached"   
"pending_deletion"   

<br />

### ExecutionWorld

Chrome 111+

The JavaScript world for a script to execute within. Can either be an isolated world unique to this extension, the main world of the DOM which is shared with the page's JavaScript, or a user scripts world that is only available for scripts registered with the User Scripts API.  

#### Enum

"ISOLATED"   
"MAIN"   
"USER_SCRIPT"   

<br />

### FrameType

Chrome 106+

The type of frame.  

#### Enum

"outermost_frame"   
"fenced_frame"   
"sub_frame"   

<br />

### ImageDataType

Chrome 139+

Pixel data for an image. Must be an ImageData object; for example, from a `canvas` element.  

#### Type

ImageData  

### ImageDetails

Details about the format, quality, and area of an image.  

#### Properties

  - format  
  [ImageFormat](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-ImageFormat) optional

  The format of the resulting image. Default is `"jpeg"`.
  - quality  
  number optional

When format is `"jpeg"`, controls the quality of the resulting image. This value is ignored for PNG images. As quality is decreased, the resulting image will have more visual artifacts, and the number of bytes needed to store it will decrease.  

### ImageFormat

Chrome 44+

The format of an image.  

#### Enum

"jpeg"   
"png"   

<br />

### InjectDetails

Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.  

#### Properties

  - allFrames  
  boolean optional

  If allFrames is `true`, implies that the JavaScript or CSS should be injected into all frames of current page. By default, it's `false` and is only injected into the top frame. If `true` and `frameId` is set, then the code is inserted in the selected frame and all of its child frames.
  - code  
  string optional

  JavaScript or CSS code to inject.

  **Warning:** Be careful using the `code` parameter. Incorrect use of it may open your extension to [cross site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks
  - cssOrigin  
  [CSSOrigin](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-CSSOrigin) optional  
  Chrome 66+

  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to inject. This may only be specified for CSS, not JavaScript. Defaults to `"author"`.
  - file  
  string optional

  JavaScript or CSS file to inject.
  - frameId  
  number optional  
  Chrome 50+

  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) where the script or CSS should be injected. Defaults to 0 (the top-level frame).
  - matchAboutBlank  
  boolean optional

  If matchAboutBlank is true, then the code is also injected in about:blank and about:srcdoc frames if your extension has access to its parent document. Code cannot be inserted in top-level about:-frames. By default it is `false`.
  - runAt  
  [RunAt](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-RunAt) optional

The soonest that the JavaScript or CSS will be injected into the tab. Defaults to "document_idle".  

### RunAt

Chrome 44+

The soonest that the JavaScript or CSS will be injected into the tab.  

#### Enum

"document_start"   
Script is injected after any files from css, but before any other DOM is constructed or any other script is run.
"document_end"   
Script is injected immediately after the DOM is complete, but before subresources like images and frames have loaded.
"document_idle"   
The browser chooses a time to inject the script between "document_end" and immediately after the `window.onload` event fires. The exact moment of injection depends on how complex the document is and how long it is taking to load, and is optimized for page load speed. Content scripts running at "document_idle" don't need to listen for the `window.onload` event; they are guaranteed to run after the DOM completes. If a script definitely needs to run after `window.onload`, the extension can check if `onload` has already fired by using the `document.readyState` property.

<br />

<br />

---

## 25. fileSystemProvider

*File: pages/fileSystemProvider.md*

# chrome.fileSystemProvider

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.fileSystemProvider` API to create file systems, that can be accessible from the file manager on Chrome OS.

<br />

<br />

## Permissions

`fileSystemProvider`  

<br />

<br />

## Availability

ChromeOS only

<br />

<br />

You must declare the "fileSystemProvider" permission and section in the [extension manifest](https://developer.chrome.com/extensions/manifest) to use the File System Provider API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "fileSystemProvider"
      ],
      ...
      "file_system_provider_capabilities": {
        "configurable": true,
        "watchable": false,
        "multiple_mounts": true,
        "source": "network"
      },
      ...
    }

The file_system_provider section must be declared as follows:

**`configurable` (boolean)** - optional
:   Whether configuring via onConfigureRequested is supported. By default: false.

**`multiple_mounts` (boolean)** - optional
:   Whether multiple (more than one) mounted file systems are supported. By default: false.

**`watchable` (boolean)** - optional
:   Whether setting watchers and notifying about changes is supported. By default: false.

**`source` (enum of "file", "device", or "network")** - required
:   Source of data for mounted file systems.

Files app uses above information in order to render related UI elements appropriately. For example, if `configurable` is set to true, then a menu item for configuring volumes will be rendered. Similarly, if `multiple_mounts` is set to `true`, then Files app will allow to add more than one mount points from the UI. If `watchable` is `false`, then a refresh button will be rendered. Note, that if possible you should add support for watchers, so changes on the file system can be reflected immediately and automatically.

## Overview

File System Provider API allows extensions to support virtual file systems, which are available in the file manager on ChromeOS. Use cases include decompressing archives and accessing files in a cloud service other than Drive.

## Mounting file systems

Providing extensions can either provide file system contents from an external source (such as a remote server or a USB device), or using a local file (such as an archive) as its input.

In order to write file systems which are file handlers (source is `"file"`) the provider must be a packaged app, as the `onLaunched` event is not available to extensions.

If the source is network or a device, then the file system should be mounted when [onMountRequested](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onMountRequested) event is called.

| [Source](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#manifest-source) of the file system data |                                                       Entry point                                                        |
|---------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `"file"`                                                                                                                        | Available to packaged apps only.                                                                                         |
| `"device"` or `"network"`                                                                                                       | [onMountRequested](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onMountRequested) |

## Configuring file systems

Provided file systems once mounted can be configured via the [onConfigureRequested](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onConfigureRequested) event. It's especially useful for file systems which provide contents via network in order to set proper credentials. Handling this event is optional.

## Life cycle

Provided file systems once mounted are remembered by Chrome and remounted automatically after reboot or restart. Hence, once a file system is [mounted](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#method-mount) by a providing extension, it will stay until either the extension is unloaded, or the extension calls the [unmount](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#method-unmount) method.

<br />

## Types

### AbortRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - operationRequestId  
  number

  An ID of the request to be aborted.
  - requestId  
  number

The unique identifier of this request.  

### Action

Chrome 45+  

#### Properties

  - id  
  string

  The identifier of the action. Any string or [`CommonActionId`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CommonActionId) for common actions.
  - title  
  string optional

The title of the action. It may be ignored for common actions.  

### AddWatcherRequestedOptions

#### Properties

  - entryPath  
  string

  The path of the entry to be observed.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - recursive  
  boolean

  Whether observing should include all child entries recursively. It can be true for directories only.
  - requestId  
  number

The unique identifier of this request.  

### Change

#### Properties

  - changeType  
  [ChangeType](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ChangeType)

  The type of the change which happened to the entry.
  - cloudFileInfo  
  [CloudFileInfo](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CloudFileInfo) optional  
  Chrome 125+

  Information relating to the file if backed by a cloud file system.
  - entryPath  
  string

The path of the changed entry.  

### ChangeType

Type of a change detected on the observed directory.  

#### Enum

"CHANGED"   
"DELETED"   

<br />

### CloseFileRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - openRequestId  
  number

  A request ID used to open the file.
  - requestId  
  number

The unique identifier of this request.  

### CloudFileInfo

Chrome 125+  

#### Properties

  - versionTag  
  string optional

A tag that represents the version of the file.  

### CloudIdentifier

Chrome 117+  

#### Properties

  - id  
  string

  The provider's identifier for the given file/directory.
  - providerName  
  string

Identifier for the cloud storage provider (e.g. 'drive.google.com').  

### CommonActionId

Chrome 45+

List of common actions. `"SHARE"` is for sharing files with others. `"SAVE_FOR_OFFLINE"` for pinning (saving for offline access). `"OFFLINE_NOT_NECESSARY"` for notifying that the file doesn't need to be stored for offline access anymore. Used by [`onGetActionsRequested`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onGetActionsRequested) and [`onExecuteActionRequested`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onExecuteActionRequested).  

#### Enum

"SAVE_FOR_OFFLINE"   
"OFFLINE_NOT_NECESSARY"   
"SHARE"   

<br />

### ConfigureRequestedOptions

Chrome 44+  

#### Properties

  - fileSystemId  
  string

  The identifier of the file system to be configured.
  - requestId  
  number

The unique identifier of this request.  

### CopyEntryRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - requestId  
  number

  The unique identifier of this request.
  - sourcePath  
  string

  The source path of the entry to be copied.
  - targetPath  
  string

The destination path for the copy operation.  

### CreateDirectoryRequestedOptions

#### Properties

  - directoryPath  
  string

  The path of the directory to be created.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - recursive  
  boolean

  Whether the operation is recursive (for directories only).
  - requestId  
  number

The unique identifier of this request.  

### CreateFileRequestedOptions

#### Properties

  - filePath  
  string

  The path of the file to be created.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - requestId  
  number

The unique identifier of this request.  

### DeleteEntryRequestedOptions

#### Properties

  - entryPath  
  string

  The path of the entry to be deleted.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - recursive  
  boolean

  Whether the operation is recursive (for directories only).
  - requestId  
  number

The unique identifier of this request.  

### EntryMetadata

#### Properties

  - cloudFileInfo  
  [CloudFileInfo](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CloudFileInfo) optional  
  Chrome 125+

  Information that identifies a specific file in the underlying cloud file system. Must be provided if requested in `options` and the file is backed by cloud storage.
  - cloudIdentifier  
  [CloudIdentifier](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CloudIdentifier) optional  
  Chrome 117+

  Cloud storage representation of this entry. Must be provided if requested in `options` and the file is backed by cloud storage. For local files not backed by cloud storage, it should be undefined when requested.
  - isDirectory  
  boolean optional

  True if it is a directory. Must be provided if requested in `options`.
  - mimeType  
  string optional

  Mime type for the entry. Always optional, but should be provided if requested in `options`.
  - modificationTime  
  Date optional

  The last modified time of this entry. Must be provided if requested in `options`.
  - name  
  string optional

  Name of this entry (not full path name). Must not contain '/'. For root it must be empty. Must be provided if requested in `options`.
  - size  
  number optional

  File size in bytes. Must be provided if requested in `options`.
  - thumbnail  
  string optional

Thumbnail image as a data URI in either PNG, JPEG or WEBP format, at most 32 KB in size. Optional, but can be provided only when explicitly requested by the [`onGetMetadataRequested`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onGetMetadataRequested) event.  

### ExecuteActionRequestedOptions

Chrome 45+  

#### Properties

  - actionId  
  string

  The identifier of the action to be executed.
  - entryPaths  
  string\[\]  
  Chrome 47+

  The set of paths of the entries to be used for the action.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - requestId  
  number

The unique identifier of this request.  

### FileSystemInfo

#### Properties

  - displayName  
  string

  A human-readable name for the file system.
  - fileSystemId  
  string

  The identifier of the file system.
  - openedFiles  
  [OpenedFile](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-OpenedFile)\[\]

  List of currently opened files.
  - openedFilesLimit  
  number

  The maximum number of files that can be opened at once. If 0, then not limited.
  - supportsNotifyTag  
  boolean optional  
  Chrome 45+

  Whether the file system supports the `tag` field for observing directories.
  - watchers  
  [Watcher](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-Watcher)\[\]  
  Chrome 45+

  List of watchers.
  - writable  
  boolean

Whether the file system supports operations which may change contents of the file system (such as creating, deleting or writing to files).  

### GetActionsRequestedOptions

Chrome 45+  

#### Properties

  - entryPaths  
  string\[\]  
  Chrome 47+

  List of paths of entries for the list of actions.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - requestId  
  number

The unique identifier of this request.  

### GetMetadataRequestedOptions

#### Properties

  - cloudFileInfo  
  boolean  
  Chrome 125+

  Set to `true` if `cloudFileInfo` value is requested.
  - cloudIdentifier  
  boolean  
  Chrome 117+

  Set to `true` if `cloudIdentifier` value is requested.
  - entryPath  
  string

  The path of the entry to fetch metadata about.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - isDirectory  
  boolean  
  Chrome 49+

  Set to `true` if `is_directory` value is requested.
  - mimeType  
  boolean  
  Chrome 49+

  Set to `true` if `mimeType` value is requested.
  - modificationTime  
  boolean  
  Chrome 49+

  Set to `true` if `modificationTime` value is requested.
  - name  
  boolean  
  Chrome 49+

  Set to `true` if `name` value is requested.
  - requestId  
  number

  The unique identifier of this request.
  - size  
  boolean  
  Chrome 49+

  Set to `true` if `size` value is requested.
  - thumbnail  
  boolean

Set to `true` if `thumbnail` value is requested.  

### MountOptions

#### Properties

  - displayName  
  string

  A human-readable name for the file system.
  - fileSystemId  
  string

  The string indentifier of the file system. Must be unique per each extension.
  - openedFilesLimit  
  number optional

  The maximum number of files that can be opened at once. If not specified, or 0, then not limited.
  - persistent  
  boolean optional  
  Chrome 64+

  Whether the framework should resume the file system at the next sign-in session. True by default.
  - supportsNotifyTag  
  boolean optional  
  Chrome 45+

  Whether the file system supports the `tag` field for observed directories.
  - writable  
  boolean optional

Whether the file system supports operations which may change contents of the file system (such as creating, deleting or writing to files).  

### MoveEntryRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - requestId  
  number

  The unique identifier of this request.
  - sourcePath  
  string

  The source path of the entry to be moved into a new place.
  - targetPath  
  string

The destination path for the copy operation.  

### NotifyOptions

#### Properties

  - changeType  
  [ChangeType](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ChangeType)

  The type of the change which happened to the observed entry. If it is DELETED, then the observed entry will be automatically removed from the list of observed entries.
  - changes  
  [Change](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-Change)\[\] optional

  List of changes to entries within the observed directory (including the entry itself)
  - fileSystemId  
  string

  The identifier of the file system related to this change.
  - observedPath  
  string

  The path of the observed entry.
  - recursive  
  boolean

  Mode of the observed entry.
  - tag  
  string optional

Tag for the notification. Required if the file system was mounted with the `supportsNotifyTag` option. Note, that this flag is necessary to provide notifications about changes which changed even when the system was shutdown.  

### OpenedFile

#### Properties

  - filePath  
  string

  The path of the opened file.
  - mode  
  [OpenFileMode](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-OpenFileMode)

  Whether the file was opened for reading or writing.
  - openRequestId  
  number

A request ID to be be used by consecutive read/write and close requests.  

### OpenFileMode

Mode of opening a file. Used by [`onOpenFileRequested`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onOpenFileRequested).  

#### Enum

"READ"   
"WRITE"   

<br />

### OpenFileRequestedOptions

#### Properties

  - filePath  
  string

  The path of the file to be opened.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - mode  
  [OpenFileMode](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-OpenFileMode)

  Whether the file will be used for reading or writing.
  - requestId  
  number

A request ID which will be used by consecutive read/write and close requests.  

### ProviderError

Error codes used by providing extensions in response to requests as well as in case of errors when calling methods of the API. For success, `"OK"` must be used.  

#### Enum

"OK"   
"FAILED"   
"IN_USE"   
"EXISTS"   
"NOT_FOUND"   
"ACCESS_DENIED"   
"TOO_MANY_OPENED"   
"NO_MEMORY"   
"NO_SPACE"   
"NOT_A_DIRECTORY"   
"INVALID_OPERATION"   
"SECURITY"   
"ABORT"   
"NOT_A_FILE"   
"NOT_EMPTY"   
"INVALID_URL"   
"IO"   

<br />

### ReadDirectoryRequestedOptions

#### Properties

  - directoryPath  
  string

  The path of the directory which contents are requested.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - isDirectory  
  boolean  
  Chrome 49+

  Set to `true` if `is_directory` value is requested.
  - mimeType  
  boolean  
  Chrome 49+

  Set to `true` if `mimeType` value is requested.
  - modificationTime  
  boolean  
  Chrome 49+

  Set to `true` if `modificationTime` value is requested.
  - name  
  boolean  
  Chrome 49+

  Set to `true` if `name` value is requested.
  - requestId  
  number

  The unique identifier of this request.
  - size  
  boolean  
  Chrome 49+

  Set to `true` if `size` value is requested.
  - thumbnail  
  boolean  
  Chrome 49+

Set to `true` if `thumbnail` value is requested.  

### ReadFileRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - length  
  number

  Number of bytes to be returned.
  - offset  
  number

  Position in the file (in bytes) to start reading from.
  - openRequestId  
  number

  A request ID used to open the file.
  - requestId  
  number

The unique identifier of this request.  

### RemoveWatcherRequestedOptions

#### Properties

  - entryPath  
  string

  The path of the watched entry.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - recursive  
  boolean

  Mode of the watcher.
  - requestId  
  number

The unique identifier of this request.  

### TruncateRequestedOptions

#### Properties

  - filePath  
  string

  The path of the file to be truncated.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - length  
  number

  Number of bytes to be retained after the operation completes.
  - requestId  
  number

The unique identifier of this request.  

### UnmountOptions

#### Properties

  - fileSystemId  
  string

The identifier of the file system to be unmounted.  

### UnmountRequestedOptions

#### Properties

  - fileSystemId  
  string

  The identifier of the file system to be unmounted.
  - requestId  
  number

The unique identifier of this request.  

### Watcher

#### Properties

  - entryPath  
  string

  The path of the entry being observed.
  - lastTag  
  string optional

  Tag used by the last notification for the watcher.
  - recursive  
  boolean

Whether watching should include all child entries recursively. It can be true for directories only.  

### WriteFileRequestedOptions

#### Properties

  - data  
  ArrayBuffer

  Buffer of bytes to be written to the file.
  - fileSystemId  
  string

  The identifier of the file system related to this operation.
  - offset  
  number

  Position in the file (in bytes) to start writing the bytes from.
  - openRequestId  
  number

  A request ID used to open the file.
  - requestId  
  number

  The unique identifier of this request.

## Methods

### get()

```typescript
chrome.fileSystemProvider.get(
  fileSystemId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-FileSystemInfo>
```

Returns information about a file system with the passed `fileSystemId`.  

#### Parameters

  - fileSystemId  
string  

#### Returns

  - Promise\<[FileSystemInfo](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-FileSystemInfo)\>  
Chrome 96+  

### getAll()

```typescript
chrome.fileSystemProvider.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-FileSystemInfo[]>
```

Returns all file systems mounted by the extension.  

#### Returns

  - Promise\<[FileSystemInfo](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-FileSystemInfo)\[\]\>  
Chrome 96+  

### mount()

```typescript
chrome.fileSystemProvider.mount(
  options: MountOptions,
): Promise<void>
```

Mounts a file system with the given `fileSystemId` and `displayName`. `displayName` will be shown in the left panel of the Files app. `displayName` can contain any characters including '/', but cannot be an empty string. `displayName` must be descriptive but doesn't have to be unique. The `fileSystemId` must not be an empty string.

Depending on the type of the file system being mounted, the `source` option must be set appropriately.

In case of an error, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set with a corresponding error code.  

#### Parameters

  - options  
[MountOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-MountOptions)  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### notify()

Chrome 45+

```typescript
chrome.fileSystemProvider.notify(
  options: NotifyOptions,
): Promise<void>
```

Notifies about changes in the watched directory at `observedPath` in `recursive` mode. If the file system is mounted with `supportsNotifyTag`, then `tag` must be provided, and all changes since the last notification always reported, even if the system was shutdown. The last tag can be obtained with [`getAll`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#method-getAll).

To use, the `file_system_provider.notify` manifest option must be set to true.

Value of `tag` can be any string which is unique per call, so it's possible to identify the last registered notification. Eg. if the providing extension starts after a reboot, and the last registered notification's tag is equal to "123", then it should call [`notify`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#method-notify) for all changes which happened since the change tagged as "123". It cannot be an empty string.

Not all providers are able to provide a tag, but if the file system has a changelog, then the tag can be eg. a change number, or a revision number.

Note that if a parent directory is removed, then all descendant entries are also removed, and if they are watched, then the API must be notified about the fact. Also, if a directory is renamed, then all descendant entries are in fact removed, as there is no entry under their original paths anymore.

In case of an error, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set will a corresponding error code.  

#### Parameters

  - options  
[NotifyOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-NotifyOptions)  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### unmount()

```typescript
chrome.fileSystemProvider.unmount(
  options: UnmountOptions,
): Promise<void>
```

Unmounts a file system with the given `fileSystemId`. It must be called after [`onUnmountRequested`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#event-onUnmountRequested) is invoked. Also, the providing extension can decide to perform unmounting if not requested (eg. in case of lost connection, or a file error).

In case of an error, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set with a corresponding error code.  

#### Parameters

  - options  
[UnmountOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-UnmountOptions)  

#### Returns

  - Promise\<void\>  
  Chrome 96+

## Events

### onAbortRequested

```typescript
chrome.fileSystemProvider.onAbortRequested.addListener(
  callback: function,
)
```

Raised when aborting an operation with `operationRequestId` is requested. The operation executed with `operationRequestId` must be immediately stopped and `successCallback` of this abort request executed. If aborting fails, then `errorCallback` must be called. Note, that callbacks of the aborted operation must not be called, as they will be ignored. Despite calling `errorCallback`, the request may be forcibly aborted.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: AbortRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [AbortRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-AbortRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onAddWatcherRequested

Chrome 45+

```typescript
chrome.fileSystemProvider.onAddWatcherRequested.addListener(
  callback: function,
)
```

Raised when setting a new directory watcher is requested. If an error occurs, then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: AddWatcherRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [AddWatcherRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-AddWatcherRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onCloseFileRequested

```typescript
chrome.fileSystemProvider.onCloseFileRequested.addListener(
  callback: function,
)
```

Raised when opening a file previously opened with `openRequestId` is requested to be closed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: CloseFileRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [CloseFileRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CloseFileRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onConfigureRequested

Chrome 44+

```typescript
chrome.fileSystemProvider.onConfigureRequested.addListener(
  callback: function,
)
```

Raised when showing a configuration dialog for `fileSystemId` is requested. If it's handled, the `file_system_provider.configurable` manfiest option must be set to true.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: ConfigureRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [ConfigureRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ConfigureRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onCopyEntryRequested

```typescript
chrome.fileSystemProvider.onCopyEntryRequested.addListener(
  callback: function,
)
```

Raised when copying an entry (recursively if a directory) is requested. If an error occurs, then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: CopyEntryRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [CopyEntryRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CopyEntryRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onCreateDirectoryRequested

```typescript
chrome.fileSystemProvider.onCreateDirectoryRequested.addListener(
  callback: function,
)
```

Raised when creating a directory is requested. The operation must fail with the EXISTS error if the target directory already exists. If `recursive` is true, then all of the missing directories on the directory path must be created.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: CreateDirectoryRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [CreateDirectoryRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CreateDirectoryRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onCreateFileRequested

```typescript
chrome.fileSystemProvider.onCreateFileRequested.addListener(
  callback: function,
)
```

Raised when creating a file is requested. If the file already exists, then `errorCallback` must be called with the `"EXISTS"` error code.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: CreateFileRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [CreateFileRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-CreateFileRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onDeleteEntryRequested

```typescript
chrome.fileSystemProvider.onDeleteEntryRequested.addListener(
  callback: function,
)
```

Raised when deleting an entry is requested. If `recursive` is true, and the entry is a directory, then all of the entries inside must be recursively deleted as well.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: DeleteEntryRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [DeleteEntryRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-DeleteEntryRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onExecuteActionRequested

Chrome 48+

```typescript
chrome.fileSystemProvider.onExecuteActionRequested.addListener(
  callback: function,
)
```

Raised when executing an action for a set of files or directories is\\ requested. After the action is completed, `successCallback` must be called. On error, `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: ExecuteActionRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [ExecuteActionRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ExecuteActionRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onGetActionsRequested

Chrome 48+

```typescript
chrome.fileSystemProvider.onGetActionsRequested.addListener(
  callback: function,
)
```

Raised when a list of actions for a set of files or directories at `entryPaths` is requested. All of the returned actions must be applicable to each entry. If there are no such actions, an empty array should be returned. The actions must be returned with the `successCallback` call. In case of an error, `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: GetActionsRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [GetActionsRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-GetActionsRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    (actions: Action[]) => void
    ```

    <br />

      - actions  
      [Action](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-Action)\[\]
    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onGetMetadataRequested

```typescript
chrome.fileSystemProvider.onGetMetadataRequested.addListener(
  callback: function,
)
```

Raised when metadata of a file or a directory at `entryPath` is requested. The metadata must be returned with the `successCallback` call. In case of an error, `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: GetMetadataRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [GetMetadataRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-GetMetadataRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    (metadata: EntryMetadata) => void
    ```

    <br />

      - metadata  
      [EntryMetadata](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-EntryMetadata)
    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onMountRequested

Chrome 44+

```typescript
chrome.fileSystemProvider.onMountRequested.addListener(
  callback: function,
)
```

Raised when showing a dialog for mounting a new file system is requested. If the extension/app is a file handler, then this event shouldn't be handled. Instead `app.runtime.onLaunched` should be handled in order to mount new file systems when a file is opened. For multiple mounts, the `file_system_provider.multiple_mounts` manifest option must be set to true.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (successCallback: function, errorCallback: function) => void
  ```

  <br />

    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onMoveEntryRequested

```typescript
chrome.fileSystemProvider.onMoveEntryRequested.addListener(
  callback: function,
)
```

Raised when moving an entry (recursively if a directory) is requested. If an error occurs, then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: MoveEntryRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [MoveEntryRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-MoveEntryRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onOpenFileRequested

```typescript
chrome.fileSystemProvider.onOpenFileRequested.addListener(
  callback: function,
)
```

Raised when opening a file at `filePath` is requested. If the file does not exist, then the operation must fail. Maximum number of files opened at once can be specified with `MountOptions`.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: OpenFileRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [OpenFileRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-OpenFileRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    (metadata?: EntryMetadata) => void
    ```

    <br />

      - metadata  
      [EntryMetadata](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-EntryMetadata) optional
    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onReadDirectoryRequested

```typescript
chrome.fileSystemProvider.onReadDirectoryRequested.addListener(
  callback: function,
)
```

Raised when contents of a directory at `directoryPath` are requested. The results must be returned in chunks by calling the `successCallback` several times. In case of an error, `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: ReadDirectoryRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [ReadDirectoryRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ReadDirectoryRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    (entries: EntryMetadata[], hasMore: boolean) => void
    ```

    <br />

      - entries  
      [EntryMetadata](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-EntryMetadata)\[\]
      - hasMore  
      boolean
    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onReadFileRequested

```typescript
chrome.fileSystemProvider.onReadFileRequested.addListener(
  callback: function,
)
```

Raised when reading contents of a file opened previously with `openRequestId` is requested. The results must be returned in chunks by calling `successCallback` several times. In case of an error, `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: ReadFileRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [ReadFileRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ReadFileRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    (data: ArrayBuffer, hasMore: boolean) => void
    ```

    <br />

      - data  
      ArrayBuffer
      - hasMore  
      boolean
    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onRemoveWatcherRequested

Chrome 45+

```typescript
chrome.fileSystemProvider.onRemoveWatcherRequested.addListener(
  callback: function,
)
```

Raised when the watcher should be removed. If an error occurs, then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: RemoveWatcherRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [RemoveWatcherRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-RemoveWatcherRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onTruncateRequested

```typescript
chrome.fileSystemProvider.onTruncateRequested.addListener(
  callback: function,
)
```

Raised when truncating a file to a desired length is requested. If an error occurs, then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: TruncateRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [TruncateRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-TruncateRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onUnmountRequested

```typescript
chrome.fileSystemProvider.onUnmountRequested.addListener(
  callback: function,
)
```

Raised when unmounting for the file system with the `fileSystemId` identifier is requested. In the response, the [`unmount`](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#method-unmount) API method must be called together with `successCallback`. If unmounting is not possible (eg. due to a pending operation), then `errorCallback` must be called.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: UnmountRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [UnmountRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-UnmountRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
[ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)  

### onWriteFileRequested

```typescript
chrome.fileSystemProvider.onWriteFileRequested.addListener(
  callback: function,
)
```

Raised when writing contents to a file opened previously with `openRequestId` is requested.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (options: WriteFileRequestedOptions, successCallback: function, errorCallback: function) => void
  ```

  <br />

    - options  
    [WriteFileRequestedOptions](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-WriteFileRequestedOptions)
    - successCallback  
    function


    The `successCallback` parameter looks like:  

    ```typescript
    () => void
    ```

    <br />

    - errorCallback  
    function


    The `errorCallback` parameter looks like:  

    ```typescript
    (error: ProviderError) => void
    ```

    <br />

      - error  
      [ProviderError](https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider#type-ProviderError)

<br />

---

## 26. fontSettings

*File: pages/fontSettings.md*

# chrome.management

<br />

<br />

## Description

The `chrome.management` API provides ways to manage installed apps and extensions.

<br />

<br />

## Permissions

`management`  

<br />

You must declare the "management" permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use the management
API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "management"
      ],
      ...
    }

<br />

<br />

[`management.getPermissionWarningsByManifest()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-getPermissionWarningsByManifest), [`management.uninstallSelf()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-uninstallSelf), and
[`management.getSelf()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-getSelf) do not require the management permission.

<br />

## Types

### ExtensionDisabledReason

Chrome 44+

A reason the item is disabled.  

#### Enum

"unknown"   
"permissions_increase"   

<br />

### ExtensionInfo

Information about an installed extension, app, or theme.  

#### Properties

  - appLaunchUrl  
  string optional

  The launch url (only present for apps).
  - availableLaunchTypes  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType)\[\] optional

  The currently available launch types (only present for apps).
  - description  
  string

  The description of this extension, app, or theme.
  - disabledReason  
  [ExtensionDisabledReason](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionDisabledReason) optional

  A reason the item is disabled.
  - enabled  
  boolean

  Whether it is currently enabled or disabled.
  - homepageUrl  
  string optional

  The URL of the homepage of this extension, app, or theme.
  - hostPermissions  
  string\[\]

  Returns a list of host based permissions.
  - icons  
  [IconInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-IconInfo)\[\] optional

  A list of icon information. Note that this just reflects what was declared in the manifest, and the actual image at that url may be larger or smaller than what was declared, so you might consider using explicit width and height attributes on img tags referencing these images. See the [manifest documentation on icons](https://developer.chrome.com/docs/extensions/reference/manifest/icons) for more details.
  - id  
  string

  The extension's unique identifier.
  - installType  
  [ExtensionInstallType](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInstallType)

  How the extension was installed.
  - isApp  
  boolean  
  Deprecated

  Please use [`management.ExtensionInfo.type`](https://developer.chrome.com/docs/extensions/reference/api/management#property-ExtensionInfo-type).

  <br />

  True if this is an app.
  - launchType  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType) optional

  The app launch type (only present for apps).
  - mayDisable  
  boolean

  Whether this extension can be disabled or uninstalled by the user.
  - mayEnable  
  boolean optional  
  Chrome 62+

  Whether this extension can be enabled by the user. This is only returned for extensions which are not enabled.
  - name  
  string

  The name of this extension, app, or theme.
  - offlineEnabled  
  boolean

  Whether the extension, app, or theme declares that it supports offline.
  - optionsUrl  
  string

  The url for the item's options page, if it has one.
  - permissions  
  string\[\]

  Returns a list of API based permissions.
  - shortName  
  string

  A short version of the name of this extension, app, or theme.
  - type  
  [ExtensionType](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionType)

  The type of this extension, app, or theme.
  - updateUrl  
  string optional

  The update URL of this extension, app, or theme.
  - version  
  string

  The [version](https://developer.chrome.com/docs/extensions/reference/manifest/version) of this extension, app, or theme.
  - versionName  
  string optional  
  Chrome 50+

The [version name](https://developer.chrome.com/docs/extensions/reference/manifest/version#version_name) of this extension, app, or theme if the manifest specified one.  

### ExtensionInstallType

Chrome 44+

How the extension was installed. One of
`admin`: The extension was installed because of an administrative policy,
`development`: The extension was loaded unpacked in developer mode,
`normal`: The extension was installed normally via a .crx file,
`sideload`: The extension was installed by other software on the machine,
`other`: The extension was installed by other means.  

#### Enum

"admin"   
"development"   
"normal"   
"sideload"   
"other"   

<br />

### ExtensionType

Chrome 44+

The type of this extension, app, or theme.  

#### Enum

"extension"   
"hosted_app"   
"packaged_app"   
"legacy_packaged_app"   
"theme"   
"login_screen_extension"   

<br />

### IconInfo

Information about an icon belonging to an extension, app, or theme.  

#### Properties

  - size  
  number

  A number representing the width and height of the icon. Likely values include (but are not limited to) 128, 48, 24, and 16.
  - url  
  string

The URL for this icon image. To display a grayscale version of the icon (to indicate that an extension is disabled, for example), append `?grayscale=true` to the URL.  

### LaunchType

These are all possible app launch types.  

#### Enum

"OPEN_AS_REGULAR_TAB"   
"OPEN_AS_PINNED_TAB"   
"OPEN_AS_WINDOW"   
"OPEN_FULL_SCREEN"   

<br />

### UninstallOptions

Chrome 88+

Options for how to handle the extension's uninstallation.  

#### Properties

  - showConfirmDialog  
  boolean optional

  Whether or not a confirm-uninstall dialog should prompt the user. Defaults to false for self uninstalls. If an extension uninstalls another extension, this parameter is ignored and the dialog is always shown.

## Methods

### createAppShortcut()

```typescript
chrome.management.createAppShortcut(
  id: string,
): Promise<void>
```

Display options to create shortcuts for an app. On Mac, only packaged app shortcuts can be created.  

#### Parameters

  - id  
  string

This should be the id from an app item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### generateAppForLink()

```typescript
chrome.management.generateAppForLink(
  url: string,
  title: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Generate an app for a URL. Returns the generated bookmark app.  

#### Parameters

  - url  
  string

  The URL of a web page. The scheme of the URL can only be "http" or "https".
  - title  
  string

The title of the generated app.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### get()

```typescript
chrome.management.get(
  id: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Returns information about the installed extension, app, or theme that has the given ID.  

#### Parameters

  - id  
  string

The ID from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### getAll()

```typescript
chrome.management.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo[]>
```

Returns a list of information about installed extensions and apps.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\[\]\>  
Chrome 88+  

### getPermissionWarningsById()

```typescript
chrome.management.getPermissionWarningsById(
  id: string,
): Promise<string[]>
```

Returns a list of [permission warnings](https://developer.chrome.com/extensions/develop/concepts/permission-warnings) for the given extension id.  

#### Parameters

  - id  
  string

The ID of an already installed extension.  

#### Returns

  - Promise\<string\[\]\>  
Chrome 88+  

### getPermissionWarningsByManifest()

```typescript
chrome.management.getPermissionWarningsByManifest(
  manifestStr: string,
): Promise<string[]>
```

Returns a list of [permission warnings](https://developer.chrome.com/extensions/develop/concepts/permission-warnings) for the given extension manifest string. Note: This function can be used without requesting the 'management' permission in the manifest.  

#### Parameters

  - manifestStr  
  string

Extension manifest JSON string.  

#### Returns

  - Promise\<string\[\]\>  
Chrome 88+  

### getSelf()

```typescript
chrome.management.getSelf(): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Returns information about the calling extension, app, or theme. Note: This function can be used without requesting the 'management' permission in the manifest.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### installReplacementWebApp()

Chrome 77+

```typescript
chrome.management.installReplacementWebApp(): Promise<void>
```

Launches the replacement_web_app specified in the manifest. Prompts the user to install if not already installed.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### launchApp()

```typescript
chrome.management.launchApp(
  id: string,
): Promise<void>
```

Launches an application.  

#### Parameters

  - id  
  string

The extension id of the application.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### setEnabled()

```typescript
chrome.management.setEnabled(
  id: string,
  enabled: boolean,
): Promise<void>
```

Enables or disables an app or extension. In most cases this function must be called in the context of a user gesture (e.g. an onclick handler for a button), and may present the user with a native confirmation UI as a way of preventing abuse.  

#### Parameters

  - id  
  string

  This should be the id from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - enabled  
  boolean

Whether this item should be enabled or disabled.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### setLaunchType()

```typescript
chrome.management.setLaunchType(
  id: string,
  launchType: LaunchType,
): Promise<void>
```

Set the launch type of an app.  

#### Parameters

  - id  
  string

  This should be the id from an app item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - launchType  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType)

The target launch type. Always check and make sure this launch type is in [`ExtensionInfo.availableLaunchTypes`](https://developer.chrome.com/docs/extensions/reference/api/management#property-ExtensionInfo-availableLaunchTypes), because the available launch types vary on different platforms and configurations.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### uninstall()

```typescript
chrome.management.uninstall(
  id: string,
  options?: UninstallOptions,
): Promise<void>
```

Uninstalls a currently installed app or extension. Note: This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app. If the uninstall fails (e.g. the user cancels the dialog) the promise will be rejected or the callback will be called with [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) set.  

#### Parameters

  - id  
  string

  This should be the id from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - options  
[UninstallOptions](https://developer.chrome.com/docs/extensions/reference/api/management#type-UninstallOptions) optional  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### uninstallSelf()

```typescript
chrome.management.uninstallSelf(
  options?: UninstallOptions,
): Promise<void>
```

Uninstalls the calling extension. Note: This function can be used without requesting the 'management' permission in the manifest. This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app.  

#### Parameters

  - options  
[UninstallOptions](https://developer.chrome.com/docs/extensions/reference/api/management#type-UninstallOptions) optional  

#### Returns

  - Promise\<void\>  
  Chrome 88+

## Events

### onDisabled

```typescript
chrome.management.onDisabled.addListener(
  callback: function,
)
```

Fired when an app or extension has been disabled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onEnabled

```typescript
chrome.management.onEnabled.addListener(
  callback: function,
)
```

Fired when an app or extension has been enabled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onInstalled

```typescript
chrome.management.onInstalled.addListener(
  callback: function,
)
```

Fired when an app or extension has been installed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onUninstalled

```typescript
chrome.management.onUninstalled.addListener(
  callback: function,
)
```

Fired when an app or extension has been uninstalled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (id: string) => void
  ```

  <br />

    - id  
    string

<br />

---

## 27. gcm

*File: pages/gcm.md*

# chrome.i18n

<br />

<br />

## Description

Use the `chrome.i18n` infrastructure to implement internationalization across your whole app or extension.

<br />

<br />

<br />

## Manifest

<br />

If an extension has a `/_locales` directory, the [manifest](https://developer.chrome.com/docs/extensions/reference/manifest) must define `"default_locale"`.

## Concepts and usage

You need to put all of its user-visible strings into a file named [`messages.json`](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats). Each time
you add a new locale, you add a messages file under a directory named `/_locales/_localeCode_`, where
*localeCode* is a code such as `en` for English.

Here's the file hierarchy for an internationalized extension that supports English (`en`), Spanish
(`es`), and Korean (`ko`):

![In the extension directory: manifest.json, *.html, *.js, /_locales directory. In the /_locales directory: en, es, and ko directories, each with a messages.json file.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-hierarchy.gif)

### Support multiple languages

Say you have an extension with the files shown in the following figure:

![A manifest.json file and a file with JavaScript. The .json file has 'Hello World'. The JavaScript file has title = 'Hello World'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-before.gif)

To internationalize this extension, you name each user-visible string and put it into a messages
file. The extension's manifest, CSS files, and JavaScript code use each string's name to get its
localized version.

Here's what the extension looks like when it's internationalized (note that it still has only
English strings):

![In the manifest.json file, 'Hello World' has been changed to '__MSG_extName__', and a new default_locale' item has the value 'en'. In the JavaScript file, 'Hello World' has been changed to chrome.i18n.getMessage('extName'). A new file named /_locales/en/messages.json defines 'extName'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-1.gif)

Some notes about internationalizing:

- You can use any of the [supported locales](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales). If you use an unsupported locale, Google Chrome ignores it.
- In `manifest.json` and CSS files, refer to a string named *messagename* like this:

      __MSG_messagename__

- In your extension or app's JavaScript code, refer to a string named *messagename* like this:

      chrome.i18n.getMessage("messagename")

- In each call to `getMessage()`, you can supply up to 9 strings to be included in the message. See
  [Examples: getMessage](https://developer.chrome.com/docs/extensions/reference/api/i18n#getmessage) for details.

- Some messages, such as `@@bidi_dir` and `@@ui_locale`, are provided by the internationalization
  system. See the [Predefined messages](https://developer.chrome.com/docs/extensions/reference/api/i18n#overview-predefined) section for a full list of predefined message names.

- In `messages.json`, each user-visible string has a name, a "message" item, and an optional
  "description" item. The name is a key such as "extName" or "search_string" that identifies the
  string. The "message" specifies the value of the string in this locale. The optional "description"
  provides help to translators, who might not be able to see how the string is used in your
  extension. For example:

      {
        "search_string": {
          "message": "hello%20world",
          "description": "The string we search for. Put %20 between words that go together."
        },
        ...
      }

For more information, see [Formats: Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats).

Once an extension is internationalized, translating it is straightforward. You copy `messages.json`,
translate it, and put the copy into a new directory under `/_locales`. For example, to support
Spanish, just put a translated copy of `messages.json` under `/_locales/es`. The following figure
shows the previous extension with a new Spanish translation.

![This looks the same as the previous figure, but with a new file at /_locales/es/messages.json that contains a Spanish translation of the messages.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-2.gif)

### Predefined messages

The internationalization system provides a few predefined messages to help you localize. These
include `@@ui_locale`, so you can detect the current UI locale, and a few `@@bidi_...` messages that
let you detect the text direction. The latter messages have similar names to constants in the
[gadgets BIDI (bi-directional) API](https://code.google.com/apis/gadgets/docs/i18n.html#BIDI).

The special message `@@extension_id` can be used in the CSS and JavaScript files, whether or not the
extension or app is localized. This message doesn't work in manifest files.

The following table describes each predefined message.

|     Message name      |                                                                                                     Description                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@@extension_id`      | The extension or app ID; you might use this string to construct URLs for resources inside the extension. Even unlocalized extensions can use this message. **Note:** You can't use this message in a manifest file. |
| `@@ui_locale`         | The current locale; you might use this string to construct locale-specific URLs.                                                                                                                                    |
| `@@bidi_dir`          | The text direction for the current locale, either "ltr" for left-to-right languages such as English or "rtl" for right-to-left languages such as Arabic.                                                            |
| `@@bidi_reversed_dir` | If the `@@bidi_dir` is "ltr", then this is "rtl"; otherwise, it's "ltr".                                                                                                                                            |
| `@@bidi_start_edge`   | If the `@@bidi_dir` is "ltr", then this is "left"; otherwise, it's "right".                                                                                                                                         |
| `@@bidi_end_edge`     | If the `@@bidi_dir` is "ltr", then this is "right"; otherwise, it's "left".                                                                                                                                         |

Here's an example of using `@@extension_id` in a CSS file to construct a URL:  

    body {
      background-image:url('chrome-extension://__MSG_@@extension_id__/background.png');
    }

If the extension ID is abcdefghijklmnopqrstuvwxyzabcdef, then the bold line in the previous code
snippet becomes:  

      background-image:url('chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef/background.png');

Here's an example of using `@@bidi_*` messages in a CSS file:  

    body {
      direction: __MSG_@@bidi_dir__;
    }

    div#header {
      margin-bottom: 1.05em;
      overflow: hidden;
      padding-bottom: 1.5em;
      padding-__MSG_@@bidi_start_edge__: 0;
      padding-__MSG_@@bidi_end_edge__: 1.5em;
      position: relative;
    }

For left-to-right languages such as English, the bold lines become:  

      dir: ltr;
      padding-left: 0;
      padding-right: 1.5em;

### Locales

You can choose from many locales, including some (such as `en`) that let a single translation support multiple variations of a language (such as `en_GB` and `en_US`).

You can localize your extension to any locale that is supported by the Chrome Web Store. If your locale is not listed here, choose the closest alternative. For example, if the default locale of your extension is `"de_CH"`, choose `"de"` in the Chrome Web Store.

| Locale code |           Language (region)           |
|-------------|---------------------------------------|
| `ar`        | Arabic                                |
| `am`        | Amharic                               |
| `bg`        | Bulgarian                             |
| `bn`        | Bengali                               |
| `ca`        | Catalan                               |
| `cs`        | Czech                                 |
| `da`        | Danish                                |
| `de`        | German                                |
| `el`        | Greek                                 |
| `en`        | English                               |
| `en_AU`     | English (Australia)                   |
| `en_GB`     | English (Great Britain)               |
| `en_US`     | English (USA)                         |
| `es`        | Spanish                               |
| `es_419`    | Spanish (Latin America and Caribbean) |
| `et`        | Estonian                              |
| `fa`        | Persian                               |
| `fi`        | Finnish                               |
| `fil`       | Filipino                              |
| `fr`        | French                                |
| `gu`        | Gujarati                              |
| `he`        | Hebrew                                |
| `hi`        | Hindi                                 |
| `hr`        | Croatian                              |
| `hu`        | Hungarian                             |
| `id`        | Indonesian                            |
| `it`        | Italian                               |
| `ja`        | Japanese                              |
| `kn`        | Kannada                               |
| `ko`        | Korean                                |
| `lt`        | Lithuanian                            |
| `lv`        | Latvian                               |
| `ml`        | Malayalam                             |
| `mr`        | Marathi                               |
| `ms`        | Malay                                 |
| `nl`        | Dutch                                 |
| `no`        | Norwegian                             |
| `pl`        | Polish                                |
| `pt_BR`     | Portuguese (Brazil)                   |
| `pt_PT`     | Portuguese (Portugal)                 |
| `ro`        | Romanian                              |
| `ru`        | Russian                               |
| `sk`        | Slovak                                |
| `sl`        | Slovenian                             |
| `sr`        | Serbian                               |
| `sv`        | Swedish                               |
| `sw`        | Swahili                               |
| `ta`        | Tamil                                 |
| `te`        | Telugu                                |
| `th`        | Thai                                  |
| `tr`        | Turkish                               |
| `uk`        | Ukrainian                             |
| `vi`        | Vietnamese                            |
| `zh_CN`     | Chinese (China)                       |
| `zh_TW`     | Chinese (Taiwan)                      |

### Search for messages

You don't have to define every string for every supported locale. As long as the default locale's
`messages.json` file has a value for every string, your extension or app will run no matter how
sparse a translation is. Here's how the extension system searches for a message:

1. Search the messages file (if any) for the user's preferred locale. For example, when Google Chrome's locale is set to British English (`en_GB`), the system first looks for the message in `/_locales/en_GB/messages.json`. If that file exists and the message is there, the system looks no further.
2. If the user's preferred locale has a region (that is, the locale has an underscore: _), search the locale without that region. For example, if the `en_GB` messages file doesn't exist or doesn't contain the message, the system looks in the `en` messages file. If that file exists and the message is there, the system looks no further.
3. Search the messages file for the default locale. For example, if the extension's "default_locale" is set to "es", and neither `/_locales/en_GB/messages.json` nor `/_locales/en/messages.json` contains the message, the extension uses the message from `/_locales/es/messages.json`.

In the following figure, the message named "colores" is in all three locales that the extension
supports, but "extName" is in only two of the locales. Wherever a user running Google Chrome in US
English sees the label "Colors", a user of British English sees "Colours". Both US English and
British English users see the extension name "Hello World". Because the default language is Spanish,
users running Google Chrome in any non-English language see the label "Colores" and the extension
name "Hola mundo".

![Four files: manifest.json and three messages.json files (for es, en, and en_GB). The es and en files show entries for messages named 'extName' and 'colores'; the en_GB file has just one entry (for 'colores').](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-strings.gif)

### Set your browser's locale

To test translations, you might want to set your browser's locale. This section tells you how to set
the locale in [Windows](https://developer.chrome.com/docs/extensions/reference/api/i18n#windows), [Mac OS](https://developer.chrome.com/docs/extensions/reference/api/i18n#mac_os), [Linux](https://developer.chrome.com/docs/extensions/reference/api/i18n#linux), and [ChromeOS](https://developer.chrome.com/docs/extensions/reference/api/i18n#chromeos).

#### Windows

You can change the locale using either a locale-specific shortcut or the Google Chrome UI. The
shortcut approach is quicker, once you've set it up, and it lets you use several languages at once.

##### Use a locale-specific shortcut

To create and use a shortcut that launches Google Chrome with a particular locale:

1. Make a copy of the Google Chrome shortcut that's already on your desktop.
2. Rename the new shortcut to match the new locale.
3. Change the shortcut's properties so that the Target field specifies the `--lang` and
   `--user-data-dir` flags. The target should look something like this:

       path_to_chrome.exe --lang=locale --user-data-dir=c:\locale_profile_dir

4. Launch Google Chrome by double-clicking the shortcut.

For example, to create a shortcut that launches Google Chrome in Spanish (`es`), you might create a
shortcut named `chrome-es` that has the following target:  

    path_to_chrome.exe --lang=es --user-data-dir=c:\chrome-profile-es

You can create as many shortcuts as you like, making it straightforward to test in multiple languages. For
example:  

    path_to_chrome.exe --lang=en --user-data-dir=c:\chrome-profile-en
    path_to_chrome.exe --lang=en_GB --user-data-dir=c:\chrome-profile-en_GB
    path_to_chrome.exe --lang=ko --user-data-dir=c:\chrome-profile-ko

| **Note:** Specifying `--user-data-dir` is optional but handy. Having one data directory per locale lets you run the browser in several languages at the same time. A disadvantage is that because the locales' data isn't shared, you have to install your extension multiple times---once per locale, which can be challenging when you don't speak the language. For more information, see [Creating and Using Profiles](https://www.chromium.org/developers/creating-and-using-profiles).

##### Use the UI

Here's how to change the locale using the UI on Google Chrome for Windows:

1. App icon \> **Options**
2. Choose the **Under the Hood** tab
3. Scroll to **Web Content**
4. Click **Change font and language settings**
5. Choose the **Languages** tab
6. Use the drop down to set the **Google Chrome language**
7. Restart Chrome

#### Mac OS

To change the locale on Mac, you use the system preferences.

1. From the Apple menu, choose **System Preferences**
2. Under the **Personal** section, choose **International**
3. Choose your language and location
4. Restart Chrome

#### Linux

To change the locale on Linux, first quit Google Chrome. Then, all in one line, set the LANGUAGE
environment variable and launch Google Chrome. For example:  

    LANGUAGE=es ./chrome

#### ChromeOS

To change the locale on ChromeOS:

1. From the system tray, choose **Settings**.
2. Under the **Languages and input** section, choose the **Language** drop-down.
3. If your language is not listed, click **Add languages** and add it.
4. Once added, click the 3-dot **More actions** menu item next to your language and choose **Display ChromeOS in this language**.
5. Click the **Restart** button that appears next to the set language to restart ChromeOS.

## Examples

You can find examples of internationalization in the [examples/api/i18n](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/api/i18n/) directory. For a
complete example, see [examples/extensions/news](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/extensions/news/). For other examples and for help in viewing the
source code, see [Samples](https://developer.chrome.com/docs/extensions/samples).

### getMessage()

The following code gets a localized message from the browser and displays it as a string. It
replaces two placeholders within the message with the strings "string1" and "string2".  

    function getMessage() {
      var message = chrome.i18n.getMessage("click_here", ["string1", "string2"]);
      document.getElementById("languageSpan").innerHTML = message;
    }

Here's how you'd supply and use a single string:  

      // In JavaScript code
      status.innerText = chrome.i18n.getMessage("error", errorDetails);

    "error": {
      "message": "Error: $details$",
      "description": "Generic error template. Expects error parameter to be passed in.",
      "placeholders": {
        "details": {
          "content": "$1",
          "example": "Failed to fetch RSS feed."
        }
      }
    }

For more information about placeholders, see the [Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats#placeholders) page. For details on
calling `getMessage()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getMessage).

### getAcceptLanguages()

The following code gets accept-languages from the browser and displays them as a string by
separating each accept-language with ','.  

    function getAcceptLanguages() {
      chrome.i18n.getAcceptLanguages(function(languageList) {
        var languages = languageList.join(",");
        document.getElementById("languageSpan").innerHTML = languages;
      })
    }

For details on calling `getAcceptLanguages()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages).

### detectLanguage()

The following code detects up to 3 languages from the given string and displays the result as
strings separated by new lines.  

    function detectLanguage(inputText) {
      chrome.i18n.detectLanguage(inputText, function(result) {
        var outputLang = "Detected Language: ";
        var outputPercent = "Language Percentage: ";
        for(i = 0; i < result.languages.length; i++) {
          outputLang += result.languages[i].language + " ";
          outputPercent +=result.languages[i].percentage + " ";
        }
        document.getElementById("languageSpan").innerHTML = outputLang + "\n" + outputPercent + "\nReliable: " + result.isReliable;
      });
    }

For more details on calling `detectLanguage(inputText)`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-detectLanguage).

<br />

## Types

### LanguageCode

Chrome 47+

An ISO language code such as `en` or `fr`. For a complete list of languages supported by this method, see [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc). For an unknown language, `und` will be returned, which means that \[percentage\] of the text is unknown to CLD  

#### Type

string

## Methods

### detectLanguage()

Chrome 47+

```typescript
chrome.i18n.detectLanguage(
  text: string,
): Promise<object>
```

Detects the language of the provided text using CLD.  

#### Parameters

  - text  
  string

User input string to be translated.  

#### Returns

  - Promise\<object\>  
Chrome 99+  

### getAcceptLanguages()

```typescript
chrome.i18n.getAcceptLanguages(): Promise<https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode[]>
```

Gets the accept-languages of the browser. This is different from the locale used by the browser; to get the locale, use [`i18n.getUILanguage`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getUILanguage).  

#### Returns

  - Promise\<[LanguageCode](https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode)\[\]\>  
Chrome 99+  

### getMessage()

```typescript
chrome.i18n.getMessage(
  messageName: string,
  substitutions?: any,
  options?: object,
): string
```

Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the `getMessage()` call is wrong --- for example, *messageName* is not a string or the *substitutions* array has more than 9 elements --- this method returns `undefined`.  

#### Parameters

  - messageName  
  string

  The name of the message, as specified in the [`messages.json`](https://developer.chrome.com/extensions/how-to/ui/localization-message-formats) file.
  - substitutions  
  any optional

  Up to 9 substitution strings, if the message requires any.
  - options  
  object optional  
  Chrome 79+  
    - escapeLt  
    boolean optional

Escape `<` in translation to `&lt;`. This applies only to the message itself, not to the placeholders. Developers might want to use this if the translation is used in an HTML context. Closure Templates used with Closure Compiler generate this automatically.  

#### Returns

- string

Message localized for current locale.  

### getUILanguage()

```typescript
chrome.i18n.getUILanguage(): string
```

Gets the browser UI language of the browser. This is different from [`i18n.getAcceptLanguages`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages) which returns the preferred user languages.  

#### Returns

- string

  The browser UI language code such as en-US or fr-FR.

<br />

---

## 28. history

*File: pages/history.md*

# chrome.i18n

<br />

<br />

## Description

Use the `chrome.i18n` infrastructure to implement internationalization across your whole app or extension.

<br />

<br />

<br />

## Manifest

<br />

If an extension has a `/_locales` directory, the [manifest](https://developer.chrome.com/docs/extensions/reference/manifest) must define `"default_locale"`.

## Concepts and usage

You need to put all of its user-visible strings into a file named [`messages.json`](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats). Each time
you add a new locale, you add a messages file under a directory named `/_locales/_localeCode_`, where
*localeCode* is a code such as `en` for English.

Here's the file hierarchy for an internationalized extension that supports English (`en`), Spanish
(`es`), and Korean (`ko`):

![In the extension directory: manifest.json, *.html, *.js, /_locales directory. In the /_locales directory: en, es, and ko directories, each with a messages.json file.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-hierarchy.gif)

### Support multiple languages

Say you have an extension with the files shown in the following figure:

![A manifest.json file and a file with JavaScript. The .json file has 'Hello World'. The JavaScript file has title = 'Hello World'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-before.gif)

To internationalize this extension, you name each user-visible string and put it into a messages
file. The extension's manifest, CSS files, and JavaScript code use each string's name to get its
localized version.

Here's what the extension looks like when it's internationalized (note that it still has only
English strings):

![In the manifest.json file, 'Hello World' has been changed to '__MSG_extName__', and a new default_locale' item has the value 'en'. In the JavaScript file, 'Hello World' has been changed to chrome.i18n.getMessage('extName'). A new file named /_locales/en/messages.json defines 'extName'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-1.gif)

Some notes about internationalizing:

- You can use any of the [supported locales](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales). If you use an unsupported locale, Google Chrome ignores it.
- In `manifest.json` and CSS files, refer to a string named *messagename* like this:

      __MSG_messagename__

- In your extension or app's JavaScript code, refer to a string named *messagename* like this:

      chrome.i18n.getMessage("messagename")

- In each call to `getMessage()`, you can supply up to 9 strings to be included in the message. See
  [Examples: getMessage](https://developer.chrome.com/docs/extensions/reference/api/i18n#getmessage) for details.

- Some messages, such as `@@bidi_dir` and `@@ui_locale`, are provided by the internationalization
  system. See the [Predefined messages](https://developer.chrome.com/docs/extensions/reference/api/i18n#overview-predefined) section for a full list of predefined message names.

- In `messages.json`, each user-visible string has a name, a "message" item, and an optional
  "description" item. The name is a key such as "extName" or "search_string" that identifies the
  string. The "message" specifies the value of the string in this locale. The optional "description"
  provides help to translators, who might not be able to see how the string is used in your
  extension. For example:

      {
        "search_string": {
          "message": "hello%20world",
          "description": "The string we search for. Put %20 between words that go together."
        },
        ...
      }

For more information, see [Formats: Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats).

Once an extension is internationalized, translating it is straightforward. You copy `messages.json`,
translate it, and put the copy into a new directory under `/_locales`. For example, to support
Spanish, just put a translated copy of `messages.json` under `/_locales/es`. The following figure
shows the previous extension with a new Spanish translation.

![This looks the same as the previous figure, but with a new file at /_locales/es/messages.json that contains a Spanish translation of the messages.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-2.gif)

### Predefined messages

The internationalization system provides a few predefined messages to help you localize. These
include `@@ui_locale`, so you can detect the current UI locale, and a few `@@bidi_...` messages that
let you detect the text direction. The latter messages have similar names to constants in the
[gadgets BIDI (bi-directional) API](https://code.google.com/apis/gadgets/docs/i18n.html#BIDI).

The special message `@@extension_id` can be used in the CSS and JavaScript files, whether or not the
extension or app is localized. This message doesn't work in manifest files.

The following table describes each predefined message.

|     Message name      |                                                                                                     Description                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@@extension_id`      | The extension or app ID; you might use this string to construct URLs for resources inside the extension. Even unlocalized extensions can use this message. **Note:** You can't use this message in a manifest file. |
| `@@ui_locale`         | The current locale; you might use this string to construct locale-specific URLs.                                                                                                                                    |
| `@@bidi_dir`          | The text direction for the current locale, either "ltr" for left-to-right languages such as English or "rtl" for right-to-left languages such as Arabic.                                                            |
| `@@bidi_reversed_dir` | If the `@@bidi_dir` is "ltr", then this is "rtl"; otherwise, it's "ltr".                                                                                                                                            |
| `@@bidi_start_edge`   | If the `@@bidi_dir` is "ltr", then this is "left"; otherwise, it's "right".                                                                                                                                         |
| `@@bidi_end_edge`     | If the `@@bidi_dir` is "ltr", then this is "right"; otherwise, it's "left".                                                                                                                                         |

Here's an example of using `@@extension_id` in a CSS file to construct a URL:  

    body {
      background-image:url('chrome-extension://__MSG_@@extension_id__/background.png');
    }

If the extension ID is abcdefghijklmnopqrstuvwxyzabcdef, then the bold line in the previous code
snippet becomes:  

      background-image:url('chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef/background.png');

Here's an example of using `@@bidi_*` messages in a CSS file:  

    body {
      direction: __MSG_@@bidi_dir__;
    }

    div#header {
      margin-bottom: 1.05em;
      overflow: hidden;
      padding-bottom: 1.5em;
      padding-__MSG_@@bidi_start_edge__: 0;
      padding-__MSG_@@bidi_end_edge__: 1.5em;
      position: relative;
    }

For left-to-right languages such as English, the bold lines become:  

      dir: ltr;
      padding-left: 0;
      padding-right: 1.5em;

### Locales

You can choose from many locales, including some (such as `en`) that let a single translation support multiple variations of a language (such as `en_GB` and `en_US`).

You can localize your extension to any locale that is supported by the Chrome Web Store. If your locale is not listed here, choose the closest alternative. For example, if the default locale of your extension is `"de_CH"`, choose `"de"` in the Chrome Web Store.

| Locale code |           Language (region)           |
|-------------|---------------------------------------|
| `ar`        | Arabic                                |
| `am`        | Amharic                               |
| `bg`        | Bulgarian                             |
| `bn`        | Bengali                               |
| `ca`        | Catalan                               |
| `cs`        | Czech                                 |
| `da`        | Danish                                |
| `de`        | German                                |
| `el`        | Greek                                 |
| `en`        | English                               |
| `en_AU`     | English (Australia)                   |
| `en_GB`     | English (Great Britain)               |
| `en_US`     | English (USA)                         |
| `es`        | Spanish                               |
| `es_419`    | Spanish (Latin America and Caribbean) |
| `et`        | Estonian                              |
| `fa`        | Persian                               |
| `fi`        | Finnish                               |
| `fil`       | Filipino                              |
| `fr`        | French                                |
| `gu`        | Gujarati                              |
| `he`        | Hebrew                                |
| `hi`        | Hindi                                 |
| `hr`        | Croatian                              |
| `hu`        | Hungarian                             |
| `id`        | Indonesian                            |
| `it`        | Italian                               |
| `ja`        | Japanese                              |
| `kn`        | Kannada                               |
| `ko`        | Korean                                |
| `lt`        | Lithuanian                            |
| `lv`        | Latvian                               |
| `ml`        | Malayalam                             |
| `mr`        | Marathi                               |
| `ms`        | Malay                                 |
| `nl`        | Dutch                                 |
| `no`        | Norwegian                             |
| `pl`        | Polish                                |
| `pt_BR`     | Portuguese (Brazil)                   |
| `pt_PT`     | Portuguese (Portugal)                 |
| `ro`        | Romanian                              |
| `ru`        | Russian                               |
| `sk`        | Slovak                                |
| `sl`        | Slovenian                             |
| `sr`        | Serbian                               |
| `sv`        | Swedish                               |
| `sw`        | Swahili                               |
| `ta`        | Tamil                                 |
| `te`        | Telugu                                |
| `th`        | Thai                                  |
| `tr`        | Turkish                               |
| `uk`        | Ukrainian                             |
| `vi`        | Vietnamese                            |
| `zh_CN`     | Chinese (China)                       |
| `zh_TW`     | Chinese (Taiwan)                      |

### Search for messages

You don't have to define every string for every supported locale. As long as the default locale's
`messages.json` file has a value for every string, your extension or app will run no matter how
sparse a translation is. Here's how the extension system searches for a message:

1. Search the messages file (if any) for the user's preferred locale. For example, when Google Chrome's locale is set to British English (`en_GB`), the system first looks for the message in `/_locales/en_GB/messages.json`. If that file exists and the message is there, the system looks no further.
2. If the user's preferred locale has a region (that is, the locale has an underscore: _), search the locale without that region. For example, if the `en_GB` messages file doesn't exist or doesn't contain the message, the system looks in the `en` messages file. If that file exists and the message is there, the system looks no further.
3. Search the messages file for the default locale. For example, if the extension's "default_locale" is set to "es", and neither `/_locales/en_GB/messages.json` nor `/_locales/en/messages.json` contains the message, the extension uses the message from `/_locales/es/messages.json`.

In the following figure, the message named "colores" is in all three locales that the extension
supports, but "extName" is in only two of the locales. Wherever a user running Google Chrome in US
English sees the label "Colors", a user of British English sees "Colours". Both US English and
British English users see the extension name "Hello World". Because the default language is Spanish,
users running Google Chrome in any non-English language see the label "Colores" and the extension
name "Hola mundo".

![Four files: manifest.json and three messages.json files (for es, en, and en_GB). The es and en files show entries for messages named 'extName' and 'colores'; the en_GB file has just one entry (for 'colores').](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-strings.gif)

### Set your browser's locale

To test translations, you might want to set your browser's locale. This section tells you how to set
the locale in [Windows](https://developer.chrome.com/docs/extensions/reference/api/i18n#windows), [Mac OS](https://developer.chrome.com/docs/extensions/reference/api/i18n#mac_os), [Linux](https://developer.chrome.com/docs/extensions/reference/api/i18n#linux), and [ChromeOS](https://developer.chrome.com/docs/extensions/reference/api/i18n#chromeos).

#### Windows

You can change the locale using either a locale-specific shortcut or the Google Chrome UI. The
shortcut approach is quicker, once you've set it up, and it lets you use several languages at once.

##### Use a locale-specific shortcut

To create and use a shortcut that launches Google Chrome with a particular locale:

1. Make a copy of the Google Chrome shortcut that's already on your desktop.
2. Rename the new shortcut to match the new locale.
3. Change the shortcut's properties so that the Target field specifies the `--lang` and
   `--user-data-dir` flags. The target should look something like this:

       path_to_chrome.exe --lang=locale --user-data-dir=c:\locale_profile_dir

4. Launch Google Chrome by double-clicking the shortcut.

For example, to create a shortcut that launches Google Chrome in Spanish (`es`), you might create a
shortcut named `chrome-es` that has the following target:  

    path_to_chrome.exe --lang=es --user-data-dir=c:\chrome-profile-es

You can create as many shortcuts as you like, making it straightforward to test in multiple languages. For
example:  

    path_to_chrome.exe --lang=en --user-data-dir=c:\chrome-profile-en
    path_to_chrome.exe --lang=en_GB --user-data-dir=c:\chrome-profile-en_GB
    path_to_chrome.exe --lang=ko --user-data-dir=c:\chrome-profile-ko

| **Note:** Specifying `--user-data-dir` is optional but handy. Having one data directory per locale lets you run the browser in several languages at the same time. A disadvantage is that because the locales' data isn't shared, you have to install your extension multiple times---once per locale, which can be challenging when you don't speak the language. For more information, see [Creating and Using Profiles](https://www.chromium.org/developers/creating-and-using-profiles).

##### Use the UI

Here's how to change the locale using the UI on Google Chrome for Windows:

1. App icon \> **Options**
2. Choose the **Under the Hood** tab
3. Scroll to **Web Content**
4. Click **Change font and language settings**
5. Choose the **Languages** tab
6. Use the drop down to set the **Google Chrome language**
7. Restart Chrome

#### Mac OS

To change the locale on Mac, you use the system preferences.

1. From the Apple menu, choose **System Preferences**
2. Under the **Personal** section, choose **International**
3. Choose your language and location
4. Restart Chrome

#### Linux

To change the locale on Linux, first quit Google Chrome. Then, all in one line, set the LANGUAGE
environment variable and launch Google Chrome. For example:  

    LANGUAGE=es ./chrome

#### ChromeOS

To change the locale on ChromeOS:

1. From the system tray, choose **Settings**.
2. Under the **Languages and input** section, choose the **Language** drop-down.
3. If your language is not listed, click **Add languages** and add it.
4. Once added, click the 3-dot **More actions** menu item next to your language and choose **Display ChromeOS in this language**.
5. Click the **Restart** button that appears next to the set language to restart ChromeOS.

## Examples

You can find examples of internationalization in the [examples/api/i18n](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/api/i18n/) directory. For a
complete example, see [examples/extensions/news](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/extensions/news/). For other examples and for help in viewing the
source code, see [Samples](https://developer.chrome.com/docs/extensions/samples).

### getMessage()

The following code gets a localized message from the browser and displays it as a string. It
replaces two placeholders within the message with the strings "string1" and "string2".  

    function getMessage() {
      var message = chrome.i18n.getMessage("click_here", ["string1", "string2"]);
      document.getElementById("languageSpan").innerHTML = message;
    }

Here's how you'd supply and use a single string:  

      // In JavaScript code
      status.innerText = chrome.i18n.getMessage("error", errorDetails);

    "error": {
      "message": "Error: $details$",
      "description": "Generic error template. Expects error parameter to be passed in.",
      "placeholders": {
        "details": {
          "content": "$1",
          "example": "Failed to fetch RSS feed."
        }
      }
    }

For more information about placeholders, see the [Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats#placeholders) page. For details on
calling `getMessage()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getMessage).

### getAcceptLanguages()

The following code gets accept-languages from the browser and displays them as a string by
separating each accept-language with ','.  

    function getAcceptLanguages() {
      chrome.i18n.getAcceptLanguages(function(languageList) {
        var languages = languageList.join(",");
        document.getElementById("languageSpan").innerHTML = languages;
      })
    }

For details on calling `getAcceptLanguages()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages).

### detectLanguage()

The following code detects up to 3 languages from the given string and displays the result as
strings separated by new lines.  

    function detectLanguage(inputText) {
      chrome.i18n.detectLanguage(inputText, function(result) {
        var outputLang = "Detected Language: ";
        var outputPercent = "Language Percentage: ";
        for(i = 0; i < result.languages.length; i++) {
          outputLang += result.languages[i].language + " ";
          outputPercent +=result.languages[i].percentage + " ";
        }
        document.getElementById("languageSpan").innerHTML = outputLang + "\n" + outputPercent + "\nReliable: " + result.isReliable;
      });
    }

For more details on calling `detectLanguage(inputText)`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-detectLanguage).

<br />

## Types

### LanguageCode

Chrome 47+

An ISO language code such as `en` or `fr`. For a complete list of languages supported by this method, see [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc). For an unknown language, `und` will be returned, which means that \[percentage\] of the text is unknown to CLD  

#### Type

string

## Methods

### detectLanguage()

Chrome 47+

```typescript
chrome.i18n.detectLanguage(
  text: string,
): Promise<object>
```

Detects the language of the provided text using CLD.  

#### Parameters

  - text  
  string

User input string to be translated.  

#### Returns

  - Promise\<object\>  
Chrome 99+  

### getAcceptLanguages()

```typescript
chrome.i18n.getAcceptLanguages(): Promise<https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode[]>
```

Gets the accept-languages of the browser. This is different from the locale used by the browser; to get the locale, use [`i18n.getUILanguage`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getUILanguage).  

#### Returns

  - Promise\<[LanguageCode](https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode)\[\]\>  
Chrome 99+  

### getMessage()

```typescript
chrome.i18n.getMessage(
  messageName: string,
  substitutions?: any,
  options?: object,
): string
```

Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the `getMessage()` call is wrong --- for example, *messageName* is not a string or the *substitutions* array has more than 9 elements --- this method returns `undefined`.  

#### Parameters

  - messageName  
  string

  The name of the message, as specified in the [`messages.json`](https://developer.chrome.com/extensions/how-to/ui/localization-message-formats) file.
  - substitutions  
  any optional

  Up to 9 substitution strings, if the message requires any.
  - options  
  object optional  
  Chrome 79+  
    - escapeLt  
    boolean optional

Escape `<` in translation to `&lt;`. This applies only to the message itself, not to the placeholders. Developers might want to use this if the translation is used in an HTML context. Closure Templates used with Closure Compiler generate this automatically.  

#### Returns

- string

Message localized for current locale.  

### getUILanguage()

```typescript
chrome.i18n.getUILanguage(): string
```

Gets the browser UI language of the browser. This is different from [`i18n.getAcceptLanguages`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages) which returns the preferred user languages.  

#### Returns

- string

  The browser UI language code such as en-US or fr-FR.

<br />

---

## 29. i18n

*File: pages/i18n.md*

# chrome.i18n

<br />

<br />

## Description

Use the `chrome.i18n` infrastructure to implement internationalization across your whole app or extension.

<br />

<br />

<br />

## Manifest

<br />

If an extension has a `/_locales` directory, the [manifest](https://developer.chrome.com/docs/extensions/reference/manifest) must define `"default_locale"`.

## Concepts and usage

You need to put all of its user-visible strings into a file named [`messages.json`](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats). Each time
you add a new locale, you add a messages file under a directory named `/_locales/_localeCode_`, where
*localeCode* is a code such as `en` for English.

Here's the file hierarchy for an internationalized extension that supports English (`en`), Spanish
(`es`), and Korean (`ko`):

![In the extension directory: manifest.json, *.html, *.js, /_locales directory. In the /_locales directory: en, es, and ko directories, each with a messages.json file.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-hierarchy.gif)

### Support multiple languages

Say you have an extension with the files shown in the following figure:

![A manifest.json file and a file with JavaScript. The .json file has 'Hello World'. The JavaScript file has title = 'Hello World'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-before.gif)

To internationalize this extension, you name each user-visible string and put it into a messages
file. The extension's manifest, CSS files, and JavaScript code use each string's name to get its
localized version.

Here's what the extension looks like when it's internationalized (note that it still has only
English strings):

![In the manifest.json file, 'Hello World' has been changed to '__MSG_extName__', and a new default_locale' item has the value 'en'. In the JavaScript file, 'Hello World' has been changed to chrome.i18n.getMessage('extName'). A new file named /_locales/en/messages.json defines 'extName'.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-1.gif)

Some notes about internationalizing:

- You can use any of the [supported locales](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales). If you use an unsupported locale, Google Chrome ignores it.
- In `manifest.json` and CSS files, refer to a string named *messagename* like this:

      __MSG_messagename__

- In your extension or app's JavaScript code, refer to a string named *messagename* like this:

      chrome.i18n.getMessage("messagename")

- In each call to `getMessage()`, you can supply up to 9 strings to be included in the message. See
  [Examples: getMessage](https://developer.chrome.com/docs/extensions/reference/api/i18n#getmessage) for details.

- Some messages, such as `@@bidi_dir` and `@@ui_locale`, are provided by the internationalization
  system. See the [Predefined messages](https://developer.chrome.com/docs/extensions/reference/api/i18n#overview-predefined) section for a full list of predefined message names.

- In `messages.json`, each user-visible string has a name, a "message" item, and an optional
  "description" item. The name is a key such as "extName" or "search_string" that identifies the
  string. The "message" specifies the value of the string in this locale. The optional "description"
  provides help to translators, who might not be able to see how the string is used in your
  extension. For example:

      {
        "search_string": {
          "message": "hello%20world",
          "description": "The string we search for. Put %20 between words that go together."
        },
        ...
      }

For more information, see [Formats: Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats).

Once an extension is internationalized, translating it is straightforward. You copy `messages.json`,
translate it, and put the copy into a new directory under `/_locales`. For example, to support
Spanish, just put a translated copy of `messages.json` under `/_locales/es`. The following figure
shows the previous extension with a new Spanish translation.

![This looks the same as the previous figure, but with a new file at /_locales/es/messages.json that contains a Spanish translation of the messages.](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-after-2.gif)

### Predefined messages

The internationalization system provides a few predefined messages to help you localize. These
include `@@ui_locale`, so you can detect the current UI locale, and a few `@@bidi_...` messages that
let you detect the text direction. The latter messages have similar names to constants in the
[gadgets BIDI (bi-directional) API](https://code.google.com/apis/gadgets/docs/i18n.html#BIDI).

The special message `@@extension_id` can be used in the CSS and JavaScript files, whether or not the
extension or app is localized. This message doesn't work in manifest files.

The following table describes each predefined message.

|     Message name      |                                                                                                     Description                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@@extension_id`      | The extension or app ID; you might use this string to construct URLs for resources inside the extension. Even unlocalized extensions can use this message. **Note:** You can't use this message in a manifest file. |
| `@@ui_locale`         | The current locale; you might use this string to construct locale-specific URLs.                                                                                                                                    |
| `@@bidi_dir`          | The text direction for the current locale, either "ltr" for left-to-right languages such as English or "rtl" for right-to-left languages such as Arabic.                                                            |
| `@@bidi_reversed_dir` | If the `@@bidi_dir` is "ltr", then this is "rtl"; otherwise, it's "ltr".                                                                                                                                            |
| `@@bidi_start_edge`   | If the `@@bidi_dir` is "ltr", then this is "left"; otherwise, it's "right".                                                                                                                                         |
| `@@bidi_end_edge`     | If the `@@bidi_dir` is "ltr", then this is "right"; otherwise, it's "left".                                                                                                                                         |

Here's an example of using `@@extension_id` in a CSS file to construct a URL:  

    body {
      background-image:url('chrome-extension://__MSG_@@extension_id__/background.png');
    }

If the extension ID is abcdefghijklmnopqrstuvwxyzabcdef, then the bold line in the previous code
snippet becomes:  

      background-image:url('chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef/background.png');

Here's an example of using `@@bidi_*` messages in a CSS file:  

    body {
      direction: __MSG_@@bidi_dir__;
    }

    div#header {
      margin-bottom: 1.05em;
      overflow: hidden;
      padding-bottom: 1.5em;
      padding-__MSG_@@bidi_start_edge__: 0;
      padding-__MSG_@@bidi_end_edge__: 1.5em;
      position: relative;
    }

For left-to-right languages such as English, the bold lines become:  

      dir: ltr;
      padding-left: 0;
      padding-right: 1.5em;

### Locales

You can choose from many locales, including some (such as `en`) that let a single translation support multiple variations of a language (such as `en_GB` and `en_US`).

You can localize your extension to any locale that is supported by the Chrome Web Store. If your locale is not listed here, choose the closest alternative. For example, if the default locale of your extension is `"de_CH"`, choose `"de"` in the Chrome Web Store.

| Locale code |           Language (region)           |
|-------------|---------------------------------------|
| `ar`        | Arabic                                |
| `am`        | Amharic                               |
| `bg`        | Bulgarian                             |
| `bn`        | Bengali                               |
| `ca`        | Catalan                               |
| `cs`        | Czech                                 |
| `da`        | Danish                                |
| `de`        | German                                |
| `el`        | Greek                                 |
| `en`        | English                               |
| `en_AU`     | English (Australia)                   |
| `en_GB`     | English (Great Britain)               |
| `en_US`     | English (USA)                         |
| `es`        | Spanish                               |
| `es_419`    | Spanish (Latin America and Caribbean) |
| `et`        | Estonian                              |
| `fa`        | Persian                               |
| `fi`        | Finnish                               |
| `fil`       | Filipino                              |
| `fr`        | French                                |
| `gu`        | Gujarati                              |
| `he`        | Hebrew                                |
| `hi`        | Hindi                                 |
| `hr`        | Croatian                              |
| `hu`        | Hungarian                             |
| `id`        | Indonesian                            |
| `it`        | Italian                               |
| `ja`        | Japanese                              |
| `kn`        | Kannada                               |
| `ko`        | Korean                                |
| `lt`        | Lithuanian                            |
| `lv`        | Latvian                               |
| `ml`        | Malayalam                             |
| `mr`        | Marathi                               |
| `ms`        | Malay                                 |
| `nl`        | Dutch                                 |
| `no`        | Norwegian                             |
| `pl`        | Polish                                |
| `pt_BR`     | Portuguese (Brazil)                   |
| `pt_PT`     | Portuguese (Portugal)                 |
| `ro`        | Romanian                              |
| `ru`        | Russian                               |
| `sk`        | Slovak                                |
| `sl`        | Slovenian                             |
| `sr`        | Serbian                               |
| `sv`        | Swedish                               |
| `sw`        | Swahili                               |
| `ta`        | Tamil                                 |
| `te`        | Telugu                                |
| `th`        | Thai                                  |
| `tr`        | Turkish                               |
| `uk`        | Ukrainian                             |
| `vi`        | Vietnamese                            |
| `zh_CN`     | Chinese (China)                       |
| `zh_TW`     | Chinese (Taiwan)                      |

### Search for messages

You don't have to define every string for every supported locale. As long as the default locale's
`messages.json` file has a value for every string, your extension or app will run no matter how
sparse a translation is. Here's how the extension system searches for a message:

1. Search the messages file (if any) for the user's preferred locale. For example, when Google Chrome's locale is set to British English (`en_GB`), the system first looks for the message in `/_locales/en_GB/messages.json`. If that file exists and the message is there, the system looks no further.
2. If the user's preferred locale has a region (that is, the locale has an underscore: _), search the locale without that region. For example, if the `en_GB` messages file doesn't exist or doesn't contain the message, the system looks in the `en` messages file. If that file exists and the message is there, the system looks no further.
3. Search the messages file for the default locale. For example, if the extension's "default_locale" is set to "es", and neither `/_locales/en_GB/messages.json` nor `/_locales/en/messages.json` contains the message, the extension uses the message from `/_locales/es/messages.json`.

In the following figure, the message named "colores" is in all three locales that the extension
supports, but "extName" is in only two of the locales. Wherever a user running Google Chrome in US
English sees the label "Colors", a user of British English sees "Colours". Both US English and
British English users see the extension name "Hello World". Because the default language is Spanish,
users running Google Chrome in any non-English language see the label "Colores" and the extension
name "Hola mundo".

![Four files: manifest.json and three messages.json files (for es, en, and en_GB). The es and en files show entries for messages named 'extName' and 'colores'; the en_GB file has just one entry (for 'colores').](https://developer.chrome.com/static/docs/extensions/mv2/reference/i18n/images/i18n-strings.gif)

### Set your browser's locale

To test translations, you might want to set your browser's locale. This section tells you how to set
the locale in [Windows](https://developer.chrome.com/docs/extensions/reference/api/i18n#windows), [Mac OS](https://developer.chrome.com/docs/extensions/reference/api/i18n#mac_os), [Linux](https://developer.chrome.com/docs/extensions/reference/api/i18n#linux), and [ChromeOS](https://developer.chrome.com/docs/extensions/reference/api/i18n#chromeos).

#### Windows

You can change the locale using either a locale-specific shortcut or the Google Chrome UI. The
shortcut approach is quicker, once you've set it up, and it lets you use several languages at once.

##### Use a locale-specific shortcut

To create and use a shortcut that launches Google Chrome with a particular locale:

1. Make a copy of the Google Chrome shortcut that's already on your desktop.
2. Rename the new shortcut to match the new locale.
3. Change the shortcut's properties so that the Target field specifies the `--lang` and
   `--user-data-dir` flags. The target should look something like this:

       path_to_chrome.exe --lang=locale --user-data-dir=c:\locale_profile_dir

4. Launch Google Chrome by double-clicking the shortcut.

For example, to create a shortcut that launches Google Chrome in Spanish (`es`), you might create a
shortcut named `chrome-es` that has the following target:  

    path_to_chrome.exe --lang=es --user-data-dir=c:\chrome-profile-es

You can create as many shortcuts as you like, making it straightforward to test in multiple languages. For
example:  

    path_to_chrome.exe --lang=en --user-data-dir=c:\chrome-profile-en
    path_to_chrome.exe --lang=en_GB --user-data-dir=c:\chrome-profile-en_GB
    path_to_chrome.exe --lang=ko --user-data-dir=c:\chrome-profile-ko

| **Note:** Specifying `--user-data-dir` is optional but handy. Having one data directory per locale lets you run the browser in several languages at the same time. A disadvantage is that because the locales' data isn't shared, you have to install your extension multiple times---once per locale, which can be challenging when you don't speak the language. For more information, see [Creating and Using Profiles](https://www.chromium.org/developers/creating-and-using-profiles).

##### Use the UI

Here's how to change the locale using the UI on Google Chrome for Windows:

1. App icon \> **Options**
2. Choose the **Under the Hood** tab
3. Scroll to **Web Content**
4. Click **Change font and language settings**
5. Choose the **Languages** tab
6. Use the drop down to set the **Google Chrome language**
7. Restart Chrome

#### Mac OS

To change the locale on Mac, you use the system preferences.

1. From the Apple menu, choose **System Preferences**
2. Under the **Personal** section, choose **International**
3. Choose your language and location
4. Restart Chrome

#### Linux

To change the locale on Linux, first quit Google Chrome. Then, all in one line, set the LANGUAGE
environment variable and launch Google Chrome. For example:  

    LANGUAGE=es ./chrome

#### ChromeOS

To change the locale on ChromeOS:

1. From the system tray, choose **Settings**.
2. Under the **Languages and input** section, choose the **Language** drop-down.
3. If your language is not listed, click **Add languages** and add it.
4. Once added, click the 3-dot **More actions** menu item next to your language and choose **Display ChromeOS in this language**.
5. Click the **Restart** button that appears next to the set language to restart ChromeOS.

## Examples

You can find examples of internationalization in the [examples/api/i18n](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/api/i18n/) directory. For a
complete example, see [examples/extensions/news](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/_archive/mv2/extensions/news/). For other examples and for help in viewing the
source code, see [Samples](https://developer.chrome.com/docs/extensions/samples).

### getMessage()

The following code gets a localized message from the browser and displays it as a string. It
replaces two placeholders within the message with the strings "string1" and "string2".  

    function getMessage() {
      var message = chrome.i18n.getMessage("click_here", ["string1", "string2"]);
      document.getElementById("languageSpan").innerHTML = message;
    }

Here's how you'd supply and use a single string:  

      // In JavaScript code
      status.innerText = chrome.i18n.getMessage("error", errorDetails);

    "error": {
      "message": "Error: $details$",
      "description": "Generic error template. Expects error parameter to be passed in.",
      "placeholders": {
        "details": {
          "content": "$1",
          "example": "Failed to fetch RSS feed."
        }
      }
    }

For more information about placeholders, see the [Locale-Specific Messages](https://developer.chrome.com/docs/extensions/how-to/ui/localization-message-formats#placeholders) page. For details on
calling `getMessage()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getMessage).

### getAcceptLanguages()

The following code gets accept-languages from the browser and displays them as a string by
separating each accept-language with ','.  

    function getAcceptLanguages() {
      chrome.i18n.getAcceptLanguages(function(languageList) {
        var languages = languageList.join(",");
        document.getElementById("languageSpan").innerHTML = languages;
      })
    }

For details on calling `getAcceptLanguages()`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages).

### detectLanguage()

The following code detects up to 3 languages from the given string and displays the result as
strings separated by new lines.  

    function detectLanguage(inputText) {
      chrome.i18n.detectLanguage(inputText, function(result) {
        var outputLang = "Detected Language: ";
        var outputPercent = "Language Percentage: ";
        for(i = 0; i < result.languages.length; i++) {
          outputLang += result.languages[i].language + " ";
          outputPercent +=result.languages[i].percentage + " ";
        }
        document.getElementById("languageSpan").innerHTML = outputLang + "\n" + outputPercent + "\nReliable: " + result.isReliable;
      });
    }

For more details on calling `detectLanguage(inputText)`, see the [API reference](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-detectLanguage).

<br />

## Types

### LanguageCode

Chrome 47+

An ISO language code such as `en` or `fr`. For a complete list of languages supported by this method, see [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc). For an unknown language, `und` will be returned, which means that \[percentage\] of the text is unknown to CLD  

#### Type

string

## Methods

### detectLanguage()

Chrome 47+

```typescript
chrome.i18n.detectLanguage(
  text: string,
): Promise<object>
```

Detects the language of the provided text using CLD.  

#### Parameters

  - text  
  string

User input string to be translated.  

#### Returns

  - Promise\<object\>  
Chrome 99+  

### getAcceptLanguages()

```typescript
chrome.i18n.getAcceptLanguages(): Promise<https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode[]>
```

Gets the accept-languages of the browser. This is different from the locale used by the browser; to get the locale, use [`i18n.getUILanguage`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getUILanguage).  

#### Returns

  - Promise\<[LanguageCode](https://developer.chrome.com/docs/extensions/reference/api/i18n#type-LanguageCode)\[\]\>  
Chrome 99+  

### getMessage()

```typescript
chrome.i18n.getMessage(
  messageName: string,
  substitutions?: any,
  options?: object,
): string
```

Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the `getMessage()` call is wrong --- for example, *messageName* is not a string or the *substitutions* array has more than 9 elements --- this method returns `undefined`.  

#### Parameters

  - messageName  
  string

  The name of the message, as specified in the [`messages.json`](https://developer.chrome.com/extensions/how-to/ui/localization-message-formats) file.
  - substitutions  
  any optional

  Up to 9 substitution strings, if the message requires any.
  - options  
  object optional  
  Chrome 79+  
    - escapeLt  
    boolean optional

Escape `<` in translation to `&lt;`. This applies only to the message itself, not to the placeholders. Developers might want to use this if the translation is used in an HTML context. Closure Templates used with Closure Compiler generate this automatically.  

#### Returns

- string

Message localized for current locale.  

### getUILanguage()

```typescript
chrome.i18n.getUILanguage(): string
```

Gets the browser UI language of the browser. This is different from [`i18n.getAcceptLanguages`](https://developer.chrome.com/docs/extensions/reference/api/i18n#method-getAcceptLanguages) which returns the preferred user languages.  

#### Returns

- string

  The browser UI language code such as en-US or fr-FR.

<br />

---

## 30. identity

*File: pages/identity.md*

# chrome.identity

<br />

<br />

## Description

Use the `chrome.identity` API to get OAuth2 access tokens.

<br />

<br />

## Permissions

`identity`  

<br />

<br />

<br />

<br />

## Types

### AccountInfo

#### Properties

  - id  
  string

A unique identifier for the account. This ID will not change for the lifetime of the account.  

### AccountStatus

Chrome 84+  

#### Enum

"SYNC"   
Specifies that Sync is enabled for the primary account.
"ANY"   
Specifies the existence of a primary account, if any.

<br />

### GetAuthTokenResult

Chrome 105+  

#### Properties

  - grantedScopes  
  string\[\] optional

  A list of OAuth2 scopes granted to the extension.
  - token  
  string optional

The specific token associated with the request.  

### InvalidTokenDetails

#### Properties

  - token  
  string

The specific token that should be removed from the cache.  

### ProfileDetails

Chrome 84+  

#### Properties

  - accountStatus  
  [AccountStatus](https://developer.chrome.com/docs/extensions/reference/api/identity#type-AccountStatus) optional

A status of the primary account signed into a profile whose `ProfileUserInfo` should be returned. Defaults to `SYNC` account status.  

### ProfileUserInfo

#### Properties

  - email  
  string

  An email address for the user account signed into the current profile. Empty if the user is not signed in or the `identity.email` manifest permission is not specified.
  - id  
  string

A unique identifier for the account. This ID will not change for the lifetime of the account. Empty if the user is not signed in or (in M41+) the `identity.email` manifest permission is not specified.  

### TokenDetails

#### Properties

  - account  
  [AccountInfo](https://developer.chrome.com/docs/extensions/reference/api/identity#type-AccountInfo) optional

  The account ID whose token should be returned. If not specified, the function will use an account from the Chrome profile: the Sync account if there is one, or otherwise the first Google web account.
  - enableGranularPermissions  
  boolean optional  
  Chrome 87+

  The `enableGranularPermissions` flag allows extensions to opt-in early to the granular permissions consent screen, in which requested permissions are granted or denied individually.
  - interactive  
  boolean optional

  Fetching a token may require the user to sign-in to Chrome, or approve the application's requested scopes. If the interactive flag is `true`, `getAuthToken` will prompt the user as necessary. When the flag is `false` or omitted, `getAuthToken` will return failure any time a prompt would be required.
  - scopes  
  string\[\] optional

  A list of OAuth2 scopes to request.

When the `scopes` field is present, it overrides the list of scopes specified in manifest.json.  

### WebAuthFlowDetails

#### Properties

  - abortOnLoadForNonInteractive  
  boolean optional  
  Chrome 113+

  Whether to terminate `launchWebAuthFlow` for non-interactive requests after the page loads. This parameter does not affect interactive flows.

  When set to `true` (default) the flow will terminate immediately after the page loads. When set to `false`, the flow will only terminate after the `timeoutMsForNonInteractive` passes. This is useful for identity providers that use JavaScript to perform redirections after the page loads.
  - interactive  
  boolean optional

  Whether to launch auth flow in interactive mode.

  Since some auth flows may immediately redirect to a result URL, `launchWebAuthFlow` hides its web view until the first navigation either redirects to the final URL, or finishes loading a page meant to be displayed.

  If the `interactive` flag is `true`, the window will be displayed when a page load completes. If the flag is `false` or omitted, `launchWebAuthFlow` will return with an error if the initial navigation does not complete the flow.

  For flows that use JavaScript for redirection, `abortOnLoadForNonInteractive` can be set to `false` in combination with setting `timeoutMsForNonInteractive` to give the page a chance to perform any redirects.
  - timeoutMsForNonInteractive  
  number optional  
  Chrome 113+

  The maximum amount of time, in miliseconds, `launchWebAuthFlow` is allowed to run in non-interactive mode in total. Only has an effect if `interactive` is `false`.
  - url  
  string

  The URL that initiates the auth flow.

## Methods

### clearAllCachedAuthTokens()

Chrome 87+

```typescript
chrome.identity.clearAllCachedAuthTokens(): Promise<void>
```

Resets the state of the Identity API:

- Removes all OAuth2 access tokens from the token cache
- Removes user's account preferences
- De-authorizes the user from all auth flows  

#### Returns

  - Promise\<void\>  
Chrome 106+  

### getAccounts()

Dev channel

```typescript
chrome.identity.getAccounts(): Promise<https://developer.chrome.com/docs/extensions/reference/api/identity#type-AccountInfo[]>
```

Retrieves a list of AccountInfo objects describing the accounts present on the profile.

`getAccounts` is only supported on dev channel.  

#### Returns

- Promise\<[AccountInfo](https://developer.chrome.com/docs/extensions/reference/api/identity#type-AccountInfo)\[\]\>  

### getAuthToken()

```typescript
chrome.identity.getAuthToken(
  details?: TokenDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/identity#type-GetAuthTokenResult>
```

Gets an OAuth2 access token using the client ID and scopes specified in the [`oauth2` section of manifest.json](https://developer.chrome.com/docs/apps/app_identity#update_manifest).

The Identity API caches access tokens in memory, so it's ok to call `getAuthToken` non-interactively any time a token is required. The token cache automatically handles expiration.

For a good user experience it is important interactive token requests are initiated by UI in your app explaining what the authorization is for. Failing to do this will cause your users to get authorization requests, or Chrome sign in screens if they are not signed in, with with no context. In particular, do not use `getAuthToken` interactively when your app is first launched.

Note: When called with a callback, instead of returning an object this function will return the two properties as separate arguments passed to the callback.  

#### Parameters

  - details  
  [TokenDetails](https://developer.chrome.com/docs/extensions/reference/api/identity#type-TokenDetails) optional

Token options.  

#### Returns

  - Promise\<[GetAuthTokenResult](https://developer.chrome.com/docs/extensions/reference/api/identity#type-GetAuthTokenResult)\>  
Chrome 105+  

### getProfileUserInfo()

```typescript
chrome.identity.getProfileUserInfo(
  details?: ProfileDetails,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/identity#type-ProfileUserInfo>
```

Retrieves email address and obfuscated gaia id of the user signed into a profile.

Requires the `identity.email` manifest permission. Otherwise, returns an empty result.

This API is different from identity.getAccounts in two ways. The information returned is available offline, and it only applies to the primary account for the profile.  

#### Parameters

  - details  
  [ProfileDetails](https://developer.chrome.com/docs/extensions/reference/api/identity#type-ProfileDetails) optional  
  Chrome 84+

Profile options.  

#### Returns

  - Promise\<[ProfileUserInfo](https://developer.chrome.com/docs/extensions/reference/api/identity#type-ProfileUserInfo)\>  
Chrome 106+  

### getRedirectURL()

```typescript
chrome.identity.getRedirectURL(
  path?: string,
): string
```

Generates a redirect URL to be used in `launchWebAuthFlow`.

The generated URLs match the pattern `https://<app-id>.chromiumapp.org/*`.  

#### Parameters

  - path  
  string optional

The path appended to the end of the generated URL.  

#### Returns

- string  

### launchWebAuthFlow()

```typescript
chrome.identity.launchWebAuthFlow(
  details: WebAuthFlowDetails,
): Promise<string | undefined>
```

Starts an auth flow at the specified URL.

This method enables auth flows with non-Google identity providers by launching a web view and navigating it to the first URL in the provider's auth flow. When the provider redirects to a URL matching the pattern `https://<app-id>.chromiumapp.org/*`, the window will close, and the final redirect URL will be passed to the `callback` function.

For a good user experience it is important interactive auth flows are initiated by UI in your app explaining what the authorization is for. Failing to do this will cause your users to get authorization requests with no context. In particular, do not launch an interactive auth flow when your app is first launched.  

#### Parameters

  - details  
  [WebAuthFlowDetails](https://developer.chrome.com/docs/extensions/reference/api/identity#type-WebAuthFlowDetails)

WebAuth flow options.  

#### Returns

  - Promise\<string \| undefined\>  
Chrome 106+  

### removeCachedAuthToken()

```typescript
chrome.identity.removeCachedAuthToken(
  details: InvalidTokenDetails,
): Promise<void>
```

Removes an OAuth2 access token from the Identity API's token cache.

If an access token is discovered to be invalid, it should be passed to removeCachedAuthToken to remove it from the cache. The app may then retrieve a fresh token with `getAuthToken`.  

#### Parameters

  - details  
  [InvalidTokenDetails](https://developer.chrome.com/docs/extensions/reference/api/identity#type-InvalidTokenDetails)

Token information.  

#### Returns

  - Promise\<void\>  
  Chrome 106+

## Events

### onSignInChanged

```typescript
chrome.identity.onSignInChanged.addListener(
  callback: function,
)
```

Fired when signin state changes for an account on the user's profile.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (account: AccountInfo, signedIn: boolean) => void
  ```

  <br />

    - account  
    [AccountInfo](https://developer.chrome.com/docs/extensions/reference/api/identity#type-AccountInfo)
    - signedIn  
    boolean

<br />

---

## 31. idle

*File: pages/idle.md*

# chrome.idle

<br />

<br />

## Description

Use the `chrome.idle` API to detect when the machine's idle state changes.

<br />

<br />

## Permissions

`idle`  

<br />

You must declare the `"idle"` permission in your extension's manifest to use the idle API. For
example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "idle"
      ],
      ...
    }

<br />

<br />

<br />

## Types

### IdleState

Chrome 44+  

#### Enum

"active"   
"idle"   
"locked"   

<br />

## Methods

### getAutoLockDelay()

Chrome 73+ ChromeOS only

```typescript
chrome.idle.getAutoLockDelay(): Promise<number>
```

Gets the time, in seconds, it takes until the screen is locked automatically while idle. Returns a zero duration if the screen is never locked automatically. Currently supported on Chrome OS only.  

#### Returns

  - Promise\<number\>  
Chrome 116+  

### queryState()

```typescript
chrome.idle.queryState(
  detectionIntervalInSeconds: number,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState>
```

Returns "locked" if the system is locked, "idle" if the user has not generated any input for a specified number of seconds, or "active" otherwise.  

#### Parameters

  - detectionIntervalInSeconds  
  number

The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.  

#### Returns

  - Promise\<[IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)\>  
Chrome 116+  

### setDetectionInterval()

```typescript
chrome.idle.setDetectionInterval(
  intervalInSeconds: number,
): void
```

Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.  

#### Parameters

  - intervalInSeconds  
  number

  Threshold, in seconds, used to determine when the system is in an idle state.

## Events

### onStateChanged

```typescript
chrome.idle.onStateChanged.addListener(
  callback: function,
)
```

Fired when the system changes to an active, idle or locked state. The event fires with "locked" if the screen is locked or the screensaver activates, "idle" if the system is unlocked and the user has not generated any input for a specified number of seconds, and "active" when the user generates input on an idle system.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (newState: IdleState) => void
  ```

  <br />

    - newState  
    [IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)

<br />

---

## 32. instanceID

*File: pages/instanceID.md*

# chrome.idle

<br />

<br />

## Description

Use the `chrome.idle` API to detect when the machine's idle state changes.

<br />

<br />

## Permissions

`idle`  

<br />

You must declare the `"idle"` permission in your extension's manifest to use the idle API. For
example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "idle"
      ],
      ...
    }

<br />

<br />

<br />

## Types

### IdleState

Chrome 44+  

#### Enum

"active"   
"idle"   
"locked"   

<br />

## Methods

### getAutoLockDelay()

Chrome 73+ ChromeOS only

```typescript
chrome.idle.getAutoLockDelay(): Promise<number>
```

Gets the time, in seconds, it takes until the screen is locked automatically while idle. Returns a zero duration if the screen is never locked automatically. Currently supported on Chrome OS only.  

#### Returns

  - Promise\<number\>  
Chrome 116+  

### queryState()

```typescript
chrome.idle.queryState(
  detectionIntervalInSeconds: number,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState>
```

Returns "locked" if the system is locked, "idle" if the user has not generated any input for a specified number of seconds, or "active" otherwise.  

#### Parameters

  - detectionIntervalInSeconds  
  number

The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.  

#### Returns

  - Promise\<[IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)\>  
Chrome 116+  

### setDetectionInterval()

```typescript
chrome.idle.setDetectionInterval(
  intervalInSeconds: number,
): void
```

Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.  

#### Parameters

  - intervalInSeconds  
  number

  Threshold, in seconds, used to determine when the system is in an idle state.

## Events

### onStateChanged

```typescript
chrome.idle.onStateChanged.addListener(
  callback: function,
)
```

Fired when the system changes to an active, idle or locked state. The event fires with "locked" if the screen is locked or the screensaver activates, "idle" if the system is unlocked and the user has not generated any input for a specified number of seconds, and "active" when the user generates input on an idle system.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (newState: IdleState) => void
  ```

  <br />

    - newState  
    [IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)

<br />

---

## 33. loginState

*File: pages/loginState.md*

# chrome.idle

<br />

<br />

## Description

Use the `chrome.idle` API to detect when the machine's idle state changes.

<br />

<br />

## Permissions

`idle`  

<br />

You must declare the `"idle"` permission in your extension's manifest to use the idle API. For
example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "idle"
      ],
      ...
    }

<br />

<br />

<br />

## Types

### IdleState

Chrome 44+  

#### Enum

"active"   
"idle"   
"locked"   

<br />

## Methods

### getAutoLockDelay()

Chrome 73+ ChromeOS only

```typescript
chrome.idle.getAutoLockDelay(): Promise<number>
```

Gets the time, in seconds, it takes until the screen is locked automatically while idle. Returns a zero duration if the screen is never locked automatically. Currently supported on Chrome OS only.  

#### Returns

  - Promise\<number\>  
Chrome 116+  

### queryState()

```typescript
chrome.idle.queryState(
  detectionIntervalInSeconds: number,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState>
```

Returns "locked" if the system is locked, "idle" if the user has not generated any input for a specified number of seconds, or "active" otherwise.  

#### Parameters

  - detectionIntervalInSeconds  
  number

The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.  

#### Returns

  - Promise\<[IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)\>  
Chrome 116+  

### setDetectionInterval()

```typescript
chrome.idle.setDetectionInterval(
  intervalInSeconds: number,
): void
```

Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.  

#### Parameters

  - intervalInSeconds  
  number

  Threshold, in seconds, used to determine when the system is in an idle state.

## Events

### onStateChanged

```typescript
chrome.idle.onStateChanged.addListener(
  callback: function,
)
```

Fired when the system changes to an active, idle or locked state. The event fires with "locked" if the screen is locked or the screensaver activates, "idle" if the system is unlocked and the user has not generated any input for a specified number of seconds, and "active" when the user generates input on an idle system.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (newState: IdleState) => void
  ```

  <br />

    - newState  
    [IdleState](https://developer.chrome.com/docs/extensions/reference/api/idle#type-IdleState)

<br />

---

## 34. management

*File: pages/management.md*

# chrome.management

<br />

<br />

## Description

The `chrome.management` API provides ways to manage installed apps and extensions.

<br />

<br />

## Permissions

`management`  

<br />

You must declare the "management" permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use the management
API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "management"
      ],
      ...
    }

<br />

<br />

[`management.getPermissionWarningsByManifest()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-getPermissionWarningsByManifest), [`management.uninstallSelf()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-uninstallSelf), and
[`management.getSelf()`](https://developer.chrome.com/docs/extensions/reference/api/management#method-getSelf) do not require the management permission.

<br />

## Types

### ExtensionDisabledReason

Chrome 44+

A reason the item is disabled.  

#### Enum

"unknown"   
"permissions_increase"   

<br />

### ExtensionInfo

Information about an installed extension, app, or theme.  

#### Properties

  - appLaunchUrl  
  string optional

  The launch url (only present for apps).
  - availableLaunchTypes  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType)\[\] optional

  The currently available launch types (only present for apps).
  - description  
  string

  The description of this extension, app, or theme.
  - disabledReason  
  [ExtensionDisabledReason](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionDisabledReason) optional

  A reason the item is disabled.
  - enabled  
  boolean

  Whether it is currently enabled or disabled.
  - homepageUrl  
  string optional

  The URL of the homepage of this extension, app, or theme.
  - hostPermissions  
  string\[\]

  Returns a list of host based permissions.
  - icons  
  [IconInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-IconInfo)\[\] optional

  A list of icon information. Note that this just reflects what was declared in the manifest, and the actual image at that url may be larger or smaller than what was declared, so you might consider using explicit width and height attributes on img tags referencing these images. See the [manifest documentation on icons](https://developer.chrome.com/docs/extensions/reference/manifest/icons) for more details.
  - id  
  string

  The extension's unique identifier.
  - installType  
  [ExtensionInstallType](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInstallType)

  How the extension was installed.
  - isApp  
  boolean  
  Deprecated

  Please use [`management.ExtensionInfo.type`](https://developer.chrome.com/docs/extensions/reference/api/management#property-ExtensionInfo-type).

  <br />

  True if this is an app.
  - launchType  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType) optional

  The app launch type (only present for apps).
  - mayDisable  
  boolean

  Whether this extension can be disabled or uninstalled by the user.
  - mayEnable  
  boolean optional  
  Chrome 62+

  Whether this extension can be enabled by the user. This is only returned for extensions which are not enabled.
  - name  
  string

  The name of this extension, app, or theme.
  - offlineEnabled  
  boolean

  Whether the extension, app, or theme declares that it supports offline.
  - optionsUrl  
  string

  The url for the item's options page, if it has one.
  - permissions  
  string\[\]

  Returns a list of API based permissions.
  - shortName  
  string

  A short version of the name of this extension, app, or theme.
  - type  
  [ExtensionType](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionType)

  The type of this extension, app, or theme.
  - updateUrl  
  string optional

  The update URL of this extension, app, or theme.
  - version  
  string

  The [version](https://developer.chrome.com/docs/extensions/reference/manifest/version) of this extension, app, or theme.
  - versionName  
  string optional  
  Chrome 50+

The [version name](https://developer.chrome.com/docs/extensions/reference/manifest/version#version_name) of this extension, app, or theme if the manifest specified one.  

### ExtensionInstallType

Chrome 44+

How the extension was installed. One of
`admin`: The extension was installed because of an administrative policy,
`development`: The extension was loaded unpacked in developer mode,
`normal`: The extension was installed normally via a .crx file,
`sideload`: The extension was installed by other software on the machine,
`other`: The extension was installed by other means.  

#### Enum

"admin"   
"development"   
"normal"   
"sideload"   
"other"   

<br />

### ExtensionType

Chrome 44+

The type of this extension, app, or theme.  

#### Enum

"extension"   
"hosted_app"   
"packaged_app"   
"legacy_packaged_app"   
"theme"   
"login_screen_extension"   

<br />

### IconInfo

Information about an icon belonging to an extension, app, or theme.  

#### Properties

  - size  
  number

  A number representing the width and height of the icon. Likely values include (but are not limited to) 128, 48, 24, and 16.
  - url  
  string

The URL for this icon image. To display a grayscale version of the icon (to indicate that an extension is disabled, for example), append `?grayscale=true` to the URL.  

### LaunchType

These are all possible app launch types.  

#### Enum

"OPEN_AS_REGULAR_TAB"   
"OPEN_AS_PINNED_TAB"   
"OPEN_AS_WINDOW"   
"OPEN_FULL_SCREEN"   

<br />

### UninstallOptions

Chrome 88+

Options for how to handle the extension's uninstallation.  

#### Properties

  - showConfirmDialog  
  boolean optional

  Whether or not a confirm-uninstall dialog should prompt the user. Defaults to false for self uninstalls. If an extension uninstalls another extension, this parameter is ignored and the dialog is always shown.

## Methods

### createAppShortcut()

```typescript
chrome.management.createAppShortcut(
  id: string,
): Promise<void>
```

Display options to create shortcuts for an app. On Mac, only packaged app shortcuts can be created.  

#### Parameters

  - id  
  string

This should be the id from an app item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### generateAppForLink()

```typescript
chrome.management.generateAppForLink(
  url: string,
  title: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Generate an app for a URL. Returns the generated bookmark app.  

#### Parameters

  - url  
  string

  The URL of a web page. The scheme of the URL can only be "http" or "https".
  - title  
  string

The title of the generated app.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### get()

```typescript
chrome.management.get(
  id: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Returns information about the installed extension, app, or theme that has the given ID.  

#### Parameters

  - id  
  string

The ID from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### getAll()

```typescript
chrome.management.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo[]>
```

Returns a list of information about installed extensions and apps.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\[\]\>  
Chrome 88+  

### getPermissionWarningsById()

```typescript
chrome.management.getPermissionWarningsById(
  id: string,
): Promise<string[]>
```

Returns a list of [permission warnings](https://developer.chrome.com/extensions/develop/concepts/permission-warnings) for the given extension id.  

#### Parameters

  - id  
  string

The ID of an already installed extension.  

#### Returns

  - Promise\<string\[\]\>  
Chrome 88+  

### getPermissionWarningsByManifest()

```typescript
chrome.management.getPermissionWarningsByManifest(
  manifestStr: string,
): Promise<string[]>
```

Returns a list of [permission warnings](https://developer.chrome.com/extensions/develop/concepts/permission-warnings) for the given extension manifest string. Note: This function can be used without requesting the 'management' permission in the manifest.  

#### Parameters

  - manifestStr  
  string

Extension manifest JSON string.  

#### Returns

  - Promise\<string\[\]\>  
Chrome 88+  

### getSelf()

```typescript
chrome.management.getSelf(): Promise<https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo>
```

Returns information about the calling extension, app, or theme. Note: This function can be used without requesting the 'management' permission in the manifest.  

#### Returns

  - Promise\<[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)\>  
Chrome 88+  

### installReplacementWebApp()

Chrome 77+

```typescript
chrome.management.installReplacementWebApp(): Promise<void>
```

Launches the replacement_web_app specified in the manifest. Prompts the user to install if not already installed.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### launchApp()

```typescript
chrome.management.launchApp(
  id: string,
): Promise<void>
```

Launches an application.  

#### Parameters

  - id  
  string

The extension id of the application.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### setEnabled()

```typescript
chrome.management.setEnabled(
  id: string,
  enabled: boolean,
): Promise<void>
```

Enables or disables an app or extension. In most cases this function must be called in the context of a user gesture (e.g. an onclick handler for a button), and may present the user with a native confirmation UI as a way of preventing abuse.  

#### Parameters

  - id  
  string

  This should be the id from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - enabled  
  boolean

Whether this item should be enabled or disabled.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### setLaunchType()

```typescript
chrome.management.setLaunchType(
  id: string,
  launchType: LaunchType,
): Promise<void>
```

Set the launch type of an app.  

#### Parameters

  - id  
  string

  This should be the id from an app item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - launchType  
  [LaunchType](https://developer.chrome.com/docs/extensions/reference/api/management#type-LaunchType)

The target launch type. Always check and make sure this launch type is in [`ExtensionInfo.availableLaunchTypes`](https://developer.chrome.com/docs/extensions/reference/api/management#property-ExtensionInfo-availableLaunchTypes), because the available launch types vary on different platforms and configurations.  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### uninstall()

```typescript
chrome.management.uninstall(
  id: string,
  options?: UninstallOptions,
): Promise<void>
```

Uninstalls a currently installed app or extension. Note: This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app. If the uninstall fails (e.g. the user cancels the dialog) the promise will be rejected or the callback will be called with [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) set.  

#### Parameters

  - id  
  string

  This should be the id from an item of [`management.ExtensionInfo`](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo).
  - options  
[UninstallOptions](https://developer.chrome.com/docs/extensions/reference/api/management#type-UninstallOptions) optional  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### uninstallSelf()

```typescript
chrome.management.uninstallSelf(
  options?: UninstallOptions,
): Promise<void>
```

Uninstalls the calling extension. Note: This function can be used without requesting the 'management' permission in the manifest. This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app.  

#### Parameters

  - options  
[UninstallOptions](https://developer.chrome.com/docs/extensions/reference/api/management#type-UninstallOptions) optional  

#### Returns

  - Promise\<void\>  
  Chrome 88+

## Events

### onDisabled

```typescript
chrome.management.onDisabled.addListener(
  callback: function,
)
```

Fired when an app or extension has been disabled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onEnabled

```typescript
chrome.management.onEnabled.addListener(
  callback: function,
)
```

Fired when an app or extension has been enabled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onInstalled

```typescript
chrome.management.onInstalled.addListener(
  callback: function,
)
```

Fired when an app or extension has been installed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: ExtensionInfo) => void
  ```

  <br />

    - info  
[ExtensionInfo](https://developer.chrome.com/docs/extensions/reference/api/management#type-ExtensionInfo)  

### onUninstalled

```typescript
chrome.management.onUninstalled.addListener(
  callback: function,
)
```

Fired when an app or extension has been uninstalled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (id: string) => void
  ```

  <br />

    - id  
    string

<br />

---

## 35. notifications

*File: pages/notifications.md*

# chrome.notifications

<br />

<br />

## Description

Use the `chrome.notifications` API to create rich notifications using templates and show these notifications to users in the system tray.

<br />

<br />

## Permissions

`notifications`  

<br />

<br />

<br />

<br />

## Types

### NotificationBitmap

### NotificationButton

#### Properties

  - iconUrl  
  string optional  
  Deprecated since Chrome 59

  Button icons not visible for Mac OS X users.

  <br />

  - title  
string  

### NotificationItem

#### Properties

  - message  
  string

  Additional details about this item.
  - title  
  string

Title of one item of a list notification.  

### NotificationOptions

#### Properties

  - appIconMaskUrl  
  string optional  
  Deprecated since Chrome 59

  The app icon mask is not visible for Mac OS X users.

  <br />

  A URL to the app icon mask. URLs have the same restrictions as [iconUrl](https://developer.chrome.com/docs/extensions/reference/api/notifications#property-NotificationOptions-iconUrl).

  The app icon mask should be in alpha channel, as only the alpha channel of the image will be considered.
  - buttons  
  [NotificationButton](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-NotificationButton)\[\] optional

  Text and icons for up to two notification action buttons.
  - contextMessage  
  string optional

  Alternate notification content with a lower-weight font.
  - eventTime  
  number optional

  A timestamp associated with the notification, in milliseconds past the epoch (e.g. `Date.now() + n`).
  - iconUrl  
  string optional

  A URL to the sender's avatar, app icon, or a thumbnail for image notifications.

  URLs can be a data URL, a blob URL, or a URL relative to a resource within this extension's .crx file

  \*\*Note:\*\*This value is required for the [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create)`()` method.
  - imageUrl  
  string optional  
  Deprecated since Chrome 59

  The image is not visible for Mac OS X users.

  <br />

  A URL to the image thumbnail for image-type notifications. URLs have the same restrictions as [iconUrl](https://developer.chrome.com/docs/extensions/reference/api/notifications#property-NotificationOptions-iconUrl).
  - isClickable  
  boolean optional  
  Deprecated since Chrome 67

  This UI hint is ignored as of Chrome 67

  <br />

  - items  
  [NotificationItem](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-NotificationItem)\[\] optional

  Items for multi-item notifications. Users on Mac OS X only see the first item.
  - message  
  string optional

  Main notification content.

  \*\*Note:\*\*This value is required for the [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create)`()` method.
  - priority  
  number optional

  Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default. On platforms that don't support a notification center (Windows, Linux \& Mac), -2 and -1 result in an error as notifications with those priorities will not be shown at all.
  - progress  
  number optional

  Current progress ranges from 0 to 100.
  - requireInteraction  
  boolean optional  
  Chrome 50+

  Indicates that the notification should remain visible on screen until the user activates or dismisses the notification. This defaults to false.
  - silent  
  boolean optional  
  Chrome 70+

  Indicates that no sounds or vibrations should be made when the notification is being shown. This defaults to false.
  - title  
  string optional

  Title of the notification (e.g. sender name for email).

  \*\*Note:\*\*This value is required for the [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create)`()` method.
  - type  
  [TemplateType](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-TemplateType) optional

Which type of notification to display. *Required for [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create)* method.  

### PermissionLevel

#### Enum

"granted"   
Specifies that the user has elected to show notifications from the app or extension. This is the default at install time.
"denied"   
Specifies that the user has elected not to show notifications from the app or extension.

<br />

### TemplateType

#### Enum

"basic"   
Contains an icon, title, message, expandedMessage, and up to two buttons.
"image"   
Contains an icon, title, message, expandedMessage, image, and up to two buttons.
"list"   
Contains an icon, title, message, items, and up to two buttons. Users on Mac OS X only see the first item.
"progress"   
Contains an icon, title, message, progress, and up to two buttons.

<br />

## Methods

### clear()

```typescript
chrome.notifications.clear(
  notificationId: string,
): Promise<boolean>
```

Clears the specified notification.  

#### Parameters

  - notificationId  
  string

The id of the notification to be cleared. This is returned by [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create) method.  

#### Returns

  - Promise\<boolean\>  
Chrome 116+  

### create()

```typescript
chrome.notifications.create(
  notificationId?: string,
  options: NotificationOptions,
): Promise<string>
```

Creates and displays a notification.  

#### Parameters

  - notificationId  
  string optional

  Identifier of the notification. If not set or empty, an ID will automatically be generated. If it matches an existing notification, this method first clears that notification before proceeding with the create operation. The identifier may not be longer than 500 characters.

  The `notificationId` parameter is required before Chrome 42.
  - options  
  [NotificationOptions](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-NotificationOptions)

Contents of the notification.  

#### Returns

  - Promise\<string\>  
Chrome 116+  

### getAll()

```typescript
chrome.notifications.getAll(): Promise<object>
```

Retrieves all the notifications of this app or extension.  

#### Returns

  - Promise\<object\>  
Chrome 116+  

### getPermissionLevel()

```typescript
chrome.notifications.getPermissionLevel(): Promise<https://developer.chrome.com/docs/extensions/reference/api/notifications#type-PermissionLevel>
```

Retrieves whether the user has enabled notifications from this app or extension.  

#### Returns

  - Promise\<[PermissionLevel](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-PermissionLevel)\>  
Chrome 116+  

### update()

```typescript
chrome.notifications.update(
  notificationId: string,
  options: NotificationOptions,
): Promise<boolean>
```

Updates an existing notification.  

#### Parameters

  - notificationId  
  string

  The id of the notification to be updated. This is returned by [`notifications.create`](https://developer.chrome.com/docs/extensions/reference/api/notifications#method-create) method.
  - options  
  [NotificationOptions](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-NotificationOptions)

Contents of the notification to update to.  

#### Returns

  - Promise\<boolean\>  
  Chrome 116+

## Events

### onButtonClicked

```typescript
chrome.notifications.onButtonClicked.addListener(
  callback: function,
)
```

The user pressed a button in the notification.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (notificationId: string, buttonIndex: number) => void
  ```

  <br />

    - notificationId  
    string
    - buttonIndex  
number  

### onClicked

```typescript
chrome.notifications.onClicked.addListener(
  callback: function,
)
```

The user clicked in a non-button area of the notification.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (notificationId: string) => void
  ```

  <br />

    - notificationId  
string  

### onClosed

```typescript
chrome.notifications.onClosed.addListener(
  callback: function,
)
```

The notification closed, either by the system or by user action.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (notificationId: string, byUser: boolean) => void
  ```

  <br />

    - notificationId  
    string
    - byUser  
boolean  

### onPermissionLevelChanged

```typescript
chrome.notifications.onPermissionLevelChanged.addListener(
  callback: function,
)
```

The user changes the permission level. As of Chrome 47, only ChromeOS has UI that dispatches this event.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (level: PermissionLevel) => void
  ```

  <br />

    - level  
[PermissionLevel](https://developer.chrome.com/docs/extensions/reference/api/notifications#type-PermissionLevel)  

### onShowSettings

Deprecated since Chrome 65

```typescript
chrome.notifications.onShowSettings.addListener(
  callback: function,
)
```

Custom notification settings button is no longer supported.

<br />

The user clicked on a link for the app's notification settings. As of Chrome 47, only ChromeOS has UI that dispatches this event. As of Chrome 65, that UI has been removed from ChromeOS, too.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 36. offscreen

*File: pages/offscreen.md*

# chrome.offscreen

<br />

<br />

## Description

Use the `offscreen` API to create and manage offscreen documents.

<br />

<br />

## Permissions

`offscreen`  

<br />

To use the Offscreen API, declare the `"offscreen"` permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest). For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "offscreen"
      ],
      ...
    }

<br />

## Availability

Chrome 109+ MV3+

<br />

<br />

## Concepts and usage

Service workers don't have DOM access, and many websites have content security policies that
limit the functionality of content scripts. The Offscreen API allows the extension to use DOM
APIs in a hidden document without interrupting the user experience by opening new windows or
tabs. The [`runtime`](https://developer.chrome.com/docs/extensions/reference/runtime) API is the only extensions API
supported by offscreen documents.

Pages loaded as offscreen documents are handled differently from other types of extension pages.
The extension's permissions carry over to offscreen documents, but with limits on extension API
access. For example, because the [`chrome.runtime`](https://developer.chrome.com/docs/extensions/reference/api/runtime) API is the only
extensions API supported by offscreen documents, messaging must be handled
using members of that API.

The following are other ways offscreen documents behave differently from normal pages:

- An offscreen document's URL must be a static HTML file bundled with the extension.
- Offscreen documents can't be focused.
- An offscreen document is an instance of [`window`](https://developer.mozilla.org/docs/Web/API/Window), but the value of its `opener` property is always `null`.
- Though an extension package can contain multiple offscreen documents, an installed extension can only have one open at a time. If the extension is running in split mode with an active incognito profile, the normal and incognito profiles can each have one offscreen document.

Use [`chrome.offscreen.createDocument()`](https://developer.chrome.com/docs/extensions/reference/api/offscreen#method-createDocument) and
[`chrome.offscreen.closeDocument()`](https://developer.chrome.com/docs/extensions/reference/api/offscreen#method-closeDocument) to create and close an offscreen
document. `createDocument()` requires the document's `url`, a reason, and a justification:  

    chrome.offscreen.createDocument({
      url: 'off_screen.html',
      reasons: ['CLIPBOARD'],
      justification: 'reason for needing the document',
    });

### Reasons

For a list of valid reasons, see the [Reasons](https://developer.chrome.com/docs/extensions/reference/api/offscreen#type-Reason) section. Reasons are set during
document creation to determine the document's lifespan. The `AUDIO_PLAYBACK` reason sets the
document to close after 30 seconds without audio playing. All other reasons don't set lifetime limits.

## Examples

### Maintain the lifecycle of an offscreen document

The following example shows how to ensure that an offscreen document exists. The
`setupOffscreenDocument()` function calls [`runtime.getContexts()`](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-getContexts) to find
an existing offscreen document, or creates the document if it doesn't already exist.  

    let creating; // A global promise to avoid concurrency issues
    async function setupOffscreenDocument(path) {
      // Check all windows controlled by the service worker to see if one
      // of them is the offscreen document with the given path
      const offscreenUrl = chrome.runtime.getURL(path);
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
      });

      if (existingContexts.length > 0) {
        return;
      }

      // create offscreen document
      if (creating) {
        await creating;
      } else {
        creating = chrome.offscreen.createDocument({
          url: path,
          reasons: ['CLIPBOARD'],
          justification: 'reason for needing the document',
        });
        await creating;
        creating = null;
      }
    }

Before sending a message to an offscreen document, call `setupOffscreenDocument()` to make sure
the document exists, as demonstrated in the following example.  

    chrome.action.onClicked.addListener(async () => {
      await setupOffscreenDocument('off_screen.html');

      // Send message to offscreen document
      chrome.runtime.sendMessage({
        type: '...',
        target: 'offscreen',
        data: '...'
      });
    });

For complete examples, see the [offscreen-clipboard](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/cookbook.offscreen-clipboard-write) and
[offscreen-dom](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/cookbook.offscreen-dom) demos on GitHub.

### Before Chrome 116: check if an offscreen document is open

[`runtime.getContexts()`](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-getContexts) was added in Chrome 116. In earlier versions of
Chrome, use [`clients.matchAll()`](https://developer.mozilla.org/docs/Web/API/Clients/matchAll)
to check for an existing offscreen document:  

    async function hasOffscreenDocument() {
      if ('getContexts' in chrome.runtime) {
        const contexts = await chrome.runtime.getContexts({
          contextTypes: ['OFFSCREEN_DOCUMENT'],
          documentUrls: [OFFSCREEN_DOCUMENT_PATH]
        });
        return Boolean(contexts.length);
      } else {
        const matchedClients = await clients.matchAll();
        return matchedClients.some(client => {
          return client.url.includes(chrome.runtime.id);
        });
      }
    }

<br />

## Types

### CreateParameters

#### Properties

  - justification  
  string

  A developer-provided string that explains, in more detail, the need for the background context. The user agent _may_ use this in display to the user.
  - reasons  
  [Reason](https://developer.chrome.com/docs/extensions/reference/api/offscreen#type-Reason)\[\]

  The reason(s) the extension is creating the offscreen document.
  - url  
  string

The (relative) URL to load in the document.  

### Reason

#### Enum

"TESTING"   
A reason used for testing purposes only.
"AUDIO_PLAYBACK"   
Specifies that the offscreen document is responsible for playing audio.
"IFRAME_SCRIPTING"   
Specifies that the offscreen document needs to embed and script an iframe in order to modify the iframe's content.
"DOM_SCRAPING"   
Specifies that the offscreen document needs to embed an iframe and scrape its DOM to extract information.
"BLOBS"   
Specifies that the offscreen document needs to interact with Blob objects (including `URL.createObjectURL()`).
"DOM_PARSER"   
Specifies that the offscreen document needs to use the [DOMParser API](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser).
"USER_MEDIA"   
Specifies that the offscreen document needs to interact with media streams from user media (e.g. `getUserMedia()`).
"DISPLAY_MEDIA"   
Specifies that the offscreen document needs to interact with media streams from display media (e.g. `getDisplayMedia()`).
"WEB_RTC"   
Specifies that the offscreen document needs to use [WebRTC APIs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API).
"CLIPBOARD"   
Specifies that the offscreen document needs to interact with the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API).
"LOCAL_STORAGE"   
Specifies that the offscreen document needs access to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
"WORKERS"   
Specifies that the offscreen document needs to spawn workers.
"BATTERY_STATUS"   
Specifies that the offscreen document needs to use [navigator.getBattery](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).
"MATCH_MEDIA"   
Specifies that the offscreen document needs to use [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia).
"GEOLOCATION"   
Specifies that the offscreen document needs to use [navigator.geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/geolocation).

<br />

## Methods

### closeDocument()

```typescript
chrome.offscreen.closeDocument(): Promise<void>
```

Closes the currently-open offscreen document for the extension.  

#### Returns

- Promise\<void\>  

### createDocument()

```typescript
chrome.offscreen.createDocument(
  parameters: CreateParameters,
): Promise<void>
```

Creates a new offscreen document for the extension.  

#### Parameters

  - parameters  
  [CreateParameters](https://developer.chrome.com/docs/extensions/reference/api/offscreen#type-CreateParameters)

The parameters describing the offscreen document to create.  

#### Returns

- Promise\<void\>

<br />

---

## 37. omnibox

*File: pages/omnibox.md*

# chrome.pageCapture

<br />

<br />

## Description

Use the `chrome.pageCapture` API to save a tab as MHTML.

<br />

MHTML is a [standard format](https://tools.ietf.org/html/rfc2557) supported by most browsers. It encapsulates in a single file a page
and all its resources (CSS files, images..).

Note that for security reasons a MHTML file can only be loaded from the file system and that it can
only be loaded in the main frame.

<br />

## Permissions

`pageCapture`  

<br />

You must declare the "pageCapture" permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use the pageCapture
API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "pageCapture"
      ],
      ...
    }

<br />

<br />

<br />

## Methods

### saveAsMHTML()

```typescript
chrome.pageCapture.saveAsMHTML(
  details: object,
): Promise<Blob | undefined>
```

Saves the content of the tab with given id as MHTML.  

#### Parameters

  - details  
  object  
    - tabId  
    number

The id of the tab to save as MHTML.  

#### Returns

  - Promise\<Blob \| undefined\>  
  Chrome 116+

<br />

---

## 38. pageCapture

*File: pages/pageCapture.md*

# chrome.pageCapture

<br />

<br />

## Description

Use the `chrome.pageCapture` API to save a tab as MHTML.

<br />

MHTML is a [standard format](https://tools.ietf.org/html/rfc2557) supported by most browsers. It encapsulates in a single file a page
and all its resources (CSS files, images..).

Note that for security reasons a MHTML file can only be loaded from the file system and that it can
only be loaded in the main frame.

<br />

## Permissions

`pageCapture`  

<br />

You must declare the "pageCapture" permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use the pageCapture
API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "pageCapture"
      ],
      ...
    }

<br />

<br />

<br />

## Methods

### saveAsMHTML()

```typescript
chrome.pageCapture.saveAsMHTML(
  details: object,
): Promise<Blob | undefined>
```

Saves the content of the tab with given id as MHTML.  

#### Parameters

  - details  
  object  
    - tabId  
    number

The id of the tab to save as MHTML.  

#### Returns

  - Promise\<Blob \| undefined\>  
  Chrome 116+

<br />

---

## 39. permissions

*File: pages/permissions.md*

# chrome.permissions

<br />

<br />

## Description

Use the `chrome.permissions` API to request [declared optional permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.

<br />

<br />

<br />

## Concepts and usage

Permission warnings exist to describe the capabilities granted by an API, but some of these warnings may not be obvious. The Permissions API allows developers to explain permission warnings and introduce new features gradually which gives users a risk-free introduction to the extension. This way, users can specify how much access they are willing to grant and which features they want to enable.

For example, the [optional permissions extension's](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/sample.optional_permissions) core functionality is overriding the new tab page. One feature is displaying the user's goal of the day. This feature only requires the [storage](https://developer.chrome.com/docs/extensions/reference/api/storage) permission, which does not include a warning. The extension has an additional feature, that users can enable by clicking the following button:
![An extension button that enables additional features.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/extension-button-enables-c53fe17733b8f.png) An extension button that enables additional features.

Displaying the user's top sites requires the [topSites](https://developer.chrome.com/docs/extensions/reference/api/topSites) permission, which has the following warning.
![Axtension warning for topSites API.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/extension-warning-topsit-8927d6b7cb863.png) An extension warning for `topSites` API

<br />

### Implement optional permissions

#### Step 1: Decide which permissions are required and which are optional

An extension can declare both required and optional permissions. In general, you should:

- Use required permissions when they are needed for your extension's basic functionality.
- Use optional permissions when they are needed for optional features in your extension.

Advantages of *required* permissions:

- **Fewer prompts:** An extension can prompt the user once to accept all permissions.
- **Simpler development:** Required permissions are guaranteed to be present.

Advantages of *optional* permissions:

- **Better security:** Extensions run with fewer permissions since users only enable permissions that are needed.
- **Better information for users:** An extension can explain why it needs a particular permission when the user enables the relevant feature.
- **Easier upgrades:** When you upgrade your extension, Chrome won't disable it for your users if the upgrade adds optional rather than required permissions.

#### Step 2: Declare optional permissions in the manifest

Declare optional permissions in your [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) with the `optional_permissions` key,
using the same format as the [permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) field:  

    {
      "name": "My extension",
      ...
      "optional_permissions": ["tabs"],
      "optional_host_permissions": ["https://www.google.com/"],
      ...
    }

If you want to request hosts that you only discover at runtime, include `"https://*/*"` in your extension's `optional_host_permissions` field. This lets you specify any origin in [`"Permissions.origins"`](https://developer.chrome.com/docs/extensions/reference/api/permissions#property-Permissions-origins) as long as it has a matching
scheme.

**Permissions that can *not* be specified as optional**

Most Chrome extension permissions can be specified as optional, with the following exceptions.

|        Permission         |                                                                                                          Description                                                                                                           |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `"debugger"`              | The [chrome.debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger) API serves as an alternate transport for Chrome's [remote debugging protocol](https://chromedevtools.github.io/devtools-protocol/). |
| `"declarativeNetRequest"` | Grants the extension access to the [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest) API.                                                                       |
| `"devtools"`              | Allows extension to expand [Chrome DevTools](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) functionality.                                                                                      |
| `"geolocation"`           | Allows the extension to use the HTML5 [geolocation](https://w3c.github.io/geolocation-api/) API.                                                                                                                               |
| `"mdns"`                  | Grants the extension access to the [chrome.mdns](https://developer.chrome.com/docs/apps/reference/mdns) API.                                                                                                                   |
| `"proxy"`                 | Grants the extension access to the [chrome.proxy](https://developer.chrome.com/docs/extensions/reference/api/proxy) API to manage Chrome's proxy settings.                                                                     |
| `"tts"`                   | The [chrome.tts](https://developer.chrome.com/docs/extensions/reference/api/tts) API plays synthesized text-to-speech (TTS).                                                                                                   |
| `"ttsEngine"`             | The [chrome.ttsEngine](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine) API implements a text-to-speech (TTS) engine using an extension.                                                                  |
| `"wallpaper"`             | **ChromeOS only** . Use the [chrome.wallpaper](https://developer.chrome.com/docs/extensions/reference/api/wallpaper) API change the ChromeOS wallpaper.                                                                        |

View [Declare Permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) for further information on available permissions and
their warnings.

#### Step 3: Request optional permissions

Request the permissions from within a user gesture using `permissions.request()`:  

    document.querySelector('#my-button').addEventListener('click', (event) => {
      // Permissions must be requested from inside a user gesture, like a button's
      // click handler.
      chrome.permissions.request({
        permissions: ['tabs'],
        origins: ['https://www.google.com/']
      }, (granted) => {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
          doSomething();
        } else {
          doSomethingElse();
        }
      });
    });

Chrome prompts the user if adding the permissions results in different [warning messages](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) than
the user has already seen and accepted. For example, the previous code might result in a prompt like
this:
![An example permission confirmation prompt.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/perms-optional.png) An example permission confirmation prompt.

#### Step 4: Check the extension's current permissions

To check whether your extension has a specific permission or set of permissions, use
`permission.contains()`:  

    chrome.permissions.contains({
      permissions: ['tabs'],
      origins: ['https://www.google.com/']
    }, (result) => {
      if (result) {
        // The extension has the permissions.
      } else {
        // The extension doesn't have the permissions.
      }
    });

#### Step 5: Remove the permissions

You should remove permissions when you no longer need them. After a permission has been removed,
calling `permissions.request()` usually adds the permission back without prompting the user.  

    chrome.permissions.remove({
      permissions: ['tabs'],
      origins: ['https://www.google.com/']
    }, (removed) => {
      if (removed) {
        // The permissions have been removed.
      } else {
        // The permissions have not been removed (e.g., you tried to remove
        // required permissions).
      }
    });

<br />

## Types

### Permissions

#### Properties

  - origins  
  string\[\] optional

  The list of host permissions, including those specified in the `optional_permissions` or `permissions` keys in the manifest, and those associated with [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
  - permissions  
  string\[\] optional

  List of named permissions (does not include hosts or origins).

## Methods

### addHostAccessRequest()

Chrome 133+ MV3+

```typescript
chrome.permissions.addHostAccessRequest(
  request: object,
): Promise<void>
```

Adds a host access request. Request will only be signaled to the user if extension can be granted access to the host in the request. Request will be reset on cross-origin navigation. When accepted, grants persistent access to the site's top origin  

#### Parameters

  - request  
  object  
    - documentId  
    string optional

    The id of a document where host access requests can be shown. Must be the top-level document within a tab. If provided, the request is shown on the tab of the specified document and is removed when the document navigates to a new origin. Adding a new request will override any existent request for `tabId`. This or `tabId` must be specified.
    - pattern  
    string optional

    The URL pattern where host access requests can be shown. If provided, host access requests will only be shown on URLs that match this pattern.
    - tabId  
    number optional

The id of the tab where host access requests can be shown. If provided, the request is shown on the specified tab and is removed when the tab navigates to a new origin. Adding a new request will override an existent request for `documentId`. This or `documentId` must be specified.  

#### Returns

- Promise\<void\>  

### contains()

```typescript
chrome.permissions.contains(
  permissions: Permissions,
): Promise<boolean>
```

Checks if the extension has the specified permissions.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
Chrome 96+  

### getAll()

```typescript
chrome.permissions.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions>
```

Gets the extension's current set of permissions.  

#### Returns

  - Promise\<[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)\>  
Chrome 96+  

### remove()

```typescript
chrome.permissions.remove(
  permissions: Permissions,
): Promise<boolean>
```

Removes access to the specified permissions. If there are any problems removing the permissions, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
Chrome 96+  

### removeHostAccessRequest()

Chrome 133+ MV3+

```typescript
chrome.permissions.removeHostAccessRequest(
  request: object,
): Promise<void>
```

Removes a host access request, if existent.  

#### Parameters

  - request  
  object  
    - documentId  
    string optional

    The id of a document where host access request will be removed. Must be the top-level document within a tab. This or `tabId` must be specified.
    - pattern  
    string optional

    The URL pattern where host access request will be removed. If provided, this must exactly match the pattern of an existing host access request.
    - tabId  
    number optional

The id of the tab where host access request will be removed. This or `documentId` must be specified.  

#### Returns

- Promise\<void\>  

### request()

```typescript
chrome.permissions.request(
  permissions: Permissions,
): Promise<boolean>
```

Requests access to the specified permissions, displaying a prompt to the user if necessary. These permissions must either be defined in the `optional_permissions` field of the manifest or be required permissions that were withheld by the user. Paths on origin patterns will be ignored. You can request subsets of optional origin permissions; for example, if you specify `*://*\/*` in the `optional_permissions` section of the manifest, you can request `http://example.com/`. If there are any problems requesting the permissions, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
  Chrome 96+

## Events

### onAdded

```typescript
chrome.permissions.onAdded.addListener(
  callback: function,
)
```

Fired when the extension acquires new permissions.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (permissions: Permissions) => void
  ```

  <br />

    - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

### onRemoved

```typescript
chrome.permissions.onRemoved.addListener(
  callback: function,
)
```

Fired when access to permissions has been removed from the extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (permissions: Permissions) => void
  ```

  <br />

    - permissions  
    [Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)

<br />

---

## 40. platformKeys

*File: pages/platformKeys.md*

# chrome.permissions

<br />

<br />

## Description

Use the `chrome.permissions` API to request [declared optional permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.

<br />

<br />

<br />

## Concepts and usage

Permission warnings exist to describe the capabilities granted by an API, but some of these warnings may not be obvious. The Permissions API allows developers to explain permission warnings and introduce new features gradually which gives users a risk-free introduction to the extension. This way, users can specify how much access they are willing to grant and which features they want to enable.

For example, the [optional permissions extension's](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/sample.optional_permissions) core functionality is overriding the new tab page. One feature is displaying the user's goal of the day. This feature only requires the [storage](https://developer.chrome.com/docs/extensions/reference/api/storage) permission, which does not include a warning. The extension has an additional feature, that users can enable by clicking the following button:
![An extension button that enables additional features.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/extension-button-enables-c53fe17733b8f.png) An extension button that enables additional features.

Displaying the user's top sites requires the [topSites](https://developer.chrome.com/docs/extensions/reference/api/topSites) permission, which has the following warning.
![Axtension warning for topSites API.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/extension-warning-topsit-8927d6b7cb863.png) An extension warning for `topSites` API

<br />

### Implement optional permissions

#### Step 1: Decide which permissions are required and which are optional

An extension can declare both required and optional permissions. In general, you should:

- Use required permissions when they are needed for your extension's basic functionality.
- Use optional permissions when they are needed for optional features in your extension.

Advantages of *required* permissions:

- **Fewer prompts:** An extension can prompt the user once to accept all permissions.
- **Simpler development:** Required permissions are guaranteed to be present.

Advantages of *optional* permissions:

- **Better security:** Extensions run with fewer permissions since users only enable permissions that are needed.
- **Better information for users:** An extension can explain why it needs a particular permission when the user enables the relevant feature.
- **Easier upgrades:** When you upgrade your extension, Chrome won't disable it for your users if the upgrade adds optional rather than required permissions.

#### Step 2: Declare optional permissions in the manifest

Declare optional permissions in your [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) with the `optional_permissions` key,
using the same format as the [permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) field:  

    {
      "name": "My extension",
      ...
      "optional_permissions": ["tabs"],
      "optional_host_permissions": ["https://www.google.com/"],
      ...
    }

If you want to request hosts that you only discover at runtime, include `"https://*/*"` in your extension's `optional_host_permissions` field. This lets you specify any origin in [`"Permissions.origins"`](https://developer.chrome.com/docs/extensions/reference/api/permissions#property-Permissions-origins) as long as it has a matching
scheme.

**Permissions that can *not* be specified as optional**

Most Chrome extension permissions can be specified as optional, with the following exceptions.

|        Permission         |                                                                                                          Description                                                                                                           |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `"debugger"`              | The [chrome.debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger) API serves as an alternate transport for Chrome's [remote debugging protocol](https://chromedevtools.github.io/devtools-protocol/). |
| `"declarativeNetRequest"` | Grants the extension access to the [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest) API.                                                                       |
| `"devtools"`              | Allows extension to expand [Chrome DevTools](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) functionality.                                                                                      |
| `"geolocation"`           | Allows the extension to use the HTML5 [geolocation](https://w3c.github.io/geolocation-api/) API.                                                                                                                               |
| `"mdns"`                  | Grants the extension access to the [chrome.mdns](https://developer.chrome.com/docs/apps/reference/mdns) API.                                                                                                                   |
| `"proxy"`                 | Grants the extension access to the [chrome.proxy](https://developer.chrome.com/docs/extensions/reference/api/proxy) API to manage Chrome's proxy settings.                                                                     |
| `"tts"`                   | The [chrome.tts](https://developer.chrome.com/docs/extensions/reference/api/tts) API plays synthesized text-to-speech (TTS).                                                                                                   |
| `"ttsEngine"`             | The [chrome.ttsEngine](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine) API implements a text-to-speech (TTS) engine using an extension.                                                                  |
| `"wallpaper"`             | **ChromeOS only** . Use the [chrome.wallpaper](https://developer.chrome.com/docs/extensions/reference/api/wallpaper) API change the ChromeOS wallpaper.                                                                        |

View [Declare Permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) for further information on available permissions and
their warnings.

#### Step 3: Request optional permissions

Request the permissions from within a user gesture using `permissions.request()`:  

    document.querySelector('#my-button').addEventListener('click', (event) => {
      // Permissions must be requested from inside a user gesture, like a button's
      // click handler.
      chrome.permissions.request({
        permissions: ['tabs'],
        origins: ['https://www.google.com/']
      }, (granted) => {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
          doSomething();
        } else {
          doSomethingElse();
        }
      });
    });

Chrome prompts the user if adding the permissions results in different [warning messages](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) than
the user has already seen and accepted. For example, the previous code might result in a prompt like
this:
![An example permission confirmation prompt.](https://developer.chrome.com/static/docs/extensions/reference/api/permissions/images/perms-optional.png) An example permission confirmation prompt.

#### Step 4: Check the extension's current permissions

To check whether your extension has a specific permission or set of permissions, use
`permission.contains()`:  

    chrome.permissions.contains({
      permissions: ['tabs'],
      origins: ['https://www.google.com/']
    }, (result) => {
      if (result) {
        // The extension has the permissions.
      } else {
        // The extension doesn't have the permissions.
      }
    });

#### Step 5: Remove the permissions

You should remove permissions when you no longer need them. After a permission has been removed,
calling `permissions.request()` usually adds the permission back without prompting the user.  

    chrome.permissions.remove({
      permissions: ['tabs'],
      origins: ['https://www.google.com/']
    }, (removed) => {
      if (removed) {
        // The permissions have been removed.
      } else {
        // The permissions have not been removed (e.g., you tried to remove
        // required permissions).
      }
    });

<br />

## Types

### Permissions

#### Properties

  - origins  
  string\[\] optional

  The list of host permissions, including those specified in the `optional_permissions` or `permissions` keys in the manifest, and those associated with [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
  - permissions  
  string\[\] optional

  List of named permissions (does not include hosts or origins).

## Methods

### addHostAccessRequest()

Chrome 133+ MV3+

```typescript
chrome.permissions.addHostAccessRequest(
  request: object,
): Promise<void>
```

Adds a host access request. Request will only be signaled to the user if extension can be granted access to the host in the request. Request will be reset on cross-origin navigation. When accepted, grants persistent access to the site's top origin  

#### Parameters

  - request  
  object  
    - documentId  
    string optional

    The id of a document where host access requests can be shown. Must be the top-level document within a tab. If provided, the request is shown on the tab of the specified document and is removed when the document navigates to a new origin. Adding a new request will override any existent request for `tabId`. This or `tabId` must be specified.
    - pattern  
    string optional

    The URL pattern where host access requests can be shown. If provided, host access requests will only be shown on URLs that match this pattern.
    - tabId  
    number optional

The id of the tab where host access requests can be shown. If provided, the request is shown on the specified tab and is removed when the tab navigates to a new origin. Adding a new request will override an existent request for `documentId`. This or `documentId` must be specified.  

#### Returns

- Promise\<void\>  

### contains()

```typescript
chrome.permissions.contains(
  permissions: Permissions,
): Promise<boolean>
```

Checks if the extension has the specified permissions.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
Chrome 96+  

### getAll()

```typescript
chrome.permissions.getAll(): Promise<https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions>
```

Gets the extension's current set of permissions.  

#### Returns

  - Promise\<[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)\>  
Chrome 96+  

### remove()

```typescript
chrome.permissions.remove(
  permissions: Permissions,
): Promise<boolean>
```

Removes access to the specified permissions. If there are any problems removing the permissions, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
Chrome 96+  

### removeHostAccessRequest()

Chrome 133+ MV3+

```typescript
chrome.permissions.removeHostAccessRequest(
  request: object,
): Promise<void>
```

Removes a host access request, if existent.  

#### Parameters

  - request  
  object  
    - documentId  
    string optional

    The id of a document where host access request will be removed. Must be the top-level document within a tab. This or `tabId` must be specified.
    - pattern  
    string optional

    The URL pattern where host access request will be removed. If provided, this must exactly match the pattern of an existing host access request.
    - tabId  
    number optional

The id of the tab where host access request will be removed. This or `documentId` must be specified.  

#### Returns

- Promise\<void\>  

### request()

```typescript
chrome.permissions.request(
  permissions: Permissions,
): Promise<boolean>
```

Requests access to the specified permissions, displaying a prompt to the user if necessary. These permissions must either be defined in the `optional_permissions` field of the manifest or be required permissions that were withheld by the user. Paths on origin patterns will be ignored. You can request subsets of optional origin permissions; for example, if you specify `*://*\/*` in the `optional_permissions` section of the manifest, you can request `http://example.com/`. If there are any problems requesting the permissions, [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set.  

#### Parameters

  - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

#### Returns

  - Promise\<boolean\>  
  Chrome 96+

## Events

### onAdded

```typescript
chrome.permissions.onAdded.addListener(
  callback: function,
)
```

Fired when the extension acquires new permissions.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (permissions: Permissions) => void
  ```

  <br />

    - permissions  
[Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)  

### onRemoved

```typescript
chrome.permissions.onRemoved.addListener(
  callback: function,
)
```

Fired when access to permissions has been removed from the extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (permissions: Permissions) => void
  ```

  <br />

    - permissions  
    [Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions#type-Permissions)

<br />

---

## 41. power

*File: pages/power.md*

# chrome.power

<br />

<br />

## Description

Use the `chrome.power` API to override the system's power management features.

<br />

<br />

## Permissions

`power`  

<br />

<br />

<br />

## Concepts and usage

By default, operating systems dim the screen when users are inactive and eventually suspend the
system. With the power API, an app or extension can keep the system awake.

Using this API, you can specify the [Level](https://developer.chrome.com/docs/extensions/reference/api/power#type-Level) to which power management is disabled. The `"system"`
level keeps the system active, but allows the screen to be dimmed or turned off. For example, a
communication app can continue to receive messages while the screen is off. The `"display"` level
keeps the screen and system active. E-book and presentation apps, for example, can keep the screen
and system active while users read.

When a user has more than one app or extension active, each with its own power level, the
highest-precedence level takes effect; `"display"` always takes precedence over `"system"`. For
example, if app A asks for `"system"` power management, and app B asks for `"display"`, `"display"`
is used until app B is unloaded or releases its request. If app A is still active, `"system"` is
then used.

<br />

## Types

### Level

#### Enum

"system"   
Prevents the system from sleeping in response to user inactivity.
"display"   
Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.

<br />

## Methods

### releaseKeepAwake()

```typescript
chrome.power.releaseKeepAwake(): void
```

Releases a request previously made via requestKeepAwake().  

### reportActivity()

Chrome 113+ ChromeOS only

```typescript
chrome.power.reportActivity(): Promise<void>
```

Reports a user activity in order to awake the screen from a dimmed or turned off state or from a screensaver. Exits the screensaver if it is currently active.  

#### Returns

- Promise\<void\>  

### requestKeepAwake()

```typescript
chrome.power.requestKeepAwake(
  level: Level,
): void
```

Requests that power management be temporarily disabled. `level` describes the degree to which power management should be disabled. If a request previously made by the same app is still active, it will be replaced by the new request.  

#### Parameters

  - level  
  [Level](https://developer.chrome.com/docs/extensions/reference/api/power#type-Level)

<br />

---

## 42. printerProvider

*File: pages/printerProvider.md*

# chrome.printerProvider

<br />

<br />

## Description

The `chrome.printerProvider` API exposes events used by print manager to query printers controlled by extensions, to query their capabilities and to submit print jobs to these printers.

<br />

<br />

## Permissions

`printerProvider`  

<br />

<br />

## Availability

Chrome 44+

<br />

<br />

<br />

## Types

### PrinterInfo

#### Properties

  - description  
  string optional

  Printer's human readable description.
  - id  
  string

  Unique printer ID.
  - name  
  string

Printer's human readable name.  

### PrintError

Error codes returned in response to [`onPrintRequested`](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#event-onPrintRequested) event.  

#### Enum

"OK"   
Specifies that the operation was completed successfully.
"FAILED"   
Specifies that a general failure occured.
"INVALID_TICKET"   
Specifies that the print ticket is invalid. For example, the ticket is inconsistent with some capabilities, or the extension is not able to handle all settings from the ticket.
"INVALID_DATA"   
Specifies that the document is invalid. For example, data may be corrupted or the format is incompatible with the extension.

<br />

### PrintJob

#### Properties

  - contentType  
  string

  The document content type. Supported formats are `"application/pdf"` and `"image/pwg-raster"`.
  - document  
  Blob

  Blob containing the document data to print. Format must match `contentType`.
  - printerId  
  string

  ID of the printer which should handle the job.
  - ticket  
  object

  Print ticket in [CJT format](https://developers.google.com/cloud-print/docs/cdd#cjt).

  The CJT reference is marked as deprecated. It is deprecated for Google Cloud Print only. is not deprecated for ChromeOS printing.
  - title  
  string

  The print job title.

## Events

### onGetCapabilityRequested

```typescript
chrome.printerProvider.onGetCapabilityRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printer capabilities.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (printerId: string, resultCallback: function) => void
  ```

  <br />

    - printerId  
    string
    - resultCallback  
    function


    The `resultCallback` parameter looks like:  

    ```typescript
    (capabilities: object) => void
    ```

    <br />

      - capabilities  
      object

Device capabilities in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd).  

### onGetPrintersRequested

```typescript
chrome.printerProvider.onGetPrintersRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printers provided by extensions.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (resultCallback: function) => void
  ```

  <br />

    - resultCallback  
    function


    The `resultCallback` parameter looks like:  

    ```typescript
    (printerInfo: PrinterInfo[]) => void
    ```

    <br />

      - printerInfo  
[PrinterInfo](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#type-PrinterInfo)\[\]  

### onGetUsbPrinterInfoRequested

Chrome 45+

```typescript
chrome.printerProvider.onGetUsbPrinterInfoRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests information about a USB device that may be a printer.

*Note:* An application should not rely on this event being fired more than once per device. If a connected device is supported it should be returned in the [`onGetPrintersRequested`](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#event-onGetPrintersRequested) event.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (device: usb.Device, resultCallback: function) => void
  ```

  <br />

    - device  
    [usb.Device](https://developer.chrome.com/docs/extensions/reference/usb/#type-Device)
    - resultCallback  
    function


    The `resultCallback` parameter looks like:  

    ```typescript
    (printerInfo?: PrinterInfo) => void
    ```

    <br />

      - printerInfo  
[PrinterInfo](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#type-PrinterInfo) optional  

### onPrintRequested

```typescript
chrome.printerProvider.onPrintRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printing.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (printJob: PrintJob, resultCallback: function) => void
  ```

  <br />

    - printJob  
    [PrintJob](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#type-PrintJob)
    - resultCallback  
    function


    The `resultCallback` parameter looks like:  

    ```typescript
    (result: PrintError) => void
    ```

    <br />

      - result  
      [PrintError](https://developer.chrome.com/docs/extensions/reference/api/printerProvider#type-PrintError)

<br />

---

## 43. printing

*File: pages/printing.md*

# chrome.printing

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.printing` API to send print jobs to printers installed on Chromebook.

<br />

<br />

## Permissions

`printing`  

<br />

<br />

## Availability

Chrome 81+ ChromeOS only

<br />

<br />

All `chrome.printing` methods and events require you to declare the `"printing"` permission in the [extension manifest](https://developer.chrome.com/docs/extensions/mv3/manifest). For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "printing"
      ],
      ...
    }

## Examples

The examples below demonstrate using each of the methods in the printing namespace. This code is copied from or based on the [api-samples/printing](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/printing) in the extensions-samples Github repo.

### cancelJob()

This example uses the `onJobStatusChanged` handler to hide a 'cancel' button when the `jobStatus` is neither `PENDING` or `IN_PROGRESS`. Note that on some networks or when a Chromebook is connected directly to the printer, these states may pass too quickly for the cancel button to be visible long enough to be called. This is greatly simplified printing example.  

    chrome.printing.onJobStatusChanged.addListener((jobId, status) => {
      const cancelButton = document.getElementById("cancelButton");
      cancelButton.addEventListener('click', () => {
        chrome.printing.cancelJob(jobId).then((response) => {
          if (response !== undefined) {
            console.log(response.status);
          }
          if (chrome.runtime.lastError !== undefined) {
            console.log(chrome.runtime.lastError.message);
          }
        });
      });
      if (status !== "PENDING" && status !== "IN_PROGRESS") {
        cancelButton.style.visibility = 'hidden';
      } else {
        cancelButton.style.visibility = 'visible';
      }
    }

### getPrinters() and getPrinterInfo()

A single example is used for these functions because getting printer information requires a printer ID, which is retrieved by calling `getPrinters()`. This example logs the name and description of the default printer to the console. This is a simplified version of the printing example.  

    ​​const printers = await chrome.printing.getPrinters();
    const defaultPrinter = printers.find((printer) => {
      const printerInfo = await chrome.printing.getPrinterInfo(printer.id);
      return printerInfo.isDefault;
    }
    console.log(`Default printer: ${defaultPrinter.name}.\n\t${defaultPrinter.description}`);

### submitJob()

The `submitJob()` method requires three things.

- A `ticket` structure specifying which capabilities of the printer are to be used. If the user needs to select from available capabilities, you can retrieve them for a specific printer using `getPrinterInfo()`.
- A `SubmitJobRequest` structure, which specifies the printer to use, and the file or data to print. This structure contains a reference to the `ticket` structure.
- A blob of the file or data to print.

Calling `submitJob()` triggers a dialog box asking the user to confirm printing. Use the [`PrintingAPIExtensionsAllowlist`](https://chromeenterprise.google/policies/#PrintingAPIExtensionsAllowlist%22) to bypass confirmation.

This is a simplified version of the printing example. Notice that the `ticket` is attached to the `SubmitJobRequest` structure (line 8) and that the data to print is converted to a blob (line 10). Getting the ID of the printer (line 1) is more complicated [in the sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/printing) than is shown here.  

    const defaultPrinter = getDefaultPrinter();
    const ticket = getPrinterTicket(defaultPrinter);
    const arrayBuffer = getPrintData();
    const submitJobRequest = {
      job: {
        printerId: defaultPrinter,
        title: 'test job',
        ticket: ticket,
        contentType: 'application/pdf',
        document: new Blob([new Uint8Array(arrayBuffer)], {
          type: 'application/pdf'
        });
      }
    };

    chrome.printing.submitJob(submitJobRequest, (response) => {
      if (response !== undefined) {
        console.log(response.status);
      }
      if (chrome.runtime.lastError !== undefined) {
        console.log(chrome.runtime.lastError.message);
      }
    });

### Roll printing

This example shows how to build a printer ticket for continuous (or roll) printing, which is often used with receipt printing. The `submitJobRequest` object for roll printing is the same as that shown for the [`submitJob()`](https://developer.chrome.com/docs/extensions/reference/api/printing#submitjob) example.

If you need to change the default value for paper cutting, use the `vendor_ticket_item` key. (The default varies from printer to printer.) To change the value, provide an array with one member: an object whose `id` is `'finishings'`. The value can either be `'trim'` for printers that cut the roll at the end of printing or `'none'` for printers that require the print job to be torn off.  

    const ticket = {
      version: '1.0',
      print: {
        vendor_ticket_item: [{id: 'finishings', value: 'trim'}],
        color: {type: 'STANDARD_MONOCHROME'},
        duplex: {type: 'NO_DUPLEX'},
        page_orientation: {type: 'PORTRAIT'},
        copies: {copies: 1},
        dpi: {horizontal_dpi: 300, vertical_dpi: 300},
        media_size: {
          width_microns: 72320,
          height_microns: 100000
        },
        collate: {collate: false}
      }
    };

Some printers do not support the `"finishings"` option. To determine if your printer does, call [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) and look for a `"display_name"` of `"finishings/11"`.  

    "vendor_capability": [
      {
        "display_name": "finishings/11",
        "id": "finishings/11",
        "type": "TYPED_VALUE",
        "typed_value_cap": {
          "value_type": "BOOLEAN"
        }
      },
      ...
    ]

| **Note:** starting with Chrome 124, the `vendor_ticket_item` allows all items from the printer's `vendor_capabilities`. For example, any value return by [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) is valid. Before, only the `finishings` key was supported.

The values in a ticket's `media_size` key are specific to each printer. To select an appropriate size call [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo). The returned [`GetPrinterResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse) contains an array of supported media sizes at `"media_size"."option"`. Choose an option whose `"is_continuous_feed"` value is true. Use its height and width values for the ticket.  

    "media_size": {
      "option": [
      {
        "custom_display_name": "",
        "is_continuous_feed": true,
        "max_height_microns": 2000000,
        "min_height_microns": 25400,
        "width_microns": 50800
      },
      ...
      ]
    }

<br />

## Types

### GetPrinterInfoResponse

#### Properties

  - capabilities  
  object optional

  Printer capabilities in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd). The property may be missing.
  - status  
  [PrinterStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-PrinterStatus)

The status of the printer.  

### JobStatus

Status of the print job.  

#### Enum

"PENDING"   
Print job is received on Chrome side but was not processed yet.
"IN_PROGRESS"   
Print job is sent for printing.
"FAILED"   
Print job was interrupted due to some error.
"CANCELED"   
Print job was canceled by the user or via API.
"PRINTED"   
Print job was printed without any errors.

<br />

### Printer

#### Properties

  - description  
  string

  The human-readable description of the printer.
  - id  
  string

  The printer's identifier; guaranteed to be unique among printers on the device.
  - isDefault  
  boolean

  The flag which shows whether the printer fits [DefaultPrinterSelection](https://chromium.org/administrators/policy-list-3#DefaultPrinterSelection) rules. Note that several printers could be flagged.
  - name  
  string

  The name of the printer.
  - recentlyUsedRank  
  number optional

  The value showing how recent the printer was used for printing from Chrome. The lower the value is the more recent the printer was used. The minimum value is 0. Missing value indicates that the printer wasn't used recently. This value is guaranteed to be unique amongst printers.
  - source  
  [PrinterSource](https://developer.chrome.com/docs/extensions/reference/api/printing#type-PrinterSource)

  The source of the printer (user or policy configured).
  - uri  
  string

The printer URI. This can be used by extensions to choose the printer for the user.  

### PrinterSource

The source of the printer.  

#### Enum

"USER"   
Printer was added by user.
"POLICY"   
Printer was added via policy.

<br />

### PrinterStatus

The status of the printer.  

#### Enum

"DOOR_OPEN"   
The door of the printer is open. Printer still accepts print jobs.
"TRAY_MISSING"   
The tray of the printer is missing. Printer still accepts print jobs.
"OUT_OF_INK"   
The printer is out of ink. Printer still accepts print jobs.
"OUT_OF_PAPER"   
The printer is out of paper. Printer still accepts print jobs.
"OUTPUT_FULL"   
The output area of the printer (e.g. tray) is full. Printer still accepts print jobs.
"PAPER_JAM"   
The printer has a paper jam. Printer still accepts print jobs.
"GENERIC_ISSUE"   
Some generic issue. Printer still accepts print jobs.
"STOPPED"   
The printer is stopped and doesn't print but still accepts print jobs.
"UNREACHABLE"   
The printer is unreachable and doesn't accept print jobs.
"EXPIRED_CERTIFICATE"   
The SSL certificate is expired. Printer accepts jobs but they fail.
"AVAILABLE"   
The printer is available.

<br />

### SubmitJobRequest

#### Properties

  - job  
  [PrintJob](https://developer.chrome.com/docs/extensions/reference/printerProvider/#type-PrintJob)

The print job to be submitted. Supported content types are "application/pdf" and "image/png". The [Cloud Job Ticket](https://developers.google.com/cloud-print/docs/cdd#cjt) shouldn't include `FitToPageTicketItem`, `PageRangeTicketItem` and `ReverseOrderTicketItem` fields since they are irrelevant for native printing. `VendorTicketItem` is optional. All other fields must be present.  

### SubmitJobResponse

#### Properties

  - jobId  
  string optional

  The id of created print job. This is a unique identifier among all print jobs on the device. If status is not OK, jobId will be null.
  - status  
  [SubmitJobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobStatus)

The status of the request.  

### SubmitJobStatus

The status of [`submitJob`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-submitJob) request.  

#### Enum

"OK"   
Sent print job request is accepted.
"USER_REJECTED"   
Sent print job request is rejected by the user.

<br />

## Properties

### MAX_GET_PRINTER_INFO_CALLS_PER_MINUTE

The maximum number of times that [`getPrinterInfo`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) can be called per minute.  

#### Value

20   

### MAX_SUBMIT_JOB_CALLS_PER_MINUTE

The maximum number of times that [`submitJob`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-submitJob) can be called per minute.  

#### Value

40   

## Methods

### cancelJob()

```typescript
chrome.printing.cancelJob(
  jobId: string,
): Promise<void>
```

Cancels previously submitted job.  

#### Parameters

  - jobId  
  string

The id of the print job to cancel. This should be the same id received in a [`SubmitJobResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse).  

#### Returns

  - Promise\<void\>  
Chrome 100+  

### getJobStatus()

Chrome 135+

```typescript
chrome.printing.getJobStatus(
  jobId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus>
```

Returns the status of the print job. This call will fail with a runtime error if the print job with the given `jobId` doesn't exist. `jobId`: The id of the print job to return the status of. This should be the same id received in a [`SubmitJobResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse).  

#### Parameters

  - jobId  
string  

#### Returns

- Promise\<[JobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus)\>  

### getPrinterInfo()

```typescript
chrome.printing.getPrinterInfo(
  printerId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse>
```

Returns the status and capabilities of the printer in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd). This call will fail with a runtime error if no printers with given id are installed.  

#### Parameters

  - printerId  
string  

#### Returns

  - Promise\<[GetPrinterInfoResponse](https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse)\>  
Chrome 100+  

### getPrinters()

```typescript
chrome.printing.getPrinters(): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-Printer[]>
```

Returns the list of available printers on the device. This includes manually added, enterprise and discovered printers.  

#### Returns

  - Promise\<[Printer](https://developer.chrome.com/docs/extensions/reference/api/printing#type-Printer)\[\]\>  
Chrome 100+  

### submitJob()

```typescript
chrome.printing.submitJob(
  request: SubmitJobRequest,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse>
```

Submits the job for printing. If the extension is not listed in the [`PrintingAPIExtensionsAllowlist`](https://chromeenterprise.google/policies/#PrintingAPIExtensionsAllowlist) policy, the user is prompted to accept the print job.
Before Chrome 120, this function did not return a promise.  

#### Parameters

  - request  
[SubmitJobRequest](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobRequest)  

#### Returns

  - Promise\<[SubmitJobResponse](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse)\>  
  Chrome 100+

## Events

### onJobStatusChanged

```typescript
chrome.printing.onJobStatusChanged.addListener(
  callback: function,
)
```

Event fired when the status of the job is changed. This is only fired for the jobs created by this extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (jobId: string, status: JobStatus) => void
  ```

  <br />

    - jobId  
    string
    - status  
    [JobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus)

<br />

---

## 44. printingMetrics

*File: pages/printingMetrics.md*

# chrome.printing

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.printing` API to send print jobs to printers installed on Chromebook.

<br />

<br />

## Permissions

`printing`  

<br />

<br />

## Availability

Chrome 81+ ChromeOS only

<br />

<br />

All `chrome.printing` methods and events require you to declare the `"printing"` permission in the [extension manifest](https://developer.chrome.com/docs/extensions/mv3/manifest). For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "printing"
      ],
      ...
    }

## Examples

The examples below demonstrate using each of the methods in the printing namespace. This code is copied from or based on the [api-samples/printing](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/printing) in the extensions-samples Github repo.

### cancelJob()

This example uses the `onJobStatusChanged` handler to hide a 'cancel' button when the `jobStatus` is neither `PENDING` or `IN_PROGRESS`. Note that on some networks or when a Chromebook is connected directly to the printer, these states may pass too quickly for the cancel button to be visible long enough to be called. This is greatly simplified printing example.  

    chrome.printing.onJobStatusChanged.addListener((jobId, status) => {
      const cancelButton = document.getElementById("cancelButton");
      cancelButton.addEventListener('click', () => {
        chrome.printing.cancelJob(jobId).then((response) => {
          if (response !== undefined) {
            console.log(response.status);
          }
          if (chrome.runtime.lastError !== undefined) {
            console.log(chrome.runtime.lastError.message);
          }
        });
      });
      if (status !== "PENDING" && status !== "IN_PROGRESS") {
        cancelButton.style.visibility = 'hidden';
      } else {
        cancelButton.style.visibility = 'visible';
      }
    }

### getPrinters() and getPrinterInfo()

A single example is used for these functions because getting printer information requires a printer ID, which is retrieved by calling `getPrinters()`. This example logs the name and description of the default printer to the console. This is a simplified version of the printing example.  

    ​​const printers = await chrome.printing.getPrinters();
    const defaultPrinter = printers.find((printer) => {
      const printerInfo = await chrome.printing.getPrinterInfo(printer.id);
      return printerInfo.isDefault;
    }
    console.log(`Default printer: ${defaultPrinter.name}.\n\t${defaultPrinter.description}`);

### submitJob()

The `submitJob()` method requires three things.

- A `ticket` structure specifying which capabilities of the printer are to be used. If the user needs to select from available capabilities, you can retrieve them for a specific printer using `getPrinterInfo()`.
- A `SubmitJobRequest` structure, which specifies the printer to use, and the file or data to print. This structure contains a reference to the `ticket` structure.
- A blob of the file or data to print.

Calling `submitJob()` triggers a dialog box asking the user to confirm printing. Use the [`PrintingAPIExtensionsAllowlist`](https://chromeenterprise.google/policies/#PrintingAPIExtensionsAllowlist%22) to bypass confirmation.

This is a simplified version of the printing example. Notice that the `ticket` is attached to the `SubmitJobRequest` structure (line 8) and that the data to print is converted to a blob (line 10). Getting the ID of the printer (line 1) is more complicated [in the sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/printing) than is shown here.  

    const defaultPrinter = getDefaultPrinter();
    const ticket = getPrinterTicket(defaultPrinter);
    const arrayBuffer = getPrintData();
    const submitJobRequest = {
      job: {
        printerId: defaultPrinter,
        title: 'test job',
        ticket: ticket,
        contentType: 'application/pdf',
        document: new Blob([new Uint8Array(arrayBuffer)], {
          type: 'application/pdf'
        });
      }
    };

    chrome.printing.submitJob(submitJobRequest, (response) => {
      if (response !== undefined) {
        console.log(response.status);
      }
      if (chrome.runtime.lastError !== undefined) {
        console.log(chrome.runtime.lastError.message);
      }
    });

### Roll printing

This example shows how to build a printer ticket for continuous (or roll) printing, which is often used with receipt printing. The `submitJobRequest` object for roll printing is the same as that shown for the [`submitJob()`](https://developer.chrome.com/docs/extensions/reference/api/printing#submitjob) example.

If you need to change the default value for paper cutting, use the `vendor_ticket_item` key. (The default varies from printer to printer.) To change the value, provide an array with one member: an object whose `id` is `'finishings'`. The value can either be `'trim'` for printers that cut the roll at the end of printing or `'none'` for printers that require the print job to be torn off.  

    const ticket = {
      version: '1.0',
      print: {
        vendor_ticket_item: [{id: 'finishings', value: 'trim'}],
        color: {type: 'STANDARD_MONOCHROME'},
        duplex: {type: 'NO_DUPLEX'},
        page_orientation: {type: 'PORTRAIT'},
        copies: {copies: 1},
        dpi: {horizontal_dpi: 300, vertical_dpi: 300},
        media_size: {
          width_microns: 72320,
          height_microns: 100000
        },
        collate: {collate: false}
      }
    };

Some printers do not support the `"finishings"` option. To determine if your printer does, call [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) and look for a `"display_name"` of `"finishings/11"`.  

    "vendor_capability": [
      {
        "display_name": "finishings/11",
        "id": "finishings/11",
        "type": "TYPED_VALUE",
        "typed_value_cap": {
          "value_type": "BOOLEAN"
        }
      },
      ...
    ]

| **Note:** starting with Chrome 124, the `vendor_ticket_item` allows all items from the printer's `vendor_capabilities`. For example, any value return by [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) is valid. Before, only the `finishings` key was supported.

The values in a ticket's `media_size` key are specific to each printer. To select an appropriate size call [`getPrinterInfo()`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo). The returned [`GetPrinterResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse) contains an array of supported media sizes at `"media_size"."option"`. Choose an option whose `"is_continuous_feed"` value is true. Use its height and width values for the ticket.  

    "media_size": {
      "option": [
      {
        "custom_display_name": "",
        "is_continuous_feed": true,
        "max_height_microns": 2000000,
        "min_height_microns": 25400,
        "width_microns": 50800
      },
      ...
      ]
    }

<br />

## Types

### GetPrinterInfoResponse

#### Properties

  - capabilities  
  object optional

  Printer capabilities in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd). The property may be missing.
  - status  
  [PrinterStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-PrinterStatus)

The status of the printer.  

### JobStatus

Status of the print job.  

#### Enum

"PENDING"   
Print job is received on Chrome side but was not processed yet.
"IN_PROGRESS"   
Print job is sent for printing.
"FAILED"   
Print job was interrupted due to some error.
"CANCELED"   
Print job was canceled by the user or via API.
"PRINTED"   
Print job was printed without any errors.

<br />

### Printer

#### Properties

  - description  
  string

  The human-readable description of the printer.
  - id  
  string

  The printer's identifier; guaranteed to be unique among printers on the device.
  - isDefault  
  boolean

  The flag which shows whether the printer fits [DefaultPrinterSelection](https://chromium.org/administrators/policy-list-3#DefaultPrinterSelection) rules. Note that several printers could be flagged.
  - name  
  string

  The name of the printer.
  - recentlyUsedRank  
  number optional

  The value showing how recent the printer was used for printing from Chrome. The lower the value is the more recent the printer was used. The minimum value is 0. Missing value indicates that the printer wasn't used recently. This value is guaranteed to be unique amongst printers.
  - source  
  [PrinterSource](https://developer.chrome.com/docs/extensions/reference/api/printing#type-PrinterSource)

  The source of the printer (user or policy configured).
  - uri  
  string

The printer URI. This can be used by extensions to choose the printer for the user.  

### PrinterSource

The source of the printer.  

#### Enum

"USER"   
Printer was added by user.
"POLICY"   
Printer was added via policy.

<br />

### PrinterStatus

The status of the printer.  

#### Enum

"DOOR_OPEN"   
The door of the printer is open. Printer still accepts print jobs.
"TRAY_MISSING"   
The tray of the printer is missing. Printer still accepts print jobs.
"OUT_OF_INK"   
The printer is out of ink. Printer still accepts print jobs.
"OUT_OF_PAPER"   
The printer is out of paper. Printer still accepts print jobs.
"OUTPUT_FULL"   
The output area of the printer (e.g. tray) is full. Printer still accepts print jobs.
"PAPER_JAM"   
The printer has a paper jam. Printer still accepts print jobs.
"GENERIC_ISSUE"   
Some generic issue. Printer still accepts print jobs.
"STOPPED"   
The printer is stopped and doesn't print but still accepts print jobs.
"UNREACHABLE"   
The printer is unreachable and doesn't accept print jobs.
"EXPIRED_CERTIFICATE"   
The SSL certificate is expired. Printer accepts jobs but they fail.
"AVAILABLE"   
The printer is available.

<br />

### SubmitJobRequest

#### Properties

  - job  
  [PrintJob](https://developer.chrome.com/docs/extensions/reference/printerProvider/#type-PrintJob)

The print job to be submitted. Supported content types are "application/pdf" and "image/png". The [Cloud Job Ticket](https://developers.google.com/cloud-print/docs/cdd#cjt) shouldn't include `FitToPageTicketItem`, `PageRangeTicketItem` and `ReverseOrderTicketItem` fields since they are irrelevant for native printing. `VendorTicketItem` is optional. All other fields must be present.  

### SubmitJobResponse

#### Properties

  - jobId  
  string optional

  The id of created print job. This is a unique identifier among all print jobs on the device. If status is not OK, jobId will be null.
  - status  
  [SubmitJobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobStatus)

The status of the request.  

### SubmitJobStatus

The status of [`submitJob`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-submitJob) request.  

#### Enum

"OK"   
Sent print job request is accepted.
"USER_REJECTED"   
Sent print job request is rejected by the user.

<br />

## Properties

### MAX_GET_PRINTER_INFO_CALLS_PER_MINUTE

The maximum number of times that [`getPrinterInfo`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-getPrinterInfo) can be called per minute.  

#### Value

20   

### MAX_SUBMIT_JOB_CALLS_PER_MINUTE

The maximum number of times that [`submitJob`](https://developer.chrome.com/docs/extensions/reference/api/printing#method-submitJob) can be called per minute.  

#### Value

40   

## Methods

### cancelJob()

```typescript
chrome.printing.cancelJob(
  jobId: string,
): Promise<void>
```

Cancels previously submitted job.  

#### Parameters

  - jobId  
  string

The id of the print job to cancel. This should be the same id received in a [`SubmitJobResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse).  

#### Returns

  - Promise\<void\>  
Chrome 100+  

### getJobStatus()

Chrome 135+

```typescript
chrome.printing.getJobStatus(
  jobId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus>
```

Returns the status of the print job. This call will fail with a runtime error if the print job with the given `jobId` doesn't exist. `jobId`: The id of the print job to return the status of. This should be the same id received in a [`SubmitJobResponse`](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse).  

#### Parameters

  - jobId  
string  

#### Returns

- Promise\<[JobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus)\>  

### getPrinterInfo()

```typescript
chrome.printing.getPrinterInfo(
  printerId: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse>
```

Returns the status and capabilities of the printer in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd). This call will fail with a runtime error if no printers with given id are installed.  

#### Parameters

  - printerId  
string  

#### Returns

  - Promise\<[GetPrinterInfoResponse](https://developer.chrome.com/docs/extensions/reference/api/printing#type-GetPrinterInfoResponse)\>  
Chrome 100+  

### getPrinters()

```typescript
chrome.printing.getPrinters(): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-Printer[]>
```

Returns the list of available printers on the device. This includes manually added, enterprise and discovered printers.  

#### Returns

  - Promise\<[Printer](https://developer.chrome.com/docs/extensions/reference/api/printing#type-Printer)\[\]\>  
Chrome 100+  

### submitJob()

```typescript
chrome.printing.submitJob(
  request: SubmitJobRequest,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse>
```

Submits the job for printing. If the extension is not listed in the [`PrintingAPIExtensionsAllowlist`](https://chromeenterprise.google/policies/#PrintingAPIExtensionsAllowlist) policy, the user is prompted to accept the print job.
Before Chrome 120, this function did not return a promise.  

#### Parameters

  - request  
[SubmitJobRequest](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobRequest)  

#### Returns

  - Promise\<[SubmitJobResponse](https://developer.chrome.com/docs/extensions/reference/api/printing#type-SubmitJobResponse)\>  
  Chrome 100+

## Events

### onJobStatusChanged

```typescript
chrome.printing.onJobStatusChanged.addListener(
  callback: function,
)
```

Event fired when the status of the job is changed. This is only fired for the jobs created by this extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (jobId: string, status: JobStatus) => void
  ```

  <br />

    - jobId  
    string
    - status  
    [JobStatus](https://developer.chrome.com/docs/extensions/reference/api/printing#type-JobStatus)

<br />

---

## 45. privacy

*File: pages/privacy.md*

# chrome.processes

<br />

<br />

## Description

Use the `chrome.processes` API to interact with the browser's processes.

<br />

<br />

## Permissions

`processes`  

<br />

<br />

## Availability

Dev channel

<br />

<br />

<br />

## Types

### Cache

#### Properties

  - liveSize  
  number

  The part of the cache that is utilized, in bytes.
  - size  
  number

The size of the cache, in bytes.  

### Process

#### Properties

  - cpu  
  number optional

  The most recent measurement of the process's CPU usage, expressed as the percentage of a single CPU core used in total, by all of the process's threads. This gives a value from zero to CpuInfo.numOfProcessors\*100, which can exceed 100% in multi-threaded processes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - cssCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the CSS cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - id  
  number

  Unique ID of the process provided by the browser.
  - imageCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the image cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - jsMemoryAllocated  
  number optional

  The most recent measurement of the process JavaScript allocated memory, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - jsMemoryUsed  
  number optional

  The most recent measurement of the process JavaScript memory used, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - naclDebugPort  
  number

  The debugging port for Native Client processes. Zero for other process types and for NaCl processes that do not have debugging enabled.
  - network  
  number optional

  The most recent measurement of the process network usage, in bytes per second. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - osProcessId  
  number

  The ID of the process, as provided by the OS.
  - privateMemory  
  number optional

  The most recent measurement of the process private memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdatedWithMemory or getProcessInfo with the includeMemory flag.
  - profile  
  string

  The profile which the process is associated with.
  - scriptCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the script cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - sqliteMemory  
  number optional

  The most recent measurement of the process's SQLite memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - tasks  
  [TaskInfo](https://developer.chrome.com/docs/extensions/reference/api/processes#type-TaskInfo)\[\]

  Array of TaskInfos representing the tasks running on this process.
  - type  
  [ProcessType](https://developer.chrome.com/docs/extensions/reference/api/processes#type-ProcessType)

The type of process.  

### ProcessType

The types of the browser processes.  

#### Enum

"browser"   
"renderer"   
"extension"   
"notification"   
"plugin"   
"worker"   
Obsolete, will never be returned.
"nacl"   
"service_worker"   
Obsolete, will never be returned.
"utility"   
"gpu"   
"other"   

<br />

### TaskInfo

#### Properties

  - tabId  
  number optional

  Optional tab ID, if this task represents a tab running on a renderer process.
  - title  
  string

  The title of the task.

## Methods

### getProcessIdForTab()

```typescript
chrome.processes.getProcessIdForTab(
  tabId: number,
): Promise<number>
```

Returns the ID of the renderer process for the specified tab.  

#### Parameters

  - tabId  
  number

The ID of the tab for which the renderer process ID is to be returned.  

#### Returns

- Promise\<number\>  

### getProcessInfo()

```typescript
chrome.processes.getProcessInfo(
  processIds: number | number[],
  includeMemory: boolean,
): Promise<object>
```

Retrieves the process information for each process ID specified.  

#### Parameters

  - processIds  
  number \| number\[\]

  The list of process IDs or single process ID for which to return the process information. An empty list indicates all processes are requested.
  - includeMemory  
  boolean

True if detailed memory usage is required. Note, collecting memory usage information incurs extra CPU usage and should only be queried for when needed.  

#### Returns

- Promise\<object\>  

### terminate()

```typescript
chrome.processes.terminate(
  processId: number,
): Promise<boolean>
```

Terminates the specified renderer process. Equivalent to visiting about:crash, but without changing the tab's URL.  

#### Parameters

  - processId  
  number

The ID of the process to be terminated.  

#### Returns

- Promise\<boolean\>

## Events

### onCreated

```typescript
chrome.processes.onCreated.addListener(
  callback: function,
)
```

Fired each time a process is created, providing the corrseponding Process object.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (process: Process) => void
  ```

  <br />

    - process  
[Process](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Process)  

### onExited

```typescript
chrome.processes.onExited.addListener(
  callback: function,
)
```

Fired each time a process is terminated, providing the type of exit.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processId: number, exitType: number, exitCode: number) => void
  ```

  <br />

    - processId  
    number
    - exitType  
    number
    - exitCode  
number  

### onUnresponsive

```typescript
chrome.processes.onUnresponsive.addListener(
  callback: function,
)
```

Fired each time a process becomes unresponsive, providing the corrseponding Process object.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (process: Process) => void
  ```

  <br />

    - process  
[Process](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Process)  

### onUpdated

```typescript
chrome.processes.onUpdated.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processes: object) => void
  ```

  <br />

    - processes  
object  

### onUpdatedWithMemory

```typescript
chrome.processes.onUpdatedWithMemory.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID. Identical to onUpdate, with the addition of memory usage details included in each Process object. Note, collecting memory usage information incurs extra CPU usage and should only be listened for when needed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processes: object) => void
  ```

  <br />

    - processes  
    object

<br />

---

## 46. processes

*File: pages/processes.md*

# chrome.processes

<br />

<br />

## Description

Use the `chrome.processes` API to interact with the browser's processes.

<br />

<br />

## Permissions

`processes`  

<br />

<br />

## Availability

Dev channel

<br />

<br />

<br />

## Types

### Cache

#### Properties

  - liveSize  
  number

  The part of the cache that is utilized, in bytes.
  - size  
  number

The size of the cache, in bytes.  

### Process

#### Properties

  - cpu  
  number optional

  The most recent measurement of the process's CPU usage, expressed as the percentage of a single CPU core used in total, by all of the process's threads. This gives a value from zero to CpuInfo.numOfProcessors\*100, which can exceed 100% in multi-threaded processes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - cssCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the CSS cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - id  
  number

  Unique ID of the process provided by the browser.
  - imageCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the image cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - jsMemoryAllocated  
  number optional

  The most recent measurement of the process JavaScript allocated memory, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - jsMemoryUsed  
  number optional

  The most recent measurement of the process JavaScript memory used, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - naclDebugPort  
  number

  The debugging port for Native Client processes. Zero for other process types and for NaCl processes that do not have debugging enabled.
  - network  
  number optional

  The most recent measurement of the process network usage, in bytes per second. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - osProcessId  
  number

  The ID of the process, as provided by the OS.
  - privateMemory  
  number optional

  The most recent measurement of the process private memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdatedWithMemory or getProcessInfo with the includeMemory flag.
  - profile  
  string

  The profile which the process is associated with.
  - scriptCache  
  [Cache](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Cache) optional

  The most recent information about the script cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - sqliteMemory  
  number optional

  The most recent measurement of the process's SQLite memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
  - tasks  
  [TaskInfo](https://developer.chrome.com/docs/extensions/reference/api/processes#type-TaskInfo)\[\]

  Array of TaskInfos representing the tasks running on this process.
  - type  
  [ProcessType](https://developer.chrome.com/docs/extensions/reference/api/processes#type-ProcessType)

The type of process.  

### ProcessType

The types of the browser processes.  

#### Enum

"browser"   
"renderer"   
"extension"   
"notification"   
"plugin"   
"worker"   
Obsolete, will never be returned.
"nacl"   
"service_worker"   
Obsolete, will never be returned.
"utility"   
"gpu"   
"other"   

<br />

### TaskInfo

#### Properties

  - tabId  
  number optional

  Optional tab ID, if this task represents a tab running on a renderer process.
  - title  
  string

  The title of the task.

## Methods

### getProcessIdForTab()

```typescript
chrome.processes.getProcessIdForTab(
  tabId: number,
): Promise<number>
```

Returns the ID of the renderer process for the specified tab.  

#### Parameters

  - tabId  
  number

The ID of the tab for which the renderer process ID is to be returned.  

#### Returns

- Promise\<number\>  

### getProcessInfo()

```typescript
chrome.processes.getProcessInfo(
  processIds: number | number[],
  includeMemory: boolean,
): Promise<object>
```

Retrieves the process information for each process ID specified.  

#### Parameters

  - processIds  
  number \| number\[\]

  The list of process IDs or single process ID for which to return the process information. An empty list indicates all processes are requested.
  - includeMemory  
  boolean

True if detailed memory usage is required. Note, collecting memory usage information incurs extra CPU usage and should only be queried for when needed.  

#### Returns

- Promise\<object\>  

### terminate()

```typescript
chrome.processes.terminate(
  processId: number,
): Promise<boolean>
```

Terminates the specified renderer process. Equivalent to visiting about:crash, but without changing the tab's URL.  

#### Parameters

  - processId  
  number

The ID of the process to be terminated.  

#### Returns

- Promise\<boolean\>

## Events

### onCreated

```typescript
chrome.processes.onCreated.addListener(
  callback: function,
)
```

Fired each time a process is created, providing the corrseponding Process object.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (process: Process) => void
  ```

  <br />

    - process  
[Process](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Process)  

### onExited

```typescript
chrome.processes.onExited.addListener(
  callback: function,
)
```

Fired each time a process is terminated, providing the type of exit.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processId: number, exitType: number, exitCode: number) => void
  ```

  <br />

    - processId  
    number
    - exitType  
    number
    - exitCode  
number  

### onUnresponsive

```typescript
chrome.processes.onUnresponsive.addListener(
  callback: function,
)
```

Fired each time a process becomes unresponsive, providing the corrseponding Process object.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (process: Process) => void
  ```

  <br />

    - process  
[Process](https://developer.chrome.com/docs/extensions/reference/api/processes#type-Process)  

### onUpdated

```typescript
chrome.processes.onUpdated.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processes: object) => void
  ```

  <br />

    - processes  
object  

### onUpdatedWithMemory

```typescript
chrome.processes.onUpdatedWithMemory.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID. Identical to onUpdate, with the addition of memory usage details included in each Process object. Note, collecting memory usage information incurs extra CPU usage and should only be listened for when needed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (processes: object) => void
  ```

  <br />

    - processes  
    object

<br />

---

## 47. proxy

*File: pages/proxy.md*

# chrome.proxy

<br />

<br />

## Description

Use the `chrome.proxy` API to manage Chrome's proxy settings. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting) for getting and setting the proxy configuration.

<br />

<br />

## Permissions

`proxy`  

<br />

<br />

<br />

You must declare the "proxy" permission in the [extension manifest](https://developer.chrome.com/docs/extensions/mv3/manifest) to use the proxy settings
API. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "proxy"
      ],
      ...
    }

## Concepts and usage

Proxy settings are defined in a [`proxy.ProxyConfig`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyConfig) object. Depending on Chrome's proxy settings,
the settings may contain [`proxy.ProxyRules`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyRules) or a [`proxy.PacScript`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-PacScript).

### Proxy modes

A ProxyConfig object's `mode` attribute determines the overall behavior of Chrome with regards to
proxy usage. It can take the following values:

`direct`
:   In `direct` mode all connections are created directly, without any proxy involved. This mode allows
    no further parameters in the `ProxyConfig` object.

`auto_detect`
:   In `auto_detect` mode the proxy configuration is determined by a PAC script that can be downloaded
    at <http://wpad/wpad.dat>. This mode allows no further parameters in the `ProxyConfig` object.

`pac_script`
:   In `pac_script` mode the proxy configuration is determined by a PAC script that is either retrieved
    from the URL specified in the [`proxy.PacScript`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-PacScript) object or taken literally from the `data` element
    specified in the [`proxy.PacScript`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-PacScript) object. Besides this, this mode allows no further parameters
    in the `ProxyConfig` object.

`fixed_servers`
:   In `fixed_servers` mode the proxy configuration is codified in a [`proxy.ProxyRules`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyRules) object. Its
    structure is described in [Proxy rules](https://developer.chrome.com/docs/extensions/reference/api/proxy#proxy_rules). Besides this, the `fixed_servers` mode allows no further
    parameters in the `ProxyConfig` object.

`system`
:   In `system` mode the proxy configuration is taken from the operating system. This mode allows no
    further parameters in the `ProxyConfig` object. Note that the `system` mode is different from
    setting no proxy configuration. In the latter case, Chrome falls back to the system settings only if
    no command-line options influence the proxy configuration.

### Proxy rules

The [`proxy.ProxyRules`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyRules) object can contain either a `singleProxy` attribute or a subset of
`proxyForHttp`, `proxyForHttps`, `proxyForFtp`, and `fallbackProxy`.

In the first case, HTTP, HTTPS and FTP traffic is proxied through the specified proxy server. Other
traffic is sent directly. In the latter case the behavior is slightly more subtle: If a proxy server
is configured for the HTTP, HTTPS or FTP protocol, the respective traffic is proxied through the
specified server. If no such proxy server is specified or traffic uses a different protocol than
HTTP, HTTPS or FTP, the `fallbackProxy` is used. If no `fallbackProxy` is specified, traffic is sent
directly without a proxy server.

### Proxy server objects

A proxy server is configured in a [`proxy.ProxyServer`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) object. The connection to the proxy server
(defined by the `host` attribute) uses the protocol defined in the `scheme` attribute. If no
`scheme` is specified, the proxy connection defaults to `http`.

If no `port` is defined in a [`proxy.ProxyServer`](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) object, the port is derived from the scheme.
The default ports are:

| Scheme | Port |
|--------|------|
| http   | 80   |
| https  | 443  |
| socks4 | 1080 |
| socks5 | 1080 |

### Bypass list

Individual servers may be excluded from being proxied with the `bypassList`. This list may contain
the following entries:

`[SCHEME://]HOST_PATTERN[:PORT]`

:   Match all hostnames that match the pattern `HOST_PATTERN`. A leading `"."` is interpreted as a
    `"*."`.

    Examples: `"foobar.com", "*foobar.com", "*.foobar.com", "*foobar.com:99", "https://x.*.y.com:99"`.

    |     Pattern      |                        Matches                        |   Does not match   |
    |------------------|-------------------------------------------------------|--------------------|
    | `".foobar.com"`  | `"www.foobar.com"`                                    | `"foobar.com"`     |
    | `"*.foobar.com"` | `"www.foobar.com"`                                    | `"foobar.com"`     |
    | `"foobar.com"`   | `"foobar.com"`                                        | `"www.foobar.com"` |
    | `"*foobar.com"`  | `"foobar.com"`, `"www.foobar.com"`, `"foofoobar.com"` |                    |

`[SCHEME://]IP_LITERAL[:PORT]`

:   Match URLs that are IP address literals. Conceptually this is the similar to the first case, but
    with special cases to handle IP literal canonicalization. For example, matching on "\[0:0:0::1\]"
    is the same as matching on "\[::1\]" because the IPv6 canonicalization is done internally.

    Examples: `127.0.1`, `[0:0::1]`, `[::1]:80`, `https://[::1]:443`

`IP_LITERAL/PREFIX_LENGTH_IN_BITS`

:   Match any URL containing an IP literal (`IP_LITERAL`) within the given
    range. The IP range (`PREFIX_LENGTH_IN_BITS`) is specified using [CIDR
    notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation).

:   Match any URL containing an IP literal within the given range. The IP range is specified using CIDR
    notation.
    Examples: `"192.168.1.1/16", "fefe:13::abc/33"`

`<local>`

:   The literal string `<local>` matches simple hostnames. A simple hostname is one that contains no
    dots and is not an IP literal. For instance `example` and `localhost` are simple hostnames,
    whereas `example.com`, `example.`, and `[::1]` are not.

    Example: `"<local>"`

## Examples

The following code sets a SOCKS 5 proxy for HTTP connections to all servers but foobar.com and uses
direct connections for all other protocols. The settings apply to regular and incognito windows, as
incognito windows inherit settings from regular windows. See also the [Types API](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting)
documentation.  

    var config = {
      mode: "fixed_servers",
      rules: {
        proxyForHttp: {
          scheme: "socks5",
          host: "1.2.3.4"
        },
        bypassList: ["foobar.com"]
      }
    };
    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      function() {}
    );

The following code sets a custom PAC script.  

    var config = {
      mode: "pac_script",
      pacScript: {
        data: "function FindProxyForURL(url, host) {\n" +
              "  if (host == 'foobar.com')\n" +
              "    return 'PROXY blackhole:80';\n" +
              "  return 'DIRECT';\n" +
              "}"
      }
    };
    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      function() {}
    );

The next snippet queries the current effective proxy settings. The effective proxy settings can be
determined by another extension or by a policy. See the [Types API](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting) documentation for details.  

    chrome.proxy.settings.get(
      {'incognito': false},
      function(config) {
        console.log(JSON.stringify(config));
      }
    );

Note that the `value` object passed to `set()` is not identical to the `value` object passed to
callback function of `get()`. The latter will contain a `rules.proxyForHttp.port` element.

<br />

## Types

### Mode

Chrome 54+  

#### Enum

"direct"   
"auto_detect"   
"pac_script"   
"fixed_servers"   
"system"   

<br />

### PacScript

An object holding proxy auto-config information. Exactly one of the fields should be non-empty.  

#### Properties

  - data  
  string optional

  A PAC script.
  - mandatory  
  boolean optional

  If true, an invalid PAC script will prevent the network stack from falling back to direct connections. Defaults to false.
  - url  
  string optional

URL of the PAC file to be used.  

### ProxyConfig

An object encapsulating a complete proxy configuration.  

#### Properties

  - mode  
  [Mode](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-Mode)

  'direct' = Never use a proxy
  'auto_detect' = Auto detect proxy settings
  'pac_script' = Use specified PAC script
  'fixed_servers' = Manually specify proxy servers
  'system' = Use system proxy settings
  - pacScript  
  [PacScript](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-PacScript) optional

  The proxy auto-config (PAC) script for this configuration. Use this for 'pac_script' mode.
  - rules  
  [ProxyRules](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyRules) optional

The proxy rules describing this configuration. Use this for 'fixed_servers' mode.  

### ProxyRules

An object encapsulating the set of proxy rules for all protocols. Use either 'singleProxy' or (a subset of) 'proxyForHttp', 'proxyForHttps', 'proxyForFtp' and 'fallbackProxy'.  

#### Properties

  - bypassList  
  string\[\] optional

  List of servers to connect to without a proxy server.
  - fallbackProxy  
  [ProxyServer](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) optional

  The proxy server to be used for everthing else or if any of the specific proxyFor... is not specified.
  - proxyForFtp  
  [ProxyServer](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) optional

  The proxy server to be used for FTP requests.
  - proxyForHttp  
  [ProxyServer](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) optional

  The proxy server to be used for HTTP requests.
  - proxyForHttps  
  [ProxyServer](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) optional

  The proxy server to be used for HTTPS requests.
  - singleProxy  
  [ProxyServer](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyServer) optional

The proxy server to be used for all per-URL requests (that is http, https, and ftp).  

### ProxyServer

An object encapsulating a single proxy server's specification.  

#### Properties

  - host  
  string

  The hostname or IP address of the proxy server. Hostnames must be in ASCII (in Punycode format). IDNA is not supported, yet.
  - port  
  number optional

  The port of the proxy server. Defaults to a port that depends on the scheme.
  - scheme  
  [Scheme](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-Scheme) optional

The scheme (protocol) of the proxy server itself. Defaults to 'http'.  

### Scheme

Chrome 54+  

#### Enum

"http"   
"https"   
"quic"   
"socks4"   
"socks5"   

<br />

## Properties

### settings

Proxy settings to be used. The value of this setting is a ProxyConfig object.  

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)\<[ProxyConfig](https://developer.chrome.com/docs/extensions/reference/api/proxy#type-ProxyConfig)\>

## Events

### onProxyError

```typescript
chrome.proxy.onProxyError.addListener(
  callback: function,
)
```

Notifies about proxy errors.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - details  
      string

      Additional details about the error such as a JavaScript runtime error.
      - error  
      string

      The error description.
      - fatal  
      boolean

      If true, the error was fatal and the network transaction was aborted. Otherwise, a direct connection is used instead.

<br />

---

## 48. readingList

*File: pages/readingList.md*

# chrome.readingList

<br />

<br />

## Description

Use the `chrome.readingList` API to read from and modify the items in the [Reading List](https://support.google.com/chrome/answer/7343019).

<br />

<br />

## Permissions

`readingList`  

<br />

To use the Reading List API, add the `"readingList"` permission in the extension [manifest](https://developer.chrome.com/docs/extensions/reference/manifest) file:

manifest.json:  

    {
      "name": "My reading list extension",
      ...
      "permissions": [
        "readingList"
      ]
    }

<br />

## Availability

Chrome 120+ MV3+

<br />

Chrome features a reading list located on the side panel. It lets users save web pages to read later or when offline.
Use the Reading List API to retrieve existing items and add or remove items from the list.
![Reading list showing a number of articles](https://developer.chrome.com/static/docs/extensions/reference/api/readingList/image/reading-list-showing-num-a0718c5ab1fe5.png) Reading list showing a number of articles

<br />

## Concepts and usage

### Item ordering

Items in the reading list are not in any guaranteed order.

### Item uniqueness

Items are keyed by URL. This includes the hash and query string.

## Use cases

The following sections demonstrate some common use cases for the Reading List API. See [Extension samples](https://developer.chrome.com/docs/extensions/reference/api/readingList#examples) for complete extension examples.

### Add an item

To add an item to the reading list, use [`chrome.readingList.addEntry()`](https://developer.chrome.com/docs/extensions/reference/api/readingList#method-addEntry):  

    chrome.readingList.addEntry({
      title: "New to the web platform in September | web.dev",
      url: "https://developer.chrome.com/",
      hasBeenRead: false
    });

### Display items

To display items from the reading list, use the [`chrome.readingList.query()`](https://developer.chrome.com/docs/extensions/reference/api/readingList#method-query) method to retrieve them.
method.  

    const items = await chrome.readingList.query({});

    for (const item of items) {
      // Do something do display the item
    }

### Mark an item as read

You can use [`chrome.readingList.updateEntry()`](https://developer.chrome.com/docs/extensions/reference/api/readingList#method-updateEntry) to update the title, URL, and read status. The following code marks an item as read:  

    chrome.readingList.updateEntry({
      url: "https://developer.chrome.com/",
      hasBeenRead: true
    });

### Remove an item

To remove an item, use [`chrome.readingList.removeEntry()`](https://developer.chrome.com/docs/extensions/reference/api/readingList#method-removeEntry):  

    chrome.readingList.removeEntry({
      url: "https://developer.chrome.com/"
    });

## Extension samples

For more Reading List API extensions demos, see the [Reading List API sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/readingList).

<br />

## Types

### AddEntryOptions

#### Properties

  - hasBeenRead  
  boolean

  Will be `true` if the entry has been read.
  - title  
  string

  The title of the entry.
  - url  
  string

The url of the entry.  

### QueryInfo

#### Properties

  - hasBeenRead  
  boolean optional

  Indicates whether to search for read (`true`) or unread (`false`) items.
  - title  
  string optional

  A title to search for.
  - url  
  string optional

A url to search for.  

### ReadingListEntry

#### Properties

  - creationTime  
  number

  The time the entry was created. Recorded in milliseconds since Jan 1, 1970.
  - hasBeenRead  
  boolean

  Will be `true` if the entry has been read.
  - lastUpdateTime  
  number

  The last time the entry was updated. This value is in milliseconds since Jan 1, 1970.
  - title  
  string

  The title of the entry.
  - url  
  string

The url of the entry.  

### RemoveOptions

#### Properties

  - url  
  string

The url to remove.  

### UpdateEntryOptions

#### Properties

  - hasBeenRead  
  boolean optional

  The updated read status. The existing status remains if a value isn't provided.
  - title  
  string optional

  The new title. The existing tile remains if a value isn't provided.
  - url  
  string

  The url that will be updated.

## Methods

### addEntry()

```typescript
chrome.readingList.addEntry(
  entry: AddEntryOptions,
): Promise<void>
```

Adds an entry to the reading list if it does not exist.  

#### Parameters

  - entry  
  [AddEntryOptions](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-AddEntryOptions)

The entry to add to the reading list.  

#### Returns

- Promise\<void\>  

### query()

```typescript
chrome.readingList.query(
  info: QueryInfo,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/readingList#type-ReadingListEntry[]>
```

Retrieves all entries that match the `QueryInfo` properties. Properties that are not provided will not be matched.  

#### Parameters

  - info  
  [QueryInfo](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-QueryInfo)

The properties to search for.  

#### Returns

- Promise\<[ReadingListEntry](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-ReadingListEntry)\[\]\>  

### removeEntry()

```typescript
chrome.readingList.removeEntry(
  info: RemoveOptions,
): Promise<void>
```

Removes an entry from the reading list if it exists.  

#### Parameters

  - info  
  [RemoveOptions](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-RemoveOptions)

The entry to remove from the reading list.  

#### Returns

- Promise\<void\>  

### updateEntry()

```typescript
chrome.readingList.updateEntry(
  info: UpdateEntryOptions,
): Promise<void>
```

Updates a reading list entry if it exists.  

#### Parameters

  - info  
  [UpdateEntryOptions](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-UpdateEntryOptions)

The entry to update.  

#### Returns

- Promise\<void\>

## Events

### onEntryAdded

```typescript
chrome.readingList.onEntryAdded.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is added to the reading list.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (entry: ReadingListEntry) => void
  ```

  <br />

    - entry  
[ReadingListEntry](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-ReadingListEntry)  

### onEntryRemoved

```typescript
chrome.readingList.onEntryRemoved.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is removed from the reading list.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (entry: ReadingListEntry) => void
  ```

  <br />

    - entry  
[ReadingListEntry](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-ReadingListEntry)  

### onEntryUpdated

```typescript
chrome.readingList.onEntryUpdated.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is updated in the reading list.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (entry: ReadingListEntry) => void
  ```

  <br />

    - entry  
    [ReadingListEntry](https://developer.chrome.com/docs/extensions/reference/api/readingList#type-ReadingListEntry)

<br />

---

## 49. runtime

*File: pages/runtime.md*

# chrome.sessions

<br />

<br />

## Description

Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.

<br />

<br />

## Permissions

`sessions`  

<br />

<br />

<br />

<br />

## Types

### Device

#### Properties

  - deviceName  
  string

  The name of the foreign device.
  - sessions  
  [Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]

A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.  

### Filter

#### Properties

  - maxResults  
  number optional

The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries ([`sessions.MAX_SESSION_RESULTS`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-MAX_SESSION_RESULTS)).  

### Session

#### Properties

  - lastModified  
  number

  The time when the window or tab was closed or modified, represented in seconds since the epoch.
  - tab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  The [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), if this entry describes a tab. Either this or [`sessions.Session.window`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-window) will be set.
  - window  
  [Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) optional

  The [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window), if this entry describes a window. Either this or [`sessions.Session.tab`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-tab) will be set.

## Properties

### MAX_SESSION_RESULTS

The maximum number of [`sessions.Session`](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session) that will be included in a requested list.  

#### Value

25   

## Methods

### getDevices()

```typescript
chrome.sessions.getDevices(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device[]>
```

Retrieves all devices with synced sessions.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Device](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device)\[\]\>  
Chrome 96+  

### getRecentlyClosed()

```typescript
chrome.sessions.getRecentlyClosed(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session[]>
```

Gets the list of recently closed tabs and/or windows.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]\>  
Chrome 96+  

### restore()

```typescript
chrome.sessions.restore(
  sessionId?: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session>
```

Reopens a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) or [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), with an optional callback to run when the entry has been restored.  

#### Parameters

  - sessionId  
  string optional

The [`windows.Window.sessionId`](https://developer.chrome.com/docs/extensions/reference/windows/#property-Window-sessionId), or [`tabs.Tab.sessionId`](https://developer.chrome.com/docs/extensions/reference/tabs/#property-Tab-sessionId) to restore. If this parameter is not specified, the most recently closed session is restored.  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\>  
  Chrome 96+

## Events

### onChanged

```typescript
chrome.sessions.onChanged.addListener(
  callback: function,
)
```

Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 50. scripting

*File: pages/scripting.md*

# chrome.sessions

<br />

<br />

## Description

Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.

<br />

<br />

## Permissions

`sessions`  

<br />

<br />

<br />

<br />

## Types

### Device

#### Properties

  - deviceName  
  string

  The name of the foreign device.
  - sessions  
  [Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]

A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.  

### Filter

#### Properties

  - maxResults  
  number optional

The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries ([`sessions.MAX_SESSION_RESULTS`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-MAX_SESSION_RESULTS)).  

### Session

#### Properties

  - lastModified  
  number

  The time when the window or tab was closed or modified, represented in seconds since the epoch.
  - tab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  The [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), if this entry describes a tab. Either this or [`sessions.Session.window`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-window) will be set.
  - window  
  [Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) optional

  The [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window), if this entry describes a window. Either this or [`sessions.Session.tab`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-tab) will be set.

## Properties

### MAX_SESSION_RESULTS

The maximum number of [`sessions.Session`](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session) that will be included in a requested list.  

#### Value

25   

## Methods

### getDevices()

```typescript
chrome.sessions.getDevices(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device[]>
```

Retrieves all devices with synced sessions.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Device](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device)\[\]\>  
Chrome 96+  

### getRecentlyClosed()

```typescript
chrome.sessions.getRecentlyClosed(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session[]>
```

Gets the list of recently closed tabs and/or windows.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]\>  
Chrome 96+  

### restore()

```typescript
chrome.sessions.restore(
  sessionId?: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session>
```

Reopens a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) or [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), with an optional callback to run when the entry has been restored.  

#### Parameters

  - sessionId  
  string optional

The [`windows.Window.sessionId`](https://developer.chrome.com/docs/extensions/reference/windows/#property-Window-sessionId), or [`tabs.Tab.sessionId`](https://developer.chrome.com/docs/extensions/reference/tabs/#property-Tab-sessionId) to restore. If this parameter is not specified, the most recently closed session is restored.  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\>  
  Chrome 96+

## Events

### onChanged

```typescript
chrome.sessions.onChanged.addListener(
  callback: function,
)
```

Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 51. search

*File: pages/search.md*

# chrome.sessions

<br />

<br />

## Description

Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.

<br />

<br />

## Permissions

`sessions`  

<br />

<br />

<br />

<br />

## Types

### Device

#### Properties

  - deviceName  
  string

  The name of the foreign device.
  - sessions  
  [Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]

A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.  

### Filter

#### Properties

  - maxResults  
  number optional

The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries ([`sessions.MAX_SESSION_RESULTS`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-MAX_SESSION_RESULTS)).  

### Session

#### Properties

  - lastModified  
  number

  The time when the window or tab was closed or modified, represented in seconds since the epoch.
  - tab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  The [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), if this entry describes a tab. Either this or [`sessions.Session.window`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-window) will be set.
  - window  
  [Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) optional

  The [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window), if this entry describes a window. Either this or [`sessions.Session.tab`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-tab) will be set.

## Properties

### MAX_SESSION_RESULTS

The maximum number of [`sessions.Session`](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session) that will be included in a requested list.  

#### Value

25   

## Methods

### getDevices()

```typescript
chrome.sessions.getDevices(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device[]>
```

Retrieves all devices with synced sessions.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Device](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device)\[\]\>  
Chrome 96+  

### getRecentlyClosed()

```typescript
chrome.sessions.getRecentlyClosed(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session[]>
```

Gets the list of recently closed tabs and/or windows.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]\>  
Chrome 96+  

### restore()

```typescript
chrome.sessions.restore(
  sessionId?: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session>
```

Reopens a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) or [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), with an optional callback to run when the entry has been restored.  

#### Parameters

  - sessionId  
  string optional

The [`windows.Window.sessionId`](https://developer.chrome.com/docs/extensions/reference/windows/#property-Window-sessionId), or [`tabs.Tab.sessionId`](https://developer.chrome.com/docs/extensions/reference/tabs/#property-Tab-sessionId) to restore. If this parameter is not specified, the most recently closed session is restored.  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\>  
  Chrome 96+

## Events

### onChanged

```typescript
chrome.sessions.onChanged.addListener(
  callback: function,
)
```

Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 52. sessions

*File: pages/sessions.md*

# chrome.sessions

<br />

<br />

## Description

Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.

<br />

<br />

## Permissions

`sessions`  

<br />

<br />

<br />

<br />

## Types

### Device

#### Properties

  - deviceName  
  string

  The name of the foreign device.
  - sessions  
  [Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]

A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.  

### Filter

#### Properties

  - maxResults  
  number optional

The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries ([`sessions.MAX_SESSION_RESULTS`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-MAX_SESSION_RESULTS)).  

### Session

#### Properties

  - lastModified  
  number

  The time when the window or tab was closed or modified, represented in seconds since the epoch.
  - tab  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) optional

  The [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), if this entry describes a tab. Either this or [`sessions.Session.window`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-window) will be set.
  - window  
  [Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) optional

  The [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window), if this entry describes a window. Either this or [`sessions.Session.tab`](https://developer.chrome.com/docs/extensions/reference/api/sessions#property-Session-tab) will be set.

## Properties

### MAX_SESSION_RESULTS

The maximum number of [`sessions.Session`](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session) that will be included in a requested list.  

#### Value

25   

## Methods

### getDevices()

```typescript
chrome.sessions.getDevices(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device[]>
```

Retrieves all devices with synced sessions.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Device](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Device)\[\]\>  
Chrome 96+  

### getRecentlyClosed()

```typescript
chrome.sessions.getRecentlyClosed(
  filter?: Filter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session[]>
```

Gets the list of recently closed tabs and/or windows.  

#### Parameters

  - filter  
[Filter](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Filter) optional  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\[\]\>  
Chrome 96+  

### restore()

```typescript
chrome.sessions.restore(
  sessionId?: string,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session>
```

Reopens a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) or [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), with an optional callback to run when the entry has been restored.  

#### Parameters

  - sessionId  
  string optional

The [`windows.Window.sessionId`](https://developer.chrome.com/docs/extensions/reference/windows/#property-Window-sessionId), or [`tabs.Tab.sessionId`](https://developer.chrome.com/docs/extensions/reference/tabs/#property-Tab-sessionId) to restore. If this parameter is not specified, the most recently closed session is restored.  

#### Returns

  - Promise\<[Session](https://developer.chrome.com/docs/extensions/reference/api/sessions#type-Session)\>  
  Chrome 96+

## Events

### onChanged

```typescript
chrome.sessions.onChanged.addListener(
  callback: function,
)
```

Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 53. sidePanel

*File: pages/sidePanel.md*

# chrome.sidePanel

<br />

<br />

## Description

Use the `chrome.sidePanel` API to control your extension's side panel, including its default
path, per-tab settings, and opening behavior.

<br />

<br />

## Permissions

`sidePanel`

<br />

To use the Side Panel API, declare the `"sidePanel"` permission and a `"side_panel"` entry in
your manifest. For example:

manifest.json:

    {
      "name": "Side Panel Extension",
      "manifest_version": 3,
      "permissions": [
        "sidePanel"
      ],
      "side_panel": {
        "default_path": "sidepanel/index.html"
      },
      "action": {
        "default_title": "Open side panel"
      }
    }

<br />

## Availability

Chrome 114+ MV3+

<br />

## Concepts and usage

### Opening behavior

Use `chrome.sidePanel.setPanelBehavior()` to control whether clicking the extension action
button opens the side panel. Note that if the action has a `default_popup`, the
`action.onClicked` event is not fired.

### Per-tab configuration

Use `chrome.sidePanel.setOptions()` to enable the side panel for a specific tab and
override the default path.

### Programmatic open

Use `chrome.sidePanel.open()` to open the side panel in response to a user gesture,
such as `chrome.action.onClicked` or a context menu click. Calling it after awaiting
other async work can cause a user gesture error.

## Use cases

### Open on action click

    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

### Open with a user gesture

    chrome.action.onClicked.addListener((tab) => {
      chrome.sidePanel.open({ tabId: tab.id });
    });

### Set a per-tab panel

    chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel/index.html",
      enabled: true
    });

## Best practices

- Set `side_panel.default_path` in the manifest and use `setPanelBehavior()` on install or startup.
- Call `sidePanel.open()` directly in a user gesture handler without awaiting other work first.
- Avoid `action.default_popup` when you want `action.onClicked` or `openPanelOnActionClick`.

<br />

---

## 54. storage

*File: pages/storage.md*

# chrome.storage

<br />

<br />

## Description

Use the `chrome.storage` API to store, retrieve, and track changes to user data.

<br />

<br />

## Permissions

`storage`  

<br />

To use the storage API, declare the `"storage"` permission in the extension
[manifest](https://developer.chrome.com/docs/extensions/reference/manifest). For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "storage"
      ],
      ...
    }

<br />

<br />

## Concepts and usage

The Storage API provides an extension-specific way to persist user data and state. It's similar to the web platform's storage APIs ([IndexedDB](https://developer.mozilla.org/docs/Web/API/Window/indexeddb), and [Storage](https://developer.mozilla.org/docs/Web/API/Storage)), but was designed to meet the storage needs of extensions. The following are a few key features:

- All extension contexts, including the extension service worker and content scripts have access to the Storage API.
- The JSON serializable values are stored as object properties.
- The Storage API is asynchronous with bulk read and write operations.
- Even if the user clears the cache and browsing history, the data persists.
- Stored settings persist even when using [split incognito](https://developer.chrome.com/docs/extensions/reference/manifest/incognito).
- Includes an exclusive read-only [managed storage area](https://developer.chrome.com/docs/extensions/reference/api/storage#property-managed) for enterprise policies.

### Can extensions use web storage APIs?

While extensions can use the [`Storage`](https://developer.mozilla.org/docs/Web/API/Storage) interface (accessible from `window.localStorage`) in some contexts (popup and other HTML pages), we don't recommend it for the following reasons:

- Extension service workers can't use the Web Storage API.
- Content scripts share storage with the host page.
- Data saved using the Web Storage API is lost when the user clears their browsing history.

To move data from web storage APIs to extension storage APIs from a service worker:

1. Prepare an offscreen document html page and script file. The script file should contain a conversion routine and an [`onMessage`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage) handler.
2. In the extension service worker, check `chrome.storage` for your data.
3. If your data isn't found, call [`createDocument()`](https://developer.chrome.com/docs/extensions/reference/api/offscreen#method-createDocument).
4. After the returned Promise resolves, call [`sendMessage()`](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-sendMessage) to start the conversion routine.
5. Inside the offscreen document's `onMessage` handler, call the conversion routine.

There are also some nuances to how web storage APIs work in extensions. Learn more in the
[Storage and Cookies](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies) article.

### Storage areas

The Storage API is divided into the following storage areas:

[`storage.local`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-local)
:   Data is stored locally and cleared when the extension is removed. The storage limit is 10 MB (5 MB in Chrome 113 and earlier), but can be increased by requesting the `"unlimitedStorage"` permission. We recommend using `storage.local` to store larger amounts of data. By default, it's exposed to content scripts, but this behavior can be changed by calling [`chrome.storage.local.setAccessLevel()`](https://developer.chrome.com/docs/extensions/reference/api/storage#method-StorageArea-setAccessLevel).

[`storage.managed`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-managed)
:   Managed storage is read-only storage for policy installed extensions and managed by system administrators using a developer-defined schema and enterprise policies. Policies are analogous to options but are configured by a system administrator instead of the user, allowing the extension to be preconfigured for all users of an organization. By default, `storage.managed` is exposed to content scripts, but this behavior can be changed by calling [`chrome.storage.managed.setAccessLevel()`](https://developer.chrome.com/docs/extensions/reference/api/storage#method-StorageArea-setAccessLevel). For information on policies, see [Documentation for Administrators](https://www.chromium.org/administrators/). To learn more about the `managed` storage area, see [Manifest for storage areas](https://developer.chrome.com/docs/extensions/reference/api/storage).

[`storage.session`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-session)
:   Holds data in memory while an extension is loaded. The storage is cleared if the extension is disabled, reloaded or updated and when the browser restarts. By default, it's not exposed to content scripts, but this behavior can be changed by calling [`chrome.storage.session.setAccessLevel()`](https://developer.chrome.com/docs/extensions/reference/api/storage#method-StorageArea-setAccessLevel). The storage limit is 10 MB (1 MB in Chrome 111 and earlier). The`storage.session` interface is one of several [we recommend for service workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/service-worker-lifecycle#persist-data).

[`storage.sync`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
:   If syncing is enabled, the data is synced to any Chrome browser that the user is logged into. If disabled, it behaves like `storage.local`. Chrome stores the data locally when the browser is offline and resumes syncing when it's back online. The quota limitation is approximately 100 KB, 8 KB per item. We recommend using `storage.sync` to preserve user settings across synced browsers. If you're working with sensitive user data, instead use `storage.session`. By default, `storage.sync` is exposed to content scripts, but this behavior can be changed by calling [`chrome.storage.sync.setAccessLevel()`](https://developer.chrome.com/docs/extensions/reference/api/storage#method-StorageArea-setAccessLevel).

### Storage and throttling limits

The Storage API has the following usage limitations:

- Storing data often comes with performance costs, and the API includes storage quotas. We recommend being careful about what data you store so that you don't lose the ability to store data.
- Storage can take time to complete. Make sure to structure your code to account for that time.

For details on storage area limitations and what happens when they're exceeded, see the quota information for [`sync`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync), [`local`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-local), and [`session`](https://developer.chrome.com/docs/extensions/reference/api/storage#property-session).

## Use cases

The following sections demonstrate common use cases for the Storage API.

### Respond to storage updates

To track changes made to storage, add a listener to its `onChanged` event. When anything changes in storage, that event fires. The sample code listens for these changes:

background.js:  

    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
        );
      }
    });

We can take this idea even further. In this example, we have an [options page](https://developer.chrome.com/docs/extensions/develop/ui/options-page) that
allows the user to toggle a "debug mode" (implementation not shown here). The options page immediately saves the new settings to `storage.sync`, and the service worker uses `storage.onChanged` to apply the setting as soon as possible.

options.html:  

    <!-- type="module" allows you to use top level await -->
    <script defer src="options.js" type="module"></script>
    <form id="optionsForm">
      <label for="debug">
        <input type="checkbox" name="debug" id="debug">
        Enable debug mode
      </label>
    </form>

options.js:  

    // In-page cache of the user's options
    const options = {};
    const optionsForm = document.getElementById("optionsForm");

    // Immediately persist options changes
    optionsForm.debug.addEventListener("change", (event) => {
      options.debug = event.target.checked;
      chrome.storage.sync.set({ options });
    });

    // Initialize the form with the user's option settings
    const data = await chrome.storage.sync.get("options");
    Object.assign(options, data.options);
    optionsForm.debug.checked = Boolean(options.debug);

background.js:  

    function setDebugMode() { /* ... */ }

    // Watch for changes to the user's options & apply them
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.options?.newValue) {
        const debugMode = Boolean(changes.options.newValue.debug);
        console.log('enable debug mode?', debugMode);
        setDebugMode(debugMode);
      }
    });

### Asynchronous preload from storage

Because service workers don't run all the time, Manifest V3 extensions sometimes need to
asynchronously load data from storage before they execute their event handlers. To do this, the
following snippet uses an async `action.onClicked` event handler that waits for the `storageCache`
global to be populated before executing its logic.

background.js:  

    // Where we will expose all the data we retrieve from storage.sync.
    const storageCache = { count: 0 };
    // Asynchronously retrieve data from storage.sync, then cache it.
    const initStorageCache = chrome.storage.sync.get().then((items) => {
      // Copy the data retrieved from storage into storageCache.
      Object.assign(storageCache, items);
    });

    chrome.action.onClicked.addListener(async (tab) => {
      try {
        await initStorageCache;
      } catch (e) {
        // Handle error that occurred during storage initialization.
      }

      // Normal action handler logic.
      storageCache.count++;
      storageCache.lastTabId = tab.id;
      chrome.storage.sync.set(storageCache);
    });

## DevTools

You can view and edit data stored using the API in DevTools. To learn more, see
the [View and edit extension storage](https://developer.chrome.com/docs/devtools/storage/extensionstorage)
page in the DevTools documentation.

## Examples

The following samples demonstrate the `local`, `sync`, and
`session` storage areas:  

### Local

    chrome.storage.local.set({ key: value }).then(() => {
      console.log("Value is set");
    });

    chrome.storage.local.get(["key"]).then((result) => {
      console.log("Value is " + result.key);
    });

### Sync

    chrome.storage.sync.set({ key: value }).then(() => {
      console.log("Value is set");
    });

    chrome.storage.sync.get(["key"]).then((result) => {
      console.log("Value is " + result.key);
    });

### Session

    chrome.storage.session.set({ key: value }).then(() => {
      console.log("Value was set");
    });

    chrome.storage.session.get(["key"]).then((result) => {
      console.log("Value is " + result.key);
    });

To see other demos of the Storage API, explore any of the following samples:

- [Global search extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/17956f44b6f04d28407a4b7eee428611affd4fab/api/contextMenus/global_context_search).
- [Water alarm extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/17956f44b6f04d28407a4b7eee428611affd4fab/examples/water_alarm_notification).

<br />

## Types

### AccessLevel

Chrome 102+

The storage area's access level.  

#### Enum

"TRUSTED_CONTEXTS"   
Specifies contexts originating from the extension itself.
"TRUSTED_AND_UNTRUSTED_CONTEXTS"   
Specifies contexts originating from outside the extension.

<br />

### StorageArea

#### Properties

  - onChanged  
  Event\<functionvoidvoid\>  
  Chrome 73+

  Fired when one or more items change.


  The `onChanged.addListener` function looks like:  

  ```typescript
  (callback: function) => {...}
  ```

  <br />

    - callback  
    function


    The `callback` parameter looks like:  

    ```typescript
    (changes: object) => void
    ```

    <br />

      - changes  
      object
  - clear  
  void

  Removes all items from storage.


  The `clear` function looks like:  

  ```typescript
  () => {...}
  ```

  <br />

    - returns  
    Promise\<void\>  
    Chrome 95+
  - get  
  void

  Gets one or more items from storage.


  The `get` function looks like:  

  ```typescript
  (keys?: string | string[] | object) => {...}
  ```

  <br />

    - keys  
    string \| string\[\] \| object optional

  A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in `null` to get the entire contents of storage.  
    - returns  
    Promise\<object\>  
    Chrome 95+
  - getBytesInUse  
  void

  Gets the amount of space (in bytes) being used by one or more items.


  The `getBytesInUse` function looks like:  

  ```typescript
  (keys?: string | string[]) => {...}
  ```

  <br />

    - keys  
    string \| string\[\] optional

  A single key or list of keys to get the total usage for. An empty list will return 0. Pass in `null` to get the total usage of all of storage.  
    - returns  
    Promise\<number\>  
    Chrome 95+
  - getKeys  
  void  
  Chrome 130+

  Gets all keys from storage.


  The `getKeys` function looks like:  

  ```typescript
  () => {...}
  ```

  <br />

    - returns  
    Promise\<string\[\]\>
  - remove  
  void

  Removes one or more items from storage.


  The `remove` function looks like:  

  ```typescript
  (keys: string | string[]) => {...}
  ```

  <br />

    - keys  
    string \| string\[\]

  A single key or a list of keys for items to remove.  
    - returns  
    Promise\<void\>  
    Chrome 95+
  - set  
  void

  Sets multiple items.


  The `set` function looks like:  

  ```typescript
  (items: object) => {...}
  ```

  <br />

    - items  
    object

    An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.

  Primitive values such as numbers will serialize as expected. Values with a `typeof` `"object"` and `"function"` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), `Date`, and `Regex` (serialize using their `String` representation).  
    - returns  
    Promise\<void\>  
    Chrome 95+
  - setAccessLevel  
  void  
  Chrome 102+

  Sets the desired access level for the storage area. By default, `session` storage is restricted to trusted contexts (extension pages and service workers), while `managed`, `local`, and `sync` storage allow access from both trusted and untrusted contexts.


  The `setAccessLevel` function looks like:  

  ```typescript
  (accessOptions: object) => {...}
  ```

  <br />

    - accessOptions  
    object  
      - accessLevel  
      [AccessLevel](https://developer.chrome.com/docs/extensions/reference/api/storage#type-AccessLevel)

  The access level of the storage area.  
    - returns  
Promise\<void\>  

### StorageChange

#### Properties

  - newValue  
  any optional

  The new value of the item, if there is a new value.
  - oldValue  
  any optional

  The old value of the item, if there was an old value.

## Properties

### local

Items in the `local` storage area are local to each machine.  

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage#type-StorageArea) \& object  

#### Properties

  - QUOTA_BYTES  
  10485760   

The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the `unlimitedStorage` permission. Updates that would cause this limit to be exceeded fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or a rejected Promise if using async/await.  

### managed

Items in the `managed` storage area are set by an enterprise policy configured by the domain administrator, and are read-only for the extension; trying to modify this namespace results in an error. For information on configuring a policy, see [Manifest for storage areas](https://developer.chrome.com/docs/extensions/reference/manifest/storage).  

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage#type-StorageArea)  

### session

Chrome 102+ MV3+

Items in the `session` storage area are stored in-memory and will not be persisted to disk.  

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage#type-StorageArea) \& object  

#### Properties

  - QUOTA_BYTES  
  10485760   

The maximum amount (in bytes) of data that can be stored in memory, as measured by estimating the dynamically allocated memory usage of every value and key. Updates that would cause this limit to be exceeded fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.  

### sync

Items in the `sync` storage area are synced using Chrome Sync.  

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage#type-StorageArea) \& object  

#### Properties

  - MAX_ITEMS  
  512   

  The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.
  - MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE  
  1000000   
  Deprecated

  The storage.sync API no longer has a sustained write operation quota.

  <br />

  - MAX_WRITE_OPERATIONS_PER_HOUR  
  1800   

  The maximum number of `set`, `remove`, or `clear` operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.

  Updates that would cause this limit to be exceeded fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.
  - MAX_WRITE_OPERATIONS_PER_MINUTE  
  120   

  The maximum number of `set`, `remove`, or `clear` operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.

  Updates that would cause this limit to be exceeded fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.
  - QUOTA_BYTES  
  102400   

  The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.
  - QUOTA_BYTES_PER_ITEM  
  8192   

  The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

## Events

### onChanged

```typescript
chrome.storage.onChanged.addListener(
  callback: function,
)
```

Fired when one or more items change.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (changes: object, areaName: string) => void
  ```

  <br />

    - changes  
    object
    - areaName  
    string

<br />

---

## 55. systemLog

*File: pages/systemLog.md*

# chrome.tabCapture

<br />

<br />

## Description

Use the `chrome.tabCapture` API to interact with tab media streams.

<br />

<br />

## Permissions

`tabCapture`  

<br />

<br />

<br />

## Concepts and usage

The chrome.tabCapture API lets you access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) containing video and
audio of the current tab. It can only be called after the user invokes an extension, such as by
clicking the extension's [action button](https://developer.chrome.com/docs/extensions/develop#actions). This is similar to the behavior of the
[`"activeTab"`](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission.

### Preserve system audio

When a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) is obtained for a tab, audio in that tab will no longer be played
to the user. This is similar to the behavior of the [`getDisplayMedia()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getDisplayMedia) function when
the [`suppressLocalAudioPlayback`](https://developer.mozilla.org/docs/Web/API/MediaTrackSupportedConstraints/suppressLocalAudioPlayback) flag is set to true.

To continue playing audio to the user, use the following:  

    const output = new AudioContext();
    const source = output.createMediaStreamSource(stream);
    source.connect(output.destination);

This creates a new `AudioContext` and connects the audio of the tab's `MediaStream` to the default
destination.

### Stream IDs

Calling [`chrome.tabCapture.getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId) will return a stream ID. To later
access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) from the ID, use the following:  

    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
    });

### Usage restrictions

After calling [`getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId), there are restrictions on where the
returned stream ID can be used:

- If `consumerTabId` is specified, the ID can be used by a `getUserMedia()` call in any frame in the given tab which has the same security origin.
- When this is not specified, beginning in Chrome 116, the ID can be used in any frame with the same security origin in the same render process as the caller. This means that a stream ID obtained in a service worker can be used in an [offscreen document](https://developer.chrome.com/docs/extensions/reference/api/offscreen).

Prior to Chrome 116, when a `consumerTabId` was not specified, the stream ID was restricted to both
the security origin, render process and render frame of the caller.

### Learn more

To learn more about how to use the `chrome.tabCapture` API, see
[Audio recording and screen capture](https://developer.chrome.com/docs/extensions/how-to/web-platform/screen-capture). This demonstrates how to use
`tabCapture` and related APIs to solve a number of common use cases.

<br />

## Types

### CaptureInfo

#### Properties

  - fullscreen  
  boolean

  Whether an element in the tab being captured is in fullscreen mode.
  - status  
  [TabCaptureState](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-TabCaptureState)

  The new capture status of the tab.
  - tabId  
  number

The id of the tab whose status changed.  

### CaptureOptions

#### Properties

  - audio  
  boolean optional
  - audioConstraints  
  [MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional
  - video  
  boolean optional
  - videoConstraints  
[MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional  

### GetMediaStreamOptions

Chrome 71+  

#### Properties

  - consumerTabId  
  number optional

  Optional tab id of the tab which will later invoke `getUserMedia()` to consume the stream. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches the consumber tab's origin. The tab's origin must be a secure origin, e.g. HTTPS.
  - targetTabId  
  number optional

Optional tab id of the tab which will be captured. If not specified then the current active tab will be selected. Only tabs for which the extension has been granted the `activeTab` permission can be used as the target tab.  

### MediaStreamConstraint

#### Properties

  - mandatory  
  object
  - optional  
object optional  

### TabCaptureState

#### Enum

"pending"   
"active"   
"stopped"   
"error"   

<br />

## Methods

### capture()

Foreground only

```typescript
chrome.tabCapture.capture(
  options: CaptureOptions,
  callback: function,
): void
```

Captures the visible area of the currently active tab. Capture can only be started on the currently active tab after the extension has been *invoked* , similar to the way that [activeTab](https://developer.chrome.com/docs/extensions/activeTab#invoking-activeTab) works. Capture is maintained across page navigations within the tab, and stops when the tab is closed, or the media stream is closed by the extension.  

#### Parameters

  - options  
  [CaptureOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureOptions)

  Configures the returned media stream.
  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (stream: LocalMediaStream) => void
  ```

  <br />

    - stream  
LocalMediaStream  

### getCapturedTabs()

```typescript
chrome.tabCapture.getCapturedTabs(): Promise<https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo[]>
```

Returns a list of tabs that have requested capture or are being captured, i.e. status != stopped and status != error. This allows extensions to inform the user that there is an existing tab capture that would prevent a new tab capture from succeeding (or to prevent redundant requests for the same tab).  

#### Returns

  - Promise\<[CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)\[\]\>  
Chrome 116+  

### getMediaStreamId()

Chrome 71+

```typescript
chrome.tabCapture.getMediaStreamId(
  options?: GetMediaStreamOptions,
): Promise<string>
```

Creates a stream ID to capture the target tab. Similar to chrome.tabCapture.capture() method, but returns a media stream ID, instead of a media stream, to the consumer tab.  

#### Parameters

  - options  
[GetMediaStreamOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-GetMediaStreamOptions) optional  

#### Returns

  - Promise\<string\>  
  Chrome 116+

## Events

### onStatusChanged

```typescript
chrome.tabCapture.onStatusChanged.addListener(
  callback: function,
)
```

Event fired when the capture status of a tab changes. This allows extension authors to keep track of the capture status of tabs to keep UI elements like page actions in sync.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: CaptureInfo) => void
  ```

  <br />

    - info  
    [CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)

<br />

---

## 56. tabCapture

*File: pages/tabCapture.md*

# chrome.tabCapture

<br />

<br />

## Description

Use the `chrome.tabCapture` API to interact with tab media streams.

<br />

<br />

## Permissions

`tabCapture`  

<br />

<br />

<br />

## Concepts and usage

The chrome.tabCapture API lets you access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) containing video and
audio of the current tab. It can only be called after the user invokes an extension, such as by
clicking the extension's [action button](https://developer.chrome.com/docs/extensions/develop#actions). This is similar to the behavior of the
[`"activeTab"`](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission.

### Preserve system audio

When a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) is obtained for a tab, audio in that tab will no longer be played
to the user. This is similar to the behavior of the [`getDisplayMedia()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getDisplayMedia) function when
the [`suppressLocalAudioPlayback`](https://developer.mozilla.org/docs/Web/API/MediaTrackSupportedConstraints/suppressLocalAudioPlayback) flag is set to true.

To continue playing audio to the user, use the following:  

    const output = new AudioContext();
    const source = output.createMediaStreamSource(stream);
    source.connect(output.destination);

This creates a new `AudioContext` and connects the audio of the tab's `MediaStream` to the default
destination.

### Stream IDs

Calling [`chrome.tabCapture.getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId) will return a stream ID. To later
access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) from the ID, use the following:  

    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
    });

### Usage restrictions

After calling [`getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId), there are restrictions on where the
returned stream ID can be used:

- If `consumerTabId` is specified, the ID can be used by a `getUserMedia()` call in any frame in the given tab which has the same security origin.
- When this is not specified, beginning in Chrome 116, the ID can be used in any frame with the same security origin in the same render process as the caller. This means that a stream ID obtained in a service worker can be used in an [offscreen document](https://developer.chrome.com/docs/extensions/reference/api/offscreen).

Prior to Chrome 116, when a `consumerTabId` was not specified, the stream ID was restricted to both
the security origin, render process and render frame of the caller.

### Learn more

To learn more about how to use the `chrome.tabCapture` API, see
[Audio recording and screen capture](https://developer.chrome.com/docs/extensions/how-to/web-platform/screen-capture). This demonstrates how to use
`tabCapture` and related APIs to solve a number of common use cases.

<br />

## Types

### CaptureInfo

#### Properties

  - fullscreen  
  boolean

  Whether an element in the tab being captured is in fullscreen mode.
  - status  
  [TabCaptureState](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-TabCaptureState)

  The new capture status of the tab.
  - tabId  
  number

The id of the tab whose status changed.  

### CaptureOptions

#### Properties

  - audio  
  boolean optional
  - audioConstraints  
  [MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional
  - video  
  boolean optional
  - videoConstraints  
[MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional  

### GetMediaStreamOptions

Chrome 71+  

#### Properties

  - consumerTabId  
  number optional

  Optional tab id of the tab which will later invoke `getUserMedia()` to consume the stream. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches the consumber tab's origin. The tab's origin must be a secure origin, e.g. HTTPS.
  - targetTabId  
  number optional

Optional tab id of the tab which will be captured. If not specified then the current active tab will be selected. Only tabs for which the extension has been granted the `activeTab` permission can be used as the target tab.  

### MediaStreamConstraint

#### Properties

  - mandatory  
  object
  - optional  
object optional  

### TabCaptureState

#### Enum

"pending"   
"active"   
"stopped"   
"error"   

<br />

## Methods

### capture()

Foreground only

```typescript
chrome.tabCapture.capture(
  options: CaptureOptions,
  callback: function,
): void
```

Captures the visible area of the currently active tab. Capture can only be started on the currently active tab after the extension has been *invoked* , similar to the way that [activeTab](https://developer.chrome.com/docs/extensions/activeTab#invoking-activeTab) works. Capture is maintained across page navigations within the tab, and stops when the tab is closed, or the media stream is closed by the extension.  

#### Parameters

  - options  
  [CaptureOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureOptions)

  Configures the returned media stream.
  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (stream: LocalMediaStream) => void
  ```

  <br />

    - stream  
LocalMediaStream  

### getCapturedTabs()

```typescript
chrome.tabCapture.getCapturedTabs(): Promise<https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo[]>
```

Returns a list of tabs that have requested capture or are being captured, i.e. status != stopped and status != error. This allows extensions to inform the user that there is an existing tab capture that would prevent a new tab capture from succeeding (or to prevent redundant requests for the same tab).  

#### Returns

  - Promise\<[CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)\[\]\>  
Chrome 116+  

### getMediaStreamId()

Chrome 71+

```typescript
chrome.tabCapture.getMediaStreamId(
  options?: GetMediaStreamOptions,
): Promise<string>
```

Creates a stream ID to capture the target tab. Similar to chrome.tabCapture.capture() method, but returns a media stream ID, instead of a media stream, to the consumer tab.  

#### Parameters

  - options  
[GetMediaStreamOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-GetMediaStreamOptions) optional  

#### Returns

  - Promise\<string\>  
  Chrome 116+

## Events

### onStatusChanged

```typescript
chrome.tabCapture.onStatusChanged.addListener(
  callback: function,
)
```

Event fired when the capture status of a tab changes. This allows extension authors to keep track of the capture status of tabs to keep UI elements like page actions in sync.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: CaptureInfo) => void
  ```

  <br />

    - info  
    [CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)

<br />

---

## 57. tabGroups

*File: pages/tabGroups.md*

# chrome.systemLog

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.systemLog` API to record Chrome system logs from extensions.

<br />

<br />

## Permissions

`systemLog`  

<br />

<br />

## Availability

Chrome 125+ ChromeOS only [Requires policy](https://support.google.com/chrome/a/answer/9296680)

<br />

<br />

<br />

## Types

### MessageOptions

#### Properties

  - message  
  string

## Methods

### add()

```typescript
chrome.systemLog.add(
  options: MessageOptions,
): Promise<void>
```

Adds a new log record.  

#### Parameters

  - options  
  [MessageOptions](https://developer.chrome.com/docs/extensions/reference/api/systemLog#type-MessageOptions)

The logging options.  

#### Returns

- Promise\<void\>

<br />

---

## 58. tabs

*File: pages/tabs.md*

# chrome.tabCapture

<br />

<br />

## Description

Use the `chrome.tabCapture` API to interact with tab media streams.

<br />

<br />

## Permissions

`tabCapture`  

<br />

<br />

<br />

## Concepts and usage

The chrome.tabCapture API lets you access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) containing video and
audio of the current tab. It can only be called after the user invokes an extension, such as by
clicking the extension's [action button](https://developer.chrome.com/docs/extensions/develop#actions). This is similar to the behavior of the
[`"activeTab"`](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission.

### Preserve system audio

When a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) is obtained for a tab, audio in that tab will no longer be played
to the user. This is similar to the behavior of the [`getDisplayMedia()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getDisplayMedia) function when
the [`suppressLocalAudioPlayback`](https://developer.mozilla.org/docs/Web/API/MediaTrackSupportedConstraints/suppressLocalAudioPlayback) flag is set to true.

To continue playing audio to the user, use the following:  

    const output = new AudioContext();
    const source = output.createMediaStreamSource(stream);
    source.connect(output.destination);

This creates a new `AudioContext` and connects the audio of the tab's `MediaStream` to the default
destination.

### Stream IDs

Calling [`chrome.tabCapture.getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId) will return a stream ID. To later
access a [`MediaStream`](https://developer.mozilla.org/docs/Web/API/MediaStream) from the ID, use the following:  

    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
    });

### Usage restrictions

After calling [`getMediaStreamId()`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#method-getMediaStreamId), there are restrictions on where the
returned stream ID can be used:

- If `consumerTabId` is specified, the ID can be used by a `getUserMedia()` call in any frame in the given tab which has the same security origin.
- When this is not specified, beginning in Chrome 116, the ID can be used in any frame with the same security origin in the same render process as the caller. This means that a stream ID obtained in a service worker can be used in an [offscreen document](https://developer.chrome.com/docs/extensions/reference/api/offscreen).

Prior to Chrome 116, when a `consumerTabId` was not specified, the stream ID was restricted to both
the security origin, render process and render frame of the caller.

### Learn more

To learn more about how to use the `chrome.tabCapture` API, see
[Audio recording and screen capture](https://developer.chrome.com/docs/extensions/how-to/web-platform/screen-capture). This demonstrates how to use
`tabCapture` and related APIs to solve a number of common use cases.

<br />

## Types

### CaptureInfo

#### Properties

  - fullscreen  
  boolean

  Whether an element in the tab being captured is in fullscreen mode.
  - status  
  [TabCaptureState](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-TabCaptureState)

  The new capture status of the tab.
  - tabId  
  number

The id of the tab whose status changed.  

### CaptureOptions

#### Properties

  - audio  
  boolean optional
  - audioConstraints  
  [MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional
  - video  
  boolean optional
  - videoConstraints  
[MediaStreamConstraint](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-MediaStreamConstraint) optional  

### GetMediaStreamOptions

Chrome 71+  

#### Properties

  - consumerTabId  
  number optional

  Optional tab id of the tab which will later invoke `getUserMedia()` to consume the stream. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches the consumber tab's origin. The tab's origin must be a secure origin, e.g. HTTPS.
  - targetTabId  
  number optional

Optional tab id of the tab which will be captured. If not specified then the current active tab will be selected. Only tabs for which the extension has been granted the `activeTab` permission can be used as the target tab.  

### MediaStreamConstraint

#### Properties

  - mandatory  
  object
  - optional  
object optional  

### TabCaptureState

#### Enum

"pending"   
"active"   
"stopped"   
"error"   

<br />

## Methods

### capture()

Foreground only

```typescript
chrome.tabCapture.capture(
  options: CaptureOptions,
  callback: function,
): void
```

Captures the visible area of the currently active tab. Capture can only be started on the currently active tab after the extension has been *invoked* , similar to the way that [activeTab](https://developer.chrome.com/docs/extensions/activeTab#invoking-activeTab) works. Capture is maintained across page navigations within the tab, and stops when the tab is closed, or the media stream is closed by the extension.  

#### Parameters

  - options  
  [CaptureOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureOptions)

  Configures the returned media stream.
  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (stream: LocalMediaStream) => void
  ```

  <br />

    - stream  
LocalMediaStream  

### getCapturedTabs()

```typescript
chrome.tabCapture.getCapturedTabs(): Promise<https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo[]>
```

Returns a list of tabs that have requested capture or are being captured, i.e. status != stopped and status != error. This allows extensions to inform the user that there is an existing tab capture that would prevent a new tab capture from succeeding (or to prevent redundant requests for the same tab).  

#### Returns

  - Promise\<[CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)\[\]\>  
Chrome 116+  

### getMediaStreamId()

Chrome 71+

```typescript
chrome.tabCapture.getMediaStreamId(
  options?: GetMediaStreamOptions,
): Promise<string>
```

Creates a stream ID to capture the target tab. Similar to chrome.tabCapture.capture() method, but returns a media stream ID, instead of a media stream, to the consumer tab.  

#### Parameters

  - options  
[GetMediaStreamOptions](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-GetMediaStreamOptions) optional  

#### Returns

  - Promise\<string\>  
  Chrome 116+

## Events

### onStatusChanged

```typescript
chrome.tabCapture.onStatusChanged.addListener(
  callback: function,
)
```

Event fired when the capture status of a tab changes. This allows extension authors to keep track of the capture status of tabs to keep UI elements like page actions in sync.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (info: CaptureInfo) => void
  ```

  <br />

    - info  
    [CaptureInfo](https://developer.chrome.com/docs/extensions/reference/api/tabCapture#type-CaptureInfo)

<br />

---

## 59. topSites

*File: pages/topSites.md*

# chrome.topSites

<br />

<br />

## Description

Use the `chrome.topSites` API to access the top sites (i.e. most visited sites) that are displayed on the new tab page. These do not include shortcuts customized by the user.

<br />

<br />

## Permissions

`topSites`  

<br />

<br />

<br />

You must declare the "topSites" permission in your [extension's manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use this API.  

    {
      "name": "My extension",
      ...
      "permissions": [
        "topSites",
      ],
      ...
    }

## Examples

To try this API, install the [topSites API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/topSites) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

<br />

## Types

### MostVisitedURL

An object encapsulating a most visited URL, such as the default shortcuts on the new tab page.  

#### Properties

  - title  
  string

  The title of the page
  - url  
  string

  The most visited URL.

## Methods

### get()

```typescript
chrome.topSites.get(): Promise<https://developer.chrome.com/docs/extensions/reference/api/topSites#type-MostVisitedURL[]>
```

Gets a list of top sites.  

#### Returns

  - Promise\<[MostVisitedURL](https://developer.chrome.com/docs/extensions/reference/api/topSites#type-MostVisitedURL)\[\]\>  
  Chrome 96+

<br />

---

## 60. tts

*File: pages/tts.md*

# chrome.tts

<br />

<br />

## Description

Use the `chrome.tts` API to play synthesized text-to-speech (TTS). See also the related [`ttsEngine`](https://developer.chrome.com/docs/extensions/reference/ttsEngine/) API, which allows an extension to implement a speech engine.

<br />

Chrome provides this capability on Windows (using SAPI 5), Mac OS X, and ChromeOS, using
speech synthesis capabilities provided by the operating system. On all platforms, the user can
install extensions that register themselves as alternative speech engines.

<br />

## Permissions

`tts`  

<br />

<br />

<br />

## Concepts and usage

### Generate speech

Call `speak()` from your extension to speak. For example:  

    chrome.tts.speak('Hello, world.');

To stop speaking immediately, just call `stop()`:  

    chrome.tts.stop();

You can provide options that control various properties of the speech, such as its rate, pitch, and
more. For example:  

    chrome.tts.speak('Hello, world.', {'rate': 2.0});

It's also a good idea to specify the language so that a synthesizer supporting that language (and
regional dialect, if applicable) is chosen.  

    chrome.tts.speak('Hello, world.', {'lang': 'en-US', 'rate': 2.0});

By default, each call to `speak()` interrupts any ongoing speech and speaks immediately. To
determine if a call would be interrupting anything, you can call `isSpeaking()`. In addition, you
can use the `enqueue` option to cause this utterance to be added to a queue of utterances that will
be spoken when the current utterance has finished.  

    chrome.tts.speak('Speak this first.');
    chrome.tts.speak(
        'Speak this next, when the first sentence is done.', {'enqueue': true});

A complete description of all options can be found under [`tts.speak()`](https://developer.chrome.com/docs/extensions/reference/api/tts#method-speak). Not all speech
engines will support all options.

To catch errors and make sure you're calling `speak()` correctly, pass a callback function that
takes no arguments. Inside the callback, check [`runtime.lastError`](https://developer.chrome.com/docs/extensions/reference/api/runtime#property-lastError) to see if there were any
errors.  

    chrome.tts.speak(
      utterance,
      options,
      function() {
        if (chrome.runtime.lastError) {
          console.log('Error: ' + chrome.runtime.lastError.message);
        }
      }
    );

The callback returns right away, before the engine has started generating speech. The purpose of the
callback is to alert you to syntax errors in your use of the TTS API, not to catch all possible
errors that might occur in the process of synthesizing and outputting speech. To catch these errors
too, you need to use an event listener, described in the next section.

### Listen to events

To get more real-time information about the status of synthesized speech, pass an event listener in
the options to `speak()`, like this:  

    chrome.tts.speak(
      utterance,
      {
        onEvent: function(event) {
          console.log('Event ' + event.type + ' at position ' + event.charIndex);
          if (event.type == 'error') {
            console.log('Error: ' + event.errorMessage);
          }
        }
      },
      callback
    );

Each event includes an event type, the character index of the current speech relative to the
utterance, and for error events, an optional error message. The event types are:

- `'start'`: The engine has started speaking the utterance.
- `'word'`: A word boundary was reached. Use `event.charIndex` to determine the current speech position.
- `'sentence'`: A sentence boundary was reached. Use `event.charIndex` to determine the current speech position.
- `'marker'`: An SSML marker was reached. Use `event.charIndex` to determine the current speech position.
- `'end'`: The engine has finished speaking the utterance.
- `'interrupted'`: This utterance was interrupted by another call to `speak()` or `stop()` and did not finish.
- `'cancelled'`: This utterance was queued, but then cancelled by another call to `speak()` or `stop()` and never began to speak at all.
- `'error'`: An engine-specific error occurred and this utterance cannot be spoken. Check `event.errorMessage` for details.

Four of the event types---`'end'`, `'interrupted'`, `'cancelled'`, and `'error'`---are *final*. After
one of those events is received, this utterance will no longer speak and no new events from this
utterance will be received.

Some voices may not support all event types, and some voices may not send any events at all. If you
don't want to use a voice unless it sends certain events, pass the events you require in the
`requiredEventTypes` member of the options object, or use `getVoices()` to choose a voice that meets
your requirements. Both are described in what follows.

### SSML markup

Utterances used in this API may include markup using the [Speech Synthesis Markup Language
(SSML)](https://www.w3.org/TR/speech-synthesis). If you use SSML, the first argument to `speak()` should be a complete SSML document with
an XML header and a top-level `<speak>` tag, not a document fragment.

For example:  

    chrome.tts.speak(
      '<?xml version="1.0"?>' +
      '<speak>' +
      '  The <emphasis>second</emphasis> ' +
      '  word of this sentence was emphasized.' +
      '</speak>'
    );

Not all speech engines will support all SSML tags, and some may not support SSML at all, but all
engines are required to ignore any SSML they don't support and to still speak the underlying text.

### Choose a voice

By default, Chrome chooses the most appropriate voice for each utterance you want to speak, based on
the language. On most Windows, Mac OS X, and ChromeOS systems, speech synthesis provided by the
operating system should be able to speak any text in at least one language. Some users may have a
variety of voices available, though, from their operating system and from speech engines implemented
by other Chrome extensions. In those cases, you can implement custom code to choose the appropriate
voice, or to present the user with a list of choices.

To get a list of all voices, call `getVoices()` and pass it a function that receives an array of
`TtsVoice` objects as its argument:  

    chrome.tts.getVoices(
      function(voices) {
        for (var i = 0; i < voices.length; i++) {
          console.log('Voice ' + i + ':');
          console.log('  name: ' + voices[i].voiceName);
          console.log('  lang: ' + voices[i].lang);
          console.log('  extension id: ' + voices[i].extensionId);
          console.log('  event types: ' + voices[i].eventTypes);
        }
      }
    );

<br />

## Types

### EventType

Chrome 54+  

#### Enum

"start"   
"end"   
"word"   
"sentence"   
"marker"   
"interrupted"   
"cancelled"   
"error"   
"pause"   
"resume"   

<br />

### TtsEvent

An event from the TTS engine to communicate the status of an utterance.  

#### Properties

  - charIndex  
  number optional

  The index of the current character in the utterance. For word events, the event fires at the end of one word and before the beginning of the next. The `charIndex` represents a point in the text at the beginning of the next word to be spoken.
  - errorMessage  
  string optional

  The error description, if the event type is `error`.
  - length  
  number optional  
  Chrome 74+

  The length of the next part of the utterance. For example, in a `word` event, this is the length of the word which will be spoken next. It will be set to -1 if not set by the speech engine.
  - type  
  [EventType](https://developer.chrome.com/docs/extensions/reference/api/tts#type-EventType)

The type can be `start` as soon as speech has started, `word` when a word boundary is reached, `sentence` when a sentence boundary is reached, `marker` when an SSML mark element is reached, `end` when the end of the utterance is reached, `interrupted` when the utterance is stopped or interrupted before reaching the end, `cancelled` when it's removed from the queue before ever being synthesized, or `error` when any other error occurs. When pausing speech, a `pause` event is fired if a particular utterance is paused in the middle, and `resume` if an utterance resumes speech. Note that pause and resume events may not fire if speech is paused in-between utterances.  

### TtsOptions

Chrome 77+

The speech options for the TTS engine.  

#### Properties

  - desiredEventTypes  
  string\[\] optional

  The TTS event types that you are interested in listening to. If missing, all event types may be sent.
  - enqueue  
  boolean optional

  If true, enqueues this utterance if TTS is already in progress. If false (the default), interrupts any current speech and flushes the speech queue before speaking this new utterance.
  - extensionId  
  string optional

  The extension ID of the speech engine to use, if known.
  - gender  
  [VoiceGender](https://developer.chrome.com/docs/extensions/reference/api/tts#type-VoiceGender) optional  
  Deprecated since Chrome 77

  Gender is deprecated and will be ignored.

  <br />

  Gender of voice for synthesized speech.
  - lang  
  string optional

  The language to be used for synthesis, in the form *language* -*region*. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
  - pitch  
  number optional

  Speaking pitch between 0 and 2 inclusive, with 0 being lowest and 2 being highest. 1.0 corresponds to a voice's default pitch.
  - rate  
  number optional

  Speaking rate relative to the default rate for this voice. 1.0 is the default rate, normally around 180 to 220 words per minute. 2.0 is twice as fast, and 0.5 is half as fast. Values below 0.1 or above 10.0 are strictly disallowed, but many voices will constrain the minimum and maximum rates further---for example a particular voice may not actually speak faster than 3 times normal even if you specify a value larger than 3.0.
  - requiredEventTypes  
  string\[\] optional

  The TTS event types the voice must support.
  - voiceName  
  string optional

  The name of the voice to use for synthesis. If empty, uses any available voice.
  - volume  
  number optional

  Speaking volume between 0 and 1 inclusive, with 0 being lowest and 1 being highest, with a default of 1.0.
  - onEvent  
  void optional

  This function is called with events that occur in the process of speaking the utterance.


  The `onEvent` function looks like:  

  ```typescript
  (event: TtsEvent) => {...}
  ```

  <br />

    - event  
    [TtsEvent](https://developer.chrome.com/docs/extensions/reference/api/tts#type-TtsEvent)

The update event from the text-to-speech engine indicating the status of this utterance.  

### TtsVoice

A description of a voice available for speech synthesis.  

#### Properties

  - eventTypes  
  [EventType](https://developer.chrome.com/docs/extensions/reference/api/tts#type-EventType)\[\] optional

  All of the callback event types that this voice is capable of sending.
  - extensionId  
  string optional

  The ID of the extension providing this voice.
  - gender  
  [VoiceGender](https://developer.chrome.com/docs/extensions/reference/api/tts#type-VoiceGender) optional  
  Deprecated since Chrome 70

  Gender is deprecated and will be ignored.

  <br />

  This voice's gender.
  - lang  
  string optional

  The language that this voice supports, in the form *language* -*region*. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
  - remote  
  boolean optional

  If true, the synthesis engine is a remote network resource. It may be higher latency and may incur bandwidth costs.
  - voiceName  
  string optional

The name of the voice.  

### VoiceGender

Chrome 54+ Deprecated since Chrome 70

Gender is deprecated and is ignored.

<br />

#### Enum

"male"   
"female"   

<br />

## Methods

### getVoices()

```typescript
chrome.tts.getVoices(): Promise<https://developer.chrome.com/docs/extensions/reference/api/tts#type-TtsVoice[]>
```

Gets an array of all available voices.  

#### Returns

  - Promise\<[TtsVoice](https://developer.chrome.com/docs/extensions/reference/api/tts#type-TtsVoice)\[\]\>  
Chrome 101+  

### isSpeaking()

```typescript
chrome.tts.isSpeaking(): Promise<boolean>
```

Checks whether the engine is currently speaking. On Mac OS X, the result is true whenever the system speech engine is speaking, even if the speech wasn't initiated by Chrome.  

#### Returns

  - Promise\<boolean\>  
Chrome 101+  

### pause()

```typescript
chrome.tts.pause(): void
```

Pauses speech synthesis, potentially in the middle of an utterance. A call to resume or stop will un-pause speech.  

### resume()

```typescript
chrome.tts.resume(): void
```

If speech was paused, resumes speaking where it left off.  

### speak()

```typescript
chrome.tts.speak(
  utterance: string,
  options?: TtsOptions,
): Promise<void>
```

Speaks text using a text-to-speech engine.  

#### Parameters

  - utterance  
  string

  The text to speak, either plain text or a complete, well-formed SSML document. Speech engines that do not support SSML will strip away the tags and speak the text. The maximum length of the text is 32,768 characters.
  - options  
  [TtsOptions](https://developer.chrome.com/docs/extensions/reference/api/tts#type-TtsOptions) optional

The speech options.  

#### Returns

  - Promise\<void\>  
Chrome 101+  

### stop()

```typescript
chrome.tts.stop(): void
```

Stops any current speech and flushes the queue of any pending utterances. In addition, if speech was paused, it will now be un-paused for the next call to speak.

## Events

### onVoicesChanged

Chrome 124+

```typescript
chrome.tts.onVoicesChanged.addListener(
  callback: function,
)
```

Called when the list of [`tts.TtsVoice`](https://developer.chrome.com/docs/extensions/reference/api/tts#type-TtsVoice) that would be returned by getVoices has changed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

<br />

---

## 61. ttsEngine

*File: pages/ttsEngine.md*

# chrome.ttsEngine

<br />

<br />

## Description

Use the `chrome.ttsEngine` API to implement a text-to-speech(TTS) engine using an extension. If your extension registers using this API, it will receive events containing an utterance to be spoken and other parameters when any extension or Chrome App uses the [`tts`](https://developer.chrome.com/docs/extensions/reference/tts/) API to generate speech. Your extension can then use any available web technology to synthesize and output the speech, and send events back to the calling function to report the status.

<br />

<br />

## Permissions

`ttsEngine`  

<br />

<br />

<br />

## Concepts and usage

An extension can register itself as a speech engine. By doing so, it can intercept some or all calls
to functions such as [`tts.speak()`](https://developer.chrome.com/docs/extensions/reference/api/tts#method-speak) and [`tts.stop()`](https://developer.chrome.com/docs/extensions/reference/api/tts#method-stop) and provide an alternate implementation.
Extensions are free to use any available web technology to provide speech, including streaming audio
from a server, HTML5 audio. An extension could even do something different
with the utterances, like display closed captions in a popup or send them as log messages to
a remote server.

To implement a TTS engine, an extension must declare the "ttsEngine" permission and then declare all
voices it provides in the extension manifest, like this:  

    {
      "name": "My TTS Engine",
      "version": "1.0",
      "permissions": ["ttsEngine"],
      "tts_engine": {
        "voices": [
          {
            "voice_name": "Alice",
            "lang": "en-US",
            "event_types": ["start", "marker", "end"]
          },
          {
            "voice_name": "Pat",
            "lang": "en-US",
            "event_types": ["end"]
          }
        ]
      },
      "background": {
        "page": "background.html",
        "persistent": false
      }
    }

An extension can specify any number of voices.

The `voice_name` parameter is required. The name should be descriptive enough that it identifies the
name of the voice and the engine used. In the unlikely event that two extensions register voices
with the same name, a client can specify the ID of the extension that should do the synthesis.

The `lang` parameter is optional, but highly recommended. Almost always, a voice can synthesize
speech in just a single language. When an engine supports more than one language, it can easily
register a separate voice for each language. Under rare circumstances where a single voice can
handle more than one language, it's easiest to just list two separate voices and handle them using
the same logic internally. However, if you want to create a voice that will handle utterances in any
language, leave out the `lang` parameter from your extension's manifest.

Finally, the `event_types` parameter is required if the engine can send events to update the client
on the progress of speech synthesis. At a minimum, supporting the `'end'` event type to indicate
when speech is finished is highly recommended, otherwise Chrome cannot schedule queued utterances.

Once loaded, an extension can replace the list of declared voices by calling
`chrome.ttsEngine.updateVoices`. (Note that the parameters used in the programatic call to
`updateVoices` are in camel case: e.g., `voiceName`, unlike the manifest file which uses
`voice_name`.)
| **Note:** If your TTS engine does not support the `'end'` event type, Chrome cannot queue utterances because it has no way of knowing when your utterance has finished. To help mitigate this, Chrome passes an additional boolean `enqueue` option to your engine's onSpeak handler, giving you the option of implementing your own queueing. This is discouraged because then clients are unable to queue utterances that should get spoken by different speech engines.

The possible event types that you can send correspond to the event types that the `speak()` method
receives:

- `'start'`: The engine has started speaking the utterance.
- `'word'`: A word boundary was reached. Use `event.charIndex` to determine the current speech position.
- `'sentence'`: A sentence boundary was reached. Use `event.charIndex` to determine the current speech position.
- `'marker'`: An SSML marker was reached. Use `event.charIndex` to determine the current speech position.
- `'end'`: The engine has finished speaking the utterance.
- `'error'`: An engine-specific error occurred and this utterance cannot be spoken. Pass more information in `event.errorMessage`.

The `'interrupted'` and `'cancelled'` events are not sent by the speech engine; they are generated
automatically by Chrome.

Text-to-speech clients can get the voice information from your extension's manifest by calling
[`tts.getVoices`](https://developer.chrome.com/docs/extensions/reference/api/tts#method-getVoices), assuming you've registered speech event listeners as described below.

### Handle speech events

To generate speech at the request of clients, your extension must register listeners for both
`onSpeak` and `onStop`, like this:  

    const speakListener = (utterance, options, sendTtsEvent) => {
      sendTtsEvent({type: 'start', charIndex: 0})

      // (start speaking)

      sendTtsEvent({type: 'end', charIndex: utterance.length})
    };

    const stopListener = () => {
      // (stop all speech)
    };

    chrome.ttsEngine.onSpeak.addListener(speakListener);
    chrome.ttsEngine.onStop.addListener(stopListener);

| **Caution:** If your extension does not register listeners for both `onSpeak` and `onStop`, it will not intercept any speech calls, regardless of what is in the manifest.

The decision of whether or not to send a given speech request to an extension is based solely on
whether the extension supports the given voice parameters in its manifest and has registered
listeners for `onSpeak` and `onStop`. In other words, there's no way for an extension to receive a
speech request and dynamically decide whether to handle it.

<br />

## Types

### AudioBuffer

Chrome 92+

Parameters containing an audio buffer and associated data.  

#### Properties

  - audioBuffer  
  ArrayBuffer

  The audio buffer from the text-to-speech engine. It should have length exactly audioStreamOptions.bufferSize and encoded as mono, at audioStreamOptions.sampleRate, and as linear pcm, 32-bit signed float i.e. the Float32Array type in javascript.
  - charIndex  
  number optional

  The character index associated with this audio buffer.
  - isLastBuffer  
  boolean optional

True if this audio buffer is the last for the text being spoken.  

### AudioStreamOptions

Chrome 92+

Contains the audio stream format expected to be produced by an engine.  

#### Properties

  - bufferSize  
  number

  The number of samples within an audio buffer.
  - sampleRate  
  number

The sample rate expected in an audio buffer.  

### LanguageInstallStatus

Chrome 132+

The install status of a voice.  

#### Enum

"notInstalled"   
"installing"   
"installed"   
"failed"   

<br />

### LanguageStatus

Chrome 132+

Install status of a language.  

#### Properties

  - error  
  string optional

  Detail about installation failures. Optionally populated if the language failed to install.
  - installStatus  
  [LanguageInstallStatus](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-LanguageInstallStatus)

  Installation status.
  - lang  
  string

Language string in the form of language code-region code, where the region may be omitted. Examples are en, en-AU, zh-CH.  

### LanguageUninstallOptions

Chrome 132+

Options for uninstalling a given language.  

#### Properties

  - uninstallImmediately  
  boolean

True if the TTS client wants the language to be immediately uninstalled. The engine may choose whether or when to uninstall the language, based on this parameter and the requestor information. If false, it may use other criteria, such as recent usage, to determine when to uninstall.  

### SpeakOptions

Chrome 92+

Options specified to the tts.speak() method.  

#### Properties

  - gender  
  [VoiceGender](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-VoiceGender) optional  
  Deprecated since Chrome 92

  Gender is deprecated and will be ignored.

  <br />

  Gender of voice for synthesized speech.
  - lang  
  string optional

  The language to be used for synthesis, in the form *language* -*region*. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
  - pitch  
  number optional

  Speaking pitch between 0 and 2 inclusive, with 0 being lowest and 2 being highest. 1.0 corresponds to this voice's default pitch.
  - rate  
  number optional

  Speaking rate relative to the default rate for this voice. 1.0 is the default rate, normally around 180 to 220 words per minute. 2.0 is twice as fast, and 0.5 is half as fast. This value is guaranteed to be between 0.1 and 10.0, inclusive. When a voice does not support this full range of rates, don't return an error. Instead, clip the rate to the range the voice supports.
  - voiceName  
  string optional

  The name of the voice to use for synthesis.
  - volume  
  number optional

Speaking volume between 0 and 1 inclusive, with 0 being lowest and 1 being highest, with a default of 1.0.  

### TtsClient

Chrome 131+

Identifier for the client requesting status.  

#### Properties

  - id  
  string

  Client making a language management request. For an extension, this is the unique extension ID. For Chrome features, this is the human-readable name of the feature.
  - source  
  [TtsClientSource](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-TtsClientSource)

Type of requestor.  

### TtsClientSource

Chrome 131+

Type of requestor.  

#### Enum

"chromefeature"   
"extension"   

<br />

### VoiceGender

Chrome 54+ Deprecated since Chrome 70

Gender is deprecated and will be ignored.

<br />

#### Enum

"male"   
"female"   

<br />

## Methods

### updateLanguage()

Chrome 132+

```typescript
chrome.ttsEngine.updateLanguage(
  status: LanguageStatus,
): void
```

Called by an engine when a language install is attempted, and when a language is uninstalled. Also called in response to a status request from a client. When a voice is installed or uninstalled, the engine should also call ttsEngine.updateVoices to register the voice.  

#### Parameters

  - status  
  [LanguageStatus](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-LanguageStatus)

The install status of the language.  

### updateVoices()

Chrome 66+

```typescript
chrome.ttsEngine.updateVoices(
  voices: TtsVoice[],
): void
```

Called by an engine to update its list of voices. This list overrides any voices declared in this extension's manifest.  

#### Parameters

  - voices  
  [TtsVoice](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsVoice)\[\]

  Array of [`tts.TtsVoice`](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsVoice) objects representing the available voices for speech synthesis.

## Events

### onInstallLanguageRequest

Chrome 131+

```typescript
chrome.ttsEngine.onInstallLanguageRequest.addListener(
  callback: function,
)
```

Fired when a TTS client requests to install a new language. The engine should attempt to download and install the language, and call ttsEngine.updateLanguage with the result. On success, the engine should also call ttsEngine.updateVoices to register the newly available voices.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestor: TtsClient, lang: string) => void
  ```

  <br />

    - requestor  
    [TtsClient](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-TtsClient)
    - lang  
string  

### onLanguageStatusRequest

Chrome 132+

```typescript
chrome.ttsEngine.onLanguageStatusRequest.addListener(
  callback: function,
)
```

Fired when a TTS client requests the install status of a language.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestor: TtsClient, lang: string) => void
  ```

  <br />

    - requestor  
    [TtsClient](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-TtsClient)
    - lang  
string  

### onPause

```typescript
chrome.ttsEngine.onPause.addListener(
  callback: function,
)
```

Optional: if an engine supports the pause event, it should pause the current utterance being spoken, if any, until it receives a resume event or stop event. Note that a stop event should also clear the paused state.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

### onResume

```typescript
chrome.ttsEngine.onResume.addListener(
  callback: function,
)
```

Optional: if an engine supports the pause event, it should also support the resume event, to continue speaking the current utterance, if any. Note that a stop event should also clear the paused state.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

### onSpeak

```typescript
chrome.ttsEngine.onSpeak.addListener(
  callback: function,
)
```

Called when the user makes a call to tts.speak() and one of the voices from this extension's manifest is the first to match the options object.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (utterance: string, options: SpeakOptions, sendTtsEvent: function) => void
  ```

  <br />

    - utterance  
    string
    - options  
    [SpeakOptions](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-SpeakOptions)
    - sendTtsEvent  
    function


    The `sendTtsEvent` parameter looks like:  

    ```typescript
    (event: tts.TtsEvent) => void
    ```

    <br />

      - event  
      [tts.TtsEvent](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsEvent)

The event from the text-to-speech engine indicating the status of this utterance.  

### onSpeakWithAudioStream

Chrome 92+

```typescript
chrome.ttsEngine.onSpeakWithAudioStream.addListener(
  callback: function,
)
```

Called when the user makes a call to tts.speak() and one of the voices from this extension's manifest is the first to match the options object. Differs from ttsEngine.onSpeak in that Chrome provides audio playback services and handles dispatching tts events.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (utterance: string, options: SpeakOptions, audioStreamOptions: AudioStreamOptions, sendTtsAudio: function, sendError: function) => void
  ```

  <br />

    - utterance  
    string
    - options  
    [SpeakOptions](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-SpeakOptions)
    - audioStreamOptions  
    [AudioStreamOptions](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-AudioStreamOptions)
    - sendTtsAudio  
    function


    The `sendTtsAudio` parameter looks like:  

    ```typescript
    (audioBufferParams: AudioBuffer) => void
    ```

    <br />

      - audioBufferParams  
      [AudioBuffer](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-AudioBuffer)

      Parameters containing an audio buffer and associated data.
    - sendError  
    function  
    Chrome 94+


    The `sendError` parameter looks like:  

    ```typescript
    (errorMessage?: string) => void
    ```

    <br />

      - errorMessage  
      string optional

A string describing the error.  

### onStop

```typescript
chrome.ttsEngine.onStop.addListener(
  callback: function,
)
```

Fired when a call is made to tts.stop and this extension may be in the middle of speaking. If an extension receives a call to onStop and speech is already stopped, it should do nothing (not raise an error). If speech is in the paused state, this should cancel the paused state.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

### onUninstallLanguageRequest

Chrome 132+

```typescript
chrome.ttsEngine.onUninstallLanguageRequest.addListener(
  callback: function,
)
```

Fired when a TTS client indicates a language is no longer needed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestor: TtsClient, lang: string, uninstallOptions: LanguageUninstallOptions) => void
  ```

  <br />

    - requestor  
    [TtsClient](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-TtsClient)
    - lang  
    string
    - uninstallOptions  
    [LanguageUninstallOptions](https://developer.chrome.com/docs/extensions/reference/api/ttsEngine#type-LanguageUninstallOptions)

<br />

---

## 62. types#type-ChromeSetting

*File: pages/types#type-ChromeSetting.md*

# chrome.userScripts

<br />

<br />

## Description

Use the `userScripts` API to execute user scripts in the User Scripts context.

<br />

<br />

## Permissions

`userScripts`  

<br />

To use the User Scripts API, `chrome.userScripts`, add the `"userScripts"` permission to your manifest.json and `"host_permissions"` for sites you want to run scripts on.  

    {
      "name": "User script test extension",
      "manifest_version": 3,
      "minimum_chrome_version": "120",
      "permissions": [
        "userScripts"
      ],
      "host_permissions": [
        "*://example.com/*"
      ]
    }

<br />

## Availability

Chrome 120+ MV3+

<br />

<br />

## Concepts and usage

A user script is a snippet of code injected into a web page to modify its appearance or behavior. Unlike other extension features, such as [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) and the [`chrome.scripting` API](https://developer.chrome.com/docs/extensions/reference/api/scripting), the User Scripts API lets you run arbitrary code. This API is required for extensions that run scripts provided by the user that cannot be shipped as part of your extension package.

### Enable usage of the userScripts API

After your extension receives the permission to use the userScripts API, users
must enable a specific toggle to allow your extension to use the API. The
specific toggle required, and the API's behavior when disabled, vary by Chrome
version.

Use the following check to determine which toggle the user needs to enable, for
example, during new user onboarding:  

    let version = Number(navigator.userAgent.match(/(Chrome|Chromium)\/([0-9]+)/)?.[2]);
    if (version >= 138) {
      // Allow User Scripts toggle will be used.
    } else {
      // Developer mode toggle will be used.
    }

The following sections describe the different toggles and how to enable them.

#### Chrome versions prior to 138 (Developer mode toggle)

AAs an extension developer, you already have Developer
mode enabled in your installation of Chrome. Your
users must also enable Developer mode.

You can copy and paste the following
instructions into your extension's documentation for your users

1. Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design `chrome://` URLs are not linkable.)
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.

   ![The Chrome Extensions page with Developer mode toggle highlighted](https://developer.chrome.com/static/docs/extensions/reference/api/userScripts/image/extensions-page-324e88e82e214.png)

   <br />

   <br />

   Extensions page (chrome://extensions)

   <br />

| **Note:** If Developer mode is not enabled, accessing `chrome.userScripts` shows an error. You can use this error to determine API availability, see [Check for API
| availability](https://developer.chrome.com/docs/extensions/reference/api/userScripts#check-for-api-availability).

#### Chrome versions 138 and newer (Allow User Scripts toggle)

The **Allow User Scripts** toggle is on each extension's
details page (for example, chrome://extensions/?id=YOUR_EXTENSION_ID).

You can copy and paste the following instructions
into your extension's documentation for your users:

1. Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design `chrome://` URLs are not linkable.)
2. Click the "Details" button on the extension card to view detailed information about the extension.
3. Click the toggle switch next to **Allow User Scripts**.

![The Allow User Scripts toggle on the extension details page](https://developer.chrome.com/static/docs/extensions/reference/api/userScripts/image/allow-user-scripts-toggle.png) Allow User Scripts toggle (chrome://extensions/?id=abc...) **Note:** If the **Allow User Scripts** toggle is not enabled, `chrome.userScripts` is undefined. This undefined state (similar to how other APIs behave) only resets when an extension script context reloads. For example, if a user revokes access while your service worker is running, `chrome.userScripts` remains defined. However, in this scenario, attempting to call any of its methods throws an error.

### Check for API availability

We recommend the following check to determine if the userScripts API is enabled,
as it works in all Chrome versions. This check attempts to call a
`chrome.userScripts()` method that should always succeed when the API is
available. If this call throws an error, the API is not available:  

    function isUserScriptsAvailable() {
      try {
        // Method call which throws if API permission or toggle is not enabled.
        chrome.userScripts.getScripts();
        return true;
      } catch {
        // Not available.
        return false;
      }
    }

### Work in isolated worlds

Both user and content scripts can run in an isolated world or in the main world. An isolated world is an execution environment that isn't accessible to a host page or other extensions. This lets a user script change its JavaScript environment without affecting the host page or other extensions' user and content scripts. Conversely, user scripts (and content scripts) are not visible to the host page or the user and content scripts of other extensions. Scripts running in the main world are accessible to host pages and other extensions and are visible to host pages and to other extensions. To select the world, pass `"USER_SCRIPT"` or `"MAIN"` when calling [`userScripts.register()`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-register).

To configure a [content security policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) for the `USER_SCRIPT` world, call `userScripts.configureWorld()`:  

    chrome.userScripts.configureWorld({
      csp: "script-src 'self'"
    });

### Messaging

Like content scripts and offscreen documents, user scripts communicate with other parts of an extension using [messaging](https://developer.chrome.com/docs/extensions/mv3/messaging) (meaning they can call `runtime.sendMessage()` and `runtime.connect()` as any other part of an extension would). However, they're received using dedicated event handlers (meaning, they don't use `onMessage` or `onConnect`). These handlers are called [`runtime.onUserScriptMessage`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onUserScriptMessage) and [`runtime.onUserScriptConnect`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onUserScriptConnect). Dedicated handlers make it easier to identify messages from user scripts, which are a less-trusted context.

Before sending a message, you must call [`configureWorld()`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-configureWorld) with the `messaging` argument set to `true`. Note that both the `csp` and `messaging` arguments can be passed at the same time.  

    chrome.userScripts.configureWorld({
      messaging: true
    });

### Extension updates

User scripts are cleared when an extension updates. You can add them back by running code in the [`runtime.onInstalled`](https://developer.chrome.com/docs/extensions/reference/runtime#event-onInstalled) event handler in the extension service worker. Respond only to the [`"update"` reason](https://developer.chrome.com/docs/extensions/reference/api/runtime#type-OnInstalledReason:%7E:text=as%20an%20installation.-,%22update%22,-Specifies%20the%20event) passed to the event callback.

## Example

This example is from the [userScript sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/userScripts) in our samples repository.

### Register a script

The following example shows a basic call to `register()`. The first argument is an array of objects defining the scripts to be registered. There are more options than are shown here.  

    chrome.userScripts.register([{
      id: 'test',
      matches: ['*://*/*'],
      js: [{code: 'alert("Hi!")'}]
    }]);

<br />

## Types

### ExecutionWorld

The JavaScript world for a user script to execute within.  

#### Enum

"MAIN"   
Specifies the execution environment of the DOM, which is the execution environment shared with the host page's JavaScript.
"USER_SCRIPT"   
Specifies the execution environment that is specific to user scripts and is exempt from the page's CSP.

<br />

### InjectionResult

Chrome 135+  

#### Properties

  - documentId  
  string

  The document associated with the injection.
  - error  
  string optional

  The error, if any. `error` and `result` are mutually exclusive.
  - frameId  
  number

  The frame associated with the injection.
  - result  
  any optional

The result of the script execution.  

### InjectionTarget

Chrome 135+  

#### Properties

  - allFrames  
  boolean optional

  Whether the script should inject into all frames within the tab. Defaults to false. This must not be true if `frameIds` is specified.
  - documentIds  
  string\[\] optional

  The IDs of specific documentIds to inject into. This must not be set if `frameIds` is set.
  - frameIds  
  number\[\] optional

  The IDs of specific frames to inject into.
  - tabId  
  number

The ID of the tab into which to inject.  

### RegisteredUserScript

#### Properties

  - allFrames  
  boolean optional

  If true, it will inject into all frames, even if the frame is not the top-most frame in the tab. Each frame is checked independently for URL requirements; it will not inject into child frames if the URL requirements are not met. Defaults to false, meaning that only the top frame is matched.
  - excludeGlobs  
  string\[\] optional

  Specifies wildcard patterns for pages this user script will NOT be injected into.
  - excludeMatches  
  string\[\] optional

  Excludes pages that this user script would otherwise be injected into. See [Match Patterns](https://developer.chrome.com/extensions/develop/concepts/match-patterns) for more details on the syntax of these strings.
  - id  
  string

  The ID of the user script specified in the API call. This property must not start with a '_' as it's reserved as a prefix for generated script IDs.
  - includeGlobs  
  string\[\] optional

  Specifies wildcard patterns for pages this user script will be injected into.
  - js  
  [ScriptSource](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ScriptSource)\[\] optional

  The list of ScriptSource objects defining sources of scripts to be injected into matching pages. This property must be specified for ${ref:register}, and when specified it must be a non-empty array.
  - matches  
  string\[\] optional

  Specifies which pages this user script will be injected into. See [Match Patterns](https://developer.chrome.com/extensions/develop/concepts/match-patterns) for more details on the syntax of these strings. This property must be specified for ${ref:register}.
  - runAt  
  [RunAt](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-RunAt) optional

  Specifies when JavaScript files are injected into the web page. The preferred and default value is `document_idle`.
  - world  
  [ExecutionWorld](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ExecutionWorld) optional

  The JavaScript execution environment to run the script in. The default is ```USER_SCRIPT```.
  - worldId  
  string optional  
  Chrome 133+

Specifies the user script world ID to execute in. If omitted, the script will execute in the default user script world. Only valid if `world` is omitted or is `USER_SCRIPT`. Values with leading underscores (`_`) are reserved.  

### ScriptSource

#### Properties

  - code  
  string optional

  A string containing the JavaScript code to inject. Exactly one of `file` or `code` must be specified.
  - file  
  string optional

The path of the JavaScript file to inject relative to the extension's root directory. Exactly one of `file` or `code` must be specified.  

### UserScriptFilter

#### Properties

  - ids  
  string\[\] optional

[`getScripts`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-getScripts) only returns scripts with the IDs specified in this list.  

### UserScriptInjection

Chrome 135+  

#### Properties

  - injectImmediately  
  boolean optional

  Whether the injection should be triggered in the target as soon as possible. Note that this is not a guarantee that injection will occur prior to page load, as the page may have already loaded by the time the script reaches the target.
  - js  
  [ScriptSource](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ScriptSource)\[\]

  The list of ScriptSource objects defining sources of scripts to be injected into the target.
  - target  
  [InjectionTarget](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionTarget)

  Details specifying the target into which to inject the script.
  - world  
  [ExecutionWorld](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ExecutionWorld) optional

  The JavaScript "world" to run the script in. The default is `USER_SCRIPT`.
  - worldId  
  string optional

Specifies the user script world ID to execute in. If omitted, the script will execute in the default user script world. Only valid if `world` is omitted or is `USER_SCRIPT`. Values with leading underscores (`_`) are reserved.  

### WorldProperties

#### Properties

  - csp  
  string optional

  Specifies the world csp. The default is the ```ISOLATED``` world csp.
  - messaging  
  boolean optional

  Specifies whether messaging APIs are exposed. The default is `false`.
  - worldId  
  string optional  
  Chrome 133+

  Specifies the ID of the specific user script world to update. If not provided, updates the properties of the default user script world. Values with leading underscores (`_`) are reserved.

## Methods

### configureWorld()

```typescript
chrome.userScripts.configureWorld(
  properties: WorldProperties,
): Promise<void>
```

Configures the ```USER_SCRIPT``` execution environment.  

#### Parameters

  - properties  
  [WorldProperties](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties)

Contains the user script world configuration.  

#### Returns

- Promise\<void\>  

### execute()

Chrome 135+

```typescript
chrome.userScripts.execute(
  injection: UserScriptInjection,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionResult[]>
```

Injects a script into a target context. By default, the script will be run at `document_idle`, or immediately if the page has already loaded. If the `injectImmediately` property is set, the script will inject without waiting, even if the page has not finished loading. If the script evaluates to a promise, the browser will wait for the promise to settle and return the resulting value.  

#### Parameters

  - injection  
[UserScriptInjection](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptInjection)  

#### Returns

- Promise\<[InjectionResult](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionResult)\[\]\>  

### getScripts()

```typescript
chrome.userScripts.getScripts(
  filter?: UserScriptFilter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript[]>
```

Returns all dynamically-registered user scripts for this extension.  

#### Parameters

  - filter  
  [UserScriptFilter](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptFilter) optional

If specified, this method returns only the user scripts that match it.  

#### Returns

- Promise\<[RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]\>  

### getWorldConfigurations()

Chrome 133+

```typescript
chrome.userScripts.getWorldConfigurations(): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties[]>
```

Retrieves all registered world configurations.  

#### Returns

- Promise\<[WorldProperties](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties)\[\]\>  

### register()

```typescript
chrome.userScripts.register(
  scripts: RegisteredUserScript[],
): Promise<void>
```

Registers one or more user scripts for this extension.  

#### Parameters

  - scripts  
  [RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]

Contains a list of user scripts to be registered.  

#### Returns

- Promise\<void\>  

### resetWorldConfiguration()

Chrome 133+

```typescript
chrome.userScripts.resetWorldConfiguration(
  worldId?: string,
): Promise<void>
```

Resets the configuration for a user script world. Any scripts that inject into the world with the specified ID will use the default world configuration.  

#### Parameters

  - worldId  
  string optional

The ID of the user script world to reset. If omitted, resets the default world's configuration.  

#### Returns

- Promise\<void\>  

### unregister()

```typescript
chrome.userScripts.unregister(
  filter?: UserScriptFilter,
): Promise<void>
```

Unregisters all dynamically-registered user scripts for this extension.  

#### Parameters

  - filter  
  [UserScriptFilter](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptFilter) optional

If specified, this method unregisters only the user scripts that match it.  

#### Returns

- Promise\<void\>  

### update()

```typescript
chrome.userScripts.update(
  scripts: RegisteredUserScript[],
): Promise<void>
```

Updates one or more user scripts for this extension.  

#### Parameters

  - scripts  
  [RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]

Contains a list of user scripts to be updated. A property is only updated for the existing script if it is specified in this object. If there are errors during script parsing/file validation, or if the IDs specified do not correspond to a fully registered script, then no scripts are updated.  

#### Returns

- Promise\<void\>

<br />

---

## 63. types

*File: pages/types.md*

# chrome.types

<br />

<br />

## Description

The `chrome.types` API contains type declarations for Chrome.

<br />

<br />

<br />

<br />

## Chrome settings

The [`ChromeSetting`](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting) type provides a common set of functions (`get()`, `set()`, and `clear()`)
as well as an event publisher (`onChange`) for settings of the Chrome browser. The [proxy settings
examples](https://developer.chrome.com/docs/extensions/reference/api/proxy#examples) demonstrate how these functions are intended to be used.

### Scope and lifecycle

Chrome distinguishes between three different scopes of browser settings:

`regular`
:   Settings set in the `regular` scope apply to regular browser windows and are inherited by incognito
    windows if they are not overwritten. These settings are stored to disk and remain in place until
    they are cleared by the governing extension, or the governing extension is disabled or uninstalled.

`incognito_persistent`
:   Settings set in the `incognito_persistent` scope apply only to incognito windows. For these, they
    override `regular` settings. These settings are stored to disk and remain in place until they are
    cleared by the governing extension, or the governing extension is disabled or uninstalled.

`incognito_session_only`
:   Settings set in the `incognito_session_only` scope apply only to incognito windows. For these, they
    override `regular` and `incognito_persistent` settings. These settings are not stored to disk and
    are cleared when the last incognito window is closed. They can only be set when at least one
    incognito window is open.

### Precedence

Chrome manages settings on different layers. The following list describes the layers that may
influence the effective settings, in increasing order of precedence.

1. System settings provided by the operating system
2. Command-line parameters
3. Settings provided by extensions
4. Policies

As the list implies, policies might overrule any changes that you specify with your extension. You
can use the `get()` function to determine whether your extension is capable of providing a setting
or whether this setting would be overridden.

As discussed previously, Chrome allows using different settings for regular windows and incognito
windows. The following example illustrates the behavior. Assume that no policy overrides the
settings and that an extension can set settings for regular windows **(R)** and settings for
incognito windows **(I)**.

- If only **(R)** is set, these settings are effective for both regular and incognito windows.
- If only **(I)** is set, these settings are effective for only incognito windows. Regular windows use the settings determined by the lower layers (command-line options and system settings).
- If both **(R)** and **(I)** are set, the respective settings are used for regular and incognito windows.

If two or more extensions want to set the same setting to different values, the extension installed
most recently takes precedence over the other extensions. If the most recently installed extension
sets only **(I)**, the settings of regular windows can be defined by previously installed
extensions.

The *effective* value of a setting is the one that results from considering the precedence rules. It
is used by Chrome.

<br />

## Types

### ChromeSetting

An interface that allows access to a Chrome browser setting. See [`accessibilityFeatures`](https://developer.chrome.com/docs/extensions/reference/accessibilityFeatures/) for an example.  

#### Properties

  - onChange  
  Event\<functionvoidvoid\>

  Fired after the setting changes.


  The `onChange.addListener` function looks like:  

  ```typescript
  (callback: function) => {...}
  ```

  <br />

    - callback  
    function


    The `callback` parameter looks like:  

    ```typescript
    (details: object) => void
    ```

    <br />

      - details  
      object  
        - incognitoSpecific  
        boolean optional

        Whether the value that has changed is specific to the incognito session.
        This property will *only* be present if the user has enabled the extension in incognito mode.
        - levelOfControl  
        [LevelOfControl](https://developer.chrome.com/docs/extensions/reference/api/types#type-LevelOfControl)

        The level of control of the setting.
        - value  
        T

        The value of the setting after the change.
  - clear  
  void

  Clears the setting, restoring any default value.


  The `clear` function looks like:  

  ```typescript
  (details: object) => {...}
  ```

  <br />

    - details  
    object

    Which setting to clear.  
      - scope  
      [ChromeSettingScope](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSettingScope) optional

  Where to clear the setting (default: regular).  
    - returns  
    Promise\<void\>  
    Chrome 96+
  - get  
  void

  Gets the value of a setting.


  The `get` function looks like:  

  ```typescript
  (details: object) => {...}
  ```

  <br />

    - details  
    object

    Which setting to consider.  
      - incognito  
      boolean optional

  Whether to return the value that applies to the incognito session (default false).  
    - returns  
    Promise\<object\>  
    Chrome 96+
  - set  
  void

  Sets the value of a setting.


  The `set` function looks like:  

  ```typescript
  (details: object) => {...}
  ```

  <br />

    - details  
    object

    Which setting to change.  
      - scope  
      [ChromeSettingScope](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSettingScope) optional

      Where to set the setting (default: regular).
      - value  
      T

      The value of the setting.
  Note that every setting has a specific value type, which is described together with the setting. An extension should *not* set a value of a different type.  
    - returns  
    Promise\<void\>  
Chrome 96+  

### ChromeSettingScope

Chrome 44+

The scope of the ChromeSetting. One of

- `regular`: setting for the regular profile (which is inherited by the incognito profile if not overridden elsewhere),
- `regular\_only`: setting for the regular profile only (not inherited by the incognito profile),
- `incognito\_persistent`: setting for the incognito profile that survives browser restarts (overrides regular preferences),
- `incognito\_session\_only`: setting for the incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular and incognito_persistent preferences).  

#### Enum

"regular"   
"regular_only"   
"incognito_persistent"   
"incognito_session_only"   

<br />

### LevelOfControl

Chrome 44+

One of

- `not\_controllable`: cannot be controlled by any extension
- `controlled\_by\_other\_extensions`: controlled by extensions with higher precedence
- `controllable\_by\_this\_extension`: can be controlled by this extension
- `controlled\_by\_this\_extension`: controlled by this extension  

#### Enum

"not_controllable"   
"controlled_by_other_extensions"   
"controllable_by_this_extension"   
"controlled_by_this_extension"   

<br />

<br />

---

## 64. userScripts

*File: pages/userScripts.md*

# chrome.userScripts

<br />

<br />

## Description

Use the `userScripts` API to execute user scripts in the User Scripts context.

<br />

<br />

## Permissions

`userScripts`  

<br />

To use the User Scripts API, `chrome.userScripts`, add the `"userScripts"` permission to your manifest.json and `"host_permissions"` for sites you want to run scripts on.  

    {
      "name": "User script test extension",
      "manifest_version": 3,
      "minimum_chrome_version": "120",
      "permissions": [
        "userScripts"
      ],
      "host_permissions": [
        "*://example.com/*"
      ]
    }

<br />

## Availability

Chrome 120+ MV3+

<br />

<br />

## Concepts and usage

A user script is a snippet of code injected into a web page to modify its appearance or behavior. Unlike other extension features, such as [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) and the [`chrome.scripting` API](https://developer.chrome.com/docs/extensions/reference/api/scripting), the User Scripts API lets you run arbitrary code. This API is required for extensions that run scripts provided by the user that cannot be shipped as part of your extension package.

### Enable usage of the userScripts API

After your extension receives the permission to use the userScripts API, users
must enable a specific toggle to allow your extension to use the API. The
specific toggle required, and the API's behavior when disabled, vary by Chrome
version.

Use the following check to determine which toggle the user needs to enable, for
example, during new user onboarding:  

    let version = Number(navigator.userAgent.match(/(Chrome|Chromium)\/([0-9]+)/)?.[2]);
    if (version >= 138) {
      // Allow User Scripts toggle will be used.
    } else {
      // Developer mode toggle will be used.
    }

The following sections describe the different toggles and how to enable them.

#### Chrome versions prior to 138 (Developer mode toggle)

AAs an extension developer, you already have Developer
mode enabled in your installation of Chrome. Your
users must also enable Developer mode.

You can copy and paste the following
instructions into your extension's documentation for your users

1. Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design `chrome://` URLs are not linkable.)
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.

   ![The Chrome Extensions page with Developer mode toggle highlighted](https://developer.chrome.com/static/docs/extensions/reference/api/userScripts/image/extensions-page-324e88e82e214.png)

   <br />

   <br />

   Extensions page (chrome://extensions)

   <br />

| **Note:** If Developer mode is not enabled, accessing `chrome.userScripts` shows an error. You can use this error to determine API availability, see [Check for API
| availability](https://developer.chrome.com/docs/extensions/reference/api/userScripts#check-for-api-availability).

#### Chrome versions 138 and newer (Allow User Scripts toggle)

The **Allow User Scripts** toggle is on each extension's
details page (for example, chrome://extensions/?id=YOUR_EXTENSION_ID).

You can copy and paste the following instructions
into your extension's documentation for your users:

1. Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design `chrome://` URLs are not linkable.)
2. Click the "Details" button on the extension card to view detailed information about the extension.
3. Click the toggle switch next to **Allow User Scripts**.

![The Allow User Scripts toggle on the extension details page](https://developer.chrome.com/static/docs/extensions/reference/api/userScripts/image/allow-user-scripts-toggle.png) Allow User Scripts toggle (chrome://extensions/?id=abc...) **Note:** If the **Allow User Scripts** toggle is not enabled, `chrome.userScripts` is undefined. This undefined state (similar to how other APIs behave) only resets when an extension script context reloads. For example, if a user revokes access while your service worker is running, `chrome.userScripts` remains defined. However, in this scenario, attempting to call any of its methods throws an error.

### Check for API availability

We recommend the following check to determine if the userScripts API is enabled,
as it works in all Chrome versions. This check attempts to call a
`chrome.userScripts()` method that should always succeed when the API is
available. If this call throws an error, the API is not available:  

    function isUserScriptsAvailable() {
      try {
        // Method call which throws if API permission or toggle is not enabled.
        chrome.userScripts.getScripts();
        return true;
      } catch {
        // Not available.
        return false;
      }
    }

### Work in isolated worlds

Both user and content scripts can run in an isolated world or in the main world. An isolated world is an execution environment that isn't accessible to a host page or other extensions. This lets a user script change its JavaScript environment without affecting the host page or other extensions' user and content scripts. Conversely, user scripts (and content scripts) are not visible to the host page or the user and content scripts of other extensions. Scripts running in the main world are accessible to host pages and other extensions and are visible to host pages and to other extensions. To select the world, pass `"USER_SCRIPT"` or `"MAIN"` when calling [`userScripts.register()`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-register).

To configure a [content security policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) for the `USER_SCRIPT` world, call `userScripts.configureWorld()`:  

    chrome.userScripts.configureWorld({
      csp: "script-src 'self'"
    });

### Messaging

Like content scripts and offscreen documents, user scripts communicate with other parts of an extension using [messaging](https://developer.chrome.com/docs/extensions/mv3/messaging) (meaning they can call `runtime.sendMessage()` and `runtime.connect()` as any other part of an extension would). However, they're received using dedicated event handlers (meaning, they don't use `onMessage` or `onConnect`). These handlers are called [`runtime.onUserScriptMessage`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onUserScriptMessage) and [`runtime.onUserScriptConnect`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onUserScriptConnect). Dedicated handlers make it easier to identify messages from user scripts, which are a less-trusted context.

Before sending a message, you must call [`configureWorld()`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-configureWorld) with the `messaging` argument set to `true`. Note that both the `csp` and `messaging` arguments can be passed at the same time.  

    chrome.userScripts.configureWorld({
      messaging: true
    });

### Extension updates

User scripts are cleared when an extension updates. You can add them back by running code in the [`runtime.onInstalled`](https://developer.chrome.com/docs/extensions/reference/runtime#event-onInstalled) event handler in the extension service worker. Respond only to the [`"update"` reason](https://developer.chrome.com/docs/extensions/reference/api/runtime#type-OnInstalledReason:%7E:text=as%20an%20installation.-,%22update%22,-Specifies%20the%20event) passed to the event callback.

## Example

This example is from the [userScript sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/userScripts) in our samples repository.

### Register a script

The following example shows a basic call to `register()`. The first argument is an array of objects defining the scripts to be registered. There are more options than are shown here.  

    chrome.userScripts.register([{
      id: 'test',
      matches: ['*://*/*'],
      js: [{code: 'alert("Hi!")'}]
    }]);

<br />

## Types

### ExecutionWorld

The JavaScript world for a user script to execute within.  

#### Enum

"MAIN"   
Specifies the execution environment of the DOM, which is the execution environment shared with the host page's JavaScript.
"USER_SCRIPT"   
Specifies the execution environment that is specific to user scripts and is exempt from the page's CSP.

<br />

### InjectionResult

Chrome 135+  

#### Properties

  - documentId  
  string

  The document associated with the injection.
  - error  
  string optional

  The error, if any. `error` and `result` are mutually exclusive.
  - frameId  
  number

  The frame associated with the injection.
  - result  
  any optional

The result of the script execution.  

### InjectionTarget

Chrome 135+  

#### Properties

  - allFrames  
  boolean optional

  Whether the script should inject into all frames within the tab. Defaults to false. This must not be true if `frameIds` is specified.
  - documentIds  
  string\[\] optional

  The IDs of specific documentIds to inject into. This must not be set if `frameIds` is set.
  - frameIds  
  number\[\] optional

  The IDs of specific frames to inject into.
  - tabId  
  number

The ID of the tab into which to inject.  

### RegisteredUserScript

#### Properties

  - allFrames  
  boolean optional

  If true, it will inject into all frames, even if the frame is not the top-most frame in the tab. Each frame is checked independently for URL requirements; it will not inject into child frames if the URL requirements are not met. Defaults to false, meaning that only the top frame is matched.
  - excludeGlobs  
  string\[\] optional

  Specifies wildcard patterns for pages this user script will NOT be injected into.
  - excludeMatches  
  string\[\] optional

  Excludes pages that this user script would otherwise be injected into. See [Match Patterns](https://developer.chrome.com/extensions/develop/concepts/match-patterns) for more details on the syntax of these strings.
  - id  
  string

  The ID of the user script specified in the API call. This property must not start with a '_' as it's reserved as a prefix for generated script IDs.
  - includeGlobs  
  string\[\] optional

  Specifies wildcard patterns for pages this user script will be injected into.
  - js  
  [ScriptSource](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ScriptSource)\[\] optional

  The list of ScriptSource objects defining sources of scripts to be injected into matching pages. This property must be specified for ${ref:register}, and when specified it must be a non-empty array.
  - matches  
  string\[\] optional

  Specifies which pages this user script will be injected into. See [Match Patterns](https://developer.chrome.com/extensions/develop/concepts/match-patterns) for more details on the syntax of these strings. This property must be specified for ${ref:register}.
  - runAt  
  [RunAt](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-RunAt) optional

  Specifies when JavaScript files are injected into the web page. The preferred and default value is `document_idle`.
  - world  
  [ExecutionWorld](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ExecutionWorld) optional

  The JavaScript execution environment to run the script in. The default is ```USER_SCRIPT```.
  - worldId  
  string optional  
  Chrome 133+

Specifies the user script world ID to execute in. If omitted, the script will execute in the default user script world. Only valid if `world` is omitted or is `USER_SCRIPT`. Values with leading underscores (`_`) are reserved.  

### ScriptSource

#### Properties

  - code  
  string optional

  A string containing the JavaScript code to inject. Exactly one of `file` or `code` must be specified.
  - file  
  string optional

The path of the JavaScript file to inject relative to the extension's root directory. Exactly one of `file` or `code` must be specified.  

### UserScriptFilter

#### Properties

  - ids  
  string\[\] optional

[`getScripts`](https://developer.chrome.com/docs/extensions/reference/api/userScripts#method-getScripts) only returns scripts with the IDs specified in this list.  

### UserScriptInjection

Chrome 135+  

#### Properties

  - injectImmediately  
  boolean optional

  Whether the injection should be triggered in the target as soon as possible. Note that this is not a guarantee that injection will occur prior to page load, as the page may have already loaded by the time the script reaches the target.
  - js  
  [ScriptSource](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ScriptSource)\[\]

  The list of ScriptSource objects defining sources of scripts to be injected into the target.
  - target  
  [InjectionTarget](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionTarget)

  Details specifying the target into which to inject the script.
  - world  
  [ExecutionWorld](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-ExecutionWorld) optional

  The JavaScript "world" to run the script in. The default is `USER_SCRIPT`.
  - worldId  
  string optional

Specifies the user script world ID to execute in. If omitted, the script will execute in the default user script world. Only valid if `world` is omitted or is `USER_SCRIPT`. Values with leading underscores (`_`) are reserved.  

### WorldProperties

#### Properties

  - csp  
  string optional

  Specifies the world csp. The default is the ```ISOLATED``` world csp.
  - messaging  
  boolean optional

  Specifies whether messaging APIs are exposed. The default is `false`.
  - worldId  
  string optional  
  Chrome 133+

  Specifies the ID of the specific user script world to update. If not provided, updates the properties of the default user script world. Values with leading underscores (`_`) are reserved.

## Methods

### configureWorld()

```typescript
chrome.userScripts.configureWorld(
  properties: WorldProperties,
): Promise<void>
```

Configures the ```USER_SCRIPT``` execution environment.  

#### Parameters

  - properties  
  [WorldProperties](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties)

Contains the user script world configuration.  

#### Returns

- Promise\<void\>  

### execute()

Chrome 135+

```typescript
chrome.userScripts.execute(
  injection: UserScriptInjection,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionResult[]>
```

Injects a script into a target context. By default, the script will be run at `document_idle`, or immediately if the page has already loaded. If the `injectImmediately` property is set, the script will inject without waiting, even if the page has not finished loading. If the script evaluates to a promise, the browser will wait for the promise to settle and return the resulting value.  

#### Parameters

  - injection  
[UserScriptInjection](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptInjection)  

#### Returns

- Promise\<[InjectionResult](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-InjectionResult)\[\]\>  

### getScripts()

```typescript
chrome.userScripts.getScripts(
  filter?: UserScriptFilter,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript[]>
```

Returns all dynamically-registered user scripts for this extension.  

#### Parameters

  - filter  
  [UserScriptFilter](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptFilter) optional

If specified, this method returns only the user scripts that match it.  

#### Returns

- Promise\<[RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]\>  

### getWorldConfigurations()

Chrome 133+

```typescript
chrome.userScripts.getWorldConfigurations(): Promise<https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties[]>
```

Retrieves all registered world configurations.  

#### Returns

- Promise\<[WorldProperties](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-WorldProperties)\[\]\>  

### register()

```typescript
chrome.userScripts.register(
  scripts: RegisteredUserScript[],
): Promise<void>
```

Registers one or more user scripts for this extension.  

#### Parameters

  - scripts  
  [RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]

Contains a list of user scripts to be registered.  

#### Returns

- Promise\<void\>  

### resetWorldConfiguration()

Chrome 133+

```typescript
chrome.userScripts.resetWorldConfiguration(
  worldId?: string,
): Promise<void>
```

Resets the configuration for a user script world. Any scripts that inject into the world with the specified ID will use the default world configuration.  

#### Parameters

  - worldId  
  string optional

The ID of the user script world to reset. If omitted, resets the default world's configuration.  

#### Returns

- Promise\<void\>  

### unregister()

```typescript
chrome.userScripts.unregister(
  filter?: UserScriptFilter,
): Promise<void>
```

Unregisters all dynamically-registered user scripts for this extension.  

#### Parameters

  - filter  
  [UserScriptFilter](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-UserScriptFilter) optional

If specified, this method unregisters only the user scripts that match it.  

#### Returns

- Promise\<void\>  

### update()

```typescript
chrome.userScripts.update(
  scripts: RegisteredUserScript[],
): Promise<void>
```

Updates one or more user scripts for this extension.  

#### Parameters

  - scripts  
  [RegisteredUserScript](https://developer.chrome.com/docs/extensions/reference/api/userScripts#type-RegisteredUserScript)\[\]

Contains a list of user scripts to be updated. A property is only updated for the existing script if it is specified in this object. If there are errors during script parsing/file validation, or if the IDs specified do not correspond to a fully registered script, then no scripts are updated.  

#### Returns

- Promise\<void\>

<br />

---

## 65. vpnProvider

*File: pages/vpnProvider.md*

# chrome.vpnProvider

<br />

| **Important:** This API works **only on ChromeOS**.

<br />

<br />

## Description

Use the `chrome.vpnProvider` API to implement a VPN client.

<br />

<br />

## Permissions

`vpnProvider`  

<br />

<br />

## Availability

Chrome 43+ ChromeOS only

<br />

<br />

## Concepts and usage

Typical usage of `chrome.vpnProvider` is as follows:

- Create VPN configurations by calling [`createConfig()`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#method-createConfig). A VPN configuration is a persistent entry shown to the user in a ChromeOS UI. The user can select a VPN configuration from a list and connect to it or disconnect from it.

- Add listeners to the [`onPlatformMessage`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onPlatformMessage), [`onPacketReceived`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onPacketReceived), and [`onConfigRemoved`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onConfigRemoved) events.

- When the user connects to the VPN configuration, [`onPlatformMessage`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onPlatformMessage) will be received with the message `"connected"`. The period between the `"connected"` and `"disconnected"` messages is called a "VPN session". In this time period, the extension that receives the message is said to own the VPN session.

- Initiate connection to the VPN server and start the VPN client.

- Set the Parameters of the connection by calling [`setParameters()`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#method-setParameters).

- Notify the connection state as `"connected"` by calling [`notifyConnectionStateChanged()`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#method-notifyConnectionStateChanged).

- When the steps previous are completed without errors, a virtual tunnel is created to the network stack of ChromeOS. IP packets can be sent through the tunnel by calling [`sendPacket()`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#method-sendPacket) and any packets originating on the ChromeOS device will be received using the [`onPacketReceived`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onPacketReceived) event handler.

- When the user disconnects from the VPN configuration, [`onPlatformMessage`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#event-onPlatformMessage) will be fired with the message `"disconnected"`.

- If the VPN configuration is no longer necessary, it can be destroyed by calling [`destroyConfig()`](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#method-destroyConfig).

<br />

## Types

### Parameters

#### Properties

  - address  
  string

  IP address for the VPN interface in CIDR notation. IPv4 is currently the only supported mode.
  - broadcastAddress  
  string optional

  Broadcast address for the VPN interface. (default: deduced from IP address and mask)
  - dnsServers  
  string\[\]

  A list of IPs for the DNS servers.
  - domainSearch  
  string\[\] optional

  A list of search domains. (default: no search domain)
  - exclusionList  
  string\[\]

  Exclude network traffic to the list of IP blocks in CIDR notation from the tunnel. This can be used to bypass traffic to and from the VPN server. When many rules match a destination, the rule with the longest matching prefix wins. Entries that correspond to the same CIDR block are treated as duplicates. Such duplicates in the collated (exclusionList + inclusionList) list are eliminated and the exact duplicate entry that will be eliminated is undefined.
  - inclusionList  
  string\[\]

  Include network traffic to the list of IP blocks in CIDR notation to the tunnel. This parameter can be used to set up a split tunnel. By default no traffic is directed to the tunnel. Adding the entry "0.0.0.0/0" to this list gets all the user traffic redirected to the tunnel. When many rules match a destination, the rule with the longest matching prefix wins. Entries that correspond to the same CIDR block are treated as duplicates. Such duplicates in the collated (exclusionList + inclusionList) list are eliminated and the exact duplicate entry that will be eliminated is undefined.
  - mtu  
  string optional

  MTU setting for the VPN interface. (default: 1500 bytes)
  - reconnect  
  string optional  
  Chrome 51+

  Whether or not the VPN extension implements auto-reconnection.

  If true, the `linkDown`, `linkUp`, `linkChanged`, `suspend`, and `resume` platform messages will be used to signal the respective events. If false, the system will forcibly disconnect the VPN if the network topology changes, and the user will need to reconnect manually. (default: false)

This property is new in Chrome 51; it will generate an exception in earlier versions. try/catch can be used to conditionally enable the feature based on browser support.  

### PlatformMessage

The enum is used by the platform to notify the client of the VPN session status.  

#### Enum

"connected"   
Indicates that the VPN configuration connected.
"disconnected"   
Indicates that the VPN configuration disconnected.
"error"   
Indicates that an error occurred in VPN connection, for example a timeout. A description of the error is given as the error argument to onPlatformMessage.
"linkDown"   
Indicates that the default physical network connection is down.
"linkUp"   
Indicates that the default physical network connection is back up.
"linkChanged"   
Indicates that the default physical network connection changed, e.g. wifi-\>mobile.
"suspend"   
Indicates that the OS is preparing to suspend, so the VPN should drop its connection. The extension is not guaranteed to receive this event prior to suspending.
"resume"   
Indicates that the OS has resumed and the user has logged back in, so the VPN should try to reconnect.

<br />

### UIEvent

The enum is used by the platform to indicate the event that triggered `onUIEvent`.  

#### Enum

"showAddDialog"   
Requests that the VPN client show the add configuration dialog box to the user.
"showConfigureDialog"   
Requests that the VPN client show the configuration settings dialog box to the user.

<br />

### VpnConnectionState

The enum is used by the VPN client to inform the platform of its current state. This helps provide meaningful messages to the user.  

#### Enum

"connected"   
Specifies that VPN connection was successful.
"failure"   
Specifies that VPN connection has failed.

<br />

## Methods

### createConfig()

```typescript
chrome.vpnProvider.createConfig(
  name: string,
): Promise<string>
```

Creates a new VPN configuration that persists across multiple login sessions of the user.  

#### Parameters

  - name  
  string

The name of the VPN configuration.  

#### Returns

  - Promise\<string\>  
Chrome 96+  

### destroyConfig()

```typescript
chrome.vpnProvider.destroyConfig(
  id: string,
): Promise<void>
```

Destroys a VPN configuration created by the extension.  

#### Parameters

  - id  
  string

ID of the VPN configuration to destroy.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### notifyConnectionStateChanged()

```typescript
chrome.vpnProvider.notifyConnectionStateChanged(
  state: VpnConnectionState,
): Promise<void>
```

Notifies the VPN session state to the platform. This will succeed only when the VPN session is owned by the extension.  

#### Parameters

  - state  
  [VpnConnectionState](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#type-VpnConnectionState)

The VPN session state of the VPN client.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### sendPacket()

```typescript
chrome.vpnProvider.sendPacket(
  data: ArrayBuffer,
): Promise<void>
```

Sends an IP packet through the tunnel created for the VPN session. This will succeed only when the VPN session is owned by the extension.  

#### Parameters

  - data  
  ArrayBuffer

The IP packet to be sent to the platform.  

#### Returns

  - Promise\<void\>  
Chrome 96+  

### setParameters()

```typescript
chrome.vpnProvider.setParameters(
  parameters: Parameters,
): Promise<void>
```

Sets the parameters for the VPN session. This should be called immediately after `"connected"` is received from the platform. This will succeed only when the VPN session is owned by the extension.  

#### Parameters

  - parameters  
  [Parameters](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#type-Parameters)

The parameters for the VPN session.  

#### Returns

  - Promise\<void\>  
  Chrome 96+

## Events

### onConfigCreated

```typescript
chrome.vpnProvider.onConfigCreated.addListener(
  callback: function,
)
```

Triggered when a configuration is created by the platform for the extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (id: string, name: string, data: object) => void
  ```

  <br />

    - id  
    string
    - name  
    string
    - data  
object  

### onConfigRemoved

```typescript
chrome.vpnProvider.onConfigRemoved.addListener(
  callback: function,
)
```

Triggered when a configuration created by the extension is removed by the platform.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (id: string) => void
  ```

  <br />

    - id  
string  

### onPacketReceived

```typescript
chrome.vpnProvider.onPacketReceived.addListener(
  callback: function,
)
```

Triggered when an IP packet is received via the tunnel for the VPN session owned by the extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (data: ArrayBuffer) => void
  ```

  <br />

    - data  
ArrayBuffer  

### onPlatformMessage

```typescript
chrome.vpnProvider.onPlatformMessage.addListener(
  callback: function,
)
```

Triggered when a message is received from the platform for a VPN configuration owned by the extension.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (id: string, message: PlatformMessage, error: string) => void
  ```

  <br />

    - id  
    string
    - message  
    [PlatformMessage](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#type-PlatformMessage)
    - error  
string  

### onUIEvent

```typescript
chrome.vpnProvider.onUIEvent.addListener(
  callback: function,
)
```

Triggered when there is a UI event for the extension. UI events are signals from the platform that indicate to the app that a UI dialog needs to be shown to the user.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (event: UIEvent, id?: string) => void
  ```

  <br />

    - event  
    [UIEvent](https://developer.chrome.com/docs/extensions/reference/api/vpnProvider#type-UIEvent)
    - id  
    string optional

<br />

---

## 66. wallpaper

*File: pages/wallpaper.md*

# chrome.webAuthenticationProxy

<br />

<br />

## Description

The `chrome.webAuthenticationProxy` API lets remote desktop software running on a remote host intercept Web Authentication API (WebAuthn) requests in order to handle them on a local client.

<br />

<br />

## Permissions

`webAuthenticationProxy`  

<br />

<br />

## Availability

Chrome 115+ MV3+

<br />

<br />

<br />

## Types

### CreateRequest

#### Properties

  - requestDetailsJson  
  string

  The `PublicKeyCredentialCreationOptions` passed to `navigator.credentials.create()`, serialized as a JSON string. The serialization format is compatible with [`PublicKeyCredential.parseCreationOptionsFromJSON()`](https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON).
  - requestId  
  number

An opaque identifier for the request.  

### CreateResponseDetails

#### Properties

  - error  
  [DOMExceptionDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-DOMExceptionDetails) optional

  The `DOMException` yielded by the remote request, if any.
  - requestId  
  number

  The `requestId` of the `CreateRequest`.
  - responseJson  
  string optional

The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"\> `PublicKeyCredential.toJSON()`.  

### DOMExceptionDetails

#### Properties

  - message  
  string
  - name  
string  

### GetRequest

#### Properties

  - requestDetailsJson  
  string

  The `PublicKeyCredentialRequestOptions` passed to `navigator.credentials.get()`, serialized as a JSON string. The serialization format is compatible with [`PublicKeyCredential.parseRequestOptionsFromJSON()`](https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON).
  - requestId  
  number

An opaque identifier for the request.  

### GetResponseDetails

#### Properties

  - error  
  [DOMExceptionDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-DOMExceptionDetails) optional

  The `DOMException` yielded by the remote request, if any.
  - requestId  
  number

  The `requestId` of the `CreateRequest`.
  - responseJson  
  string optional

The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"\> `PublicKeyCredential.toJSON()`.  

### IsUvpaaRequest

#### Properties

  - requestId  
  number

An opaque identifier for the request.  

### IsUvpaaResponseDetails

#### Properties

  - isUvpaa  
  boolean
  - requestId  
  number

## Methods

### attach()

```typescript
chrome.webAuthenticationProxy.attach(): Promise<string | undefined>
```

Makes this extension the active Web Authentication API request proxy.

Remote desktop extensions typically call this method after detecting attachment of a remote session to this host. Once this method returns without error, regular processing of WebAuthn requests is suspended, and events from this extension API are raised.

This method fails with an error if a different extension is already attached.

The attached extension must call `detach()` once the remote desktop session has ended in order to resume regular WebAuthn request processing. Extensions automatically become detached if they are unloaded.

Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.  

#### Returns

- Promise\<string \| undefined\>  

### completeCreateRequest()

```typescript
chrome.webAuthenticationProxy.completeCreateRequest(
  details: CreateResponseDetails,
): Promise<void>
```

Reports the result of a `navigator.credentials.create()` call. The extension must call this for every `onCreateRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).  

#### Parameters

  - details  
[CreateResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-CreateResponseDetails)  

#### Returns

- Promise\<void\>  

### completeGetRequest()

```typescript
chrome.webAuthenticationProxy.completeGetRequest(
  details: GetResponseDetails,
): Promise<void>
```

Reports the result of a `navigator.credentials.get()` call. The extension must call this for every `onGetRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).  

#### Parameters

  - details  
[GetResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-GetResponseDetails)  

#### Returns

- Promise\<void\>  

### completeIsUvpaaRequest()

```typescript
chrome.webAuthenticationProxy.completeIsUvpaaRequest(
  details: IsUvpaaResponseDetails,
): Promise<void>
```

Reports the result of a `PublicKeyCredential.isUserVerifyingPlatformAuthenticator()` call. The extension must call this for every `onIsUvpaaRequest` event it has received.  

#### Parameters

  - details  
[IsUvpaaResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-IsUvpaaResponseDetails)  

#### Returns

- Promise\<void\>  

### detach()

```typescript
chrome.webAuthenticationProxy.detach(): Promise<string | undefined>
```

Removes this extension from being the active Web Authentication API request proxy.

This method is typically called when the extension detects that a remote desktop session was terminated. Once this method returns, the extension ceases to be the active Web Authentication API request proxy.

Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.  

#### Returns

- Promise\<string \| undefined\>

## Events

### onCreateRequest

```typescript
chrome.webAuthenticationProxy.onCreateRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn `navigator.credentials.create()` call occurs. The extension must supply a response by calling `completeCreateRequest()` with the `requestId` from `requestInfo`.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: CreateRequest) => void
  ```

  <br />

    - requestInfo  
[CreateRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-CreateRequest)  

### onGetRequest

```typescript
chrome.webAuthenticationProxy.onGetRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn navigator.credentials.get() call occurs. The extension must supply a response by calling `completeGetRequest()` with the `requestId` from `requestInfo`  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: GetRequest) => void
  ```

  <br />

    - requestInfo  
[GetRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-GetRequest)  

### onIsUvpaaRequest

```typescript
chrome.webAuthenticationProxy.onIsUvpaaRequest.addListener(
  callback: function,
)
```

Fires when a `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` call occurs. The extension must supply a response by calling `completeIsUvpaaRequest()` with the `requestId` from `requestInfo`  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: IsUvpaaRequest) => void
  ```

  <br />

    - requestInfo  
[IsUvpaaRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-IsUvpaaRequest)  

### onRemoteSessionStateChange

```typescript
chrome.webAuthenticationProxy.onRemoteSessionStateChange.addListener(
  callback: function,
)
```

A native application associated with this extension can cause this event to be fired by writing to a file with a name equal to the extension's ID in a directory named `WebAuthenticationProxyRemoteSessionStateChange` inside the [default user data directory](https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_dir.md#default-location)

The contents of the file should be empty. I.e., it is not necessary to change the contents of the file in order to trigger this event.

The native host application may use this event mechanism to signal a possible remote session state change (i.e. from detached to attached, or vice versa) while the extension service worker is possibly suspended. In the handler for this event, the extension can call the `attach()` or `detach()` API methods accordingly.

The event listener must be registered synchronously at load time.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

### onRequestCanceled

```typescript
chrome.webAuthenticationProxy.onRequestCanceled.addListener(
  callback: function,
)
```

Fires when a `onCreateRequest` or `onGetRequest` event is canceled (because the WebAuthn request was aborted by the caller, or because it timed out). When receiving this event, the extension should cancel processing of the corresponding request on the client side. Extensions cannot complete a request once it has been canceled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestId: number) => void
  ```

  <br />

    - requestId  
    number

<br />

---

## 67. webAuthenticationProxy

*File: pages/webAuthenticationProxy.md*

# chrome.webAuthenticationProxy

<br />

<br />

## Description

The `chrome.webAuthenticationProxy` API lets remote desktop software running on a remote host intercept Web Authentication API (WebAuthn) requests in order to handle them on a local client.

<br />

<br />

## Permissions

`webAuthenticationProxy`  

<br />

<br />

## Availability

Chrome 115+ MV3+

<br />

<br />

<br />

## Types

### CreateRequest

#### Properties

  - requestDetailsJson  
  string

  The `PublicKeyCredentialCreationOptions` passed to `navigator.credentials.create()`, serialized as a JSON string. The serialization format is compatible with [`PublicKeyCredential.parseCreationOptionsFromJSON()`](https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON).
  - requestId  
  number

An opaque identifier for the request.  

### CreateResponseDetails

#### Properties

  - error  
  [DOMExceptionDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-DOMExceptionDetails) optional

  The `DOMException` yielded by the remote request, if any.
  - requestId  
  number

  The `requestId` of the `CreateRequest`.
  - responseJson  
  string optional

The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"\> `PublicKeyCredential.toJSON()`.  

### DOMExceptionDetails

#### Properties

  - message  
  string
  - name  
string  

### GetRequest

#### Properties

  - requestDetailsJson  
  string

  The `PublicKeyCredentialRequestOptions` passed to `navigator.credentials.get()`, serialized as a JSON string. The serialization format is compatible with [`PublicKeyCredential.parseRequestOptionsFromJSON()`](https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON).
  - requestId  
  number

An opaque identifier for the request.  

### GetResponseDetails

#### Properties

  - error  
  [DOMExceptionDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-DOMExceptionDetails) optional

  The `DOMException` yielded by the remote request, if any.
  - requestId  
  number

  The `requestId` of the `CreateRequest`.
  - responseJson  
  string optional

The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"\> `PublicKeyCredential.toJSON()`.  

### IsUvpaaRequest

#### Properties

  - requestId  
  number

An opaque identifier for the request.  

### IsUvpaaResponseDetails

#### Properties

  - isUvpaa  
  boolean
  - requestId  
  number

## Methods

### attach()

```typescript
chrome.webAuthenticationProxy.attach(): Promise<string | undefined>
```

Makes this extension the active Web Authentication API request proxy.

Remote desktop extensions typically call this method after detecting attachment of a remote session to this host. Once this method returns without error, regular processing of WebAuthn requests is suspended, and events from this extension API are raised.

This method fails with an error if a different extension is already attached.

The attached extension must call `detach()` once the remote desktop session has ended in order to resume regular WebAuthn request processing. Extensions automatically become detached if they are unloaded.

Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.  

#### Returns

- Promise\<string \| undefined\>  

### completeCreateRequest()

```typescript
chrome.webAuthenticationProxy.completeCreateRequest(
  details: CreateResponseDetails,
): Promise<void>
```

Reports the result of a `navigator.credentials.create()` call. The extension must call this for every `onCreateRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).  

#### Parameters

  - details  
[CreateResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-CreateResponseDetails)  

#### Returns

- Promise\<void\>  

### completeGetRequest()

```typescript
chrome.webAuthenticationProxy.completeGetRequest(
  details: GetResponseDetails,
): Promise<void>
```

Reports the result of a `navigator.credentials.get()` call. The extension must call this for every `onGetRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).  

#### Parameters

  - details  
[GetResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-GetResponseDetails)  

#### Returns

- Promise\<void\>  

### completeIsUvpaaRequest()

```typescript
chrome.webAuthenticationProxy.completeIsUvpaaRequest(
  details: IsUvpaaResponseDetails,
): Promise<void>
```

Reports the result of a `PublicKeyCredential.isUserVerifyingPlatformAuthenticator()` call. The extension must call this for every `onIsUvpaaRequest` event it has received.  

#### Parameters

  - details  
[IsUvpaaResponseDetails](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-IsUvpaaResponseDetails)  

#### Returns

- Promise\<void\>  

### detach()

```typescript
chrome.webAuthenticationProxy.detach(): Promise<string | undefined>
```

Removes this extension from being the active Web Authentication API request proxy.

This method is typically called when the extension detects that a remote desktop session was terminated. Once this method returns, the extension ceases to be the active Web Authentication API request proxy.

Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.  

#### Returns

- Promise\<string \| undefined\>

## Events

### onCreateRequest

```typescript
chrome.webAuthenticationProxy.onCreateRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn `navigator.credentials.create()` call occurs. The extension must supply a response by calling `completeCreateRequest()` with the `requestId` from `requestInfo`.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: CreateRequest) => void
  ```

  <br />

    - requestInfo  
[CreateRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-CreateRequest)  

### onGetRequest

```typescript
chrome.webAuthenticationProxy.onGetRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn navigator.credentials.get() call occurs. The extension must supply a response by calling `completeGetRequest()` with the `requestId` from `requestInfo`  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: GetRequest) => void
  ```

  <br />

    - requestInfo  
[GetRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-GetRequest)  

### onIsUvpaaRequest

```typescript
chrome.webAuthenticationProxy.onIsUvpaaRequest.addListener(
  callback: function,
)
```

Fires when a `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` call occurs. The extension must supply a response by calling `completeIsUvpaaRequest()` with the `requestId` from `requestInfo`  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestInfo: IsUvpaaRequest) => void
  ```

  <br />

    - requestInfo  
[IsUvpaaRequest](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy#type-IsUvpaaRequest)  

### onRemoteSessionStateChange

```typescript
chrome.webAuthenticationProxy.onRemoteSessionStateChange.addListener(
  callback: function,
)
```

A native application associated with this extension can cause this event to be fired by writing to a file with a name equal to the extension's ID in a directory named `WebAuthenticationProxyRemoteSessionStateChange` inside the [default user data directory](https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_dir.md#default-location)

The contents of the file should be empty. I.e., it is not necessary to change the contents of the file in order to trigger this event.

The native host application may use this event mechanism to signal a possible remote session state change (i.e. from detached to attached, or vice versa) while the extension service worker is possibly suspended. In the handler for this event, the extension can call the `attach()` or `detach()` API methods accordingly.

The event listener must be registered synchronously at load time.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  () => void
  ```

  <br />

### onRequestCanceled

```typescript
chrome.webAuthenticationProxy.onRequestCanceled.addListener(
  callback: function,
)
```

Fires when a `onCreateRequest` or `onGetRequest` event is canceled (because the WebAuthn request was aborted by the caller, or because it timed out). When receiving this event, the extension should cancel processing of the corresponding request on the client side. Extensions cannot complete a request once it has been canceled.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (requestId: number) => void
  ```

  <br />

    - requestId  
    number

<br />

---

## 68. webNavigation

*File: pages/webNavigation.md*

# chrome.windows

<br />

<br />

## Description

Use the `chrome.windows` API to interact with browser windows. You can use this API to create, modify, and rearrange windows in the browser.

<br />

<br />

## Permissions

When requested, a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) contains an array of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab) objects. You must
declare the `"tabs"` permission in your [manifest](https://developer.chrome.com/docs/extensions/reference/api/tabs#manifest) if you need access to the [`url`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-url),
[`pendingUrl`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-pendingUrl), [`title`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-title), or [`favIconUrl`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-favIconUrl) properties of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab). For example:  

    {
      "name": "My extension",
      ...
      "permissions": ["tabs"],
      ...
    }

<br />

<br />

## Concepts and usage

### The current window

Many functions in the extension system take an optional `windowId` argument, which defaults to the
current window.

The *current window* is the window that contains the code that is currently executing. It's
important to realize that this can be different from the topmost or focused window.

For example, say an extension creates a few tabs or windows from a single HTML file, and that the
HTML file contains a call to [`tabs.query()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query). The current window is the window that contains the
page that made the call, no matter what the topmost window is.

In the case of [service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers), the value of the current window falls back to the last active
window. Under some circumstances, there may be no current window for background pages.

## Examples

To try this API, install the [windows API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/windows) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.
![Two windows, each with one tab](https://developer.chrome.com/static/docs/extensions/reference/api/windows/images/windows.png) Two windows, each with one tab.

<br />

## Types

### CreateType

Chrome 44+

Specifies what type of browser window to create. 'panel' is deprecated and is available only to existing allowlisted extensions on Chrome OS.  

#### Enum

"normal"   
Specifies the window as a standard window.
"popup"   
Specifies the window as a popup window.
"panel"   
Specifies the window as a panel.

<br />

### QueryOptions

Chrome 88+  

#### Properties

  - populate  
  boolean optional

  If true, the [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) object has a `tabs` property that contains a list of the [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) objects. The `Tab` objects only contain the `url`, `pendingUrl`, `title`, and `favIconUrl` properties if the extension's manifest file includes the `"tabs"` permission.
  - windowTypes  
  [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\] optional

If set, the [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) returned is filtered based on its type. If unset, the default filter is set to `['normal', 'popup']`.  

### Window

#### Properties

  - alwaysOnTop  
  boolean

  Whether the window is set to be always on top.
  - focused  
  boolean

  Whether the window is currently the focused window.
  - height  
  number optional

  The height of the window, including the frame, in pixels. In some circumstances a window may not be assigned a `height` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - id  
  number optional

  The ID of the window. Window IDs are unique within a browser session. In some circumstances a window may not be assigned an `ID` property; for example, when querying windows using the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API, in which case a session ID may be present.
  - incognito  
  boolean

  Whether the window is incognito.
  - left  
  number optional

  The offset of the window from the left edge of the screen in pixels. In some circumstances a window may not be assigned a `left` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - sessionId  
  string optional

  The session ID used to uniquely identify a window, obtained from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - state  
  [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional

  The state of this browser window.
  - tabs  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)\[\] optional

  Array of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) objects representing the current tabs in the window.
  - top  
  number optional

  The offset of the window from the top edge of the screen in pixels. In some circumstances a window may not be assigned a `top` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - type  
  [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType) optional

  The type of browser window this is.
  - width  
  number optional

The width of the window, including the frame, in pixels. In some circumstances a window may not be assigned a `width` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

### WindowState

Chrome 44+

The state of this browser window. In some circumstances a window may not be assigned a `state` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

#### Enum

"normal"   
Normal window state (not minimized, maximized, or fullscreen).
"minimized"   
Minimized window state.
"maximized"   
Maximized window state.
"fullscreen"   
Fullscreen window state.
"locked-fullscreen"   
Locked fullscreen window state. This fullscreen state cannot be exited by user action and is available only to allowlisted extensions on Chrome OS.

<br />

### WindowType

Chrome 44+

The type of browser window this is. In some circumstances a window may not be assigned a `type` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

#### Enum

"normal"   
A normal browser window.
"popup"   
A browser popup.
"panel"   
*Deprecated in this API.* A Chrome App panel-style window. Extensions can only see their own panel windows.
"app"   
*Deprecated in this API.* A Chrome App window. Extensions can only see their app own windows.
"devtools"   
A Developer Tools window.

<br />

## Properties

### WINDOW_ID_CURRENT

The windowId value that represents the [current window](https://developer.chrome.com/docs/extensions/reference/windows/#the_current_window).  

#### Value

-2   

### WINDOW_ID_NONE

The windowId value that represents the absence of a Chrome browser window.  

#### Value

-1   

## Methods

### create()

```typescript
chrome.windows.create(
  createData?: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window | undefined>
```

Creates (opens) a new browser window with any optional sizing, position, or default URL provided.  

#### Parameters

  - createData  
  object optional  
    - focused  
    boolean optional

    If `true`, opens an active window. If `false`, opens an inactive window.
    - height  
    number optional

    The height in pixels of the new window, including the frame. If not specified, defaults to a natural height.
    - incognito  
    boolean optional

    Whether the new window should be an incognito window.
    - left  
    number optional

    The number of pixels to position the new window from the left edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
    - setSelfAsOpener  
    boolean optional  
    Chrome 64+

    If `true`, the newly-created window's 'window.opener' is set to the caller and is in the same [unit of related browsing contexts](https://www.w3.org/TR/html51/browsers.html#unit-of-related-browsing-contexts) as the caller.
    - state  
    [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional  
    Chrome 44+

    The initial state of the window. The `minimized`, `maximized`, and `fullscreen` states cannot be combined with `left`, `top`, `width`, or `height`.
    - tabId  
    number optional

    The ID of the tab to add to the new window.
    - top  
    number optional

    The number of pixels to position the new window from the top edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
    - type  
    [CreateType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-CreateType) optional

    Specifies what type of browser window to create.
    - url  
    string \| string\[\] optional

    A URL or array of URLs to open as tabs in the window. Fully-qualified URLs must include a scheme, e.g., 'http://www.google.com', not 'www.google.com'. Non-fully-qualified URLs are considered relative within the extension. Defaults to the New Tab Page.
    - width  
    number optional

The width in pixels of the new window, including the frame. If not specified, defaults to a natural width.  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) \| undefined\>  
Chrome 88+  

### get()

```typescript
chrome.windows.get(
  windowId: number,
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets details about a window.  

#### Parameters

  - windowId  
  number
  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### getAll()

```typescript
chrome.windows.getAll(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window[]>
```

Gets all windows.  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\[\]\>  
Chrome 88+  

### getCurrent()

```typescript
chrome.windows.getCurrent(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets the [current window](https://developer.chrome.com/docs/extensions/reference/windows/#current-window).  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### getLastFocused()

```typescript
chrome.windows.getLastFocused(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets the window that was most recently focused --- typically the window 'on top'.  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### remove()

```typescript
chrome.windows.remove(
  windowId: number,
): Promise<void>
```

Removes (closes) a window and all the tabs inside it.  

#### Parameters

  - windowId  
number  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### update()

```typescript
chrome.windows.update(
  windowId: number,
  updateInfo: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Updates the properties of a window. Specify only the properties that to be changed; unspecified properties are unchanged.  

#### Parameters

  - windowId  
  number
  - updateInfo  
  object  
    - drawAttention  
    boolean optional

    If `true`, causes the window to be displayed in a manner that draws the user's attention to the window, without changing the focused window. The effect lasts until the user changes focus to the window. This option has no effect if the window already has focus. Set to `false` to cancel a previous `drawAttention` request.
    - focused  
    boolean optional

    If `true`, brings the window to the front; cannot be combined with the state 'minimized'. If `false`, brings the next window in the z-order to the front; cannot be combined with the state 'fullscreen' or 'maximized'.
    - height  
    number optional

    The height to resize the window to in pixels. This value is ignored for panels.
    - left  
    number optional

    The offset from the left edge of the screen to move the window to in pixels. This value is ignored for panels.
    - state  
    [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional

    The new state of the window. The 'minimized', 'maximized', and 'fullscreen' states cannot be combined with 'left', 'top', 'width', or 'height'.
    - top  
    number optional

    The offset from the top edge of the screen to move the window to in pixels. This value is ignored for panels.
    - width  
    number optional

The width to resize the window to in pixels. This value is ignored for panels.  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
  Chrome 88+

## Events

### onBoundsChanged

Chrome 86+

```typescript
chrome.windows.onBoundsChanged.addListener(
  callback: function,
)
```

Fired when a window has been resized; this event is only dispatched when the new bounds are committed, and not for in-progress changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (window: Window) => void
  ```

  <br />

    - window  
[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)  

### onCreated

```typescript
chrome.windows.onCreated.addListener(
  callback: function,
  filters?: object,
)
```

Fired when a window is created.  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (window: Window) => void
  ```

  <br />

    - window  
    [Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)

    Details of the created window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

Conditions that the window's type being created must satisfy. By default it satisfies `['normal', 'popup']`.  

### onFocusChanged

```typescript
chrome.windows.onFocusChanged.addListener(
  callback: function,
  filters?: object,
)
```

Fired when the currently focused window changes. Returns `chrome.windows.WINDOW_ID_NONE` if all Chrome windows have lost focus. **Note:** On some Linux window managers, `WINDOW_ID_NONE` is always sent immediately preceding a switch from one Chrome window to another.  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (windowId: number) => void
  ```

  <br />

    - windowId  
    number

    ID of the newly-focused window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

Conditions that the window's type being removed must satisfy. By default it satisfies `['normal', 'popup']`.  

### onRemoved

```typescript
chrome.windows.onRemoved.addListener(
  callback: function,
  filters?: object,
)
```

Fired when a window is removed (closed).  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (windowId: number) => void
  ```

  <br />

    - windowId  
    number

    ID of the removed window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

    Conditions that the window's type being removed must satisfy. By default it satisfies `['normal', 'popup']`.

<br />

---

## 69. webRequest

*File: pages/webRequest.md*

# chrome.webRequest

<br />

| **Note:** As of Manifest V3, the `"webRequestBlocking"` permission is no longer available for most extensions. Consider `"declarativeNetRequest"`, which enables use the [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest). Aside from `"webRequestBlocking"`, the webRequest API is unchanged and available for normal use. Policy installed extensions can continue to use `"webRequestBlocking"`.

<br />

## Description

Use the `chrome.webRequest` API to observe and analyze traffic and to intercept, block, or modify requests in-flight.

<br />

<br />

## Permissions

`webRequest`  

<br />

You must declare the `"webRequest"` permission in the [extension manifest](https://developer.chrome.com/docs/extensions/reference/manifest) to use the web request
API, along with the necessary [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions). To intercept a sub-resource request, the
extension must have access to both the requested URL and its initiator. For example:  

    {
      "name": "My extension",
      ...
      "permissions": [
        "webRequest"
      ],
      "host_permissions": [
        "*://*.google.com/*"
      ],
      ...
    }

`webRequestBlocking`

Required to register blocking event handlers. As of Manifest V3, this is only
available to policy installed extensions.

`webRequestAuthProvider`

Required to use the [`onAuthRequired`](https://developer.chrome.com/docs/extensions/reference/api/webRequest#event-onAuthRequired) method. See
[Handling authentication](https://developer.chrome.com/docs/extensions/reference/api/webRequest#handle-auth).

<br />

<br />

## Concepts and usage

### Life cycle of requests

The web request API defines a set of events that follow the life cycle of a web request. You can use
these events to observe and analyze traffic. Certain synchronous events will allow you to intercept,
block, or modify a request.

The event life cycle for successful requests is illustrated here, followed by event definitions:

![Life cycle of a web request from the perspective of the webrequest API](https://developer.chrome.com/static/docs/extensions/reference/api/webRequest/images/webrequestapi.png)

`onBeforeRequest` (optionally synchronous)
:   Fires when a request is about to occur. This event is sent before any TCP connection is made and can
    be used to cancel or redirect requests.

`onBeforeSendHeaders` (optionally synchronous)
:   Fires when a request is about to occur and the initial headers have been prepared. The event is
    intended to allow extensions to add, modify, and delete request headers [(\*)](https://developer.chrome.com/docs/extensions/reference/api/webRequest#life_cycle_footnote). The
    `onBeforeSendHeaders` event is passed to all subscribers, so different subscribers may attempt to
    modify the request; see the [Implementation details](https://developer.chrome.com/docs/extensions/reference/api/webRequest#implementation-details) section for how this is handled. This event
    can be used to cancel the request.

`onSendHeaders`
:   Fires after all extensions have had a chance to modify the request headers, and presents the final
    [(\*)](https://developer.chrome.com/docs/extensions/reference/api/webRequest#life_cycle_footnote) version. The event is triggered before the headers are sent to the network. This event is
    informational and handled asynchronously. It does not allow modifying or cancelling the request.

`onHeadersReceived` (optionally synchronous)
:   Fires each time that an HTTP(S) response header is received. Due to redirects and authentication
    requests this can happen multiple times per request. This event is intended to allow extensions to
    add, modify, and delete response headers, such as incoming Content-Type headers. The caching
    directives are processed before this event is triggered, so modifying headers such as Cache-Control
    has no influence on the browser's cache. It also allows you to cancel or redirect the request.

`onAuthRequired` (optionally synchronous)
:   Fires when a request requires authentication of the user. This event can be handled synchronously to
    provide authentication credentials. Note that extensions may provide invalid credentials. Take care
    not to enter an infinite loop by repeatedly providing invalid credentials. This can also be used to
    cancel the request.

`onBeforeRedirect`
:   Fires when a redirect is about to be executed. A redirection can be triggered by an HTTP response
    code or by an extension. This event is informational and handled asynchronously. It does not allow
    you to modify or cancel the request.

`onResponseStarted`
:   Fires when the first byte of the response body is received. For HTTP requests, this means that the
    status line and response headers are available. This event is informational and handled
    asynchronously. It does not allow modifying or canceling the request.

`onCompleted`
:   Fires when a request has been processed successfully.

`onErrorOccurred`
:   Fires when a request could not be processed successfully.

The web request API guarantees that for each request, either `onCompleted` or `onErrorOccurred` is
fired as the final event with one exception: If a request is redirected to a `data://` URL,
`onBeforeRedirect` is the last reported event.

\*
Note that the web request API presents an abstraction of the network stack to the extension.
Internally, one URL request can be split into several HTTP requests (for example, to fetch individual
byte ranges from a large file) or can be handled by the network stack without communicating with the
network. For this reason, the API does not provide the final HTTP headers that are sent to the
network. For example, all headers that are related to caching are invisible to the extension.

The following headers are currently **not provided** to the `onBeforeSendHeaders` event. This list
is not guaranteed to be complete or stable.

- Authorization
- Cache-Control
- Connection
- Content-Length
- Host
- If-Modified-Since
- If-None-Match
- If-Range
- Partial-Data
- Pragma
- Proxy-Authorization
- Proxy-Connection
- Transfer-Encoding

Starting from Chrome 79, request header modifications affect Cross-Origin Resource Sharing (CORS)
checks. If modified headers for cross-origin requests do not meet the criteria, it will result in
sending a CORS preflight to ask the server if such headers can be accepted. If you really need to
modify headers in a way to violate the CORS protocol, you need to specify `'extraHeaders'` in
`opt_extraInfoSpec`. On the other hand, response header modifications do not work to deceive CORS
checks. If you need to deceive the CORS protocol, you also need to specify `'extraHeaders'` for the
response modifications.

Starting from Chrome 79, the webRequest API **does not** intercept CORS preflight requests and
responses by default. A CORS preflight for a request URL is visible to an extension if there is a
listener with `'extraHeaders'` specified in `opt_extraInfoSpec` for the request URL.
`onBeforeRequest` can also take `'extraHeaders'` from Chrome 79.

Starting from Chrome 79, the following request header is **not provided** and cannot be modified or
removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`:

- Origin

| **Note:** Modifying the `Origin` request header might not work as intended and may result in unexpected errors in the response's [CORS checks](https://fetch.spec.whatwg.org/#cors-check). This is because while extensions can only modify the [Origin](https://fetch.spec.whatwg.org/#origin-header) request header, they can't change the `request origin` or initiator, which is a concept defined in the Fetch spec to represent who initiates the request. In such a scenario, the server may allow the CORS access for the modified request and put the header's `Origin` into the `Access-Control-Allow-Origin` header in the response. But it won't match the immutable `request origin` and will result in a CORS failure.

Starting from Chrome 72, if you need to modify responses before [Cross Origin Read Blocking
(CORB)](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md) can block the response, you need to specify `'extraHeaders'` in `opt_extraInfoSpec`.

Starting from Chrome 72, the following request headers are **not provided** and cannot be modified
or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`:

- Accept-Language
- Accept-Encoding
- Referer
- Cookie

Starting from Chrome 72, the `Set-Cookie` response header is **not provided** and cannot be modified
or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`.

Starting from Chrome 89, the `X-Frame-Options` response header cannot be effectively modified
or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`.
| **Note:** Specifying `'extraHeaders'` in `opt_extraInfoSpec` may have a negative impact on performance, hence it should only be used when really necessary.

The webRequest API only exposes requests that the extension has permission to see, given its [host
permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions). Moreover, only the following schemes are accessible: `http://`, `https://`,
`ftp://`, `file://`, `ws://` (since Chrome 58), `wss://` (since Chrome 58), `urn:` (since Chrome 91), or
`chrome-extension://`. In addition, even certain requests with URLs using one of the above schemes
are hidden. These include `chrome-extension://other_extension_id` where `other_extension_id` is not
the ID of the extension to handle the request, `https://www.google.com/chrome`, and other sensitive
requests core to browser functionality. Also synchronous XMLHttpRequests from your extension are
hidden from blocking event handlers in order to prevent deadlocks. Note that for some of the
supported schemes the set of available events might be limited due to the nature of the
corresponding protocol. For example, for the file: scheme, only `onBeforeRequest`,
`onResponseStarted`, `onCompleted`, and `onErrorOccurred` may be dispatched.

Starting from Chrome 58, the webRequest API supports intercepting the WebSocket handshake request.
Since the handshake is done by means of an HTTP upgrade request, its flow fits into HTTP-oriented
webRequest model. Note that the API does **not intercept**:

- Individual messages sent over an established WebSocket connection.
- WebSocket closing connection.

Redirects are **not supported** for WebSocket requests.

Starting from Chrome 72, an extension will be able to intercept a request only if it has host
permissions to both the requested URL and the request initiator.

Starting from Chrome 96, the webRequest API supports intercepting the WebTransport over HTTP/3
handshake request. Since the handshake is done by means of an HTTP CONNECT request, its flow fits
into HTTP-oriented webRequest model. Note that:

- Once the session is established, extensions cannot observe or intervene in the session via the webRequest API.
- Modifying HTTP request headers in `onBeforeSendHeaders` is ignored.
- Redirects and authentications are **not supported** in WebTransport over HTTP/3.

### Request IDs

Each request is identified by a request ID. This ID is unique within a browser session and the
context of an extension. It remains constant during the life cycle of a request and can be used
to match events for the same request. Note that several HTTP requests are mapped to one web request
in case of HTTP redirection or HTTP authentication.

### Registering event listeners

To register an event listener for a web request, you use a variation on the [usual `addListener()`
function](https://developer.chrome.com/docs/extensions/reference/api/events). In addition to specifying a callback function, you have to specify a filter argument, and you may specify an optional extra info argument.

The three arguments to the web request API's `addListener()` have the following definitions:  

    var callback = function(details) {...};
    var filter = {...};
    var opt_extraInfoSpec = [...];

Here's an example of listening for the `onBeforeRequest` event:  

    chrome.webRequest.onBeforeRequest.addListener(
        callback, filter, opt_extraInfoSpec);

Each `addListener()` call takes a mandatory callback function as the first parameter. This callback
function is passed a dictionary containing information about the current URL request. The
information in this dictionary depends on the specific event type as well as the content of
`opt_extraInfoSpec`.

If the optional `opt_extraInfoSpec` array contains the string `'blocking'` (only allowed for
specific events), the callback function is handled synchronously. That means that the request is
blocked until the callback function returns. In this case, the callback can return a
[`webRequest.BlockingResponse`](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse) that determines the further life cycle of the request. Depending
on the context, this response allows canceling or redirecting a request (`onBeforeRequest`),
canceling a request or modifying headers (`onBeforeSendHeaders`, `onHeadersReceived`), and
canceling a request or providing authentication credentials (`onAuthRequired`).

If the optional `opt_extraInfoSpec` array contains the string `'asyncBlocking'` instead (only
allowed for `onAuthRequired`), the extension can generate the [`webRequest.BlockingResponse`](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse)
asynchronously.

The [`webRequest.RequestFilter`](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter) `filter` allows limiting the requests for which events are
triggered in various dimensions:

URLs
:   [URL patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns) such as `*://www.google.com/foo*bar`.

Types
:   Request types such as `main_frame` (a document that is loaded for a top-level frame), `sub_frame` (a
    document that is loaded for an embedded frame), and `image` (an image on a web site). See
    [`webRequest.RequestFilter`](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter).

Tab ID
:   The identifier for one tab.

Window ID
:   The identifier for a window.

Depending on the event type, you can specify strings in `opt_extraInfoSpec` to ask for additional
information about the request. This is used to provide detailed information on request's data only
if explicitly requested.

### Handling authentication

To handle requests for HTTP authentication, add the `"webRequestAuthProvider"`
permission to your manifest file:  

    {
      "permissions": [
        "webRequest",
        "webRequestAuthProvider"
      ]
    }

Note that this permission is not required for a policy installed extension with
the `"webRequestBlocking"` permission.

To provide credentials synchronously:  

    chrome.webRequest.onAuthRequired.addListener((details) => {
        return {
          authCredentials: {
            username: 'guest',
            password: 'guest'
          }
        };
      },
      { urls: ['https://httpbin.org/basic-auth/guest/guest'] },
      ['blocking']
    );

To provide credentials asynchronously:  

    chrome.webRequest.onAuthRequired.addListener((details, callback) => {
        callback({
          authCredentials: {
            username: 'guest',
            password: 'guest'
          }
        });
      },
      { urls: ['https://httpbin.org/basic-auth/guest/guest'] },
      ['asyncBlocking']
    );

### Implementation details

Several implementation details can be important to understand when developing an extension that uses
the web request API:

#### web_accessible_resources

When an extension uses webRequest APIs to redirect a public resource request to a resource that is not web accessible, it is blocked and will result in an error. The above holds true even if the resource that is not web accessible is owned by the redirecting extension. To declare resources for use with declarativeWebRequest APIs, the `"web_accessible_resources"` array must be declared and populated in the manifest as documented [here](https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources).

#### Conflict resolution

In the current implementation of the web request API, a request is considered canceled if at
least one extension instructs to cancel the request. If an extension cancels a request, all
extensions are notified by an `onErrorOccurred` event. Only one extension can redirect a
request or modify a header at a time. If more than one extension attempts to modify the request, the
most recently installed extension wins, and all others are ignored. An extension is not notified if
its instruction to modify or redirect has been ignored.

#### Caching

Chrome employs two caches---an on-disk cache and a very fast in-memory cache. The lifetime of an
in-memory cache is attached to the lifetime of a render process, which roughly corresponds to a tab.
Requests that are answered from the in-memory cache are invisible to the web request API. If a
request handler changes its behavior (for example, the behavior according to which requests are
blocked), a simple page refresh might not respect this changed behavior. To ensure the behavior
change goes through, call `handlerBehaviorChanged()` to flush the in-memory cache. But don't do it
often; flushing the cache is a very expensive operation. You don't need to call
`handlerBehaviorChanged()` after registering or unregistering an event listener.

#### Timestamps

The `timestamp` property of web request events is only guaranteed to be *internally* consistent.
Comparing one event to another event will give you the correct offset between them, but comparing
them to the current time inside the extension (via `(new Date()).getTime()`, for instance) might
give unexpected results.

#### Error handling

If you try to register an event with invalid arguments, then a JavaScript error will be thrown, and
the event handler will not be registered. If an error is thrown while an event is handled or if an
event handler returns an invalid blocking response, an error message is logged to your extension's
console, and the handler is ignored for that request.

## Examples

The following example illustrates how to block all requests to `www.evil.com`:  

    chrome.webRequest.onBeforeRequest.addListener(
      function(details) {
        return {cancel: details.url.indexOf("://www.evil.com/") != -1};
      },
      {urls: ["<all_urls>"]},
      ["blocking"]
    );

As this function uses a blocking event handler, it requires the `"webRequest"` as well as the
`"webRequestBlocking"` permission in the manifest file.

The following example achieves the same goal in a more efficient way because requests that are not
targeted to `www.evil.com` do not need to be passed to the extension:  

    chrome.webRequest.onBeforeRequest.addListener(
      function(details) { return {cancel: true}; },
      {urls: ["*://www.evil.com/*"]},
      ["blocking"]
    );

The following example illustrates how to delete the User-Agent header from all requests:  

    chrome.webRequest.onBeforeSendHeaders.addListener(
      function(details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'User-Agent') {
            details.requestHeaders.splice(i, 1);
            break;
          }
        }
        return {requestHeaders: details.requestHeaders};
      },
      {urls: ["<all_urls>"]},
      ["blocking", "requestHeaders"]
    );

To try the `chrome.webRequest` API,
install the [webRequest sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/webRequest/) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

<br />

## Types

### BlockingResponse

Returns value for event handlers that have the 'blocking' extraInfoSpec applied. Allows the event handler to modify network requests.  

#### Properties

  - authCredentials  
  object optional

  Only used as a response to the onAuthRequired event. If set, the request is made using the supplied credentials.  
    - password  
    string
    - username  
    string
  - cancel  
  boolean optional

  If true, the request is cancelled. This prevents the request from being sent. This can be used as a response to the onBeforeRequest, onBeforeSendHeaders, onHeadersReceived and onAuthRequired events.
  - redirectUrl  
  string optional

  Only used as a response to the onBeforeRequest and onHeadersReceived events. If set, the original request is prevented from being sent/completed and is instead redirected to the given URL. Redirections to non-HTTP schemes such as `data:` are allowed. Redirects initiated by a redirect action use the original request method for the redirect, with one exception: If the redirect is initiated at the onHeadersReceived stage, then the redirect will be issued using the GET method. Redirects from URLs with `ws://` and `wss://` schemes are **ignored**.
  - requestHeaders  
  [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

  Only used as a response to the onBeforeSendHeaders event. If set, the request is made with these request headers instead.
  - responseHeaders  
  [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

Only used as a response to the onHeadersReceived event. If set, the server is assumed to have responded with these response headers instead. Only return `responseHeaders` if you really want to modify the headers in order to limit the number of conflicts (only one extension may modify `responseHeaders` for each request).  

### FormDataItem

Chrome 66+

Contains data passed within form data. For urlencoded form it is stored as string if data is utf-8 string and as ArrayBuffer otherwise. For form-data it is ArrayBuffer. If form-data represents uploading file, it is string with filename, if the filename is provided.  

#### Enum

ArrayBuffer
string

<br />

### HttpHeaders

An array of HTTP headers. Each header is represented as a dictionary containing the keys `name` and either `value` or `binaryValue`.  

#### Type

object\[\]  

#### Properties

  - binaryValue  
  number\[\] optional

  Value of the HTTP header if it cannot be represented by UTF-8, stored as individual byte values (0..255).
  - name  
  string

  Name of the HTTP header.
  - value  
  string optional

Value of the HTTP header if it can be represented by UTF-8.  

### IgnoredActionType

Chrome 70+  

#### Enum

"redirect"   
"request_headers"   
"response_headers"   
"auth_credentials"   

<br />

### OnAuthRequiredOptions

Chrome 44+  

#### Enum

"responseHeaders"   
Specifies that the response headers should be included in the event.
"blocking"   
Specifies the request is blocked until the callback function returns.
"asyncBlocking"   
Specifies that the callback function is handled asynchronously.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnBeforeRedirectOptions

Chrome 44+  

#### Enum

"responseHeaders"   
Specifies that the response headers should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnBeforeRequestOptions

Chrome 44+  

#### Enum

"blocking"   
Specifies the request is blocked until the callback function returns.
"requestBody"   
Specifies that the request body should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnBeforeSendHeadersOptions

Chrome 44+  

#### Enum

"requestHeaders"   
Specifies that the request header should be included in the event.
"blocking"   
Specifies the request is blocked until the callback function returns.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnCompletedOptions

Chrome 44+  

#### Enum

"responseHeaders"   
Specifies that the response headers should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnErrorOccurredOptions

Chrome 79+  

#### Value

"extraHeaders"   

### OnHeadersReceivedOptions

Chrome 44+  

#### Enum

"blocking"   
Specifies the request is blocked until the callback function returns.
"responseHeaders"   
Specifies that the response headers should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnResponseStartedOptions

Chrome 44+  

#### Enum

"responseHeaders"   
Specifies that the response headers should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### OnSendHeadersOptions

Chrome 44+  

#### Enum

"requestHeaders"   
Specifies that the request header should be included in the event.
"extraHeaders"   
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

<br />

### RequestFilter

An object describing filters to apply to webRequest events.  

#### Properties

  - tabId  
  number optional
  - types  
  [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)\[\] optional

  A list of request types. Requests that cannot match any of the types will be filtered out.
  - urls  
  string\[\]

  A list of URLs or URL patterns. Requests that cannot match any of the URLs will be filtered out.
  - windowId  
number optional  

### ResourceType

Chrome 44+  

#### Enum

"main_frame"   
Specifies the resource as the main frame.
"sub_frame"   
Specifies the resource as a sub frame.
"stylesheet"   
Specifies the resource as a stylesheet.
"script"   
Specifies the resource as a script.
"image"   
Specifies the resource as an image.
"font"   
Specifies the resource as a font.
"object"   
Specifies the resource as an object.
"xmlhttprequest"   
Specifies the resource as an XMLHttpRequest.
"ping"   
Specifies the resource as a ping.
"csp_report"   
Specifies the resource as a Content Security Policy (CSP) report.
"media"   
Specifies the resource as a media object.
"websocket"   
Specifies the resource as a WebSocket.
"webbundle"   
Specifies the resource as a WebBundle.
"other"   
Specifies the resource as a type not included in the listed types.

<br />

### UploadData

Contains data uploaded in a URL request.  

#### Properties

  - bytes  
  any optional

  An ArrayBuffer with a copy of the data.
  - file  
  string optional

  A string with the file's path and name.

## Properties

### MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES

The maximum number of times that `handlerBehaviorChanged` can be called per 10 minute sustained interval. `handlerBehaviorChanged` is an expensive function call that shouldn't be called often.  

#### Value

20   

## Methods

### handlerBehaviorChanged()

```typescript
chrome.webRequest.handlerBehaviorChanged(): Promise<void>
```

Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching. This function call is expensive. Don't call it often.  

#### Returns

  - Promise\<void\>  
  Chrome 116+

## Events

### onActionIgnored

Chrome 70+

```typescript
chrome.webRequest.onActionIgnored.addListener(
  callback: function,
)
```

Fired when an extension's proposed modification to a network request is ignored. This happens in case of conflicts with other extensions.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - action  
      [IgnoredActionType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-IgnoredActionType)

      The proposed action which was ignored.
      - requestId  
      string

The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.  

### onAuthRequired

```typescript
chrome.webRequest.onAuthRequired.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnAuthRequiredOptions[],
)
```

Fired when an authentication failure is received. The listener has three options: it can provide authentication credentials, it can cancel the request and display the error page, or it can take no action on the challenge. If bad user credentials are provided, this may be called multiple times for the same request. Note, only one of `'blocking'` or `'asyncBlocking'` modes must be specified in the `extraInfoSpec` parameter.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object, asyncCallback?: function) => BlockingResponse | undefined
  ```

  <br />

    - details  
    object  
      - challenger  
      object

      The server requesting authentication.  
        - host  
        string
        - port  
        number
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - isProxy  
      boolean

      True for Proxy-Authenticate, false for WWW-Authenticate.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - realm  
      string optional

      The authentication realm provided by the server, if there is one.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - responseHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP response headers that were received along with this response.
      - scheme  
      string

      The authentication scheme, e.g. Basic or Digest.
      - statusCode  
      number  
      Chrome 43+

      Standard HTTP status code returned by the server.
      - statusLine  
      string

      HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
    - asyncCallback  
    function optional  
    Chrome 58+


    The `asyncCallback` parameter looks like:  

    ```typescript
    (response: BlockingResponse) => void
    ```

    <br />

      - response  
  [BlockingResponse](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse)  
    - returns  
    [BlockingResponse](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse) \| undefined

    If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnAuthRequiredOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnAuthRequiredOptions)\[\] optional  

### onBeforeRedirect

```typescript
chrome.webRequest.onBeforeRedirect.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnBeforeRedirectOptions[],
)
```

Fired when a server-initiated redirect is about to occur.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - fromCache  
      boolean

      Indicates if this response was fetched from disk cache.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - ip  
      string optional

      The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - redirectUrl  
      string

      The new URL.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - responseHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP response headers that were received along with this redirect.
      - statusCode  
      number

      Standard HTTP status code returned by the server.
      - statusLine  
      string

      HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnBeforeRedirectOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnBeforeRedirectOptions)\[\] optional  

### onBeforeRequest

```typescript
chrome.webRequest.onBeforeRequest.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnBeforeRequestOptions[],
)
```

Fired when a request is about to occur.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => BlockingResponse | undefined
  ```

  <br />

    - details  
    object  
      - documentId  
      string optional  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle) optional  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType) optional  
      Chrome 106+

      The type of frame the request occurred in.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestBody  
      object optional

      Contains the HTTP request body data. Only provided if extraInfoSpec contains 'requestBody'.  
        - error  
        string optional

        Errors when obtaining request body data.
        - formData  
        object optional

        If the request method is POST and the body is a sequence of key-value pairs encoded in UTF8, encoded as either multipart/form-data, or application/x-www-form-urlencoded, this dictionary is present and for each key contains the list of all values for that key. If the data is of another media type, or if it is malformed, the dictionary is not present. An example value of this dictionary is {'key': \['value1', 'value2'\]}.
        - raw  
        [UploadData](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-UploadData)\[\] optional

        If the request method is PUT or POST, and the body is not already parsed in formData, then the unparsed request body elements are contained in this array.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
  string  
    - returns  
    [BlockingResponse](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse) \| undefined

    If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnBeforeRequestOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnBeforeRequestOptions)\[\] optional  

### onBeforeSendHeaders

```typescript
chrome.webRequest.onBeforeSendHeaders.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnBeforeSendHeadersOptions[],
)
```

Fired before sending an HTTP request, once the request headers are available. This may occur after a TCP connection is made to the server, but before any HTTP data is sent.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => BlockingResponse | undefined
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP request headers that are going to be sent out with this request.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
  string  
    - returns  
    [BlockingResponse](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse) \| undefined

    If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnBeforeSendHeadersOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnBeforeSendHeadersOptions)\[\] optional  

### onCompleted

```typescript
chrome.webRequest.onCompleted.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnCompletedOptions[],
)
```

Fired when a request is completed.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - fromCache  
      boolean

      Indicates if this response was fetched from disk cache.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - ip  
      string optional

      The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - responseHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP response headers that were received along with this response.
      - statusCode  
      number

      Standard HTTP status code returned by the server.
      - statusLine  
      string

      HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnCompletedOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnCompletedOptions)\[\] optional  

### onErrorOccurred

```typescript
chrome.webRequest.onErrorOccurred.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnErrorOccurredOptions[],
)
```

Fired when an error occurs.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request. This value is not present if the request is a navigation of a frame.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - error  
      string

      The error description. This string is *not* guaranteed to remain backwards compatible between releases. You must not parse and act based upon its content.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - fromCache  
      boolean

      Indicates if this response was fetched from disk cache.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - ip  
      string optional

      The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnErrorOccurredOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnErrorOccurredOptions)\[\] optional  

### onHeadersReceived

```typescript
chrome.webRequest.onHeadersReceived.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnHeadersReceivedOptions[],
)
```

Fired when HTTP response headers of a request have been received.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => BlockingResponse | undefined
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - responseHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP response headers that have been received with this response.
      - statusCode  
      number  
      Chrome 43+

      Standard HTTP status code returned by the server.
      - statusLine  
      string

      HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line).
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
  string  
    - returns  
    [BlockingResponse](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-BlockingResponse) \| undefined

    If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnHeadersReceivedOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnHeadersReceivedOptions)\[\] optional  

### onResponseStarted

```typescript
chrome.webRequest.onResponseStarted.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnResponseStartedOptions[],
)
```

Fired when the first byte of the response body is received. For HTTP requests, this means that the status line and response headers are available.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - fromCache  
      boolean

      Indicates if this response was fetched from disk cache.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - ip  
      string optional

      The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - responseHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP response headers that were received along with this response.
      - statusCode  
      number

      Standard HTTP status code returned by the server.
      - statusLine  
      string

      HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
[OnResponseStartedOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnResponseStartedOptions)\[\] optional  

### onSendHeaders

```typescript
chrome.webRequest.onSendHeaders.addListener(
  callback: function,
  filter: RequestFilter,
  extraInfoSpec?: OnSendHeadersOptions[],
)
```

Fired just before a request is going to be sent to the server (modifications of previous onBeforeSendHeaders callbacks are visible by the time onSendHeaders is fired).  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (details: object) => void
  ```

  <br />

    - details  
    object  
      - documentId  
      string  
      Chrome 106+

      The UUID of the document making the request.
      - documentLifecycle  
      [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-DocumentLifecycle)  
      Chrome 106+

      The lifecycle the document is in.
      - frameId  
      number

      The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
      - frameType  
      [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-FrameType)  
      Chrome 106+

      The type of frame the request occurred in.
      - initiator  
      string optional  
      Chrome 63+

      The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.
      - method  
      string

      Standard HTTP method.
      - parentDocumentId  
      string optional  
      Chrome 106+

      The UUID of the parent document owning this frame. This is not set if there is no parent.
      - parentFrameId  
      number

      ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
      - requestHeaders  
      [HttpHeaders](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-HttpHeaders) optional

      The HTTP request headers that have been sent out with this request.
      - requestId  
      string

      The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
      - tabId  
      number

      The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
      - timeStamp  
      number

      The time when this signal is triggered, in milliseconds since the epoch.
      - type  
      [ResourceType](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-ResourceType)

      How the requested resource will be used.
      - url  
      string
  - filter  
  [RequestFilter](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter)
  - extraInfoSpec  
  [OnSendHeadersOptions](https://developer.chrome.com/docs/extensions/reference/api/webRequest#type-OnSendHeadersOptions)\[\] optional

<br />

---

## 70. windows

*File: pages/windows.md*

# chrome.windows

<br />

<br />

## Description

Use the `chrome.windows` API to interact with browser windows. You can use this API to create, modify, and rearrange windows in the browser.

<br />

<br />

## Permissions

When requested, a [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) contains an array of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab) objects. You must
declare the `"tabs"` permission in your [manifest](https://developer.chrome.com/docs/extensions/reference/api/tabs#manifest) if you need access to the [`url`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-url),
[`pendingUrl`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-pendingUrl), [`title`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-title), or [`favIconUrl`](https://developer.chrome.com/docs/extensions/reference/api/tabs#property-Tab-favIconUrl) properties of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab). For example:  

    {
      "name": "My extension",
      ...
      "permissions": ["tabs"],
      ...
    }

<br />

<br />

## Concepts and usage

### The current window

Many functions in the extension system take an optional `windowId` argument, which defaults to the
current window.

The *current window* is the window that contains the code that is currently executing. It's
important to realize that this can be different from the topmost or focused window.

For example, say an extension creates a few tabs or windows from a single HTML file, and that the
HTML file contains a call to [`tabs.query()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query). The current window is the window that contains the
page that made the call, no matter what the topmost window is.

In the case of [service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers), the value of the current window falls back to the last active
window. Under some circumstances, there may be no current window for background pages.

## Examples

To try this API, install the [windows API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/windows) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.
![Two windows, each with one tab](https://developer.chrome.com/static/docs/extensions/reference/api/windows/images/windows.png) Two windows, each with one tab.

<br />

## Types

### CreateType

Chrome 44+

Specifies what type of browser window to create. 'panel' is deprecated and is available only to existing allowlisted extensions on Chrome OS.  

#### Enum

"normal"   
Specifies the window as a standard window.
"popup"   
Specifies the window as a popup window.
"panel"   
Specifies the window as a panel.

<br />

### QueryOptions

Chrome 88+  

#### Properties

  - populate  
  boolean optional

  If true, the [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) object has a `tabs` property that contains a list of the [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) objects. The `Tab` objects only contain the `url`, `pendingUrl`, `title`, and `favIconUrl` properties if the extension's manifest file includes the `"tabs"` permission.
  - windowTypes  
  [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\] optional

If set, the [`windows.Window`](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) returned is filtered based on its type. If unset, the default filter is set to `['normal', 'popup']`.  

### Window

#### Properties

  - alwaysOnTop  
  boolean

  Whether the window is set to be always on top.
  - focused  
  boolean

  Whether the window is currently the focused window.
  - height  
  number optional

  The height of the window, including the frame, in pixels. In some circumstances a window may not be assigned a `height` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - id  
  number optional

  The ID of the window. Window IDs are unique within a browser session. In some circumstances a window may not be assigned an `ID` property; for example, when querying windows using the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API, in which case a session ID may be present.
  - incognito  
  boolean

  Whether the window is incognito.
  - left  
  number optional

  The offset of the window from the left edge of the screen in pixels. In some circumstances a window may not be assigned a `left` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - sessionId  
  string optional

  The session ID used to uniquely identify a window, obtained from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - state  
  [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional

  The state of this browser window.
  - tabs  
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)\[\] optional

  Array of [`tabs.Tab`](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab) objects representing the current tabs in the window.
  - top  
  number optional

  The offset of the window from the top edge of the screen in pixels. In some circumstances a window may not be assigned a `top` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.
  - type  
  [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType) optional

  The type of browser window this is.
  - width  
  number optional

The width of the window, including the frame, in pixels. In some circumstances a window may not be assigned a `width` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

### WindowState

Chrome 44+

The state of this browser window. In some circumstances a window may not be assigned a `state` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

#### Enum

"normal"   
Normal window state (not minimized, maximized, or fullscreen).
"minimized"   
Minimized window state.
"maximized"   
Maximized window state.
"fullscreen"   
Fullscreen window state.
"locked-fullscreen"   
Locked fullscreen window state. This fullscreen state cannot be exited by user action and is available only to allowlisted extensions on Chrome OS.

<br />

### WindowType

Chrome 44+

The type of browser window this is. In some circumstances a window may not be assigned a `type` property; for example, when querying closed windows from the [`sessions`](https://developer.chrome.com/docs/extensions/reference/sessions/) API.  

#### Enum

"normal"   
A normal browser window.
"popup"   
A browser popup.
"panel"   
*Deprecated in this API.* A Chrome App panel-style window. Extensions can only see their own panel windows.
"app"   
*Deprecated in this API.* A Chrome App window. Extensions can only see their app own windows.
"devtools"   
A Developer Tools window.

<br />

## Properties

### WINDOW_ID_CURRENT

The windowId value that represents the [current window](https://developer.chrome.com/docs/extensions/reference/windows/#the_current_window).  

#### Value

-2   

### WINDOW_ID_NONE

The windowId value that represents the absence of a Chrome browser window.  

#### Value

-1   

## Methods

### create()

```typescript
chrome.windows.create(
  createData?: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window | undefined>
```

Creates (opens) a new browser window with any optional sizing, position, or default URL provided.  

#### Parameters

  - createData  
  object optional  
    - focused  
    boolean optional

    If `true`, opens an active window. If `false`, opens an inactive window.
    - height  
    number optional

    The height in pixels of the new window, including the frame. If not specified, defaults to a natural height.
    - incognito  
    boolean optional

    Whether the new window should be an incognito window.
    - left  
    number optional

    The number of pixels to position the new window from the left edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
    - setSelfAsOpener  
    boolean optional  
    Chrome 64+

    If `true`, the newly-created window's 'window.opener' is set to the caller and is in the same [unit of related browsing contexts](https://www.w3.org/TR/html51/browsers.html#unit-of-related-browsing-contexts) as the caller.
    - state  
    [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional  
    Chrome 44+

    The initial state of the window. The `minimized`, `maximized`, and `fullscreen` states cannot be combined with `left`, `top`, `width`, or `height`.
    - tabId  
    number optional

    The ID of the tab to add to the new window.
    - top  
    number optional

    The number of pixels to position the new window from the top edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
    - type  
    [CreateType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-CreateType) optional

    Specifies what type of browser window to create.
    - url  
    string \| string\[\] optional

    A URL or array of URLs to open as tabs in the window. Fully-qualified URLs must include a scheme, e.g., 'http://www.google.com', not 'www.google.com'. Non-fully-qualified URLs are considered relative within the extension. Defaults to the New Tab Page.
    - width  
    number optional

The width in pixels of the new window, including the frame. If not specified, defaults to a natural width.  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window) \| undefined\>  
Chrome 88+  

### get()

```typescript
chrome.windows.get(
  windowId: number,
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets details about a window.  

#### Parameters

  - windowId  
  number
  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### getAll()

```typescript
chrome.windows.getAll(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window[]>
```

Gets all windows.  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\[\]\>  
Chrome 88+  

### getCurrent()

```typescript
chrome.windows.getCurrent(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets the [current window](https://developer.chrome.com/docs/extensions/reference/windows/#current-window).  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### getLastFocused()

```typescript
chrome.windows.getLastFocused(
  queryOptions?: QueryOptions,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Gets the window that was most recently focused --- typically the window 'on top'.  

#### Parameters

  - queryOptions  
  [QueryOptions](https://developer.chrome.com/docs/extensions/reference/api/windows#type-QueryOptions) optional  
Chrome 88+  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
Chrome 88+  

### remove()

```typescript
chrome.windows.remove(
  windowId: number,
): Promise<void>
```

Removes (closes) a window and all the tabs inside it.  

#### Parameters

  - windowId  
number  

#### Returns

  - Promise\<void\>  
Chrome 88+  

### update()

```typescript
chrome.windows.update(
  windowId: number,
  updateInfo: object,
): Promise<https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window>
```

Updates the properties of a window. Specify only the properties that to be changed; unspecified properties are unchanged.  

#### Parameters

  - windowId  
  number
  - updateInfo  
  object  
    - drawAttention  
    boolean optional

    If `true`, causes the window to be displayed in a manner that draws the user's attention to the window, without changing the focused window. The effect lasts until the user changes focus to the window. This option has no effect if the window already has focus. Set to `false` to cancel a previous `drawAttention` request.
    - focused  
    boolean optional

    If `true`, brings the window to the front; cannot be combined with the state 'minimized'. If `false`, brings the next window in the z-order to the front; cannot be combined with the state 'fullscreen' or 'maximized'.
    - height  
    number optional

    The height to resize the window to in pixels. This value is ignored for panels.
    - left  
    number optional

    The offset from the left edge of the screen to move the window to in pixels. This value is ignored for panels.
    - state  
    [WindowState](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowState) optional

    The new state of the window. The 'minimized', 'maximized', and 'fullscreen' states cannot be combined with 'left', 'top', 'width', or 'height'.
    - top  
    number optional

    The offset from the top edge of the screen to move the window to in pixels. This value is ignored for panels.
    - width  
    number optional

The width to resize the window to in pixels. This value is ignored for panels.  

#### Returns

  - Promise\<[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)\>  
  Chrome 88+

## Events

### onBoundsChanged

Chrome 86+

```typescript
chrome.windows.onBoundsChanged.addListener(
  callback: function,
)
```

Fired when a window has been resized; this event is only dispatched when the new bounds are committed, and not for in-progress changes.  

#### Parameters

  - callback  
  function


  The `callback` parameter looks like:  

  ```typescript
  (window: Window) => void
  ```

  <br />

    - window  
[Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)  

### onCreated

```typescript
chrome.windows.onCreated.addListener(
  callback: function,
  filters?: object,
)
```

Fired when a window is created.  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (window: Window) => void
  ```

  <br />

    - window  
    [Window](https://developer.chrome.com/docs/extensions/reference/api/windows#type-Window)

    Details of the created window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

Conditions that the window's type being created must satisfy. By default it satisfies `['normal', 'popup']`.  

### onFocusChanged

```typescript
chrome.windows.onFocusChanged.addListener(
  callback: function,
  filters?: object,
)
```

Fired when the currently focused window changes. Returns `chrome.windows.WINDOW_ID_NONE` if all Chrome windows have lost focus. **Note:** On some Linux window managers, `WINDOW_ID_NONE` is always sent immediately preceding a switch from one Chrome window to another.  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (windowId: number) => void
  ```

  <br />

    - windowId  
    number

    ID of the newly-focused window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

Conditions that the window's type being removed must satisfy. By default it satisfies `['normal', 'popup']`.  

### onRemoved

```typescript
chrome.windows.onRemoved.addListener(
  callback: function,
  filters?: object,
)
```

Fired when a window is removed (closed).  

#### Parameters

  - callback  
  function  
  Chrome 46+


  The `callback` parameter looks like:  

  ```typescript
  (windowId: number) => void
  ```

  <br />

    - windowId  
    number

    ID of the removed window.
  - filters  
  object optional  
    - windowTypes  
    [WindowType](https://developer.chrome.com/docs/extensions/reference/api/windows#type-WindowType)\[\]

    Conditions that the window's type being removed must satisfy. By default it satisfies `['normal', 'popup']`.

<br />

---
