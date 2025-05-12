from fastapi import Request, HTTPException
from firebase_admin import auth, credentials, initialize_app
import firebase_admin
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)

# ✅ Ensure Firebase is initialized only once
try:
    if not firebase_admin._apps:
        # Get the absolute path to the service account key
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        service_account_path = os.path.join(current_dir, "firebase-adminsdk.json")
        logger.debug(f"Loading Firebase credentials from: {service_account_path}")
        
        if not os.path.exists(service_account_path):
            raise FileNotFoundError(f"Firebase service account key not found at: {service_account_path}")
            
        cred = credentials.Certificate(service_account_path)
        initialize_app(cred)
        logger.debug("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {str(e)}")
    raise

async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed") 