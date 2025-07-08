# Just A Min - Focus Timer App

A beautiful, water-themed focus timer I built while learning Vue 3 and Nuxt 3. I'm new to web development and wanted to create something practical that I could use in my iPad as a webview App (new to iOS dev too!)

## What I Built

This is a focus timer that shows time in natural language (like "5 minutes left" or "Only 20 seconds to go!"). It has a calming water animation background that gets more intense as the timer progresses - starting with gentle drizzle and building up to thunderstorms with lightning.

## Features I Learned to Implement

- **Conversational Timer**: Shows time in words instead of numbers
- **Water Animation**: Canvas-based rain and puddle effects that respond to timer progress
- **Responsive Design**: Scales properly across different screen sizes
- **Keyboard Controls**: Space to start/pause, R to reset, arrow keys to adjust minutes
- **URL Parameters**: Set timer duration via URL (e.g., `?min=10` for 10 minutes)
- **Progressive Weather**: Rain intensity and thunder effects increase as timer progresses

## Project Structure

```
focusweb/
├── README.md          # ← You are here
├── nuxt-app/          # ← The actual Vue/Nuxt app
│   ├── components/    # Vue components
│   ├── pages/         # App pages
│   ├── package.json   # Dependencies
│   └── ...
```

## How to Run (For My Future Self)

Since I'm learning, here's how to get this running:

```bash
# Navigate to the app folder
cd nuxt-app

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Deploy to GitHub Pages

To deploy this to GitHub Pages:

1. **Build the static site:**
   ```bash
   cd nuxt-app
   npm run build:static
   ```

2. **In GitHub repository settings:**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (or `main` with `/docs` folder)
   - Folder: `/` (root)

3. **The app will be available at:** `https://yourusername.github.io/focusweb/`

## What I Used

- **Vue 3** with Composition API (my first time!)
- **Nuxt 3** for the framework
- **TypeScript** for better code quality
- **Canvas API** for the water animations
- **CSS Grid/Flexbox** for responsive design

## Components I Created

- `FocusTimer.vue` - Main timer logic and UI
- `Paani.vue` - Water animation (canvas-based)
- `MinuteWheelPicker.vue` - Interactive minute selector

## My Learning Journey

This was my first real web app using modern JavaScript frameworks. I learned:
- How Vue components work together
- Canvas animations and particle systems
- Responsive design with CSS
- TypeScript basics
- Nuxt 3 project structure

The app is designed to work well in iOS webviews, which is how I plan to use it for my own focus sessions.