import { render, screen, fireEvent } from "@testing-library/react";
import ProductsClientTable from "../app/admin/products/manage/ProductsClientTable";
import { Product } from "@/types/product";
import '@testing-library/jest-dom';


jest.mock("@/app/admin/products/manage/ProductTablePage", () => ({
  __esModule: true,
  default: ({ onEdit }: { onEdit: (p: Product) => void }) => (
    <button onClick={() => onEdit({ id: "1", title: "Test Product" } as Product)}>
      Mock ProductTablePage
    </button>
  ),
}));
jest.mock("@/components/UpdateProduct", () => ({
  __esModule: true,
  default: ({ onUpdated }: { onUpdated: () => void }) => (
    <div>
      Mock UpdateProduct
      <button onClick={onUpdated}>Update Done</button>

    </div>
  ),
}));


describe("ProductsClientTable", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      title: "Test Product",
      description: "desc",
      category: "books" as any,
      price: 100,
      stock: 5,
      brand: "brand",
      availabilityStatus: "inStock" as any,
      returnPolicy: "noReturn" as any,
      sku: "sku1",
      weight: 1,
      warrantyInformation: "1y",
      shippingInformation: "fast",
      dimensions: { width: 1, height: 1, depth: 1 },
      tags: ["tag"],
      discountPercentage: 0,
      rating: 0,
      reviews: [],
      images: [],
      thumbnail: "",
      minimumOrderQuantity: 1,
      meta: { createdAt: "now", updatedAt: "now" },
      stripeProductId: "sp1",
      stripePriceId: "pr1",
      stripeCurrency: "usd",
    },
  ];

  it("renders ProductTablePage initially", () => {
    render(<ProductsClientTable products={mockProducts} />);
    expect(screen.getByText("Mock ProductTablePage")).toBeInTheDocument();
  });

  it("opens UpdateProduct modal when onEdit is called", () => {
    render(<ProductsClientTable products={mockProducts} />);
    fireEvent.click(screen.getByText("Mock ProductTablePage"));
    expect(screen.getByText("Mock UpdateProduct")).toBeInTheDocument();
  });

  it("closes modal when Cancel button is clicked", () => {
    render(<ProductsClientTable products={mockProducts} />);
    fireEvent.click(screen.getByText("Mock ProductTablePage"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Mock UpdateProduct")).not.toBeInTheDocument();
  });


});