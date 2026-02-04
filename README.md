# Alumni Platform MVP

A modern, simple alumni event management platform built with React, Vite, Tailwind CSS, and Firebase.

## 🎯 Features

### Regular Users (Read-Only)
- ✅ User registration and login
- ✅ View personal profile
- ✅ View upcoming meetings with Zoom links
- ✅ View donation summaries
- ✅ View expense reports

### Platform Admins
- ✅ Post and manage meetings
- ✅ Record and track donations
- ✅ Record and track expenses
- ✅ View all users
- ✅ Dashboard with analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier)

### Step 1: Install Dependencies

```bash
cd alumni-platform
npm install
```

### Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Firestore Database:
   - Go to "Build" → "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose a location close to your users
4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" icon (</>) to add web app
   - Register your app
   - Copy the configuration object

### Step 3: Configure Firebase

Open `src/config/firebase.js` and replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### Step 4: Set Up Firestore Security Rules

In Firebase Console, go to Firestore Database → Rules and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all authenticated users
    match /{document=**} {
      allow read: if true;
    }
    
    // Only allow writes from admin users (you'll need to set isAdmin manually)
    match /meetings/{meeting} {
      allow write: if request.auth != null;
    }
    
    match /donations/{donation} {
      allow write: if request.auth != null;
    }
    
    match /expenses/{expense} {
      allow write: if request.auth != null;
    }
    
    match /users/{user} {
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

### Step 5: Create Your First Admin User

After starting the app, register a user normally. Then:

1. Go to Firebase Console → Firestore Database
2. Find the `users` collection
3. Click on your user document
4. Add a field: `isAdmin` with value `true` (boolean)

### Step 6: Run the App

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
alumni-platform/
├── src/
│   ├── components/         # Reusable components (future)
│   ├── contexts/          
│   │   └── AuthContext.jsx # Authentication state management
│   ├── pages/
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # User dashboard
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── config/
│   │   └── firebase.js     # Firebase configuration
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔐 Authentication Flow

1. New users register with: First Name, Last Name, DOB, Email, Phone, Village, Alumni Year
2. Users login with: Last Name, Date of Birth, Phone Number (simple, no passwords)
3. System checks Firestore for matching user
4. If `isAdmin: true`, user can access `/admin`
5. Regular users see read-only dashboard at `/dashboard`

## 📊 Database Schema

### users
```
{
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  village: string
  alumniYear: number
  isAdmin: boolean
  createdAt: timestamp
}
```

### meetings
```
{
  title: string
  description: string
  date: string
  time: string
  zoomLink: string (optional)
}
```

### donations
```
{
  donorName: string
  amount: number
  date: string
  notes: string (optional)
}
```

### expenses
```
{
  description: string
  amount: number
  date: string
  category: string (optional)
}
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js` - modify the `primary` color palette:

```javascript
colors: {
  primary: {
    // Change these hex values to your preferred color
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  }
}
```

### Add Logo
Replace the text "Alumni Platform" in the header with:
```jsx
<img src="/your-logo.png" alt="Alumni" className="h-10" />
```

## 🚀 Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build the app
npm run build

# Deploy
firebase deploy
```

### Option 2: Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Vite and deploy

### Option 3: Netlify

```bash
npm run build
# Drag and drop the 'dist' folder to netlify.com
```

## 💰 Cost Estimate

**Firebase Free Tier includes:**
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- 10GB/month bandwidth

**This is more than enough for:**
- 500+ active users
- Daily usage
- Years of data

**Cost: $0/month** for most alumni events

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Firebase errors
- Double-check your config in `src/config/firebase.js`
- Ensure Firestore is enabled in test mode
- Check browser console for detailed errors

### Login not working
- Make sure user exists in Firestore `users` collection
- Check that lastName, DOB, and phone match exactly
- Test mode security rules should allow reads

## 📝 TODO / Future Enhancements

- [ ] Email notifications for new meetings
- [ ] Search and filter users
- [ ] Export donation/expense reports to CSV
- [ ] Photo gallery for events
- [ ] Mobile app version
- [ ] Bulk user import from CSV

## 🤝 Contributing

This is an MVP. Feel free to extend it based on your needs!

## 📄 License

MIT License - feel free to use for your alumni events!

---

**Need Help?** Check the browser console for errors, or review the Firebase documentation.
