# The Viewport Data

Namespace: `core/viewport`.

## [Selectors](#selectors)

### [isViewportMatch](#isviewportmatch)

Returns true if the viewport matches the given query, or false otherwise.

*Usage*

```
import { store as viewportStore } from '@wordpress/viewport';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
const ExampleComponent = () => {
    const isMobile = useSelect(
        ( select ) => select( viewportStore ).isViewportMatch( '< small' ),
        []
    );

    return isMobile ? (
        <div>{ __( 'Mobile' ) }</div>
    ) : (
        <div>{ __( 'Not Mobile' ) }</div>
    );
};

```

*Parameters*

-   *state* `ViewportState`: Viewport state object.
-   *query* `ViewportQuery`: Query string. Includes operator and breakpoint name, space separated. Operator defaults to >=.

*Returns*

-   `boolean`: Whether viewport matches query.

## [Actions](#actions)

The actions in this package shouldn’t be used directly.

Nothing to document.