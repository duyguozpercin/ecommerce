import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteProduct from "@/components/DeleteProduct";
import { deleteProductAction } from "@/app/actions/admin/products/deleteProductAction";

// 🧩 Mock the deleteProductAction
jest.mock("@/app/actions/admin/products/deleteProductAction", () => ({
  deleteProductAction: jest.fn(),
}));

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

  it("calls deleteProductAction and shows success message when Yes clicked (success)", async () => {
    (deleteProductAction as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await act(async () => { });

    await waitFor(() => expect(defaultProps.onDeleted).toHaveBeenCalled());
    expect(defaultProps.setActiveId).toHaveBeenCalledWith(null);
    expect(await screen.findByText(/Product deleted successfully/i)).toBeInTheDocument();
  });

  it("logs error when deleteProductAction rejects (network error)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    (deleteProductAction as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await act(async () => { });

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Error deleting/i),
        expect.any(Error)
      )
    );

    consoleSpy.mockRestore();
  });

  it("logs error when API responds with success = false", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    (deleteProductAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Failed to delete",
    });

    render(<DeleteProduct {...defaultProps} activeId="123" />);
    fireEvent.click(screen.getByText("Yes"));

    await act(async () => { });

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/(Failed to delete|Deletion failed)/i),
      expect.anything()
    )
  );
  



    consoleSpy.mockRestore();
  });
});
