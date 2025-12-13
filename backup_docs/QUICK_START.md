# 🚀 FadeUp - Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Create Supabase Project (2 min)
1. Go to https://supabase.com
2. Click "New Project"
3. Choose a name (e.g., "fadeup-app")
4. Set a database password
5. Wait for project to be ready

### Step 3: Setup Database (1 min)
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy **entire contents** of `database/schema.sql` from your project
4. Paste and click "Run"
5. Wait for ✅ "Success. No rows returned"

### Step 4: Get Your Credentials (30 sec)
In Supabase Dashboard:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)

### Step 5: Run the App (30 sec)
```bash
npm run start
```

Press:
- `i` for iOS simulator
- `a` for Android emulator  
- `w` for web browser

### Step 6: Configure In-App (1 min)
When app opens:
1. Navigate to **Settings** or **Config** screen
2. Paste your Supabase URL
3. Paste your Supabase Anon Key
4. Tap **Save**

### ✅ Done!

You can now:
- Sign up / Sign in
- Browse shops
- Join queues
- Create bookings
- All in real-time! 🎉

---

## Troubleshooting

### "Supabase not initialized"
- Make sure you entered credentials in the Config screen
- Restart the app after saving config

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Database errors
- Make sure you ran the ENTIRE schema.sql file
- Check for any error messages in Supabase SQL Editor

---

## What to Try First

### 1. Create an Account
- Open the app → Sign Up
- Choose **Customer** role
- Fill in details
- Tap **Sign Up**

### 2. Explore Features
- Browse nearby shops (may be empty if no test data)
- Check out the queue system
- Try the booking flow
- Toggle dark mode in settings

### 3. Add Test Data (Optional)
In Supabase Dashboard → SQL Editor:

```sql
-- Add a test shop
INSERT INTO shops (
  owner_id, 
  name, 
  slug, 
  address, 
  city, 
  state, 
  latitude, 
  longitude, 
  status, 
  is_open
) VALUES (
  (SELECT id FROM profiles LIMIT 1), 
  'The Fresh Cut', 
  'fresh-cut', 
  '123 Main St', 
  'New York', 
  'NY', 
  40.7128, 
  -74.0060, 
  'active', 
  true
);

-- Add test services
INSERT INTO services (shop_id, name, price, duration_minutes)
SELECT 
  id,
  service_name,
  price,
  duration
FROM shops,
  (VALUES 
    ('Classic Haircut', 30.00, 30),
    ('Beard Trim', 15.00, 15),
    ('Hot Shave', 25.00, 20)
  ) AS s(service_name, price, duration)
WHERE name = 'The Fresh Cut';
```

---

## Development Tips

### Hot Reload
- Save any file → App updates automatically
- Shake device for dev menu
- `Cmd/Ctrl + D` for debug menu

### Debug Console
```bash
# In a new terminal
npx react-native log-ios     # For iOS
npx react-native log-android # For Android
```

### Theme Testing
```typescript
// In any component
import { useThemeStore } from '@/src/theme';

const { setMode } = useThemeStore();

// Test themes
<Button onPress={() => setMode('dark')}>Dark</Button>
<Button onPress={() => setMode('light')}>Light</Button>
```

---

## Common Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Clean rebuild
npm run start -- --clear

# Run tests
npm test
```

---

## File Structure Overview

```
Most Important Files:
├── app/_layout.tsx ← App entry point
├── database/schema.sql ← Database structure
├── src/
│   ├── services/supabase/ ← Backend API layer
│   ├── contexts/ ← Global state (Auth, Queue, Booking)
│   ├── screens/ ← All app screens
│   ├── components/ui/ ← Reusable UI components
│   └── theme/ ← Colors, spacing, typography
```

---

## Next Steps

1. **Customize the app**
   - Update colors in `src/theme/index.ts`
   - Add your logo in `assets/images/`
   - Modify screens to fit your needs

2. **Add features**
   - Implement search
   - Add image uploads
   - Build notification system
   - Create analytics dashboard

3. **Deploy**
   - Set up EAS Build
   - Create App Store/Play Store accounts
   - Submit your app!

---

## Get Help

- 📖 Check `PROJECT_STATUS.md` for complete architecture
- 📖 See `TRANSFORMATION_SUMMARY.md` for all changes
- 📖 Review `README.md` for project overview

---

**You're all set! Happy coding! 🎉**
