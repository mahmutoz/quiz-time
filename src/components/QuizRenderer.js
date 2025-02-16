import { useState, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const QuizRenderer = ({ quizId, isPreview = false, initialData = null }) => {
    const [quiz, setQuiz] = useState(() => {
        if (initialData) {
            return {
                ...initialData,
                questions: Array.isArray(initialData.questions) 
                    ? initialData.questions.map(q => ({
                        ...q,
                        id: q.id || q.tempId || Date.now() + Math.random()
                    }))
                    : []
            };
        }
        return null;
    });
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!initialData || isPreview) {
            loadQuiz();
        }
    }, [quizId, isPreview, initialData]);

    const loadQuiz = async () => {
        if (!isPreview && initialData) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch({
                path: `/quiz-time/v1/quiz/${quizId}`,
                method: 'GET'
            });

            let questions = [];
            if (response.meta._quiz_questions) {
                try {
                    questions = typeof response.meta._quiz_questions === 'string'
                        ? JSON.parse(response.meta._quiz_questions)
                        : response.meta._quiz_questions;
                } catch (e) {
                    console.error('Quiz questions parsing error:', e);
                    questions = [];
                }
            }

            if (!Array.isArray(questions)) {
                questions = [];
            }

            // Her soruya benzersiz ID ata
            questions = questions.map(q => ({
                ...q,
                id: q.id || q.tempId || Date.now() + Math.random()
            }));

            setQuiz({
                id: response.id,
                title: response.title.rendered,
                questions: questions
            });
        } catch (error) {
            console.error('Quiz loading error:', error);
            setError(__('Test yüklenirken bir hata oluştu.', 'quiz-time'));
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        if (isPreview) return;

        setUserAnswers(prev => ({
            ...prev,
            [questionId]: prev[questionId] === answerIndex ? undefined : answerIndex
        }));
    };

    const resetQuiz = () => {
        setUserAnswers({});
        setShowResults(false);
    };

    const calculateResults = () => {
        if (!quiz || !Array.isArray(quiz.questions)) return null;

        let correct = 0;
        let wrong = 0;
        let empty = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach(question => {
            const questionId = question.id || question.questionId;
            if (userAnswers[questionId] === undefined) {
                empty++;
            } else if (userAnswers[questionId] === question.correctAnswer) {
                correct++;
            } else {
                wrong++;
            }
        });

        const score = Math.round((correct / total) * 100);

        return {
            correct,
            wrong,
            empty,
            total,
            score
        };
    };

    if (loading) {
        return <div>{__('Yükleniyor...', 'quiz-time')}</div>;
    }

    if (error) {
        return <div className="quiz-error">{error}</div>;
    }

    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return <div>{__('Test bulunamadı veya sorular yüklenmedi.', 'quiz-time')}</div>;
    }

    const results = showResults ? calculateResults() : null;

    return (
        <div className="quiz-renderer">
            <h2>{quiz.title}</h2>
            
            {quiz.questions.map((question, questionIndex) => {
                const questionId = question.id;
                return (
                    <div key={questionId} className="quiz-question">
                        <div className="question-header">
                            <div className="question-number">{questionIndex + 1}.</div>
                            <div 
                                className="question-content"
                                dangerouslySetInnerHTML={{ __html: question.question }}
                            />
                        </div>
                        
                        <div className="quiz-options">
                            {Array.isArray(question.options) && question.options.map((option, optionIndex) => (
                                <div
                                    key={optionIndex}
                                    className={`quiz-option ${
                                        showResults
                                            ? optionIndex === question.correctAnswer
                                                ? 'correct'
                                                : userAnswers[questionId] === optionIndex
                                                ? 'incorrect'
                                                : ''
                                            : ''
                                    }`}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            name={`question-${questionId}`}
                                            value={optionIndex}
                                            checked={userAnswers[questionId] === optionIndex}
                                            onChange={() => handleAnswerSelect(questionId, optionIndex)}
                                            disabled={showResults || isPreview}
                                        />
                                        <div 
                                            className="quiz-option-content"
                                            dangerouslySetInnerHTML={{ __html: option }} 
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>

                        {showResults && (
                            <div className="quiz-feedback">
                                {userAnswers[questionId] === undefined ? (
                                    <p className="empty">{__('Bu soru boş bırakıldı.', 'quiz-time')}</p>
                                ) : userAnswers[questionId] === question.correctAnswer ? (
                                    <p className="correct">{__('✓ Doğru cevap!', 'quiz-time')}</p>
                                ) : (
                                    <p className="incorrect">
                                        {__('✗ Yanlış. Doğru cevap: ', 'quiz-time')}
                                        <span dangerouslySetInnerHTML={{ 
                                            __html: question.options[question.correctAnswer] 
                                        }} />
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="quiz-actions">
                {!isPreview && !showResults && (
                    <Button
                        isPrimary
                        onClick={() => setShowResults(true)}
                    >
                        {__('Sonuçları Göster', 'quiz-time')}
                    </Button>
                )}

                {showResults && (
                    <Button
                        isPrimary
                        onClick={resetQuiz}
                    >
                        {__('Testi Tekrar Başlat', 'quiz-time')}
                    </Button>
                )}
            </div>

            {showResults && results && (
                <div className="quiz-results">
                    <h3>{__('Sonuçlar', 'quiz-time')}</h3>
                    <div className="quiz-stats">
                        <p className="total-questions">
                            <span>{__('Toplam Soru:', 'quiz-time')}</span>
                            <span>{results.total}</span>
                        </p>
                        <p className="correct-answers">
                            <span>{__('Doğru Sayısı:', 'quiz-time')}</span>
                            <span>{results.correct}</span>
                        </p>
                        <p className="wrong-answers">
                            <span>{__('Yanlış Sayısı:', 'quiz-time')}</span>
                            <span>{results.wrong}</span>
                        </p>
                        <p className="empty-answers">
                            <span>{__('Boş Sayısı:', 'quiz-time')}</span>
                            <span>{results.empty}</span>
                        </p>
                        <p className="quiz-score">
                            <span>{__('Puan:', 'quiz-time')}</span>
                            <span>{results.score}/100</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizRenderer; 