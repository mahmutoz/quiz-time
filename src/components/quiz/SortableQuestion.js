import { Button, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TiptapEditor from './TiptapEditor';

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const SortableQuestion = ({ question, questionIndex, OPTION_LABELS, onQuestionChange, onRemove }) => {
    const id = question.tempId || question.id || generateTempId();
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: id.toString()
    });

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
                        <div key={`${id}-option-${optionIndex}`} className="option-row">
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
                        className="quiz-select-control"
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

export default SortableQuestion; 