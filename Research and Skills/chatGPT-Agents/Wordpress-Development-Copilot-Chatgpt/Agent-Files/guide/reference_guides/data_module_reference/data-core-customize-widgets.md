# Customize Widgets – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/customize-widgets`.

## [Selectors](#selectors)

### [isInserterOpened](#isinserteropened)

Returns true if the inserter is opened.

*Usage*

```
import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const { isInserterOpened } = useSelect(
        ( select ) => select( customizeWidgetsStore ),
        []
    );

    return isInserterOpened()
        ? __( 'Inserter is open' )
        : __( 'Inserter is closed.' );
};

```

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether the inserter is opened.

## [Actions](#actions)

### [setIsInserterOpened](#setisinserteropened)

Returns an action object used to open/close the inserter.

*Usage*

```
import { useState } from 'react';
import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';

const ExampleComponent = () => {
    const { setIsInserterOpened } = useDispatch( customizeWidgetsStore );
    const [ isOpen, setIsOpen ] = useState( false );

    return (
        <Button
            onClick={ () => {
                setIsInserterOpened( ! isOpen );
                setIsOpen( ! isOpen );
            } }
        >
            { __( 'Open/close inserter' ) }
        </Button>
    );
};

```

*Parameters*

-   *value* `boolean|Object`: Whether the inserter should be opened (true) or closed (false). To specify an insertion point, use an object.
-   *value.rootClientId* `string`: The root client ID to insert at.
-   *value.insertionIndex* `number`: The index to insert at.

*Returns*

-   `Object`: Action object.