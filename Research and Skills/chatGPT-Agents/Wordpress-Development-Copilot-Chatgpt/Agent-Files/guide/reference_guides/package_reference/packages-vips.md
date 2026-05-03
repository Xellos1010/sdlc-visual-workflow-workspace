# @wordpress/vips – Block Editor Handbook | Developer.WordPress.org

Helper package to interact with [`wasm-vips`](https://github.com/kleisauke/wasm-vips).

## [Installation](#installation)

Install the module

```
npm install @wordpress/vips --save

```

## [API Reference](#api-reference)

### [batchResizeImage](#batchresizeimage)

Resizes an image into multiple sizes in a single pass using copyMemory().

Decodes the source image once, materializes it in WASM memory via copyMemory(), then uses thumbnailImage() for each sub-size. This avoids re-decoding the source for every thumbnail.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *inputType* `string`: Input mime type.
-   *outputType* `string`: Output mime type for all results.
-   *resizes* `BatchResizeConfig[]`: Array of resize configurations.
-   *smartCrop* Whether to use smart cropping (i.e. saliency-aware).

*Returns*

-   `Promise< BatchResizeResult[] >`: Array of processed results, one per resize config.

### [cancelOperations](#canceloperations)

Cancels all ongoing image operations for a given item ID.

The onProgress callbacks check for an IDs existence in this list, killing the process if it’s absent.

*Parameters*

-   *id* `ItemId`: Item ID.

*Returns*

-   boolean Whether any operation was cancelled.

### [compressImage](#compressimage)

Compresses an existing image using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *quality* Desired quality.
-   *interlaced* Whether to use interlaced/progressive mode. Only used if the outputType supports it.

*Returns*

-   `Promise< ArrayBuffer | ArrayBufferLike >`: Compressed file data.

### [convertImageFormat](#convertimageformat)

Converts an image to a different format using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *inputType* `string`: Input mime type.
-   *outputType* `string`: Output mime type.
-   *quality* Desired quality.
-   *interlaced* Whether to use interlaced/progressive mode. Only used if the outputType supports it.

### [hasTransparency](#hastransparency)

Determines whether an image has an alpha channel.

*Parameters*

-   *buffer* `ArrayBuffer`: Original file object.

*Returns*

-   `Promise< boolean >`: Whether the image has an alpha channel.

### [resizeImage](#resizeimage)

Resizes an image using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *resize* `ImageSizeCrop`: Resize options.
-   *smartCrop* Whether to use smart cropping (i.e. saliency-aware).
-   *quality* Desired quality (0-1).

*Returns*

-   `Promise< { buffer: ArrayBuffer | ArrayBufferLike; width: number; height: number; originalWidth: number; originalHeight: number; } >`: Processed file data plus the old and new dimensions.

### [rotateImage](#rotateimage)

Rotates an image based on EXIF orientation value.

EXIF orientation values: 1 = Normal (no rotation needed) 2 = Flipped horizontally 3 = Rotated 180° 4 = Flipped vertically 5 = Rotated 90° CCW and flipped horizontally 6 = Rotated 90° CW 7 = Rotated 90° CW and flipped horizontally 8 = Rotated 90° CCW

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *orientation* `number`: EXIF orientation value (1-8).

*Returns*

-   `Promise< { buffer: ArrayBuffer | ArrayBufferLike; width: number; height: number; } >`: Rotated file data plus the new dimensions.

### [vipsBatchResizeImage](#vipsbatchresizeimage)

Resizes an image into multiple sizes in a single pass using copyMemory().

Decodes the source image once, materializes it in WASM memory via copyMemory(), then uses thumbnailImage() for each sub-size. This avoids re-decoding the source for every thumbnail.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *inputType* `string`: Input mime type.
-   *outputType* `string`: Output mime type for all results.
-   *resizes* `BatchResizeConfig[]`: Array of resize configurations.
-   *smartCrop* Whether to use smart cropping (i.e. saliency-aware).

*Returns*

-   `Promise< BatchResizeResult[] >`: Array of processed results, one per resize config.

### [vipsCancelOperations](#vipscanceloperations)

Cancels all ongoing image operations for a given item ID.

The onProgress callbacks check for an IDs existence in this list, killing the process if it’s absent.

*Parameters*

-   *id* `ItemId`: Item ID.

*Returns*

-   boolean Whether any operation was cancelled.

### [vipsCompressImage](#vipscompressimage)

Compresses an existing image using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *quality* Desired quality.
-   *interlaced* Whether to use interlaced/progressive mode. Only used if the outputType supports it.

*Returns*

-   `Promise< ArrayBuffer | ArrayBufferLike >`: Compressed file data.

### [vipsConvertImageFormat](#vipsconvertimageformat)

Converts an image to a different format using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *inputType* `string`: Input mime type.
-   *outputType* `string`: Output mime type.
-   *quality* Desired quality.
-   *interlaced* Whether to use interlaced/progressive mode. Only used if the outputType supports it.

### [vipsHasTransparency](#vipshastransparency)

Determines whether an image has an alpha channel.

*Parameters*

-   *buffer* `ArrayBuffer`: Original file object.

*Returns*

-   `Promise< boolean >`: Whether the image has an alpha channel.

### [vipsResizeImage](#vipsresizeimage)

Resizes an image using vips.

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *resize* `ImageSizeCrop`: Resize options.
-   *smartCrop* Whether to use smart cropping (i.e. saliency-aware).
-   *quality* Desired quality (0-1).

*Returns*

-   `Promise< { buffer: ArrayBuffer | ArrayBufferLike; width: number; height: number; originalWidth: number; originalHeight: number; } >`: Processed file data plus the old and new dimensions.

### [vipsRotateImage](#vipsrotateimage)

Rotates an image based on EXIF orientation value.

EXIF orientation values: 1 = Normal (no rotation needed) 2 = Flipped horizontally 3 = Rotated 180° 4 = Flipped vertically 5 = Rotated 90° CCW and flipped horizontally 6 = Rotated 90° CW 7 = Rotated 90° CW and flipped horizontally 8 = Rotated 90° CCW

*Parameters*

-   *id* `ItemId`: Item ID.
-   *buffer* `ArrayBuffer`: Original file buffer.
-   *type* `string`: Mime type.
-   *orientation* `number`: EXIF orientation value (1-8).

*Returns*

-   `Promise< { buffer: ArrayBuffer | ArrayBufferLike; width: number; height: number; } >`: Rotated file data plus the new dimensions.