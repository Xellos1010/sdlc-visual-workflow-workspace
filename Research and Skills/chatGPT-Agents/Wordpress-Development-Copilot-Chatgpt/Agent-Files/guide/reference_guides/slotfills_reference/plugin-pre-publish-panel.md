# PluginPrePublishPanel – Block Editor Handbook | Developer.WordPress.org

This slot allows for injecting items into the bottom of the pre-publish panel that appears to confirm publishing after the user clicks “Publish”.

## [Example](#example)

```
import { registerPlugin } from '@wordpress/plugins';
import { PluginPrePublishPanel } from '@wordpress/editor';

const PluginPrePublishPanelTest = () => (
    <PluginPrePublishPanel>
        <p>Pre Publish Panel</p>
    </PluginPrePublishPanel>
);

registerPlugin( 'pre-publish-panel-test', {
    render: PluginPrePublishPanelTest,
} );

```

## [Location](#location)

![Prepublish panel](https://i0.wp.com/raw.githubusercontent.com/WordPress/gutenberg/HEAD/docs/assets/plugin-pre-publish-panel.png?ssl=1)