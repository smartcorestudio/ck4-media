'use strict';

(function (CKEDITOR) {
    var align = {left: 'left', center: 'center', right: 'right'};
    var attr = ['src', 'width', 'height', 'alt'];
    var editables = {
        caption: {
            selector: 'figcaption',
            allowedContent: 'br em strong sub sup u s; a[!href]'
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
    var ext = Object.keys(types);
    var tags = ['iframe'];

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
                template: '<figure class="media"><img /><figcaption></figcaption></figure>',
                editables: editables,
                allowedContent: 'figure(!media, left, center, right); ' + tags.join(' ') + '[!src, width, height, alt, controls, allowfullscreen]; figcaption',
                requiredContent: 'figure(media); ' + tags.join(' ') + '[src]; figcaption',
                defaults: {
                    align: '',
                    alt: '',
                    caption: false,
                    height: '',
                    src: '',
                    width: ''
                },
                upcast: function (el) {
                    var crit = function (c) {
                        return c.name === 'figure' && c.hasClass('media');
                    };

                    if (crit(el) && el.children.length === 1 && tags.indexOf(el.children[0].name) >= 0) {
                        el.add(new CKEDITOR.htmlParser.element('figcaption', {}));
                    }

                    return crit(el) && el.children.length === 2 && tags.indexOf(el.children[0].name) >= 0 && el.children[1].name === 'figcaption'
                        || !crit(el) && tags.indexOf(el.name) >= 0 && !el.getAscendant(crit);
                },
                init: function () {
                    var el = this.element;
                    var media = el;

                    // Figure with caption
                    if (el.getName() === 'figure') {
                        this.setData('caption', true);
                        media = el.getFirst();
                    }

                    // Media attributes
                    for (var i = 0; i < attr.length; i++) {
                        if (media.hasAttribute(attr[i])) {
                            this.setData(attr[i], media.getAttribute(attr[i]));
                        }
                    }

                    // Align
                    if (el.hasClass(align.left)) {
                        this.setData('align', 'left');
                    } else if (el.hasClass(align.center)) {
                        this.setData('align', 'center');
                    } else if (el.hasClass(align.right)) {
                        this.setData('align', 'right');
                    }
                },
                data: function () {
                    if (!this.data.src) {
                        return;
                    }

                    var el = this.element;
                    var i;

                    el.removeClass('media');
                    el.removeClass(align.left);
                    el.removeClass(align.center);
                    el.removeClass(align.right);

                    for (i = 0; i < tags.length; i++) {
                        el.removeClass(tags[i]);
                    }

                    var ext = this.data.src.split('.').pop();
                    var type = ext && types.hasOwnProperty(ext) ? types[ext] : 'iframe';
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
                        el.append(new CKEDITOR.dom.element('figcaption'));
                        this.initEditable('caption', editables.caption);
                        el.addClass('media');
                        el.addClass(type);
                    } else if (!this.data.caption && el.getName() === 'figure') {
                        el.renameNode(type);
                        media.remove();
                        caption.remove();
                        media = el;
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
                        media.setAttribute('controls', true);
                    } else if (type === 'iframe') {
                        media.setAttribute('allowfullscreen', true);
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
})(CKEDITOR);
