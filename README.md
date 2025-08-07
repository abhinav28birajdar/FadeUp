# 🔺 FadeUp - Premium Barber Shop Booking Platform

<div align="center">
  <img src="./assets/images/icon.png" alt="FadeUp Logo" width="120" height="120">
  
  **Book your perfect cut with FadeUp - The ultimate barbering experience platform**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.72+-61DAFB?style=flat&logo=react)](https://reactnative.dev)
  [![Expo](https://img.shields.io/badge/Expo%20SDK-49+-000020?style=flat&logo=expo)](https://expo.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
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
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio/Device
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fadeup.git
   cd fadeup
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Execute the provided SQL schema in your Supabase project:
   ```bash
   # Copy contents of supabase_schema.sql to Supabase SQL Editor and run
   ```

5. **Enable Realtime**
   
   In Supabase Dashboard → Database → Realtime:
   - Enable realtime for `public.queue` table

6. **Start Development**
   ```bash
   npx expo start --clear
   ```

## 📱 Screenshots

*Coming soon - Showcase of the beautiful dark-themed UI with brand-aligned gold accents*

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key to `.env`
3. Run the SQL schema from `supabase_schema.sql`
4. Enable email authentication in Auth settings
5. Enable realtime for the queue table

### Color Palette

FadeUp features a carefully crafted dark theme with brand-inspired accents:

```javascript
// Brand Colors
'brand-primary': '#CB9C5E',    // Gold - Primary CTAs
'brand-secondary': '#827092',   // Purple-Brown - Secondary elements

// Dark Theme
'dark-background': '#121212',   // Primary background
'dark-card': '#27272A',        // Card backgrounds
'dark-border': '#52525B',      // Subtle borders

// Status Colors  
'status-completed': '#10B981',  // Success/completed
'status-pending': '#F97316',    // Warning/pending
'status-in-progress': '#8884d8' // In progress
```

## 🗂️ Project Structure

```
fadeup/
├── app/                        # Expo Router screens
│   ├── (auth)/                # Authentication flow
│   ├── (customer)/            # Customer-specific screens  
│   ├── (shopkeeper)/          # Shopkeeper-specific screens
│   └── _layout.tsx            # Root layout with auth management
├── src/
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Core utilities (Supabase, realtime)
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions (location, maps, queue)
├── assets/                    # Static assets
└── supabase_schema.sql        # Database schema
```

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Comprehensive database policies ensure users can only access their own data
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Location Privacy**: Location data used only for shop discovery, not stored permanently
- **Data Validation**: Client and server-side validation for all user inputs

## 🤝 Contributing

We welcome contributions to FadeUp! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **Expo** for simplifying React Native development
- **Moti** for beautiful animation capabilities
- The React Native community for continuous innovation

---

<div align="center">
  <strong>Built with ❤️ for the barbering community</strong>
  
  [Website](https://fadeup.app) • [Documentation](https://docs.fadeup.app) • [Support](mailto:support@fadeup.app)
</div>