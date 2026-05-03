# @wordpress/media-utils – Block Editor Handbook | Developer.WordPress.org

The media utils package provides a set of artifacts to abstract media functionality that may be useful in situations where there is a need to deal with media uploads or with the media library, e.g., artifacts that extend or implement a block-editor.  
This package is meant to be used by the WordPress core. It may not work as expected outside WordPress usages.

## [Installation](#installation)

Install the module

```
npm install @wordpress/media-utils --save

```

*This package assumes that your code will run in an **ES2015+** environment. If you’re using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code.*

## [API](#api)

### [Attachment](#attachment)

Undocumented declaration.

### [MediaUpload](#mediaupload)

Undocumented declaration.

### [privateApis](#privateapis)

Private @wordpress/media-utils APIs.

### [RestAttachment](#restattachment)

Undocumented declaration.

### [SubSizeData](#subsizedata)

Undocumented declaration.

### [transformAttachment](#transformattachment)

Transforms an attachment object from the REST API shape into the shape expected by the block editor and other consumers.

*Parameters*

-   *attachment* `RestAttachment`: REST API attachment object.

### [uploadMedia](#uploadmedia)

Upload a media file when the file upload button is activated or when adding a file to the editor via drag & drop.

*Parameters*

-   *$0* `UploadMediaArgs`: Parameters object passed to the function.
-   *$0.allowedTypes* `UploadMediaArgs[ 'allowedTypes' ]`: Array with the types of media that can be uploaded, if unset all types are allowed.
-   *$0.additionalData* `UploadMediaArgs[ 'additionalData' ]`: Additional data to include in the request.
-   *$0.filesList* `UploadMediaArgs[ 'filesList' ]`: List of files.
-   *$0.maxUploadFileSize* `UploadMediaArgs[ 'maxUploadFileSize' ]`: Maximum upload size in bytes allowed for the site.
-   *$0.onError* `UploadMediaArgs[ 'onError' ]`: Function called when an error happens.
-   *$0.onFileChange* `UploadMediaArgs[ 'onFileChange' ]`: Function called each time a file or a temporary representation of the file is available.
-   *$0.wpAllowedMimeTypes* `UploadMediaArgs[ 'wpAllowedMimeTypes' ]`: List of allowed mime types and file extensions.
-   *$0.signal* `UploadMediaArgs[ 'signal' ]`: Abort signal.
-   *$0.multiple* `UploadMediaArgs[ 'multiple' ]`: Whether to allow multiple files to be uploaded.

### [validateFileSize](#validatefilesize)

Verifies whether the file is within the file upload size limits for the site.

*Parameters*

-   *file* `File`: File object.
-   *maxUploadFileSize* `number`: Maximum upload size in bytes allowed for the site.

### [validateMimeType](#validatemimetype)

Verifies if the caller (e.g. a block) supports this mime type.

*Parameters*

-   *file* `File`: File object.
-   *allowedTypes* `string[]`: List of allowed mime types.

### [validateMimeTypeForUser](#validatemimetypeforuser)

Verifies if the user is allowed to upload this mime type.

*Parameters*

-   *file* `File`: File object.
-   *wpAllowedMimeTypes* `Record< string, string > | null`: List of allowed mime types and file extensions.

## [Usage](#usage)

### [uploadMedia](#uploadmedia-2)

Media upload util is a function that allows the invokers to upload files to the WordPress media library.  
As an example, provided that `myFiles` is an array of file objects, `handleFileChange` on onFileChange is a function that receives an array of objects containing the description of WordPress media items and `handleFileError` is a function that receives an object describing a possible error, the following code uploads a file to the WordPress media library:

```
wp.mediaUtils.utils.uploadMedia( {
    filesList: myFiles,
    onFileChange: handleFileChange,
    onError: handleFileError,
} );

```

The following code uploads a file named foo.txt with foo as content to the media library and alerts its URL:

```
wp.mediaUtils.utils.uploadMedia( {
    filesList: [ new File( [ 'foo' ], 'foo.txt', { type: 'text/plain' } ) ],
    onFileChange: ( [ fileObj ] ) => alert( fileObj.url ),
    onError: console.error,
} );

```

Beware that first onFileChange is called with temporary blob URLs and then with the final URL’s this allows to show the result in an optimistic UI as if the upload was already completed. E.g.: when uploading an image, one can show the image right away in the UI even before the upload is complete.

### [MediaUpload](#mediaupload-2)

Media upload component provides a UI button that allows users to open the WordPress media library. It is normally used in conjunction with the filter `editor.MediaUpload`.  
The component follows the interface specified in [https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/media-upload/README.md), and more details regarding its usage can be checked there.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).