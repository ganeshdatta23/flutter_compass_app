# 🧭 Swamiji Compass App - Complete Guide

A React Native compass application that helps devotees find the direction to Sri Sri Sri Ganapathy Sachidananda Swamiji (Appaji) with real-time navigation, haptic feedback, and darshan experience.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- **Live Compass Navigation**: Real-time compass showing direction to Appaji's location
- **20° Alignment Threshold**: Precise alignment detection with haptic feedback
- **GPS Location Tracking**: Uses device GPS with Haversine formula for accurate bearing calculations
- **Darshan Experience**: Video/audio overlay triggered when aligned within 20° threshold
- **Dashboard**: Comprehensive status display with location info, compass readings, and system status
- **Tab Navigation**: Smooth navigation between Compass and Dashboard screens

### Advanced Features
- **Real-time Updates**: Live location tracking and compass heading updates
- **Distance Calculations**: Shows accurate distance to Appaji's location
- **Turn Instructions**: Visual guidance with arrows and degree measurements
- **Error Handling**: Graceful handling of permissions, GPS, and connection issues
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Offline Fallback**: Works with simulated compass when magnetometer unavailable
- **Background/Foreground Handling**: Optimized battery usage with app state management

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo SDK 54
- **Expo Router** for navigation
- **TypeScript** for type safety
- **React Native SVG** for compass visualization
- **Expo Sensors** for magnetometer access
- **Expo Location** for GPS tracking
- **Expo Haptics** for feedback

### Backend
- **FastAPI** (Python) for REST API
- **Supabase** as primary database
- **MongoDB** as fallback database
- **Motor** for async MongoDB operations
- **Uvicorn** as ASGI server

## 📋 Prerequisites

### System Requirements
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Git** for version control
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** for building (`npm install -g eas-cli`)

### Mobile Development
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Physical device** recommended for testing compass functionality

### Database Setup
- **Supabase account** (primary database)
- **MongoDB** instance (fallback - local or cloud)

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd flutter_compass_app
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials:
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="compass_app"
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env
# Edit .env with your API endpoints:
# EXPO_PUBLIC_API_URL=http://localhost:8000/api
# EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Database Configuration

#### Supabase Setup (Primary)
1. Create a Supabase project at https://supabase.com
2. Create `locations` table:
```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  googlemapsurl TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
3. Insert default location:
```sql
INSERT INTO locations (id, latitude, longitude, address, googlemapsurl)
VALUES ('swamiji_location', 12.308367, 76.645467, 'Avadhoota Datta Peetham', 'https://maps.google.com/?q=12.308367,76.645467');
```

#### MongoDB Setup (Fallback)
```bash
# Install MongoDB locally or use MongoDB Atlas
# Create database and collections will be created automatically
```

## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```
Backend will be available at: http://localhost:8000

#### 2. Start Frontend Development Server
```bash
cd frontend
npx expo start
```

#### 3. Run on Device/Emulator
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **iOS**: Press `i` in terminal or scan QR code with Expo Go app (iOS)
- **Web**: Press `w` in terminal (limited functionality)

### Testing API Endpoints
```bash
# Test backend health
curl http://localhost:8000/api/

# Get Swamiji's location
curl http://localhost:8000/api/location/swamiji

# Initialize default location
curl -X POST http://localhost:8000/api/location/initialize
```

## 📱 Building for Production

### Android Build

#### 1. Configure EAS Build
```bash
cd frontend
eas login
eas build:configure
```

#### 2. Build APK (Development)
```bash
eas build --platform android --profile development
```

#### 3. Build AAB (Production)
```bash
eas build --platform android --profile production
```

### iOS Build (macOS only)

#### 1. Build for iOS
```bash
eas build --platform ios --profile production
```

#### 2. Submit to App Store
```bash
eas submit --platform ios
```

### Local Builds

#### Android (Local)
```bash
cd frontend
npx expo run:android
```

#### iOS (Local - macOS only)
```bash
cd frontend
npx expo run:ios
```

## 📡 API Documentation

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### Health Check
```http
GET /api/
Response: {"message": "Hello World"}
```

#### Get Swamiji's Location
```http
GET /api/location/swamiji
Response: {
  "id": "swamiji_location",
  "latitude": 12.308367,
  "longitude": 76.645467,
  "address": "Avadhoota Datta Peetham",
  "googlemapsurl": "https://maps.google.com/?q=12.308367,76.645467",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update Swamiji's Location
```http
POST /api/location/swamiji
Content-Type: application/json

{
  "latitude": 12.308367,
  "longitude": 76.645467,
  "address": "New Location"
}
```

#### Initialize Default Location
```http
POST /api/location/initialize
Response: {"message": "Default location initialized successfully"}
```

## 📁 Project Structure

```
flutter_compass_app/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main server file
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/                  # React Native frontend
│   ├── app/                   # App screens (Expo Router)
│   │   ├── (tabs)/           # Tab navigation
│   │   │   ├── compass.tsx   # Main compass screen
│   │   │   └── dashboard.tsx # Dashboard screen
│   │   ├── _layout.tsx       # Root layout
│   │   └── index.tsx         # Entry point
│   ├── components/           # Reusable components
│   │   ├── CompassWidget.tsx # Main compass component
│   │   └── DarshanOverlay.tsx # Darshan experience
│   ├── hooks/               # Custom hooks
│   │   └── useCompass.ts    # Compass logic hook
│   ├── services/            # API services
│   │   ├── locationService.ts # Location calculations
│   │   └── supabaseService.ts # Database service
│   ├── assets/              # Images, fonts, etc.
│   ├── package.json         # Dependencies
│   ├── app.json            # Expo configuration
│   ├── eas.json            # EAS Build configuration
│   └── .env                # Environment variables
├── tests/                  # Test files
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=compass_app
```

#### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### App Configuration (app.json)
```json
{
  "expo": {
    "name": "Swamiji Compass",
    "slug": "swamiji-compass",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "permissions": [
      "LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ]
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Location Permission Denied
- **Problem**: App can't access GPS
- **Solution**: Enable location permissions in device settings
- **Code**: Check `LocationService.requestPermissions()`

#### 2. Compass Not Working
- **Problem**: Magnetometer not available
- **Solution**: App falls back to simulated compass
- **Note**: Test on physical device, not emulator

#### 3. Backend Connection Failed
- **Problem**: Frontend can't reach backend
- **Solutions**:
  - Check backend is running on correct port
  - Update `EXPO_PUBLIC_API_URL` in frontend/.env
  - Check firewall settings

#### 4. Database Connection Issues
- **Problem**: Supabase/MongoDB connection fails
- **Solutions**:
  - Verify database credentials
  - Check network connectivity
  - App automatically falls back to alternative database

#### 5. Build Failures
- **Problem**: EAS build fails
- **Solutions**:
  - Run `eas build:configure` again
  - Check eas.json configuration
  - Verify all dependencies are installed

### Debug Commands

```bash
# Check Expo CLI version
expo --version

# Clear Expo cache
expo r -c

# Check EAS build status
eas build:list

# View device logs
npx expo logs

# Test backend endpoints
curl -X GET http://localhost:8000/api/location/swamiji
```

### Performance Optimization

1. **Battery Usage**: App pauses location updates when in background
2. **Network Usage**: Location updates cached for 30 seconds
3. **Memory Usage**: Proper cleanup of subscriptions and intervals
4. **Haptic Feedback**: Limited to prevent excessive vibration

## 🧪 Testing

### Manual Testing Checklist

#### Compass Functionality
- [ ] Compass rotates with device orientation
- [ ] Target direction indicator shows correctly
- [ ] Alignment detection works within 20° threshold
- [ ] Haptic feedback triggers on alignment
- [ ] Turn instructions display correctly

#### Location Services
- [ ] GPS permission requested properly
- [ ] Current location updates in real-time
- [ ] Distance calculation accurate
- [ ] Bearing calculation correct

#### UI/UX
- [ ] Tab navigation works smoothly
- [ ] Dashboard shows correct information
- [ ] Dark theme applied consistently
- [ ] Responsive design on different screen sizes

#### Error Handling
- [ ] Graceful handling of permission denial
- [ ] Fallback when magnetometer unavailable
- [ ] Network error handling
- [ ] Database fallback mechanism

### Automated Testing
```bash
cd backend
python -m pytest tests/

cd frontend
npm test
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Add new feature"`
5. Push to branch: `git push origin feature/new-feature`
6. Create Pull Request

### Code Standards
- **TypeScript**: Use strict typing
- **ESLint**: Follow configured rules
- **Prettier**: Format code consistently
- **Comments**: Document complex logic
- **Testing**: Add tests for new features

### Git Workflow
```bash
# Check current status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add compass alignment detection"

# Push to remote
git push origin main
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sri Sri Sri Ganapathy Sachidananda Swamiji (Appaji) for inspiration
- Expo team for excellent React Native framework
- Supabase for reliable backend services
- Open source community for various libraries used

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check troubleshooting section above
- Review Expo documentation: https://docs.expo.dev/

---

**Note**: This app requires physical device testing for full compass functionality. Emulators have limited sensor support.