import {
  Accessor,
  Component,
  createContext,
  createSignal,
  For,
  Index,
  Match,
  Switch,
  useContext,
} from "solid-js";

import styles from "./App.module.css";

const App: Component = () => {
  const game = useGame({ maxAttempts: 10, size: 4 });
  return (
    <div class={styles.App}>
      <GameContext.Provider value={game}>
        <Switch fallback={<Game />}>
          <Match when={game.status() === "idle"}>
            <button
              onClick={() => {
                game.start();
              }}
            >
              start a new game
            </button>
          </Match>
        </Switch>
      </GameContext.Provider>
    </div>
  );
};

export default App;

const ALL_COLORS = ["blue", "green", "red", "yellow", "cyan"] as const;
type Color = typeof ALL_COLORS[number];
type Choice = Color | "void";

type Lead = {
  position: number;
  color: number;
};

type Guess = Color[];
type Line = Choice[];

type GameStatus = "idle" | "on" | "lose" | "win";

const getRandomColorIndex = (): number =>
  Math.floor(Math.random() * ALL_COLORS.length);

const getRandomColor = (): Color => ALL_COLORS[getRandomColorIndex()];

const createGoal = (size: number): Color[] =>
  Array.from({ length: size }, () => getRandomColor());

const useGame = (params: { size: number; maxAttempts: number }) => {
  const [goal, setGoal] = createSignal<Color[]>([]);
  const [attempts, setAttempts] = createSignal<Guess[]>([]);
  const [leads, setLeads] = createSignal<Lead[]>([]);
  const [status, setStatus] = createSignal<GameStatus>("idle");

  console.log("[App] state", goal(), leads(), status());
  const size: Accessor<number> = () => params.size;

  const emptyAttempt = (): Choice[] =>
    Array.from({ length: params.size }, () => "void");

  const start = () => {
    const newGoal = createGoal(params.size);
    setGoal(newGoal);
    setAttempts([]);
    setLeads([]);
    setStatus("on");
  };

  const submit = (sequence: Color[]) => {
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
    setAttempts((a) => a.concat([sequence]));
    setLeads((l) => l.concat([lead]));
  };

  return {
    start,
    submit,
    getLead(index: number): Lead {
      const lead = leads()[index];
      return lead || { position: 0, color: 0 };
    },
    getAttempt(index: number): Line {
      const attempt = attempts()[index];
      return attempt || emptyAttempt();
    },
    goal,
    size,
    maxAttempts: () => params.maxAttempts,
    status,
  };
};

const GameContext = createContext<ReturnType<typeof useGame>>({
  status: () => "idle",
  start: () => {},
  size: () => 0,
  submit: () => {},
  goal: () => [],
  getAttempt: () => [],
  maxAttempts: () => 0,
  getLead: () => ({ position: 0, color: 0 }),
});

const useGameContext = () => useContext(GameContext);

const Game: Component = () => {
  const game = useGameContext();
  return (
    <div>
      <Index each={Array.from({ length: game.maxAttempts() })}>
        {(_, index) => (
          <GuessViewer
            rank={index}
            value={() => game.getAttempt(index)}
            lead={() => game.getLead(index)}
          />
        )}
      </Index>
      <Switch>
        <Match when={game.status() === "on"}>
          <AttemptForm />
        </Match>
        <Match when={game.status() === "win"}>
          <div>you win!</div>
        </Match>
        <Match when={game.status() === "lose"}>
          <div>you lose!</div>
          <div>the solution was:</div>
          <SequenceViewer value={game.goal} />
          <button onClick={game.start}>start a new game</button>
        </Match>
      </Switch>
    </div>
  );
};

const GuessViewer: Component<{
  rank: number;
  value: Accessor<Line>;
  lead: Accessor<Lead>;
}> = (props) => {
  return (
    <div class={styles.guess}>
      <Rank value={props.rank + 1} />
      <SequenceViewer value={props.value} />
      <LeadViewer value={props.lead} />
    </div>
  );
};

const Rank: Component<{ value: number }> = (props) => {
  return <div class={styles.rank}># {props.value}</div>;
};

const SequenceViewer: Component<{
  value: Accessor<Line>;
}> = (props) => {
  return (
    <div class={styles.sequence}>
      <Index each={props.value()}>
        {(choice) => <ChoiceView value={choice} />}
      </Index>
    </div>
  );
};

const ChoiceView: Component<{ value: Accessor<Choice> }> = (props) => {
  return <div class={[styles.piece, styles[props.value()]].join(" ")} />;
};

const LeadViewer: Component<{
  value: Accessor<Lead>;
}> = (props) => {
  const { size } = useGameContext();

  const leads = () => {
    let { position, color } = props.value();
    return Array.from({ length: size() }, () => {
      if (position > 0) {
        position -= 1;
        return "position";
      }
      if (color > 0) {
        color -= 1;
        return "color";
      }
      return "void";
    });
  };

  return (
    <Index each={leads()}>
      {(lead) => <div class={[styles.lead, styles[lead()]].join(" ")} />}
    </Index>
  );
};

const AttemptForm: Component = () => {
  const game = useGameContext();
  const [editor, setEditor] = createSignal<Guess>([]);

  const line: Accessor<Line> = () =>
    Array.from(
      { length: game.size() },
      (_, index) => editor()[index] || "void"
    );

  const select = (color: Color) =>
    setEditor((e) => (e.length === game.size() ? e : e.concat(color)));
  const deselect = () => setEditor((e) => e.slice(0, -1));
  const submit = () => {
    game.submit(editor());
    setEditor([]);
  };

  return (
    <div>
      <div>
        <For each={line()}>
          {(choice) => <ChoiceView value={() => choice} />}
        </For>
      </div>
      <div>
        <For each={ALL_COLORS}>
          {(color) => (
            <button
              onClick={() => select(color)}
              class={[styles.attempt, styles[color]].join(" ")}
            >
              {color}
            </button>
          )}
        </For>
        <Switch>
          <Match when={editor().length === game.size()}>
            <button onClick={submit}>Submit</button>
          </Match>
          <Match when={editor().length < game.size()}>
            <button disabled={game.size() === 0} onClick={deselect}>
              Del
            </button>
          </Match>
        </Switch>
      </div>
    </div>
  );
};
