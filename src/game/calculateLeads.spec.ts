import { test, expect } from "vitest";
import { calculateLeads } from "./calculateLeads";
import { Color } from "./types";

const B = "blue";
const R = "red";
const G = "green";
const Y = "yellow";
const O = "orange";

test.each([
  [[Y, Y, Y, Y], [Y, Y, Y, Y], 4, 0],
  [[Y, Y, Y, G], [Y, Y, Y, Y], 3, 0],
  [[Y, Y, G, G], [Y, Y, Y, Y], 2, 0],
  [[Y, G, G, G], [Y, Y, Y, Y], 1, 0],
  [[G, G, G, G], [Y, Y, Y, Y], 0, 0],
  [[Y, Y, G, G], [O, O, Y, O], 0, 1],
  [[Y, Y, G, G], [O, Y, Y, O], 1, 1],
  [[Y, Y, B, B], [O, Y, O, O], 1, 0],
  [[G, Y, B, G], [R, B, G, B], 0, 2], // bug
])(
  "calculate(%j, %j): {position: %d, color: %d }",
  (goal, request, position, color) => {
    const leads = calculateLeads(goal as Color[], request as Color[]);
    expect(leads.position).toBe(position);
    expect(leads.color).toBe(color);
  }
);
