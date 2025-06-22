import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f1] px-10 py-4">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-[#171212] text-xl font-bold leading-normal">
          Home
        </Link>
        <Link href="/products" className="text-[#171212] text-xl font-bold leading-normal">
          Products
        </Link>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <Link
          href="/cart"
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-[#f4f1f1] text-[#171212] gap-2 text-xl font-extrabold leading-normal tracking-[0.015em] min-w-0 px-4"
          aria-label="Cart"
        >
          <div className="text-[#171212]">
            {/* Cart Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z" />
            </svg>
          </div>
        </Link>
      </div>
    </header>
  );
}
