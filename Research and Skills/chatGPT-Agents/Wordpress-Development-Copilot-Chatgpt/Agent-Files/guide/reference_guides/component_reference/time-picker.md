# TimePicker – Block Editor Handbook | Developer.WordPress.org

TimePicker is a React component that renders form inputs for time and date selection. It can be used independently or as part of the `DateTimePicker` component.

**Note:** `TimePicker` also exposes a compound sub-component, `TimePicker.TimeInput`, which can be used independently to render a time input field without the full picker UI.

## [Usage](#usage)

Render a TimePicker.

```
import { useState } from 'react';
import { TimePicker } from '@wordpress/components';

const MyTimePicker = () => {
    const [ time, setTime ] = useState( new Date() );

    return (
        <TimePicker
            currentTime={ time }
            onChange={ ( newTime ) => setTime( newTime ) }
            is12Hour
        />
    );
};

```

## [Props](#props)

The component accepts the following props:

### [currentTime: Date | string | number | null](#currenttime-date-string-number-null)

The current time at initialization. Optionally pass in a `null` value to specify no time is currently selected.

-   Required: No
-   Default: current time

### [onChange: ( time: string ) => void](#onchange-time-string-void)

The function called when a new time has been selected. It is passed the time as an ISO-formatted string.

-   Required: No

### [is12Hour: boolean](#is12hour-boolean)

Whether we use a 12-hour clock. With a 12-hour clock, an AM/PM widget is displayed.

-   Required: No
-   Default: false

### [dateOrder: ‘dmy’ | ‘mdy’ | ‘ymd’](#dateorder-dmy-mdy-ymd)

The order of day, month, and year. This prop overrides the time format determined by `is12Hour` prop.

-   Required: No
-   Default: `'dmy'` (or `'mdy'` when `is12Hour` is `true`)

### [hideLabelFromVision: boolean](#hidelabelfromvision-boolean)

Whether to visually hide field labels while keeping them accessible to screen readers.

-   Required: No
-   Default: false

## [TimePicker.TimeInput](#timepicker-timeinput)

A standalone time input component. Values are passed as an object in 24-hour format (`{ hours: number, minutes: number }`).

### [Usage](#usage-2)

```
import { useState } from 'react';
import { TimePicker } from '@wordpress/components';

const MyTimeInput = () => {
    const [ time, setTime ] = useState( { hours: 13, minutes: 30 } );

    return (
        <TimePicker.TimeInput
            value={ time }
            onChange={ setTime }
            label="Time"
        />
    );
};

```

### [Props](#props-2)

#### [value: { hours: number, minutes: number }](#value-hours-number-minutes-number)

The time input value in 24-hour format.

-   Required: No

#### [defaultValue: { hours: number, minutes: number }](#defaultvalue-hours-number-minutes-number)

An optional default value for the control when used in uncontrolled mode. If left `undefined`, the current time will be used.

-   Required: No

#### [onChange: ( time: { hours: number, minutes: number } ) => void](#onchange-time-hours-number-minutes-number-void)

Called when the time changes. Receives the new value as an object with `hours` and `minutes`.

-   Required: No

#### [is12Hour: boolean](#is12hour-boolean-2)

Whether to use a 12-hour clock. With a 12-hour clock, an AM/PM widget is displayed.

-   Required: No

#### [label: string](#label-string)

The label for the time input.

-   Required: No