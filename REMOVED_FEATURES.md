# Removed Features (Incompatible with Expo/Firebase JS SDK)

The following features were specified in the original requirements but have been removed or modified to ensure stability within the **Expo Managed Workflow** and **Firebase JS SDK 10+** environment.

| Feature | Reason | Status |
|---------|--------|--------|
| `expo-notifications` (Remote Push) | Android remote push support was removed from Expo Go (SDK 53+). | **RESTRICTED** — Only works in **Development Builds**. |
| `firebase/messaging` SDK | Not supported in Expo Managed Workflow (causes runtime crashes). | **REMOVED** — Replaced with `expo-notifications`. |
| In-app Payment Gateway | Requires native SDKs (Stripe/PayPal) which often require custom dev clients. | **REMOVED** — Replaced with "Pay at Shop" flow. |
| Phone Number OTP Auth | Firebase Phone Auth requires reCAPTCHA/SafetyNet which is unreliable in Expo Go. | **REMOVED** — Email/Password authentication only. |
| Audio/Video Calls | No native Firebase support; requires heavy WebRTC libraries/native modules. | **REMOVED** — Text-based chat only. |
| GPS-based Shop Distance | Google Maps SDK for React Native requires native configuration (`android:apiKey`). | **REMOVED** — Replaced with City-based/Name-based filtering. |
| Live Location Tracking | Requires foreground/background location native permissions/services. | **REMOVED** — Not implemented. |

> [!NOTE]
> All core booking, queuing, and real-time chat features are fully functional using supported web-based alternatives within the Expo ecosystem.
