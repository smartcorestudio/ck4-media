'use strict';

(function (CKEDITOR) {
    var align = {left: 'left', center: 'center', right: 'right'};
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'strong em'
        }
    };
    var types = {
        aac: 'audio',
        flac: 'audio',
        gif: 'img',
        jpg: 'img',
        mp3: 'audio',
        mp4: 'video',
        oga: 'audio',
        ogg: 'audio',
        ogv: 'video',
        png: 'img',
        svg: 'img',
        wav: 'audio',
        weba: 'audio',
        webm: 'video',
        webp: 'img'
    };
    var tags = [];

    Object.getOwnPropertyNames(types).forEach(function (item) {
        if (!tags.includes(types[item])) {
            tags.push(types[item]);
        }
    });

    CKEDITOR.plugins.add('media', {
        requires: 'dialog,widget',
        icons: 'media',
        hidpi: true,
        lang: 'de,en,ru',
        init: function (editor) {
            editor.widgets.add('media', {
                button: editor.lang.media.title,
                dialog: 'media',
                template: '<figure class="media"><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(!media, left, center, right); ' + tags.join(' ') + '[!src, alt, controls]; figcaption',
                requiredContent: 'figure(media); ' + tags.join(' ') + '[src]',
                defaults: {
                    align: '',
                    alt: '',
                    caption: false,
                    src: ''
                },
                upcast: function (element) {
                    var cond = function (el) {
                        return el.name === 'figure' && el.hasClass('media');
                    };

                    return cond(element) || tags.includes(element.name) && !element.getAscendant(cond);
                },
                init: function () {
                    var widget = this;
                    var el = this.element;
                    var wrapper = el.getName() === 'figure' && el.hasClass('media');

                    // Media element
                    var media = wrapper ? el.findOne(tags.join(',')) : el;

                    if (media) {
                        ['src', 'alt'].forEach(function (name) {
                            if (media.hasAttribute(name)) {
                                widget.setData(name, media.getAttribute(name));
                            }
                        });
                    }

                    // Caption element
                    if (wrapper && !!el.findOne('figcaption')) {
                        widget.setData('caption', true);
                    }

                    // Widget element
                    if (el.hasClass(align.left)) {
                        widget.setData('align', 'left');
                    } else if (el.hasClass(align.center)) {
                        widget.setData('align', 'center');
                    } else if (el.hasClass(align.right)) {
                        widget.setData('align', 'right');
                    }
                },
                data: function () {
                    var el = this.element;
                    var ext = this.data.src ? this.data.src.split('.').pop() : null;

                    if (!ext || !types.hasOwnProperty(ext)) {
                        return;
                    }

                    var caption = el.findOne('figcaption');
                    var media = el.findOne(tags.join(','));

                    if (media) {
                        media.remove();
                    }

                    if (this.data.caption) {
                        if (el.getName() !== 'figure') {
                            el.renameNode('figure');
                            el.addClass('media');
                            el.removeAttribute('src');
                            el.removeAttribute('alt');
                            el.removeAttribute('controls');
                        }

                        if (!caption) {
                            caption = new CKEDITOR.dom.element('figcaption');
                            el.append(caption);
                            this.initEditable('caption', editables.caption);
                        }

                        media = new CKEDITOR.dom.element(types[ext]);
                        el.append(media, true);
                    } else {
                        if (el.getName() !== types[ext]) {
                            el.renameNode(types[ext]);
                        }

                        if (caption) {
                            caption.remove();
                        }

                        el.removeClass('media');
                        media = el;
                    }

                    // Media element
                    media.setAttribute('src', this.data.src);

                    if (types[ext] === 'img') {
                        media.setAttribute('alt', this.data.alt);
                    } else {
                        media.setAttribute('controls', true);
                    }

                    // Widget element
                    el.removeClass(align.left);
                    el.removeClass(align.center);
                    el.removeClass(align.right);

                    if (this.data.align && align.hasOwnProperty(this.data.align)) {
                        el.addClass(align[this.data.align]);
                    }
                }
            });

            CKEDITOR.dialog.add('media', this.path + 'dialogs/media.js');
        }
    });
})(CKEDITOR);
