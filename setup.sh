#!/bin/bash

# FadeUp Setup Script
# This script helps set up the development environment for FadeUp

echo "🚀 FadeUp - Barber Connect Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if Expo CLI is installed
if ! command -v npx expo &> /dev/null; then
    echo "⚠️  Expo CLI not found. Installing globally..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI is available"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your Firebase and Google OAuth configuration"
else
    echo "✅ .env file already exists"
fi

# Check for Firebase configuration files
echo ""
echo "🔥 Checking Firebase configuration..."

if [ ! -f google-services.json ]; then
    echo "⚠️  google-services.json not found"
    echo "   Download from Firebase Console > Project Settings > Your apps > Android app"
fi

if [ ! -f GoogleService-Info.plist ]; then
    echo "⚠️  GoogleService-Info.plist not found"
    echo "   Download from Firebase Console > Project Settings > Your apps > iOS app"
fi

# Create directories if they don't exist
echo ""
echo "📁 Creating required directories..."
mkdir -p assets/sounds
mkdir -p assets/images
echo "✅ Directories created"

# Display next steps
echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 🔧 Configure Firebase:"
echo "   - Go to https://console.firebase.google.com"
echo "   - Create a new project or use existing"
echo "   - Add Android and iOS apps"
echo "   - Download google-services.json and GoogleService-Info.plist"
echo "   - Place them in the root directory"
echo ""
echo "2. 🔑 Configure Google Sign-In:"
echo "   - Follow the guide: docs/GOOGLE_SIGNIN_SETUP.md"
echo "   - Update your .env file with the client IDs"
echo ""
echo "3. 🗺️  Get Google Maps API key:"
echo "   - Go to Google Cloud Console"
echo "   - Enable Maps SDK for Android and iOS"
echo "   - Create an API key"
echo "   - Add it to your .env file"
echo ""
echo "4. 🚀 Start development:"
echo "   npx expo start --clear"
echo ""
echo "Need help? Check the documentation:"
echo "- docs/GOOGLE_SIGNIN_SETUP.md"
echo "- docs/ENHANCEMENT_SUMMARY.md"
echo "- README.md"