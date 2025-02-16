<?php
/**
 * Plugin Name: Quiz Time
 * Description: Çoktan seçmeli test oluşturma ve yönetme eklentisi
 * Version: 1.0.0
 * Author: Mahmut Öz
 * Author URI: https://github.com/mahmutoz
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: quiz-time
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('QUIZ_TIME_VERSION', '1.0.0');
define('QUIZ_TIME_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('QUIZ_TIME_PLUGIN_URL', plugin_dir_url(__FILE__));

// Initialize plugin
function quiz_time_init() {
    // Register Custom Post Type for quizzes
    register_post_type('quiz', array(
        'labels' => array(
            'name' => __('Testler', 'quiz-time'),
            'singular_name' => __('Test', 'quiz-time'),
            'add_new' => __('Yeni Test', 'quiz-time'),
            'add_new_item' => __('Yeni Test Ekle', 'quiz-time'),
            'edit_item' => __('Testi Düzenle', 'quiz-time'),
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-welcome-learn-more',
        'show_in_graphql' => true,
        'rest_base' => 'quizzes',
    ));

    // Register Quiz Category taxonomy
    register_taxonomy('quiz_category', 'quiz', array(
        'labels' => array(
            'name' => __('Test Kategorileri', 'quiz-time'),
            'singular_name' => __('Test Kategorisi', 'quiz-time'),
            'search_items' => __('Kategori Ara', 'quiz-time'),
            'all_items' => __('Tüm Kategoriler', 'quiz-time'),
            'parent_item' => __('Üst Kategori', 'quiz-time'),
            'parent_item_colon' => __('Üst Kategori:', 'quiz-time'),
            'edit_item' => __('Kategoriyi Düzenle', 'quiz-time'),
            'update_item' => __('Kategoriyi Güncelle', 'quiz-time'),
            'add_new_item' => __('Yeni Kategori Ekle', 'quiz-time'),
            'new_item_name' => __('Yeni Kategori Adı', 'quiz-time'),
            'menu_name' => __('Kategoriler', 'quiz-time'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'quiz-category'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'quiz_time_init');

// Register scripts and styles
function quiz_time_register_assets() {
    $asset_file = include(QUIZ_TIME_PLUGIN_DIR . 'build/index.asset.php');
    
    // Shared dependencies
    $shared_deps = array('wp-element', 'wp-components', 'wp-i18n');
    
    // Editor script
    wp_register_script(
        'quiz-time-editor-script',
        QUIZ_TIME_PLUGIN_URL . 'build/index.js',
        array_merge(['wp-blocks', 'wp-editor', 'wp-data'], $shared_deps, $asset_file['dependencies']),
        $asset_file['version']
    );

    // Frontend script
    wp_register_script(
        'quiz-time-script',
        QUIZ_TIME_PLUGIN_URL . 'build/index.js',
        array_merge(['wp-api-fetch'], $shared_deps, $asset_file['dependencies']),
        $asset_file['version'],
        true
    );

    // Register style
    wp_register_style(
        'quiz-time-style',
        QUIZ_TIME_PLUGIN_URL . 'build/style-index.css',
        array(),
        $asset_file['version']
    );

    // Localize script
    wp_localize_script('quiz-time-script', 'quizTimeData', array(
        'restUrl' => rest_url(),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('init', 'quiz_time_register_assets');

// Enqueue admin assets
function quiz_time_enqueue_admin_assets() {
    wp_enqueue_script('quiz-time-editor-script');
    wp_enqueue_style('quiz-time-style');
}
add_action('admin_enqueue_scripts', 'quiz_time_enqueue_admin_assets');

// Enqueue frontend assets
function quiz_time_enqueue_frontend_assets() {
    if (has_block('quiz-time/quiz')) {
        wp_enqueue_script('quiz-time-script');
        wp_enqueue_style('quiz-time-style');
    }
}
add_action('wp_enqueue_scripts', 'quiz_time_enqueue_frontend_assets');

// Include required files
require_once QUIZ_TIME_PLUGIN_DIR . 'includes/admin/quiz-meta-box.php';
require_once QUIZ_TIME_PLUGIN_DIR . 'includes/blocks/quiz-block.php';
require_once QUIZ_TIME_PLUGIN_DIR . 'includes/rest-api/quiz-endpoints.php';

function quiz_time_enqueue_admin_scripts() {
    // TinyMCE'yi yükle
    wp_enqueue_editor();
    
    // WordPress media kütüphanesini yükle
    wp_enqueue_media();
    
    // WordPress bağlantı seçici
    wp_enqueue_script('wplink');
    wp_enqueue_style('editor-buttons');
    
    // Diğer script ve stiller
    wp_enqueue_script(
        'quiz-time-admin',
        plugins_url('build/index.js', __FILE__),
        ['wp-element', 'wp-components', 'wp-i18n', 'wp-media-utils', 'wp-editor'],
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
        true
    );

    wp_enqueue_style(
        'quiz-time-admin-style',
        plugins_url('build/style-index.css', __FILE__),
        [],
        filemtime(plugin_dir_path(__FILE__) . 'build/style-index.css')
    );
}
add_action('admin_enqueue_scripts', 'quiz_time_enqueue_admin_scripts'); 