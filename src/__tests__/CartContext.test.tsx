import React from "react";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/context/CartContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, "setItem");
  });

  it("should return an empty cart initially", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it("should save to localStorage when a product is added", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([{ id: "p1", quantity: 1 }])
    );
  });

  it("should increase quantity if the same product is added", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
      result.current.addToCart("p1");
    });

    expect(result.current.cart).toEqual([{ id: "p1", quantity: 2 }]);
    expect(result.current.totalItems).toBe(2);
  });

  it("should restore cart from localStorage when the page reloads", () => {
    localStorage.setItem("cart", JSON.stringify([{ id: "p2", quantity: 3 }]));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual([{ id: "p2", quantity: 3 }]);
    expect(result.current.totalItems).toBe(3);
  });

  it("clearCart should clear both state and localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
      result.current.clearCart();
    });

    expect(result.current.cart).toEqual([]);
    expect(localStorage.setItem).toHaveBeenCalledWith("cart", "[]");
  });
});
