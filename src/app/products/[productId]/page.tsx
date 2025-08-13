import { doc, getDoc } from "firebase/firestore";

import { db, collections } from "@/utils/firebase";

import { Product } from "@/types/product";

import Image from "next/image";

import { notFound } from "next/navigation";

import AddToCartButton from "@/components/AddToCartButton";

import { BuyButton } from "@/app/BuyButton";



interface ProductDetailPageProps {

params: { productId: string };

searchParams: { canceled?: string }; // 'canceled' opsiyonel olabilir

}



// Sonra fonksiyonu bu tek tiple doğru şekilde kullanın

export default async function ProductDetail({ params, searchParams }: ProductDetailPageProps) {

const { canceled } = searchParams;



if (canceled) {

console.log('Order canceled -- continue to shop around and checkout when you’re ready.');

}



const { productId } = params;



const docRef = doc(db, collections.products, productId);

const snapshot = await getDoc(docRef);



if (!snapshot.exists()) {

return notFound();

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

<BuyButton productId={productId} />

</div>

</div>

</div>

);

}