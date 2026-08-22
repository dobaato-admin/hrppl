const REJECTED = "rejected";
const APPROVED = "approved";
function computeOnboardingCompletion(checklists, progress) {
  const byKey = /* @__PURE__ */ new Map();
  for (const p of progress) byKey.set(`${p.checklist_id}:${p.item_key}`, p);
  let totalRequired = 0;
  let doneRequired = 0;
  let awaitingReview = 0;
  const rejected = [];
  for (const cl of checklists) {
    for (const item of cl.items ?? []) {
      const row = byKey.get(`${cl.id}:${item.key}`);
      const isRejected = row?.approval_status === REJECTED;
      if (isRejected) rejected.push({ checklistId: cl.id, itemKey: item.key });
      if (row && !isRejected && row.approval_status !== APPROVED) awaitingReview++;
      if (!item.required) continue;
      totalRequired++;
      if (row && !isRejected) doneRequired++;
    }
  }
  const percent = totalRequired > 0 ? Math.round(doneRequired / totalRequired * 100) : 0;
  return {
    totalRequired,
    doneRequired,
    percent,
    complete: totalRequired > 0 && doneRequired === totalRequired,
    rejected,
    awaitingReview
  };
}
export {
  computeOnboardingCompletion
};
