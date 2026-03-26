<div align="center">
  <img src="public/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="Campus Aid Buddy Logo" width="200"/>
  <h1>🎓 Campus Aid Buddy</h1>
  <p><strong>Smart Campus Support & Academic Assistance Enterprise Platform</strong></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5.0-purple.svg?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Firebase-10.0-yellow.svg?style=for-the-badge&logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

<hr/>

Campus Aid Buddy is an enterprise-grade, role-based campus support system designed to digitize and streamline university operations. It consolidates student service requests, academic assistance, digital library access, and campus navigation into one unified, structured ecosystem.

## ✨ Key Features

- **🎫 Unified Service Management**: End-to-end ticketing system for student requests and complaints. Features department-wise routing, status lifecycles, and auto-escalation.
- **🎓 AI-Powered Academic Assistant**: A syllabus-aware, hybrid Chat/AI system that contextually answers student doubts based on uploaded course material.
- **📍 Location-Attached Reporting**: Captures precision GPS data across campus zones to improve incident response and build future heat-map insights.
- **🧭 QR-Based Campus Navigation**: Scan facilities (Hostels, Labs, Library) for instant location details, navigation, and location-tagged ticket creation.
- **🎥 Digital Resource Library**: Secure, structured metadata-driven repository for video lectures and academic documents.
- **🤖 Rule-Based Campus Bot**: Instant guidance for campus policies, FAQ routing, and general inquiries—designed with strict anti-hallucination protocols.

## 🛠 Tech Stack

Designed with a **separated-backend clean architecture** to ensure modularity, secure role-based access, and microservice migration readiness.

### **Frontend**
- **Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State & Data**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Visuals & Charts**: [Recharts](https://recharts.org/), [Lucide Icons](https://lucide.dev/)

### **Backend as a Service (BaaS)**
- **Platform**: [Firebase](https://firebase.google.com/)
- **Database**: Cloud Firestore
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Auth (Role-based access control)

---

## 👥 Supported Roles

The system employs strict Role-Based Access Control (RBAC) with isolated data per department.

| Role | Core Capabilities |
| :--- | :--- |
| **Student** | Submit requests, view digital library, ask AI doubts, track tickets. |
| **Teaching/Tutor** | Upload syllabus & lectures, respond to queries, manage academic tickets. |
| **HOD / Admin** | Department overview, workflow visibility, handle escalations. |
| **Warden / Maintenance** | Handle hostel/facility complaints and campus infrastructure requests. |
| **Security / Transport** | Manage relevant operational tickets and safety reports. |

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm, yarn, or pnpm
- A [Firebase](https://console.firebase.google.com/) Project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Campus_Aid_buddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your Firebase configuration credentials:

```properties
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

> **Note:** Frontend services communicate exclusively via backend abstraction layers (`src/services`). Direct Firebase queries are isolated to these services.

### 4. Run the Development Server

```bash
npm run dev
```

Navigate to `http://localhost:5173` to explore the application.

---

## 📂 Project Structure

```text
├── public/                 # Static assets (images, fonts, icons)
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI architecture
│   │   ├── dashboard/      # Role-specific dashboard widgets
│   │   ├── tickets/        # Ticket forms and detail views
│   │   └── ui/             # shadcn/ui generic components (buttons, dialogs)
│   ├── contexts/           # Global React Contexts (Auth, Theme)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Util functions, type validators
│   ├── pages/              # Primary route views
│   ├── services/           # Backend abstraction (Firestore, Storage)
│   └── types/              # Global TypeScript interfaces
├── .env.local              # Local environment variables
├── tailwind.config.ts      # Tailwind design system configuration
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite build configuration
```

---

## 🎨 Design System

The platform embraces a modern, professional color palette suitable for higher-educational institutions:

- 🟠 **Primary (`#ff8000`)**: Actionable elements, highlights, CTA buttons.
- 🟢 **Secondary (`#74aa95`)**: Success states, auxiliary buttons, subtle backgrounds.
- ⚫ **Accent (`#000000`)**: High contrast typography and structural borders.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server with Hot Module Reload (HMR). |
| `npm run build` | Compiles and minifies the app for production deployment. |
| `npm run preview` | Boots up a local server to preview the production build. |
| `npm run lint` | Runs ESLint to check for code quality and standard adherence. |

---

## 🤝 Contributing

We welcome contributions to the Campus Aid Buddy ecosystem! 

1. **Fork** the repository.
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Commit changes**: `git commit -m 'Add: amazing new feature'`
4. **Push**: `git push origin feature/your-feature-name`
5. Open a **Pull Request**.

Please ensure your code follows the existing style, passes linting, and adds types where necessary.

---

## 📄 License & Status

- **Status**: Active Development 🟢
- **License**: MIT License. See [LICENSE](LICENSE) for details.

---
<div align="center">
  <b>Built with ❤️ to revolutionize the digital campus experience.</b>
</div>
