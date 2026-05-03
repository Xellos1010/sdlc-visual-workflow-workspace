# AnglePickerControl – Block Editor Handbook | Developer.WordPress.org

See the [WordPress Storybook](https://wordpress.github.io/gutenberg/?path=/docs/components-anglepickercontrol--docs) for more detailed, interactive documentation.

`AnglePickerControl` is a React component to render a UI that allows users to  
pick an angle. Users can choose an angle in a visual UI with the mouse by  
dragging an angle indicator inside a circle or by directly inserting the  
desired angle in a text field.

```
import { useState } from '@wordpress/element';
import { AnglePickerControl } from '@wordpress/components';

function Example() {
  const [ angle, setAngle ] = useState( 0 );
  return (
    <AnglePickerControl
      value={ angle }
      onChange={ setAngle }
    />
  );
}

```

## [Props](#props)

### [as](#as)

-   Type: `"symbol" | "object" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | ...`
-   Required: No

The HTML element or React component to render the component as.

### [label](#label)

-   Type: `string`
-   Required: No
-   Default: `__( 'Angle' )`

Label to use for the angle picker.

### [onChange](#onchange)

-   Type: `(value: number) => void`
-   Required: Yes

A function that receives the new value of the input.

### [value](#value)

-   Type: `string | number`
-   Required: Yes

The current value of the input. The value represents an angle in degrees  
and should be a value between 0 and 360.