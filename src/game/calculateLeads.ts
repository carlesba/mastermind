import { Color, Guess, Lead } from "./types";

export const calculateLeads = (goal: Color[], request: Guess): Lead => {
  const positionMatches: number[] = [];
  const pending: number[] = [];

  goal.forEach((target, index) => {
    if (target === request[index]) {
      positionMatches.push(index);
    } else {
      pending.push(index);
    }
  });

  let pendingColors: any[] = pending.map((index) => request[index]);
  const colorMatches = [];
  pending.forEach((index) => {
    const target = goal[index];
    const matchIndex = pendingColors.findIndex((color) => target === color);
    if (matchIndex >= 0) {
      pendingColors[matchIndex] = "";
      colorMatches.push(matchIndex);
    }
  });

  return { position: positionMatches.length, color: colorMatches.length };
};
