# 🚀 Complete Setup Guide

## Step-by-Step Firebase Setup

### 1. Create Firebase Project (5 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Project Setup**
   - Enter project name (e.g., "alumni-platform")
   - Accept terms and click "Continue"
   - Disable Google Analytics (not needed for MVP) or enable it
   - Click "Create project"
   - Wait for project creation (30 seconds)
   - Click "Continue"

### 2. Enable Firestore Database (3 minutes)

1. **Navigate to Firestore**
   - In left sidebar, click "Build" → "Firestore Database"
   - Click "Create database"

2. **Choose Mode**
   - Select "Start in test mode" (allows all reads/writes for 30 days)
   - Click "Next"

3. **Select Location**
   - Choose closest region to your users (e.g., us-central, europe-west)
   - Click "Enable"
   - Wait for database creation

### 3. Get Firebase Configuration (2 minutes)

1. **Register Web App**
   - Click the gear icon (⚙️) → "Project settings"
   - Scroll down to "Your apps"
   - Click the web icon `</>`
   - Enter app nickname: "Alumni Platform Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Configuration**
   - You'll see a code block with `firebaseConfig`
   - Copy the entire config object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "alumni-xxx.firebaseapp.com",
     projectId: "alumni-xxx",
     storageBucket: "alumni-xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

3. **Update Your Code**
   - Open `src/config/firebase.js`
   - Replace the placeholder config with your actual config

### 4. Set Up Security Rules (2 minutes)

1. **Navigate to Rules**
   - Go to "Firestore Database" → "Rules" tab

2. **Update Rules**
   - Replace existing rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```
   - Click "Publish"
   
   ⚠️ **Note:** These are open rules for testing. In production, add proper authentication checks.

### 5. Install and Run (3 minutes)

1. **Install Dependencies**
   ```bash
   cd alumni-platform
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Navigate to: http://localhost:3000
   - You should see the login page!

### 6. Create Admin User (2 minutes)

1. **Register First User**
   - Click "New User? Register Here"
   - Fill in all fields
   - Click "Register"

2. **Make User Admin**
   - Go to Firebase Console → Firestore Database
   - Click on "users" collection
   - Click on your user document
   - Click "Add field"
   - Field name: `isAdmin`
   - Type: boolean
   - Value: `true` (toggle ON)
   - Click "Add field"

3. **Test Admin Access**
   - Log out and log back in
   - Navigate to: http://localhost:3000/admin
   - You should see the admin dashboard!

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore enabled in test mode
- [ ] Firebase config added to `src/config/firebase.js`
- [ ] Security rules published
- [ ] Dependencies installed (`npm install`)
- [ ] App running (`npm run dev`)
- [ ] First user registered
- [ ] Admin user created in Firestore
- [ ] Admin dashboard accessible

## 🎉 Next Steps

### Add Sample Data

1. **Add a Meeting**
   - Go to Admin Dashboard → Meetings tab
   - Fill in the form:
     - Title: "Alumni Reunion Planning"
     - Date: Pick a future date
     - Description: "Let's plan our next reunion!"
     - Time: "18:00"
     - Zoom Link: https://zoom.us/j/123456789
   - Click "Add Meeting"

2. **Add a Donation**
   - Go to Donations tab
   - Donor Name: "John Smith"
   - Amount: 100
   - Date: Today
   - Notes: "For venue booking"
   - Click "Record Donation"

3. **Add an Expense**
   - Go to Expenses tab
   - Description: "Venue deposit"
   - Amount: 50
   - Date: Today
   - Category: "Venue"
   - Click "Record Expense"

4. **View as Regular User**
   - Register another user (without admin access)
   - Log in as that user
   - Navigate to `/dashboard`
   - You should see all the data you added!

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- --port 3001
```

### Firebase Not Connected
- Check browser console for errors
- Verify firebaseConfig in `src/config/firebase.js`
- Ensure Firestore is enabled in Firebase Console
- Check internet connection

### Can't See Admin Dashboard
- Verify `isAdmin: true` is set in Firestore for your user
- Check that you're logged in with the correct user
- Clear browser cache and localStorage

### Styles Not Loading
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📱 Test on Mobile

1. **Get Local IP**
   ```bash
   # On Mac/Linux
   ifconfig | grep inet
   
   # On Windows
   ipconfig
   ```

2. **Update Vite Config**
   - In `vite.config.js`, add:
   ```javascript
   server: {
     host: '0.0.0.0',
     port: 3000
   }
   ```

3. **Access from Phone**
   - Connect phone to same WiFi
   - Visit: `http://YOUR_IP:3000`

## 🚀 Deploy to Production

### Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## 🎨 Customize

### Change Primary Color
Edit `tailwind.config.js`:
```javascript
primary: {
  500: '#your-color-hex',
  600: '#your-darker-color',
  700: '#your-even-darker-color',
}
```

### Add Logo
1. Add logo file to `public/` folder
2. Update header in pages to use:
```jsx
<img src="/logo.png" alt="Alumni" className="h-12" />
```

## 📊 Monitor Usage

Firebase Console → Firestore Database → Usage tab

You can see:
- Read/write operations
- Storage used
- Whether you're approaching free tier limits

---

**Need more help?** Check the README.md or Firebase documentation!
