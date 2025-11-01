# Cloudinary Image Upload Setup

This application uses Cloudinary for optimized image storage and delivery.

## Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Your Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy the following values:
   - **Cloud Name**: Found in the dashboard header
   - **API Key**: Under "Account Details"
   - **API Secret**: Click "Reveal" under "Account Details"

## Features

- **Automatic Optimization**: Images are automatically converted to WebP format when supported
- **CDN Delivery**: Fast global delivery via Cloudinary's CDN
- **Transformations**: Resize, crop, and optimize images on-the-fly via URL parameters
- **Free Tier**: 25GB storage + 25GB bandwidth/month

## Usage in Admin Dashboard

1. Open the Product Manager
2. Click "Create Product" or edit an existing product
3. Click "Choose Image" button
4. Select an image file (JPEG, PNG, WebP, GIF - max 10MB)
5. Image is automatically uploaded to Cloudinary and URL is saved
6. Preview appears immediately

You can also toggle to "Use Manual URL" if you prefer to paste an external image URL.

## Image URL Transformations

Once uploaded, you can use Cloudinary's transformation parameters:

```
Original: https://res.cloudinary.com/your-cloud/image/upload/products/image.jpg
Resized: https://res.cloudinary.com/your-cloud/image/upload/w_400/products/image.jpg
Quality: https://res.cloudinary.com/your-cloud/image/upload/q_50/products/image.jpg
```

See [Cloudinary Documentation](https://cloudinary.com/documentation) for more transformations.

