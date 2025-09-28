# 🚀 Deployment Guide - Swamiji Compass App

This guide covers deployment strategies for both backend and frontend components of the Swamiji Compass App.

## 📋 Table of Contents

- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGO_URL="your_mongodb_connection_string"
   railway variables set DB_NAME="compass_app"
   ```

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   # Create Heroku app
   heroku create swamiji-compass-api
   
   # Set environment variables
   heroku config:set MONGO_URL="your_mongodb_connection_string"
   heroku config:set DB_NAME="compass_app"
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select `backend` folder as source
   - Set environment variables in dashboard

2. **Configuration**
   ```yaml
   # .do/app.yaml
   name: swamiji-compass-api
   services:
   - name: api
     source_dir: backend
     github:
       repo: your-username/flutter_compass_app
       branch: main
     run_command: python -m uvicorn server:app --host 0.0.0.0 --port $PORT
     environment_slug: python
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: MONGO_URL
       value: your_mongodb_connection_string
     - key: DB_NAME
       value: compass_app
   ```

### Option 4: AWS EC2

1. **Launch EC2 Instance**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Install dependencies
   sudo apt update
   sudo apt install python3 python3-pip nginx
   
   # Clone repository
   git clone https://github.com/your-username/flutter_compass_app.git
   cd flutter_compass_app/backend
   
   # Install Python dependencies
   pip3 install -r requirements.txt
   
   # Create systemd service
   sudo nano /etc/systemd/system/compass-api.service
   ```

2. **Systemd Service Configuration**
   ```ini
   [Unit]
   Description=Swamiji Compass API
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/flutter_compass_app/backend
   Environment=PATH=/home/ubuntu/.local/bin
   ExecStart=/home/ubuntu/.local/bin/uvicorn server:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 📱 Frontend Deployment

### Option 1: EAS Build (Recommended for Mobile)

1. **Setup EAS**
   ```bash
   cd frontend
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Build for Android**
   ```bash
   # Development build
   eas build --platform android --profile development
   
   # Production build
   eas build --platform android --profile production
   ```

3. **Build for iOS**
   ```bash
   # Production build (requires Apple Developer account)
   eas build --platform ios --profile production
   ```

4. **Submit to Stores**
   ```bash
   # Submit to Google Play Store
   eas submit --platform android
   
   # Submit to Apple App Store
   eas submit --platform ios
   ```

### Option 2: Expo Development Build

1. **Create Development Build**
   ```bash
   cd frontend
   npx expo install expo-dev-client
   eas build --profile development --platform android
   ```

2. **Install on Device**
   - Download APK from EAS dashboard
   - Install on Android device
   - Use Expo CLI to load updates

### Option 3: Web Deployment (Limited Functionality)

1. **Build for Web**
   ```bash
   cd frontend
   npx expo export:web
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir web-build
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

## 🗄️ Database Setup

### Supabase (Primary)

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Note down URL and anon key

2. **Create Tables**
   ```sql
   -- Create locations table
   CREATE TABLE locations (
     id TEXT PRIMARY KEY,
     latitude DOUBLE PRECISION NOT NULL,
     longitude DOUBLE PRECISION NOT NULL,
     address TEXT,
     googlemapsurl TEXT,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Insert default location
   INSERT INTO locations (id, latitude, longitude, address, googlemapsurl)
   VALUES ('swamiji_location', 12.308367, 76.645467, 'Avadhoota Datta Peetham', 'https://maps.google.com/?q=12.308367,76.645467');
   ```

3. **Configure RLS (Row Level Security)**
   ```sql
   -- Enable RLS
   ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
   
   -- Allow read access
   CREATE POLICY "Allow read access" ON locations FOR SELECT USING (true);
   
   -- Allow update for authenticated users (optional)
   CREATE POLICY "Allow update for authenticated users" ON locations FOR UPDATE USING (auth.role() = 'authenticated');
   ```

### MongoDB Atlas (Fallback)

1. **Create Cluster**
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Create database user
   - Whitelist IP addresses

2. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/compass_app?retryWrites=true&w=majority
   ```

## ⚙️ Environment Configuration

### Production Environment Variables

#### Backend
```env
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
DB_NAME="compass_app_prod"
```

#### Frontend
```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Staging Environment

#### Backend
```env
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
DB_NAME="compass_app_staging"
```

#### Frontend
```env
EXPO_PUBLIC_API_URL=https://staging-api-domain.com/api
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
```

## 🔄 CI/CD Pipeline

### GitHub Actions

1. **Create Workflow File**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy-backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to Railway
           run: |
             npm install -g @railway/cli
             railway login --token ${{ secrets.RAILWAY_TOKEN }}
             railway up --service backend
   
     build-mobile:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - name: Setup Expo
           uses: expo/expo-github-action@v8
           with:
             expo-version: latest
             token: ${{ secrets.EXPO_TOKEN }}
         - name: Install dependencies
           run: |
             cd frontend
             npm install
         - name: Build Android
           run: |
             cd frontend
             eas build --platform android --non-interactive
   ```

2. **Required Secrets**
   - `RAILWAY_TOKEN`: Railway deployment token
   - `EXPO_TOKEN`: Expo access token
   - `SUPABASE_URL`: Production Supabase URL
   - `SUPABASE_ANON_KEY`: Production Supabase anon key

## 📊 Monitoring & Maintenance

### Backend Monitoring

1. **Health Check Endpoint**
   ```python
   @app.get("/health")
   async def health_check():
       return {
           "status": "healthy",
           "timestamp": datetime.utcnow(),
           "version": "1.0.0"
       }
   ```

2. **Logging Setup**
   ```python
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
   )
   ```

3. **Error Tracking**
   - Use Sentry for error tracking
   - Set up alerts for critical errors
   - Monitor API response times

### Frontend Monitoring

1. **Expo Analytics**
   ```bash
   cd frontend
   npx expo install expo-analytics-amplitude
   ```

2. **Crash Reporting**
   ```bash
   cd frontend
   npx expo install expo-error-recovery
   ```

### Database Monitoring

1. **Supabase Dashboard**
   - Monitor query performance
   - Set up alerts for high usage
   - Review logs regularly

2. **MongoDB Atlas**
   - Monitor cluster performance
   - Set up alerts for connection issues
   - Review slow queries

## 🔒 Security Considerations

### Backend Security

1. **CORS Configuration**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.com"],  # Specific domains in production
       allow_credentials=True,
       allow_methods=["GET", "POST"],
       allow_headers=["*"],
   )
   ```

2. **Rate Limiting**
   ```python
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
   
   @app.get("/api/location/swamiji")
   @limiter.limit("10/minute")
   async def get_location(request: Request):
       # Implementation
   ```

### Frontend Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for different environments
   - Rotate keys regularly

2. **API Security**
   - Validate all API responses
   - Handle errors gracefully
   - Implement retry logic with exponential backoff

## 📈 Scaling Considerations

### Backend Scaling

1. **Horizontal Scaling**
   - Use load balancer
   - Deploy multiple instances
   - Implement health checks

2. **Database Scaling**
   - Use connection pooling
   - Implement caching (Redis)
   - Consider read replicas

### Frontend Scaling

1. **Over-the-Air Updates**
   ```bash
   cd frontend
   eas update --branch production --message "Bug fixes and improvements"
   ```

2. **Performance Optimization**
   - Implement lazy loading
   - Optimize images and assets
   - Use React Native performance profiler

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check dependency versions
   - Clear caches
   - Verify environment variables

2. **Runtime Errors**
   - Check logs
   - Verify database connections
   - Test API endpoints

3. **Performance Issues**
   - Monitor resource usage
   - Optimize database queries
   - Implement caching

### Support Contacts

- **Technical Issues**: Create GitHub issue
- **Deployment Help**: Check documentation
- **Emergency**: Contact development team

---

**Note**: Always test deployments in staging environment before production release.