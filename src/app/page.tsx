import Link from "next/link";

import Image from "next/image";

import { getAllProducts } from "@/services/productService";

import { Product } from "@/types/product";

import HeroSlider from "@/components/HeroSlider";

import { BuyButton } from "./BuyButton";





interface SuccessProps {

searchParams: {

canceled?: string;


};

}



export default async function Home({ searchParams }: SuccessProps) {

const { canceled } = searchParams;



if (canceled) {

console.log(

'Order canceled -- continue to shop around and checkout when you’re ready.',

);

}



let products: Product[] = [];



try {

products = await getAllProducts();

} catch (error) {

console.error("Failed to fetch products:", error);

return <p className="text-center text-red-500 mt-10">Failed to load products.</p>;

}



return (

<>

<HeroSlider />

<main className="px-4 py-6 sm:px-6 sm:py-8">

<h1 className="text-center text-2xl sm:text-3xl m-8 font-bold dark:text-stone-900">

Ecom Website

</h1>

<div className="text-center my-12">

<Link

href="/products"

className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"

>

Tüm Ürünleri Keşfet

</Link>

</div>

<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

{products.map((product: Product) => (

<div

key={product.id}

className="bg-white shadow-xl dark:text-stone-900 rounded p-3 sm:p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer bg-[#C2C2AF] w-full"

>

<Link href={`/products/${product.id}`} className="w-full">

<div className="w-full h-[160px] sm:h-[180px] relative overflow-hidden rounded mb-3">

<Image

src={product.thumbnail || product.images?.[0] || "/placeholder.png"}

alt={product.title}

fill

className="object-cover"

sizes="100vw"

priority

/>

</div>

<h2 className="text-sm sm:text-base font-semibold text-center">{product.brand}</h2>

<p className="text-sm sm:text-md text-center">{product.title}</p>

<h2 className="font-semibold text-center text-sm sm:text-base">{product.price + "$"}</h2>

</Link>


<BuyButton productId={String(product.id)} className="mt-2 z-10 relative" />

</div>


))}

</div>

</main>

</>

);

}