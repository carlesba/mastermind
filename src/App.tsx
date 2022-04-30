import {
  Accessor,
  Component,
  createContext,
  For,
  Index,
  Match,
  Switch,
  useContext,
} from "solid-js";

import styles from "./App.module.css";
import { ALL_COLORS, Choice, Lead, Line } from "./game/types";
import { useGame } from "./game/useGame";

const App: Component = () => {
  const game = useGame({ maxAttempts: 6, size: 4 });
  return (
    <div class={[styles.App, styles.dark].join(" ")}>
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
	isEmpty: () => true,
  isSubmitable: () => false,
  submit: () => {},
  goal: () => [],
  getAttempt: () => [],
  currentAttempt: () => 0,
  maxAttempts: () => 0,
  getLead: () => ({ position: 0, color: 0 }),
});

const useGameContext = () => useContext(GameContext);

const Game: Component = () => {
  const game = useGameContext();
  return (
    <div>
      <header>Mastermind</header>
      <div class={styles.board}>
        <Index each={Array.from({ length: game.maxAttempts() })}>
          {(_, index) => (
            <GuessViewer
              active={() => game.currentAttempt() === index}
              rank={index}
              value={() => game.getAttempt(index)}
              lead={() => game.getLead(index)}
            />
          )}
        </Index>
      </div>
      <Switch>
        <Match when={game.status() === "on"}>
          <Keyboard />
        </Match>
        <Match when={game.status() === "win"}>
          <div>you win!</div>
        </Match>
        <Match when={game.status() === "lose"}>
          <div>you lose!</div>
          <div>the solution was:</div>
          <SequenceViewer active={() => false} value={game.goal} />
          <button onClick={game.start}>start a new game</button>
        </Match>
      </Switch>
    </div>
  );
};

const GuessViewer: Component<{
  rank: number;
  active: Accessor<boolean>;
  value: Accessor<Line>;
  lead: Accessor<Lead>;
}> = (props) => {
  return (
    <>
      <SequenceViewer active={props.active} value={props.value} />
      <LeadViewer active={props.active} value={props.lead} />
    </>
  );
};

const SequenceViewer: Component<{
  value: Accessor<Line>;
  active: Accessor<boolean>;
}> = (props) => {
  return (
    <Index each={props.value()}>
      {(choice) => <ChoiceView active={props.active} value={choice} />}
    </Index>
  );
};

const ChoiceView: Component<{
  value: Accessor<Choice>;
  active: Accessor<boolean>;
}> = (props) => {
  return (
    <div
      class={[
        styles.circle,
        styles[props.value()],
        props.active() ? styles.active : "",
      ].join(" ")}
    />
  );
};

const LeadViewer: Component<{
  value: Accessor<Lead>;
  active: Accessor<boolean>;
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
    <div class={styles.leads}>
      <Index each={leads()}>
        {(lead) => (
          <div
            class={[
              styles.lead,
              styles.circle,
              styles[lead()],
              props.active() ? styles.active : "",
            ].join(" ")}
          />
        )}
      </Index>
    </div>
  );
};

const Keyboard: Component = () => {
  const game = useGameContext();
  return (
    <div class={styles.keyboard}>
      <div class={styles.keylayout}>
        <For each={ALL_COLORS}>
          {(color) => (
            <button
              onClick={() => game.select(color)}
              class={[styles.circle, styles[color]].join(" ")}
            />
          )}
        </For>
      </div>
      <div class={styles.actions}>
        <button
          class={[styles.action, styles.enter].join(" ")}
          disabled={!game.isSubmitable()}
          onClick={game.submit}
        >
          Enter
        </button>
        <button
          class={[styles.action, styles.delete].join(" ")}
					disabled={game.isEmpty()}
          onClick={game.deselect}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
