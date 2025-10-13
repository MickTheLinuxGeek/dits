# Quick Start Guide - DITS Web Client

## 🚀 Get Started in 30 Seconds

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Visit **http://localhost:5173** in your browser.

## 📋 What You'll See

The app will start with:
- A header with "DITS" branding and sidebar toggle
- A collapsible sidebar with navigation to:
  - 📥 Inbox
  - 📅 Today
  - 🔜 Upcoming
  - 📚 Logbook
  - 📂 Projects
- Placeholder content for each view (ready for implementation)

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |
| `npm run type-check` | Validate TypeScript |

## 🎨 Features Working Now

✅ React Router navigation  
✅ Zustand state management  
✅ React Query integration  
✅ Hot Module Replacement  
✅ TypeScript support  
✅ Light/Dark theme support  
✅ Sidebar toggle  
✅ Code splitting  
✅ Production builds  

## 🔧 Testing the Setup

### 1. Toggle Sidebar
Click the ☰ button in the header to show/hide the sidebar.

### 2. Navigate Routes
Click any link in the sidebar to navigate between views.

### 3. Check DevTools
Open browser DevTools and look for:
- React Query DevTools (bottom left corner)
- Redux DevTools (if extension installed) for Zustand state

### 4. Test HMR
Edit `src/App.tsx` and watch changes appear instantly without page reload.

## 📁 Project Structure

```
client/
├── src/
│   ├── lib/             React Query setup
│   ├── router/          Route configuration
│   ├── store/           Zustand state
│   ├── App.tsx          Main layout
│   └── main.tsx         Entry point
├── .env.development     Dev environment vars
├── package.json         Dependencies & scripts
└── vite.config.ts       Build configuration
```

## 🔗 Backend Connection

The client is configured to proxy API requests:
- `/api/*` → `http://localhost:3000`
- `/graphql` → `http://localhost:3000`

Update `VITE_API_URL` in `.env.development` if your backend runs on a different port.

## 🎯 Next Tasks

The foundation is complete! Next up (Tasks 63-70):
1. Implement Design System
2. Build Component Library
3. Add Storybook documentation

## 💡 Tips

- Use `Cmd/Ctrl + K` for Command Palette (coming in future tasks)
- All routes support lazy loading for optimal performance
- State persists across page reloads (theme, sidebar preference)
- Bundle size is optimized at ~98 kB gzipped

## 🐛 Troubleshooting

**Port 5173 already in use?**
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
# Or change port in vite.config.ts
```

**TypeScript errors?**
```bash
npm run type-check
```

**Linting issues?**
```bash
npm run lint:fix
```

## 📚 Documentation

- Full README: `client/README.md`
- Implementation Summary: `../REACT_SETUP_SUMMARY.md`
- Project WARP Guide: `../WARP.md`
