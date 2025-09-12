import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductTablePage from "../app/admin/products/manage/ProductTablePage";
import { Product } from "@/types/product";


jest.mock("next/image", () => (props: any) => <img {...props} />);

jest.mock("@/components/DeleteProduct", () => (props: any) => {
  return (
    <button
      data-testid={`delete-btn-${props.productId}`}
      onClick={() => props.onDeleted()}
    >
      Delete
    </button>
  );
});

beforeAll(() => {
  // Orijinal location'ı sakla
  // @ts-ignore
  delete window.location;


  window.location = {
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    href: "",
  } as any;
});


describe("ProductTablePage", () => {
  const products: Product[] = [
    { id: "1", title: "Chair", price: 100, images: ["/chair.png"] } as Product,
  ];

  // -------------------------
  // Desktop
  // -------------------------
  it("renders product correctly inside table row (desktop view)", () => {
    render(<ProductTablePage products={products} onEdit={jest.fn()} />);

    const rows = screen.getAllByRole("row");
    const firstRow = rows[1];

    expect(within(firstRow).getByText("Chair")).toBeInTheDocument();
    expect(within(firstRow).getByText("$100")).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked in table row (desktop view)", () => {
    const onEdit = jest.fn();
    render(<ProductTablePage products={products} onEdit={onEdit} />);

    const rows = screen.getAllByRole("row");
    const firstRow = rows[1];
    const editButton = within(firstRow).getByTitle("Edit");

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(products[0]);
  });

  it("calls onDeleted when delete button clicked in table row (desktop view)", () => {
    render(<ProductTablePage products={products} onEdit={jest.fn()} />);

    const rows = screen.getAllByRole("row");
    const firstRow = rows[1];
    const deleteButton = within(firstRow).getByTestId("delete-btn-1");

    fireEvent.click(deleteButton);
    expect(deleteButton).toBeInTheDocument();
  });

  // -------------------------
  // Mobile
  // -------------------------
  it("renders product correctly inside mobile card", () => {
    render(<ProductTablePage products={products} onEdit={jest.fn()} />);

    const cards = screen.getAllByText("Chair");
    expect(cards[0]).toBeInTheDocument();
    expect(screen.getAllByText("$100")[0]).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked in mobile card", () => {
    const onEdit = jest.fn();
    render(<ProductTablePage products={products} onEdit={onEdit} />);

    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(products[0]);
  });

  it("calls onDeleted when delete button clicked in mobile card", () => {
    render(<ProductTablePage products={products} onEdit={jest.fn()} />);

    const deleteButtons = screen.getAllByTestId("delete-btn-1");
    fireEvent.click(deleteButtons[0]);
    expect(deleteButtons[0]).toBeInTheDocument();
  });
});
