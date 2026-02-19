/* ============================================
   Main Application Entry Point
   Wires up all modules
   ============================================ */

import { $, debounce } from './utils/helpers.js';
import { initFormHandler, collectFormData, loadSampleData } from './modules/form-handler.js';
import { updatePreview, scalePreview } from './modules/preview-generator.js';
import { initTemplateSwitcher, getActiveTemplate, updateTemplatePreviews } from './modules/template-switcher.js';
import { initImageHandler } from './modules/image-handler.js';
import { initPdfGenerator } from './modules/pdf-generator.js';

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 MakeMyResume — Initializing...');

    // Initialize template switcher
    initTemplateSwitcher((templateId) => {
        // When template changes, update the preview
        const data = collectFormData();
        updatePreview($('.preview-container'), data, templateId);
    });

    // Initialize form handler
    initFormHandler(debounce((data) => {
        // When form data changes, update preview
        const templateId = getActiveTemplate();
        updatePreview($('.preview-container'), data, templateId);
        updateTemplatePreviews(data);
    }, 200));

    // Initialize image handler
    initImageHandler((imageData) => {
        // When image changes, update preview
        const data = collectFormData();
        const templateId = getActiveTemplate();
        updatePreview($('.preview-container'), data, templateId);
    });

    // Initialize PDF generator
    initPdfGenerator();

    // Mobile preview toggle
    const previewToggle = $('#preview-toggle-btn');
    const previewPanel = $('.preview-panel');

    if (previewToggle && previewPanel) {
        previewToggle.addEventListener('click', () => {
            previewPanel.classList.toggle('visible');
            if (previewPanel.classList.contains('visible')) {
                scalePreview($('.preview-container'));
            }
        });

        // Close preview on overlay click
        previewPanel.addEventListener('click', (e) => {
            if (e.target === previewPanel) {
                previewPanel.classList.remove('visible');
            }
        });
    }

    // Sample data button
    const sampleBtn = $('#load-sample-btn');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', loadSampleData);
    }

    // Window resize handler
    window.addEventListener('resize', debounce(() => {
        const container = $('.preview-container');
        if (container) scalePreview(container);
    }, 200));

    // Initial preview render
    setTimeout(() => {
        const data = collectFormData();
        const templateId = getActiveTemplate();
        updatePreview($('.preview-container'), data, templateId);
        updateTemplatePreviews(data);
    }, 100);

    console.log('✅ MakeMyResume — Ready!');
});
