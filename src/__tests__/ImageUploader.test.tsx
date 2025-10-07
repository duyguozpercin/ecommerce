import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUploader from "@/components/admin/products/ImageUploader";
import "@testing-library/jest-dom";
import { UseFormRegister } from "react-hook-form";
import { ProductForm } from "@/types/product";
import { act as rtlAct } from "@testing-library/react";

// ✅ next/image mock
jest.mock("next/image", () => (props: any) => {
  const { fill, unoptimized, ...rest } = props;
  return <img {...rest} />;
});

describe("ImageUploader", () => {
  let setPreviewUrl: jest.Mock;
  let setSelectedFile: jest.Mock;

  const mockRegister: UseFormRegister<ProductForm> = jest
    .fn()
    .mockImplementation(() => ({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      name: "images",
      ref: jest.fn(),
    }));

  beforeEach(() => {
    setPreviewUrl = jest.fn();
    setSelectedFile = jest.fn();

    // ✅ Her testte mock’ları yeniden tanımla
    global.URL.createObjectURL = jest.fn(() => "blob:mocked-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("renders without crashing", () => {
    render(
      <ImageUploader
        previewUrl={null}
        setPreviewUrl={setPreviewUrl}
        register={mockRegister}
        setSelectedFile={setSelectedFile}
      />
    );

    expect(screen.getByLabelText("Product Image")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
    expect(screen.getByText("No file selected")).toBeInTheDocument();
  });

  it("calls setPreviewUrl and setSelectedFile when a file is selected", async () => {
  render(
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setPreviewUrl(preview);
          setSelectedFile(file);
        }
      }}
      aria-label="Product Image"
    />
  );

  const file = new File(["dummy"], "test.png", { type: "image/png" });
  const input = screen.getByLabelText("Product Image");

  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });

  await waitFor(() => {
    expect(setPreviewUrl).toHaveBeenCalledWith(expect.stringContaining("blob:"));
    expect(setSelectedFile).toHaveBeenCalledWith(file);
  });
});


  it("renders image preview if previewUrl is provided", () => {
    render(
      <ImageUploader
        previewUrl="blob:mocked-url"
        setPreviewUrl={setPreviewUrl}
        register={mockRegister}
        setSelectedFile={setSelectedFile}
      />
    );

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("blob:");
  });
});
async function act(callback: () => Promise<void>) {
  await rtlAct(callback);
}

