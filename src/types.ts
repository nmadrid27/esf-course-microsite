export interface CourseData {
  metadata: CourseMetadata
  learningOutcomes: LearningOutcome[]
  courseStructure: CourseStructure
  grading: Grading
  courseMap: CourseMapEntry[]
  weeks: Week[]
  projects: Project[]
  templates: Templates
  policies: Policies
  esfIntegration?: EsfIntegration
  vocabulary?: VocabularyEntry[]
  researchFoundations?: ResearchEntry[]
}

export interface CourseMetadata {
  courseCode: string
  courseTitle: string
  quarter: string
  year: number
  instructor: string
  courseDescription: string
  totalWeeks: number
  hasESF: boolean
  prerequisites?: string
  program?: string
  modality?: string
}

export interface LearningOutcome {
  id: number
  outcome: string
}

export interface CourseStructure {
  units: Unit[]
  cognitiveProgression?: string
}

export interface Unit {
  unitNumber: number
  unitName: string
  weeks: number[]
  theme: string
  aiPresent: boolean
  description?: string
}

export interface Grading {
  components: GradingComponent[]
}

export interface GradingComponent {
  component: string
  weight: number
  description: string
  dueWeek?: number
}

export interface CourseMapEntry {
  week: number
  unit: string
  theme: string
  activeProject: string
  keyDeliverable: string
}

export interface Week {
  weekNumber: number
  unitNumber: number
  unitName: string
  theme: string
  overview: string
  learningObjectives: string[]
  sessions: Session[]
  deliverables: Deliverable[]
  callouts?: Callout[]
  lookingAhead?: string
}

export interface Session {
  sessionNumber: number
  sessionTitle: string
  totalDuration?: string
  activities: Activity[]
}

export interface Activity {
  activityName: string
  duration: string
  description: string
}

export interface Deliverable {
  deliverable: string
  dueDate?: string
  format?: string
  weight?: string
}

export interface Callout {
  type: "principle" | "warning" | "context"
  content: string
}

export interface Project {
  projectNumber: number
  projectTitle: string
  overview: string
  weight: string
  weeks: number[]
  dueDate: string
  aiUse: AiUse
  deliverables: string[]
  assessmentCriteria: string[]
  resources: Resource[]
  sampleWork?: SampleWork[]
  toolkitRepo?: string
}

export interface Resource {
  title: string
  url?: string
  description?: string
}

export interface SampleWork {
  type: string
  student?: string
  medium?: string
  description: string
}

export interface AiUse {
  allowed: boolean
  required?: boolean
  restrictions?: string
  roleOptions?: string[]
  documentationRequired?: string[]
}

export interface Templates {
  positionStatement?: TemplateDetail
  aiUseLog?: TemplateDetail
  recordOfResistance?: TemplateDetail
  examples?: Record<string, unknown>
}

export interface TemplateDetail {
  elements?: string[]
  sections?: string[]
  fields?: string[]
  description?: string
}

export interface Policies {
  aiUse: AiUsePolicy
  lateWork: string
  attendance: string
}

export interface AiUsePolicy {
  unitProgression: UnitProgression[]
  projectMatrix: ProjectMatrix[]
  principles: string[]
}

export interface UnitProgression {
  unit: string
  weeks: string
  aiStatus: string
  guidance: string
}

export interface ProjectMatrix {
  project: string
  consultative: string
  transformative: string
  generativePrimary: string
}

export interface EsfIntegration {
  isActive: boolean
  twoLayers?: { layer: string; governs: string; tools: string[] }[]
  fiveQuestions: { question: string; whatItTests: string }[]
  recordsOfResistanceMinimums: Record<string, number>
  contentEpistemicWeight: { weight: string; covers: string; yourRole: string }[]
}

export interface VocabularyEntry {
  term: string
  definition: string
  whereItGrows: string
}

export interface ResearchEntry {
  source: string
  keyFinding: string
  courseUse: string
}
