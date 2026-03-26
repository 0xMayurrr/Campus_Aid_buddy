@echo off
cd /d "c:\Users\KARTHICK MAYUR\OneDrive\Desktop\campus AID buddy\Campus_Aid_buddy"

REM 1
git add .gitignore
git commit -m "config: update .gitignore rules for new project structure"

REM 2
git add backend/firebase.ts
git commit -m "feat: update Firebase config in backend service layer"

REM 3
git add backend/package.json backend/package-lock.json backend/tsconfig.json
git commit -m "deps: add backend package config and TypeScript setup"

REM 4
git add backend/src/
git commit -m "feat: add backend src modules for service layer"

REM 5
git rm --cached backend/ai/index.ts 2>nul
git add -u backend/ai/
git commit -m "refactor: remove legacy backend AI index module"

REM 6
git rm --cached backend/auth/index.ts 2>nul
git add -u backend/auth/
git commit -m "refactor: remove legacy backend auth index module"

REM 7
git rm --cached backend/firestore.service.ts backend/index.ts backend/routing.service.ts backend/storage.service.ts 2>nul
git add -u backend/
git commit -m "refactor: remove legacy backend service files (firestore, routing, storage)"

REM 8
git rm --cached backend/lectures/index.ts backend/locations/index.ts backend/notices/index.ts backend/qr/index.ts backend/syllabus/index.ts 2>nul
git add -u backend/
git commit -m "refactor: remove legacy backend module index files"

REM 9
git add index.html
git commit -m "feat: update index.html metadata and app entry config"

REM 10
git add package.json package-lock.json
git commit -m "deps: update project dependencies and lock file"

REM 11
git add src/App.tsx
git commit -m "feat: refactor App.tsx routing with updated role-based routes"

REM 12
git add src/contexts/AuthContext.tsx
git commit -m "feat: update AuthContext with improved auth state management"

REM 13
git add src/contexts/TicketContext.tsx
git commit -m "feat: update TicketContext with Firestore integration"

REM 14
git add src/contexts/ChatContext.tsx
git commit -m "feat: add ChatContext for AI campus assistant state"

REM 15
git add src/hooks/useGeolocation.ts
git commit -m "feat: update useGeolocation hook for ticket location capture"

REM 16
git add src/lib/firebase.ts
git commit -m "feat: update Firebase client config with new project credentials"

REM 17
git add src/types/index.ts
git commit -m "feat: update TypeScript types for tickets, users, and roles"

REM 18
git add src/index.css
git commit -m "style: update global CSS with new design tokens and Tailwind config"

REM 19
git add tailwind.config.ts
git commit -m "style: update Tailwind config with orange and sage green palette"

REM 20
git add src/components/layout/DashboardLayout.tsx
git commit -m "feat: update DashboardLayout with responsive sidebar integration"

REM 21
git add src/components/layout/DashboardSidebar.tsx
git commit -m "feat: update DashboardSidebar with role-based nav items"

REM 22
git rm --cached src/components/layout/MobileNav.tsx 2>nul
git add -u src/components/layout/
git commit -m "refactor: remove MobileNav component (merged into sidebar)"

REM 23
git rm --cached src/components/qr/QRScanner.tsx 2>nul
git add -u src/components/qr/
git commit -m "refactor: remove legacy QRScanner component"

REM 24
git add src/components/dashboard/StudentDashboard.tsx
git commit -m "feat: add StudentDashboard with ticket and lecture widgets"

REM 25
git add src/components/dashboard/FacultyDashboard.tsx
git commit -m "feat: add FacultyDashboard with upload and syllabus management"

REM 26
git add src/components/dashboard/HODDashboard.tsx
git commit -m "feat: add HODDashboard with department ticket overview"

REM 27
git add src/components/dashboard/AdminDashboard.tsx
git commit -m "feat: add AdminDashboard with full campus management view"

REM 28
git add src/pages/Auth.tsx
git commit -m "feat: update Auth page with role selection and login flow"

REM 29
git add src/pages/Dashboard.tsx
git commit -m "feat: update Dashboard page with role-based component rendering"

REM 30
git add src/pages/ModernLanding.tsx
git commit -m "feat: update ModernLanding page with new hero and feature sections"

REM 31
git add src/pages/SubmitRequest.tsx
git commit -m "feat: update SubmitRequest with GPS location capture on submit"

REM 32
git add src/pages/Tickets.tsx
git commit -m "feat: update Tickets page with status lifecycle and filters"

REM 33
git add src/pages/CampusAI.tsx
git commit -m "feat: add CampusAI page with Gemini-powered chat assistant"

REM 34
git add src/pages/DigitalLibrary.tsx
git commit -m "feat: add DigitalLibrary page for lecture video browsing"

REM 35
git add src/pages/Announcements.tsx
git commit -m "feat: add Announcements page for campus notices"

REM 36
git add src/pages/StudentProfile.tsx
git commit -m "feat: add StudentProfile page with personal info and ticket history"

REM 37
git add src/pages/Students.tsx
git commit -m "feat: add Students management page for admin and HOD roles"

REM 38
git add src/pages/GrowthDashboard.tsx
git commit -m "feat: add GrowthDashboard with analytics and metrics view"

REM 39
git rm --cached src/pages/AITeacher.tsx src/pages/CampusNavigation.tsx src/pages/Landing.tsx src/pages/Lectures.tsx src/pages/ManageLectures.tsx src/pages/Notices.tsx src/pages/SyllabusManagement.tsx 2>nul
git add -u src/pages/
git commit -m "refactor: remove legacy page components replaced by new implementations"

REM 40
git add src/services/firestoreService.ts
git commit -m "feat: add firestoreService with generic CRUD operations"

REM 41
git add src/services/geminiService.ts
git commit -m "feat: add geminiService for Gemini AI API integration"

REM 42
git add src/services/seedService.ts
git commit -m "feat: add seedService for Firestore demo data seeding"

REM 43
git rm --cached src/services/aiTeacherService.ts src/services/campusAIService.ts src/services/departmentRoutingService.ts src/services/firebaseService.ts src/services/openaiService.ts src/services/qrCodeService.ts src/services/roleDashboardService.ts src/services/syllabusService.ts 2>nul
git add -u src/services/
git commit -m "refactor: remove legacy service files replaced by gemini and firestore services"

REM 44
git add src/utils/
git commit -m "feat: add utils folder with formatting and validation helpers"

REM 45
git rm --cached src/data/campusLocations.ts 2>nul
git add -u src/data/
git commit -m "refactor: remove campusLocations static data (moved to Firestore)"

REM 46
git add cors.json
git commit -m "config: add Firebase Storage CORS policy configuration"

REM 47
git add public/campus-illustration.png
git commit -m "assets: add campus illustration image for landing page"

REM 48
git add stitch_dashboard.html stitch.html.bak
git commit -m "docs: add stitch dashboard prototype and backup file"

REM 49
git add push_commits.bat
git commit -m "chore: add git push automation script"

REM 50
git add .
git commit -m "chore: stage any remaining untracked files and changes"

REM 51
echo. >> README.md
git add README.md
git commit -m "docs: update README with Gemini AI and Cloudinary integration notes"

REM 52
echo. >> README.md
git add README.md
git commit -m "docs: add Vercel deployment and environment variable setup guide"

REM 53
echo. >> README.md
git add README.md
git commit -m "docs: add contributing guidelines and project status update"

REM Push all commits
git push origin main

echo.
echo ✅ Done! All 53 commits pushed to https://github.com/0xMayurrr/Campus_Aid_buddy.git
pause
