# @wordpress/fields – Block Editor Handbook | Developer.WordPress.org

This package provides core elements for the DataView library, designed to simplify the creation and management of data display elements in WordPress.

## [Installation](#installation)

Install the module

```
npm install @wordpress/fields --save

```

## [Usage](#usage)

Author field for BasePost.

### [BasePost](#basepost)

Undocumented declaration.

### [BasePostWithEmbeddedAuthor](#basepostwithembeddedauthor)

Undocumented declaration.

Comment status field for BasePost.

### [CreateTemplatePartModal](#createtemplatepartmodal)

A React component that renders a modal for creating a template part. The modal displays a title and the contents for creating the template part. This component should not live in this package, it should be moved to a dedicated package responsible for managing template.

*Parameters*

-   *props* `{ modalTitle?: string; } & CreateTemplatePartModalContentsProps`: The component props.
-   *props.modalTitle* `{ modalTitle?: string; } & CreateTemplatePartModalContentsProps[ 'modalTitle' ]`:

### [dateField](#datefield)

Date field for BasePost.

### [deletePost](#deletepost)

Delete action for Templates, Patterns and Template Parts.

### [discussionField](#discussionfield)

Discussion field for BasePost with custom render logic.

### [duplicatePattern](#duplicatepattern)

Duplicate action for Pattern.

### [duplicatePost](#duplicatepost)

Duplicate action for BasePost.

### [duplicateTemplatePart](#duplicatetemplatepart)

Duplicate action for TemplatePart.

### [excerptField](#excerptfield)

Excerpt field for BasePost.

### [exportPattern](#exportpattern)

Export action as JSON for Pattern.

### [featuredImageField](#featuredimagefield)

Featured Image field for BasePostWithEmbeddedFeaturedMedia.

### [formatField](#formatfield)

Format field for BasePost.

### [MediaEdit](#mediaedit)

A media edit control component that provides a media picker UI with upload functionality for selecting WordPress media attachments. Supports both the traditional WordPress media library and the experimental DataViews media modal.

This component is intended to be used as the `Edit` property of a field definition when registering fields with `registerEntityField` from `@wordpress/editor`.

*Usage*

```
import { MediaEdit } from '@wordpress/fields';
import type { DataFormControlProps } from '@wordpress/dataviews';

const featuredImageField = {
    id: 'featured_media',
    type: 'media',
    label: 'Featured Image',
    Edit: ( props: DataFormControlProps< MyPostType > ) => (
        <MediaEdit { ...props } allowedTypes={ [ 'image' ] } />
    ),
};

```

*Parameters*

-   *props* `MediaEditProps<Item>`: – The component props.
-   *props.data* `Item`: – The item being edited.
-   *props.field* `Object`: – The field configuration with getValue and setValue methods.
-   *props.onChange* `Function`: – Callback function when the media selection changes.
-   *props.allowedTypes* `[string[]]`: – Array of allowed media types. Use `['*']` to allow all file types. Default `['image']`.
-   *props.multiple* `[boolean]`: – Whether to allow multiple media selections. Default `false`.
-   *props.hideLabelFromVision* `[boolean]`: – Whether the label should be hidden from vision.
-   *props.isExpanded* `[boolean]`: – Whether to render in an expanded form. Default `false`.

*Returns*

-   `React.JSX.Element`: The media edit control component.

### [MediaEditProps](#mediaeditprops)

Undocumented declaration.

### [notesField](#notesfield)

Notes count field for post types that support editor.notes.

### [orderField](#orderfield)

Order field for BasePost.

### [pageTitleField](#pagetitlefield)

Title for the page entity.

### [parentField](#parentfield)

Parent field for BasePost.

### [passwordField](#passwordfield)

Password field for BasePost.

### [Pattern](#pattern)

Undocumented declaration.

### [patternTitleField](#patterntitlefield)

Title for the pattern entity.

### [permanentlyDeletePost](#permanentlydeletepost)

Delete action for PostWithPermissions.

### [pingStatusField](#pingstatusfield)

Ping status field for BasePost.

### [postContentInfoField](#postcontentinfofield)

Post content information field for BasePost.

### [PostType](#posttype)

Undocumented declaration.

### [renamePost](#renamepost)

Rename action for PostWithPermissions.

### [reorderPage](#reorderpage)

Reorder action for BasePost.

### [resetPost](#resetpost)

Reset action for Template and TemplatePart.

### [restorePost](#restorepost)

Restore action for PostWithPermissions.

### [scheduledDateField](#scheduleddatefield)

ScheduledDate Field.

### [slugField](#slugfield)

Slug field for BasePost.

### [statusField](#statusfield)

Status field for BasePost.

### [stickyField](#stickyfield)

Sticky field for BasePost.

### [templateField](#templatefield)

Template field for BasePost.

### [templateTitleField](#templatetitlefield)

Title for the template entity.

### [titleField](#titlefield)

Title for the any entity with a `title` property. For patterns, pages or templates you should use the respective field because there are some differences in the rendering, labels, etc.

### [trashPost](#trashpost)

Trash action for PostWithPermissions.

### [viewPost](#viewpost)

View post action for BasePost.

### [viewPostRevisions](#viewpostrevisions)

View post revisions action for Post.

## [Contributing to this package](#contributing-to-this-package)

This is an individual package that’s part of the Gutenberg project. The project is organized as a monorepo. It’s made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project’s main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).