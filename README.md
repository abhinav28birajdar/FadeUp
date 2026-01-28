# FadeUp - Premium Barber Booking App

<p align="center">
  <img src="src/assets/icon.png" alt="FadeUp Logo" width="120px">
</p>

## 🚀 Status: Active Development
**FadeUp** is a full-stack appointment management platform built with **React Native (Expo)** and **Supabase**. We are actively building the core business logic, database relationships, and distinct workflows for both barbers and clients.

## 🛠️ Tech Stack
* **Frontend:** React Native with Expo (Managed Workflow)
* **Navigation:** Expo Router (File-based)
* **Backend/Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Email/OTP & Social Login)
* **Storage:** Supabase Buckets (Profile Photos, Portfolios)
* **Maps:** React Native Maps / Google Places API

---

## ⚙️ Core Functions & Modules

### 👤 Customer Mode
* **Smart Explore & Geolocation:**
    * Real-time "Near Me" search using device location.
    * **Price Comparison Engine:** Filter shops by service cost (Low-to-High) to find the best deals.
    * Dynamic filtering by specific services (e.g., "Fade," "Beard Trim," "Facial").
* **Booking Management:**
    * Live slot selection based on barber availability.
    * Deposit/Partial payment handling.
    * Appointment history & easy "Rebook" functionality.
* **User Profile:**
    * Personal details and avatar management.
    * **Favorites List:** Save go-to barbers for quick access.
    * **Loyalty Wallet:** Track points/stamps earned from specific shops.

### ✂️ Barber/Shop Mode
* **Shop Management Console:**
    * Service Menu Editor: Add services, duration, and pricing.
    * **Dynamic Portfolio:** Upload and delete photos of recent cuts to showcase skills.
    * Operating Hours: Set weekly schedules and specific "Time Off" blocks.
* **Queue & Request Hub:**
    * Incoming Booking Requests: Accept or Reject logic with reason input.
    * Live Queue Dashboard: Mark customers as "Seated," "Completed," or "No-Show."
* **Financials:**
    * Daily/Weekly earning reports.
    * Commission tracking (if applicable).

### 🤝 Shared Features
* **Authentication Flow:** Secure login/signup with role selection (Customer vs. Barber).
* **In-App Chat:** Real-time messaging for rescheduling or location inquiries (Supabase Realtime).
* **Reviews & Ratings:**
    * Customers can rate completed appointments.
    * Barbers can reply to feedback.

---

## 🎯 Next Goals (Roadmap)
- [ ] **Waitlist System:** Allow customers to join a waitlist for fully booked days.
- [ ] **Staff Management:** Allow "Shop Owners" to manage multiple "Barber" accounts under one shop.
- [ ] **No-Show Protection:** Implement cancellation fees via Stripe integration.
- [ ] **AI Recommendations:** Suggest cuts based on face shape or trends (Future Scope).

---

### 📂 View Latest Progress
This branch focuses on the implementation of backend logic and functional components. To view the stable version or contribute:

👉 **Check the [Main Branch](https://github.com/abhinav28birajdar/FadeUp/tree/main)**