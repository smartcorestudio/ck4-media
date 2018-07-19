'use strict';

(function (document, CKEDITOR) {
    CKEDITOR.dialog.add('media', function (editor) {
        var lang = editor.lang.media;
        var common = editor.lang.common;
        var types = [[common.notSet, '']].concat(CKEDITOR.media.getTypes().map(function (item) {
            return [lang[item], item];
        }).sort(function (a, b) {
            if (a[0] < b[0]) {
                return -1;
            }

            if (a[0] > b[0]) {
                return 1;
            }

            return 0;
        }));

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
                            id: 'src',
                            type: 'text',
                            label: common.url,
                            setup: function (widget) {
                                this.setValue(widget.data.src);
                            },
                            commit: function (widget) {
                                widget.setData('src', this.getValue());
                            },
                            validate: CKEDITOR.dialog.validate.notEmpty(lang.validateRequired),
                            onChange: function () {
                                var type = this.getValue() ? CKEDITOR.media.getTypeFromUrl(this.getValue()) : '';
                                this.getDialog().getContentElement('info', 'type').setValue(type);
                            }
                        },
                        {
                            id: 'browse',
                            type: 'button',
                            label: common.browseServer,
                            hidden: true
                        },
                        {
                            id: 'type',
                            type: 'select',
                            label: lang.type,
                            items: types,
                            setup: function (widget) {
                                this.setValue(widget.data.type);
                            },
                            commit: function (widget) {
                                widget.setData('type', this.getValue());
                            },
                            validate: CKEDITOR.dialog.validate.notEmpty(lang.validateRequired)
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
                            id: 'caption',
                            type: 'checkbox',
                            label: lang.caption,
                            setup: function (widget) {
                                this.setValue(widget.data.caption);
                            },
                            commit: function (widget) {
                                widget.setData('caption', this.getValue());
                            }
                        },
                        {
                            id: 'link',
                            type: 'text',
                            label: lang.link,
                            setup: function (widget) {
                                this.setValue(widget.data.link);
                            },
                            commit: function (widget) {
                                widget.setData('link', this.getValue());
                            }
                        },
                        {
                            type: 'hbox',
                            children: [
                                {
                                    id: 'width',
                                    type: 'text',
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
                            id: 'align',
                            type: 'radio',
                            label: common.align,
                            items: [
                                [common.alignNone, ''],
                                [common.left, 'left'],
                                [common.right, 'right']
                            ],
                            setup: function (widget) {
                                this.setValue(widget.data.align);
                            },
                            commit: function (widget) {
                                widget.setData('align', this.getValue());
                            }
                        }
                    ]
                }
            ]
        };
    });
})(document, CKEDITOR);
