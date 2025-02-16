import { useState, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableQuestion from './quiz/SortableQuestion';
import JsonImport from './quiz/JsonImport';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const validateQuestionData = (question) => {
    return (
        question &&
        typeof question.question === 'string' &&
        question.question.trim() !== '' &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(opt => typeof opt === 'string' && opt.trim() !== '') &&
        typeof question.correctAnswer === 'number' &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < 4
    );
};

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const QuizEditor = () => {
    const [questions, setQuestions] = useState([]);
    const [jsonInput, setJsonInput] = useState('');
    const [showJsonImport, setShowJsonImport] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const loadQuestions = () => {
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

        const handleBeforeSave = () => {
            const hiddenInput = document.getElementById('quiz-questions-data');
            if (hiddenInput && questions.length > 0) {
                hiddenInput.value = JSON.stringify(questions);
            }
        };

        const publishButton = document.getElementById('publish');
        const saveButton = document.getElementById('save-post');
        
        if (publishButton) {
            publishButton.addEventListener('click', handleBeforeSave);
        }
        if (saveButton) {
            saveButton.addEventListener('click', handleBeforeSave);
        }

        return () => {
            if (publishButton) {
                publishButton.removeEventListener('click', handleBeforeSave);
            }
            if (saveButton) {
                saveButton.removeEventListener('click', handleBeforeSave);
            }
        };
    }, [questions]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(item => {
                    const itemId = (item.tempId || item.id || generateTempId()).toString();
                    return itemId === active.id;
                });
                const newIndex = items.findIndex(item => {
                    const itemId = (item.tempId || item.id || generateTempId()).toString();
                    return itemId === over.id;
                });
                
                if (oldIndex !== -1 && newIndex !== -1) {
                    return arrayMove(items, oldIndex, newIndex);
                }
                return items;
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
            if (!jsonInput.trim()) {
                alert(__('Lütfen JSON verisi girin.', 'quiz-time'));
                return;
            }

            const importedQuestions = JSON.parse(jsonInput);
            
            if (!Array.isArray(importedQuestions)) {
                throw new Error(__('JSON verisi bir dizi olmalıdır', 'quiz-time'));
            }

            if (importedQuestions.length === 0) {
                alert(__('En az bir soru içeren JSON verisi girin.', 'quiz-time'));
                return;
            }

            const invalidQuestions = importedQuestions.filter(q => !validateQuestionData(q));
            if (invalidQuestions.length > 0) {
                throw new Error(__('Bazı sorular geçersiz formatta', 'quiz-time'));
            }

            const questionsWithTempIds = importedQuestions.map(q => ({
                ...q,
                tempId: generateTempId(),
                question: q.question.toString(),
                options: q.options.map(opt => opt.toString())
            }));

            if (questions.length > 0) {
                const shouldReplace = window.confirm(
                    __('Mevcut sorular var. Yeni soruları mevcut soruların üzerine yazmak mı, yoksa eklemek mi istersiniz?\n\nTamam: Üzerine Yaz\nİptal: Ekle', 'quiz-time')
                );

                if (shouldReplace) {
                    setQuestions(questionsWithTempIds);
                } else {
                    setQuestions(prev => [...prev, ...questionsWithTempIds]);
                }
            } else {
                setQuestions(questionsWithTempIds);
            }

            setJsonInput('');
            setShowJsonImport(false);
        } catch (e) {
            console.error('JSON import error:', e);
            alert(
                __('JSON verisi geçersiz!\n\nBeklenen format:\n[\n  {\n    "question": string,\n    "options": [string, string, string, string],\n    "correctAnswer": number (0-3)\n  },\n  ...\n]', 'quiz-time')
            );
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
                <JsonImport
                    jsonInput={jsonInput}
                    setJsonInput={setJsonInput}
                    onImport={handleJsonImport}
                />
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={questions.map(q => {
                        const id = q.tempId || q.id || generateTempId();
                        return id.toString();
                    })}
                    strategy={verticalListSortingStrategy}
                >
                    {questions.map((question, questionIndex) => (
                        <SortableQuestion
                            key={question.tempId || question.id || generateTempId()}
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