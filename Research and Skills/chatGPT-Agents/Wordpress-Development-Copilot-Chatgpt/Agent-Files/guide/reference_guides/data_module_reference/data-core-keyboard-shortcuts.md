# The Keyboard Shortcuts Data – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/keyboard-shortcuts`.

## [Selectors](#selectors)

### [getAllShortcutKeyCombinations](#getallshortcutkeycombinations)

Returns the shortcuts that include aliases for a given shortcut name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';

const ExampleComponent = () => {
    const allShortcutKeyCombinations = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getAllShortcutKeyCombinations(
                'core/editor/next-region'
            ),
        []
    );

    return (
        allShortcutKeyCombinations.length > 0 && (
            <ul>
                { allShortcutKeyCombinations.map(
                    ( { character, modifier }, index ) => (
                        <li key={ index }>
                            { createInterpolateElement(
                                sprintf(
                                    'Character: <code>%s</code> / Modifier: <code>%s</code>',
                                    character,
                                    modifier
                                ),
                                {
                                    code: <code />,
                                }
                            ) }
                        </li>
                    )
                ) }
            </ul>
        )
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.

*Returns*

-   `ShortcutKeyCombination[]`: Key combinations.

### [getAllShortcutRawKeyCombinations](#getallshortcutrawkeycombinations)

Returns the raw representation of all the keyboard combinations of a given shortcut name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';

const ExampleComponent = () => {
    const allShortcutRawKeyCombinations = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getAllShortcutRawKeyCombinations(
                'core/editor/next-region'
            ),
        []
    );

    return (
        allShortcutRawKeyCombinations.length > 0 && (
            <ul>
                { allShortcutRawKeyCombinations.map(
                    ( shortcutRawKeyCombination, index ) => (
                        <li key={ index }>
                            { createInterpolateElement(
                                sprintf(
                                    ' <code>%s</code>',
                                    shortcutRawKeyCombination
                                ),
                                {
                                    code: <code />,
                                }
                            ) }
                        </li>
                    )
                ) }
            </ul>
        )
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.

*Returns*

-   `string[]`: Shortcuts.

### [getCategoryShortcuts](#getcategoryshortcuts)

Returns the shortcut names list for a given category name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const categoryShortcuts = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getCategoryShortcuts( 'block' ),
        []
    );

    return (
        categoryShortcuts.length > 0 && (
            <ul>
                { categoryShortcuts.map( ( categoryShortcut ) => (
                    <li key={ categoryShortcut }>{ categoryShortcut }</li>
                ) ) }
            </ul>
        )
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Category name.

*Returns*

-   `string[]`: Shortcut names.

### [getShortcutAliases](#getshortcutaliases)

Returns the aliases for a given shortcut name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
const ExampleComponent = () => {
    const shortcutAliases = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getShortcutAliases(
                'core/editor/next-region'
            ),
        []
    );

    return (
        shortcutAliases.length > 0 && (
            <ul>
                { shortcutAliases.map( ( { character, modifier }, index ) => (
                    <li key={ index }>
                        { createInterpolateElement(
                            sprintf(
                                'Character: <code>%s</code> / Modifier: <code>%s</code>',
                                character,
                                modifier
                            ),
                            {
                                code: <code />,
                            }
                        ) }
                    </li>
                ) ) }
            </ul>
        )
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.

*Returns*

-   `ShortcutKeyCombination[]`: Key combinations.

### [getShortcutDescription](#getshortcutdescription)

Returns the shortcut description given its name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
const ExampleComponent = () => {
    const shortcutDescription = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getShortcutDescription(
                'core/editor/next-region'
            ),
        []
    );

    return shortcutDescription ? (
        <div>{ shortcutDescription }</div>
    ) : (
        <div>{ __( 'No description.' ) }</div>
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.

*Returns*

-   `?string`: Shortcut description.

### [getShortcutKeyCombination](#getshortcutkeycombination)

Returns the main key combination for a given shortcut name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
const ExampleComponent = () => {
    const { character, modifier } = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getShortcutKeyCombination(
                'core/editor/next-region'
            ),
        []
    );

    return (
        <div>
            { createInterpolateElement(
                sprintf(
                    'Character: <code>%s</code> / Modifier: <code>%s</code>',
                    character,
                    modifier
                ),
                {
                    code: <code />,
                }
            ) }
        </div>
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.

*Returns*

-   `ShortcutKeyCombination?`: Key combination.

### [getShortcutRepresentation](#getshortcutrepresentation)

Returns a string representing the main key combination for a given shortcut name.

*Usage*

```
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';

const ExampleComponent = () => {
    const { display, raw, ariaLabel } = useSelect( ( select ) => {
        return {
            display: select( keyboardShortcutsStore ).getShortcutRepresentation(
                'core/editor/next-region'
            ),
            raw: select( keyboardShortcutsStore ).getShortcutRepresentation(
                'core/editor/next-region',
                'raw'
            ),
            ariaLabel: select(
                keyboardShortcutsStore
            ).getShortcutRepresentation(
                'core/editor/next-region',
                'ariaLabel'
            ),
        };
    }, [] );

    return (
        <ul>
            <li>{ sprintf( 'display string: %s', display ) }</li>
            <li>{ sprintf( 'raw string: %s', raw ) }</li>
            <li>{ sprintf( 'ariaLabel string: %s', ariaLabel ) }</li>
        </ul>
    );
};

```

*Parameters*

-   *state* `Object`: Global state.
-   *name* `string`: Shortcut name.
-   *representation* `keyof FORMATTING_METHODS`: Type of representation (display, raw, ariaLabel).

*Returns*

-   `?string`: Shortcut representation.

## [Actions](#actions)

### [registerShortcut](#registershortcut)

Returns an action object used to register a new keyboard shortcut.

*Usage*

```
import { useEffect } from 'react';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const ExampleComponent = () => {
    const { registerShortcut } = useDispatch( keyboardShortcutsStore );

    useEffect( () => {
        registerShortcut( {
            name: 'custom/my-custom-shortcut',
            category: 'my-category',
            description: __( 'My custom shortcut' ),
            keyCombination: {
                modifier: 'primary',
                character: 'j',
            },
        } );
    }, [] );

    const shortcut = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getShortcutKeyCombination(
                'custom/my-custom-shortcut'
            ),
        []
    );

    return shortcut ? (
        <p>{ __( 'Shortcut is registered.' ) }</p>
    ) : (
        <p>{ __( 'Shortcut is not registered.' ) }</p>
    );
};

```

*Parameters*

-   *config* `ShortcutConfig`: Shortcut config.

*Returns*

-   `Object`: action.

### [unregisterShortcut](#unregistershortcut)

Returns an action object used to unregister a keyboard shortcut.

*Usage*

```
import { useEffect } from 'react';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const ExampleComponent = () => {
    const { unregisterShortcut } = useDispatch( keyboardShortcutsStore );

    useEffect( () => {
        unregisterShortcut( 'core/editor/next-region' );
    }, [] );

    const shortcut = useSelect(
        ( select ) =>
            select( keyboardShortcutsStore ).getShortcutKeyCombination(
                'core/editor/next-region'
            ),
        []
    );

    return shortcut ? (
        <p>{ __( 'Shortcut is not unregistered.' ) }</p>
    ) : (
        <p>{ __( 'Shortcut is unregistered.' ) }</p>
    );
};

```

*Parameters*

-   *name* `string`: Shortcut name.

*Returns*

-   `Object`: action.