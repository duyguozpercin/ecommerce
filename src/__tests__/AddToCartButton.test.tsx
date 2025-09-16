import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "@/components/AddToCartButton"; // kendi dosya yoluna göre ayarla
import { useCart } from "@/context/CartContext";
import { Category, Product } from "@/types/product";
import '@testing-library/jest-dom';


jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

describe("AddToCartButton", () => {
  const mockAddToCart = jest.fn();

  
  const product: Product & { id: string } = {
    id: "123",
    title: "Test Product",
    price: 99,
    description: "test description",
    category: Category.chairs,
    stock: 10,
    rating: 4.5,
    images: ["/test-image.jpg"],
    
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({ addToCart: mockAddToCart });
  });

  it("renders the button", () => {
    render(<AddToCartButton product={product} />);
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });

  it("calls addToCart with correct product id when clicked", () => {
    render(<AddToCartButton product={product} />);
    const button = screen.getByRole("button", { name: /add to cart/i });

    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith("123");
  });
});
