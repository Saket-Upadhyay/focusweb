#!/bin/bash

# Build script that mimics GitHub Actions workflow
echo "Installing dependencies..."
npm ci --ignore-scripts

echo "Installing native dependencies..."
npm rebuild

echo "Preparing Nuxt..."
npx nuxt prepare

echo "Building for production..."
npm run generate

echo "Build complete! Check the .output/public directory" 