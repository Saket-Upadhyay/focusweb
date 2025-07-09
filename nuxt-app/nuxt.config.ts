// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Just A Min',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A beautiful, water-themed focus timer built with Vue 3 and Nuxt 3' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' }
      ]
    },
    baseURL: process.env.NODE_ENV === 'production' ? '/focusweb/' : '/'
  },
  
  // Enable static site generation for GitHub Pages
  ssr: false,
  
  // Build configuration for static hosting
  nitro: {
    preset: 'static'
  },
  
  // Ensure proper static generation
  experimental: {
    payloadExtraction: false
  }
});