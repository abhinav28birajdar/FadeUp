# 🔺 FadeUp - Premium Barber Shop Booking Platform

<div align="center">
  <img src="./assets/images/icon.png" alt="FadeUp Logo" width="120" height="120">
  
  **Book your perfect cut with FadeUp - The ultimate barbering experience platform**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?style=flat&logo=react)](https://reactnative.dev)
  [![Expo](https://img.shields.io/badge/Expo%20SDK-53.0-000020?style=flat&logo=expo)](https://expo.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-2.40.0-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![NativeWind](https://img.shields.io/badge/NativeWind-4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://nativewind.dev)
</div>

## ✨ About FadeUp

FadeUp is a sophisticated, full-stack mobile application that revolutionizes the barbering industry by connecting customers with premium barber shops through an intuitive booking platform and real-time queue management system. Built with modern technologies and featuring a sleek dark-themed UI, FadeUp delivers a premium user experience for both customers seeking the perfect cut and shopkeepers managing their business.

### 🎯 Key Features

#### For Customers
- **🗺️ Smart Shop Discovery**: Find nearby barber shops within a 20km radius using precise geolocation
- **📱 Interactive Map View**: Explore shops visually with react-native-maps integration  
- **⏰ Real-time Queue Status**: Monitor your position and estimated wait time live
- **💼 Service Booking**: Browse services, select time slots, and book appointments seamlessly
- **⭐ Reviews & Ratings**: Read feedback and view shop ratings to make informed decisions

#### For Shopkeepers
- **🏪 Shop Management**: Register and manage comprehensive shop details with geolocation
- **📊 Live Dashboard**: Real-time overview of bookings, queue status, and key metrics
- **👥 Queue Control**: Manage customer flow with granular status updates (waiting, ready, in-progress, completed)
- **📝 Booking Management**: View detailed booking information and customer notes
- **💬 Feedback Insights**: Access customer reviews and ratings for your services

### 🏗️ Architecture

FadeUp leverages a modern, scalable tech stack:

- **Frontend**: React Native with Expo for cross-platform mobile development
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Styling**: NativeWind (TailwindCSS for React Native) with custom brand palette
- **Animations**: Moti for fluid, responsive UI animations
- **State Management**: Zustand for lightweight, TypeScript-first state management
- **Maps**: react-native-maps for interactive map experiences
- **Location**: expo-location for precise geolocation services

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio/Device
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhinav28birajdar/FadeUp.git
   cd FadeUp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL script from `supabase-schema.sql` in the SQL Editor
   - Enable Realtime for the tables specified in the schema

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Launch on device or simulator**
   - Press `i` to open in iOS Simulator
   - Press `a` to open in Android Emulator
   - Scan the QR code with Expo Go app on your physical device

### Project Structure

```
fadeUp/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Authentication screens
│   ├── (customer)/         # Customer role screens
│   ├── (shopkeeper)/       # Shopkeeper role screens
│   └── (tabs)/             # Tab navigation screens
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable UI components
├── constants/              # App constants and themes
├── hooks/                  # Custom React hooks
├── src/
│   ├── components/         # Application-specific components
│   ├── lib/                # Library code (Supabase, notifications)
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── supabase-schema.sql     # Database schema definition
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Comprehensive database policies ensure users can only access their own data
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Location Privacy**: Location data used only for shop discovery, not stored permanently
- **Data Validation**: Client and server-side validation for all user inputs

## 🤝 Contributing

We welcome contributions to FadeUp! Please see our contributing guidelines for more information.


## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **Expo** for simplifying React Native development
- **Moti** for beautiful animation capabilities
- The React Native community for continuous innovation

---

<div align="center">
  <strong>Built with ❤️ for the barbering community</strong>

</div>
