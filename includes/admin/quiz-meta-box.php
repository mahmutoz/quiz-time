<?php
if (!defined('ABSPATH')) {
    exit;
}

function quiz_time_add_meta_box() {
    add_meta_box(
        'quiz_time_meta_box',
        __('Test Soruları', 'quiz-time'),
        'quiz_time_render_meta_box',
        'quiz',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'quiz_time_add_meta_box');

function quiz_time_render_meta_box($post) {
    // Nonce field for security
    wp_nonce_field('quiz_time_save_meta_box', 'quiz_time_meta_box_nonce');

    // Get saved questions
    $saved_questions = get_post_meta($post->ID, '_quiz_questions', true);
    
    // Create hidden input for questions data
    ?>
    <div id="quiz-editor-root"></div>
    <input type="hidden" 
           id="quiz-questions-data" 
           name="quiz_questions" 
           value="<?php echo esc_attr($saved_questions); ?>" />
    <?php
}

function quiz_time_save_meta_box($post_id) {
    // Security checks
    if (!isset($_POST['quiz_time_meta_box_nonce'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['quiz_time_meta_box_nonce'], 'quiz_time_save_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save questions data
    if (isset($_POST['quiz_questions'])) {
        $questions_data = wp_unslash($_POST['quiz_questions']);
        
        // Validate JSON
        json_decode($questions_data);
        if (json_last_error() === JSON_ERROR_NONE) {
            update_post_meta($post_id, '_quiz_questions', wp_kses_post($questions_data));
        }
    }
}
add_action('save_post_quiz', 'quiz_time_save_meta_box'); 