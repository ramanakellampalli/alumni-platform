# ZPHS Valaparla - 75th Anniversary Alumni Platform

A modern alumni event management platform built for the **ZPHS Valaparla 75th Anniversary Alumni Gathering**. Built with React, Vite, Tailwind CSS, and Firebase.

**Live:** [alumni-platform-fd554.web.app](https://alumni-platform-fd554.web.app)

## Features

### Regular Users (Read-Only)
- User registration and login (Last Name + Phone)
- View personal profile
- View upcoming meetings with video call links
- View donation summaries
- View expense reports with pagination
- Analytics reports (monthly summary, expense breakdown, cash flow)

### Admin Dashboard
- Post and manage meetings (date, time range, description, video link)
- Record and track donations (donor details, phone, village, alumni year)
- Record and track expenses (categorized: Venue, Food, Travel, etc.)
- View and manage all registered users
- Analytics reports with charts

### Super Admin
- All admin permissions
- Add and remove platform administrators
- Manage admin roles

## Tech Stack

- **Frontend:** React 18, React Router 6
- **Styling:** Tailwind CSS 3
- **Build:** Vite 5
- **Backend:** Firebase (Firestore, Auth)
- **Icons:** Lucide React
- **Deployment:** Firebase Hosting (CI/CD via GitHub Actions)

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account (free tier)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode)
4. Enable **Authentication** with Email/Password provider (for admin login)
5. Get your Firebase config from Project Settings > Your apps > Web

### 3. Configure Firebase

Update `src/config/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Run the App

```bash
npm run dev
```

Opens at `http://localhost:3000`

## Authentication

**Regular users** log in with Last Name + Phone Number (no password required). The system matches against the `users` collection in Firestore.

**Admins** log in with Email + Password via Firebase Auth. Admin status is verified against the `admins` collection.

### Setting Up the First Admin

1. Create a Firebase Auth user in the Firebase Console (Authentication > Add User)
2. In Firestore, create an `admins` collection
3. Add a document with the Firebase Auth user's UID as the document ID:
   ```
   { email: "admin@example.com", name: "Admin Name", isAdmin: true, isSuperAdmin: true }
   ```

## Project Structure

```
src/
├── components/
│   ├── ConfirmModal.jsx       # Reusable confirmation dialog
│   ├── Footer.jsx             # App footer
│   ├── Reports.jsx            # Analytics charts (monthly, categories, cash flow)
│   └── Toast.jsx              # Toast notification system
├── contexts/
│   └── AuthContext.jsx        # Auth state management
├── config/
│   └── firebase.js            # Firebase initialization
├── pages/
│   ├── Login.jsx              # User login (animated 75th anniversary theme)
│   ├── Register.jsx           # User registration
│   ├── Dashboard.jsx          # User dashboard (read-only)
│   ├── AdminDashboard.jsx     # Admin panel (5 tabs)
│   └── AdminLogin.jsx         # Admin login (email/password)
├── App.jsx                    # Routing
├── main.jsx                   # Entry point
└── index.css                  # Global styles & animations
```

## Database Schema

### users
```
{ firstName, lastName, email, phone, village, alumniYear, isAdmin, createdAt }
```

### meetings
```
{ title, date, timeFrom, timeTo, description, zoomLink }
```

### donations
```
{ date, donorName, amount, phone, alumniYear, village, notes }
```

### expenses
```
{ date, description, amount, category, notes }
```

### admins
```
{ email, name, isAdmin, isSuperAdmin, createdAt, createdBy }
```

## Deployment

The project auto-deploys to Firebase Hosting on push to `main` via GitHub Actions.

Manual deployment:

```bash
npm run build
firebase deploy
```

## Cost

Firebase free tier (Spark plan) includes 50K reads/day, 20K writes/day, 1GB storage. More than enough for 500+ active alumni users at $0/month.

## License

MIT
