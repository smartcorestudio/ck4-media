'use strict';

(function (document, window, CKEDITOR) {
    var align = {left: 'left', center: 'center', right: 'right'};
    var attr = ['src', 'width', 'height', 'alt'];
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'em s strong sub sup u; a[!href]'
        }
    };

    CKEDITOR.plugins.add('media', {
        requires: 'dialog,widget',
        icons: 'media',
        hidpi: true,
        lang: 'de,en',
        init: function (editor) {
            var types = CKEDITOR.media.getTypes().join(' ');

            editor.widgets.add('media', {
                button: editor.lang.media.title,
                dialog: 'media',
                template: '<figure class="media"><img /><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(!media, left, center, right); a[!href]; ' + types + '[!src, width, height, alt, controls, allowfullscreen]; figcaption',
                requiredContent: 'figure(media); ' + types + '[src]; figcaption',
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
                    var crit = function (e) {
                        return e.name === 'figure' && e.hasClass('media');
                    };
                    var med = function (e) {
                        return CKEDITOR.media.hasType(e.name);
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
                        widget.setData('type', CKEDITOR.media.getTypeFromUrl(media.getAttribute('src')));
                    }

                    attr.forEach(function (item) {
                        if (media.hasAttribute(item)) {
                            widget.setData(item, media.getAttribute(item));
                        }
                    });

                    // Align
                    if (el.hasClass(align.left)) {
                        widget.setData('align', 'left');
                    } else if (el.hasClass(align.center)) {
                        widget.setData('align', 'center');
                    } else if (el.hasClass(align.right)) {
                        widget.setData('align', 'right');
                    }
                },
                data: function () {
                    var widget = this;
                    var el = widget.element;

                    if (!widget.data.src || !widget.data.type) {
                        return;
                    }

                    CKEDITOR.media.getTypes().concat(['media', align.left, align.center, align.right]).forEach(function (item) {
                        el.removeClass(item);
                    });

                    var media = el.getName() === 'figure' ? el.getChild(0) : el;
                    var caption = el.getName() === 'figure' ? el.getChild(1) : null;

                    widget.inline = !widget.data.caption;

                    if (widget.data.caption && el.getName() !== 'figure') {
                        el.renameNode('figure');
                        attr.forEach(function (item) {
                            el.removeAttribute(item);
                        });
                        media = new CKEDITOR.dom.element(widget.data.type);
                        el.append(media, true);
                        caption = new CKEDITOR.dom.element('figcaption');
                        el.append(caption);
                        widget.initEditable('caption', editables.caption);
                        widget.wrapper.renameNode('div');
                        widget.wrapper.removeClass('cke_widget_inline');
                        widget.wrapper.addClass('cke_widget_block');
                    } else if (!widget.data.caption && el.getName() === 'figure') {
                        el.renameNode(widget.data.type);
                        media.remove();
                        media = el;
                        caption.remove();
                        caption = null;
                        widget.wrapper.renameNode('span');
                        widget.wrapper.removeClass('cke_widget_block');
                        widget.wrapper.addClass('cke_widget_inline');
                    }

                    if (el.getName() === 'figure') {
                        el.addClass('media');
                        el.addClass(widget.data.type);
                    }

                    if (media.getName() !== widget.data.type) {
                        media.renameNode(widget.data.type);
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

                    if (widget.data.type === 'img') {
                        media.removeAttribute('allowfullscreen');
                        media.setAttribute('alt', widget.data.alt);
                        media.removeAttribute('controls');
                    } else if (['audio', 'video'].indexOf(widget.data.type) >= 0) {
                        media.removeAttribute('allowfullscreen');
                        media.removeAttribute('alt');
                        media.setAttribute('controls', 'controls');
                    } else if (widget.data.type === 'iframe') {
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
            button.mediabrowser = {alt: 'info:alt', src: 'info:src', type: 'info:type'};
        } else if (!!ev.editor.plugins.filebrowser) {
            button.filebrowser = 'info:src';
        }
    }, null, null, 1);

    /**
     * Public API
     */
    CKEDITOR.media = {
        types: {
            audio: [
                'audio/aac', 'audio/flac', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/wave', 'audio/webm',
                'audio/x-aac', 'audio/x-flac', 'audio/x-pn-wav', 'audio/x-wav'
            ],
            iframe: ['text/html'],
            img: ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
            video: ['video/mp4', 'video/ogg', 'video/webm']
        },
        getTypes: function () {
            return Object.getOwnPropertyNames(this.types);
        },
        hasType: function (type) {
            return this.types.hasOwnProperty(type);
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

                if (this.types.audio.indexOf(type) >= 0) {
                    return 'audio';
                }

                if (this.types.iframe.indexOf(type) >= 0) {
                    return 'iframe';
                }

                if (this.types.img.indexOf(type) >= 0) {
                    return 'img';
                }

                if (this.types.video.indexOf(type) >= 0) {
                    return 'video';
                }
            }

            return '';
        },
        getUrl: function (url) {
            var a = document.createElement('a');

            a.href = url;

            return a.origin === window.origin ? a.pathname : a.href;
        }
    };
})(document, window, CKEDITOR);
