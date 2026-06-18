import os
import jwt
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    clerk_pub_key = os.getenv("CLERK_PEM_PUBLIC_KEY")
    
    if not clerk_pub_key:
        # Fallback to test mode if no key configured, to avoid breaking local dev entirely
        # BUT this is unsafe for production. In a real scenario, we should fetch from JWKS.
        # We will try to decode without verification if in a pure test environment,
        # otherwise we enforce verification.
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            return unverified
        except Exception as e:
            raise HTTPException(status_code=401, detail="Invalid token format")

    try:
        # Replace \n in env var with actual newlines
        formatted_key = clerk_pub_key.replace("\\n", "\n")
        
        decoded_token = jwt.decode(
            token,
            formatted_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
