# CardDivider – Block Editor Handbook | Developer.WordPress.org

`CardDivider` renders an optional divider within a [`Card`](https://developer.wordpress.org/block-editor/reference-guide/components/card/card/). It is typically used to divide multiple `CardBody` components from each other.

## [Usage](#usage)

```
import { Card, CardBody, CardDivider } from '@wordpress/components';

const Example = () => (
    <Card>
        <CardBody>...</CardBody>
        <CardDivider />
        <CardBody>...</CardBody>
    </Card>
);

```

## [Props](#props)

### [Inherited props](#inherited-props)

`CardDivider` inherits all of the [`Divider` props](https://developer.wordpress.org/block-editor/reference-guide/components/divider/#props).