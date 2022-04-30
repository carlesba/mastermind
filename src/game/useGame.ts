import { Accessor, createSignal, onMount } from "solid-js";
import {
  ALL_COLORS,
  Choice,
  Color,
  GameStatus,
  Guess,
  Lead,
  Line,
} from "./types";

export const useGame = (params: { size: number; maxAttempts: number }) => {
  const [goal, setGoal] = createSignal<Color[]>([]);
  const [attempts, setAttempts] = createSignal<Guess[]>([]);
  const [leads, setLeads] = createSignal<Lead[]>([]);
  const [status, setStatus] = createSignal<GameStatus>("idle");

  const lineEditor = useLineEditor(params.size);

  const [current, setCurrent] = createSignal<number>(0);

  onMount(() => {
    start();
  });
  console.log("[App] state", goal(), leads(), status());

  const size: Accessor<number> = () => params.size;

  const emptyAttempt = (): Choice[] =>
    Array.from({ length: params.size }, () => "void");

  const start = () => {
    const newGoal = createGoal(params.size);
    setCurrent(0);
    setGoal(newGoal);
    setAttempts([]);
    setLeads([]);
    setStatus("on");
  };

  const submit = () => {
    const sequence = lineEditor.value();
    if (sequence.length !== params.size) return;

    let lead: Lead = {
      position: 0,
      color: 0,
    };
    const usage = Array.from({ length: params.size }, () => false);

    goal().forEach((target, index) => {
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
      const indexMatched = goal().findIndex(
        (color, j) => !usage[j] && color === target
      );
      if (indexMatched >= 0) {
        lead.color += 1;
        usage[indexMatched] = true;
      }
    });

    const attemptsCount = attempts().length;

    console.log("[App] lead, ", lead, goal());
    if (lead.position === params.size) {
      setStatus("win");
    } else if (attemptsCount === params.maxAttempts - 1) {
      setStatus("lose");
    }
    setCurrent((c) => c + 1);
    setAttempts((a) => a.concat([sequence]));
    setLeads((l) => l.concat([lead]));
    lineEditor.clear();
  };

  return {
		currentAttempt: current,
    start,
    select: lineEditor.select,
    deselect: lineEditor.deselect,
    isSubmitable: lineEditor.ready,
		isEmpty: lineEditor.empty,
    submit,
    getLead(index: number): Lead {
      const lead = leads()[index];
      return lead || { position: 0, color: 0 };
    },
    getAttempt(index: number): Line {
      if (current() === index) {
        const value = lineEditor.value();
        return Array.from(
          { length: params.size },
          (_, i) => value[i] || "void"
        );
      }
      return attempts()[index] || emptyAttempt();
    },
    goal,
    size,
    maxAttempts: () => params.maxAttempts,
    status,
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

	const ready = () => editor().length === size
	const empty = () => editor().length === 0

  return { value: editor, select, deselect, clear, ready, empty };
};

const getRandomColorIndex = (): number =>
  Math.floor(Math.random() * ALL_COLORS.length);

const getRandomColor = (): Color => ALL_COLORS[getRandomColorIndex()];

const createGoal = (size: number): Color[] =>
  Array.from({ length: size }, () => getRandomColor());
