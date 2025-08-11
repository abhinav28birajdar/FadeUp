# 🔺 FadeUp - Modern Barber Shop Booking Platform

<div align="center">
  <img src="./assets/images/icon.png" alt="FadeUp Logo" width="120" height="120">
  
  **The ultimate barbering experience platform - Book your perfect cut with FadeUp**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?style=flat&logo=react)](https://reactnative.dev)
  [![Expo](https://img.shields.io/badge/Expo%20SDK-53.0-000020?style=flat&logo=expo)](https://expo.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-2.40.0-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![NativeWind](https://img.shields.io/badge/NativeWind-4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://nativewind.dev)
</div>

---

## 🎯 About FadeUp

FadeUp is a premium, full-stack mobile application that transforms the barbering industry by seamlessly connecting customers with barber shops through an intuitive booking platform and real-time queue management system. Featuring a modern dark-themed UI with smooth animations, FadeUp delivers an exceptional user experience for both customers seeking the perfect cut and shopkeepers managing their business efficiently.

### ✨ Key Features

#### 👤 For Customers
- **🗺️ Smart Shop Discovery**: Find nearby barber shops within a 20km radius using precise geolocation
- **📱 Interactive Map View**: Explore shops visually with integrated maps
- **⏰ Real-time Queue Tracking**: Monitor your position and estimated wait time live
- **📅 Seamless Booking**: Browse services, select time slots, and book appointments effortlessly
- **⭐ Reviews & Ratings**: Read feedback and view shop ratings for informed decisions
- **🔔 Push Notifications**: Stay updated on booking confirmations and queue status

#### 🏪 For Shopkeepers
- **📊 Live Dashboard**: Real-time overview of bookings, queue status, and business metrics
- **👥 Advanced Queue Management**: Control customer flow with granular status updates
- **📝 Booking Management**: View detailed booking information and customer preferences
- **💬 Customer Insights**: Access reviews and ratings to improve services
- **📈 Business Analytics**: Track performance metrics and customer satisfaction

---

## 🏗️ Technology Stack

- **Frontend**: React Native 0.79.5 with Expo SDK 53.0
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Styling**: NativeWind (TailwindCSS for React Native) with custom design system
- **Animations**: Moti for fluid, responsive UI animations
- **State Management**: Zustand for lightweight, TypeScript-first state management
- **Maps**: react-native-maps for interactive location features
- **Location Services**: expo-location for precise geolocation
- **Push Notifications**: expo-notifications for real-time updates
- **Image Handling**: expo-image for optimized image loading and caching

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Expo CLI**: `npm install -g expo-cli`
- **Development Environment**: iOS Simulator (macOS) or Android Studio/Device
- **Backend**: Supabase account

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

3. **Environment setup**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Navigate to the SQL Editor in your Supabase Dashboard
   - Copy and run the complete `database.sql` file (found in the root directory)
   - Enable Realtime for these tables in Database → Realtime:
     - `queue`
     - `bookings` 
     - `notifications`

5. **Start development server**
   ```bash
   npm start
   ```

6. **Launch the app**
   - **iOS**: Press `i` to open in iOS Simulator
   - **Android**: Press `a` to open in Android Emulator  
   - **Physical Device**: Scan QR code with Expo Go app

---

## 📱 How to Use the Application

### For Customers

1. **Registration**: Sign up and select "Customer" role
2. **Browse Shops**: Use the map or list view to find nearby barber shops
3. **Book Services**: Select a shop, choose services, and book your appointment
4. **Track Queue**: Monitor your real-time position in the queue
5. **Leave Reviews**: Rate and review your experience after completion

### For Shopkeepers

1. **Registration**: Sign up, select "Shopkeeper" role, and register your shop details
2. **Manage Services**: Add your services with pricing and duration
3. **Handle Bookings**: Accept/decline bookings and manage your schedule
4. **Queue Control**: Move customers through the queue (waiting → in service → completed)
5. **View Analytics**: Track customer feedback and business performance

---

## 📁 Project Structure

```
FadeUp/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Authentication flow
│   │   ├── role-select.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── register-shop-details.tsx
│   ├── (customer)/         # Customer role screens
│   │   ├── home.tsx
│   │   ├── explore-map.tsx
│   │   ├── queue.tsx
│   │   ├── booking/
│   │   ├── service/
│   │   └── shop/
│   ├── (shopkeeper)/       # Shopkeeper role screens
│   │   ├── dashboard.tsx
│   │   ├── queue.tsx
│   │   ├── feedback.tsx
│   │   └── dashboard/
│   ├── _layout.tsx         # Root layout with auth handling
│   ├── index.tsx           # Entry point
│   └── modal.tsx           # Modal screens
├── assets/                 # Static assets
│   ├── fonts/
│   └── images/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ModernCard.tsx
│   │   ├── QueueItem.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingStates.tsx
│   ├── lib/                # Core libraries
│   │   ├── supabase.ts
│   │   ├── queueRealtime.ts
│   │   └── notifications.ts
│   ├── store/              # Zustand state management
│   │   └── authStore.ts
│   ├── types/              # TypeScript definitions
│   │   └── supabase.ts
│   └── utils/              # Utility functions
│       ├── location.ts
│       ├── mapHelpers.ts
│       └── queueUtils.ts
├── database.sql            # Complete database schema
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Styling configuration
└── README.md              # This file
```

---

## 🔧 Configuration

### Supabase Configuration

1. **Create Project**: Set up a new project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Add your project URL and anon key to `.env`
3. **Database Setup**: Run the `database.sql` file in the SQL Editor
4. **Realtime Setup**: Enable realtime for `queue`, `bookings`, and `notifications` tables
5. **Row Level Security**: RLS policies are automatically configured via the SQL script

### Push Notifications Setup

1. **Expo Project**: Ensure your app is properly configured in Expo
2. **Permissions**: The app will request notification permissions on first launch
3. **Testing**: Use Expo's push notification tool for testing

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Comprehensive database policies ensure data isolation
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Location Privacy**: Location data used only for shop discovery, not permanently stored
- **Data Validation**: Both client-side and server-side validation for all inputs
- **Error Handling**: Graceful error boundaries and fallback states

---

## 🚀 Performance Optimizations

- **Component Memoization**: React.memo used for expensive components
- **Image Optimization**: expo-image with caching and lazy loading
- **Real-time Efficiency**: Optimized Supabase subscriptions
- **Bundle Optimization**: Tree-shaking and code splitting
- **Memory Management**: Proper cleanup of subscriptions and listeners

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
