# @wordpress/global-styles-ui

UI components for managing WordPress Global Styles.

## [Installation](#installation)

Install the module:

```
npm install @wordpress/global-styles-ui --save

```

## [Usage](#usage)

```
import { GlobalStylesUI } from '@wordpress/global-styles-ui';

function MyComponent() {
    return (
        <GlobalStylesUI
            value={ userStyles }
            baseValue={ themeStyles }
            onChange={ handleChange }
        />
    );
}

```

## [API](#api)

### [GlobalStylesUI](#globalstylesui)

Main component for the Global Styles editor interface.

**Props:**

-   `value` (GlobalStylesConfig): User’s custom global styles
-   `baseValue` (GlobalStylesConfig): Theme’s default global styles
-   `onChange` (Function): Callback when styles change
-   `path` (string, optional): Current navigation path
-   `onPathChange` (Function, optional): Callback when path changes
-   `fontLibraryEnabled` (boolean, optional): Enable font library features
-   `serverCSS` (array, optional): Server CSS styles
-   `serverSettings` (object, optional): Server settings

## [Contributing](#contributing)

See [CONTRIBUTING.md](https://developer.chrome.com/CONTRIBUTING.md) for details.