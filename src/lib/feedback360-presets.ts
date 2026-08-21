/**
 * Recommended starter templates for 360° reviews. Org admins can pick one,
 * customize the questions, and save — or start from scratch instead.
 */
export interface PresetQuestion {
  id: string;
  label: string;
  type: "rating" | "text";
  required: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
}

export interface FeedbackPreset {
  key: string;
  name: string;
  description: string;
  questions: PresetQuestion[];
}

const r = (id: string, label: string, required = true): PresetQuestion => ({
  id, label, type: "rating", required,
  scaleMin: 1, scaleMax: 5, scaleLabels: ["Rarely", "Consistently"],
});
const t = (id: string, label: string, required = false): PresetQuestion => ({
  id, label, type: "text", required,
});

export const FEEDBACK_PRESETS: FeedbackPreset[] = [
  {
    key: "peer-collaboration",
    name: "Peer collaboration (recommended)",
    description: "Balanced peer feedback covering communication, teamwork, and impact.",
    questions: [
      r("q1", "Communicates clearly and listens actively"),
      r("q2", "Collaborates effectively across the team"),
      r("q3", "Delivers high-quality work on time"),
      r("q4", "Supports colleagues and shares knowledge"),
      t("q5", "What does this person do especially well?"),
      t("q6", "One thing they could improve"),
    ],
  },
  {
    key: "manager-effectiveness",
    name: "Manager effectiveness (upward)",
    description: "For direct reports to give feedback on their manager.",
    questions: [
      r("q1", "Sets clear expectations and priorities"),
      r("q2", "Gives useful, timely feedback"),
      r("q3", "Removes blockers and advocates for the team"),
      r("q4", "Supports my growth and development"),
      r("q5", "Treats team members fairly and with respect"),
      t("q6", "What should they keep doing?"),
      t("q7", "What should they start or stop doing?"),
    ],
  },
  {
    key: "leadership",
    name: "Leadership & influence",
    description: "For senior ICs and leads — strategy, influence, and judgement.",
    questions: [
      r("q1", "Sets a clear technical or strategic direction"),
      r("q2", "Influences without authority"),
      r("q3", "Makes sound, timely decisions"),
      r("q4", "Develops others through mentoring"),
      t("q5", "Strongest example of their leadership in this period"),
      t("q6", "Where could their leadership grow?"),
    ],
  },
  {
    key: "project-retro",
    name: "Project retrospective",
    description: "Lightweight feedback at the end of a project or sprint.",
    questions: [
      r("q1", "Contributed meaningfully to project outcomes"),
      r("q2", "Communicated progress and risks early"),
      t("q3", "What went well working with this person?"),
      t("q4", "What would you change next time?"),
    ],
  },
  // ─────────── Education Agent industry ───────────
  {
    key: "edu-counsellor-360",
    name: "Education Counsellor — 360° (Education Agent)",
    description: "Peer/manager/client-facing 360° for counsellors and admission officers at an education agency.",
    questions: [
      r("q1", "Demonstrates deep knowledge of providers, courses and visa pathways"),
      r("q2", "Conducts honest, ethical and GTE-compliant counselling"),
      r("q3", "Responsive and proactive with student communications"),
      r("q4", "Collaborates well with admissions, migration and documentation teams"),
      r("q5", "Handles difficult conversations professionally"),
      r("q6", "Embodies brand values in every interaction"),
      t("q7", "One thing this person does exceptionally well"),
      t("q8", "One thing this person could improve"),
    ],
  },
  {
    key: "edu-manager-360",
    name: "Education Agent Manager — 360°",
    description: "Upward & peer 360° for branch / admissions / migration managers at an education agency.",
    questions: [
      r("q1", "Sets clear sales / case targets and removes blockers"),
      r("q2", "Coaches and develops team members"),
      r("q3", "Drives accountability while supporting wellbeing"),
      r("q4", "Ensures compliance with ESOS, National Code and MARA"),
      r("q5", "Communicates strategy clearly across teams"),
      r("q6", "Makes data-informed decisions"),
      r("q7", "Represents the brand professionally with partners and clients"),
      t("q8", "Strengths to amplify"),
      t("q9", "Opportunities for growth"),
    ],
  },
  {
    key: "edu-migration-rma-360",
    name: "Migration Agent (RMA) — 360°",
    description: "360° for registered migration agents and case officers.",
    questions: [
      r("q1", "Maintains rigorous OMARA Code of Conduct and privacy standards"),
      r("q2", "Produces accurate, well-documented case files"),
      r("q3", "Communicates clearly with clients about timelines and expectations"),
      r("q4", "Handles escalations and complex cases calmly"),
      r("q5", "Collaborates with admissions and front-desk teams on handovers"),
      t("q6", "A standout example of their professional judgement"),
      t("q7", "One area to strengthen"),
    ],
  },
];

export function getPreset(key: string): FeedbackPreset | undefined {
  return FEEDBACK_PRESETS.find((p) => p.key === key);
}

