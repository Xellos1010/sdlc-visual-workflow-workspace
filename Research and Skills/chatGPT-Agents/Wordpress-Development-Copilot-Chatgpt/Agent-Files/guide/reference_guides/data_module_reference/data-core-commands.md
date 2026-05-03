# The Commands Data – Block Editor Handbook | Developer.WordPress.org

Namespace: `core/commands`.

## [Selectors](#selectors)

### [getCommandLoaders](#getcommandloaders)

Returns the registered command loaders.

*Parameters*

-   *state* `Object`: State tree.
-   *contextual* `boolean`: Whether to return only contextual command loaders.

*Returns*

-   `import('./actions').WPCommandLoaderConfig[]`: The list of registered command loaders.

### [getCommands](#getcommands)

Returns the registered static commands.

*Parameters*

-   *state* `Object`: State tree.
-   *contextual* `boolean`: Whether to return only contextual commands.

*Returns*

-   `import('./actions').WPCommandConfig[]`: The list of registered commands.

### [getContext](#getcontext)

Returns whether the active context.

*Parameters*

-   *state* `Object`: State tree.

*Returns*

-   `string`: Context.

### [isOpen](#isopen)

Returns whether the command palette is open.

*Parameters*

-   *state* `Object`: State tree.

*Returns*

-   `boolean`: Returns whether the command palette is open.

## [Actions](#actions)

### [close](#close)

Closes the command palette.

*Returns*

-   `Object`: action.

### [open](#open)

Opens the command palette.

*Returns*

-   `Object`: action.

### [registerCommand](#registercommand)

Returns an action object used to register a new command.

*Parameters*

-   *config* `WPCommandConfig`: Command config.

*Returns*

-   `Object`: action.

### [registerCommandLoader](#registercommandloader)

Register command loader.

*Parameters*

-   *config* `WPCommandLoaderConfig`: Command loader config.

*Returns*

-   `Object`: action.

### [unregisterCommand](#unregistercommand)

Returns an action object used to unregister a command.

*Parameters*

-   *name* `string`: Command name.

*Returns*

-   `Object`: action.

### [unregisterCommandLoader](#unregistercommandloader)

Unregister command loader hook.

*Parameters*

-   *name* `string`: Command loader name.

*Returns*

-   `Object`: action.