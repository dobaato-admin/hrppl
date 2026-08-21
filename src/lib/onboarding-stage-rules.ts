// Shared stage progression rules for onboarding checklists.
// A stage is "unlocked" when every required item in every earlier stage is
// either completed (and not rejected) or approved.

export interface StageDef { key: string; label: string; order: number }
export interface ItemDef { key: string; label: string; required: boolean; stage?: string | null }
export interface ProgressDef { checklist_id: string; item_key: string; approval_status?: string | null }

const NO_STAGE = "__none__";

export function stageOrder(stages: StageDef[] | undefined, stageKey: string | null | undefined): number {
  if (!stageKey) return -1; // items without a stage come first
  const s = (stages ?? []).find((x) => x.key === stageKey);
  return s ? s.order : -1;
}

/** Return the set of stage keys (including NO_STAGE sentinel) whose
 * prerequisites are satisfied. */
export function computeUnlockedStages(
  stages: StageDef[] | undefined,
  items: ItemDef[],
  progress: ProgressDef[],
  checklistId: string,
): Set<string> {
  const unlocked = new Set<string>();
  const ordered = [
    { key: NO_STAGE, order: -1 },
    ...((stages ?? []).slice().sort((a, b) => a.order - b.order)),
  ];
  const progByKey = new Map(
    progress
      .filter((p) => p.checklist_id === checklistId)
      .map((p) => [p.item_key, p]),
  );
  let blocked = false;
  for (const s of ordered) {
    if (blocked) break;
    unlocked.add(s.key);
    // Check whether this stage's required items are satisfied to allow next stage.
    const stageItems = items.filter(
      (it) => (s.key === NO_STAGE ? !it.stage : it.stage === s.key) && it.required,
    );
    const allSatisfied = stageItems.every((it) => {
      const p = progByKey.get(it.key);
      if (!p) return false;
      return p.approval_status !== "rejected";
    });
    if (!allSatisfied) blocked = true;
  }
  return unlocked;
}

export function isStageUnlocked(
  stages: StageDef[] | undefined,
  items: ItemDef[],
  progress: ProgressDef[],
  checklistId: string,
  stageKey: string | null | undefined,
): boolean {
  const unlocked = computeUnlockedStages(stages, items, progress, checklistId);
  return unlocked.has(stageKey || NO_STAGE);
}

export const STAGE_NONE_KEY = NO_STAGE;
