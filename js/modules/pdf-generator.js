/* ============================================================
   DOCX Generator — A4 Word Document Download
   Uses docx.js with jsDelivr + unpkg fallback loading
   ============================================================ */

import { $, showToast } from '../utils/helpers.js';
import { collectFormData } from './form-handler.js';
import { formatDateRange } from '../utils/formatter.js';

const A4_W = 11906;          // A4 width in twips (210mm)
const A4_H = 16838;          // A4 height in twips (297mm)
const MARGIN = Math.round(2 * 567); // 2 cm margins

const pt = n => n * 20;        // points → half-points (docx font size unit)

let isGenerating = false;

/* ── Dynamic loader ─────────────────────────────────────── */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function ensureDocx() {
    if (typeof docx !== 'undefined') return true;
    const cdns = [
        'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js',
        'https://unpkg.com/docx@8.5.0/build/index.umd.min.js'
    ];
    for (const cdn of cdns) {
        try {
            await loadScript(cdn);
            if (typeof docx !== 'undefined') return true;
        } catch (_) { }
    }
    return false;
}

/* ── Init ───────────────────────────────────────────────── */
export function initPdfGenerator() {
    ['download-pdf-btn', 'download-pdf-btn-2'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handleDownload);
    });
}

async function handleDownload() {
    if (isGenerating) return;
    isGenerating = true;
    try { await generateDoc(); }
    finally { isGenerating = false; }
}

/* ── Helpers ────────────────────────────────────────────── */
function sectionRule() {
    const { Paragraph, BorderStyle } = docx;
    return new Paragraph({
        border: { bottom: { color: '334155', size: 6, space: 6, style: BorderStyle.SINGLE } },
        spacing: { before: pt(6), after: pt(4) }
    });
}

function sectionHeading(text) {
    const { Paragraph, TextRun } = docx;
    return new Paragraph({
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: pt(13), color: '1e293b', font: 'Calibri' })],
        spacing: { before: pt(12), after: pt(2) },
        keepNext: true
    });
}

function entryBlock({ title, subtitle, dateStr, description }) {
    const { Paragraph, TextRun, TabStopType, TabStopPosition } = docx;
    const rows = [];

    if (title || dateStr) {
        rows.push(new Paragraph({
            children: [
                new TextRun({ text: title || '', bold: true, size: pt(10.5), font: 'Calibri' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: dateStr || '', size: pt(11), color: '64748b', font: 'Calibri' })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            spacing: { before: pt(6), after: 0 },
            keepNext: true
        }));
    }
    if (subtitle) {
        rows.push(new Paragraph({
            children: [new TextRun({ text: subtitle, italics: true, size: pt(11), color: '475569', font: 'Calibri' })],
            spacing: { before: 0, after: 0 },
            keepNext: !!description
        }));
    }
    if (description) {
        rows.push(new Paragraph({
            children: [new TextRun({ text: description, size: pt(11), font: 'Calibri' })],
            spacing: { before: pt(2), after: pt(4) }
        }));
    }
    return rows;
}

/* ── Core generator ─────────────────────────────────────── */
async function generateDoc() {
    const data = collectFormData();

    if (!data.personal?.fullName) {
        showToast('Please enter your name first.', 'warning');
        return;
    }

    const btns = ['download-pdf-btn', 'download-pdf-btn-2']
        .map(id => document.getElementById(id)).filter(Boolean);
    btns.forEach(b => { b.disabled = true; b.textContent = '⏳ Loading…'; });
    showToast('Loading document library…', 'info', 8000);

    // Ensure docx.js is available
    const loaded = await ensureDocx();
    if (!loaded) {
        showToast('Could not load document library. Check your internet connection.', 'error');
        btns.forEach(b => { b.disabled = false; });
        resetBtnLabels();
        return;
    }

    btns.forEach(b => { b.textContent = '⏳ Building…'; });

    try {
        const { Document, Packer, Paragraph, TextRun, AlignmentType } = docx;
        const children = [];

        // NAME
        children.push(new Paragraph({
            children: [new TextRun({ text: data.personal?.fullName || '', bold: true, size: pt(16), color: '0f172a', font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: pt(4) }
        }));

        // CONTACT
        const contacts = [data.personal?.email, data.personal?.phone, data.personal?.address, data.personal?.linkedin, data.personal?.portfolio].filter(Boolean);
        if (contacts.length) {
            children.push(new Paragraph({
                children: contacts.flatMap((c, i) => [
                    new TextRun({ text: c, size: pt(11), color: '475569', font: 'Calibri' }),
                    ...(i < contacts.length - 1 ? [new TextRun({ text: '  |  ', size: pt(11), color: '94a3b8', font: 'Calibri' })] : [])
                ]),
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: pt(8) }
            }));
        }

        children.push(sectionRule());

        // SUMMARY
        if (data.summary) {
            children.push(sectionHeading('Profile Summary'));
            children.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: pt(11), font: 'Calibri' })], spacing: { before: pt(4), after: pt(6) } }));
        }

        // EXPERIENCE
        if (data.experience?.length) {
            children.push(sectionHeading('Experience'));
            data.experience.forEach(e => entryBlock({ title: e.jobTitle, subtitle: e.company, dateStr: formatDateRange(e.startDate, e.endDate, e.current), description: e.description }).forEach(p => children.push(p)));
        }

        // EDUCATION
        if (data.education?.length) {
            children.push(sectionHeading('Education'));
            data.education.forEach(e => entryBlock({ title: e.degree, subtitle: e.institution, dateStr: formatDateRange(e.startDate, e.endDate), description: e.description }).forEach(p => children.push(p)));
        }

        // SKILLS
        if (data.skills?.length) {
            children.push(sectionHeading('Skills'));
            children.push(new Paragraph({ children: [new TextRun({ text: data.skills.join('  •  '), size: pt(11), font: 'Calibri' })], spacing: { before: pt(4), after: pt(6) } }));
        }

        // PROJECTS
        if (data.projects?.length) {
            children.push(sectionHeading('Projects'));
            data.projects.forEach(p => entryBlock({ title: p.name, subtitle: p.link || '', description: p.description }).forEach(row => children.push(row)));
        }

        // CERTIFICATIONS
        if (data.certifications?.length) {
            children.push(sectionHeading('Certifications'));
            data.certifications.forEach(c => children.push(new Paragraph({
                children: [
                    new TextRun({ text: c.name, bold: true, size: pt(11), font: 'Calibri' }),
                    ...(c.issuer ? [new TextRun({ text: ` — ${c.issuer}`, size: pt(11), font: 'Calibri' })] : []),
                    ...(c.date ? [new TextRun({ text: ` (${c.date})`, size: pt(11), color: '64748b', font: 'Calibri' })] : [])
                ],
                spacing: { before: pt(4), after: pt(2) }
            })));
        }

        // LANGUAGES
        if (data.languages?.length) {
            children.push(sectionHeading('Languages'));
            data.languages.forEach(l => children.push(new Paragraph({
                children: [
                    new TextRun({ text: l.name, bold: true, size: pt(11), font: 'Calibri' }),
                    ...(l.proficiency ? [new TextRun({ text: ` — ${l.proficiency}`, size: pt(11), font: 'Calibri' })] : [])
                ],
                spacing: { before: pt(2), after: pt(2) }
            })));
        }

        // INTERESTS
        if (data.interests?.length) {
            children.push(sectionHeading('Interests'));
            children.push(new Paragraph({ children: [new TextRun({ text: data.interests.join('  •  '), size: pt(11), font: 'Calibri' })], spacing: { before: pt(4), after: pt(4) } }));
        }

        // Build & save
        const doc = new Document({
            styles: {
                default: {
                    document: { run: { font: 'Calibri', size: pt(10) }, paragraph: { spacing: { line: 276 } } }
                }
            },
            sections: [{
                properties: {
                    page: {
                        size: { width: A4_W, height: A4_H },
                        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN }
                    }
                },
                children
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const name = (data.personal.fullName || 'Resume').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        a.href = url; a.download = `${name}_Resume.docx`; a.click();
        URL.revokeObjectURL(url);
        showToast('Word document downloaded! 🎉', 'success');

    } catch (err) {
        console.error('[DOCX] Failed:', err);
        showToast(`Failed: ${err.message}`, 'error');
    } finally {
        btns.forEach(b => { b.disabled = false; });
        resetBtnLabels();
    }
}

function resetBtnLabels() {
    const main = document.getElementById('download-pdf-btn');
    if (main) main.innerHTML = '<svg width="18" height="18"><use href="#icon-download"></use></svg> Download DOC';
    const sec = document.getElementById('download-pdf-btn-2');
    if (sec) sec.innerHTML = '<svg width="14" height="14"><use href="#icon-download"></use></svg> Download DOC';
}
