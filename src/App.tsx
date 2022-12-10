import {
  Component,
  createSignal,
  For,
  Index,
  JSXElement,
  Match,
  onMount,
  Switch,
} from "solid-js";

import { ALL_COLORS, Choice, Lead, Line } from "./game/types";
import { useGame } from "./game/useGame";
import "./App.css";

const game = useGame({ maxAttempts: 6, size: 4 });

const App: Component = () => {
  const [dark, setDark] = createSignal(prefersDarkScheme());

  onMount(() => {
    game.start();
  });

  return (
    <div class={dark() ? "App dark" : "App"}>
      <div class="themeToggle" onClick={() => setDark((s) => !s)}>
        <DarkThemeToggle />
      </div>
      <Switch fallback={<Game />}>
        <Match when={game.status === "idle"}>
          <button
            onClick={() => {
              game.start();
            }}
          >
            start a new game
          </button>
        </Match>
      </Switch>
    </div>
  );
};

export default App;

const prefersDarkScheme = () => {
  if (window !== undefined) {
    return window.matchMedia("(prefers-color-scheme:dark)").matches;
  }
  return false;
};

// const GameContext = createContext<ReturnType<typeof useGame>>({
//   status: () => "idle",
//   start: () => {},
//   size: () => 0,
//   select: () => {},
//   deselect: () => {},
//   isEmpty: () => true,
//   isSubmitable: () => false,
//   submit: () => {},
//   goal: () => [],
//   getAttempt: () => [],
//   currentAttempt: () => 0,
//   maxAttempts: () => 0,
//   getLead: () => ({ position: 0, color: 0 }),
// });

// const useGameContext = () => useContext(GameContext);

const Game: Component = () => {
  return (
    <div>
      <header>Mastermind</header>
      <div class="board">
        <Index each={Array.from({ length: game.maxAttempts() })}>
          {(_, index) => (
            <GuessViewer
              active={game.currentAttempt === index}
              rank={index}
              value={game.getAttempt(index)}
              lead={game.getLead(index)}
            />
          )}
        </Index>
      </div>
      <Panel visible={game.status === "on"}>
        <Keyboard />
      </Panel>
      <Panel visible={game.status === "win"}>
        <WinPanel />
      </Panel>
      <Panel visible={game.status === "lose"}>
        <LosePanel />
      </Panel>
    </div>
  );
};
const DarkThemeToggle: Component = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-brightness"
    width="44"
    height="44"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="#2c3e50"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="12" y1="9" x2="16.65" y2="4.35" />
    <line x1="12" y1="14.3" x2="19.37" y2="6.93" />
    <line x1="12" y1="19.6" x2="20.85" y2="10.75" />
  </svg>
);

const GuessViewer: Component<{
  rank: number;
  active: boolean;
  value: Line;
  lead: Lead;
}> = (props) => {
  return (
    <>
      <SequenceViewer active={props.active} value={props.value} />
      <LeadViewer active={props.active} value={props.lead} />
    </>
  );
};

const SequenceViewer: Component<{
  value: Line;
  active: boolean;
}> = (props) => {
  return (
    <Index each={props.value}>
      {(choice) => <ChoiceView active={props.active} value={choice()} />}
    </Index>
  );
};

const ChoiceView: Component<{
  value: Choice;
  active: boolean;
}> = (props) => {
  return (
    <div
      class={["circle", props.value, props.active ? "active" : ""].join(
        " "
      )}
    />
  );
};

const LeadViewer: Component<{
  value: Lead;
  active: boolean;
}> = (props) => {
  const leads = () => {
    let { position, color } = props.value;
    return Array.from({ length: game.size() }, () => {
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
    <div class="leads">
      <Index each={leads()}>
        {(lead) => (
          <div
            class={[
              "lead",
              "circle",
              lead(),
              props.active ? "active" : "",
            ].join(" ")}
          />
        )}
      </Index>
    </div>
  );
};

const Panel: Component<{ visible: boolean; children: JSXElement }> = (
  props
) => {
  return (
    <div class={["panel", !props.visible ? "hidden" : ""].join(" ")}>
      {props.children}
    </div>
  );
};
const Keyboard: Component = () => {
  return (
    <div class="keyboard">
      <div class="keylayout">
        <For each={ALL_COLORS}>
          {(color) => (
            <button
              onClick={() => game.select(color)}
              class={["circle", color].join(" ")}
            />
          )}
        </For>
      </div>
      <div class="actions">
        <button
          class="action enter"
          disabled={!game.isSubmitable()}
          onClick={game.submit}
        >
          Enter
        </button>
        <button
          class="action delete"
          disabled={game.isEmpty()}
          onClick={game.deselect}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const WinPanel: Component = () => {
  return (
    <div class="notification">
      <p>You made it in {game.currentAttempt}!</p>
      <button class="action" onClick={game.start}>
        New Game
      </button>
    </div>
  );
};

const LosePanel: Component = () => {
  return (
    <div class="notification">
      <div class="sequence">
        <SequenceViewer active={false} value={game.goal} />
      </div>
      <button class="action" onClick={game.start}>
        New Game
      </button>
    </div>
  );
};
