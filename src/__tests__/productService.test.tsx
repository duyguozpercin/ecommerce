import { getAllProducts, saveProduct, decreaseProductStock } from "@/services/productService";
import { Product } from "@/types/product";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(() => "mockDocRef"),
  query: jest.fn(() => "mockQuery"),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(() => "mockIncrement"),
}));

jest.mock("@/utils/firebase", () => ({
  db: {},
  collections: {
    products: "products",
    users: "users",
  },
}));


const { getDocs, setDoc, updateDoc } = jest.requireMock("firebase/firestore");

describe("productService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllProducts → ürünleri listelemeli", async () => {
    (getDocs as jest.Mock).mockResolvedValueOnce({
      docs: [
        { id: "1", data: () => ({ title: "A", stock: 5 }) },
        { id: "2", data: () => ({ title: "B", stock: 10 }) },
      ],
    });

    const result = await getAllProducts();

    expect(result).toEqual([
      { id: "1", title: "A", stock: 5 },
      { id: "2", title: "B", stock: 10 },
    ]);
  });

  it("saveProduct → ürünü kaydetmeli", async () => {
    const product: Product = {
      id: "p1",
      title: "Chair",
      stock: 3,
      category: "Chairs" as any,
      price: 100,
    };

    await saveProduct(product);

    expect(setDoc).toHaveBeenCalledWith("mockDocRef", product);
  });

  it("decreaseProductStock → stok azaltmalı", async () => {
    await decreaseProductStock("p1");

    expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
      stock: "mockIncrement",
    });
  });
});
