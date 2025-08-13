'use client';

export const BuyButton = ({
  productId,
  className,
}: { productId: string; className?: string }) => {
  return (
    <form action="/api/checkout_session" method="POST" onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ""}`}
      >
        Buy Now
      </button>
    </form>
  );
};
