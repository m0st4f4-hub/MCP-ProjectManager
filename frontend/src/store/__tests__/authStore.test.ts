import { describe, it, expect, beforeEach } from "vitest";
import { act } from "react-dom/test-utils";
import { useAuthStore } from "../authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      setToken: useAuthStore.getState().setToken,
      clearToken: useAuthStore.getState().clearToken,
    });
  });

  it("setToken stores token", () => {
    act(() => {
      useAuthStore.getState().setToken("abc");
    });
    expect(useAuthStore.getState().token).toBe("abc");
  });

  it("clearToken removes token", () => {
    useAuthStore.setState({
      token: "xyz",
      setToken: useAuthStore.getState().setToken,
      clearToken: useAuthStore.getState().clearToken,
      logout: useAuthStore.getState().logout,
    });
    act(() => {
      useAuthStore.getState().clearToken();
    });
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("logout clears stored token", () => {
    useAuthStore.setState({
      token: "xyz",
      setToken: useAuthStore.getState().setToken,
      clearToken: useAuthStore.getState().clearToken,
      logout: useAuthStore.getState().logout,
    });
    act(() => {
      useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
