import { describe, it, expect, beforeEach } from "vitest";
import { act } from "react-dom/test-utils";
import { createBaseStore, withLoading, BaseState } from "../baseStore";

type CounterActions = {
  increment: () => void;
  incrementAsync: () => Promise<void>;
  failAsync: () => Promise<void>;
};

interface CounterState extends BaseState, CounterActions {
  count: number;
}

const useCounterStore = createBaseStore<CounterState, CounterActions>(
  { count: 0 },
  (set, get) => ({
    increment: () => set({ count: get().count + 1 }),
    incrementAsync: () =>
      withLoading(set, async () => {
        set({ count: get().count + 1 });
      }),
    failAsync: () =>
      withLoading(set, async () => {
        throw new Error("fail");
      }),
  }),
  { name: "counter", persist: false },
);

describe("baseStore", () => {
  beforeEach(() => {
    useCounterStore.setState({
      count: 0,
      loading: false,
      error: null,
      clearError: useCounterStore.getState().clearError,
      increment: useCounterStore.getState().increment,
      incrementAsync: useCounterStore.getState().incrementAsync,
      failAsync: useCounterStore.getState().failAsync,
    });
  });

  it("increment updates count", () => {
    act(() => {
      useCounterStore.getState().increment();
    });
    expect(useCounterStore.getState().count).toBe(1);
  });

  it("incrementAsync sets loading and updates count", async () => {
    await act(async () => {
      await useCounterStore.getState().incrementAsync();
    });
    expect(useCounterStore.getState().count).toBe(1);
    expect(useCounterStore.getState().loading).toBe(false);
  });

  it("failAsync sets error state", async () => {
    await expect(
      act(async () => {
        await useCounterStore.getState().failAsync();
      }),
    ).rejects.toThrow("fail");
    expect(useCounterStore.getState().error).toBe("fail");
    expect(useCounterStore.getState().loading).toBe(false);
  });

  it("clearError resets error", () => {
    useCounterStore.setState({ error: "oops" });
    act(() => {
      useCounterStore.getState().clearError();
    });
    expect(useCounterStore.getState().error).toBeNull();
  });
});
