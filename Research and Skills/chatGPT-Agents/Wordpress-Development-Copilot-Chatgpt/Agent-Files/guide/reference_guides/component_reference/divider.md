# Divider – Block Editor Handbook | Developer.WordPress.org

This feature is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.

`Divider` is a layout component that separates groups of related content.

## [Usage](#usage)

```
import {
    __experimentalDivider as Divider,
} from `@wordpress/components`;
import { Stack } from '@wordpress/ui';

function Example() {
    return (
        <Stack direction="column" gap="lg">
            <span>Some text here</span>
            <Divider />
            <span>Some more text here</span>
        </Stack>
    );
}

```

## [Props](#props)

### [margin: number](#margin-number)

Adjusts all margins on the inline dimension.

-   Required: No

### [marginEnd: number](#marginend-number)

Adjusts the inline-end margin.

-   Required: No

### [marginStart: number](#marginstart-number)

Adjusts the inline-start margin.

-   Required: No

### [orientation: horizontal | vertical](#orientation-horizontal-vertical)

Divider’s orientation. When using inside a flex container, you may need to make sure the divider is `stretch` aligned in order for it to be visible.

-   Required: No
-   Default: `horizontal`

### [Inherited props](#inherited-props)

`Divider` also inherits all of the [`Separator` props](https://ariakit.org/reference/separator#optional-props).