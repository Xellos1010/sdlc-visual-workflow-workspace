# Block Types Data – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/blocks`.

## [Selectors](#selectors)

### [getActiveBlockVariation](#getactiveblockvariation)

Returns the active block variation for a given block based on its attributes. Variations are determined by their `isActive` property. Which is either an array of block attribute keys or a function.

In case of an array of block attribute keys, the `attributes` are compared to the variation’s attributes using strict equality check.

In case of function type, the function should accept a block’s attributes and the variation’s attributes and determines if a variation is active. A function that accepts a block’s attributes and the variation’s attributes and determines if a variation is active.

*Usage*

```
import { __ } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    // This example assumes that a core/embed block is the first block in the Block Editor.
    const activeBlockVariation = useSelect( ( select ) => {
        // Retrieve the list of blocks.
        const [ firstBlock ] = select( blockEditorStore ).getBlocks();

        // Return the active block variation for the first block.
        return select( blocksStore ).getActiveBlockVariation(
            firstBlock.name,
            firstBlock.attributes
        );
    }, [] );

    return activeBlockVariation && activeBlockVariation.name === 'spotify' ? (
        <p>{ __( 'Spotify variation' ) }</p>
    ) : (
        <p>{ __( 'Other variation' ) }</p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Name of block (example: “core/columns”).
-   *attributes* `Record< string, unknown >`: Block attributes used to determine active variation.
-   *scope* `BlockVariationScope`: Block variation scope name.

*Returns*

-   `BlockVariation | undefined`: Active block variation.

### [getBlockStyles](#getblockstyles)

Returns block styles by block name.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const buttonBlockStyles = useSelect(
        ( select ) => select( blocksStore ).getBlockStyles( 'core/button' ),
        []
    );

    return (
        <ul>
            { buttonBlockStyles &&
                buttonBlockStyles.map( ( style ) => (
                    <li key={ style.name }>{ style.label }</li>
                ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *name* `string`: Block type name.

*Returns*

-   `BlockStyle[]`: Block Styles.

### [getBlockSupport](#getblocksupport)

Returns the block support value for a feature, if defined.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const paragraphBlockSupportValue = useSelect(
        ( select ) =>
            select( blocksStore ).getBlockSupport( 'core/paragraph', 'anchor' ),
        []
    );

    return (
        <p>
            { sprintf(
                __( 'core/paragraph supports.anchor value: %s' ),
                paragraphBlockSupportValue
            ) }
        </p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *nameOrType* `string | BlockType`: Block name or type object
-   *feature* `string | string[]`: Feature to retrieve
-   *defaultSupports* `unknown`: Default value to return if not explicitly defined

*Returns*

-   `unknown`: Block support value

### [getBlockType](#getblocktype)

Returns a block type by name.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const paragraphBlock = useSelect(
        ( select ) => ( select ) =>
            select( blocksStore ).getBlockType( 'core/paragraph' ),
        []
    );

    return (
        <ul>
            { paragraphBlock &&
                Object.entries( paragraphBlock.supports ).map(
                    ( blockSupportsEntry ) => {
                        const [ propertyName, value ] = blockSupportsEntry;
                        return (
                            <li
                                key={ propertyName }
                            >{ `${ propertyName } : ${ value }` }</li>
                        );
                    }
                ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *name* `string`: Block type name.

*Returns*

-   `BlockType | undefined`: Block Type.

### [getBlockTypes](#getblocktypes)

Returns all the available block types.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const blockTypes = useSelect(
        ( select ) => select( blocksStore ).getBlockTypes(),
        []
    );

    return (
        <ul>
            { blockTypes.map( ( block ) => (
                <li key={ block.name }>{ block.title }</li>
            ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `BlockType[]`: Block Types.

### [getBlockVariations](#getblockvariations)

Returns block variations by block name.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const socialLinkVariations = useSelect(
        ( select ) =>
            select( blocksStore ).getBlockVariations( 'core/social-link' ),
        []
    );

    return (
        <ul>
            { socialLinkVariations &&
                socialLinkVariations.map( ( variation ) => (
                    <li key={ variation.name }>{ variation.title }</li>
                ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Block type name.
-   *scope* `BlockVariationScope`: Block variation scope name.

*Returns*

-   `BlockVariation[] | undefined`: Block variations.

### [getCategories](#getcategories)

Returns all the available block categories.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const blockCategories = useSelect(
        ( select ) => select( blocksStore ).getCategories(),
        []
    );

    return (
        <ul>
            { blockCategories.map( ( category ) => (
                <li key={ category.slug }>{ category.title }</li>
            ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `BlockCategory[]`: Categories list.

### [getChildBlockNames](#getchildblocknames)

Returns an array with the child blocks of a given block.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const childBlockNames = useSelect(
        ( select ) =>
            select( blocksStore ).getChildBlockNames( 'core/navigation' ),
        []
    );

    return (
        <ul>
            { childBlockNames &&
                childBlockNames.map( ( child ) => (
                    <li key={ child }>{ child }</li>
                ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Block type name.

*Returns*

-   `string[]`: Array of child block names.

### [getCollections](#getcollections)

Returns all the available collections.

*Usage*

```
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const blockCollections = useSelect(
        ( select ) => select( blocksStore ).getCollections(),
        []
    );

    return (
        <ul>
            { Object.values( blockCollections ).length > 0 &&
                Object.values( blockCollections ).map( ( collection ) => (
                    <li key={ collection.title }>{ collection.title }</li>
                ) ) }
        </ul>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `Record< string, BlockCollection >`: Collections list.

### [getDefaultBlockName](#getdefaultblockname)

Returns the name of the default block name.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const defaultBlockName = useSelect(
        ( select ) => select( blocksStore ).getDefaultBlockName(),
        []
    );

    return (
        defaultBlockName && (
            <p>
                { sprintf( __( 'Default block name: %s' ), defaultBlockName ) }
            </p>
        )
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `string | null`: Default block name.

### [getDefaultBlockVariation](#getdefaultblockvariation)

Returns the default block variation for the given block type. When there are multiple variations annotated as the default one, the last added item is picked. This simplifies registering overrides. When there is no default variation set, it returns the first item.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const defaultEmbedBlockVariation = useSelect(
        ( select ) =>
            select( blocksStore ).getDefaultBlockVariation( 'core/embed' ),
        []
    );

    return (
        defaultEmbedBlockVariation && (
            <p>
                { sprintf(
                    __( 'core/embed default variation: %s' ),
                    defaultEmbedBlockVariation.title
                ) }
            </p>
        )
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Block type name.
-   *scope* `BlockVariationScope`: Block variation scope name.

*Returns*

-   `BlockVariation | undefined`: The default block variation.

### [getFreeformFallbackBlockName](#getfreeformfallbackblockname)

Returns the name of the block for handling non-block content.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const freeformFallbackBlockName = useSelect(
        ( select ) => select( blocksStore ).getFreeformFallbackBlockName(),
        []
    );

    return (
        freeformFallbackBlockName && (
            <p>
                { sprintf(
                    __( 'Freeform fallback block name: %s' ),
                    freeformFallbackBlockName
                ) }
            </p>
        )
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `string | null`: Name of the block for handling non-block content.

### [getGroupingBlockName](#getgroupingblockname)

Returns the name of the block for handling the grouping of blocks.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const groupingBlockName = useSelect(
        ( select ) => select( blocksStore ).getGroupingBlockName(),
        []
    );

    return (
        groupingBlockName && (
            <p>
                { sprintf(
                    __( 'Default grouping block name: %s' ),
                    groupingBlockName
                ) }
            </p>
        )
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `string | null`: Name of the block for handling the grouping of blocks.

### [getUnregisteredFallbackBlockName](#getunregisteredfallbackblockname)

Returns the name of the block for handling unregistered blocks.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const unregisteredFallbackBlockName = useSelect(
        ( select ) => select( blocksStore ).getUnregisteredFallbackBlockName(),
        []
    );

    return (
        unregisteredFallbackBlockName && (
            <p>
                { sprintf(
                    __( 'Unregistered fallback block name: %s' ),
                    unregisteredFallbackBlockName
                ) }
            </p>
        )
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.

*Returns*

-   `string | null`: Name of the block for handling unregistered blocks.

### [hasBlockSupport](#hasblocksupport)

Returns true if the block defines support for a feature, or false otherwise.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const paragraphBlockSupportClassName = useSelect( ( select ) =>
        select( blocksStore ).hasBlockSupport( 'core/paragraph', 'className' ),
        []
    );

    return (
        <p>
            { sprintf(
                __( 'core/paragraph supports custom class name?: %s' ),
                paragraphBlockSupportClassName
            ) }
        /p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *nameOrType* `string | BlockType`: Block name or type object.
-   *feature* `string | string[]`: Feature to test.
-   *defaultSupports* `unknown`: Whether feature is supported by default if not explicitly defined.

*Returns*

-   `boolean`: Whether block supports feature.

### [hasChildBlocks](#haschildblocks)

Returns a boolean indicating if a block has child blocks or not.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const navigationBlockHasChildBlocks = useSelect(
        ( select ) => select( blocksStore ).hasChildBlocks( 'core/navigation' ),
        []
    );

    return (
        <p>
            { sprintf(
                __( 'core/navigation has child blocks: %s' ),
                navigationBlockHasChildBlocks
            ) }
        </p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Block type name.

*Returns*

-   `boolean`: True if a block contains child blocks and false otherwise.

### [hasChildBlocksWithInserterSupport](#haschildblockswithinsertersupport)

Returns a boolean indicating if a block has at least one child block with inserter support.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const navigationBlockHasChildBlocksWithInserterSupport = useSelect(
        ( select ) =>
            select( blocksStore ).hasChildBlocksWithInserterSupport(
                'core/navigation'
            ),
        []
    );

    return (
        <p>
            { sprintf(
                __(
                    'core/navigation has child blocks with inserter support: %s'
                ),
                navigationBlockHasChildBlocksWithInserterSupport
            ) }
        </p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Data state.
-   *blockName* `string`: Block type name.

*Returns*

-   `boolean`: True if a block contains at least one child blocks with inserter support and false otherwise.

### [isMatchingSearchTerm](#ismatchingsearchterm)

Returns true if the block type by the given name or object value matches a search term, or false otherwise.

*Usage*

```
import { __, sprintf } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const ExampleComponent = () => {
    const termFound = useSelect(
        ( select ) =>
            select( blocksStore ).isMatchingSearchTerm(
                'core/navigation',
                'theme'
            ),
        []
    );

    return (
        <p>
            { sprintf(
                __(
                    'Search term was found in the title, keywords, category or description in block.json: %s'
                ),
                termFound
            ) }
        </p>
    );
};

```

*Parameters*

-   *state* `BlockStoreState`: Blocks state.
-   *nameOrType* `string | BlockType`: Block name or type object.
-   *searchTerm* `string`: Search term by which to filter.

*Returns*

-   `boolean`: Whether block type matches search term.

## [Actions](#actions)

The actions in this package shouldn’t be used directly. Instead, use the functions listed in the public API [here](https://developer.wordpress.org/block-editor/reference-guide/packages/packages-blocks/)

### [reapplyBlockTypeFilters](#reapplyblocktypefilters)

Signals that all block types should be computed again. It uses stored unprocessed block types and all the most recent list of registered filters.

It addresses the issue where third party block filters get registered after third party blocks. A sample sequence: 1. Filter A. 2. Block B. 3. Block C. 4. Filter D. 5. Filter E. 6. Block F. 7. Filter G. In this scenario some filters would not get applied for all blocks because they are registered too late.