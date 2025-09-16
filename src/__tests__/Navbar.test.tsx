import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import "@testing-library/jest-dom";


jest.mock("@/components/NavigationMenu", () => () => <div data-testid="nav-menu">NavigationMenu</div>);
jest.mock("@/components/CartBadge", () => () => <div data-testid="cart-badge">CartBadge</div>);
jest.mock("@/components/UserDropdown", () => () => <div data-testid="user-dropdown">UserDropdown</div>);
jest.mock("@/components/MobileMenu", () => (props: { setMenuOpen: (open: boolean) => void }) => (
  <div data-testid="mobile-menu">MobileMenu</div>
));

describe("Navbar", () => {
  it("renders Home link and child components", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();

    expect(screen.getByTestId("nav-menu")).toBeInTheDocument();
    expect(screen.getByTestId("cart-badge")).toBeInTheDocument();
    expect(screen.getByTestId("user-dropdown")).toBeInTheDocument();
  });

  it("toggles mobile menu when button is clicked", () => {
    render(<Navbar />);

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});
