interface Product {
  id: string;
  title: string;
}

export default async function Home() {
  let products = [];
  let loading = true;
  try {
    const res = await fetch('https://dummyjson.com/products');
    const data = await res.json();
    products = data.products;
  } catch (error) {
    console.log(error);
  } finally {
    loading = false;
  }

  if (loading) return <p>Loading....</p>;

  return (
    <main>
      <h1 className='text-center m-12'>Ecom website</h1>
      {products.map((product: Product) => {
        return <h2 key={product.id}>{product.title}</h2>;
      })}
    </main>
  );
}