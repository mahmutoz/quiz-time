<?php
if (!defined('ABSPATH')) {
    exit;
}

function quiz_time_register_block() {
    register_block_type('quiz-time/quiz', array(
        'editor_script' => 'quiz-time-editor-script',
        'editor_style'  => 'quiz-time-style',
        'style'         => 'quiz-time-style',
        'script'        => 'quiz-time-script',
        'attributes' => array(
            'quizId' => array(
                'type' => 'string',
                'default' => ''
            )
        ),
        'render_callback' => 'quiz_time_render_block'
    ));
}
add_action('init', 'quiz_time_register_block');

function quiz_time_render_block($attributes) {
    if (empty($attributes['quizId'])) {
        return '';
    }

    // Frontend script'leri yükle
    if (!is_admin()) {
        wp_enqueue_script('quiz-time-script');
        wp_enqueue_style('quiz-time-style');
    }

    // Quiz verilerini al
    $quiz = get_post($attributes['quizId']);
    if (!$quiz || $quiz->post_type !== 'quiz') {
        return '';
    }

    $questions = get_post_meta($quiz->ID, '_quiz_questions', true);
    
    // Soruları JSON'dan PHP array'e dönüştür
    if (!empty($questions) && is_string($questions)) {
        $questions = json_decode($questions, true);
    }
    
    // Eğer sorular boşsa veya geçersizse, boş array kullan
    if (empty($questions) || !is_array($questions)) {
        $questions = array();
    }

    // Quiz verilerini inline script olarak ekle
    $script = sprintf(
        '<script>
            window.quizTimeBlock_%s = {
                questions: %s,
                title: %s
            };
        </script>',
        esc_js($attributes['quizId']),
        wp_json_encode($questions),
        wp_json_encode($quiz->post_title)
    );

    // Container div'i ve script'i döndür
    return sprintf(
        '%s<div id="quiz-time-%s" class="quiz-time-renderer" data-quiz-id="%s"></div>',
        $script,
        esc_attr($attributes['quizId']),
        esc_attr($attributes['quizId'])
    );
} 