import { test, expect } from "vitest";
import { calculateLeads } from "./calculateLeads";
import { Color } from "./types";

function testGuess(
  description: string,
  goal: Color[],
  guess: Color[],
  position: number,
  color: number
) {
  test(description, () => {
    const lead = calculateLeads(goal, guess);
    expect(lead).toEqual({
      color,
      position,
    });
  });
}

testGuess(
  "none",
  ["green", "green", "green", "green"],
  ["blue", "blue", "blue", "blue"],
  0,
  0
);

testGuess(
  "match",
  ["green", "green", "green", "green"],
  ["green", "green", "green", "green"],
  4,
  0
);

testGuess(
  "all color",
  ["green", "green", "blue", "blue"],
  ["blue", "blue", "green", "green"],
  0,
  4
);

testGuess(
  "bug 1",
  ["green", "blue", "red", "blue"],
  ["blue", "blue", "green", "red"],
  1,
  3
);

testGuess(
  "bug 2",
  ["yellow", "yellow", "red", "red"],
  ["yellow", "red", "yellow", "yellow"],
  1,
  2,
);

testGuess(
  "bug 3",
  ["blue", "green", "red", "yellow"],
  ["green", "yellow", "green", "blue"],
  0,
  3,
);
