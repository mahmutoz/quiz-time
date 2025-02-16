import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { __ } from '@wordpress/i18n';
import MenuBar from './MenuBar';

const TiptapEditor = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'quiz-list quiz-list-bullet',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'quiz-list quiz-list-ordered',
                    },
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'quiz-image',
                },
                allowBase64: true,
                resizable: true,
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'quiz-link',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const openMediaLibrary = () => {
        const mediaFrame = window.wp.media({
            title: __('Görsel Seç', 'quiz-time'),
            library: { type: 'image' },
            multiple: false,
            button: { text: __('Seç', 'quiz-time') }
        });

        mediaFrame.on('select', function() {
            const attachment = mediaFrame.state().get('selection').first().toJSON();
            editor.chain().focus().setImage({ 
                src: attachment.url,
                alt: attachment.alt,
                title: attachment.title,
            }).run();
        });

        mediaFrame.open();
    };

    return (
        <div className="tiptap-editor">
            <MenuBar editor={editor} openMediaLibrary={openMediaLibrary} />
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
};

export default TiptapEditor; 