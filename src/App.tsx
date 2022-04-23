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
import { ALL_COLORS, Choice, Color, Guess, Lead, Line } from "./game/types";
import { useGame } from "./game/useGame";

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

const GameContext = createContext<ReturnType<typeof useGame>>({
  status: () => "idle",
  start: () => {},
  size: () => 0,
  select: () => {},
  deselect: () => {},
  isSubmitable: () => false,
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

const useLineEditor = (
  size: Accessor<number>,
  onSubmit: (g: Guess) => void
) => {
  const [editor, setEditor] = createSignal<Guess>([]);

  const select = (color: Color) =>
    setEditor((e) => (e.length === size() ? e : e.concat(color)));

  const deselect = () => setEditor((e) => e.slice(0, -1));

  const submit = () => {
    onSubmit(editor());
    setEditor([]);
  };

  return { line: editor, select, deselect, submit };
};

const AttemptForm: Component = () => {
  const game = useGameContext();
	const disabled = game.isSubmitable()
  return (
    <div>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          width: "100%",
        }}
      >
        <For each={ALL_COLORS}>
          {(color) => (
            <div>
              <button
                style={{
                  "border-radius": "50%",
                  width: "10vmin",
                  height: "10vmin",
                }}
                onClick={() => game.select(color)}
                class={[styles.attempt, styles[color]].join(" ")}
              />
            </div>
          )}
        </For>
        <button disabled={disabled} onClick={game.submit}>
          Submit
        </button>
        <button onClick={game.deselect}>Delete</button>
        {/* <Switch> */}
        {/*   <Match when={editor().length === game.size()}> */}
        {/*     <button onClick={submit}>Submit</button> */}
        {/*   </Match> */}
        {/*   <Match when={editor().length < game.size()}> */}
        {/*     <button disabled={game.size() === 0} onClick={deselect}> */}
        {/*       Del */}
        {/*     </button> */}
        {/*   </Match> */}
        {/* </Switch> */}
      </div>
    </div>
  );
};
