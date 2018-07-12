'use strict';

(function (window, CKEDITOR) {
    var align = {left: 'left', center: 'center', right: 'right'};
    var attr = ['src', 'width', 'height', 'alt'];
    var container = ['hbox', 'vbox', 'fieldset'];
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'em s strong sub sup u; a[!href]'
        }
    };
    var types = ['audio', 'iframe', 'img', 'video'];

    CKEDITOR.plugins.add('media', {
        requires: 'dialog,widget',
        icons: 'media',
        hidpi: true,
        lang: 'bg,de,en,ru',
        init: function (editor) {
            editor.widgets.add('media', {
                button: editor.lang.media.title,
                dialog: 'media',
                template: '<figure class="media"><img /><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(!media, left, center, right); a[!href]; ' + types.join(' ') + '[!src, width, height, alt, controls, allowfullscreen]; figcaption',
                requiredContent: 'figure(media); ' + types.join(' ') + '[src]; figcaption',
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
                        return types.indexOf(e.name) >= 0;
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

                    // Media type
                    widget.setData('type', media.getName());

                    // Media attributes
                    attr.forEach(function (a) {
                        if (media.hasAttribute(a)) {
                            widget.setData(a, media.getAttribute(a));
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
                    if (!this.data.src || !this.data.type) {
                        return;
                    }

                    var el = this.element;
                    var i;

                    el.removeClass('media');
                    el.removeClass(align.left);
                    el.removeClass(align.center);
                    el.removeClass(align.right);

                    for (i = 0; i < types.length; i++) {
                        el.removeClass(types[i]);
                    }

                    var type = this.data.type;
                    var media = el.getName() === 'figure' ? el.getChild(0) : el;
                    var caption = el.getName() === 'figure' ? el.getChild(1) : null;

                    this.inline = !this.data.caption;

                    if (this.data.caption && el.getName() !== 'figure') {
                        el.renameNode('figure');

                        for (i = 0; i < attr.length; i++) {
                            el.removeAttribute(attr[i]);
                        }

                        media = new CKEDITOR.dom.element(type);
                        el.append(media, true);
                        caption = new CKEDITOR.dom.element('figcaption');
                        el.append(caption);
                        this.initEditable('caption', editables.caption);
                        el.addClass('media');
                        el.addClass(type);
                        this.wrapper.renameNode('div');
                        this.wrapper.removeClass('cke_widget_inline');
                        this.wrapper.addClass('cke_widget_block');
                    } else if (!this.data.caption && el.getName() === 'figure') {
                        el.renameNode(type);
                        media.remove();
                        media = el;
                        caption.remove();
                        caption = null;
                        this.wrapper.renameNode('span');
                        this.wrapper.removeClass('cke_widget_block');
                        this.wrapper.addClass('cke_widget_inline');
                    }

                    if (media.getName() !== type) {
                        media.renameNode(type);
                    }

                    // Media attributes
                    media.setAttribute('src', this.data.src);

                    if (this.data.width) {
                        media.setAttribute('width', this.data.width);
                    } else {
                        media.removeAttribute('width');
                    }

                    if (this.data.height) {
                        media.setAttribute('height', this.data.height);
                    } else {
                        media.removeAttribute('height');
                    }

                    if (type === 'img') {
                        media.removeAttribute('allowfullscreen');
                        media.setAttribute('alt', this.data.alt);
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
                    if (this.data.align && align.hasOwnProperty(this.data.align)) {
                        el.addClass(align[this.data.align]);
                    }
                }
            });

            CKEDITOR.dialog.add('media', this.path + 'dialogs/media.js');
        }
    });
    CKEDITOR.on('dialogDefinition', function (ev) {
        if (!ev.editor.plugins.media || !ev.editor.config.mediaBrowserUrl) {
            return;
        }

        var def = ev.data.definition;

        for (var i = 0; i < def.contents.length; ++i) {
            if (def.contents[i] && def.contents[i].elements) {
                findMediaBrowser(def.contents[i].elements);
            }
        }
    });

    function findMediaBrowser(items) {
        if (!Array.isArray(items) || items.length <= 0) {
            return;
        }

        items.forEach(function (item) {
            if (container.indexOf(item.type) >= 0 && item.children && item.children.length > 0) {
                findMediaBrowser(item.children);
            } else if (item.type === 'button' && item.mediabrowser) {
                item.hidden = false;
                item.onClick = mediaBrowser;
            }
        });
    }

    function mediaBrowser(ev) {
        var dialog = ev.sender.getDialog();
        var url = dialog.getParentEditor().config.mediaBrowserUrl;
        var win = window.open(
            url,
            'mediabrowser',
            'location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,resizable=yes,scrollbars=yes'
        );

        window.addEventListener('message', function (e) {
            if (e.origin === win.origin && e.data.id === 'mediabrowser' && !!e.data.src) {
                ev.data.dialog.getContentElement('info', 'src').setValue(e.data.src);

                if (!!e.data.alt) {
                    ev.data.dialog.getContentElement('info', 'alt').setValue(e.data.alt);
                }

                if (!!e.data.type) {
                    ev.data.dialog.getContentElement('info', 'type').setValue(e.data.type);
                }
            }
        }, false);
    }
})(window, CKEDITOR);
