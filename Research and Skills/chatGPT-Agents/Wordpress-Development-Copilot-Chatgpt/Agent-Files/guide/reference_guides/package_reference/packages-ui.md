# @wordpress/ui – Block Editor Handbook | Developer.WordPress.org

This package is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.

A package that provides React UI components for the WordPress Design System, built on themeable design tokens.

While similar in scope to `@wordpress/components`, there are a few key differences:

-   `@wordpress/components` grew organically as a collection of unrelated UI elements for WordPress screens. In contrast, this package is an implementation of a design system that guarantees user- and developer-facing cohesion between components.
-   Unlike `@wordpress/components`, this package is not bundled as a WordPress script available on the `window.wp` global and is instead distributed as an npm package that follows [semantic versioning](https://semver.org/) for release changes.

This is a companion to the `@wordpress/theme` package that provides:

-   **Design Tokens**: A comprehensive system of design tokens for colors, spacing, typography, and more
-   **Theme System**: A flexible theming provider for consistent theming across applications

## [Installation](#installation)

Install using NPM:

```
npm install @wordpress/ui

```

## [Setup](#setup)

As an implementation of the design system and companion to the `@wordpress/theme` package, these components depend on CSS custom properties defined by the theme package. What you need to set up depends on whether you’re building for a WordPress context, and how much of the theming features you want to use.

### [Within standard WordPress editor screens](#within-standard-wordpress-editor-screens)

In standard WordPress editor screens (such as the post editor or the site editor), stylesheets, isolation styles, and layout styles are managed centrally by Gutenberg. You don’t need to add any setup yourself — and you should avoid doing so in this shared context to prevent conflicts.

### [Elsewhere](#elsewhere)

The components ship with built-in fallback values for all CSS custom properties, so they work out of the box without any theme setup. For full theming capabilities, it’s recommended that you install and load the design tokens stylesheet:

```
npm install @wordpress/theme

```
```
import '@wordpress/theme/design-tokens.css';

```

This stylesheet is universal and does not have a separate RTL version.

Also, to ensure that portaled popovers appear correctly, add these isolation styles to your application’s layout root element:

```
.root {
    isolation: isolate;
}

```

Finally, in order to support overlay elements such as backdrops to correctly cover the whole browser viewport even when scrolled, add the following style to your global styles:

```
body {
    position: relative;
}

```

## [Usage](#usage)

### [Basic Component Usage](#basic-component-usage)

```
import { Stack } from '@wordpress/ui';

function MyComponent() {
    return (
        <Stack gap="sm">
            <div>Item 1</div>
            <div>Item 2</div>
        </Stack>
    );
}

```

## [Core Design Principles](#core-design-principles)

All components in the design system follow consistent patterns for maximum flexibility and developer experience:

### [Custom Rendering](#custom-rendering)

Every component supports the `render` prop for complete control over the underlying HTML element:

```
import { Stack } from '@wordpress/ui';

function MyComponent() {
    // Render Stack as a <section /> instead of the default <div />
    return <Stack render={ <section /> }>{ /* ... */ }</Stack>;
}

```

### [Ref Forwarding](#ref-forwarding)

All components forward refs to their underlying DOM elements:

```
import { useRef } from '@wordpress/element';
import { Stack } from '@wordpress/ui';

function MyComponent() {
    const stackRef = useRef< HTMLDivElement >( null );

    return <Stack ref={ stackRef }>{ /* ... */ }</Stack>;
}

```

### [Automatic className Merging](#automatic-classname-merging)

Components merge provided `className` props with their internal styles:

```
import { Stack } from '@wordpress/ui';

function MyComponent() {
    // Your custom CSS className is merged with component styles
    return <Stack className="my-custom-class">{ /* ... */ }</Stack>;
}

```

### [Controlled and Uncontrolled Modes](#controlled-and-uncontrolled-modes)

Interactive components that manage internal state (such as open/closed, selected value, etc.) follow a consistent prop naming convention that supports both **controlled** and **uncontrolled** usage.

#### [Prop naming pattern](#prop-naming-pattern)

For a given state `x`, the convention is:

Prop

Purpose

`defaultX`

Sets the initial value in **uncontrolled** mode. The component manages subsequent state changes internally.

`x`

Sets the current value in **controlled** mode. The consumer is responsible for updating the value in response to changes.

`onXChange`

Callback invoked when the state changes. Receives the new value as its first argument. Works in both controlled and uncontrolled modes.

For example, a component with an open/closed state would expose:

-   `defaultOpen` — initial open state (uncontrolled)
-   `open` — current open state (controlled)
-   `onOpenChange` — called when the open state changes

And a component with a selectable value would expose:

-   `defaultValue` — initial value (uncontrolled)
-   `value` — current value (controlled)
-   `onValueChange` — called when the value changes

#### [Uncontrolled usage](#uncontrolled-usage)

In uncontrolled mode, the component manages its own state. Use `defaultX` to set the initial value, and optionally `onXChange` to react to changes:

```
import { Tabs } from '@wordpress/ui';

function MyTabs() {
    return (
        <Tabs.Root
            defaultValue="tab1"
            onValueChange={ ( value ) => console.log( value ) }
        >
            <Tabs.List>
                <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
                <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
        </Tabs.Root>
    );
}

```

#### [Controlled usage](#controlled-usage)

In controlled mode, the consumer owns the state and passes it via `x`. State changes are handled through `onXChange`:

```
import { useState } from '@wordpress/element';
import { CollapsibleCard } from '@wordpress/ui';

function MyCard() {
    const [ isOpen, setIsOpen ] = useState( false );

    return (
        <CollapsibleCard.Root open={ isOpen } onOpenChange={ setIsOpen }>
            <CollapsibleCard.Header>Details</CollapsibleCard.Header>
            <CollapsibleCard.Content>
                Collapsible content here.
            </CollapsibleCard.Content>
        </CollapsibleCard.Root>
    );
}

```

When both `x` and `defaultX` are provided, `x` takes precedence and the component behaves in controlled mode. When neither is provided, the component uses its own internal default (typically documented via a `@default` JSDoc tag on the `defaultX` prop).

#### [Difference from native onChange](#difference-from-native-onchange)

The `onXChange` callback is distinct from the native DOM `onChange` event handler. Native `onChange` fires a `React.ChangeEvent` tied to a specific DOM element, while `onXChange` provides the new **value** directly — making it simpler to use and consistent across all components, including compound and non-form components.

Components that wrap native form elements may still support native event handlers (like `onChange`, `onInput`) for interoperability, but `onXChange` is the recommended approach within this package.

When designing props for a new component:

-   Always offer both controlled and uncontrolled modes when the component has user-facing state.
-   Name the uncontrolled prop `defaultX`, the controlled prop `x`, and the callback `onXChange`.
-   In JSDoc comments, indicate which mode each prop is for and cross-reference the alternative:  
    “\`ts  
    /\*\*
    -   Whether the panel is currently open (controlled).
    
    -   To render an uncontrolled component, use the `defaultOpen` prop instead.  
        \*/  
        open?: boolean;  
        /\*\*
    -   Whether the panel is initially open (uncontrolled).
    -   @default false  
        \*/  
        defaultOpen?: boolean;  
        /\*\*
    -   Event handler called when the open state changes.  
        \*/  
        onOpenChange?: ( open: boolean ) => void;  
        “\`
-   Provide a `@default` JSDoc tag for the uncontrolled prop when there is a sensible default.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).