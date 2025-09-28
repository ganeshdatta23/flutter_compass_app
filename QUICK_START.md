# 🚀 Quick Start Guide - Swamiji Compass App

## 📱 What is this app?

A React Native compass application that helps devotees find the direction to Sri Sri Sri Ganapathy Sachidananda Swamiji (Appaji) with real-time navigation, haptic feedback, and darshan experience when aligned within 20° threshold.

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
# Check if you have required tools
node --version    # Should be 18+
python --version  # Should be 3.11+
git --version     # Any recent version
```

### 2. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/ganeshdatta23/flutter_compass_app.git
cd flutter_compass_app

# Setup backend
cd backend
pip install -r requirements.txt
cp .env.example .env
cd ..

# Setup frontend
cd frontend
npm install
cp .env.example .env
cd ..
```

### 3. Run the App

#### Option A: Use Start Scripts (Recommended)
```bash
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh
```

#### Option B: Manual Start
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start Frontend
cd frontend
npx expo start
```

### 4. Test on Device
- Install **Expo Go** app on your phone
- Scan QR code from Expo CLI
- Allow location permissions when prompted

## 🔧 Essential Commands

### Development
```bash
# Start development servers
npm run dev          # If you have package.json script
./start.sh          # Linux/macOS
start.bat           # Windows

# Clear caches
cd frontend && npx expo r -c

# Check backend health
curl http://localhost:8000/api/

# View logs
cd frontend && npx expo logs
```

### Building
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
cd frontend
eas build:configure

# Build Android APK
eas build --platform android --profile development

# Build for production
eas build --platform android --profile production
```

### Testing
```bash
# Test backend endpoints
curl http://localhost:8000/api/location/swamiji

# Initialize default location
curl -X POST http://localhost:8000/api/location/initialize

# Run frontend on specific platform
cd frontend
npx expo start --android  # Android
npx expo start --ios      # iOS
npx expo start --web      # Web (limited functionality)
```

## 📋 What to Check

### ✅ Before Running
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Git installed
- [ ] Physical device available (for compass testing)
- [ ] Location services enabled on device

### ✅ After Setup
- [ ] Backend starts at http://localhost:8000
- [ ] Frontend Expo server starts successfully
- [ ] Can scan QR code with Expo Go app
- [ ] App loads on device without errors
- [ ] Location permission granted
- [ ] Compass rotates when device rotates

### ✅ Core Functionality
- [ ] Compass shows current heading
- [ ] Target direction indicator visible
- [ ] Distance calculation works
- [ ] Turn instructions appear
- [ ] Haptic feedback on alignment
- [ ] Dashboard shows location data

## 🏗️ Build & Deploy

### Mobile App Build
```bash
cd frontend

# Development build (for testing)
eas build --platform android --profile development

# Production build (for app stores)
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Backend Deployment
```bash
# Railway (Recommended)
npm install -g @railway/cli
cd backend
railway login
railway init
railway up

# Set environment variables
railway variables set MONGO_URL="your_mongodb_url"
railway variables set DB_NAME="compass_app"
```

## 🔍 Troubleshooting

### Common Issues

#### "Location permission denied"
- Enable location services in device settings
- Grant permission when app requests it

#### "Compass not working"
- Test on physical device (not emulator)
- App falls back to simulated compass if magnetometer unavailable

#### "Backend connection failed"
- Check if backend is running on port 8000
- Update `EXPO_PUBLIC_API_URL` in frontend/.env
- Check firewall settings

#### "Build failed"
- Clear caches: `npx expo r -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check EAS build logs for specific errors

### Debug Commands
```bash
# Check Expo version
npx expo --version

# View device logs
npx expo logs

# Check build status
eas build:list

# Test API endpoints
curl -X GET http://localhost:8000/api/location/swamiji
```

## 📚 Documentation

- **Complete Setup**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation**: See README.md#api-documentation
- **Troubleshooting**: See README.md#troubleshooting

## 🆘 Need Help?

1. **Check Documentation**: README.md has comprehensive guides
2. **Common Issues**: See troubleshooting section above
3. **Create Issue**: Open GitHub issue with error details
4. **Expo Docs**: https://docs.expo.dev/

## 🎯 Key Features to Test

1. **Compass Navigation**: Rotate device and watch compass
2. **Target Direction**: Orange dot shows Appaji's direction
3. **Alignment Detection**: Get within 20° for haptic feedback
4. **Distance Display**: Shows distance to target location
5. **Turn Instructions**: Left/right arrows with degree measurements
6. **Dashboard**: View detailed location and system information

---

**Note**: This app requires a physical device for full compass functionality. Emulators have limited sensor support.