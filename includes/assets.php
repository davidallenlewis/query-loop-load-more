<?php

defined( 'ABSPATH' ) || exit;

/**
 * Returns an array with meta information for a given asset path. First, it checks for an .asset.php file in the same directory
 * as the given asset file whose contents are returns if it exists. If not, it returns an array with the file's last modified
 * time as the version and the main stylesheet + any extra dependencies passed in as the dependencies.
 *
 * @since   1.0.0
 * @version 1.0.0
 *
 * @param   string     $asset_path         The path to the asset file.
 * @param   array|null $extra_dependencies Any extra dependencies to include in the returned meta.
 *
 * @return  array|null
 */

//function wpcomsp_qllm_get_asset_meta( $asset_path, $extra_dependencies = null ) {
function wpcomsp_qllm_get_asset_meta( string $asset_path, ?array $extra_dependencies = null ): ?array {
    if ( ! is_string( $asset_path ) || ! file_exists( $asset_path ) || 0 !== strpos( $asset_path, WPCOMSP_QLLM_DIR_PATH ) ) {
        return null;
    }

    $asset_path_info = pathinfo( $asset_path );
    $asset_meta = null;

    if ( file_exists( $asset_path_info['dirname'] . '/' . $asset_path_info['filename'] . '.asset.php' ) ) {
        $asset_meta = require $asset_path_info['dirname'] . '/' . $asset_path_info['filename'] . '.asset.php';
        $asset_meta += array( 'dependencies' => array() ); // Ensure 'dependencies' key exists.
    } else {
        $version = filemtime( $asset_path );
        $asset_meta = array(
            'dependencies' => array(),
            'version'      => $version !== false ? $version : WPCOMSP_QLLM_METADATA['Version'],
        );
    }

    if ( is_array( $extra_dependencies ) ) {
        $asset_meta['dependencies'] = array_merge( $asset_meta['dependencies'], $extra_dependencies );
        $asset_meta['dependencies'] = array_unique( $asset_meta['dependencies'] );
    }

    return $asset_meta;
}