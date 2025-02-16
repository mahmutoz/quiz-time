import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const JsonImport = ({ jsonInput, setJsonInput, onImport }) => {
    return (
        <div className="quiz-editor__json-import">
            <div className="quiz-editor__json-help">
                <p>{__('Beklenen JSON formatı:', 'quiz-time')}</p>
                <pre>
{`[
  {
    "question": "<p>2023 yılında <strong>Türkiye</strong>'nin başkenti neresidir?</p>",
    "options": [
      "<p><em>İstanbul</em></p>",
      "<p><strong>Ankara</strong></p>",
      "<p>İzmir</p>",
      "<p>Bursa</p>"
    ],
    "correctAnswer": 1
  }
]`}
                </pre>
                <div className="quiz-editor__json-help-notes">
                    <p>{__('Önemli Notlar:', 'quiz-time')}</p>
                    <ul>
                        <li>{__('Soru ve seçenek metinlerinde HTML kullanabilirsiniz.', 'quiz-time')}</li>
                        <li>{__('Kalın, italik, liste gibi formatlamalar yapabilirsiniz.', 'quiz-time')}</li>
                        <li>{__('JSON içindeki çift tırnakları escape etmeyi unutmayın: \\"', 'quiz-time')}</li>
                    </ul>
                </div>
            </div>
            <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={__('JSON verisi yapıştırın', 'quiz-time')}
            />
            <Button isPrimary onClick={onImport}>
                {__('İçe Aktar', 'quiz-time')}
            </Button>
        </div>
    );
};

export default JsonImport; 