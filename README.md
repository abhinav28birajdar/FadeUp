# 🔺 FadeUp

<div align="center">
  <img src="./assets/images/icon.png" alt="FadeUp Logo" width="80" height="80">
  
  **Modern Barber Shop Booking Platform**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.80.1-61DAFB?style=flat&logo=react)](https://reactnative.dev)
  [![Expo](https://img.shields.io/badge/Expo%20SDK-51-000020?style=flat&logo=expo)](https://expo.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
</div>

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on devices
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## ✨ Features

**For Customers:**
- 🗺️ Find nearby barber shops
- � Book appointments easily
- ⏰ Real-time queue tracking
- ⭐ Reviews and ratings

**For Shop Owners:**
- 📊 Live dashboard
- 👥 Queue management
- 📝 Booking management
- 💬 Customer feedback

## 🛠️ Tech Stack

- **Frontend:** React Native with Expo
- **Backend:** Supabase
- **Styling:** NativeWind (TailwindCSS)
- **State:** Zustand
- **Maps:** React Native Maps

## 📄 License

MIT License - see LICENSE file for details.

---

<div align="center">
  Built with ❤️ for the modern barbering community
</div>

---

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm test           # Run Jest tests
npm run test:watch # Run tests in watch mode
```

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

### Project Structure
```
fadeUp/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   ├── (customer)/        # Customer-specific screens
│   ├── (shopkeeper)/      # Shop owner screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/              # External service integrations
│   ├── store/            # State management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── assets/               # Images, fonts, and static files
├── __tests__/           # Test files
└── reports/             # Analysis and documentation
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test mapHelpers.test.ts

# Run tests in watch mode
npm run test:watch
```

---

## 🚀 Deployment

### Development Build
```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### Production Build (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas init

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Web Deployment
```bash
npx expo export:web
# Deploy the `dist/` folder to your hosting provider
```

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Guidelines

1. Follow TypeScript best practices
2. Use the established component patterns
3. Maintain consistent code formatting
4. Add proper error handling
5. Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **Expo** for simplifying React Native development and deployment
- **Moti** for beautiful, performant animation capabilities
- The **React Native community** for continuous innovation and support

---

<div align="center">
  <strong>Built with ❤️ for the modern barbering community</strong>
  
  <br><br>
  
  [Report Bug](https://github.com/abhinav28birajdar/FadeUp/issues) • 
  [Request Feature](https://github.com/abhinav28birajdar/FadeUp/issues) • 
  [Documentation](https://github.com/abhinav28birajdar/FadeUp/wiki)
</div>
