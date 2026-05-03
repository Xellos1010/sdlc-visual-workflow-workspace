# PluginPostStatusInfo – Block Editor Handbook | Developer.WordPress.org

This slots allows for the insertion of items in the Summary panel of the document sidebar.

## [Example](#example)

```
import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/editor';

const PluginPostStatusInfoTest = () => (
    <PluginPostStatusInfo>
        <p>Post Status Info SlotFill</p>
    </PluginPostStatusInfo>
);

registerPlugin( 'post-status-info-test', { render: PluginPostStatusInfoTest } );

```

## [Location](#location)

![Location in the Summary panel](https://i0.wp.com/raw.githubusercontent.com/WordPress/gutenberg/HEAD/docs/assets/plugin-post-status-info-location.png?ssl=1)