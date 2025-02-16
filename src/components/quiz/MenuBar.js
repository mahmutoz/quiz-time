import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const MenuBar = ({ editor, openMediaLibrary }) => {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Link URL:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
        }

        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            finalUrl = 'https://' + url;
        }

        editor.chain().focus().setLink({ 
            href: finalUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
        }).run();
    };

    return (
        <div className="editor-menu-bar">
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-bold toolbar-icon"></span>}
                label={__('Kalın', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                isPressed={editor.isActive('bold')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-italic toolbar-icon"></span>}
                label={__('İtalik', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isPressed={editor.isActive('italic')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-admin-links toolbar-icon"></span>}
                label={__('Link', 'quiz-time')}
                onClick={addLink}
                isPressed={editor.isActive('link')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-format-image toolbar-icon"></span>}
                label={__('Görsel', 'quiz-time')}
                onClick={openMediaLibrary}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-alignleft toolbar-icon"></span>}
                label={__('Sola Hizala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isPressed={editor.isActive({ textAlign: 'left' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-aligncenter toolbar-icon"></span>}
                label={__('Ortala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isPressed={editor.isActive({ textAlign: 'center' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-alignright toolbar-icon"></span>}
                label={__('Sağa Hizala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isPressed={editor.isActive({ textAlign: 'right' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-ul toolbar-icon"></span>}
                label={__('Liste', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isPressed={editor.isActive('bulletList')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-ol toolbar-icon"></span>}
                label={__('Numaralı Liste', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isPressed={editor.isActive('orderedList')}
            />
        </div>
    );
};

export default MenuBar; 