# @wordpress/keycodes – Block Editor Handbook | Developer.WordPress.org

Keycodes utilities for WordPress, used to check the key pressed in events like `onKeyDown`. Contains keycodes constants for keyboard keys like `DOWN`, `UP`, `ENTER`, etc.

## [Installation](#installation)

Install the module

```
npm install @wordpress/keycodes --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [Usage](#usage)

Check which key was used in an `onKeyDown` event:

```
import { DOWN, ENTER } from '@wordpress/keycodes';

// [...]

onKeyDown( event ) {
    const { keyCode } = event;

    if ( keyCode === DOWN ) {
        alert( 'You pressed the down arrow!' );
    } else if ( keyCode === ENTER ) {
        alert( 'You pressed the enter key!' );
    } else {
        alert( 'You pressed another key.' );
    }
}

```

## [API](#api)

### [ALT](#alt)

Keycode for ALT key.

### [ariaKeyShortcut](#ariakeyshortcut)

An object that contains functions to get shortcuts in a format compatible with the [`aria-keyshortcuts` HTML attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts).

**Note**: The provided shortcut character strings (ie. not the modifiers) should follow the values specified in the [UI Events KeyboardEvent key Values spec](https://www.w3.org/TR/uievents-key/) — for example, “Enter”, “Tab”, “ArrowRight”, “PageDown”, “Escape”, “Plus”, or “F1”. The spacebar key should be represented with the “Space” string (an exception to the UI Events KeyboardEvent key Values spec).

*Related*

-   [https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts](https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts)
-   [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts)
-   [https://www.w3.org/TR/uievents-key/](https://www.w3.org/TR/uievents-key/)

*Usage*

```
// Assuming macOS:
ariaKeyShortcut.primary( 'm' );
// "Meta+M"

ariaKeyShortcut.primaryAlt( 'm' );
// "Meta+Alt+M"

// Assuming Windows:
ariaKeyShortcut.primary( 'm' );
// "Control+M"

ariaKeyShortcut.primaryAlt( 'm' );
// "Control+Alt+M"

ariaKeyShortcut.primaryShift( 'del' );
// "Control+Shift+Delete"

```

### [BACKSPACE](#backspace)

Keycode for BACKSPACE key.

### [COMMAND](#command)

Keycode for COMMAND/META key.

### [CTRL](#ctrl)

Keycode for CTRL key.

### [DELETE](#delete)

Keycode for DELETE key.

### [displayShortcut](#displayshortcut)

An object that contains functions to display shortcuts.

*Usage*

```
// Assuming macOS:
displayShortcut.primary( 'm' );
// "⌘M"

```

Keyed map of functions to display shortcuts.

### [displayShortcutList](#displayshortcutlist)

Return an array of the parts of a keyboard shortcut chord for display.

*Usage*

```
// Assuming macOS:
displayShortcutList.primary( 'm' );
// [ "⌘", "M" ]

```

Keyed map of functions to shortcut sequences.

### [DOWN](#down)

Keycode for DOWN key.

### [END](#end)

Keycode for END key.

### [ENTER](#enter)

Keycode for ENTER key.

### [ESCAPE](#escape)

Keycode for ESCAPE key.

### [F10](#f10)

Keycode for F10 key.

### [HOME](#home)

Keycode for HOME key.

### [isAppleOS](#isappleos)

Return true if platform is MacOS.

*Parameters*

-   *\_window* `Window`: window object by default; used for DI testing.

*Returns*

-   `boolean`: True if MacOS; false otherwise.

### [isKeyboardEvent](#iskeyboardevent)

An object that contains functions to check if a keyboard event matches a predefined shortcut combination.

*Usage*

```
// Assuming an event for ⌘M key press:
isKeyboardEvent.primary( event, 'm' );
// true

```

Keyed map of functions to match events.

### [LEFT](#left)

Keycode for LEFT key.

### [modifiers](#modifiers)

Object that contains functions that return the available modifier depending on platform.

*Type*

-   `WPModifierHandler< WPModifier >`

### [PAGEDOWN](#pagedown)

Keycode for PAGEDOWN key.

### [PAGEUP](#pageup)

Keycode for PAGEUP key.

### [rawShortcut](#rawshortcut)

An object that contains functions to get raw shortcuts.

These are intended for user with the KeyboardShortcuts.

*Usage*

```
// Assuming macOS:
rawShortcut.primary( 'm' );
// "meta+m"

```

### [RIGHT](#right)

Keycode for RIGHT key.

### [SHIFT](#shift)

Keycode for SHIFT key.

### [shortcutAriaLabel](#shortcutarialabel)

An object that contains functions to return an aria label for a keyboard shortcut.

*Usage*

```
// Assuming macOS:
shortcutAriaLabel.primary( '.' );
// "Command + Period"

```

Keyed map of functions to shortcut ARIA labels.

### [SPACE](#space)

Keycode for SPACE key.

### [TAB](#tab)

Keycode for TAB key.

### [UP](#up)

Keycode for UP key.

### [ZERO](#zero)

Keycode for ZERO key.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).