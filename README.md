jQuery plugin to add attachments for MediumEditor plugin
===============
This plugin adds "attachment" feature to [MediumEditor](https://github.com/daviferreira/medium-editor) ( a clone of medium.com inline editor toolbar.) This plugin is inspired by [Medium-Editor Insert Plugin](https://github.com/orthes/medium-editor-insert-plugin) by [Pavel Linkesch](https://github.com/orthes) and [Why ContentEditable is Terrible](https://medium.com/medium-eng/why-contenteditable-is-terrible-122d8a40e480) by [Nick Santos](https://medium.com/@nicksantos)

The idea behiend this plugin is overriding browser's behavior regarding some specific user action (up-down arrow, select all and delete using backspace or delete keys)

Current available attachment:
- images
 

Attachment coming soon...
- embed

## Table of Contents

- [Demo](#demo)
- [Usage](#usage)
- [Development](#development)

## <a name="demo"></a>Demo
http://omniagm.github.io/medium-add-menu/

## <a name="usage"></a>Usage
First step load the dependencies
```
<link rel="stylesheet" href="medium-editor/css/medium-editor.css">
<script src="medium-editor/js/medium-editor.min.js"></script>
<script src="bower_components/jquery/jquery.min.js"></script>
<script src="bower_components/underscore/underscore.js"></script>
```
Second Step
```
<link rel="stylesheet" href="medium-add-menu/dist/styles/main.css">
<script src="medium-add-menu/dist/scripts/medium-add-menu.js"></script>
<script src="medium-add-menu/dist/scripts/medium-add-image-extension.js"></script>
```

```
var editor = new MediumEditor('.editable', {
  excludedActions: ['u', 'h3', 'blockquote'],
  buttonLabels: 'fontawesome'
});
$('.editable').mediumAttachment({
  editor: editor,
  extensions:{
    images: {
      imagesUploadScript: '<IMAGE_UPLOAD_URL>'
    }
  }
  });
```
## <a name="development"></a>Development

The plugin uses Grunt and Bower. To install all the necessities for development run these commands:
```
npm install
bower install
```
To compile just run : ```grunt```
