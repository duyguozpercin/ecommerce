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
        className={`text-[#49739c] text-sm font-normal leading-normal z-10 ${className ?? ""}`}
      >
        Buy Now
      </button>
    </form>
  );
};
