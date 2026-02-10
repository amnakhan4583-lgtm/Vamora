# Virtual Memory Companion - Frontend

A compassionate web application designed to help Alzheimer's and dementia patients recall memories, recognize familiar faces, and maintain emotional connections with their loved ones.

## 🌟 Features Implemented

### Screen 1: Role Selection (Landing Page)
- **Split Card Design**: Two prominent cards for role selection
  - "I am a Patient" - Access to memory features
  - "I am a Caregiver" - Support and monitoring tools
- **Visual Design**:
  - Large, clear typography (24px+) for easy reading
  - High contrast colors for accessibility
  - Soft blue calming background
  - Heart icons representing care and emotional connection
- **Accessibility**: Keyboard navigation and focus indicators

### Screen 2: Patient Dashboard ("My Memory Lane")
- **Orientation Features**:
  - Large greeting with patient name
  - Real-time date and time display (helps with temporal orientation)
  - Live clock updating every second
- **Main Action Buttons** (3 Large Cards):
  1. **View Photos** 📷 - Access to photo gallery with AI-generated captions
  2. **Talk to Companion** 💬 - Memory-aware chatbot interface
  3. **Add Memory** 🎤 - Quick voice note recording
- **Design Features**:
  - High contrast, distinct borders
  - Large interactive buttons (280px+ height)
  - Color-coded cards for easy recognition
  - Responsive grid layout

## 🎨 Design Principles

- **Large Typography**: 24px+ for main text, 3rem+ for headings
- **High Contrast**: Clear visual separation and readability
- **Calming Colors**: Soft blues and gentle gradients
- **Accessibility First**: ARIA labels, keyboard navigation, focus indicators

## 🛠️ Technology Stack

- **React.js 18** - UI framework
- **Vite 7** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **CSS3** - Custom styling

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10+

### Installation

1. **Ensure correct Node version**
   ```bash
   nvm use 20.19.5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:5173/

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── pages/
│   ├── RoleSelection.jsx          # Landing page
│   ├── RoleSelection.css
│   ├── PatientDashboard.jsx       # Patient interface
│   └── PatientDashboard.css
├── App.jsx                         # Main app with routing
└── index.css                       # Global styles
```

## 🔗 Navigation

```
/ → Role Selection (Landing)
├── /patient-dashboard → Patient Memory Interface
└── /caregiver-dashboard → Coming Soon
```

## 🎯 Future Integration Points

The frontend is ready for Django REST API integration:
- Authentication & authorization
- Media upload/retrieval
- AI features (DeepFace, BLIP, Whisper, SentenceTransformers)
- Real-time caregiver updates

## ♿ Accessibility Features

- Semantic HTML & ARIA labels
- Keyboard navigation
- High contrast mode support
- Reduced motion support
- Large touch targets (280px+)

---

**Built with ❤️ for supporting memory and strengthening connections**
