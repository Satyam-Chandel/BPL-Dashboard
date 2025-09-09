# BPL Commander - Complete Deployment Guide

This guide provides step-by-step instructions for deploying BPL Commander to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All dependencies are installed and working locally
- [ ] Application builds successfully with `npm run build`
- [ ] All demo features are tested and functional
- [ ] Environment variables configured (if needed)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `bpl-commander`
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Production deployment**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy to Netlify**
   ```bash
   netlify deploy --dir=dist --prod
   ```

4. **Or use drag-and-drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to deploy

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts for GitHub Pages:**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/bpl-commander/', // Replace with your repo name
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Configure firebase.json:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Option 5: AWS S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Configure CloudFront**
   - Create distribution
   - Set S3 bucket as origin
   - Configure error pages for SPA routing

4. **Update DNS**
   - Point domain to CloudFront distribution

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# API Configuration (if using real backend)
VITE_API_URL=https://your-api-domain.com
VITE_APP_ENV=production

# Analytics (optional)
VITE_GA_TRACKING_ID=your-google-analytics-id

# Feature Flags
VITE_DEMO_MODE=true
VITE_OWL_ANIMATION=true
```

### Build Configuration

Update `vite.config.ts` for production:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  server: {
    port: 3000
  }
})
```

## 🛡️ Security Considerations

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

### HTTPS Configuration

- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookies if implementing real authentication

## 🔍 Performance Optimization

### Build Optimization

1. **Analyze bundle size**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Enable compression**
   ```bash
   npm install --save-dev vite-plugin-compression
   ```

3. **Add to vite.config.ts**
   ```typescript
   import compression from 'vite-plugin-compression'
   
   export default defineConfig({
     plugins: [react(), compression()]
   })
   ```

### Runtime Optimization

- Enable service worker for caching
- Implement code splitting for large components
- Use React.lazy() for route-based splitting
- Optimize images and assets

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Routing Issues (404 on refresh)**
   - Configure server for SPA routing
   - Add `_redirects` file for Netlify: `/* /index.html 200`
   - Add `vercel.json` for Vercel:
     ```json
     {
       "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
     }
     ```

3. **Assets Not Loading**
   - Check `base` configuration in `vite.config.ts`
   - Verify asset paths are relative
   - Check CORS configuration

### Performance Issues

1. **Slow Loading**
   - Enable compression
   - Use CDN for assets
   - Implement lazy loading
   - Check bundle size

2. **Memory Issues**
   - Profile with React DevTools
   - Check for memory leaks
   - Optimize large components

## 📊 Monitoring

### Analytics Setup

1. **Google Analytics 4**
   ```bash
   npm install gtag
   ```

2. **Add to main.tsx**
   ```typescript
   import { gtag } from 'gtag'
   
   gtag('config', 'YOUR-GA-ID')
   ```

### Error Tracking

1. **Sentry Integration**
   ```bash
   npm install @sentry/react
   ```

2. **Initialize in main.tsx**
   ```typescript
   import * as Sentry from "@sentry/react"
   
   Sentry.init({
     dsn: "YOUR-SENTRY-DSN"
   })
   ```

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All demo accounts work
- [ ] Owl animation functions properly
- [ ] Theme switching works
- [ ] Export features work
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Error tracking configured
- [ ] SSL certificate valid
- [ ] Domain configured correctly

## 🆘 Support

For deployment issues:

1. Check hosting platform documentation
2. Verify build logs
3. Test locally with `npm run preview`
4. Check browser console for errors
5. Validate network requests

---

**Happy Deploying!** 🚀