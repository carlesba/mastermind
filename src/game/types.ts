export const ALL_COLORS = ["blue", "green", "red", "yellow", "orange"] as const;

export type Color = typeof ALL_COLORS[number];
export type Choice = Color | "void";

export type Lead = {
  position: number;
  color: number;
};

export type Guess = Color[];
export type Line = Choice[];

export type GameStatus = "idle" | "on" | "lose" | "win";


