import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUploader from "@/components/admin/products/ImageUploader";
import "@testing-library/jest-dom";
import { UseFormRegister } from "react-hook-form";
import { ProductForm } from "@/types/product";

// ✅ Next.js <Image> mock (fill/unoptimized DOM’a gitmesin)
jest.mock("next/image", () => (props: any) => {
  const { fill, unoptimized, ...rest } = props;
  return <img {...rest} />;
});

describe("ImageUploader", () => {
  let setPreviewUrl: jest.Mock;
  let setSelectedFile: jest.Mock;

  // ✅ UseFormRegister tipine uygun mock
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

  it("calls setPreviewUrl when a file is selected", async () => {
    render(
      <ImageUploader
        previewUrl={null}
        setPreviewUrl={setPreviewUrl}
        register={mockRegister}
        setSelectedFile={setSelectedFile}
      />
    );

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText("Product Image", { selector: "input" });

    fireEvent.change(input, { target: { files: [file] } });

    // 🔄 bekleme ekledik çünkü state async çalışır
    await waitFor(
      () => {
        expect(setPreviewUrl).toHaveBeenCalledWith("mocked-url");
        expect(setSelectedFile).toHaveBeenCalledWith(file);
      },
      { timeout: 1000 }
    );
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
