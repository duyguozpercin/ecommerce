import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteProduct from "@/components/DeleteProduct";


const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe("DeleteProduct", () => {
  const defaultProps = {
    productId: "123",
    activeId: null,
    setActiveId: jest.fn(),
    onDeleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders delete button", () => {
    render(<DeleteProduct {...defaultProps} />);
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("opens confirmation dialog when delete button clicked", () => {
    render(<DeleteProduct {...defaultProps} />);
    fireEvent.click(screen.getByText("x"));
    expect(defaultProps.setActiveId).toHaveBeenCalledWith("123");
  });

  it("closes dialog when Cancel is clicked", () => {
    render(<DeleteProduct {...defaultProps} activeId="123" />);
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.setActiveId).toHaveBeenCalledWith(null);
  });

  it("calls fetch and shows success message when Yes clicked (success)", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await waitFor(() =>
      expect(defaultProps.onDeleted).toHaveBeenCalled()
    );

    expect(defaultProps.setActiveId).toHaveBeenCalledWith(null);
    expect(await screen.findByText(/Product deleted successfully/i)).toBeInTheDocument();
  });

  it("logs error when fetch fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔥 Error deleting product or image",
        expect.any(Error)
      )
    );

    consoleSpy.mockRestore();
  });

  it("logs error when API responds with success = false", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, message: "Failed to delete" }),
    });

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔥 Deletion failed:",
        "Failed to delete"
      )
    );

    consoleSpy.mockRestore();
  });
});
