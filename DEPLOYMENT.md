# Vercel Deployment Guide

This project is structured as a monorepo with two main applications:
1. **Marketing Website (Client)**: Built with Next.js in `apps/client`
2. **Admin Dashboard (Staff)**: Built with React/Vite in `apps/admin`

## Option 1: Two Separate Vercel Projects (Recommended)

This is the most reliable way to host monorepos on Vercel.

### 1. Deploy the Marketing Website
- Create a new project in Vercel.
- Select this repository.
- **Root Directory**: `apps/client`
- **Framework Preset**: Next.js
- **Environment Variables**: Add any needed for the client.
- **URL Example**: `bidboss.vercel.app`

### 2. Deploy the Admin Dashboard
- Create another new project in Vercel.
- Select the same repository.
- **Root Directory**: `apps/admin`
- **Framework Preset**: Vite
- **Environment Variables**: Add any needed for the admin.
- **URL Example**: `bidboss-admin.vercel.app`

---

## Option 2: Single Domain with Rewrites

If you want both apps on the same domain (e.g., `bidboss.com` and `bidboss.com/admin`), follow these steps:

1. Deploy the **Marketing Website** as the main project.
2. In the `apps/client/next.config.js`, add a rewrite:

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: 'https://bidboss-admin.vercel.app/:path*',
      },
    ]
  },
}
```

## Authentication
The Admin Dashboard is now gated by a **Staff Portal Login Page**.
- **Default Username**: `admin`
- **Default Password**: `admin123` (Change this in `apps/admin/src/components/auth/LoginPage.tsx`)
