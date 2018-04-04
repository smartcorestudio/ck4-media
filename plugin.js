'use strict';

(function (CKEDITOR) {
    var align = {left: 'left', center: 'center', right: 'right'};
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'br em strong sub sup u s; a[!href,target]'
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
    var tags = ['iframe'];
    var ext = Object.getOwnPropertyNames(types);

    for (var i = 0; i < ext.length; i++) {
        if (tags.indexOf(types[ext[i]]) < 0) {
            tags.push(types[ext[i]]);
        }
    }

    CKEDITOR.plugins.add('media', {
        requires: 'dialog,widget',
        icons: 'media',
        hidpi: true,
        lang: 'bg,de,en,ru',
        init: function (editor) {
            editor.widgets.add('media', {
                button: editor.lang.media.title,
                dialog: 'media',
                template: '<figure class="media"><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(!media, left, center, right); ' + tags.join(' ') + '[!src, width, height, alt, controls, allowfullscreen]; figcaption',
                requiredContent: 'figure(media); ' + tags.join(' ') + '[src]',
                defaults: {
                    align: '',
                    alt: '',
                    caption: false,
                    src: ''
                },
                upcast: function (el) {
                    var crit = function (c) {
                        return c.name === 'figure' && c.hasClass('media');
                    };

                    return crit(el) || tags.indexOf(el.name) >= 0 && !el.getAscendant(crit);
                },
                init: function () {
                    var el = this.element;
                    var wrapper = el.getName() === 'figure' && el.hasClass('media');

                    // Media element
                    var media = wrapper ? el.findOne(tags.join(',')) : el;

                    if (media) {
                        var attr = ['src', 'width', 'height', 'alt'];

                        for (var i = 0; i < attr.length; i++) {
                            if (media.hasAttribute(attr[i])) {
                                this.setData(attr[i], media.getAttribute(attr[i]));
                            }
                        }
                    }

                    // Caption element
                    if (wrapper && !!el.findOne('figcaption')) {
                        this.setData('caption', true);
                    }

                    // Widget element
                    if (el.hasClass(align.left)) {
                        this.setData('align', 'left');
                    } else if (el.hasClass(align.center)) {
                        this.setData('align', 'center');
                    } else if (el.hasClass(align.right)) {
                        this.setData('align', 'right');
                    }
                },
                data: function () {
                    var el = this.element;
                    var ext = this.data.src ? this.data.src.split('.').pop() : null;
                    var type = ext && types.hasOwnProperty(ext) ? types[ext] : 'iframe';
                    var cls = type === 'img' ? 'image' : type;
                    var caption = el.findOne('figcaption');
                    var media = el.findOne(tags.join(','));

                    if (media) {
                        media.remove();
                    }

                    if (this.data.caption) {
                        if (el.getName() !== 'figure') {
                            el.renameNode('figure');
                            el.removeAttributes();
                            el.addClass('media');
                        }

                        if (!caption) {
                            caption = new CKEDITOR.dom.element('figcaption');
                            el.append(caption);
                            this.initEditable('caption', editables.caption);
                        }

                        media = new CKEDITOR.dom.element(type);
                        el.append(media, true);
                        el.addClass(cls);
                    } else {
                        if (el.getName() !== type) {
                            el.renameNode(type);
                        }

                        if (caption) {
                            caption.remove();
                        }

                        el.removeClass('media');
                        el.removeClass(cls);
                        media = el;
                    }

                    // Media element
                    media.setAttribute('src', this.data.src);

                    if (this.data.width) {
                        media.setAttribute('width', this.data.width);
                    }

                    if (this.data.height) {
                        media.setAttribute('height', this.data.height);
                    }

                    if (type === 'img') {
                        media.setAttribute('alt', this.data.alt);
                    } else if (['audio', 'video'].indexOf(type) >= 0) {
                        media.setAttribute('controls', true);
                    } else {
                        media.setAttribute('allowfullscreen', true);
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
