const NO_STAGE = "__none__";
function computeUnlockedStages(stages, items, progress, checklistId) {
  const unlocked = /* @__PURE__ */ new Set();
  const ordered = [
    { key: NO_STAGE, order: -1 },
    ...(stages ?? []).slice().sort((a, b) => a.order - b.order)
  ];
  const progByKey = new Map(
    progress.filter((p) => p.checklist_id === checklistId).map((p) => [p.item_key, p])
  );
  let blocked = false;
  for (const s of ordered) {
    if (blocked) break;
    unlocked.add(s.key);
    const stageItems = items.filter(
      (it) => (s.key === NO_STAGE ? !it.stage : it.stage === s.key) && it.required
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
const STAGE_NONE_KEY = NO_STAGE;
export {
  STAGE_NONE_KEY,
  computeUnlockedStages
};
