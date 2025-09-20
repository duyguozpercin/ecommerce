import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { createCheckoutSession } from "@/app/actions/stripe";
import { Product, Category } from "@/types/product";
import '@testing-library/jest-dom';



jest.mock("@/app/actions/stripe", () => ({
  createCheckoutSession: jest.fn(),
}));

describe("CheckoutButton", () => {
  const mockCreateCheckoutSession = createCheckoutSession as jest.Mock;

  const mockItem: Product & { quantity: number } = {
    id: "1",
    title: "Test Product",
    description: "test description",
    category: Category.chairs,
    price: 100,
    stock: 5,
    rating: 4.5,
    quantity: 2,
    images: ["https://example.com/test.png"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("disables the button when cart is empty", () => {
    render(<CheckoutButton items={[]} />);
    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    expect(button).toBeDisabled();
  });

  it("enables the button when cart has items", () => {
    render(<CheckoutButton items={[mockItem]} />);
    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    expect(button).not.toBeDisabled();
  });

  it("calls createCheckoutSession with items when clicked", () => {
    render(<CheckoutButton items={[mockItem]} />);
    const button = screen.getByRole("button", { name: /proceed to checkout/i });

    fireEvent.click(button);

    expect(mockCreateCheckoutSession).toHaveBeenCalledTimes(1);
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith([mockItem]);
  });

  it("shows 'Processing...' while pending", async () => {
  
    mockCreateCheckoutSession.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    );

    render(<CheckoutButton items={[mockItem]} />);
    const button = screen.getByRole("button", { name: /proceed to checkout/i });

    fireEvent.click(button);

    
    expect(screen.getByRole("button", { name: /processing/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /proceed to checkout/i })
      ).toBeInTheDocument();
    });
  });
});
