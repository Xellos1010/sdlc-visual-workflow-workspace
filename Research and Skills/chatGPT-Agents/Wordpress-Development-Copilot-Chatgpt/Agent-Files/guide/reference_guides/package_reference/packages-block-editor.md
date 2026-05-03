# @wordpress/block-editor – Block Editor Handbook | Developer.WordPress.org

This module allows you to create and use standalone block editors.

## [Installation](#installation)

Install the module

```
npm install @wordpress/block-editor --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Usage](#usage)

```
import { useState } from 'react';
import {
    BlockCanvas,
    BlockEditorProvider,
    BlockList,
} from '@wordpress/block-editor';

function MyEditorComponent() {
    const [ blocks, updateBlocks ] = useState( [] );

    return (
        <BlockEditorProvider
            value={ blocks }
            onInput={ ( blocks ) => updateBlocks( blocks ) }
            onChange={ ( blocks ) => updateBlocks( blocks ) }
        >
            <BlockCanvas height="400px" />
        </BlockEditorProvider>
    );
}

// Make sure to load the block editor stylesheets too
// import '@wordpress/components/build-style/style.css';
// import '@wordpress/block-editor/build-style/style.css';

```

In this example, we’re instantiating a block editor. A block editor is composed by a `BlockEditorProvider` wrapper component where you pass the current array of blocks and on each change the `onInput` or `onChange` callbacks are called depending on whether the change is considered persistent or not.

Inside `BlockEditorProvider`, you can nest any of the available `@wordpress/block-editor` UI components to build the UI of your editor.

In the example above we’re rendering the `BlockList` to show and edit the block list. For instance we could add a custom sidebar and use the `BlockInspector` component to be able to edit the advanced settings for the currently selected block. (See the [API](#api) for the list of all the available components).

The `BlockTools` component is used to render the toolbar for a selected block.

In the example above, there’s no registered block type, in order to use the block editor successfully make sure to register some block types. For instance, registering the core block types can be done like so:

```
import { registerCoreBlocks } from '@wordpress/block-library';

registerCoreBlocks();

// Make sure to load the block stylesheets too
// import '@wordpress/block-library/build-style/style.css';
// import '@wordpress/block-library/build-style/editor.css';
// import '@wordpress/block-library/build-style/theme.css';

```

## [API](#api)

Any components in this package that have a counterpart in [@wordpress/components](https://developer.wordpress.org/block-editor/reference-guide/components/) are an extension of those components.

Unless you’re [creating an editor](https://developer.wordpress.org/block-editor/how-to-guides/platform/custom-block-editor/), it is recommended that the components in @wordpress/components should be used rather than the ones in this package as these components have been customized for use in an editor and may result in unexpected behaviour if used outside of this context.

### [AlignmentControl](#alignmentcontrol)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/alignment-control/README.md)

### [AlignmentToolbar](#alignmenttoolbar)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/alignment-control/README.md)

### [Autocomplete](#autocomplete)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/autocomplete/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/autocomplete/README.md)

### [BlockAlignmentControl](#blockalignmentcontrol)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-alignment-control/README.md)

### [BlockAlignmentToolbar](#blockalignmenttoolbar)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-alignment-control/README.md)

### [BlockBindingsAttributeControl](#blockbindingsattributecontrol)

Internal dependencies

### [BlockBindingsSourceFieldsList](#blockbindingssourcefieldslist)

Undocumented declaration.

### [BlockBreadcrumb](#blockbreadcrumb)

Block breadcrumb component, displaying the hierarchy of the current block selection as a breadcrumb.

*Parameters*

-   *props* `Object`: Component props.
-   *props.rootLabelText* `string`: Translated label for the root element of the breadcrumb trail.

*Returns*

-   `Element`: Block Breadcrumb.

### [BlockCanvas](#blockcanvas)

BlockCanvas component is a component used to display the canvas of the block editor. What we call the canvas is an iframe containing the block list that you can manipulate. The component is also responsible of wiring up all the necessary hooks to enable the keyboard navigation across blocks in the editor and inject content styles into the iframe.

*Usage*

```
function MyBlockEditor() {
    const [ blocks, updateBlocks ] = useState( [] );
    return (
        <BlockEditorProvider
            value={ blocks }
            onInput={ updateBlocks }
            onChange={ persistBlocks }
        >
            <BlockCanvas height="400px" />
        </BlockEditorProvider>
    );
}

```

*Parameters*

-   *props* `Object`: Component props.
-   *props.height* `string`: Canvas height, defaults to 300px.
-   *props.styles* `Array`: Content styles to inject into the iframe.
-   *props.children* `Element`: Content of the canvas, defaults to the BlockList component.

*Returns*

-   `Element`: Block Breadcrumb.

Undocumented declaration.

### [BlockContextProvider](#blockcontextprovider)

Component which merges passed value with current consumed block context.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-context/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-context/README.md)

*Parameters*

-   *props* `BlockContextProviderProps`:

### [BlockControls](#blockcontrols)

Undocumented declaration.

### [BlockEdit](#blockedit)

Undocumented declaration.

### [BlockEditorKeyboardShortcuts](#blockeditorkeyboardshortcuts)

Undocumented declaration.

### [BlockEditorProvider](#blockeditorprovider)

Undocumented declaration.

### [BlockFormatControls](#blockformatcontrols)

Undocumented declaration.

### [BlockIcon](#blockicon)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-icon/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-icon/README.md)

### [BlockInspector](#blockinspector)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-inspector/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-inspector/README.md)

### [BlockList](#blocklist)

Undocumented declaration.

### [BlockMover](#blockmover)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-mover/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-mover/README.md)

### [BlockNavigationDropdown](#blocknavigationdropdown)

Undocumented declaration.

### [BlockPopover](#blockpopover)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-popover/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-popover/README.md)

### [BlockPreview](#blockpreview)

BlockPreview renders a preview of a block or array of blocks.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-preview/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-preview/README.md)

*Parameters*

-   *preview* `Object`: options for how the preview should be shown
-   *preview.blocks* `Array|Object`: A block instance (object) or an array of blocks to be previewed.
-   *preview.viewportWidth* `number`: Width of the preview container in pixels. Controls at what size the blocks will be rendered inside the preview. Default: 700.

*Returns*

-   `Component`: The component to be rendered.

### [BlockSelectionClearer](#blockselectionclearer)

Undocumented declaration.

Undocumented declaration.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-settings-menu-controls/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-settings-menu-controls/README.md)

*Parameters*

-   *props* `Object`: Fill props.

*Returns*

-   `Element`: Element.

### [BlockStyles](#blockstyles)

Undocumented declaration.

### [BlockTitle](#blocktitle)

Renders the block’s configured title as a string, or empty if the title cannot be determined.

*Usage*

```
<BlockTitle
    clientId="afd1cb17-2c08-4e7a-91be-007ba7ddc3a1"
    maximumLength={ 17 }
/>

```

*Parameters*

-   *props* `Object`:
-   *props.clientId* `string`: Client ID of block.
-   *props.maximumLength* `number|undefined`: The maximum length that the block title string may be before truncated.
-   *props.context* `string|undefined`: The context to pass to `getBlockLabel`.

*Returns*

-   `React.JSX.Element`: Block title.

### [BlockToolbar](#blocktoolbar)

Renders the block toolbar.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-toolbar/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-toolbar/README.md)

*Parameters*

-   *props* `Object`: Components props.
-   *props.hideDragHandle* `boolean`: Show or hide the Drag Handle for drag and drop functionality.
-   *props.variant* `string`: Style variant of the toolbar, also passed to the Dropdowns rendered from Block Toolbar Buttons.

### [BlockTools](#blocktools)

Renders block tools (the block toolbar, select/navigation mode toolbar, the insertion point and a slot for the inline rich text toolbar). Must be wrapped around the block content and editor styles wrapper or iframe.

*Parameters*

-   *$0* `Object`: Props.
-   *$0.children* `Object`: The block content and style container.
-   *$0.\_\_unstableContentRef* `Object`: Ref holding the content scroll container.

### [BlockVerticalAlignmentControl](#blockverticalalignmentcontrol)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-vertical-alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-vertical-alignment-control/README.md)

### [BlockVerticalAlignmentToolbar](#blockverticalalignmenttoolbar)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-vertical-alignment-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-vertical-alignment-control/README.md)

### [ButtonBlockAppender](#buttonblockappender)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/button-block-appender/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/button-block-appender/README.md)

### [ButtonBlockerAppender](#buttonblockerappender)

> **Deprecated**

Use `ButtonBlockAppender` instead.

### [ColorPalette](#colorpalette)

Undocumented declaration.

### [ColorPaletteControl](#colorpalettecontrol)

Undocumented declaration.

### [ContrastChecker](#contrastchecker)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/contrast-checker/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/contrast-checker/README.md)

### [CopyHandler](#copyhandler)

> **Deprecated**

*Parameters*

-   *props* `Object`:

### [createCustomColorsHOC](#createcustomcolorshoc)

A higher-order component factory for creating a ‘withCustomColors’ HOC, which handles color logic for class generation color value, retrieval and color attribute setting.

Use this higher-order component to work with a custom set of colors.

*Usage*

```
const CUSTOM_COLORS = [
    { name: 'Red', slug: 'red', color: '#ff0000' },
    { name: 'Blue', slug: 'blue', color: '#0000ff' },
];
const withCustomColors = createCustomColorsHOC( CUSTOM_COLORS );
// ...
export default compose(
    withCustomColors( 'backgroundColor', 'borderColor' ),
    MyColorfulComponent
);

```

*Parameters*

-   *colorsArray* `Array`: The array of color objects (name, slug, color, etc… ).

*Returns*

-   `Function`: Higher-order component.

### [DefaultBlockAppender](#defaultblockappender)

Undocumented declaration.

### [DimensionControl](#dimensioncontrol)

DimensionControl renders a linked unit control and range control for adjusting dimensions of a block.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/dimension-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/dimension-control/README.md)

*Parameters*

-   *props* `Object`:
-   *props.label* `?string`: A label for the control.
-   *props.onChange* `( value: string ) => void`: Called when the dimension value changes.
-   *props.value* `string`: The current dimension value.
-   *props.dimensionSizes* `?Object`: Optional dimension size presets. Falls back to settings from the store.

*Returns*

-   `Component`: The component to be rendered.

### [FontSizePicker](#fontsizepicker)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/font-sizes/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/font-sizes/README.md)

### [getColorClassName](#getcolorclassname)

Returns a class based on the context a color is being used and its slug.

*Parameters*

-   *colorContextName* `string`: Context/place where color is being used e.g: background, text etc…
-   *colorSlug* `string`: Slug of the color.

*Returns*

-   `?string`: String with the class corresponding to the color in the provided context. Returns undefined if either colorContextName or colorSlug are not provided.

### [getColorObjectByAttributeValues](#getcolorobjectbyattributevalues)

Provided an array of color objects as set by the theme or by the editor defaults, and the values of the defined color or custom color returns a color object describing the color.

*Parameters*

-   *colors* `Array`: Array of color objects as set by the theme or by the editor defaults.
-   *definedColor* `?string`: A string containing the color slug.
-   *customColor* `?string`: A string containing the customColor value.

*Returns*

-   `?Object`: If definedColor is passed and the name is found in colors, the color object exactly as set by the theme or editor defaults is returned. Otherwise, an object that just sets the color is defined.

### [getColorObjectByColorValue](#getcolorobjectbycolorvalue)

Provided an array of color objects as set by the theme or by the editor defaults, and a color value returns the color object matching that value or undefined.

*Parameters*

-   *colors* `Array`: Array of color objects as set by the theme or by the editor defaults.
-   *colorValue* `?string`: A string containing the color value.

*Returns*

-   `?Object`: Color object included in the colors array whose color property equals colorValue. Returns undefined if no color object matches this requirement.

### [getComputedFluidTypographyValue](#getcomputedfluidtypographyvalue)

Computes a fluid font-size value that uses clamp(). A minimum and maximum font size OR a single font size can be specified.

If a single font size is specified, it is scaled up and down using a logarithmic scale.

*Usage*

```
// Calculate fluid font-size value from a minimum and maximum value.
const fontSize = getComputedFluidTypographyValue( {
    minimumFontSize: '20px',
    maximumFontSize: '45px',
} );
// Calculate fluid font-size value from a single font size.
const fontSize = getComputedFluidTypographyValue( {
    fontSize: '30px',
} );

```

*Parameters*

-   *args* `Object`:
-   *args.minimumViewportWidth* `?string`: Minimum viewport size from which type will have fluidity. Optional if fontSize is specified.
-   *args.maximumViewportWidth* `?string`: Maximum size up to which type will have fluidity. Optional if fontSize is specified.
-   *args.fontSize* `[string|number]`: Size to derive maximumFontSize and minimumFontSize from, if necessary. Optional if minimumFontSize and maximumFontSize are specified.
-   *args.maximumFontSize* `?string`: Maximum font size for any clamp() calculation. Optional.
-   *args.minimumFontSize* `?string`: Minimum font size for any clamp() calculation. Optional.
-   *args.scaleFactor* `?number`: A scale factor to determine how fast a font scales within boundaries. Optional.
-   *args.minimumFontSizeLimit* `?string`: The smallest a calculated font size may be. Optional.

*Returns*

-   `string|null`: A font-size value using clamp().

### [getCustomValueFromPreset](#getcustomvaluefrompreset)

Converts a spacing preset into a custom value.

*Parameters*

-   *value* `string`: Value to convert
-   *spacingSizes* `Array`: Array of the current spacing preset objects

*Returns*

-   `string`: Mapping of the spacing preset to its equivalent custom value.

### [getDimensionsClassesAndStyles](#getdimensionsclassesandstyles)

Provides the CSS class names and inline styles for a block’s dimensions support attributes.

*Parameters*

-   *attributes* `Object`: Block attributes.

*Returns*

-   `Object`: Dimensions block support derived CSS classes & styles.

### [getFontSize](#getfontsize)

Returns the font size object based on an array of named font sizes and the namedFontSize and customFontSize values. If namedFontSize is undefined or not found in fontSizes an object with just the size value based on customFontSize is returned.

*Parameters*

-   *fontSizes* `Array`: Array of font size objects containing at least the “name” and “size” values as properties.
-   *fontSizeAttribute* `?string`: Content of the font size attribute (slug).
-   *customFontSizeAttribute* `?number`: Contents of the custom font size attribute (value).

*Returns*

-   `?Object`: If fontSizeAttribute is set and an equal slug is found in fontSizes it returns the font size object for that slug. Otherwise, an object with just the size value based on customFontSize is returned.

### [getFontSizeClass](#getfontsizeclass)

Returns a class based on fontSizeName.

*Parameters*

-   *fontSizeSlug* `string`: Slug of the fontSize.

*Returns*

-   `string | undefined`: String with the class corresponding to the fontSize passed. The class is generated by appending ‘has-‘ followed by fontSizeSlug in kebabCase and ending with ‘-font-size’.

### [getFontSizeObjectByValue](#getfontsizeobjectbyvalue)

Returns the corresponding font size object for a given value.

*Parameters*

-   *fontSizes* `Array`: Array of font size objects.
-   *value* `number`: Font size value.

*Returns*

-   `Object`: Font size object.

### [getGradientSlugByValue](#getgradientslugbyvalue)

Retrieves the gradient slug per slug.

*Parameters*

-   *gradients* `Array`: Gradient Palette
-   *value* `string`: Gradient value

*Returns*

-   `string`: Gradient slug.

### [getGradientValueBySlug](#getgradientvaluebyslug)

Retrieves the gradient value per slug.

*Parameters*

-   *gradients* `Array`: Gradient Palette
-   *slug* `string`: Gradient slug

*Returns*

-   `string`: Gradient value.

### [getPxFromCssUnit](#getpxfromcssunit)

> **Deprecated**

This function was accidentally exposed for mobile/native usage.

*Returns*

-   `string`: Empty string.

### [getSpacingPresetCssVar](#getspacingpresetcssvar)

Converts a spacing preset into a custom value.

*Parameters*

-   *value* `string`: Value to convert.

*Returns*

-   `string | undefined`: CSS var string for given spacing preset value.

### [getTypographyClassesAndStyles](#gettypographyclassesandstyles)

Provides the CSS class names and inline styles for a block’s typography support attributes.

*Parameters*

-   *attributes* `Object`: Block attributes.
-   *settings* `Object|boolean`: Merged theme.json settings

*Returns*

-   `Object`: Typography block support derived CSS classes & styles.

### [HeadingLevelDropdown](#headingleveldropdown)

Dropdown for selecting a heading level (1 through 6) or paragraph (0).

*Parameters*

-   *props* `WPHeadingLevelDropdownProps`: Component props.

*Returns*

-   `ComponentType`: The toolbar.

### [HeightControl](#heightcontrol)

> **Deprecated** Use DimensionControl instead.

HeightControl renders a linked unit control and range control for adjusting the height of a block.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/height-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/height-control/README.md)

*Parameters*

-   *props* `Object`:
-   *props.label* `?string`: A label for the control.
-   *props.onChange* `( value: string ) => void`: Called when the height changes.
-   *props.value* `string`: The current height value.

*Returns*

-   `Component`: The component to be rendered.

### [InnerBlocks](#innerblocks)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inner-blocks/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inner-blocks/README.md)

### [Inserter](#inserter)

Undocumented declaration.

### [InspectorAdvancedControls](#inspectoradvancedcontrols)

Undocumented declaration.

### [InspectorControls](#inspectorcontrols)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inspector-controls/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inspector-controls/README.md)

### [isValueSpacingPreset](#isvaluespacingpreset)

Checks is given value is a spacing preset.

*Parameters*

-   *value* `string`: Value to check

*Returns*

-   `boolean`: Return true if value is string in format var:preset|spacing|.

### [JustifyContentControl](#justifycontentcontrol)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/justify-content-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/justify-content-control/README.md)

### [JustifyToolbar](#justifytoolbar)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/justify-content-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/justify-content-control/README.md)

### [LineHeightControl](#lineheightcontrol)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/line-height-control/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/line-height-control/README.md)

### [LinkControl](#linkcontrol)

Renders a link control. A link control is a controlled input which maintains a value associated with a link (HTML anchor element) and relevant settings for how that link is expected to behave.

### [Usage Patterns](#usage-patterns)

The component does not support a fully controlled implementation, but it does support an observable implementation.

### [Uncontrolled (default)](#uncontrolled-default)

The component manages its own search input state:

```
<LinkControl value={ link } onChange={ setLink } />

```

### [Observable](#observable)

Observe input changes without controlling the value:

```
<LinkControl
    value={ link }
    onChange={ setLink }
    onInputChange={ ( newValue ) => console.log( newValue ) }
/>

```

### [Uncontrolled with Initial Value](#uncontrolled-with-initial-value)

Pre-populate the search input with a default value:

```
<LinkControl
    value={ link }
    onChange={ setLink }
    inputValue="wordpress"
    onInputChange={ ( newValue ) => console.log( newValue ) }
/>

```

*Parameters*

-   *props* `WPLinkControlProps`: Component props.

### [MediaPlaceholder](#mediaplaceholder)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-placeholder/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-placeholder/README.md)

### [MediaReplaceFlow](#mediareplaceflow)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-replace-flow/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-replace-flow/README.md)

### [MediaUpload](#mediaupload)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md)

### [MediaUploadCheck](#mediauploadcheck)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md)

### [MultiSelectScrollIntoView](#multiselectscrollintoview)

> **Deprecated**

Scrolls the multi block selection end into view if not in view already. This is important to do after selection by keyboard.

### [NavigableToolbar](#navigabletoolbar)

Undocumented declaration.

### [ObserveTyping](#observetyping)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/observe-typing/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/observe-typing/README.md)

### [PanelColorSettings](#panelcolorsettings)

Undocumented declaration.

### [PlainText](#plaintext)

Render an auto-growing textarea allow users to fill any textual content.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/plain-text/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/plain-text/README.md)

*Usage*

```
import { registerBlockType } from '@wordpress/blocks';
import { PlainText } from '@wordpress/block-editor';

registerBlockType( 'my-plugin/example-block', {
    // ...

    attributes: {
        content: {
            type: 'string',
        },
    },

    edit( { className, attributes, setAttributes } ) {
        return (
            <PlainText
                className={ className }
                value={ attributes.content }
                onChange={ ( content ) => setAttributes( { content } ) }
            />
        );
    },
} );

```

*Parameters*

-   *props* `Object`: Component props.
-   *props.value* `string`: String value of the textarea.
-   *props.onChange* `Function`: Function called when the text value changes.
-   *props.ref* `[Object]`: The component forwards the `ref` property to the `TextareaAutosize` component.

*Returns*

-   `Element`: Plain text component

### [privateApis](#privateapis)

Private @wordpress/block-editor APIs.

### [RecursionProvider](#recursionprovider)

A React context provider for use with the `useHasRecursion` hook to prevent recursive renders.

Wrap block content with this provider and provide the same `uniqueId` prop as used with `useHasRecursion`.

*Parameters*

-   *props* `Object`:
-   *props.uniqueId* `*`: Any value that acts as a unique identifier for a block instance.
-   *props.blockName* `string`: Optional block name.
-   *props.children* `React.JSX.Element`: React children.

*Returns*

-   `React.JSX.Element`: A React element.

### [RichText](#richtext)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/rich-text/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/rich-text/README.md)

### [RichTextShortcut](#richtextshortcut)

Undocumented declaration.

### [RichTextToolbarButton](#richtexttoolbarbutton)

Undocumented declaration.

### [SETTINGS\_DEFAULTS](#settings_defaults)

The default editor settings

*Type Definition*

-   *SETTINGS\_DEFAULT* `Object`

*Properties*

-   *alignWide* `boolean`: Enable/Disable Wide/Full Alignments
-   *supportsLayout* `boolean`: Enable/disable layouts support in container blocks.
-   *imageEditing* `boolean`: Image Editing settings set to false to disable.
-   *imageSizes* `Array`: Available image sizes
-   *maxWidth* `number`: Max width to constraint resizing
-   *allowedBlockTypes* `boolean|Array`: Allowed block types
-   *hasFixedToolbar* `boolean`: Whether or not the editor toolbar is fixed
-   *distractionFree* `boolean`: Whether or not the editor UI is distraction free
-   *focusMode* `boolean`: Whether the focus mode is enabled or not
-   *styles* `Array`: Editor Styles
-   *keepCaretInsideBlock* `boolean`: Whether caret should move between blocks in edit mode
-   *bodyPlaceholder* `string`: Empty post placeholder
-   *titlePlaceholder* `string`: Empty title placeholder
-   *canLockBlocks* `boolean`: Whether the user can manage Block Lock state
-   *codeEditingEnabled* `boolean`: Whether or not the user can switch to the code editor
-   *generateAnchors* `boolean`: Enable/Disable auto anchor generation for Heading blocks
-   *enableOpenverseMediaCategory* `boolean`: Enable/Disable the Openverse media category in the inserter.
-   *clearBlockSelection* `boolean`: Whether the block editor should clear selection on mousedown when a block is not clicked.
-   *\_\_experimentalCanUserUseUnfilteredHTML* `boolean`: Whether the user should be able to use unfiltered HTML or the HTML should be filtered e.g., to remove elements considered insecure like iframes.
-   *\_\_experimentalBlockDirectory* `boolean`: Whether the user has enabled the Block Directory
-   *\_\_experimentalBlockPatterns* `Array`: Array of objects representing the block patterns
-   *\_\_experimentalBlockPatternCategories* `Array`: Array of objects representing the block pattern categories

### [SkipToSelectedBlock](#skiptoselectedblock)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/skip-to-selected-block/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/skip-to-selected-block/README.md)

### [store](#store)

Store definition for the block editor namespace.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore](https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore)

### [storeConfig](#storeconfig)

Block editor data store configuration.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registerStore](https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registerStore)

### [ToolSelector](#toolselector)

This component has been deprecated and no longer renders anything.

### [transformStyles](#transformstyles)

Applies a series of CSS rule transforms to wrap selectors inside a given class and/or rewrite URLs depending on the parameters passed.

*Parameters*

-   *styles* `EditorStyle[]`: CSS rules.
-   *wrapperSelector* `string`: Wrapper selector.
-   *transformOptions* `TransformOptions`: Additional options for style transformation.

*Returns*

-   `Array`: converted rules.

### [Typewriter](#typewriter)

Ensures that the text selection keeps the same vertical distance from the viewport during keyboard events within this component. The vertical distance can vary. It is the last clicked or scrolled to position.

### [URLInput](#urlinput)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-input/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-input/README.md)

### [URLInputButton](#urlinputbutton)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-input/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-input/README.md)

### [URLPopover](#urlpopover)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-popover/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/url-popover/README.md)

### [useBlockBindingsUtils](#useblockbindingsutils)

Retrieves the existing utils needed to update the block `bindings` metadata. They can be used to create, modify, or remove connections from the existing block attributes.

It contains the following utils:

-   `updateBlockBindings`: Updates the value of the bindings connected to block attributes. It can be used to remove a specific binding by setting the value to `undefined`.
-   `removeAllBlockBindings`: Removes the bindings property of the `metadata` attribute.

*Usage*

```
import { useBlockBindingsUtils } from '@wordpress/block-editor';
const { updateBlockBindings, removeAllBlockBindings } = useBlockBindingsUtils();

// Update url and alt attributes.
updateBlockBindings( {
    url: {
        source: 'core/post-meta',
        args: {
            key: 'url_custom_field',
        },
    },
    alt: {
        source: 'core/post-meta',
        args: {
            key: 'text_custom_field',
        },
    },
} );

// Remove binding from url attribute.
updateBlockBindings( { url: undefined } );

// Remove bindings from all attributes.
removeAllBlockBindings();

```

*Parameters*

-   *clientId* `?string`: Optional block client ID. If not set, it will use the current block client ID from the context.

*Returns*

-   `?WPBlockBindingsUtils`: Object containing the block bindings utils.

*Changelog*

`6.7.0` Introduced in WordPress core.

### [useBlockCommands](#useblockcommands)

Undocumented declaration.

### [useBlockDisplayInformation](#useblockdisplayinformation)

Hook used to try to find a matching block variation and return the appropriate information for display reasons. In order to to try to find a match we need to things: 1. Block’s client id to extract it’s current attributes. 2. A block variation should have set `isActive` prop to a proper function.

If for any reason a block variation match cannot be found, the returned information come from the Block Type. If no blockType is found with the provided clientId, returns null.

*Parameters*

-   *clientId* `string`: Block’s client id.

*Returns*

-   `?WPBlockDisplayInformation`: Block’s display information, or `null` when the block or its type not found.

### [useBlockEditContext](#useblockeditcontext)

The `useBlockEditContext` hook provides information about the block this hook is being used in. It returns an object with the `name`, `isSelected` state, and the `clientId` of the block. It is useful if you want to create custom hooks that need access to the current blocks clientId but don’t want to rely on the data getting passed in as a parameter.

*Returns*

-   `Object`: Block edit context

### [useBlockEditingMode](#useblockeditingmode)

Allows a block to restrict the user interface that is displayed for editing that block and its inner blocks.

*Usage*

```
function MyBlock( { attributes, setAttributes } ) {
    useBlockEditingMode( 'disabled' );
    return <div { ...useBlockProps() }></div>;
}

```

`mode` can be one of three options:

-   `'disabled'`: Prevents editing the block entirely, i.e. it cannot be  
    selected.
-   `'contentOnly'`: Hides all non-content UI, e.g. auxiliary controls in the  
    toolbar, the block movers, block settings.
-   `'default'`: Allows editing the block as normal.

The mode is inherited by all of the block’s inner blocks, unless they have  
their own mode.

If called outside of a block context, the mode is applied to all blocks.

*Parameters*

-   *mode* `?BlockEditingMode`: The editing mode to apply. If undefined, the current editing mode is not changed.

*Returns*

-   `BlockEditingMode`: The current editing mode.

### [useBlockProps](#useblockprops)

This hook is used to lightly mark an element as a block element. The element should be the outermost element of a block. Call this hook and pass the returned props to the element to mark as a block. If you define a ref for the element, it is important to pass the ref to this hook, which the hook in turn will pass to the component through the props it returns. Optionally, you can also pass any other props through this hook, and they will be merged and returned.

Use of this hook on the outermost element of a block is required if using API >= v2.

*Usage*

```
import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
    const blockProps = useBlockProps( {
        className: 'my-custom-class',
        style: {
            color: '#222222',
            backgroundColor: '#eeeeee',
        },
    } );

    return <div { ...blockProps }></div>;
}

```

*Parameters*

-   *props* `Object`: Optional. Props to pass to the element. Must contain the ref if one is defined.
-   *options* `Object`: Options for internal use only.
-   *options.\_\_unstableIsHtml* `boolean`:

*Returns*

-   `Object`: Props to pass to the element to mark as a block.

### [useCachedTruthy](#usecachedtruthy)

Keeps an up-to-date copy of the passed value and returns it. If value becomes falsy, it will return the last truthy copy.

*Parameters*

-   *value* `any`:

*Returns*

-   `any`: value

### [useHasRecursion](#usehasrecursion)

A React hook for keeping track of blocks previously rendered up in the block tree. Blocks susceptible to recursion can use this hook in their `Edit` function to prevent said recursion.

Use this with the `RecursionProvider` component, using the same `uniqueId` value for both the hook and the provider.

*Parameters*

-   *uniqueId* `*`: Any value that acts as a unique identifier for a block instance.
-   *blockName* `string`: Optional block name.

*Returns*

-   `boolean`: A boolean describing whether the provided id has already been rendered.

### [useInnerBlocksProps](#useinnerblocksprops)

This hook is used to lightly mark an element as an inner blocks wrapper element. Call this hook and pass the returned props to the element to mark as an inner blocks wrapper, automatically rendering inner blocks as children. If you define a ref for the element, it is important to pass the ref to this hook, which the hook in turn will pass to the component through the props it returns. Optionally, you can also pass any other props through this hook, and they will be merged and returned.

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inner-blocks/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/inner-blocks/README.md)

*Parameters*

-   *props* `Object`: Optional. Props to pass to the element. Must contain the ref if one is defined.
-   *options* `Object`: Optional. Inner blocks options.

### [useSetting](#usesetting)

> **Deprecated** 6.5.0 Use useSettings instead.

Hook that retrieves the given setting for the block instance in use.

It looks up the setting first in the block instance hierarchy. If none is found, it’ll look it up in the block editor settings.

*Usage*

```
const isEnabled = useSetting( 'typography.dropCap' );

```

*Parameters*

-   *path* `string`: The path to the setting.

*Returns*

-   `any`: Returns the value defined for the setting.

### [useSettings](#usesettings)

Hook that retrieves the given settings for the block instance in use.

It looks up the settings first in the block instance hierarchy. If none are found, it’ll look them up in the block editor settings.

*Usage*

```
const [ fixed, sticky ] = useSettings( 'position.fixed', 'position.sticky' );

```

*Parameters*

-   *paths* `string[]`: The paths to the settings.

*Returns*

-   `any[]`: Returns the values defined for the settings.

### [useStyleOverride](#usestyleoverride)

Override a block editor settings style. Leave the ID blank to create a new style.

*Parameters*

-   *override* `Object`: Override object.
-   *override.id* `?string`: Id of the style override, leave blank to create a new style.
-   *override.css* `string`: CSS to apply.

### [Warning](#warning)

*Related*

-   [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/warning/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/warning/README.md)

### [withColorContext](#withcolorcontext)

Undocumented declaration.

### [withColors](#withcolors)

A higher-order component, which handles color logic for class generation color value, retrieval and color attribute setting.

For use with the default editor/theme color palette.

*Usage*

```
export default compose(
    withColors( 'backgroundColor', { textColor: 'color' } ),
    MyColorfulComponent
);

```

*Parameters*

-   *colorTypes* `...(Object|string)`: The arguments can be strings or objects. If the argument is an object, it should contain the color attribute name as key and the color context as value. If the argument is a string the value should be the color attribute name, the color context is computed by applying a kebab case transform to the value. Color context represents the context/place where the color is going to be used. The class name of the color is generated using ‘has’ followed by the color name and ending with the color context all in kebab case e.g: has-green-background-color.

*Returns*

-   `Function`: Higher-order component.

### [withFontSizes](#withfontsizes)

Higher-order component, which handles font size logic for class generation, font size value retrieval, and font size change handling.

*Parameters*

-   *fontSizeNames* `...(Object|string)`: The arguments should all be strings. Each string contains the font size attribute name e.g: ‘fontSize’.

*Returns*

-   `Function`: Higher-order component.

### [WritingFlow](#writingflow)

Handles selection and navigation across blocks. This component should be wrapped around BlockList.

*Parameters*

-   *props* `Object`: Component properties.
-   *props.children* `Element`: Children to be rendered.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).