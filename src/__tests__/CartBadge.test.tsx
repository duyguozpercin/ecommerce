// src/__tests__/CartBadge.test.tsx
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
  it("sepet boşken badge göstermemeli", () => {
    renderWithCart(0);

    
    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  it("sepette ürün varsa badge görünmeli ve doğru sayıyı göstermeli", () => {
    renderWithCart(3);

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("Cart linki doğru yönlendirmeli", async () => {
    renderWithCart(2);

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("href", "/cart");

    
    await userEvent.click(link);
    
  });

  it("erişilebilirlik için aria-label içermeli", () => {
    renderWithCart(1);

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("aria-label", "Cart");
  });
});
