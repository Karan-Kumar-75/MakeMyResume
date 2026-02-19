/* ============================================
   Preview Generator Module
   Builds live HTML preview from resume data
   ============================================ */

import { formatDate, formatDateRange, escapeHtml } from '../utils/formatter.js';

/**
 * Generate resume preview HTML from data
 * @param {Object} data - Resume data object
 * @param {string} templateClass - Template CSS class (e.g. 'template-01')
 * @returns {string} - Full HTML
 */
export function generatePreview(data, templateClass = 'template-01') {
    if (!data) return '<p style="text-align:center;color:#94a3b8;padding:40px;">Fill in the form to see your resume preview</p>';

    const hasImage = data.personal?.profileImage;
    const isSidebar = templateClass === 'template-07';
    const isTwoColumn = templateClass === 'template-08';

    if (isSidebar) {
        return generateSidebarLayout(data, templateClass);
    }

    if (isTwoColumn) {
        return generateTwoColumnLayout(data, templateClass);
    }

    return generateStandardLayout(data, templateClass, hasImage);
}

/**
 * Standard single-column layout
 */
function generateStandardLayout(data, templateClass, hasImage) {
    let html = `<div class="${templateClass}">`;

    // Header
    html += `<div class="resume-header">`;
    if (templateClass === 'template-10') {
        html += `<div class="resume-header-left">`;
    }

    if (hasImage) {
        html += `<img src="${data.personal.profileImage}" alt="Profile" class="resume-profile-image">`;
    }

    html += `<div class="resume-name">${escapeHtml(data.personal?.fullName || 'Your Name')}</div>`;
    html += generateContactInfo(data.personal);

    if (templateClass === 'template-10') {
        html += `</div>`;
    }
    html += `</div>`;

    // Summary
    if (data.summary) {
        html += generateSection('Profile Summary', `<div class="resume-summary">${escapeHtml(data.summary)}</div>`);
    }

    // Experience
    if (data.experience?.length > 0) {
        html += generateSection('Experience', data.experience.map(exp => generateEntryHtml({
            title: exp.jobTitle,
            subtitle: exp.company,
            date: formatDateRange(exp.startDate, exp.endDate, exp.current),
            description: exp.description
        })).join(''));
    }

    // Education
    if (data.education?.length > 0) {
        html += generateSection('Education', data.education.map(edu => generateEntryHtml({
            title: edu.degree,
            subtitle: edu.institution,
            date: formatDateRange(edu.startDate, edu.endDate),
            description: edu.description
        })).join(''));
    }

    // Skills
    if (data.skills?.length > 0) {
        html += generateSection('Skills', `
      <div class="resume-skills-list">
        ${data.skills.map(s => `<span class="resume-skill-item">${escapeHtml(s)}</span>`).join('')}
      </div>
    `);
    }

    // Projects
    if (data.projects?.length > 0) {
        html += generateSection('Projects', data.projects.map(proj => generateEntryHtml({
            title: proj.name,
            subtitle: proj.link || '',
            description: proj.description
        })).join(''));
    }

    // Certifications
    if (data.certifications?.length > 0) {
        html += generateSection('Certifications', `
      <ul class="resume-certs-list">
        ${data.certifications.map(cert => `
          <li><strong>${escapeHtml(cert.name)}</strong> — ${escapeHtml(cert.issuer)}${cert.date ? ` (${formatDate(cert.date)})` : ''}</li>
        `).join('')}
      </ul>
    `);
    }

    // Languages
    if (data.languages?.length > 0) {
        html += generateSection('Languages', `
      <ul class="resume-languages-list">
        ${data.languages.map(lang => `<li>${escapeHtml(lang.name)}${lang.proficiency ? ` — ${escapeHtml(lang.proficiency)}` : ''}</li>`).join('')}
      </ul>
    `);
    }

    // Interests
    if (data.interests?.length > 0) {
        html += generateSection('Interests', `
      <ul class="resume-interests-list">
        ${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
    `);
    }

    html += `</div>`;
    return html;
}

/**
 * Sidebar layout (template-07)
 */
function generateSidebarLayout(data, templateClass) {
    let sidebar = '';
    let main = '';

    // Sidebar content
    sidebar += `<div class="resume-sidebar">`;

    if (data.personal?.profileImage) {
        sidebar += `<img src="${data.personal.profileImage}" alt="Profile" class="resume-profile-image">`;
    }
    sidebar += `<div class="resume-name">${escapeHtml(data.personal?.fullName || 'Your Name')}</div>`;

    // Contact in sidebar
    sidebar += `<div class="resume-section"><div class="resume-section-title">Contact</div>`;
    sidebar += `<div class="resume-contact">`;
    if (data.personal?.email) sidebar += `<span>${escapeHtml(data.personal.email)}</span>`;
    if (data.personal?.phone) sidebar += `<span>${escapeHtml(data.personal.phone)}</span>`;
    if (data.personal?.address) sidebar += `<span>${escapeHtml(data.personal.address)}</span>`;
    if (data.personal?.linkedin) sidebar += `<span>${escapeHtml(data.personal.linkedin)}</span>`;
    if (data.personal?.portfolio) sidebar += `<span>${escapeHtml(data.personal.portfolio)}</span>`;
    sidebar += `</div></div>`;

    // Skills in sidebar
    if (data.skills?.length > 0) {
        sidebar += `<div class="resume-section"><div class="resume-section-title">Skills</div>`;
        sidebar += data.skills.map(s => `<span class="resume-skill-item">${escapeHtml(s)}</span>`).join('');
        sidebar += `</div>`;
    }

    // Languages in sidebar
    if (data.languages?.length > 0) {
        sidebar += `<div class="resume-section"><div class="resume-section-title">Languages</div>`;
        sidebar += `<ul class="resume-languages-list">${data.languages.map(l => `<li>${escapeHtml(l.name)}${l.proficiency ? ` — ${l.proficiency}` : ''}</li>`).join('')}</ul></div>`;
    }

    // Interests in sidebar
    if (data.interests?.length > 0) {
        sidebar += `<div class="resume-section"><div class="resume-section-title">Interests</div>`;
        sidebar += `<ul class="resume-interests-list">${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
    }

    sidebar += `</div>`;

    // Main content
    main += `<div class="resume-main">`;

    if (data.summary) {
        main += `<div class="resume-section"><div class="resume-section-title">Profile</div><div class="resume-summary">${escapeHtml(data.summary)}</div></div>`;
    }

    if (data.experience?.length > 0) {
        main += `<div class="resume-section"><div class="resume-section-title">Experience</div>`;
        main += data.experience.map(exp => generateEntryHtml({ title: exp.jobTitle, subtitle: exp.company, date: formatDateRange(exp.startDate, exp.endDate, exp.current), description: exp.description })).join('');
        main += `</div>`;
    }

    if (data.education?.length > 0) {
        main += `<div class="resume-section"><div class="resume-section-title">Education</div>`;
        main += data.education.map(edu => generateEntryHtml({ title: edu.degree, subtitle: edu.institution, date: formatDateRange(edu.startDate, edu.endDate), description: edu.description })).join('');
        main += `</div>`;
    }

    if (data.projects?.length > 0) {
        main += `<div class="resume-section"><div class="resume-section-title">Projects</div>`;
        main += data.projects.map(p => generateEntryHtml({ title: p.name, subtitle: p.link, description: p.description })).join('');
        main += `</div>`;
    }

    if (data.certifications?.length > 0) {
        main += `<div class="resume-section"><div class="resume-section-title">Certifications</div>`;
        main += `<ul class="resume-certs-list">${data.certifications.map(c => `<li><strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer)}</li>`).join('')}</ul></div>`;
    }

    main += `</div>`;

    return `<div class="${templateClass}">${sidebar}${main}</div>`;
}

/**
 * Two-column layout (template-08)
 */
function generateTwoColumnLayout(data, templateClass) {
    let html = `<div class="${templateClass}">`;

    // Full-width header
    html += `<div class="resume-header">`;
    if (data.personal?.profileImage) {
        html += `<img src="${data.personal.profileImage}" alt="Profile" class="resume-profile-image">`;
    }
    html += `<div>`;
    html += `<div class="resume-name">${escapeHtml(data.personal?.fullName || 'Your Name')}</div>`;
    html += generateContactInfo(data.personal);
    html += `</div></div>`;

    // Summary (full width)
    if (data.summary) {
        html += `<div class="resume-summary">${escapeHtml(data.summary)}</div>`;
    }

    // Left column
    html += `<div class="resume-left">`;
    if (data.experience?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Experience</div>`;
        html += data.experience.map(exp => generateEntryHtml({ title: exp.jobTitle, subtitle: exp.company, date: formatDateRange(exp.startDate, exp.endDate, exp.current), description: exp.description })).join('');
        html += `</div>`;
    }
    if (data.projects?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Projects</div>`;
        html += data.projects.map(p => generateEntryHtml({ title: p.name, subtitle: p.link, description: p.description })).join('');
        html += `</div>`;
    }
    html += `</div>`;

    // Right column
    html += `<div class="resume-right">`;
    if (data.education?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Education</div>`;
        html += data.education.map(edu => generateEntryHtml({ title: edu.degree, subtitle: edu.institution, date: formatDateRange(edu.startDate, edu.endDate), description: edu.description })).join('');
        html += `</div>`;
    }
    if (data.skills?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Skills</div>`;
        html += `<div class="resume-skills-list">${data.skills.map(s => `<span class="resume-skill-item">${escapeHtml(s)}</span>`).join('')}</div></div>`;
    }
    if (data.certifications?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Certifications</div>`;
        html += `<ul class="resume-certs-list">${data.certifications.map(c => `<li><strong>${escapeHtml(c.name)}</strong></li>`).join('')}</ul></div>`;
    }
    if (data.languages?.length > 0) {
        html += `<div class="resume-section"><div class="resume-section-title">Languages</div>`;
        html += `<ul class="resume-languages-list">${data.languages.map(l => `<li>${escapeHtml(l.name)} — ${l.proficiency || ''}</li>`).join('')}</ul></div>`;
    }
    html += `</div>`;

    html += `</div>`;
    return html;
}

/**
 * Generate contact info HTML
 */
function generateContactInfo(personal) {
    if (!personal) return '';
    const items = [];
    if (personal.email) items.push(`<span>${escapeHtml(personal.email)}</span>`);
    if (personal.phone) items.push(`<span>${escapeHtml(personal.phone)}</span>`);
    if (personal.linkedin) items.push(`<span>${escapeHtml(personal.linkedin)}</span>`);
    if (personal.portfolio) items.push(`<span>${escapeHtml(personal.portfolio)}</span>`);

    // Build full address string
    const addrParts = [
        personal.vill ? `Vill: ${personal.vill}` : '',
        personal.po ? `PO: ${personal.po}` : '',
        personal.ps ? `PS: ${personal.ps}` : '',
        personal.city ? personal.city : '',
        personal.state ? personal.state : '',
        personal.pincode ? personal.pincode : ''
    ].filter(Boolean);
    if (addrParts.length) items.push(`<span>${escapeHtml(addrParts.join(', '))}</span>`);

    let html = `<div class="resume-contact">${items.join('')}</div>`;

    // Personal details row (father name + DOB)
    const details = [];
    if (personal.fatherName) details.push(`<span><strong>Father:</strong> ${escapeHtml(personal.fatherName)}</span>`);
    if (personal.dob) details.push(`<span><strong>DOB:</strong> ${escapeHtml(personal.dob)}</span>`);
    if (details.length) {
        html += `<div class="resume-contact resume-personal-details">${details.join('')}</div>`;
    }

    return html;
}

/**
 * Generate section wrapper
 */
function generateSection(title, content) {
    return `
    <div class="resume-section">
      <div class="resume-section-title">${title}</div>
      ${content}
    </div>`;
}

/**
 * Generate entry HTML (education/experience/project items)
 */
function generateEntryHtml({ title, subtitle, date, description }) {
    return `
    <div class="resume-entry">
      <div class="resume-entry-header">
        <div>
          <div class="resume-entry-title">${escapeHtml(title || '')}</div>
          ${subtitle ? `<div class="resume-entry-subtitle">${escapeHtml(subtitle)}</div>` : ''}
        </div>
        ${date ? `<div class="resume-entry-date">${date}</div>` : ''}
      </div>
      ${description ? `<div class="resume-entry-description">${escapeHtml(description)}</div>` : ''}
    </div>`;
}

/**
 * Update the preview panel with new HTML
 * @param {Element} container - Preview container element
 * @param {Object} data - Resume data
 * @param {string} templateClass - Template class
 */
export function updatePreview(container, data, templateClass) {
    if (!container) return;

    const html = generatePreview(data, templateClass);
    const innerEl = container.querySelector('.preview-resume-inner');
    if (innerEl) {
        innerEl.innerHTML = html;
        // Scale to fit
        scalePreview(container);
    }
}

/**
 * Scale preview to fit container
 */
export function scalePreview(container) {
    const resume = container.querySelector('.preview-resume');
    const inner = container.querySelector('.preview-resume-inner');
    if (!resume || !inner) return;

    const containerWidth = resume.clientWidth;
    const contentWidth = 794; // 210mm in px at 96dpi
    const scale = containerWidth / contentWidth;

    inner.style.transform = `scale(${scale})`;
    inner.style.width = `${contentWidth}px`;
    resume.style.height = `${1123 * scale}px`; // 297mm height
}
