# @wordpress/compose – Block Editor Handbook | Developer.WordPress.org

The `compose` package is a collection of handy [Hooks](https://react.dev/reference/react/hooks) and [Higher Order Components](https://legacy.reactjs.org/docs/higher-order-components.html) (HOCs) you can use to wrap your WordPress components and provide some basic features like: state, instance id, pure…

The `compose` function is inspired by [flowRight](https://lodash.com/docs/#flowRight) from Lodash and works the same way. It comes from functional programming, and allows you to compose any number of functions. You might also think of this as layering functions; `compose` will execute the last function first, then sequentially move back through the previous functions passing the result of each function upward.

An example that illustrates it for two functions:

```
const compose = ( f, g ) => x
    => f( g( x ) );

```

Here’s a simplified example of **compose** in use from Gutenberg’s [`PluginSidebar` component](https://github.com/WordPress/gutenberg/blob/HEAD/packages/editor/src/components/plugin-sidebar/index.js):

Using compose:

```
const applyWithSelect = withSelect( ( select, ownProps ) => {
    return doSomething( select, ownProps );
} );
const applyWithDispatch = withDispatch( ( dispatch, ownProps ) => {
    return doSomethingElse( dispatch, ownProps );
} );

export default compose(
    withPluginContext,
    applyWithSelect,
    applyWithDispatch
)( PluginSidebarMoreMenuItem );

```

Without `compose`, the code would look like this:

```
const applyWithSelect = withSelect( ( select, ownProps ) => {
    return doSomething( select, ownProps );
} );
const applyWithDispatch = withDispatch( ( dispatch, ownProps ) => {
    return doSomethingElse( dispatch, ownProps );
} );

export default withPluginContext(
    applyWithSelect( applyWithDispatch( PluginSidebarMoreMenuItem ) )
);

```

## [Installation](#installation)

Install the module

```
npm install @wordpress/compose --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

For more details, you can refer to each Higher Order Component’s README file. [Available components are located here.](https://github.com/WordPress/gutenberg/tree/HEAD/packages/compose/src)

### [compose](#compose)

Composes multiple higher-order components into a single higher-order component. Performs right-to-left function composition, where each successive invocation is supplied the return value of the previous.

This is inspired by `lodash`‘s `flowRight` function.

*Related*

-   [https://lodash.com/docs/4#flow-right](https://lodash.com/docs/4#flow-right)

### [createHigherOrderComponent](#createhigherordercomponent)

Given a function mapping a component to an enhanced component and modifier name, returns the enhanced component augmented with a generated displayName.

*Parameters*

-   *mapComponent* `( Inner: TInner ) => TOuter`: Function mapping component to enhanced component.
-   *modifierName* `string`: Seed name from which to generated display name.

*Returns*

-   Component class with generated display name assigned.

### [debounce](#debounce)

A simplified and properly typed version of lodash’s `debounce`, that always uses timers instead of sometimes using rAF.

Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked. The debounced function comes with a `cancel` method to cancel delayed `func` invocations and a `flush` method to immediately invoke them. Provide `options` to indicate whether `func` should be invoked on the leading and/or trailing edge of the `wait` timeout. The `func` is invoked with the last arguments provided to the debounced function. Subsequent calls to the debounced function return the result of the last `func` invocation.

**Note:** If `leading` and `trailing` options are `true`, `func` is invoked on the trailing edge of the timeout only if the debounced function is invoked more than once during the `wait` timeout.

If `wait` is `0` and `leading` is `false`, `func` invocation is deferred until the next tick, similar to `setTimeout` with a timeout of `0`.

*Parameters*

-   *func* `Function`: The function to debounce.
-   *wait* `number`: The number of milliseconds to delay.
-   *options* `Partial< DebounceOptions >`: The options object.
-   *options.leading* `boolean`: Specify invoking on the leading edge of the timeout.
-   *options.maxWait* `number`: The maximum time `func` is allowed to be delayed before it’s invoked.
-   *options.trailing* `boolean`: Specify invoking on the trailing edge of the timeout.

*Returns*

-   Returns the new debounced function.

### [ifCondition](#ifcondition)

Higher-order component creator, creating a new component which renders if the given condition is satisfied or with the given optional prop name.

*Usage*

```
type Props = { foo: string };
const Component = ( props: Props ) => <div>{ props.foo }</div>;
const ConditionalComponent = ifCondition( ( props: Props ) => props.foo.length !== 0 )( Component );
<ConditionalComponent foo="" />; // => null
<ConditionalComponent foo="bar" />; // => <div>bar</div>;

```

*Parameters*

-   *predicate* `( props: Props ) => boolean`: Function to test condition.

*Returns*

-   Higher-order component.

### [observableMap](#observablemap)

A constructor (factory) for `ObservableMap`, a map-like key/value data structure where the individual entries are observable: using the `subscribe` method, you can subscribe to updates for a particular keys. Each subscriber always observes one specific key and is not notified about any unrelated changes (for different keys) in the `ObservableMap`.

*Returns*

-   `ObservableMap< K, V >`: A new instance of the `ObservableMap` type.

### [pipe](#pipe)

Composes multiple higher-order components into a single higher-order component. Performs left-to-right function composition, where each successive invocation is supplied the return value of the previous.

This is inspired by `lodash`‘s `flow` function.

*Related*

-   [https://lodash.com/docs/4#flow](https://lodash.com/docs/4#flow)

### [pure](#pure)

> **Deprecated** Use `memo` or `PureComponent` instead.

Given a component returns the enhanced component augmented with a component only re-rendering when its props/state change

### [throttle](#throttle)

A simplified and properly typed version of lodash’s `throttle`, that always uses timers instead of sometimes using rAF.

Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds. The throttled function comes with a `cancel` method to cancel delayed `func` invocations and a `flush` method to immediately invoke them. Provide `options` to indicate whether `func` should be invoked on the leading and/or trailing edge of the `wait` timeout. The `func` is invoked with the last arguments provided to the throttled function. Subsequent calls to the throttled function return the result of the last `func` invocation.

**Note:** If `leading` and `trailing` options are `true`, `func` is invoked on the trailing edge of the timeout only if the throttled function is invoked more than once during the `wait` timeout.

If `wait` is `0` and `leading` is `false`, `func` invocation is deferred until the next tick, similar to `setTimeout` with a timeout of `0`.

*Parameters*

-   *func* `Function`: The function to throttle.
-   *wait* `number`: The number of milliseconds to throttle invocations to.
-   *options* `Partial< ThrottleOptions >`: The options object.
-   *options.leading* `boolean`: Specify invoking on the leading edge of the timeout.
-   *options.trailing* `boolean`: Specify invoking on the trailing edge of the timeout.

*Returns*

-   Returns the new throttled function.

### [useAsyncList](#useasynclist)

React hook returns an array which items get asynchronously appended from a source array. This behavior is useful if we want to render a list of items asynchronously for performance reasons.

*Parameters*

-   *list* `T[]`: Source array.
-   *config* `AsyncListConfig`: Configuration object.

*Returns*

-   `T[]`: Async array.

### [useConstrainedTabbing](#useconstrainedtabbing)

In Dialogs/modals, the tabbing must be constrained to the content of the wrapper element. This hook adds the behavior to the returned ref.

*Usage*

```
import { useConstrainedTabbing } from '@wordpress/compose';

const ConstrainedTabbingExample = () => {
    const constrainedTabbingRef = useConstrainedTabbing();
    return (
        <div ref={ constrainedTabbingRef }>
            <Button />
            <Button />
        </div>
    );
};

```

*Returns*

-   `React.RefCallback<Element>`: Element Ref.

### [useCopyOnClick](#usecopyonclick)

> **Deprecated**

Copies the text to the clipboard when the element is clicked.

*Parameters*

-   *ref* `RefObject< string | Element | NodeListOf< Element > >`: Reference with the element.
-   *text* `string | ( () => string )`: The text to copy.
-   *timeout* `number`: Optional timeout to reset the returned state. 4 seconds by default.

*Returns*

-   `boolean`: Whether or not the text has been copied. Resets after the timeout.

### [useCopyToClipboard](#usecopytoclipboard)

Copies the given text to the clipboard when the element is clicked.

*Parameters*

-   *text* `string | ( () => string )`: The text to copy. Use a function if not already available and expensive to compute.
-   *onSuccess* `() => void`: Called when to text is copied.

*Returns*

-   `RefCallback< T >`: A ref to assign to the target element.

### [useDebounce](#usedebounce)

Debounces a function similar to Lodash’s `debounce`. A new debounced function will be returned and any scheduled calls cancelled if any of the arguments change, including the function to debounce, so please wrap functions created on render in components in `useCallback`.

*Related*

-   [https://lodash.com/docs/4#debounce](https://lodash.com/docs/4#debounce)

*Parameters*

-   *fn* `TFunc`: The function to debounce.
-   *wait* `[number]`: The number of milliseconds to delay.
-   *options* `[import('../../utils/debounce').DebounceOptions]`: The options object.

*Returns*

-   `import('../../utils/debounce').DebouncedFunc<TFunc>`: Debounced function.

### [useDebouncedInput](#usedebouncedinput)

Helper hook for input fields that need to debounce the value before using it.

*Parameters*

-   *defaultValue* The default value to use.

*Returns*

-   `[ string, ( value: string ) => void, string ]`: The input value, the setter and the debounced input value.

### [useDisabled](#usedisabled)

In some circumstances, such as block previews, all focusable DOM elements (input fields, links, buttons, etc.) need to be disabled. This hook adds the behavior to disable nested DOM elements to the returned ref.

If you can, prefer the use of the inert HTML attribute.

*Usage*

```
import { useDisabled } from '@wordpress/compose';

const DisabledExample = () => {
    const disabledRef = useDisabled();
    return (
        <div ref={ disabledRef }>
            <a href="#">This link will have tabindex set to -1</a>
            <input
                placeholder="This input will have the disabled attribute added to it."
                type="text"
            />
        </div>
    );
};

```

*Parameters*

-   *config* `Object`: Configuration object.
-   *config.isDisabled* `boolean=`: Whether the element should be disabled.

*Returns*

-   `React.RefCallback<HTMLElement>`: Element Ref.

### [useEvent](#useevent)

Creates a stable callback function that has access to the latest state and can be used within event handlers and effect callbacks. Throws when used in the render phase.

*Usage*

```
function Component( props ) {
    const onClick = useEvent( props.onClick );
    useEffect( () => {
        onClick();
        // Won't trigger the effect again when props.onClick is updated.
    }, [ onClick ] );
    // Won't re-render Button when props.onClick is updated (if `Button` is
    // wrapped in `React.memo`).
    return <Button onClick={ onClick } />;
}

```

*Parameters*

-   *callback* `T`: The callback function to wrap.

### [useFocusableIframe](#usefocusableiframe)

Dispatches a bubbling focus event when the iframe receives focus. Use `onFocus` as usual on the iframe or a parent element.

*Returns*

-   `RefCallback< HTMLIFrameElement >`: Ref to pass to the iframe.

### [useFocusOnMount](#usefocusonmount)

Determines focus behavior when the element mounts.

*Usage*

```
import { useFocusOnMount } from '@wordpress/compose';

const WithFocusOnMount = () => {
    const ref = useFocusOnMount();
    return (
        <div ref={ ref }>
            <Button />
            <Button />
        </div>
    );
};

```

*Parameters*

-   *focusOnMount* `useFocusOnMount.Mode`: Behavioral mode. Defaults to `"firstElement"` which focuses the first tabbable element within; `"firstInputElement"` focuses the first value control within; `true` focuses the element itself; `false` does nothing.

*Returns*

-   Ref callback.

### [useFocusReturn](#usefocusreturn)

Adds the unmount behavior of returning focus to the element which had it previously as is expected for roles like menus or dialogs.

*Usage*

```
import { useFocusReturn } from '@wordpress/compose';

const WithFocusReturn = () => {
    const ref = useFocusReturn();
    return (
        <div ref={ ref }>
            <Button />
            <Button />
        </div>
    );
};

```

*Parameters*

-   *onFocusReturn* `[() => void]`: Overrides the default return behavior.

*Returns*

-   `React.RefCallback<HTMLElement>`: Element Ref.

### [useInstanceId](#useinstanceid)

Provides a unique instance ID.

*Parameters*

-   *object* `object`: Object reference to create an id for.
-   *prefix* `[string]`: Prefix for the unique id.
-   *preferredId* `[string | number]`: Default ID to use.

*Returns*

-   `string | number`: The unique instance id.

### [useIsomorphicLayoutEffect](#useisomorphiclayouteffect)

Preferred over direct usage of `useLayoutEffect` when supporting server rendered components (SSR) because currently React throws a warning when using useLayoutEffect in that environment.

### [useKeyboardShortcut](#usekeyboardshortcut)

Attach a keyboard shortcut handler.

*Related*

-   [https://craig.is/killing/mice#api.bind](https://craig.is/killing/mice#api.bind) for information about the `callback` parameter.

*Parameters*

-   *shortcuts* `string[]|string`: Keyboard Shortcuts.
-   *callback* `(e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void`: Shortcut callback.
-   *options* `WPKeyboardShortcutConfig`: Shortcut options.

### [useMediaQuery](#usemediaquery)

Runs a media query and returns its value when it changes.

*Parameters*

-   *query* `[string]`: Media Query.
-   *view* `[Window]`: Window instance, else default to global window

*Returns*

-   `boolean`: return value of the media query.

### [useMergeRefs](#usemergerefs)

Merges refs into one ref callback.

It also ensures that the merged ref callbacks are only called when they change (as a result of a `useCallback` dependency update) OR when the ref value changes, just as React does when passing a single ref callback to the component.

As expected, if you pass a new function on every render, the ref callback will be called after every render.

If you don’t wish a ref callback to be called after every render, wrap it with `useCallback( callback, dependencies )`. When a dependency changes, the old ref callback will be called with `null` and the new ref callback will be called with the same value.

To make ref callbacks easier to use, you can also pass the result of `useRefEffect`, which makes cleanup easier by allowing you to return a cleanup function instead of handling `null`.

It’s also possible to *disable* a ref (and its behaviour) by simply not passing the ref.

```
const ref = useRefEffect( ( node ) => {
  node.addEventListener( ... );
  return () => {
    node.removeEventListener( ... );
  };
}, [ ...dependencies ] );
const otherRef = useRef();
const mergedRefs useMergeRefs( [
  enabled && ref,
  otherRef,
] );
return <div ref={ mergedRefs } />;

```

*Parameters*

-   *refs* `Ref< T >[]`: The refs to be merged.

*Returns*

-   `RefCallback< T >`: The merged ref callback.

### [useObservableValue](#useobservablevalue)

React hook that lets you observe an entry in an `ObservableMap`. The hook returns the current value corresponding to the key, or `undefined` when there is no value stored. It also observes changes to the value and triggers an update of the calling component in case the value changes.

*Parameters*

-   *map* `ObservableMap< K, V >`: The `ObservableMap` to observe.
-   *name* `K`: The map key to observe.

*Returns*

-   `V | undefined`: The value corresponding to the map key requested.

### [usePrevious](#useprevious)

Use something’s value from the previous render. Based on [https://usehooks.com/usePrevious/](https://usehooks.com/usePrevious/).

*Parameters*

-   *value* `T`: The value to track.

*Returns*

-   `T | undefined`: The value from the previous render.

### [useReducedMotion](#usereducedmotion)

Hook returning whether the user has a preference for reduced motion.

*Returns*

-   `boolean`: Reduced motion preference value.

### [useRefEffect](#userefeffect)

Effect-like ref callback. Just like with `useEffect`, this allows you to return a cleanup function to be run if the ref changes or one of the dependencies changes. The ref is provided as an argument to the callback functions. The main difference between this and `useEffect` is that the `useEffect` callback is not called when the ref changes, but this is. Pass the returned ref callback as the component’s ref and merge multiple refs with `useMergeRefs`.

It’s worth noting that if the dependencies array is empty, there’s not strictly a need to clean up event handlers for example, because the node is to be removed. It *is* necessary if you add dependencies because the ref callback will be called multiple times for the same node.

*Parameters*

-   *callback* `( node: TElement ) => ( () => void ) | void`: Callback with ref as argument.
-   *dependencies* `DependencyList`: Dependencies of the callback.

*Returns*

-   `RefCallback< TElement | null >`: Ref callback.

### [useResizeObserver](#useresizeobserver)

Sets up a [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API) for an HTML or SVG element.

Pass the returned setter as a callback ref to the React element you want to observe, or use it in layout effects for advanced use cases.

*Usage*

```
const setElement = useResizeObserver(
    ( resizeObserverEntries ) => console.log( resizeObserverEntries ),
    { box: 'border-box' }
);
<div ref={ setElement } />;

// The setter can be used in other ways, for example:
useLayoutEffect( () => {
    setElement( document.querySelector( `data-element-id="${ elementId }"` ) );
}, [ elementId ] );

```

*Parameters*

-   *callback* `ResizeObserverCallback`: The `ResizeObserver` callback – [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/ResizeObserver#callback).
-   *options* `ResizeObserverOptions`: Options passed to `ResizeObserver.observe` when called – [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe#options). Changes will be ignored.

### [useStateWithHistory](#usestatewithhistory)

useState with undo/redo history.

*Parameters*

-   *initialValue* `T`: Initial value.

*Returns*

-   Value, setValue, hasUndo, hasRedo, undo, redo.

### [useThrottle](#usethrottle)

Throttles a function similar to Lodash’s `throttle`. A new throttled function will be returned and any scheduled calls cancelled if any of the arguments change, including the function to throttle, so please wrap functions created on render in components in `useCallback`.

*Related*

-   [https://lodash.com/docs/4#throttle](https://lodash.com/docs/4#throttle)

*Parameters*

-   *fn* `TFunc`: The function to throttle.
-   *wait* `[number]`: The number of milliseconds to throttle invocations to.
-   *options* `[import('../../utils/throttle').ThrottleOptions]`: The options object. See linked documentation for details.

*Returns*

-   `import('../../utils/debounce').DebouncedFunc<TFunc>`: Throttled function.

### [useViewportMatch](#useviewportmatch)

Returns true if the viewport matches the given query, or false otherwise.

*Usage*

```
useViewportMatch( 'huge', '<' );
useViewportMatch( 'medium' );

```

*Parameters*

-   *breakpoint* `WPBreakpoint`: Breakpoint size name.
-   *operator* `[WPViewportOperator]`: Viewport operator.
-   *view* `[Window]`: Window instance in which to perform viewport matching.

*Returns*

-   `boolean`: Whether viewport matches query.

### [useWarnOnChange](#usewarnonchange)

Hook that performs a shallow comparison between the preview value of an object and the new one, if there’s a difference, it prints it to the console. this is useful in performance related work, to check why a component re-renders.

*Usage*

```
function MyComponent( props ) {
    useWarnOnChange( props );

    return 'Something';
}

```

*Parameters*

-   *object* `object`: Object which changes to compare.
-   *prefix* `string`: Just a prefix to show when console logging.

### [withGlobalEvents](#withglobalevents)

> **Deprecated**

Higher-order component creator which, given an object of DOM event types and values corresponding to a callback function name on the component, will create or update a window event handler to invoke the callback when an event occurs. On behalf of the consuming developer, the higher-order component manages unbinding when the component unmounts, and binding at most a single event handler for the entire application.

*Parameters*

-   *eventTypesToHandlers* `Record<keyof GlobalEventHandlersEventMap, string>`: Object with keys of DOM event type, the value a name of the function on the original component’s instance which handles the event.

*Returns*

-   `any`: Higher-order component.

### [withInstanceId](#withinstanceid)

A Higher Order Component used to provide a unique instance ID by component.

### [withSafeTimeout](#withsafetimeout)

A higher-order component used to provide and manage delayed function calls that ought to be bound to a component’s lifecycle.

### [withState](#withstate)

> **Deprecated** Use `useState` instead.

A Higher Order Component used to provide and manage internal component state via props.

*Parameters*

-   *initialState* `any`: Optional initial state of the component.

*Returns*

-   `any`: A higher order component wrapper accepting a component that takes the state props + its own props + `setState` and returning a component that only accepts the own props.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).