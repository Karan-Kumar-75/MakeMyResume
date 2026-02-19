/* ============================================
   Template Switcher Module
   Template gallery, loading, and switching
   ============================================ */

import { $, $$ } from '../utils/helpers.js';

const TEMPLATES = [
    { id: 'template-01', name: 'Minimal Classic', category: 'minimal', file: 'css/templates/template-01-minimal.css' },
    { id: 'template-02', name: 'Modern Professional', category: 'modern', file: 'css/templates/template-02-modern.css' },
    { id: 'template-03', name: 'Executive Corporate', category: 'corporate', file: 'css/templates/template-03-executive.css' },
    { id: 'template-04', name: 'Creative Designer', category: 'creative', file: 'css/templates/template-04-creative.css' },
    { id: 'template-05', name: 'ATS-Friendly', category: 'ats', file: 'css/templates/template-05-ats.css' },
    { id: 'template-06', name: 'Compact One Page', category: 'minimal', file: 'css/templates/template-06-compact.css' },
    { id: 'template-07', name: 'Sidebar Layout', category: 'modern', file: 'css/templates/template-07-sidebar.css' },
    { id: 'template-08', name: 'Two Column Clean', category: 'modern', file: 'css/templates/template-08-two-column.css' },
    { id: 'template-09', name: 'Elegant Serif', category: 'creative', file: 'css/templates/template-09-serif.css' },
    { id: 'template-10', name: 'Dark Header Accent', category: 'corporate', file: 'css/templates/template-10-dark-header.css' },
    { id: 'template-11', name: 'Timeline Style', category: 'creative', file: 'css/templates/template-11-timeline.css' },
    { id: 'template-12', name: 'Fresher Format', category: 'minimal', file: 'css/templates/template-12-fresher.css' },
    { id: 'template-13', name: 'Technical Resume', category: 'tech', file: 'css/templates/template-13-technical.css' },
    { id: 'template-14', name: 'Business Analyst', category: 'corporate', file: 'css/templates/template-14-business-analyst.css' },
    { id: 'template-15', name: 'Software Developer', category: 'tech', file: 'css/templates/template-15-software-dev.css' },
    { id: 'template-16', name: 'Marketing Pro', category: 'creative', file: 'css/templates/template-16-marketing.css' },
    { id: 'template-17', name: 'Academic CV', category: 'ats', file: 'css/templates/template-17-academic.css' },
    { id: 'template-18', name: 'Simple Minimal', category: 'minimal', file: 'css/templates/template-18-simple.css' },
    { id: 'template-19', name: 'Bold Name Header', category: 'modern', file: 'css/templates/template-19-bold-header.css' },
    { id: 'template-20', name: 'Premium Gold', category: 'creative', file: 'css/templates/template-20-premium.css' },
];

const CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'modern', label: 'Modern' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'creative', label: 'Creative' },
    { id: 'tech', label: 'Technical' },
    { id: 'ats', label: 'ATS-Friendly' },
];

let activeTemplateId = 'template-01';
let onTemplateChange = null;
let loadedStylesheets = new Set();

/**
 * Initialize template switcher
 * @param {Function} callback - called when template changes
 */
export function initTemplateSwitcher(callback) {
    onTemplateChange = callback;

    // Render template gallery
    renderTemplateGallery();
    renderFilterTabs();

    // Load default template CSS
    loadTemplateCSS(TEMPLATES[0].file);

    // Select first template
    selectTemplate('template-01');
}

/**
 * Render template cards
 */
function renderTemplateGallery() {
    const grid = $('#template-grid');
    if (!grid) return;

    grid.innerHTML = TEMPLATES.map(t => `
    <div class="template-card" data-template-id="${t.id}" data-category="${t.category}" title="${t.name}">
      <div class="template-preview">
        <div class="template-preview-inner" id="preview-${t.id}"></div>
      </div>
      <div class="template-info">
        <div class="template-name">${t.name}</div>
        <div class="template-category">${t.category}</div>
      </div>
    </div>
  `).join('');

    // Click handler
    $$('.template-card', grid).forEach(card => {
        card.addEventListener('click', () => {
            selectTemplate(card.dataset.templateId);
        });
    });
}

/**
 * Render filter tabs
 */
function renderFilterTabs() {
    const container = $('#filter-tabs');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-tab ${cat.id === 'all' ? 'active' : ''}" data-filter="${cat.id}">${cat.label}</button>
  `).join('');

    $$('.filter-tab', container).forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.filter-tab', container).forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterTemplates(tab.dataset.filter);
        });
    });
}

/**
 * Filter templates by category
 */
function filterTemplates(category) {
    $$('.template-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Select a template
 */
function selectTemplate(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    activeTemplateId = templateId;

    // Update active state
    $$('.template-card').forEach(card => {
        card.classList.toggle('active', card.dataset.templateId === templateId);
    });

    // Load template CSS
    loadTemplateCSS(template.file);

    // Notify callback
    if (onTemplateChange) {
        onTemplateChange(templateId);
    }
}

/**
 * Load template CSS dynamically
 */
function loadTemplateCSS(file) {
    if (loadedStylesheets.has(file)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = file;
    document.head.appendChild(link);
    loadedStylesheets.add(file);
}

/**
 * Get current active template ID
 */
export function getActiveTemplate() {
    return activeTemplateId;
}

/**
 * Update mini-previews in template cards
 * @param {Object} data - Resume data
 */
export function updateTemplatePreviews(data) {
    // Only update the mini-preview for the first few templates for performance
    // The rest just show a placeholder
    TEMPLATES.forEach((template, index) => {
        const previewEl = $(`#preview-${template.id}`);
        if (!previewEl) return;

        if (index < 4 && data?.personal?.fullName) {
            previewEl.innerHTML = `
        <div style="padding:4px;font-family:'Poppins',sans-serif;">
          <div style="font-size:8px;font-weight:700;margin-bottom:2px;color:#1e293b;">${data.personal.fullName || 'Your Name'}</div>
          <div style="font-size:4px;color:#64748b;margin-bottom:4px;">${data.personal.email || ''}</div>
          <div style="width:100%;height:1px;background:#e2e8f0;margin:3px 0;"></div>
          <div style="font-size:3.5px;color:#475569;line-height:1.3;">${(data.summary || '').slice(0, 100)}...</div>
          <div style="width:60%;height:1px;background:#e2e8f0;margin:3px 0;"></div>
          <div style="font-size:3px;color:#94a3b8;">Experience • Education • Skills</div>
        </div>`;
        } else {
            previewEl.innerHTML = `
        <div style="padding:6px;font-family:'Poppins',sans-serif;">
          <div style="width:40%;height:4px;background:#e2e8f0;margin-bottom:3px;border-radius:1px;"></div>
          <div style="width:60%;height:2px;background:#f1f5f9;margin-bottom:6px;border-radius:1px;"></div>
          <div style="width:100%;height:1px;background:#f1f5f9;margin-bottom:4px;"></div>
          <div style="width:80%;height:2px;background:#f1f5f9;margin-bottom:2px;border-radius:1px;"></div>
          <div style="width:90%;height:2px;background:#f1f5f9;margin-bottom:2px;border-radius:1px;"></div>
          <div style="width:70%;height:2px;background:#f1f5f9;margin-bottom:4px;border-radius:1px;"></div>
          <div style="width:100%;height:1px;background:#f1f5f9;margin-bottom:4px;"></div>
          <div style="width:85%;height:2px;background:#f1f5f9;margin-bottom:2px;border-radius:1px;"></div>
          <div style="width:75%;height:2px;background:#f1f5f9;margin-bottom:2px;border-radius:1px;"></div>
        </div>`;
        }
    });
}

export { TEMPLATES };
