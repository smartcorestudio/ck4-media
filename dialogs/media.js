'use strict';

(function (document, CKEDITOR) {
    CKEDITOR.dialog.add('media', function (editor) {
        var lang = editor.lang.media;
        var common = editor.lang.common;

        return {
            title: lang.title,
            resizable: CKEDITOR.DIALOG_RESIZE_BOTH,
            minWidth: 250,
            minHeight: 100,
            contents: [
                {
                    id: 'info',
                    label: lang.info,
                    elements: [
                        {

                            type: 'hbox',
                            children: [
                                {
                                    id: 'src',
                                    type: 'text',
                                    label: common.url,
                                    setup: function (widget) {
                                        this.setValue(widget.data.src);
                                    },
                                    commit: function (widget) {
                                        widget.setData('src', this.getValue());
                                    },
                                    validate: CKEDITOR.dialog.validate.notEmpty(lang.urlMissing)
                                },
                                {
                                    id: 'browse',
                                    type: 'button',
                                    label: common.browseServer,
                                    hidden: true,
                                    filebrowser: 'info:src'
                                }
                            ]
                        },
                        {
                            type: 'hbox',
                            children: [
                                {
                                    id: 'width',
                                    type: 'text',
                                    width: '45px',
                                    label: common.width,
                                    setup: function (widget) {
                                        this.setValue(widget.data.width);
                                    },
                                    commit: function (widget) {
                                        widget.setData('width', this.getValue());
                                    }
                                },
                                {
                                    id: 'height',
                                    type: 'text',
                                    width: '45px',
                                    label: common.height,
                                    setup: function (widget) {
                                        this.setValue(widget.data.height);
                                    },
                                    commit: function (widget) {
                                        widget.setData('height', this.getValue());
                                    }
                                }
                            ]
                        },
                        {
                            id: 'alt',
                            type: 'text',
                            label: lang.alt,
                            setup: function (widget) {
                                this.setValue(widget.data.alt);
                            },
                            commit: function (widget) {
                                widget.setData('alt', this.getValue());
                            }
                        },
                        {
                            id: 'align',
                            type: 'radio',
                            label: common.align,
                            items: [
                                [common.alignNone, ''],
                                [common.alignLeft, 'left'],
                                [common.alignCenter, 'center'],
                                [common.alignRight, 'right']
                            ],
                            setup: function (widget) {
                                this.setValue(widget.data.align);
                            },
                            commit: function (widget) {
                                widget.setData('align', this.getValue());
                            }
                        },
                        {
                            id: 'caption',
                            type: 'checkbox',
                            label: lang.caption,
                            setup: function (widget) {
                                this.setValue(widget.data.caption);
                            },
                            commit: function (widget) {
                                widget.setData('caption', this.getValue());
                            }
                        }
                    ]
                }
            ]
        };
    });
})(document, CKEDITOR);
