<div align="center">

# 🎓 Alumni Platform

**ZPHS Valaparla — 75th Anniversary Alumni Gathering**

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

*Reuniting alumni, managing events, and celebrating 75 years of excellence*

[Live Demo](https://alumni-platform-fd554.web.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication](#-authentication)
- [Database Schema](#-database-schema)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Alumni Platform** is a modern event management system built for the ZPHS Valaparla 75th Anniversary Alumni Gathering. It provides a complete solution for alumni registration, meeting coordination, financial tracking, and analytics — all wrapped in an animated celebration-themed interface.

### Why Alumni Platform?

- 🎉 **Celebration-Themed UI** — Animated confetti, golden shimmer effects, and a countdown showcase for the 75th anniversary
- 💰 **Financial Transparency** — Track every donation and expense with categorized reporting
- 📊 **Real-time Analytics** — Monthly summaries, expense breakdowns, and cash flow charts
- 🔐 **Role-based Access** — Separate flows for alumni, admins, and super admins
- 📱 **Mobile-first** — Responsive design that works on every device and browser
- 🆓 **Zero Cost** — Runs entirely on Firebase's free tier

---

## ✨ Features

### Current Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🎓 **Alumni Registration** | Self-service signup with name, phone, email, village, alumni year | ✅ Ready |
| 🔑 **Passwordless Login** | Simple Last Name + Phone login for alumni | ✅ Ready |
| 🛡️ **Admin Auth** | Secure email + password login via Firebase Auth | ✅ Ready |
| 📅 **Meeting Management** | Schedule meetings with date, time range, description, video links | ✅ Ready |
| 💸 **Donation Tracking** | Record donations with donor details, phone, village, alumni year | ✅ Ready |
| 📒 **Expense Tracking** | Categorized expenses (Venue, Food, Travel, Gifts, etc.) | ✅ Ready |
| 👥 **User Management** | View and manage all registered alumni | ✅ Ready |
| 👨‍💼 **Admin Management** | Super Admin can add/remove platform administrators | ✅ Ready |
| 📊 **Analytics Reports** | Monthly summary charts, expense donut chart, cash flow timeline | ✅ Ready |
| 🎨 **Animated Landing** | Confetti, floating orbs, sparkles, golden shimmer "75" counter | ✅ Ready |
| 🔔 **Toast Notifications** | Auto-dismissing success/error notifications | ✅ Ready |
| 📄 **Pagination** | Paginated tables for donations and expenses | ✅ Ready |

### Planned Features

- 📢 **Push Notifications** — Notify alumni about new meetings
- 📸 **Photo Gallery** — Event photo sharing
- 📤 **CSV Export** — Export donation/expense reports
- 🗳️ **Polls & Voting** — Alumni surveys and decisions
- 📧 **Email Notifications** — Meeting reminders

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 18](https://react.dev/) — Component-based UI
- **Routing:** [React Router 6](https://reactrouter.com/) — Client-side navigation
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) — Utility-first CSS
- **Icons:** [Lucide React](https://lucide.dev/) — Beautiful consistent icons
- **Build Tool:** [Vite 5](https://vitejs.dev/) — Lightning-fast dev server & builds

### Backend & Infrastructure
- **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore) — NoSQL document database
- **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth) — Email/password for admins
- **Hosting:** [Firebase Hosting](https://firebase.google.com/docs/hosting) — Global CDN
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) — Auto-deploy on push to main

---

## 📁 Project Structure

```
alumni-platform/
├── .github/
│   ├── CODEOWNERS                 # Repository ownership
│   └── workflows/
│       └── firebase-deploy.yml    # CI/CD pipeline
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx       # Reusable confirmation dialog
│   │   ├── Footer.jsx             # App footer (grid layout)
│   │   ├── Reports.jsx            # Analytics charts & visualizations
│   │   └── Toast.jsx              # Toast notification system
│   ├── config/
│   │   └── firebase.js            # Firebase initialization & config
│   ├── contexts/
│   │   └── AuthContext.jsx        # Auth state management & login logic
│   ├── pages/
│   │   ├── Login.jsx              # Animated 75th anniversary login page
│   │   ├── Register.jsx           # Alumni registration form
│   │   ├── Dashboard.jsx          # Alumni dashboard (read-only)
│   │   ├── AdminDashboard.jsx     # Admin panel (5 tabs)
│   │   └── AdminLogin.jsx         # Admin email/password login
│   ├── App.jsx                    # Route definitions & guards
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles & CSS animations
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md                      # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Firebase** account (free tier is sufficient)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramanakellampalli/alumni-platform.git
   cd alumni-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/) and create a project
   - Enable **Firestore Database** (start in test mode)
   - Enable **Authentication** with Email/Password provider

4. **Configure Firebase**

   Update `src/config/firebase.js` with your config:
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

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at: `http://localhost:3000`

---

## 🔐 Authentication

### Two Authentication Flows

| Flow | Method | Used By |
|------|--------|---------|
| **Alumni Login** | Last Name + Phone Number (passwordless) | Regular alumni users |
| **Admin Login** | Email + Password (Firebase Auth) | Admins & Super Admins |

### User Roles

- **ALUMNI** — View meetings, donations, expenses, and reports (read-only)
- **ADMIN** — All alumni permissions + manage meetings, donations, expenses, and users
- **SUPER ADMIN** — All admin permissions + add/remove other administrators

### Setting Up the First Admin

1. Create a Firebase Auth user in **Firebase Console > Authentication > Add User**
2. In Firestore, create an `admins` collection
3. Add a document with the user's UID as the document ID:
   ```json
   {
     "email": "admin@example.com",
     "name": "Admin Name",
     "isAdmin": true,
     "isSuperAdmin": true
   }
   ```

---

## 🗄️ Database Schema

### Core Collections

| Collection | Description | Key Fields |
|------------|-------------|------------|
| **users** | Registered alumni | firstName, lastName, email, phone, village, alumniYear |
| **meetings** | Scheduled gatherings | title, date, timeFrom, timeTo, description, zoomLink |
| **donations** | Financial contributions | donorName, amount, date, phone, village, alumniYear, notes |
| **expenses** | Event expenditures | description, amount, date, category, notes |
| **admins** | Platform administrators | email, name, isAdmin, isSuperAdmin, createdBy |

### Expense Categories

`Venue` · `Food` · `Entertainment` · `Marketing` · `Decorations` · `Travel` · `Gifts` · `Miscellaneous`

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## 🚀 Deployment

### Automated (CI/CD)

Every push to `main` triggers the GitHub Actions workflow which:
1. Installs dependencies (`npm ci`)
2. Builds the project (`npm run build`)
3. Deploys to Firebase Hosting

### Manual

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build & Deploy
npm run build && firebase deploy
```

---

## 💰 Cost

> **Firebase Spark (Free) Plan** includes:
> - 50,000 reads/day · 20,000 writes/day
> - 1 GB Firestore storage · 10 GB/month bandwidth
> - Custom domain support

**More than enough for 500+ active alumni users at $0/month.**

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅ (Complete)
- [x] Alumni registration & passwordless login
- [x] Admin authentication with Firebase Auth
- [x] Meeting, donation, and expense management
- [x] User and admin management with role hierarchy
- [x] Analytics reports with charts
- [x] Animated 75th anniversary celebration theme
- [x] Responsive mobile-first design
- [x] CI/CD with GitHub Actions

### Phase 2: Enhanced Features 🚧 (Planned)
- [ ] Push notifications for new meetings
- [ ] Event photo gallery
- [ ] CSV export for financial reports
- [ ] Search and filter across all tables
- [ ] Bulk alumni import from CSV

### Phase 3: Community Features 🔮 (Future)
- [ ] Alumni polls and voting
- [ ] Email/SMS notifications
- [ ] Alumni directory with search
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Telugu/English)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for ZPHS Valaparla Alumni**

*Celebrating 75 years of excellence*

</div>
