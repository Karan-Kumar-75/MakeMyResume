/* ============================================================
   Print & Reset Module
   - Print Resume via window.print() — zero library dependency
   - Reset Form clears everything
   ============================================================ */

import { $, showToast } from '../utils/helpers.js';
import { collectFormData } from './form-handler.js';
import { generatePreview } from './preview-generator.js';
import { getActiveTemplate } from './template-switcher.js';

/* ── Init ─────────────────────────────────────────────────── */
export function initPdfGenerator() {
    // "Print Resume" buttons
    ['download-pdf-btn', 'download-pdf-btn-2'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handlePrint);
    });

    // "Reset Form" button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetForm);
}

/* ── Print ────────────────────────────────────────────────── */
async function handlePrint() {
    const data = collectFormData();

    if (!data.personal?.fullName) {
        showToast('Please enter your name before printing.', 'warning');
        return;
    }

    // Populate the dedicated print area with the resume HTML
    const templateClass = getActiveTemplate();
    const html = generatePreview(data, templateClass);

    let printArea = document.getElementById('resume-print-area');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'resume-print-area';
        printArea.style.display = 'none'; // hidden on screen, visible on print via CSS
        document.body.appendChild(printArea);
    }

    printArea.innerHTML = html;
    printArea.style.display = 'block';

    // Small delay for fonts to render
    await sleep(300);

    // Trigger native browser print dialog
    window.print();

    // After print dialog closes, hide the print area again
    printArea.style.display = 'none';
}

/* ── Reset Form ───────────────────────────────────────────── */
function resetForm() {
    // Clear all text inputs, textareas, selects
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
        el.value = '';
    });

    // Clear skills tags
    const skillsContainer = document.getElementById('skills-tags');
    if (skillsContainer) skillsContainer.innerHTML = '';

    // Clear dynamic entries (education, experience, projects, etc.)
    ['education-entries', 'experience-entries', 'projects-entries',
        'certifications-entries', 'languages-entries'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

    // Show empty hints
    ['education-empty', 'experience-empty', 'projects-empty',
        'certifications-empty', 'languages-empty'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });

    // Remove profile image
    const imgPreview = document.getElementById('image-preview-container');
    if (imgPreview) { imgPreview.style.display = 'none'; imgPreview.innerHTML = ''; }
    const removeBtn = document.getElementById('remove-image-btn');
    if (removeBtn) removeBtn.style.display = 'none';
    const dropZone = document.getElementById('image-drop-zone');
    if (dropZone) dropZone.style.display = '';

    // Clear preview panel
    const previewInner = document.querySelector('.preview-resume-inner');
    if (previewInner) {
        previewInner.innerHTML = `
      <p style="text-align:center;color:#94a3b8;padding:80px 20px;font-size:12px;">
        Fill in the form to see your resume preview here ✨
      </p>`;
    }

    // Clear print area
    const printArea = document.getElementById('resume-print-area');
    if (printArea) { printArea.innerHTML = ''; printArea.style.display = 'none'; }

    // Clear localStorage
    try { localStorage.removeItem('resumeData'); } catch (_) { }

    // Go back to step 1
    document.querySelectorAll('.form-step').forEach((s, i) => {
        s.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.step-item').forEach((s, i) => {
        s.classList.toggle('active', i === 0);
        s.classList.remove('completed');
    });

    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.textContent = 'Next →';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast('Form reset successfully!', 'success');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
