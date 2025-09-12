import { doc, getDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { Product } from "@/types/product";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { BuyButton } from "@/app/BuyButton";
import Link from "next/link"; // ✅ eklendi

interface ProductDetailPageProps {
  params: { productId: string };
  searchParams: { canceled?: string };
}

export default async function ProductDetail({ params, searchParams }: ProductDetailPageProps) {
  const { canceled } = searchParams;

  if (canceled) {
    console.log("Order canceled -- continue to shop around and checkout when you’re ready.");
  }

  const { productId } = params;

  try {
    const docRef = doc(db, collections.products, productId);
    const snapshot = await getDoc(docRef);

    // Product not found
    if (!snapshot.exists()) {
      return (
        <div className="p-8 max-w-xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="mb-4">
              The product you are looking for does not exist in the database. It may have been removed or never added.
            </p>
            <Link
              href="/products"
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
      );
    }

    const product = snapshot.data() as Product;

    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="product-details bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4 text-neutral-900">{product.title}</h1>

          <Image
            src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            width={500}
            height={500}
            className="w-full rounded mb-4 object-cover"
          />

          <h3 className="font-bold text-neutral-800">Description:</h3>
          <p className="mb-2 text-neutral-700">{product.description}</p>

          {product.dimensions && (
            <p className="mb-2 text-neutral-700">
              <span className="font-bold text-neutral-800">Dimensions: </span>
              {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
            </p>
          )}

          <p className="mb-2 text-neutral-700">{product.availabilityStatus}</p>
          <p className="mb-2 text-neutral-700">{product.returnPolicy}</p>
          <p className="text-lg font-semibold mb-4 text-neutral-800">${product.price}</p>

          <div className="flex flex-row items-center gap-x-4">
            <AddToCartButton product={{ ...product, id: productId }} />
            <BuyButton productId={String(product.id)} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Product fetch error:", error);
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-2">An Error Occurred</h2>
          <p className="mb-4">
            There was a problem while fetching the product details. Please try again later.
          </p>
          <Link
            href="/products"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
}
