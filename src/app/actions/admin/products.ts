

import { NewProductFormState } from '@/app/admin/products/new/page';
import { AvailabilityStatus, Category, returnPolicy } from '@/types/product';
import { z } from 'zod';
import { db, collections } from '@/utils/firebase';
import { doc, setDoc } from "firebase/firestore";
import { put } from '@vercel/blob';


export const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category),
  price: z.number().min(0),
  stock: z.number().min(0),
  brand: z.string().min(1),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  returnPolicy: z.nativeEnum(returnPolicy),
  tags: z.array(z.string()).min(1),
  sku: z.string().min(1).max(50),
  weight: z.number().min(1),
  warrantyInformation: z.string().min(1),
  shippingInformation: z.string().min(1),
  dimensions: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    depth: z.number().min(1),
  }),
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
    sku: formData.get('sku') as string || undefined,
    weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
    warrantyInformation: formData.get('warrantyInformation') as string || undefined,
    shippingInformation: formData.get('shippingInformation') as string || undefined,
    dimensions: formData.get('dimensions.width')
      ? {
        width: parseFloat(formData.get('dimensions.width') as string),
        height: parseFloat(formData.get('dimensions.height') as string),
        depth: parseFloat(formData.get('dimensions.depth') as string),
      }
      : undefined,
    tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [],
  };

  
  const result = productSchema.safeParse(rawData);
  
 
  if (!result.success) {
    console.error(':x: Form verisi ayrıştırılamadı', result.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Lütfen form girdilerini düzeltin.',
      inputs: { ...rawData },
      errors: result.error.flatten().fieldErrors,
    };
  }

  const id = Date.now().toString();
  const dateNow = Date.now();
  let imageUrl = '';
  const image = formData.get('image') as File | null;


  if (image && image.size > 0) {
    const MAX_ALLOWED_IMAGE_SIZE = 4.5 * 1024 * 1024;
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/webp'];

    if (!allowedImageTypes.includes(image.type)) {
      return { success: false, message: 'İzin verilen resim formatları: .jpeg, .jpg, .webp.' };
    }
  
    if (image.size > MAX_ALLOWED_IMAGE_SIZE) {
      return { success: false, message: 'Maksimum resim boyutu 4.5 MB olabilir.' };
    }
  
    const imageName = `${id}.${image.name.split('.').pop()}`;
    const blob = await put(imageName, image, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    imageUrl = blob.url;
  }
  
  
  const finalData = {
    ...result.data,
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
      message: 'Ürün başarıyla oluşturuldu!',
      data: { id, ...result.data },
    };
  } catch (err) {
    console.error(':fire: Firebase\'e yeni ürün eklenirken hata oluştu', err);
    return {
      success: false,
      message: 'Veritabanında ürün oluşturulurken bir hata oluştu.',
      inputs: { ...rawData },
    };
  }
}