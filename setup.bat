@echo off
REM FadeUp Setup Script for Windows
REM This script helps set up the development environment for FadeUp

echo 🚀 FadeUp - Barber Connect Setup
echo =================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if Expo CLI is available
npx expo --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Expo CLI not found. Installing globally...
    npm install -g @expo/cli
)

echo ✅ Expo CLI is available

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Copy environment file
echo.
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit .env file with your Firebase and Google OAuth configuration
) else (
    echo ✅ .env file already exists
)

REM Check for Firebase configuration files
echo.
echo 🔥 Checking Firebase configuration...

if not exist google-services.json (
    echo ⚠️  google-services.json not found
    echo    Download from Firebase Console ^> Project Settings ^> Your apps ^> Android app
)

if not exist GoogleService-Info.plist (
    echo ⚠️  GoogleService-Info.plist not found
    echo    Download from Firebase Console ^> Project Settings ^> Your apps ^> iOS app
)

REM Create directories if they don't exist
echo.
echo 📁 Creating required directories...
if not exist assets\sounds mkdir assets\sounds
if not exist assets\images mkdir assets\images
echo ✅ Directories created

REM Display next steps
echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. 🔧 Configure Firebase:
echo    - Go to https://console.firebase.google.com
echo    - Create a new project or use existing
echo    - Add Android and iOS apps
echo    - Download google-services.json and GoogleService-Info.plist
echo    - Place them in the root directory
echo.
echo 2. 🔑 Configure Google Sign-In:
echo    - Follow the guide: docs\GOOGLE_SIGNIN_SETUP.md
echo    - Update your .env file with the client IDs
echo.
echo 3. 🗺️  Get Google Maps API key:
echo    - Go to Google Cloud Console
echo    - Enable Maps SDK for Android and iOS
echo    - Create an API key
echo    - Add it to your .env file
echo.
echo 4. 🚀 Start development:
echo    npx expo start --clear
echo.
echo Need help? Check the documentation:
echo - docs\GOOGLE_SIGNIN_SETUP.md
echo - docs\ENHANCEMENT_SUMMARY.md
echo - README.md
echo.
pause