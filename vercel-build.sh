#!/bin/bash

# Vercel build script for CS2Smokes

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run Next.js build
echo "Building Next.js application..."
npm run build
