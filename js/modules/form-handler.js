/* ============================================
   Form Handler Module
   Step navigation, dynamic entries, data collection
   ============================================ */

import { $, $$, generateId, showToast, saveToStorage, loadFromStorage } from '../utils/helpers.js';
import { validateStep, setupRealtimeValidation } from '../utils/validation.js';

const STORAGE_KEY = 'resumeBuilderData';

// Step definitions
const STEPS = [
    { id: 'personal', title: 'Personal Info', icon: 'user' },
    { id: 'summary', title: 'Summary', icon: 'file' },
    { id: 'education', title: 'Education', icon: 'graduation' },
    { id: 'experience', title: 'Experience', icon: 'briefcase' },
    { id: 'skills', title: 'Skills', icon: 'star' },
    { id: 'projects', title: 'Projects', icon: 'code' },
    { id: 'certifications', title: 'Certifications', icon: 'award' },
    { id: 'languages', title: 'Languages', icon: 'languages' },
    { id: 'interests', title: 'Interests', icon: 'heart' },
];

let currentStep = 0;
let onDataChange = null;

/**
 * Initialize form handler
 * @param {Function} callback - called when data changes
 */
export function initFormHandler(callback) {
    onDataChange = callback;

    // Setup step wizard clicks
    $$('.step-item').forEach((item, index) => {
        item.addEventListener('click', () => goToStep(index));
    });

    // Setup navigation buttons
    const prevBtn = $('#btn-prev');
    const nextBtn = $('#btn-next');

    if (prevBtn) prevBtn.addEventListener('click', prevStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);

    // Setup dynamic entry buttons
    setupDynamicEntries();

    // Setup skills input
    setupSkillsInput();

    // Real-time validation
    $$('.form-step').forEach(step => setupRealtimeValidation(step));

    // Load saved data
    loadSavedData();

    // Listen for input changes
    $$('.form-step input, .form-step textarea').forEach(input => {
        input.addEventListener('input', () => {
            triggerDataChange();
            autoSave();
        });
    });

    // Show first step
    goToStep(0);
}

/**
 * Navigate to a specific step
 */
export function goToStep(index) {
    if (index < 0 || index >= STEPS.length) return;
    currentStep = index;

    // Update step content visibility
    $$('.form-step').forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });

    // Update wizard indicators
    $$('.step-item').forEach((item, i) => {
        item.classList.remove('active', 'completed');
        if (i === index) item.classList.add('active');
        else if (i < index) item.classList.add('completed');
    });

    // Update progress bar
    const progressFill = $('.progress-fill');
    if (progressFill) {
        const progress = ((index + 1) / STEPS.length) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Update navigation buttons
    const prevBtn = $('#btn-prev');
    const nextBtn = $('#btn-next');

    if (prevBtn) prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    if (nextBtn) {
        nextBtn.textContent = index === STEPS.length - 1 ? '✓ Finish' : 'Next →';
    }
}

function prevStep() {
    goToStep(currentStep - 1);
}

function nextStep() {
    // Validate current step before proceeding
    const currentStepEl = $$('.form-step')[currentStep];
    if (!validateStep(currentStepEl)) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    if (currentStep < STEPS.length - 1) {
        goToStep(currentStep + 1);
    } else {
        showToast('Resume complete! Choose a template and download.', 'success');
    }
}

/**
 * Setup dynamic add/remove for Education, Experience, Projects, Certifications, Languages
 */
function setupDynamicEntries() {
    // Add entry buttons
    $$('[data-add-entry]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.addEntry;
            addEntry(type);
        });
    });

    // Remove entry buttons (event delegation)
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-entry]');
        if (removeBtn) {
            const entry = removeBtn.closest('.dynamic-entry');
            if (entry) {
                entry.style.opacity = '0';
                entry.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    entry.remove();
                    triggerDataChange();
                    autoSave();
                }, 200);
            }
        }
    });
}

/**
 * Add a new dynamic entry
 */
function addEntry(type) {
    const container = $(`#${type}-entries`);
    if (!container) return;

    const entryId = generateId();
    const entry = document.createElement('div');
    entry.className = 'dynamic-entry fade-in';
    entry.dataset.entryId = entryId;

    const templates = {
        education: `
      <div class="entry-header">
        <span class="entry-title">Education Entry</span>
        <button class="btn btn-danger btn-sm" data-remove-entry>✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Degree / Certificate</label>
          <input type="text" class="form-input" data-field="degree" placeholder="e.g. B.Sc. Computer Science">
        </div>
        <div class="form-group">
          <label class="form-label">Institution</label>
          <input type="text" class="form-input" data-field="institution" placeholder="e.g. MIT">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="month" class="form-input" data-field="startDate">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="month" class="form-input" data-field="endDate">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description (Optional)</label>
        <textarea class="form-textarea" data-field="description" rows="2" placeholder="GPA, honors, relevant coursework..."></textarea>
      </div>`,

        experience: `
      <div class="entry-header">
        <span class="entry-title">Experience Entry</span>
        <button class="btn btn-danger btn-sm" data-remove-entry>✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Job Title</label>
          <input type="text" class="form-input" data-field="jobTitle" placeholder="e.g. Senior Developer">
        </div>
        <div class="form-group">
          <label class="form-label">Company</label>
          <input type="text" class="form-input" data-field="company" placeholder="e.g. Google">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="month" class="form-input" data-field="startDate">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="month" class="form-input" data-field="endDate">
          <div class="checkbox-group" style="margin-top:4px">
            <input type="checkbox" data-field="current" id="current-${entryId}">
            <label for="current-${entryId}" class="text-sm">Currently working here</label>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" data-field="description" rows="3" placeholder="Key responsibilities and achievements..."></textarea>
      </div>`,

        projects: `
      <div class="entry-header">
        <span class="entry-title">Project Entry</span>
        <button class="btn btn-danger btn-sm" data-remove-entry>✕ Remove</button>
      </div>
      <div class="form-group">
        <label class="form-label">Project Name</label>
        <input type="text" class="form-input" data-field="name" placeholder="e.g. E-Commerce Platform">
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" data-field="description" rows="2" placeholder="What did you build, technologies used..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Link (Optional)</label>
        <input type="text" class="form-input" data-field="link" data-validate="url" placeholder="e.g. github.com/user/project">
      </div>`,

        certifications: `
      <div class="entry-header">
        <span class="entry-title">Certification Entry</span>
        <button class="btn btn-danger btn-sm" data-remove-entry>✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Certification Name</label>
          <input type="text" class="form-input" data-field="name" placeholder="e.g. AWS Solutions Architect">
        </div>
        <div class="form-group">
          <label class="form-label">Issuing Organization</label>
          <input type="text" class="form-input" data-field="issuer" placeholder="e.g. Amazon Web Services">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="month" class="form-input" data-field="date">
      </div>`,

        languages: `
      <div class="entry-header">
        <span class="entry-title">Language Entry</span>
        <button class="btn btn-danger btn-sm" data-remove-entry>✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Language</label>
          <input type="text" class="form-input" data-field="name" placeholder="e.g. Spanish">
        </div>
        <div class="form-group">
          <label class="form-label">Proficiency</label>
          <select class="form-input form-select" data-field="proficiency">
            <option value="">Select level</option>
            <option value="Native">Native</option>
            <option value="Fluent">Fluent</option>
            <option value="Professional">Professional</option>
            <option value="Conversational">Conversational</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>`
    };

    entry.innerHTML = templates[type] || '';
    container.appendChild(entry);

    // Setup validation on new inputs
    setupRealtimeValidation(entry);

    // Attach input listeners to new fields
    entry.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', () => {
            triggerDataChange();
            autoSave();
        });
        input.addEventListener('change', () => {
            triggerDataChange();
            autoSave();
        });
    });
}

/**
 * Setup skills add/remove
 */
function setupSkillsInput() {
    const addBtn = $('#add-skill-btn');
    const input = $('#skill-input');

    if (!addBtn || !input) return;

    const addSkill = () => {
        const value = input.value.trim();
        if (!value) return;

        // Support comma-separated entry
        const skills = value.split(',').map(s => s.trim()).filter(s => s);
        skills.forEach(skill => createSkillTag(skill));

        input.value = '';
        triggerDataChange();
        autoSave();
    };

    addBtn.addEventListener('click', addSkill);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
}

/**
 * Create a skill tag element
 */
function createSkillTag(skill) {
    const container = $('#skills-tags');
    if (!container) return;

    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `${skill} <span class="remove-skill" title="Remove">✕</span>`;

    tag.querySelector('.remove-skill').addEventListener('click', () => {
        tag.remove();
        triggerDataChange();
        autoSave();
    });

    container.appendChild(tag);
}

/**
 * Collect all form data into a structured object
 */
export function collectFormData() {
    const data = {
        personal: {
            fullName: ($('#personal-name') || {}).value || '',
            email: ($('#personal-email') || {}).value || '',
            phone: ($('#personal-phone') || {}).value || '',
            address: ($('#personal-address') || {}).value || '',
            linkedin: ($('#personal-linkedin') || {}).value || '',
            portfolio: ($('#personal-portfolio') || {}).value || '',
            profileImage: window._profileImageData || ''
        },
        summary: ($('#profile-summary') || {}).value || '',
        education: collectEntries('education'),
        experience: collectEntries('experience'),
        skills: collectSkillTags(),
        projects: collectEntries('projects'),
        certifications: collectEntries('certifications'),
        languages: collectEntries('languages'),
        interests: ($('#interests-input') || {}).value
            ? ($('#interests-input')).value.split(',').map(s => s.trim()).filter(s => s)
            : []
    };

    return data;
}

/**
 * Collect entries from dynamic entry containers
 */
function collectEntries(type) {
    const entries = [];
    $$(`#${type}-entries .dynamic-entry`).forEach(entry => {
        const obj = {};
        entry.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            if (input.type === 'checkbox') {
                obj[field] = input.checked;
            } else {
                obj[field] = input.value.trim();
            }
        });
        // Only include entries with at least some data
        if (Object.values(obj).some(v => v && v !== false)) {
            entries.push(obj);
        }
    });
    return entries;
}

/**
 * Collect skill tags
 */
function collectSkillTags() {
    const tags = [];
    $$('#skills-tags .skill-tag').forEach(tag => {
        const text = tag.childNodes[0].textContent.trim();
        if (text) tags.push(text);
    });
    return tags;
}

/**
 * Trigger data change callback
 */
function triggerDataChange() {
    if (onDataChange) {
        const data = collectFormData();
        onDataChange(data);
    }
}

/**
 * Auto-save to localStorage
 */
let autoSaveTimer = null;
function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const data = collectFormData();
        saveToStorage(STORAGE_KEY, data);
    }, 500);
}

/**
 * Load saved data and populate form
 */
function loadSavedData() {
    const data = loadFromStorage(STORAGE_KEY);
    if (!data) return;

    // Personal
    if (data.personal) {
        const p = data.personal;
        const fields = {
            'personal-name': p.fullName,
            'personal-email': p.email,
            'personal-phone': p.phone,
            'personal-address': p.address,
            'personal-linkedin': p.linkedin,
            'personal-portfolio': p.portfolio
        };
        Object.entries(fields).forEach(([id, val]) => {
            const el = $(`#${id}`);
            if (el && val) el.value = val;
        });
        if (p.profileImage) {
            window._profileImageData = p.profileImage;
        }
    }

    // Summary
    if (data.summary) {
        const el = $('#profile-summary');
        if (el) el.value = data.summary;
    }

    // Dynamic entries
    ['education', 'experience', 'projects', 'certifications', 'languages'].forEach(type => {
        if (data[type] && data[type].length > 0) {
            data[type].forEach(entry => {
                addEntry(type);
                const container = $(`#${type}-entries`);
                const lastEntry = container.lastElementChild;
                if (lastEntry) {
                    Object.entries(entry).forEach(([field, value]) => {
                        const input = lastEntry.querySelector(`[data-field="${field}"]`);
                        if (input) {
                            if (input.type === 'checkbox') {
                                input.checked = value;
                            } else {
                                input.value = value;
                            }
                        }
                    });
                }
            });
        }
    });

    // Skills
    if (data.skills && data.skills.length > 0) {
        data.skills.forEach(skill => createSkillTag(skill));
    }

    // Interests
    if (data.interests && data.interests.length > 0) {
        const el = $('#interests-input');
        if (el) el.value = data.interests.join(', ');
    }

    // Trigger preview update
    triggerDataChange();
}

/**
 * Load sample data
 */
export async function loadSampleData() {
    try {
        const response = await fetch('data/sample-resume.json');
        const data = await response.json();
        saveToStorage(STORAGE_KEY, data);
        location.reload(); // Simply reload to populate from storage
    } catch (e) {
        showToast('Failed to load sample data', 'error');
        console.error(e);
    }
}

export { STEPS, currentStep };
