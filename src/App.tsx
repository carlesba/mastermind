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

import { ALL_COLORS, Choice, Lead, Line } from "./types";
import { createGameStore } from "./game";
import "./App.css";

const gameStore = createGameStore({ maxAttempts: 6, size: 4 });

const App: Component = () => {
  const [dark, setDark] = createSignal(prefersDarkScheme());
  const [showInstructions, setShowInstructions] = createSignal(false);

  onMount(() => {
    gameStore.start();
  });

  return (
    <div class={dark() ? "App dark" : "App"}>
      <div class="themeToggle" onClick={() => setDark((s) => !s)}>
        <DarkThemeToggle />
      </div>
      <div
        class="instructionsToggle"
        onClick={() => setShowInstructions((s) => !s)}
      >
        {showInstructions() ? <CloseIcon /> : <InstructionsIcon />}
      </div>
      <Switch fallback={<Game />}>
        <Match when={showInstructions()}>
          <InstructionsPanel onClose={() => setShowInstructions(false)} />
        </Match>
        <Match when={gameStore.status() === "idle"}>
          <button
            onClick={() => {
              gameStore.start();
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

const Game: Component = () => {
  return (
    <div>
      <header>Mastermind</header>
      <div class="board">
        <Index each={Array.from({ length: gameStore.maxAttempts() })}>
          {(_, index) => (
            <GuessViewer
              active={gameStore.currentAttempt() === index}
              rank={index}
              value={gameStore.getAttempt(index)}
              lead={gameStore.getLead(index)}
            />
          )}
        </Index>
      </div>
      <Panel visible={gameStore.status() === "on"}>
        <Keyboard />
      </Panel>
      <Panel visible={gameStore.status() === "win"}>
        <WinPanel />
      </Panel>
      <Panel visible={gameStore.status() === "lose"}>
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

const InstructionsIcon: Component = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-help"
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
    <line x1="12" y1="17" x2="12" y2="17.01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </svg>
);

const CloseIcon: Component = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-x"
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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
      class={["circle", props.value, props.active ? "active" : ""].join(" ")}
    />
  );
};

const LeadViewer: Component<{
  value: Lead;
  active: boolean;
}> = (props) => {
  const leads = () => {
    let { position, color } = props.value;
    return Array.from({ length: gameStore.size() }, () => {
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
              onClick={() => gameStore.select(color)}
              class={["circle", color].join(" ")}
            />
          )}
        </For>
      </div>
      <div class="actions">
        <button
          class="action enter"
          disabled={!gameStore.isSubmitable()}
          onClick={() => {
            gameStore.submit();
            setTimeout(() => {
              const activeRow = document.querySelector(".circle.active");
              if (activeRow) {
                activeRow.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 100);
          }}
        >
          Enter
        </button>
        <button
          class="action delete"
          disabled={gameStore.isEmpty()}
          onClick={gameStore.deselect}
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
      <p>You made it in {gameStore.currentAttempt()}!</p>
      <button class="action" onClick={gameStore.start}>
        New Game
      </button>
    </div>
  );
};

const LosePanel: Component = () => {
  return (
    <div class="notification">
      <div class="sequence">
        <SequenceViewer active={false} value={gameStore.goal()} />
      </div>
      <button class="action" onClick={gameStore.start}>
        New Game
      </button>
    </div>
  );
};

const InstructionsPanel: Component<{ onClose: () => void }> = (props) => {
  return (
    <div class="instructions">
      <header>How to Play</header>
      <div class="instructions-content">
        <section>
          <h2>Objective</h2>
          <p>
            Guess the secret color combination in as few attempts as possible.
            You have 6 attempts to crack the code.
          </p>
        </section>

        <section>
          <h2>How to Play</h2>
          <ol>
            <li>Select 4 colors from the keyboard to make your guess</li>
            <li>Press "Enter" to submit your guess</li>
            <li>Check the feedback indicators on the right</li>
            <li>Use the feedback to refine your next guess</li>
          </ol>
        </section>

        <section>
          <h2>Feedback Indicators</h2>
          <div class="feedback-examples">
            <div class="feedback-item">
              <div class="lead circle position" />
              <p>
                <strong>Red dot:</strong> Correct color in the correct position
              </p>
            </div>
            <div class="feedback-item">
              <div class="lead circle color" />
              <p>
                <strong>White/Black dot:</strong> Correct color but wrong
                position
              </p>
            </div>
            <div class="feedback-item">
              <div class="lead circle void" />
              <p>
                <strong>Empty dot:</strong> This color is not in the solution
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>Tips</h2>
          <ul>
            <li>Colors can repeat in the solution</li>
            <li>Use your first guesses to test different colors</li>
            <li>Pay close attention to the feedback after each guess</li>
            <li>The order of feedback dots doesn't correspond to the order of your guess</li>
          </ul>
        </section>

        <button class="action close-button" onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
