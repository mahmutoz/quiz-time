import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
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

        const customStyles = {
            control: (base) => ({
                ...base,
                minHeight: '40px',
                borderColor: '#757575',
                '&:hover': {
                    borderColor: '#007cba'
                }
            }),
            menu: (base) => ({
                ...base,
                zIndex: 9999
            })
        };

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Test Ayarları', 'quiz-time')}>
                        <Select
                            value={quizOptions.find(option => option.value === attributes.quizId)}
                            onChange={option => setAttributes({ quizId: option.value })}
                            options={quizOptions}
                            styles={customStyles}
                            placeholder={__('Test ara veya seç...', 'quiz-time')}
                            noOptionsMessage={() => __('Test bulunamadı', 'quiz-time')}
                            isClearable
                            isSearchable
                            classNamePrefix="quiz-select"
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
    save: () => null
}); 