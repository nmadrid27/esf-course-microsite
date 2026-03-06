#!/usr/bin/env node
/**
 * Course Data Compiler
 *
 * Reads vault markdown files (syllabus, week modules, project briefs,
 * shared templates) and compiles them into src/data/course-data.json.
 *
 * Usage:
 *   node scripts/compile.mjs [vault-path]
 *
 * Default vault path: set COURSE_VAULT_PATH env var, or pass as CLI argument
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "src/data/course-data.json");

const VAULT_PATH =
  process.argv[2] ||
  process.env.COURSE_VAULT_PATH ||
  null;

if (!VAULT_PATH) {
  console.error(
    "Error: No vault path provided.\n" +
    "Usage: node scripts/compile.mjs /path/to/your/course/folder\n" +
    "   or: COURSE_VAULT_PATH=/path/to/course node scripts/compile.mjs"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readMarkdown(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return matter(raw);
}

function readAllMarkdown(pattern) {
  const files = glob.sync(pattern).sort();
  return files.flatMap((f) => {
    try {
      return [{ path: f, ...matter(fs.readFileSync(f, "utf-8")) }];
    } catch (err) {
      console.warn(`  Warning: Could not read ${f}: ${err.message}`);
      return [];
    }
  });
}

/** Parse "1 to 3" or "4 to 6" or "10" into array of week numbers. */
function parseWeekRange(str) {
  const rangeMatch = str.match(/(\d+)\s*to\s*(\d+)/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }
  return str.match(/\d+/g)?.map(Number) || [];
}

/** Extract a numbered list from markdown text after a heading. */
function extractNumberedList(text, headingPattern) {
  // First find the heading, then scan forward (allowing blank lines/prose) for the numbered list
  const headingRe = new RegExp(`${headingPattern}`, "i");
  const headingMatch = text.match(headingRe);
  if (!headingMatch) return [];
  const afterHeading = text.slice(headingMatch.index + headingMatch[0].length);
  // Find the first numbered list block
  const listMatch = afterHeading.match(/((?:^|\n)\d+\.\s.+(?:\n(?:\d+\.\s.+|\s+\S.*))*)/);
  if (!listMatch) return [];
  return listMatch[1]
    .split("\n")
    .filter((line) => /^\d+\.\s/.test(line.trim()))
    .map((line) => line.trim().replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

/** Extract a markdown table as array of objects (header row = keys). */
function extractTable(text, headingPattern) {
  const re = new RegExp(
    `${headingPattern}[\\s\\S]*?\\n(\\|.+\\|\\n\\|[-| :]+\\|\\n(?:\\|.+\\|\\n?)*)`,
    "i"
  );
  const match = text.match(re);
  if (!match) return [];
  const lines = match[1].trim().split("\n");
  if (lines.length < 3) return [];
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);
  return lines.slice(2).map((row) => {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] || "";
    });
    return obj;
  });
}

/** Extract text between two headings (same level). */
function extractSection(text, headingPattern, level = 2) {
  const hashes = "#".repeat(level);
  const re = new RegExp(
    `${hashes}\\s*${headingPattern}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n${hashes}\\s|$)`,
    "i"
  );
  const match = text.match(re);
  return match ? match[1].trim() : "";
}

/** Parse activities from a ### Flow section. Pattern: **Name (Duration)** */
function parseActivities(flowText) {
  const activities = [];
  // Normalize: ensure leading newline so split captures the first block
  const normalized = "\n" + flowText.trimStart();
  const blocks = normalized.split(/\n\*\*/).filter(Boolean);

  for (const block of blocks) {
    // Pattern 1: Name (Duration): SubTitle** — e.g. **Demo (15 min): Cognitive Bias Codex**
    let headerMatch = block.match(
      /^([^(]+?)\s*\(([^)]+)\):\s*([^*]+)\*\*/
    );
    if (headerMatch) {
      const baseName = headerMatch[1].trim();
      const duration = headerMatch[2].trim();
      const subTitle = headerMatch[3].trim();
      const fullName = `${baseName}: ${subTitle}`;
      const rest = block.slice(headerMatch[0].length).trim();
      const description = rest
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\*\*/g, "")
        .slice(0, 500);
      activities.push({
        activityName: fullName,
        duration: duration.includes("min") ? duration : `${duration} min`,
        description: description || fullName,
      });
      continue;
    }

    // Pattern 2: Name (Duration)** — e.g. **Warm-Up: The Jar Task (20 min)**
    headerMatch = block.match(
      /^([^(]+?)\s*\(([^)]+)\)\s*\*\*/
    );
    if (headerMatch) {
      const name = headerMatch[1].trim().replace(/^\*\*/, "");
      const duration = headerMatch[2].trim();
      const rest = block.slice(headerMatch[0].length).trim();
      const description = rest
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\*\*/g, "")
        .slice(0, 500);

      if (name) {
        const cleanDuration = /remaining/i.test(duration)
          ? "remaining time"
          : duration.includes("min")
          ? duration
          : `${duration} min`;
        activities.push({
          activityName: name.replace(/:$/, "").trim(),
          duration: cleanDuration,
          description: description || name,
        });
      }
      continue;
    }

    // Pattern 3: **Name**\n without duration
    const altMatch = block.match(/^([^*]+)\*\*/);
    if (altMatch) {
      const name = altMatch[1].trim().replace(/^\*\*/, "");
      const desc = block
        .slice(altMatch[0].length)
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ");
      if (name && desc) {
        activities.push({
          activityName: name,
          duration: "",
          description: desc.slice(0, 300),
        });
      }
    }
  }

  return activities;
}

/** Calculate total duration from activities. */
function totalDuration(activities) {
  let total = 0;
  let hasRemaining = false;
  for (const a of activities) {
    const m = a.duration.match(/(\d+)/);
    if (m) total += parseInt(m[1], 10);
    if (a.duration.includes("remaining")) hasRemaining = true;
  }
  return hasRemaining ? `${total}+ min` : `${total} min`;
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseSyllabus() {
  const files = glob.sync(path.join(VAULT_PATH, "planning/syllabus/*Syllabus*.md"));
  if (files.length === 0) {
    console.warn("  Warning: No syllabus found");
    return {};
  }
  const parsed = readMarkdown(files[0]);
  if (!parsed) {
    console.warn("  Warning: Syllabus file unreadable");
    return {};
  }
  const { content, data: fm } = parsed;

  // Metadata: prefer frontmatter, fall back to defaults
  const metadata = {
    courseCode: fm.course || "AI 180",
    courseTitle: fm.title || "Unleashing Creativity",
    quarter: fm.quarter || "Spring",
    year: fm.year || 2026,
    instructor: fm.instructor || "Nathan Madrid",
    courseDescription: "",
    totalWeeks: fm.totalWeeks || 10,
    hasESF: content.includes("Epistemic Stewardship"),
    program: fm.program || "Applied AI Degree, THINK phase",
  };

  // Extract description from first paragraph after course title heading
  const descMatch = content.match(
    /#+\s*Course\s*Description\s*\n+([\s\S]*?)(?=\n#|\n---)/i
  );
  if (descMatch) {
    metadata.courseDescription = descMatch[1]
      .trim()
      .split("\n\n")[0]
      .replace(/\n/g, " ")
      .trim();
  }
  if (!metadata.courseDescription) {
    // Fallback: look for the catalog description
    const catMatch = content.match(
      /This interdisciplinary course[\s\S]*?(?=\n\n|\n#)/
    );
    if (catMatch) {
      metadata.courseDescription = catMatch[0].replace(/\n/g, " ").trim();
    }
  }

  // Learning outcomes
  const outcomes = extractNumberedList(content, "#+\\s*Learning\\s*Outcomes?");
  const learningOutcomes = outcomes.map((o, i) => ({ id: i + 1, outcome: o }));

  // Course structure: extract unit table
  // Table format: | Unit | Weeks | Theme | AI Present? |
  // Unit column contains "1: Know Yourself" (number + name combined)
  const unitTable = extractTable(content, "#+\\s*Course\\s*Structure");
  const units = [];
  for (const row of unitTable) {
    const unitCell = row["Unit"] || row["#"] || "";
    // Parse "1: Know Yourself" or "1 - Know Yourself" or just "1"
    const unitMatch = unitCell.match(/^(\d+)\s*[:.\-]\s*(.*)/);
    const unitNum = unitMatch
      ? parseInt(unitMatch[1], 10)
      : parseInt(unitCell, 10) || 0;
    const unitName = unitMatch
      ? unitMatch[2].trim()
      : row["Name"] || row["Unit Name"] || "";
    if (!unitNum) continue;
    const weeksStr = row["Weeks"] || "";
    const weekNums = parseWeekRange(weeksStr);
    units.push({
      unitNumber: unitNum,
      unitName,
      weeks: weekNums,
      theme: row["Theme"] || row["Focus"] || "",
      aiPresent: /yes|active|present/i.test(row["AI Present?"] || row["AI"] || row["AI Present"] || ""),
    });
  }

  // Grading: table format is | Component | Weight | Due |
  const gradingTable = extractTable(content, "#+\\s*(?:Assessment\\s*Summary|Grading|Assessment)");
  const gradingComponents = gradingTable
    .filter((row) => {
      const comp = row["Component"] || row["Assignment"] || row["Project"] || "";
      return comp && !comp.includes("---") && !comp.includes("**Total**");
    })
    .map((row) => ({
      component:
        row["Component"] || row["Assignment"] || row["Project"] || "",
      weight: parseInt(
        (row["Weight"] || row["%"] || "0").replace(/[^0-9]/g, ""),
        10
      ),
      description: row["Description"] || row["Details"] || row["Due"] || "",
    }));

  // Policies
  const lateWork =
    extractSection(content, "Late\\s*Work", 3) ||
    extractSection(content, "Late\\s*Work", 2) ||
    "";
  const attendance =
    extractSection(content, "Attendance", 3) ||
    extractSection(content, "Attendance", 2) ||
    "";

  // AI Use policy: unit progression table
  const aiProgressionTable = extractTable(
    content,
    "#+\\s*(?:AI\\s*Use|AI\\s*Tool)\\s*(?:Policy|Progression|by\\s*Unit)"
  );
  const unitProgression = aiProgressionTable.map((row) => ({
    unit: row["Unit"] || "",
    weeks: row["Weeks"] || "",
    aiStatus: row["Status"] || row["AI Status"] || row["AI"] || "",
    guidance: row["Guidance"] || row["Notes"] || row["Details"] || "",
  }));

  // Project permission matrix
  const matrixTable = extractTable(
    content,
    "#+\\s*(?:Project\\s*Permission|AI\\s*Permission|Project\\s*Matrix)"
  );
  const projectMatrix = matrixTable.map((row) => ({
    project: row["Project"] || "",
    consultative: row["Consultative"] || row["Research"] || "",
    transformative: row["Transformative"] || row["Iteration"] || "",
    generativePrimary:
      row["Generative (Primary)"] || row["Generative"] || row["Primary"] || "",
  }));

  // AI principles
  const principlesSection = extractSection(content, "AI\\s*Principles", 3);
  const principles = principlesSection
    ? principlesSection
        .split("\n")
        .filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
    : [];

  // ESF integration
  let esfIntegration = undefined;
  if (metadata.hasESF) {
    const fiveQSection = extractSection(content, "Five\\s*Questions", 3);
    const fiveQuestions = [];
    const fqLines = fiveQSection
      .split("\n")
      .filter((l) => l.trim().startsWith("-") || /^\d+\./.test(l.trim()));
    for (const line of fqLines) {
      const cleaned = line.replace(/^[-*\d.]\s*/, "").trim();
      const parts = cleaned.split(/[:\u2014\u2013]/).map((s) => s.trim());
      if (parts.length >= 2) {
        fiveQuestions.push({ question: parts[0], whatItTests: parts[1] });
      } else if (parts[0]) {
        fiveQuestions.push({ question: parts[0], whatItTests: "" });
      }
    }

    const rorSection = extractSection(
      content,
      "Records?\\s*of\\s*Resistance",
      3
    );
    const rorMinimums = {};
    const rorMatches = rorSection.matchAll(
      /P(\d)\s*[:=]\s*(\d+)/gi
    );
    for (const m of rorMatches) {
      rorMinimums[`p${m[1]}`] = parseInt(m[2], 10);
    }

    const cewTable = extractTable(
      content,
      "#+\\s*Content\\s*Epistemic\\s*Weight"
    );
    const contentEpistemicWeight = cewTable.map((row) => ({
      weight: row["Weight"] || row["Level"] || "",
      covers: row["Covers"] || row["Content"] || row["Scope"] || "",
      yourRole: row["Your Role"] || row["Role"] || row["Faculty Role"] || "",
    }));

    esfIntegration = {
      isActive: true,
      fiveQuestions:
        fiveQuestions.length > 0
          ? fiveQuestions
          : [
              { question: "Can I defend this?", whatItTests: "Ownership" },
              {
                question: "Is this mine?",
                whatItTests: "Intellectual contribution",
              },
              { question: "Did I verify?", whatItTests: "Accuracy" },
              { question: "Would I teach this?", whatItTests: "Understanding" },
              {
                question: "Is the disclosure honest?",
                whatItTests: "Transparency",
              },
            ],
      recordsOfResistanceMinimums:
        Object.keys(rorMinimums).length > 0
          ? rorMinimums
          : { p2: 1, p3: 3 },
      contentEpistemicWeight,
    };
  }

  return {
    metadata,
    learningOutcomes,
    courseStructure: { units },
    grading: { components: gradingComponents },
    policies: {
      aiUse: { unitProgression, projectMatrix, principles },
      lateWork: lateWork.replace(/\n/g, " ").trim(),
      attendance: attendance.replace(/\n/g, " ").trim(),
    },
    esfIntegration,
  };
}

function parseWeekFiles() {
  const pattern = path.join(VAULT_PATH, "modules/**/week-*.md");
  const files = readAllMarkdown(pattern);
  const weeks = [];

  for (const file of files) {
    const fm = file.data;
    const content = file.content;

    const weekNumber = fm.week || parseInt(file.path.match(/week-(\d+)/)?.[1] || "0", 10);
    if (!weekNumber) continue;

    const unitMatch = (fm.unit || "").match(/(\d+)\s*[-:]\s*(.*)/);
    const unitNumber = unitMatch ? parseInt(unitMatch[1], 10) : 0;
    const unitName = unitMatch ? unitMatch[2].trim() : fm.unit || "";

    // Extract overview: the paragraph(s) after the week title, before first ##
    const overviewMatch = content.match(
      /^#\s+Week\s+\d+[^\n]*\n+([\s\S]*?)(?=\n##\s)/
    );
    const overview = overviewMatch
      ? overviewMatch[1]
          .split("\n\n")
          .map((p) => p.replace(/\n/g, " ").replace(/\*\*/g, "").trim())
          .filter(Boolean)
          .slice(0, 2)
          .join(" ")
      : "";

    // Extract sessions
    const sessionBlocks = content.split(/\n##\s+Session\s+(\d+)/);
    const sessions = [];

    for (let i = 1; i < sessionBlocks.length; i += 2) {
      const sessionNum = parseInt(sessionBlocks[i], 10);
      const block = sessionBlocks[i + 1] || "";

      // Session title from first line: ": Title" or first heading
      const titleMatch = block.match(/^:\s*(.+)/);
      const sessionTitle = titleMatch
        ? titleMatch[1].trim()
        : block.match(/^[^\n]+/)?.[0]?.replace(/^[:#\s]+/, "").trim() || "";

      // Extract objectives
      const objSection = extractSection(block, "Objectives?", 3);
      const objectives = objSection
        .split("\n")
        .filter((l) => l.trim().startsWith("-"))
        .map((l) => l.replace(/^-\s*/, "").trim());

      // Extract flow / activities
      const flowSection = extractSection(block, "Flow", 3);
      const activities = parseActivities(flowSection);

      sessions.push({
        sessionNumber: sessionNum,
        sessionTitle: sessionTitle.replace(/\*\*/g, ""),
        totalDuration: activities.length > 0 ? totalDuration(activities) : undefined,
        activities,
      });
    }

    // Extract deliverables from "What to Collect" or "Deliverables" sections
    const deliverables = [];
    const delivSection =
      extractSection(content, "What\\s*to\\s*Collect", 3) ||
      extractSection(content, "Deliverables?", 3);
    if (delivSection) {
      const items = delivSection
        .split("\n")
        .filter(
          (l) => l.trim().startsWith("-") || l.trim().startsWith("*")
        )
        .map((l) => l.replace(/^[-*]\s*/, "").trim());
      for (const item of items) {
        deliverables.push({ deliverable: item });
      }
    }

    // Extract Looking Ahead
    const lookingAheadSection =
      extractSection(content, "Looking\\s*Ahead", 3) ||
      extractSection(content, "Looking\\s*Ahead", 2);
    const lookingAhead = lookingAheadSection
      ? lookingAheadSection
          .split("\n")
          .filter((l) => l.trim().startsWith("-"))
          .map((l) => l.replace(/^-\s*/, "").trim())
          .join(" ")
      || lookingAheadSection.replace(/\n/g, " ").trim()
      : undefined;

    // Extract callouts (blockquotes)
    const callouts = [];
    const blockquotes = content.match(/^>\s*.+/gm) || [];
    for (const bq of blockquotes) {
      const text = bq.replace(/^>\s*/, "").trim();
      if (!text) continue;
      let type = "context";
      if (/principle|key\s*point|remember/i.test(text)) type = "principle";
      if (/warning|caution|do\s*not/i.test(text)) type = "warning";
      callouts.push({ type, content: text });
    }

    // Extract learning objectives from first session or week-level
    const learningObjectives = [];
    if (sessions.length > 0) {
      // Get objectives from session blocks
      for (const sBlock of content.split(/\n##\s+Session/).slice(1)) {
        const objSec = extractSection(sBlock, "Objectives?", 3);
        const objs = objSec
          .split("\n")
          .filter((l) => l.trim().startsWith("-"))
          .map((l) => l.replace(/^-\s*/, "").trim());
        learningObjectives.push(...objs);
      }
    }

    weeks.push({
      weekNumber,
      unitNumber,
      unitName,
      theme: fm.theme || "",
      overview,
      learningObjectives: [...new Set(learningObjectives)],
      sessions,
      deliverables,
      callouts: callouts.length > 0 ? callouts : undefined,
      lookingAhead: lookingAhead || undefined,
    });
  }

  return weeks.sort((a, b) => a.weekNumber - b.weekNumber);
}

function parseProjects() {
  const pattern = path.join(VAULT_PATH, "projects/project-*/00-brief.md");
  const files = readAllMarkdown(pattern);
  const projects = [];

  for (const file of files) {
    const fm = file.data;
    const content = file.content;
    const projectNumber = fm.project || parseInt(file.path.match(/project-(\d+)/)?.[1] || "0", 10);

    // Parse weeks range
    const weeksStr = String(fm.weeks || "");
    const weekNums = [];
    const rangeMatch = weeksStr.match(/(\d+)\s*to\s*(\d+)/);
    if (rangeMatch) {
      for (let w = parseInt(rangeMatch[1]); w <= parseInt(rangeMatch[2]); w++) {
        weekNums.push(w);
      }
    }

    // Overview: first paragraph after # heading
    const overviewMatch = content.match(
      /^#[^\n]+\n+(?:##\s*Overview\s*\n+)?([\s\S]*?)(?=\n##\s)/
    );
    const overview = overviewMatch
      ? overviewMatch[1]
          .split("\n\n")[0]
          .replace(/\n/g, " ")
          .replace(/\*\*/g, "")
          .trim()
      : "";

    // Deliverables section
    const delivSection = extractSection(content, "Deliverables?", 2);
    const deliverables = [];
    // Look for ### numbered deliverables
    const delivHeaders = delivSection.match(
      /###\s*\d+\.\s*(.+)/g
    );
    if (delivHeaders) {
      for (const h of delivHeaders) {
        deliverables.push(h.replace(/^###\s*\d+\.\s*/, "").trim());
      }
    } else {
      // Fallback: bullet list
      const items = delivSection
        .split("\n")
        .filter((l) => l.trim().startsWith("-"))
        .map((l) => l.replace(/^-\s*/, "").trim());
      deliverables.push(...items);
    }

    // Assessment criteria from Grading section
    const gradingSection =
      extractSection(content, "Grading", 2) ||
      extractSection(content, "Assessment", 2);
    const assessmentCriteria = [];
    // Look for learning outcome references
    const loMatches = gradingSection.match(/Learning Outcome \d+[^)]*\)/g) || [];
    assessmentCriteria.push(...loMatches);
    // Also collect bullet points
    const gradingBullets = gradingSection
      .split("\n")
      .filter((l) => l.trim().startsWith("-"))
      .map((l) => l.replace(/^-\s*/, "").trim());
    assessmentCriteria.push(...gradingBullets);

    // AI use
    const aiUseStr = String(fm["ai-use"] || "");
    const allowed = !/prohibited|no\s*ai|not\s*allowed/i.test(aiUseStr);
    const required = /required/i.test(aiUseStr);
    const aiUse = {
      allowed,
      required: required || undefined,
      restrictions: aiUseStr || undefined,
    };

    // Resources from companion file
    const resourcesFile = file.path.replace("00-brief.md", "resources.md");
    const resources = [];
    if (fs.existsSync(resourcesFile)) {
      const resContent = fs.readFileSync(resourcesFile, "utf-8");
      // Extract links: [title](url) or - title: description
      const linkMatches = resContent.matchAll(
        /\[([^\]]+)\]\(([^)]+)\)/g
      );
      for (const m of linkMatches) {
        resources.push({ title: m[1], url: m[2] });
      }
      // Bullet items without links
      const bullets = resContent
        .split("\n")
        .filter(
          (l) =>
            (l.trim().startsWith("-") || l.trim().startsWith("*")) &&
            !l.includes("](")
        )
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
      for (const b of bullets) {
        if (!resources.some((r) => r.title === b)) {
          resources.push({ title: b });
        }
      }
    }

    // Sample work from companion file
    const sampleFile = file.path.replace("00-brief.md", "sample-deliverables.md");
    const sampleWork = [];
    if (fs.existsSync(sampleFile)) {
      const sampleContent = fs.readFileSync(sampleFile, "utf-8");
      const examples = sampleContent.split(/\n###?\s/).filter(Boolean);
      for (const ex of examples.slice(1)) {
        const firstLine = ex.split("\n")[0].trim();
        const desc = ex
          .split("\n")
          .slice(1)
          .join(" ")
          .replace(/\*\*/g, "")
          .trim()
          .slice(0, 300);
        if (firstLine) {
          sampleWork.push({ type: firstLine, description: desc });
        }
      }
    }

    projects.push({
      projectNumber,
      projectTitle: fm.title || "",
      overview,
      weight: String(fm.weight || ""),
      weeks: weekNums,
      dueDate: String(fm.due || ""),
      aiUse,
      deliverables,
      assessmentCriteria: assessmentCriteria.filter(Boolean),
      resources,
      sampleWork: sampleWork.length > 0 ? sampleWork : undefined,
    });
  }

  return projects.sort((a, b) => a.projectNumber - b.projectNumber);
}

function parseTemplates() {
  const templatesDir = path.join(VAULT_PATH, "projects/shared-templates");
  const templates = {};

  // Position Statement
  const psFile = path.join(templatesDir, "position-statement-template.md");
  if (fs.existsSync(psFile)) {
    const content = fs.readFileSync(psFile, "utf-8");
    const elements = [];
    const matches = content.match(/###?\s*\d*\.?\s*(.+)/g) || [];
    for (const m of matches) {
      const el = m.replace(/^###?\s*\d*\.?\s*/, "").trim();
      if (el && !el.toLowerCase().includes("position statement")) {
        elements.push(el);
      }
    }
    templates.positionStatement = {
      elements:
        elements.length > 0
          ? elements
          : ["My stance", "What matters most", "What I will not compromise"],
    };
  }

  // AI Use Log
  const logFile = path.join(templatesDir, "ai-use-log-template.md");
  if (fs.existsSync(logFile)) {
    const content = fs.readFileSync(logFile, "utf-8");
    const sections = [];
    const headings = content.match(/^##\s+(.+)/gm) || [];
    for (const h of headings) {
      sections.push(h.replace(/^##\s+/, "").trim());
    }
    templates.aiUseLog = {
      sections:
        sections.length > 0
          ? sections
          : [
              "Position Statement",
              "Session Log",
              "Records of Resistance",
              "Five Questions",
              "Contribution Summary",
            ],
    };
  }

  // Record of Resistance (embedded in AI Use Log or standalone)
  templates.recordOfResistance = {
    fields: [
      "What AI suggested",
      "Why I rejected or revised it",
      "What I did instead",
    ],
  };

  return templates;
}

function buildCourseMap(weeks, projects) {
  return weeks.map((w) => {
    const activeProject = projects.find((p) =>
      p.weeks.includes(w.weekNumber)
    );
    const keyDeliverable =
      w.deliverables.length > 0
        ? w.deliverables.map((d) => d.deliverable).join(", ")
        : "";
    return {
      week: w.weekNumber,
      unit: w.unitName,
      theme: w.theme,
      activeProject: activeProject
        ? `P${activeProject.projectNumber}`
        : "",
      keyDeliverable,
    };
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function compile() {
  console.log(`Compiling course data from: ${VAULT_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);

  const syllabusData = parseSyllabus();
  const weeks = parseWeekFiles();
  const projects = parseProjects();
  const templates = parseTemplates();
  const courseMap = buildCourseMap(weeks, projects);

  console.log(`  Weeks compiled: ${weeks.length}`);
  console.log(`  Projects compiled: ${projects.length}`);
  console.log(
    `  Sessions total: ${weeks.reduce((s, w) => s + w.sessions.length, 0)}`
  );

  // Merge with existing JSON to preserve hand-curated fields
  let existing = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    } catch {
      // Ignore parse errors
    }
  }

  // Build the output, merging existing data for fields the parser may miss
  const courseData = {
    metadata: {
      ...existing.metadata,
      ...syllabusData.metadata,
    },
    learningOutcomes:
      syllabusData.learningOutcomes?.length > 0
        ? syllabusData.learningOutcomes
        : existing.learningOutcomes || [],
    courseStructure:
      syllabusData.courseStructure?.units?.length > 0
        ? syllabusData.courseStructure
        : existing.courseStructure || { units: [] },
    grading:
      syllabusData.grading?.components?.length > 0
        ? syllabusData.grading
        : existing.grading || { components: [] },
    courseMap: courseMap.length > 0 ? courseMap : existing.courseMap || [],
    weeks: weeks.length > 0 ? mergeWeeks(existing.weeks || [], weeks) : existing.weeks || [],
    projects:
      projects.length > 0
        ? mergeProjects(existing.projects || [], projects)
        : existing.projects || [],
    templates: { ...existing.templates, ...templates },
    policies: mergePolicies(existing.policies, syllabusData.policies),
    ...(syllabusData.esfIntegration
      ? { esfIntegration: { ...existing.esfIntegration, ...syllabusData.esfIntegration } }
      : existing.esfIntegration
      ? { esfIntegration: existing.esfIntegration }
      : {}),
    ...(existing.vocabulary ? { vocabulary: existing.vocabulary } : {}),
    ...(existing.researchFoundations
      ? { researchFoundations: existing.researchFoundations }
      : {}),
  };

  // Write output
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(courseData, null, 2) + "\n");
  console.log("  Done.");
}

/** Merge parsed weeks with existing, preferring parsed for structural fields. */
function mergeWeeks(existing, parsed) {
  return parsed.map((pw) => {
    const ew = existing.find((e) => e.weekNumber === pw.weekNumber);
    if (!ew) return pw;
    return {
      ...ew,
      ...pw,
      // Prefer existing overview if parser produced empty one
      overview: pw.overview || ew.overview,
      // Prefer existing learning objectives if parser found none
      learningObjectives:
        pw.learningObjectives.length > 0
          ? pw.learningObjectives
          : ew.learningObjectives || [],
      // Prefer parsed sessions (structural), but fall back to existing
      sessions: pw.sessions.length > 0 ? pw.sessions : ew.sessions || [],
      // Prefer existing deliverables if they are richer
      deliverables:
        pw.deliverables.length > 0 && pw.deliverables.length >= (ew.deliverables?.length || 0)
          ? pw.deliverables
          : ew.deliverables || pw.deliverables,
      // Merge callouts
      callouts: pw.callouts || ew.callouts,
      lookingAhead: pw.lookingAhead || ew.lookingAhead,
    };
  });
}

/** Merge parsed projects with existing. */
function mergeProjects(existing, parsed) {
  return parsed.map((pp) => {
    const ep = existing.find((e) => e.projectNumber === pp.projectNumber);
    if (!ep) return pp;
    return {
      ...ep,
      ...pp,
      overview: pp.overview || ep.overview,
      deliverables:
        pp.deliverables.length > 0 ? pp.deliverables : ep.deliverables || [],
      assessmentCriteria:
        pp.assessmentCriteria.length > 0
          ? pp.assessmentCriteria
          : ep.assessmentCriteria || [],
      resources: pp.resources.length > 0 ? pp.resources : ep.resources || [],
      sampleWork: pp.sampleWork || ep.sampleWork,
    };
  });
}

/** Merge policies, preferring non-empty parsed values. */
function mergePolicies(existing, parsed) {
  if (!existing && !parsed) return { aiUse: { unitProgression: [], projectMatrix: [], principles: [] }, lateWork: "", attendance: "" };
  if (!existing) return parsed;
  if (!parsed) return existing;
  return {
    aiUse: {
      unitProgression:
        parsed.aiUse?.unitProgression?.length > 0
          ? parsed.aiUse.unitProgression
          : existing.aiUse?.unitProgression || [],
      projectMatrix:
        parsed.aiUse?.projectMatrix?.length > 0
          ? parsed.aiUse.projectMatrix
          : existing.aiUse?.projectMatrix || [],
      principles:
        parsed.aiUse?.principles?.length > 0
          ? parsed.aiUse.principles
          : existing.aiUse?.principles || [],
    },
    lateWork: parsed.lateWork || existing.lateWork || "",
    attendance: parsed.attendance || existing.attendance || "",
  };
}

compile();
