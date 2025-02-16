<?php
if (!defined('ABSPATH')) {
    exit;
}

function quiz_time_register_rest_fields() {
    // Register meta field for REST API
    register_post_meta('quiz', '_quiz_questions', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'auth_callback' => function() {
            return true;
        }
    ));

    // Register custom endpoint for quiz data
    register_rest_route('quiz-time/v1', '/quiz/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'quiz_time_get_quiz_data',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'quiz_time_register_rest_fields');

function quiz_time_get_quiz_data($request) {
    $quiz_id = $request['id'];
    $quiz = get_post($quiz_id);

    if (!$quiz || $quiz->post_type !== 'quiz') {
        return new WP_Error('quiz_not_found', 'Test bulunamadı', array('status' => 404));
    }

    $questions = get_post_meta($quiz_id, '_quiz_questions', true);
    
    // Soruları JSON'dan PHP array'e dönüştür
    if (!empty($questions) && is_string($questions)) {
        $questions = json_decode($questions, true);
    }
    
    // Eğer sorular boşsa veya geçersizse, boş array kullan
    if (empty($questions) || !is_array($questions)) {
        $questions = array();
    }

    return array(
        'id' => $quiz->ID,
        'title' => array(
            'rendered' => $quiz->post_title
        ),
        'content' => array(
            'rendered' => apply_filters('the_content', $quiz->post_content)
        ),
        'meta' => array(
            '_quiz_questions' => $questions
        )
    );
} 