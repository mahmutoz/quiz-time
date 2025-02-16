import { useState, useEffect } from '@wordpress/element';
import { Button, SelectControl, Toolbar, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MenuBar = ({ editor, openMediaLibrary }) => {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Link URL:', previousUrl);

        // Eğer URL girilmediyse veya iptal edildiyse
        if (url === null) {
            return;
        }

        // Eğer URL boşsa, mevcut linki kaldır
        if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
        }

        // URL'yi düzelt (http:// veya https:// ekle)
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            finalUrl = 'https://' + url;
        }

        // Linki ekle
        editor.chain().focus().setLink({ 
            href: finalUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
        }).run();
    };

    return (
        <div className="editor-menu-bar">
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-bold"></span>}
                label={__('Kalın', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                isPressed={editor.isActive('bold')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-italic"></span>}
                label={__('İtalik', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isPressed={editor.isActive('italic')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-admin-links"></span>}
                label={__('Link', 'quiz-time')}
                onClick={addLink}
                isPressed={editor.isActive('link')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-format-image"></span>}
                label={__('Görsel', 'quiz-time')}
                onClick={openMediaLibrary}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-alignleft"></span>}
                label={__('Sola Hizala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isPressed={editor.isActive({ textAlign: 'left' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-aligncenter"></span>}
                label={__('Ortala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isPressed={editor.isActive({ textAlign: 'center' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-alignright"></span>}
                label={__('Sağa Hizala', 'quiz-time')}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isPressed={editor.isActive({ textAlign: 'right' })}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-ul"></span>}
                label={__('Liste', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isPressed={editor.isActive('bulletList')}
            />
            <ToolbarButton
                icon={<span className="dashicons dashicons-editor-ol"></span>}
                label={__('Numaralı Liste', 'quiz-time')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isPressed={editor.isActive('orderedList')}
            />
        </div>
    );
};

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

const SortableQuestion = ({ question, questionIndex, OPTION_LABELS, onQuestionChange, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="quiz-question-editor">
            <div className="question-header" {...attributes} {...listeners}>
                <div className="question-number">{questionIndex + 1}</div>
                <span className="drag-handle dashicons dashicons-move"></span>
            </div>
            
            <div className="question-content">
                <TiptapEditor
                    content={question.question}
                    onChange={(content) => {
                        onQuestionChange(questionIndex, 'question', content);
                    }}
                    placeholder={__('Soru metnini buraya yazın...', 'quiz-time')}
                />
                
                <div className="question-options">
                    {question.options.map((option, optionIndex) => (
                        <div key={`${question.id}-option-${optionIndex}`} className="option-row">
                            <span className="option-label">{OPTION_LABELS[optionIndex]}</span>
                            <TiptapEditor
                                content={option}
                                onChange={(content) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = content;
                                    onQuestionChange(questionIndex, 'options', newOptions);
                                }}
                                placeholder={__('Seçenek metnini buraya yazın...', 'quiz-time')}
                            />
                        </div>
                    ))}
                </div>

                <div className="question-footer">
                    <SelectControl
                        label={__('Doğru Cevap', 'quiz-time')}
                        value={question.correctAnswer}
                        options={OPTION_LABELS.map((label, i) => ({
                            label: label,
                            value: i
                        }))}
                        onChange={(value) => {
                            onQuestionChange(questionIndex, 'correctAnswer', parseInt(value));
                        }}
                    />

                    <Button
                        isDestructive
                        variant="secondary"
                        onClick={() => onRemove(questionIndex)}
                    >
                        {__('Soruyu Sil', 'quiz-time')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const QuizEditor = () => {
    const [questions, setQuestions] = useState([]);
    const [jsonInput, setJsonInput] = useState('');
    const [showJsonImport, setShowJsonImport] = useState(false);

    const OPTION_LABELS = ['A', 'B', 'C', 'D'];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Soruları yükle
    useEffect(() => {
        const loadQuestions = () => {
            // Meta box'taki hidden input'tan veriyi al
            const hiddenInput = document.getElementById('quiz-questions-data');
            if (!hiddenInput) return;

            try {
                const savedData = hiddenInput.value;
                if (savedData) {
                    const parsedQuestions = JSON.parse(savedData);
                    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                        setQuestions(parsedQuestions);
                    }
                }
            } catch (error) {
                console.error('Quiz data loading error:', error);
            }
        };

        loadQuestions();

        // Post kaydetme event'ini dinle
        const handleBeforeSave = () => {
            const hiddenInput = document.getElementById('quiz-questions-data');
            if (hiddenInput && questions.length > 0) {
                hiddenInput.value = JSON.stringify(questions);
            }
        };

        // WordPress'in post kaydetme butonlarına event listener ekle
        const publishButton = document.getElementById('publish');
        const saveButton = document.getElementById('save-post');
        
        if (publishButton) {
            publishButton.addEventListener('click', handleBeforeSave);
        }
        if (saveButton) {
            saveButton.addEventListener('click', handleBeforeSave);
        }

        // Cleanup
        return () => {
            if (publishButton) {
                publishButton.removeEventListener('click', handleBeforeSave);
            }
            if (saveButton) {
                saveButton.removeEventListener('click', handleBeforeSave);
            }
        };
    }, []);

    // Sorular değiştiğinde hidden input'u güncelle
    useEffect(() => {
        const hiddenInput = document.getElementById('quiz-questions-data');
        if (hiddenInput && questions.length > 0) {
            hiddenInput.value = JSON.stringify(questions);
        }
    }, [questions]);

    useEffect(() => {
        // TinyMCE'yi başlat veya güncelle
        if (window.tinymce) {
            initializeTinyMCE();
        }
    }, [questions]); // questions değiştiğinde editörleri güncelle

    const initializeTinyMCE = () => {
        const editors = document.querySelectorAll('.tinymce-editor');
        editors.forEach((editor) => {
            // Eğer editör zaten başlatılmışsa, kaldır
            if (window.tinymce.get(editor.id)) {
                window.tinymce.get(editor.id).remove();
            }

            const editorId = editor.id;
            const matches = editorId.match(/(?:question|option)-(\d+)(?:-(\d+))?$/);
            if (!matches) return;

            const questionIndex = parseInt(matches[1]);
            const optionIndex = matches[2] ? parseInt(matches[2]) : null;

            // Mevcut içeriği al
            let content = '';
            if (optionIndex !== null) {
                content = questions[questionIndex]?.options[optionIndex] || '';
            } else {
                content = questions[questionIndex]?.question || '';
            }

            // TinyMCE'yi başlat
            window.tinymce.init({
                selector: `#${editorId}`,
                height: 150,
                menubar: false,
                plugins: [
                    'lists link image paste wordpress wplink wpdialogs media'
                ],
                toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image media',
                paste_as_text: false,
                relative_urls: false,
                convert_urls: false,
                image_advtab: true,
                forced_root_block: 'div',
                remove_linebreaks: false,
                verify_html: false,
                wpautop: false,
                setup: function(editor) {
                    editor.on('init', function() {
                        editor.setContent(content || '');
                    });

                    editor.on('change', function() {
                        const matches = editorId.match(/(?:question|option)-(\d+)(?:-(\d+))?$/);
                        if (!matches) return;

                        const questionIndex = parseInt(matches[1]);
                        const newQuestions = [...questions];

                        if (editorId.includes('question')) {
                            if (newQuestions[questionIndex]) {
                                newQuestions[questionIndex].question = editor.getContent();
                                setQuestions(newQuestions);
                            }
                        } else if (editorId.includes('option')) {
                            const optionIndex = parseInt(matches[2]);
                            if (newQuestions[questionIndex] && newQuestions[questionIndex].options) {
                                newQuestions[questionIndex].options[optionIndex] = editor.getContent();
                                setQuestions(newQuestions);
                            }
                        }
                    });
                },
                wplink: {
                    wp_link_dialog: true,
                    wp_link_class: true
                },
                file_picker_callback: function(callback, value, meta) {
                    let frameConfig = {
                        title: __('Medya Seç', 'quiz-time'),
                        multiple: false,
                        button: {
                            text: __('Seç', 'quiz-time')
                        }
                    };

                    if (meta.filetype === 'image') {
                        frameConfig.library = { type: 'image' };
                        frameConfig.title = __('Görsel Seç', 'quiz-time');
                    } else if (meta.filetype === 'file') {
                        frameConfig.library = { type: 'application' };
                        frameConfig.title = __('Dosya Seç', 'quiz-time');
                    } else if (meta.filetype === 'media') {
                        frameConfig.library = { type: 'video,audio' };
                        frameConfig.title = __('Medya Seç', 'quiz-time');
                    }

                    const wpMediaFrame = window.wp.media(frameConfig);

                    wpMediaFrame.on('select', function() {
                        const attachment = wpMediaFrame.state().get('selection').first().toJSON();
                        
                        if (meta.filetype === 'image') {
                            callback(attachment.url, { 
                                alt: attachment.alt,
                                width: attachment.width,
                                height: attachment.height
                            });
                        } else {
                            callback(attachment.url, { 
                                text: attachment.title,
                                title: attachment.title
                            });
                        }
                    });

                    wpMediaFrame.open();
                }
            });
        });
    };

    const addQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        };
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(item => item.id.toString() === active.id);
                const newIndex = items.findIndex(item => item.id.toString() === over.id);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleJsonImport = () => {
        try {
            const importedQuestions = JSON.parse(jsonInput);
            if (Array.isArray(importedQuestions)) {
                setQuestions(importedQuestions);
                setJsonInput('');
                setShowJsonImport(false);
            }
        } catch (e) {
            alert('Geçersiz JSON formatı!');
        }
    };

    return (
        <div className="quiz-editor">
            <div className="quiz-editor__header">
                <Button
                    variant="secondary"
                    onClick={() => setShowJsonImport(!showJsonImport)}
                >
                    {__('JSON İle İçe Aktar', 'quiz-time')}
                </Button>
            </div>

            {showJsonImport && (
                <div className="quiz-editor__json-import">
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={__('JSON verisi yapıştırın', 'quiz-time')}
                    />
                    <Button isPrimary onClick={handleJsonImport}>
                        {__('İçe Aktar', 'quiz-time')}
                    </Button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={questions.map(q => q.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {questions.map((question, questionIndex) => (
                        <SortableQuestion
                            key={question.id}
                            question={question}
                            questionIndex={questionIndex}
                            OPTION_LABELS={OPTION_LABELS}
                            onQuestionChange={handleQuestionChange}
                            onRemove={(index) => {
                                setQuestions(questions.filter((_, i) => i !== index));
                            }}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <Button
                isPrimary
                className="add-question-button"
                onClick={() => {
                    setQuestions([...questions, {
                        id: Date.now(),
                        question: '',
                        options: ['', '', '', ''],
                        correctAnswer: 0
                    }]);
                }}
            >
                {__('Yeni Soru Ekle', 'quiz-time')}
            </Button>
        </div>
    );
};

export default QuizEditor; 