# ESF Course Microsite Template

A deployable course microsite that turns structured course content into an interactive student-facing website. Built with React, Vite, Tailwind CSS v4, and shadcn/ui.

Part of the [Epistemic Stewardship Framework](https://github.com/nmadrid27/Epistemic-Stewardship-Framework-ESF-) faculty toolkit.

## What Students See

- Course overview with hero banner and deadline cards
- Interactive course map (clickable week-by-week table)
- Expandable weekly content with sessions, deliverables, and activities
- Project detail pages with deliverables, assessment criteria, and AI policy
- ESF templates (Position Statement, AI Use Log, Records of Resistance)
- Course policies with AI progression tables
- Light/dark theme toggle
- Fully responsive (mobile, tablet, desktop)

## Quick Start

### 1. Create your site

Click **"Use this template"** on GitHub to create your own copy, then clone it:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
pnpm install
```

### 2. Add your course data

Edit `src/data/course-data.json` with your course content. The file ships with placeholder data showing the expected structure.

**Or** use the compiler to generate it from an Obsidian vault:

```bash
node scripts/compile.mjs /path/to/your/course/folder
```

The compiler reads markdown files with YAML frontmatter from your vault's `modules/`, `projects/`, and `planning/syllabus/` directories.

### 3. Run locally

```bash
pnpm dev:vite
```

Open `http://localhost:5173` to preview.

### 4. Deploy

```bash
pnpm run build
```

Deploy the `dist/` folder to any static host. A `vercel.json` is included for one-command Vercel deployment:

```bash
vercel deploy --prod
```

## Project Structure

```
├── scripts/
│   ├── compile.mjs          # Vault markdown → course-data.json compiler
│   └── watch.mjs            # File watcher for live recompilation
├── src/
│   ├── data/
│   │   └── course-data.json # Your course content (edit this)
│   ├── components/
│   │   ├── course-overview.tsx
│   │   ├── course-map.tsx
│   │   ├── week-accordion.tsx
│   │   ├── project-cards.tsx
│   │   ├── templates-section.tsx
│   │   ├── policies-tabs.tsx
│   │   ├── deadline-cards.tsx
│   │   ├── theme-toggle.tsx
│   │   └── layout/
│   │       ├── main-layout.tsx
│   │       └── top-nav.tsx
│   ├── pages/
│   │   ├── home-page.tsx
│   │   └── project-page.tsx
│   ├── lib/
│   │   ├── unit-colors.ts   # Color system (auto-assigns by unit index)
│   │   └── utils.ts
│   ├── types.ts             # TypeScript interfaces for course-data.json
│   ├── App.tsx
│   └── index.css            # Theme tokens (light/dark)
└── vercel.json
```

## Customization

### Course Data

All content lives in `src/data/course-data.json`. Edit it directly or use the compiler. The TypeScript interfaces in `src/types.ts` document every field.

### Colors

Unit colors are assigned automatically by position (unit 1 = violet, unit 2 = blue, unit 3 = emerald, unit 4 = amber). No configuration needed. If you have more than four units, colors cycle.

### Theme

Light and dark themes are defined in `src/index.css` as CSS custom properties. Edit the `:root` and `.dark` blocks to match your institution's colors.

### Compiler

The compiler auto-detects which directory layout you use.

**ESF Faculty Toolkit layout** (recommended for most faculty):

```
courses/my-course/
├── syllabus.md               # Course syllabus with frontmatter
├── materials/
│   ├── week-01.md            # Weekly session plans
│   ├── week-02.md
│   └── ...
└── briefs/
    ├── project-01.md         # Project briefs
    ├── project-02.md
    └── ...
```

**Obsidian vault layout** (if you keep course content in an Obsidian vault):

```
your-course/
├── planning/syllabus/*.md     # Syllabus with frontmatter
├── modules/week-*.md          # Weekly session plans
├── projects/project-*/
│   ├── 00-brief.md            # Project briefs
│   └── resources.md           # Optional resources
└── projects/shared-templates/ # Optional ESF templates
```

For live recompilation during development:

```bash
COURSE_VAULT_PATH=/path/to/course pnpm dev
```

This runs Vite and the file watcher concurrently. Edits to course files trigger JSON regeneration; Vite hot-reloads the changes.

## Stack

- **React 19** with TypeScript
- **Vite 6** (build + dev server)
- **Tailwind CSS v4** (CSS-first configuration)
- **shadcn/ui** (Radix primitives + Tailwind)
- **react-router-dom v7** (client-side routing)
- **Lucide React** (icons)

## License

MIT. Part of the ESF Faculty Toolkit (CC BY 4.0).
