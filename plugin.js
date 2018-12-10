'use strict';

(function (document, window, CKEDITOR) {
    var align = {left: 'left', right: 'right'};
    var attr = ['alt', 'height', 'src', 'width'];
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'br em s strong sub sup u; a[!href]'
        }
    };

    CKEDITOR.plugins.add('media', {
        requires: 'dialog,widget',
        icons: 'media',
        hidpi: true,
        lang: 'de,en,uk,ru',
        init: function (editor) {
            editor.widgets.add('media', {
                button: editor.lang.media.title,
                dialog: 'media',
                template: '<figure class="image"><img /><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(*); a[!href]; audio iframe img video[!src, width, height, alt, controls, allowfullscreen]; figcaption',
                requiredContent: 'figure; audio iframe img video[src]; figcaption',
                defaults: {
                    align: '',
                    alt: '',
                    caption: false,
                    height: '',
                    link: '',
                    src: '',
                    type: '',
                    width: ''
                },
                upcast: function (el) {
                    var cls = function (e) {
                        var types = CKEDITOR.media.getTypes();

                        for (var i = 0; i < types.length; ++i) {
                            if (e.hasClass(types[i])) {
                                return true;
                            }
                        }

                        return false;
                    };
                    var crit = function (e) {
                        return e.name === 'figure' && cls(e);
                    };
                    var med = function (e) {
                        return !!CKEDITOR.media.getTypeFromElement(e.name);
                    };
                    var link = function (e) {
                        return e.name === 'a' && e.children.length === 1 && med(e.children[0]);
                    };

                    // Add missing caption
                    if (crit(el) && el.children.length === 1) {
                        el.add(new CKEDITOR.htmlParser.element('figcaption', {}));
                    }

                    return crit(el) && el.children.length === 2  && (med(el.children[0]) || link(el.children[0])) && el.children[1].name === 'figcaption'
                        || !crit(el) && med(el) && !el.getAscendant(crit);
                },
                downcast: function (el) {
                    if (el.name === 'figure') {
                        if (this.data.link && el.children[0].name === 'img') {
                            el.children[0].wrapWith(new CKEDITOR.htmlParser.element('a', {'href': this.data.link}));
                        }

                        if (!el.children[1].getHtml().trim()) {
                            el.children[1].remove();
                        } else {
                            el.children[1].attributes = [];
                        }
                    }
                },
                init: function () {
                    var widget = this;
                    var el = widget.element;
                    var media = el;
                    var a;

                    // Figure with caption + link
                    if (el.getName() === 'figure') {
                        widget.setData('caption', true);
                        media = el.getFirst();

                        if (media.getName() === 'a') {
                            widget.setData('link', media.getAttribute('href'));
                            media.getChild(0).move(el, true);
                            media.remove();
                            media = el.getFirst();
                        }
                    } else {
                        if (a = el.getAscendant('a')) {
                            widget.setData('link', a.getAttribute('href'));
                        }

                        widget.inline = true;
                    }

                    // Media
                    if (media.hasAttribute('src')) {
                        media.setAttribute('src', CKEDITOR.media.getUrl(media.getAttribute('src')));
                        widget.setData('type', CKEDITOR.media.getTypeFromElement(media.getName()));
                    }

                    attr.forEach(function (item) {
                        if (media.hasAttribute(item)) {
                            widget.setData(item, media.getAttribute(item));
                        }
                    });

                    // Align
                    if (el.hasClass(align.left)) {
                        widget.setData('align', 'left');
                    } else if (el.hasClass(align.right)) {
                        widget.setData('align', 'right');
                    }
                },
                data: function () {
                    var widget = this;
                    var el = widget.element;
                    var media = el;
                    var type = widget.data.type;
                    var name;
                    var caption = null;

                    if (!widget.data.src || !type || !(name = CKEDITOR.media.getTypeElement(type))) {
                        return;
                    }

                    CKEDITOR.media.getTypes().concat([align.left, align.right]).forEach(function (item) {
                        el.removeClass(item);
                    });

                    if (el.getName() === 'figure') {
                        media = el.getChild(0);
                        caption = el.getChild(1);
                    }

                    widget.inline = !widget.data.caption;

                    if (widget.data.caption && el.getName() !== 'figure') {
                        el.renameNode('figure');
                        attr.forEach(function (item) {
                            el.removeAttribute(item);
                        });
                        media = new CKEDITOR.dom.element(name);
                        el.append(media, true);
                        caption = new CKEDITOR.dom.element('figcaption');
                        el.append(caption);
                        widget.initEditable('caption', editables.caption);
                        widget.wrapper.renameNode('div');
                        widget.wrapper.removeClass('cke_widget_inline');
                        widget.wrapper.addClass('cke_widget_block');
                    } else if (!widget.data.caption && el.getName() === 'figure') {
                        el.renameNode(name);
                        media.remove();
                        media = el;
                        caption.remove();
                        caption = null;
                        widget.wrapper.renameNode('span');
                        widget.wrapper.removeClass('cke_widget_block');
                        widget.wrapper.addClass('cke_widget_inline');
                    }

                    if (el.getName() === 'figure') {
                        el.addClass(type);
                    }

                    if (media.getName() !== name) {
                        media.renameNode(name);
                    }

                    // Media attributes
                    media.setAttribute('src', widget.data.src);

                    if (widget.data.width) {
                        media.setAttribute('width', widget.data.width);
                    } else {
                        media.removeAttribute('width');
                    }

                    if (widget.data.height) {
                        media.setAttribute('height', widget.data.height);
                    } else {
                        media.removeAttribute('height');
                    }

                    if (type === 'image') {
                        media.removeAttribute('allowfullscreen');
                        media.setAttribute('alt', widget.data.alt);
                        media.removeAttribute('controls');
                    } else if (['audio', 'video'].indexOf(type) >= 0) {
                        media.removeAttribute('allowfullscreen');
                        media.removeAttribute('alt');
                        media.setAttribute('controls', 'controls');
                    } else if (type === 'iframe') {
                        media.setAttribute('allowfullscreen', 'allowfullscreen');
                        media.removeAttribute('alt');
                        media.removeAttribute('controls');
                    }

                    // Align
                    if (widget.data.align && align.hasOwnProperty(widget.data.align)) {
                        el.addClass(align[widget.data.align]);
                    }
                }
            });

            CKEDITOR.dialog.add('media', this.path + 'dialogs/media.js');
        }
    });

    CKEDITOR.on('dialogDefinition', function (ev) {
        if (ev.data.name !== 'media') {
            return;
        }

        var button = ev.data.definition.contents[0].elements[1];

        if (!!ev.editor.plugins.mediabrowser) {
            button.mediabrowser = function (data) {
                if (!data.src) {
                    return;
                }

                var dialog = this.getDialog();

                ['alt', 'src', 'type'].forEach(function (item) {
                    if (!!data[item]) {
                        dialog.getContentElement('info', item).setValue(data[item]);
                    }
                });
            };
        } else if (!!ev.editor.plugins.filebrowser) {
            button.filebrowser = 'info:src';
        }
    }, null, null, 1);

    /**
     * Public API
     */
    CKEDITOR.media = {
        types: {
            audio: {
                element: 'audio',
                mime: [
                    'audio/aac', 'audio/flac', 'audio/mp3', 'audio/mpeg', 'audio/mpeg3', 'audio/ogg', 'audio/wav', 'audio/wave', 'audio/webm',
                    'audio/x-aac', 'audio/x-flac', 'audio/x-mp3', 'audio/x-mpeg', 'audio/x-mpeg3', 'audio/x-pn-wav', 'audio/x-wav'
                ]
            },
            iframe: {
                element: 'iframe',
                mime: ['text/html']
            },
            image: {
                element: 'img',
                mime: ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
            },
            video: {
                element: 'video',
                mime: ['video/mp4', 'video/ogg', 'video/webm']
            }
        },
        getTypes: function () {
            return Object.getOwnPropertyNames(this.types);
        },
        hasType: function (type) {
            return this.types.hasOwnProperty(type);
        },
        getTypeFromElement: function (element) {
            var types = this.getTypes();

            for (var i = 0; i < types.length; ++i) {
                if (this.types[types[i]].element === element) {
                    return types[i];
                }
            }

            return null;
        },
        getTypeFromUrl: function (url) {
            var xhr = new XMLHttpRequest();

            try {
                xhr.open('HEAD', url, false);
                xhr.send();
            } catch (e) {
                console.log(e);
                return '';
            }

            if (xhr.readyState === xhr.DONE && xhr.status >= 200 && xhr.status < 300) {
                var type = xhr.getResponseHeader('Content-Type').split(';')[0].trim();
                var types = this.getTypes();

                for (var i = 0; i < types.length; ++i) {
                    if (this.types[types[i]].mime.indexOf(type) >= 0) {
                        return types[i];
                    }
                }
            }

            return '';
        },
        getTypeElement: function (type) {
            return this.hasType(type) ? this.types[type].element : null;
        },
        getUrl: function (url) {
            var a = document.createElement('a');
            a.href = url;

            return a.origin === window.origin ? a.pathname : a.href;
        }
    };
})(document, window, CKEDITOR);
