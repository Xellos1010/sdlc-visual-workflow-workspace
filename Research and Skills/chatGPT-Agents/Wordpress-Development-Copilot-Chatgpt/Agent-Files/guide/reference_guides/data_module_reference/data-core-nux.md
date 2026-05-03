# The NUX (New User Experience) Data

Namespace: `core/nux`.

## [Selectors](#selectors)

### [areTipsEnabled](#aretipsenabled)

Returns whether or not tips are globally enabled.

*Parameters*

-   *state* `Object`: Global application state.

*Returns*

-   `boolean`: Whether tips are globally enabled.

### [getAssociatedGuide](#getassociatedguide)

Returns an object describing the guide, if any, that the given tip is a part of.

*Parameters*

-   *state* `Object`: Global application state.
-   *tipId* `string`: The tip to query.

*Returns*

-   `?NUXGuideInfo`: Information about the associated guide.

### [isTipVisible](#istipvisible)

Determines whether or not the given tip is showing. Tips are hidden if they are disabled, have been dismissed, or are not the current tip in any guide that they have been added to.

*Parameters*

-   *state* `Object`: Global application state.
-   *tipId* `string`: The tip to query.

*Returns*

-   `boolean`: Whether or not the given tip is showing.

## [Actions](#actions)

### [disableTips](#disabletips)

Returns an action object that, when dispatched, prevents all tips from showing again.

*Returns*

-   `Object`: Action object.

### [dismissTip](#dismisstip)

Returns an action object that, when dispatched, dismisses the given tip. A dismissed tip will not show again.

*Parameters*

-   *id* `string`: The tip to dismiss.

*Returns*

-   `Object`: Action object.

### [enableTips](#enabletips)

Returns an action object that, when dispatched, makes all tips show again.

*Returns*

-   `Object`: Action object.

### [triggerGuide](#triggerguide)

Returns an action object that, when dispatched, presents a guide that takes the user through a series of tips step by step.

*Parameters*

-   *tipIds* `string[]`: Which tips to show in the guide.

*Returns*

-   `Object`: Action object.