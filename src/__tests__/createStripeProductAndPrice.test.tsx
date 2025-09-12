import { createStripeProductAndPrice } from "@/services/stripeProductService";
import { stripe } from "@/utils/stripe";
import type { ProductForm } from "@/types/product";
import { Category } from "@/types/product";
import { AvailabilityStatus } from "@/types/product";
import { ReturnPolicy } from "@/types/product";


jest.mock("@/utils/stripe", () => {
  return {
    stripe: {
      products: {
        create: jest.fn(),
        update: jest.fn(),
      },
      prices: {
        create: jest.fn(),
      },
    },
  };
});

describe("createStripeProductAndPrice", () => {
  const mockForm: ProductForm = {
    title: "Test Chair",
    description: "A very comfy chair",
    brand: "IKEA",
    sku: "CHAIR-123",
    price: 49.99,
    stock: 5,
    category: Category.chairs,
    availabilityStatus: AvailabilityStatus.IN_STOCK,
    dimensions: {
      width: 50,
      height: 100,
      depth: 60,
    },
    returnPolicy: ReturnPolicy.DAYS_14,
    weight: 10,
    warrantyInformation: "2 years",
    shippingInformation: "Ships in 3 days",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create product, price, and update default_price", async () => {
    
    (stripe.products.create as jest.Mock).mockResolvedValue({ id: "prod_123" });
    (stripe.prices.create as jest.Mock).mockResolvedValue({ id: "price_123" });
    (stripe.products.update as jest.Mock).mockResolvedValue({});

    const result = await createStripeProductAndPrice("app_1", mockForm);

  
    expect(stripe.products.create).toHaveBeenCalledWith({
      name: "Test Chair",
      description: "A very comfy chair",
      metadata: {
        appProductId: "app_1",
        brand: "IKEA",
        sku: "CHAIR-123",
      },
    });

    
    expect(stripe.prices.create).toHaveBeenCalledWith({
      product: "prod_123",
      unit_amount: 4999,
      currency: "usd",
    });

    
    expect(stripe.products.update).toHaveBeenCalledWith("prod_123", {
      default_price: "price_123",
    });


    expect(result).toEqual({
      stripeProductId: "prod_123",
      stripePriceId: "price_123",
      stripeCurrency: "usd",
    });
  });
});
