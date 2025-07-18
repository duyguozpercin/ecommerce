
import { NewProductFormState } from '@/app/admin/products/new/page';
import { AvailabilityStatus, Category, returnPolicy } from '@/types/product';
import { z } from 'zod';
import { db, collections } from '@/utils/firebase';
import { doc, setDoc } from "firebase/firestore";
import { put } from '@vercel/blob';


export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters").max(500),
  category: z.nativeEnum(Category),
  price: z.number().min(0, "Price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative"),
  brand: z.string().optional(),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  returnPolicy: z.nativeEnum(returnPolicy),
  
});
export async function addNewProductAction(
  currentState: NewProductFormState,
  formData: FormData
): Promise<NewProductFormState> {

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
    brand: formData.get('brand') as string || undefined,
    availabilityStatus: formData.get('availabilityStatus') as AvailabilityStatus,
    returnPolicy: formData.get('returnPolicy') as returnPolicy || undefined,
  };

  const result = productSchema.safeParse(rawData);
  
  if (!result.success) {
    console.error(':x: Failed parsing form data', result.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Please correct the form input',
      inputs: { ...rawData },
      errors: result.error.flatten().fieldErrors,
    };
  }
  const id = Date.now().toString();
  const dateNow = Date.now();

  let imageUrl = '';
  const MAX_ALLOWED_IMAGE_SIZE = 4.5 * 1024 * 1024;
  const image = formData.get('image') as File | null;
  const allowedImageTypes = ['.jpeg', '.jpg', '.webp'];

  if (image && image.size > 0) {
    // Dosya tipini kontrol
    if (
      !allowedImageTypes.map((allowedType) => image.name.toLowerCase().endsWith(allowedType))
    ) {
      return {
        success: false,
        message: 'Please update product image.',
        inputs: { ...rawData },
        errors: {
          images: ['Allowed image formats: .jpeg, .jpg, .webp.'],
        },
      };
    }
  
    if (image.size > MAX_ALLOWED_IMAGE_SIZE) {
      return {
        success: false,
        message: 'Please update product image, maximum allowed size 4.5 MB',
        inputs: { ...rawData },
        errors: {
          images: ['Maximum allowed size 4.5 MB'],
        },
      };
    }
  
    // Eğer kontrol geçtiyse blob'a yükle
    const imageName = id + '.' + image.type.slice(6,);

    console.log('TOKEN (server):', process.env.BLOB_READ_WRITE_TOKEN);
  
    const blob = await put(imageName, image, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
  
    console.log('blob:', blob);
    imageUrl = blob.url;
  }
  

  

  const finalData = {
    title: result.data.title,
    description: result.data.description,
    category: result.data.category,
    price: result.data.price,
    stock: result.data.stock,
    brand: result.data.brand,
    availabilityStatus: result.data.availabilityStatus,
    returnPolicy: result.data.returnPolicy,
    meta: {
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    images: imageUrl ? [imageUrl] : [],
  };
  
  try {
    
    await setDoc(doc(db, collections.products, id), finalData);
    
    return {
      success: true,
      message: 'The product is created successfully',
      data: { id, ...result.data },
    };
  } catch (err) {
    console.error(':fire: Error adding a new product to Firebase', err);
    console.error(err);
    return {
      success: false,
      message: 'Failed creating a new product in the database',
      inputs: { ...rawData },
    };
  }
}