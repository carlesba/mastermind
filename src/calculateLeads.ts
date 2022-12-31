import { Color, Guess, Lead } from "./types";

export function calculateLeads(goal: Color[], guess: Guess): Lead {
  let positionIndexes = new Set<number>();
  let colorIndexes = new Set<number>();
  guess
    .filter((color, index) => {
      if (color === goal[index]) {
        positionIndexes.add(index);
        return false;
      }
      return true;
    })
    .forEach((color) => {
      goal.find((c, i) => {
        if (!positionIndexes.has(i) && c === color) {
          colorIndexes.add(i)
        }
      });
    });
  return {
    position: positionIndexes.size,
    color: colorIndexes.size,
  };
}
