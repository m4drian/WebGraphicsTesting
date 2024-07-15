import * as THREE from 'three';

/**
 * Generates a random base color from the provided color array (Hard Coded Color Scheme).
 *
 * @returns {number} A hexadecimal color number
 */
export function getRandomBaseColor() {
    const baseColors = [0x00FF71,0x7100FF,0xFF7100];
    const randomIndex = Math.floor(Math.random() * baseColors.length);
    const randomColor = baseColors[randomIndex];
    return randomColor;
}

/**
 * Generates a random color with slight variation (monochromatic) around a base color.
 *
 * @param {number} baseColor - The base color value (0xrrggbb format).
 * @param {number} variation - The maximum amount of variation (0-255) for the generated color.
 * @returns {THREE.Color} A new THREE.Color object with a random monochromatic variation.
 */
export function getMonochromaticColor(baseColor = 0xffffff, variation = 30) {
    // Extract RGB values from the base color
    const baseR = (baseColor >> 16) & 0xff;
    const baseG = (baseColor >> 8) & 0xff;
    const baseB = baseColor & 0xff;
  
    // Generate random variations within the specified range
    const r = Math.floor(Math.random() * variation) + baseR - variation / 2;
    const g = Math.floor(Math.random() * variation) + baseG - variation / 2;
    const b = Math.floor(Math.random() * variation) + baseB - variation / 2;
  
    // Clamp values to ensure they stay within the 0-255 range
    const clampedR = Math.max(0, Math.min(255, r));
    const clampedG = Math.max(0, Math.min(255, g));
    const clampedB = Math.max(0, Math.min(255, b));
  
    return new THREE.Color(`rgb(${clampedR}, ${clampedG}, ${clampedB})`);
}