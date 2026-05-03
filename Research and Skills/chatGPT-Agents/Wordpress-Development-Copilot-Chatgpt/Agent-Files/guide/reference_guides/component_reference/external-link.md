# ExternalLink – Block Editor Handbook | Developer.WordPress.org

Link to an external resource.

## [Usage](#usage)

```
import { ExternalLink } from '@wordpress/components';

const MyExternalLink = () => (
    <ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink>
);

```

## [Props](#props)

The component accepts the following props. Any other props will be passed through to the `a`.

### [children: ReactNode](#children-reactnode)

The content to be displayed within the link.

-   Required: Yes

### [href: string](#href-string)

The URL of the external resource.

-   Required: Yes