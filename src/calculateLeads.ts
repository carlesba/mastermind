import { Color, Guess, Lead } from "./types";

class MatchState<T> {
  private used: Set<number>;
  private counter: Map<T, number>;
  constructor(value: T[]) {
    this.used = new Set<number>();
    this.counter = new Map<T, number>();
    value.forEach((item) => {
      const count = this.counter.get(item) || 0;
      this.counter.set(item, count + 1);
    });
  }
  hasAny(item: T): boolean {
    const count = this.counter.get(item) ?? 0;
    return count > 0;
  }
  isAvailable(item: T, index: number): boolean {
    const anyItem = this.hasAny(item);
    const used = this.used.has(index);
    return !used && anyItem;
  }
  use(item: T, index: number): void {
    this.used.add(index);
    const count = this.counter.get(item) || 0;
    this.counter.set(item, count - 1);
  }
}

class GoalMatcher {
  private goal: Color[];
  private goalMatchState: MatchState<Color>;
  private positionMatchState: MatchState<number>;

  constructor(goal: Color[]) {
    this.goal = goal;

    this.goalMatchState = new MatchState(goal);
    this.positionMatchState = new MatchState(goal.map((_, index) => index));
  }
  matchColorPosition(color: Color, position: number): boolean {
    const available = this.goalMatchState.isAvailable(color, position);
    const matches = this.goal[position] === color;
    if (available && matches) {
      this.goalMatchState.use(color, position);
      this.positionMatchState.use(position, position);
      return true;
    }
    return false;
  }
  matchJustColor(color: Color): boolean {
    const hasAny = this.goalMatchState.hasAny(color);
    if (hasAny) {
      this.goalMatchState.use(color, -1);
      return true;
    }
    return false;
  }
}

export function calculateLeads(goal: Color[], guess: Guess): Lead {
  const matcher = new GoalMatcher(goal);

  let positionLead = 0;
  let colorLead = 0;
  guess.forEach((color, index) => {
    if (matcher.matchColorPosition(color, index)) {
      positionLead += 1;
    }
  });
  guess.forEach((color) => {
    if (matcher.matchJustColor(color)) {
      colorLead++;
    }
  });
  return {
    position: positionLead,
    color: colorLead,
  };
}
