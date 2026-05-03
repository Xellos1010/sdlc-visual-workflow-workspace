# Placeholder – Block Editor Handbook | Developer.WordPress.org

## [Usage](#usage)

```
import { Placeholder } from '@wordpress/components';
import { more } from '@wordpress/icons';

const MyPlaceholder = () => <Placeholder icon={ more } label="Placeholder" />;

```

## [Props](#props)

### [className: string](#classname-string)

Class to set on the container div.

-   Required: No

### [icon: string|Function|Component|null](#icon-stringfunctioncomponentnull)

If provided, renders an icon next to the label.

-   Required: No

### [instructions: string](#instructions-string)

Instructions of the placeholder.

-   Required: No

### [isColumnLayout: boolean](#iscolumnlayout-boolean)

Changes placeholder children layout from flex-row to flex-column.

-   Required: No

### [label: string](#label-string)

Title of the placeholder.

-   Required: No

### [notices: ReactNode](#notices-reactnode)

A rendered notices list

-   Required: No

### [preview: ReactNode](#preview-reactnode)

Preview to be rendered in the placeholder.

-   Required: No

### [withIllustration: boolean](#withillustration-boolean)

Outputs a placeholder illustration.

-   Required: No