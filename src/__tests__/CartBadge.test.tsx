import { render, screen } from "@testing-library/react";
import CartBadge from "@/components/CartBadge";
import { CartContext } from "@/context/CartContext";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";


function renderWithCart(itemsCount: number) {
  return render(
    <CartContext.Provider
      value={{
        cart: [],
        addToCart: jest.fn(),
        removeFromCart: jest.fn(),
        increaseQuantity: jest.fn(),
        decreaseQuantity: jest.fn(),
        clearCart: jest.fn(),
        totalItems: itemsCount,
      }}
    >
      <CartBadge />
    </CartContext.Provider>
  );
}

describe("CartBadge", () => {
  it("should not show badge when cart is empty", () => {
    renderWithCart(0);

    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  it("should show badge and display correct number when cart has items", () => {
    renderWithCart(3);

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("Cart link should navigate correctly", async () => {
    renderWithCart(2);

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("href", "/cart");

    await userEvent.click(link);
  });

  it("should contain aria-label for accessibility", () => {
    renderWithCart(1);

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("aria-label", "Cart");
  });
});
