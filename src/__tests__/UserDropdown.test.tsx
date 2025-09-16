import { render, screen, fireEvent } from "@testing-library/react";
import UserDropdown from "@/components/UserDropdown";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import "@testing-library/jest-dom";

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
  getAuth: jest.fn(() => ({})),
  auth: {},
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("UserDropdown", () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Login and Sign Up when user is not logged in", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null });
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole("button", { name: /user menu/i }));

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it("shows Profile and Dashboard for admin user", () => {
    mockUseAuth.mockReturnValue({ user: { uid: "1" }, role: "admin" });
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole("button", { name: /user menu/i }));

    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it("calls signOut when Log Out is clicked", () => {
    mockUseAuth.mockReturnValue({ user: { uid: "1" }, role: "user" });
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole("button", { name: /user menu/i }));
    fireEvent.click(screen.getByText(/Log Out/i));

    expect(signOut).toHaveBeenCalled();
  });

  it("toggles dropdown open/close when button clicked", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null });
    render(<UserDropdown />);

    const button = screen.getByRole("button", { name: /user menu/i });

    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });
});
