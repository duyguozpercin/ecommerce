
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

  it("başlangıçta boş sepet dönmeli", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it("ürün eklenince localStorage'a kaydedilmeli", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([{ id: "p1", quantity: 1 }])
    );
  });

  it("aynı ürün eklenirse miktar artmalı", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
      result.current.addToCart("p1");
    });

    expect(result.current.cart).toEqual([{ id: "p1", quantity: 2 }]);
    expect(result.current.totalItems).toBe(2);
  });

  it("sayfa yenilendiğinde localStorage'daki sepet geri yüklenmeli", () => {
    localStorage.setItem("cart", JSON.stringify([{ id: "p2", quantity: 3 }]));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual([{ id: "p2", quantity: 3 }]);
    expect(result.current.totalItems).toBe(3);
  });

  it("clearCart hem state'i hem localStorage'ı temizlemeli", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart("p1");
      result.current.clearCart();
    });

    expect(result.current.cart).toEqual([]);
    expect(localStorage.setItem).toHaveBeenCalledWith("cart", "[]");
  });
});
