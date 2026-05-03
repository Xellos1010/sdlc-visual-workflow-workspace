# Rich Text – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/rich-text`.

## [Selectors](#selectors)

### [getFormatType](#getformattype)

Returns a format type by name.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as richTextStore } from '@wordpress/rich-text';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
   const { getFormatType } = useSelect(
       ( select ) => select( richTextStore ),
       []
   );

   const boldFormat = getFormatType( 'core/bold' );

   return boldFormat ? (
       <ul>
           { Object.entries( boldFormat )?.map( ( [ key, value ] ) => (
               <li>
                   { key } : { value }
               </li>
          ) ) }
      </ul>
   ) : (
       __( 'Not Found' )
   ;
};

```

*Parameters*

-   *state* `Object`: Data state.
-   *name* `string`: Format type name.

*Returns*

-   `?Object`: Format type.

### [getFormatTypeForBareElement](#getformattypeforbareelement)

Gets the format type, if any, that can handle a bare element (without a data-format-type attribute), given the tag name of this element.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as richTextStore } from '@wordpress/rich-text';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const { getFormatTypeForBareElement } = useSelect(
        ( select ) => select( richTextStore ),
        []
    );

    const format = getFormatTypeForBareElement( 'strong' );

    return format && <p>{ sprintf( __( 'Format name: %s' ), format.name ) }</p>;
};

```

*Parameters*

-   *state* `Object`: Data state.
-   *bareElementTagName* `string`: The tag name of the element to find a format type for.

*Returns*

-   `?Object`: Format type.

### [getFormatTypeForClassName](#getformattypeforclassname)

Gets the format type, if any, that can handle an element, given its classes.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as richTextStore } from '@wordpress/rich-text';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const { getFormatTypeForClassName } = useSelect(
        ( select ) => select( richTextStore ),
        []
    );

    const format = getFormatTypeForClassName( 'has-inline-color' );

    return format && <p>{ sprintf( __( 'Format name: %s' ), format.name ) }</p>;
};

```

*Parameters*

-   *state* `Object`: Data state.
-   *elementClassName* `string`: The classes of the element to find a format type for.

*Returns*

-   `?Object`: Format type.

### [getFormatTypes](#getformattypes)

Returns all the available format types.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as richTextStore } from '@wordpress/rich-text';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const { getFormatTypes } = useSelect(
        ( select ) => select( richTextStore ),
        []
    );

    const availableFormats = getFormatTypes();

    return availableFormats ? (
        <ul>
            { availableFormats?.map( ( format ) => (
                <li>{ format.name }</li>
            ) ) }
        </ul>
    ) : (
        __( 'No Formats available' )
    );
};

```

*Parameters*

-   *state* `Object`: Data state.

*Returns*

-   `Array`: Format types.

## [Actions](#actions)

Nothing to document.