import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import QuizRenderer from '../../components/QuizRenderer';

registerBlockType('quiz-time/quiz', {
    title: __('Test', 'quiz-time'),
    icon: 'welcome-learn-more',
    category: 'common',
    attributes: {
        quizId: {
            type: 'string',
            default: ''
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps();
        
        const quizzes = useSelect(select => {
            return select('core').getEntityRecords('postType', 'quiz', {
                per_page: -1
            });
        }, []);

        const quizOptions = quizzes ? [
            { label: __('Test Seçin', 'quiz-time'), value: '' },
            ...quizzes.map(quiz => ({
                label: quiz.title.rendered,
                value: quiz.id.toString()
            }))
        ] : [];

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Test Ayarları', 'quiz-time')}>
                        <SelectControl
                            label={__('Test Seçin', 'quiz-time')}
                            value={attributes.quizId}
                            options={quizOptions}
                            onChange={quizId => setAttributes({ quizId })}
                        />
                    </PanelBody>
                </InspectorControls>
                
                {attributes.quizId ? (
                    <QuizRenderer quizId={attributes.quizId} isPreview={true} />
                ) : (
                    <p>{__('Lütfen bir test seçin.', 'quiz-time')}</p>
                )}
            </div>
        );
    },
    save: ({ attributes }) => {
        const blockProps = useBlockProps.save();
        return (
            <div {...blockProps}>
                {attributes.quizId && (
                    <div
                        className="quiz-time-renderer"
                        data-quiz-id={attributes.quizId}
                    />
                )}
            </div>
        );
    }
}); 