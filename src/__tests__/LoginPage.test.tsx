import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../app/login/page";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
// DİKKAT: Buradaki yolun, aşağıdaki jest.mock() yoluyla aynı olduğundan emin olun.
import { useAuth } from "@/context/AuthContext";

// Mock'lar
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// --- DÜZELTME BURADA ---
// jest.mock() içindeki yolun, yukarıdaki import yoluyla aynı olması gerekir.
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ role: "user" });
    jest.clearAllMocks();
  });

  it("renders the form inputs and button", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("allows typing into email and password inputs", () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("E-mail");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("redirects to /admin if role is admin after login", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});
    (useAuth as jest.Mock).mockReturnValue({ role: "admin" });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });

    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("redirects to / if role is user after login", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});
    (useAuth as jest.Mock).mockReturnValue({ role: "user" });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });

    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on failed login", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpass" } });

    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});