# FadeUp - Real-time Barber Queue & Booking App

FadeUp is a complete React Native Expo app that connects barbers and customers through real-time queue management and booking system. Built with TypeScript, Firebase, and modern React Native practices.

## 🚀 Features

### For Customers
- **Find Nearby Barbers**: GPS-based shop discovery with distance sorting
- **Real-time Queue**: Join queues remotely and get live position updates
- **Service Booking**: Browse services, prices, and estimated wait times
- **Live Notifications**: Get notified when it's your turn
- **Queue Management**: View position, estimated wait time, and leave queue

### For Barbers
- **Shop Management**: Create and manage shop profile, services, and hours
- **Real-time Queue View**: See all waiting customers with details
- **Service Completion**: Mark customers as done with one tap
- **Shop Status**: Toggle open/closed status
- **Customer Management**: View customer details and service history

### Technical Features
- **Real-time Updates**: Instant queue updates using Firebase Firestore
- **Offline Support**: Cached data with sync when back online
- **Location Services**: GPS integration with permission handling
- **Google Authentication**: Easy sign-in with Google OAuth
- **Role-based Access**: Separate experiences for barbers and customers
- **TypeScript**: Full type safety throughout the app
- **Modern UI**: Clean, mobile-first design with consistent styling

## 🛠 Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Firebase (Authentication + Firestore + Cloud Functions)
- **Real-time**: Firebase Firestore real-time listeners
- **Location**: expo-location + react-native-maps
- **Authentication**: Firebase Auth + Google Sign-In
- **State Management**: React Context + React Query patterns
- **Testing**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions ready

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Google Cloud Console account (for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FadeUp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   
   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   
   b. Enable the following services:
      - Authentication (Email/Password + Google)
      - Firestore Database
      - Cloud Functions
      - Firebase Cloud Messaging
   
   c. Copy your Firebase config and create `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   d. Fill in your Firebase configuration in `.env`

4. **Start the development server**
   ```bash
   npm start
   ```

## 🗃 Project Structure

The app follows a clean, modular architecture with TypeScript throughout.

## 📊 Database Schema

### Collections

#### Users, Shops, Services, Queue
See the TypeScript types in `src/types/index.ts` for complete schema definitions.

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

Build the app using Expo build tools and deploy Firebase backend.

## 📄 License

MIT License

---

**FadeUp** - Skip the wait, book your cut! ✂️