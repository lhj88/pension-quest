export type WeightedParticipant = {
  id: string;
  name: string;
  tickets: number;
};

type SortablePrize = {
  sort_order: number;
  created_at: string;
};

type SelectWeightedWinnersInput = {
  participants: WeightedParticipant[];
  totalSlots: number;
  allowDuplicateWinners: boolean;
  rng?: () => number;
};

export function sortPrizesForDraw<TPrize extends SortablePrize>(
  prizes: TPrize[],
): TPrize[] {
  return [...prizes].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}

export function selectWeightedWinners({
  participants,
  totalSlots,
  allowDuplicateWinners,
  rng = Math.random,
}: SelectWeightedWinnersInput): WeightedParticipant[] {
  if (totalSlots <= 0) {
    return [];
  }

  const pool = participants
    .filter((participant) => participant.tickets > 0)
    .map((participant) => ({ ...participant }));
  const winners: WeightedParticipant[] = [];

  while (winners.length < totalSlots && pool.length > 0) {
    const totalTickets = pool.reduce(
      (sum, participant) => sum + participant.tickets,
      0,
    );

    if (totalTickets <= 0) {
      break;
    }

    const target = rng() * totalTickets;
    let cursor = 0;
    let selectedIndex = pool.length - 1;

    for (let index = 0; index < pool.length; index += 1) {
      cursor += pool[index].tickets;
      if (target < cursor) {
        selectedIndex = index;
        break;
      }
    }

    const selected = pool[selectedIndex];
    winners.push(selected);

    if (!allowDuplicateWinners) {
      pool.splice(selectedIndex, 1);
    }
  }

  return winners;
}
