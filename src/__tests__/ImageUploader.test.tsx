import { render, screen, fireEvent } from "@testing-library/react";
import ImageUploader from "@/components/admin/products/ImageUploader";
import "@testing-library/jest-dom";

describe("ImageUploader", () => {
  let setPreviewUrl: jest.Mock;

  beforeAll(() => {

    global.URL.createObjectURL = jest.fn(() => "mocked-url");
  });

  beforeEach(() => {
    setPreviewUrl = jest.fn();
  });

  it("renders without crashing", () => {
    render(<ImageUploader previewUrl={null} setPreviewUrl={setPreviewUrl} />);
    expect(screen.getByLabelText("Product Image")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
  });

  it("calls setPreviewUrl when a file is selected", () => {
    render(<ImageUploader previewUrl={null} setPreviewUrl={setPreviewUrl} />);

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText("Product Image", { selector: "input" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(setPreviewUrl).toHaveBeenCalledWith("mocked-url");
  });

  it("renders image preview if previewUrl is provided", () => {
    render(
      <ImageUploader
        previewUrl="http://mock.com/test.png"
        setPreviewUrl={setPreviewUrl}
      />
    );

    const img = screen.getByAltText("Preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://mock.com/test.png");
  });
});
