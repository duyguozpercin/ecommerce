import { useEffect, useState } from 'react';

export default function Home() {
  const [prodocts, setProducts] = useState([]);
useEffect(() => {
  fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then(data => setProducts(data.products))
    .catch(error => console.log('Error fetching products:', error));
}, []);
  return 
  <main>
    <h1 className="text-center m-12">Home Page</h1>
    </main>
}
