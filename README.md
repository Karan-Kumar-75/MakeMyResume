# 📄 MakeMyResume — Professional Resume Builder

A stunning, production-ready resume builder website built with **pure HTML, CSS, and Vanilla JavaScript**. No frameworks, no dependencies — just clean code.

![MakeMyResume](https://img.shields.io/badge/MakeMyResume-v1.0.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## ✨ Features

- **Step-by-step form wizard** — Personal Info, Summary, Education, Experience, Skills, Projects, Certifications, Languages, Interests
- **20 professional templates** — Minimal, Modern, Creative, ATS-Friendly, Executive, and more
- **Live preview** — See your resume update in real-time as you type
- **PDF generation** — Download your resume as a properly formatted A4 PDF
- **Profile image support** — Upload a photo or generate a text-only resume
- **Template categories** — Filter by Minimal, Modern, Corporate, Creative, Technical, ATS-Friendly
- **Auto-save** — Your data is automatically saved to localStorage
- **Real-time validation** — Inline error messages for required fields
- **Fully responsive** — Works on desktop, tablet, and mobile
- **Clean print stylesheet** — Print directly from the browser
- **Sample data** — Load pre-filled example data with one click
- **Comma-separated skills** — Bulk add skills quickly

## 🎨 Templates

| # | Template | Style |
|---|----------|-------|
| 01 | Minimal Classic | Clean, timeless |
| 02 | Modern Professional | Gradient header, indigo accent |
| 03 | Executive Corporate | Formal, double borders |
| 04 | Creative Designer | Bold, colorful gradients |
| 05 | ATS-Friendly | Parser-optimized, plain text |
| 06 | Compact One Page | Dense, small font |
| 07 | Sidebar Layout | Dark sidebar + white main |
| 08 | Two Column Clean | Balanced grid |
| 09 | Elegant Serif | Sophisticated, serif fonts |
| 10 | Dark Header Accent | Dark header bar |
| 11 | Timeline Style | Timeline markers |
| 12 | Fresher Format | Light blue, new graduates |
| 13 | Technical Resume | Code-inspired, monospace |
| 14 | Business Analyst | Navy corporate |
| 15 | Software Developer | Purple/blue gradient |
| 16 | Marketing Pro | Orange/red vibrant |
| 17 | Academic CV | Serif, scholarly |
| 18 | Simple Minimal | Ultra-clean, bare-bones |
| 19 | Bold Name Header | Oversized 36pt name |
| 20 | Premium Gold | Luxurious gold accents |

## 🚀 Getting Started

### Option 1: Just open the file

```bash
# Simply double-click index.html or open it in your browser
open index.html
```

### Option 2: Use a local server (recommended for ES modules)

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8000` (or the port shown).

> **Note:** ES modules require a local server to work. Simply opening the HTML file via `file://` may not load the JavaScript modules in some browsers. Use one of the local server options above.

## 📁 Folder Structure

```
resume-builder/
├── index.html              # Main application
├── preview.html            # Standalone preview page
├── README.md
├── LICENSE
├── .gitignore
├── assets/
│   ├── fonts/poppins.css   # Google Fonts import
│   ├── icons/svg-icons.svg # SVG icon sprite
│   └── images/             # Image assets
├── css/
│   ├── base/               # Variables, reset, typography
│   ├── components/         # Buttons, forms, cards, layout
│   ├── templates/          # 20 template stylesheets
│   ├── main.css            # All imports + app styles
│   └── print.css           # Print stylesheet
├── js/
│   ├── utils/              # Helpers, validation, formatter
│   ├── modules/            # Form, preview, templates, image, PDF
│   └── main.js             # App entry point
└── data/
    └── sample-resume.json  # Sample data for testing
```

## 🛠 Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** — ES Modules, no frameworks
- **Poppins** — Google Fonts
- **html2pdf.js** — PDF generation (CDN)

## 📄 License

MIT — see [LICENSE](LICENSE)
