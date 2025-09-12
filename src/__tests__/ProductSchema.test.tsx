import { productSchema } from "@/app/schemas/productSchema";
import { Category, AvailabilityStatus, ReturnPolicy } from "@/types/product";

describe("productSchema validation", () => {
  const validData = {
    title: "Test Product",
    category: Category.chairs,
    price: 10,
    stock: 5,
    availabilityStatus: AvailabilityStatus.IN_STOCK,
    returnPolicy: ReturnPolicy.DAYS_7,
    dimensions: {
      width: 1,
      height: 1,
      depth: 1,
    },
    description: "This is a valid description",
    brand: "BrandX",
    tags: ["tag1"],
    sku: "SKU123",
    weight: 0.5,
    warrantyInformation: "2 years",
    shippingInformation: "Ships in 2 days",
  };

  it("accepts valid data", () => {
    const result = productSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects too short title", () => {
    const result = productSchema.safeParse({ ...validData, title: "a" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0])
        .toBe("Title must be at least 3 characters long.");
    }
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validData, price: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 10 characters", () => {
    const result = productSchema.safeParse({ ...validData, description: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description?.[0])
        .toBe("Description must be at least 10 characters long.");
    }
  });

  it("rejects when no tags provided", () => {
    const result = productSchema.safeParse({ ...validData, tags: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tags?.[0])
        .toBe("At least one tag must be selected.");
    }
  });

  it("rejects invalid dimensions", () => {
    const result = productSchema.safeParse({
      ...validData,
      dimensions: { width: 0, height: -1, depth: 0 },
    });
    expect(result.success).toBe(false);
  });
});
