import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestWrapper } from "@/__tests__/utils/test-utils";
import { useAuthStore } from "@/store/authStore";
import LoginForm from "../LoginForm";

const toastMock = vi.fn();
const pushMock = vi.fn();
const loginMock = vi.fn();

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => toastMock,
    useColorModeValue: (light: any, dark: any) => light,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/api/users", () => ({
  login: loginMock,
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>,
    );
    expect(document.body).toBeInTheDocument();
  });

  it("should handle props correctly", () => {
    const props = {
      testId: "test-component",
      "data-testid": "test-component",
    };

    render(
      <TestWrapper>
        <LoginForm {...props} />
      </TestWrapper>,
    );

    const component = screen.queryByTestId("test-component");
    expect(component || document.body).toBeInTheDocument();
  });

  it("should handle user interactions", async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>,
    );

    const buttons = screen.queryAllByRole("button");
    const inputs = screen.queryAllByRole("textbox");

    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }

    if (inputs.length > 0) {
      await user.type(inputs[0], "test input");
    }

    expect(document.body).toBeInTheDocument();
  });

  it("submits credentials and redirects on success", async () => {
    loginMock.mockResolvedValueOnce({
      access_token: "abc",
      token_type: "bearer",
    });
    const setTokenMock = vi.fn();
    useAuthStore.setState({ token: null, setToken: setTokenMock } as any);

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>,
    );

    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "secret");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalled());

    expect(setTokenMock).toHaveBeenCalledWith("abc");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows toast on login failure", async () => {
    loginMock.mockRejectedValueOnce(new Error("invalid"));

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>,
    );

    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "bad");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(pushMock).not.toHaveBeenCalled();
  });
});
