
import { TextDecoder, TextEncoder } from "util";
import "whatwg-fetch";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductForm from "@/components/admin/products/ProductForm";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";


if (!global.TextDecoder) global.TextDecoder = TextDecoder as any;

if (!global.TextEncoder) global.TextEncoder = TextEncoder as any;


jest.mock("@vercel/blob", () => ({
  put: jest.fn(() =>
    Promise.resolve({ url: "http://mocked-url.com/image.png" })
  ),
}));


jest.mock("@/utils/stripe", () => ({
  stripe: {
    products: { create: jest.fn().mockResolvedValue({ id: "mock_product" }) },
    prices: { create: jest.fn().mockResolvedValue({ id: "mock_price" }) },
  },
}));


jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    useActionState: () => [
      { success: true, message: "Product created successfully" }, // state
      jest.fn(),
      false,
    ],
  };
});


jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("ProductFormComponent", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<ProductForm />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Stock" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  it("fills and submits the form successfully", async () => {
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "A test description" },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Stock" }), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/Brand/i), {
      target: { value: "Test Brand" },
    });
    fireEvent.change(screen.getByLabelText(/SKU/i), {
      target: { value: "SKU123" },
    });
    fireEvent.change(screen.getByLabelText(/Weight/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/Warranty Information/i), {
      target: { value: "2 years" },
    });
    fireEvent.change(screen.getByLabelText(/Shipping Information/i), {
      target: { value: "Ships in 3 days" },
    });

    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: "Chairs" },
    });
    fireEvent.change(screen.getByLabelText(/Stock Status/i), {
      target: { value: "In Stock" },
    });
    fireEvent.change(screen.getByLabelText(/Return Policy/i), {
      target: { value: "30 days return policy" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Product/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin/products/manage");
    });
  });
});
