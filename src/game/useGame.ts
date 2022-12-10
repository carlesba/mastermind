import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { match } from "ts-pattern";
import {
  ALL_COLORS,
  Choice,
  Color,
  GameStatus,
  Guess,
  Lead,
  Line,
} from "./types";

type GameState = {
  goal: Color[];
  attempts: Guess[];
  leads: Lead[];
  status: GameStatus;
  current: number;
};

export const useGame = (params: { size: number; maxAttempts: number }) => {
  const [store, setStore] = createStore<GameState>({
    current: 0,
    goal: [],
    attempts: [],
    leads: [],
    status: "idle",
  });

  const lineEditor = useLineEditor(params.size);

  const emptyAttempt = (): Choice[] =>
    Array.from({ length: params.size }, () => "void");

  const start = () => {
    const newGoal = createGoal(params.size);
    setStore({
      current: 0,
      goal: newGoal,
      attempts: [],
      leads: [],
      status: "on",
    });
  };

  const submit = () => {
    const sequence = lineEditor.value();
    if (sequence.length !== params.size) return;

    let lead: Lead = {
      position: 0,
      color: 0,
    };
    const usage = Array.from({ length: params.size }, () => false);

    store.goal.forEach((target, index) => {
      if (target === sequence[index]) {
        lead.position += 1;
        usage[index] = true;
      }
    });
    usage.forEach((used, index) => {
      if (used) {
        return;
      }
      const target = sequence[index];
      const indexMatched = store.goal.findIndex(
        (color, j) => !usage[j] && color === target
      );
      if (indexMatched >= 0) {
        lead.color += 1;
        usage[indexMatched] = true;
      }
    });

    setStore((s) => ({
      status: match<any, GameStatus>({
        correctPositions: lead.position,
        lastAttempt: params.maxAttempts - 1,
      })
        .with({ correctPositions: params.size }, () => "win")
        .with({ lastAttempt: s.attempts.length }, () => "lose")
        .otherwise(() => s.status),
      current: s.current + 1,
      attempts: s.attempts.concat([sequence]),
      leads: s.leads.concat([lead]),
    }));
    lineEditor.clear();
  };

  return {
    size: () => params.size,
    currentAttempt: store.current,
    start,
    select: lineEditor.select,
    deselect: lineEditor.deselect,
    isSubmitable: lineEditor.ready,
    isEmpty: lineEditor.empty,
    submit,
    getLead(index: number): Lead {
      const lead = store.leads[index];
      return lead || { position: 0, color: 0 };
    },
    getAttempt(index: number): Line {
      if (store.current === index) {
        const value = lineEditor.value();
        return Array.from(
          { length: params.size },
          (_, i) => value[i] || "void"
        );
      }
      return store.attempts[index] || emptyAttempt();
    },
    goal: store.goal,
    maxAttempts: () => params.maxAttempts,
    status: store.status,
  };
};

const useLineEditor = (size: number) => {
  const [editor, setEditor] = createSignal<Guess>([]);

  const select = (color: Color) => {
    setEditor((e) => (e.length === size ? e : e.concat(color)));
  };

  const deselect = () => {
    setEditor((e) => e.slice(0, -1));
  };

  const clear = () => {
    setEditor([]);
  };

  const ready = () => editor().length === size;
  const empty = () => editor().length === 0;

  return { value: editor, select, deselect, clear, ready, empty };
};

const getRandomColorIndex = (): number =>
  Math.floor(Math.random() * ALL_COLORS.length);

const getRandomColor = (): Color => ALL_COLORS[getRandomColorIndex()];

const createGoal = (size: number): Color[] =>
  Array.from({ length: size }, () => getRandomColor());
