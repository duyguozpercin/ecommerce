# 🛍️Full-Stack E-commerce Application

A modern and scalable **e-commerce web application** built with **Next.js (App Router)** and **React 19**, designed for a seamless online shopping experience.  
The project integrates **Firebase**, **Stripe**, **Vercel Blob**, and **Resend** for a production-ready workflow — including authentication, payments, file storage, and transactional emails.

---

## 🚀 Features

- 🛒 **Product Catalog** – Browse products across multiple categories with dynamic routing  
- 🔐 **User Authentication** – Email/password via Firebase Auth  
- 🧺 **Shopping Cart** – Add, update, and remove items with persistent local storage  
- 🕵️ **Product Search** – Client-side search functionality across categories  
- 🧑‍💻 **Admin Panel** – Manage products (create, edit, delete) with image uploads  
- 💳 **Payment Processing** – Secure checkout powered by Stripe  
- 📦 **Order Management** – Orders automatically saved to Firestore after successful payment  
- 📧 **Email Confirmation** – Order confirmation emails via Resend  
- 📱 **Responsive Design** – Mobile-first, accessible UI built with Tailwind CSS  
- ⚙️ **Error Handling** – Context-based feedback, toast notifications, and error boundaries  

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth (Email/Password) |
| **Payments** | Stripe (Checkout + Webhooks) |
| **File Storage** | Vercel Blob |
| **Forms** | React Hook Form + Zod Validation |
| **Email Service** | Resend API |
| **Testing** | Jest (unit tests) + Playwright (E2E tests) |

---

## 📱 Key Pages

| Route | Description |
|--------|--------------|
| `/` | Home – Featured products and categories |
| `/categories/[category]` | Product listings by category |
| `/products/[productId]` | Individual product detail page |
| `/cart` | Shopping cart management |
| `/checkout` | Stripe payment flow |
| `/login`, `/register` | User authentication pages |
| `/profile` | User order history and account info |
| `/admin` | Admin dashboard (CRUD for products) |

---

## 🔒 Authentication & Authorization

- **User Roles:** `user` (default) and `admin`  
- **Protected Routes:** Admin-only access for product management  
- **Persistent Sessions:** Managed through Firebase Auth   

---

## 💳 Payment Integration

- **Stripe Checkout:** Secure and simple payment flow  
- **Webhook Handling:** Validates payments and saves orders in Firestore  
- **Order Tracking:** Dedicated success and cancellation pages  

---

## 🎨 UI/UX Highlights

- Mobile-first responsive layout  
- Accessible, keyboard-friendly navigation  
- Skeleton loaders and smooth loading states  
- Clean, cyan-accented professional color palette  
- Toast notifications for user feedback  

---

## 🧪 Testing

- **Unit Tests:** Jest + React Testing Library for components and contexts  
- **E2E Tests:** Playwright for key user journeys (auth, cart, checkout)

---





This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
