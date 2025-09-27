from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from supabase import create_client, Client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Supabase connection
supabase_url = "https://kpqwrcjtubmuxcegltty.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcXdyY2p0dWJtdXhjZWdsdHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzI1MjMsImV4cCI6MjA2MzYwODUyM30.y84yzzcxaevq9VDDEfFG7wo1-OHnlbm2OHM-KQQ1aLo"

# Try to create Supabase client, fallback to MongoDB if DNS fails
try:
    supabase: Client = create_client(supabase_url, supabase_key)
    # Test connection
    import socket
    socket.gethostbyname('kpqwrcjtubmuxcegltty.supabase.co')
    USE_SUPABASE = True
    logger.info("Supabase connection established")
except Exception as e:
    logger.warning(f"Supabase connection failed, using MongoDB fallback: {e}")
    supabase = None
    USE_SUPABASE = False

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class LocationData(BaseModel):
    id: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    googlemapsurl: Optional[str] = None
    updated_at: datetime

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Location endpoints for compass functionality
@api_router.get("/location/swamiji", response_model=LocationData)
async def get_swamiji_location():
    """Get Swamiji's current location"""
    try:
        result = supabase.table('locations').select('*').eq('id', 'swamiji_location').execute()
        
        if not result.data:
            # Return default location if not found
            default_location = {
                'id': 'swamiji_location',
                'latitude': 12.308367,
                'longitude': 76.645467,
                'address': 'Avadhoota Datta Peetham',
                'googlemapsurl': None,
                'updated_at': datetime.utcnow().isoformat()
            }
            return LocationData(**default_location)
        
        location_data = result.data[0]
        # Convert string to datetime if needed
        if isinstance(location_data['updated_at'], str):
            location_data['updated_at'] = datetime.fromisoformat(location_data['updated_at'].replace('Z', '+00:00'))
        
        return LocationData(**location_data)
        
    except Exception as e:
        logger.error(f"Error fetching Swamiji location: {e}")
        # Return default location on error
        default_location = {
            'id': 'swamiji_location',
            'latitude': 12.308367,
            'longitude': 76.645467,
            'address': 'Avadhoota Datta Peetham',
            'googlemapsurl': None,
            'updated_at': datetime.utcnow()
        }
        return LocationData(**default_location)

@api_router.post("/location/swamiji", response_model=LocationData)
async def update_swamiji_location(location_update: LocationUpdate):
    """Update Swamiji's location"""
    try:
        update_data = {
            'id': 'swamiji_location',
            'latitude': location_update.latitude,
            'longitude': location_update.longitude,
            'address': location_update.address,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('locations').upsert(update_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update location")
        
        location_data = result.data[0]
        if isinstance(location_data['updated_at'], str):
            location_data['updated_at'] = datetime.fromisoformat(location_data['updated_at'].replace('Z', '+00:00'))
        
        return LocationData(**location_data)
        
    except Exception as e:
        logger.error(f"Error updating Swamiji location: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update location: {str(e)}")

@api_router.post("/location/initialize")
async def initialize_default_location():
    """Initialize default location for Swamiji"""
    try:
        default_location = {
            'id': 'swamiji_location',
            'latitude': 12.308367,
            'longitude': 76.645467,
            'address': 'Avadhoota Datta Peetham',
            'googlemapsurl': 'https://maps.google.com/?q=12.308367,76.645467',
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('locations').upsert(default_location).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to initialize location")
        
        return {"message": "Default location initialized successfully", "location": result.data[0]}
        
    except Exception as e:
        logger.error(f"Error initializing default location: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize location: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging already configured above

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
