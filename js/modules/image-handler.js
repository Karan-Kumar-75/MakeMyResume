/* ============================================
   Image Handler Module
   Profile image upload, preview, base64 conversion
   ============================================ */

import { $, showToast } from '../utils/helpers.js';

let onImageChange = null;

/**
 * Initialize image handler
 * @param {Function} callback - called when image changes
 */
export function initImageHandler(callback) {
    onImageChange = callback;

    const fileInput = $('#profile-image-input');
    const dropZone = $('#image-drop-zone');
    const removeBtn = $('#remove-image-btn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) processFile(files[0]);
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', removeImage);
    }

    // Load saved image if exists
    if (window._profileImageData) {
        showImagePreview(window._profileImageData);
    }
}

/**
 * Handle file input change
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

/**
 * Process an image file
 */
function processFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;

        // Resize image to max 300px for storage efficiency
        resizeImage(dataUrl, 300, (resizedDataUrl) => {
            window._profileImageData = resizedDataUrl;
            showImagePreview(resizedDataUrl);

            if (onImageChange) onImageChange(resizedDataUrl);
            showToast('Profile image uploaded', 'success');
        });
    };
    reader.readAsDataURL(file);
}

/**
 * Resize image to max dimension
 */
function resizeImage(dataUrl, maxSize, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
}

/**
 * Show image preview
 */
function showImagePreview(dataUrl) {
    const previewContainer = $('#image-preview-container');
    const uploadZone = $('#image-drop-zone');
    const removeBtn = $('#remove-image-btn');

    if (previewContainer) {
        previewContainer.innerHTML = `<img src="${dataUrl}" alt="Profile Preview">`;
        previewContainer.style.display = 'block';
    }

    if (uploadZone) uploadZone.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
}

/**
 * Remove profile image
 */
function removeImage() {
    window._profileImageData = '';

    const previewContainer = $('#image-preview-container');
    const uploadZone = $('#image-drop-zone');
    const removeBtn = $('#remove-image-btn');
    const fileInput = $('#profile-image-input');

    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
    }

    if (uploadZone) uploadZone.style.display = 'flex';
    if (removeBtn) removeBtn.style.display = 'none';
    if (fileInput) fileInput.value = '';

    if (onImageChange) onImageChange('');
    showToast('Profile image removed', 'info');
}
