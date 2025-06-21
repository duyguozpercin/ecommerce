import { useEffect, useState } from 'react';

interface Product {
  id: string
  title: string
}

export default function Home() {
  const [products, setProducts] = useState([]);
useEffect(() => {
  fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then(data => setProducts(data.products))
    .catch(error => console.log('Error fetching products:', error));
}, []);
  return 
  <main>
  <h1 className='text-center m-12'>Ecom website</h1>
  {products.map((product: Product) => {
    return <h2 key={product.id}>{product.title}</h2>;
  })}
</main>
}
