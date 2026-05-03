# WithNotices – Block Editor Handbook | Developer.WordPress.org

`withNotices` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) used typically in adding the ability to post notice messages within the original component.

Wrapping the original component with `withNotices` encapsulates the component with the additional props `noticeOperations`, `noticeUI`, and `noticeList`.

**noticeOperations**  
Contains a number of useful functions to add notices to your site.

[#](#createNotice) **createNotice**  
Function passed down as a prop that adds a new notice.

*Parameters*

-   *notice* `object`: Notice to add.

[#](#createErrorNotice) **createErrorNotice**  
Function passed as a prop that adds a new error notice.

*Parameters*

-   *msg* `string`: Error message of the notice.

[#](#removeAllNotices) **removeAllNotices**  
Function that removes all notices.

[#](#removeNotice) **removeNotice**  
Function that removes notice by ID.

*Parameters*

-   *id* `string`: ID of notice to remove.

[#](#noticeUi)**noticeUi**  
The rendered `NoticeList`.

[#](#noticeList)**noticeList**  
The array of notice objects to be displayed.

## Usage

```
import { withNotices, Button } from '@wordpress/components';

const MyComponentWithNotices = withNotices(
    ( { noticeOperations, noticeUI } ) => {
        const addError = () =>
            noticeOperations.createErrorNotice( 'Error message' );
        return (
            <div>
                { noticeUI }
                <Button variant="secondary" onClick={ addError }>
                    Add error
                </Button>
            </div>
        );
    }
);

```