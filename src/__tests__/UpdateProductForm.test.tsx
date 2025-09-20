import { render, screen, fireEvent } from "@testing-library/react";
import UpdateProductForm from "@/components/UpdateProductForm";
import { ProductForm } from "@/types/product";
import { UseFormRegister } from "react-hook-form";
import '@testing-library/jest-dom';


const mockRegister: UseFormRegister<ProductForm> = (() => {
  return () => ({ onChange: jest.fn(), onBlur: jest.fn(), name: "", ref: jest.fn() });
})() as unknown as UseFormRegister<ProductForm>;

describe("UpdateProductForm", () => {
  it("should render all input fields", () => {
    render(<UpdateProductForm register={mockRegister} errors={{}} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Stock")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand")).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Weight (kg)")).toBeInTheDocument();
    expect(screen.getByLabelText("Warranty Information")).toBeInTheDocument();
    expect(screen.getByLabelText("Shipping Information")).toBeInTheDocument();

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Stock Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Return Policy")).toBeInTheDocument();

    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("should display error messages when errors are present", () => {
    const errors = {
      title: { message: "Title is required" },
      price: { message: "Price must be positive" },
    };

    render(<UpdateProductForm register={mockRegister} errors={errors as any} />);

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Price must be positive")).toBeInTheDocument();
  });

  it("should handle checkbox interaction", () => {
    render(<UpdateProductForm register={mockRegister} errors={{}} />);

    const checkbox = screen.getByLabelText("Organic") as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBe(true);
  });

  it("should allow changing select fields", () => {
    render(<UpdateProductForm register={mockRegister} errors={{}} />);

    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: "Chairs" } });

    expect(categorySelect.value).toBe("Chairs");
  });
});
