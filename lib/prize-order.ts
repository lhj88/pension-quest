export type PrizeSortOrderUpdate = {
  id: string;
  sort_order: number;
};

export function reorderPrizeIds(
  ids: string[],
  {
    activeId,
    overId,
  }: {
    activeId: string;
    overId: string;
  },
): string[] {
  if (activeId === overId) {
    return ids;
  }

  const activeIndex = ids.indexOf(activeId);
  const overIndex = ids.indexOf(overId);

  if (activeIndex < 0 || overIndex < 0) {
    return ids;
  }

  const nextIds = [...ids];
  const [active] = nextIds.splice(activeIndex, 1);
  nextIds.splice(overIndex, 0, active);

  return nextIds;
}

export function createPrizeSortOrderUpdates(
  ids: string[],
): PrizeSortOrderUpdate[] {
  return ids
    .filter((id, index, allIds) => id && allIds.indexOf(id) === index)
    .map((id, index) => ({
      id,
      sort_order: (index + 1) * 10,
    }));
}
