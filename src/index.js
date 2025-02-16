import { createRoot } from '@wordpress/element';
import QuizEditor from './components/QuizEditor';
import QuizRenderer from './components/QuizRenderer';
import './style.css';

// Admin panelindeki editör
const quizEditorRoot = document.getElementById('quiz-editor-root');
if (quizEditorRoot) {
    const root = createRoot(quizEditorRoot);
    root.render(<QuizEditor />);
}

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
    const quizRenderers = document.querySelectorAll('.quiz-time-renderer');
    quizRenderers.forEach(container => {
        const quizId = container.getAttribute('data-quiz-id');
        if (quizId) {
            // Quiz verilerini global değişkenden al
            const quizData = window[`quizTimeBlock_${quizId}`];
            if (!quizData) {
                console.error(`Quiz verileri bulunamadı: ${quizId}`);
                return;
            }

            const root = createRoot(container);
            root.render(<QuizRenderer quizId={quizId} initialData={quizData} />);
        }
    });
});

// Gutenberg block kaydı
import './blocks/quiz-block'; 