"""
Security utilities: Rate limiting, input sanitization, file validation
"""
from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Optional
import re
from PIL import Image
import io

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent XSS attacks.
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Trim whitespace
    text = text.strip()
    
    # Enforce max length
    if len(text) > max_length:
        text = text[:max_length]
    
    # Remove potentially dangerous characters/patterns
    # Remove script tags and event handlers
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
        r'<link[^>]*>',
        r'<meta[^>]*>',
        r'<style[^>]*>.*?</style>',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Escape HTML entities (basic protection)
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#x27;')
    
    # Unescape common safe entities
    text = text.replace('&amp;amp;', '&amp;')
    text = text.replace('&amp;lt;', '&lt;')
    text = text.replace('&amp;gt;', '&gt;')
    
    return text


def validate_file_content(file_content: bytes, allowed_types: list) -> tuple[bool, Optional[str]]:
    """
    Validate file content by actually reading the file, not just MIME type.
    
    Args:
        file_content: File bytes
        allowed_types: List of allowed MIME types
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Try to open as image
        image = Image.open(io.BytesIO(file_content))
        
        # Verify it's actually a valid image
        image.verify()
        
        # Check format
        image_format = image.format.lower()
        valid_formats = {
            'image/jpeg': ['jpeg', 'jpg'],
            'image/png': ['png'],
            'image/gif': ['gif'],
            'image/webp': ['webp'],
        }
        
        # Find matching MIME type
        for mime_type, formats in valid_formats.items():
            if image_format in formats and mime_type in allowed_types:
                return True, None
        
        return False, f"File format {image_format} not allowed"
        
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"


def get_client_ip(request: Request) -> str:
    """Get client IP address for rate limiting"""
    if request.client:
        return request.client.host
    return "unknown"


# Rate limit configurations
RATE_LIMITS = {
    "auth": "10/minute",  # Login/signup attempts
    "api": "100/minute",  # General API calls
    "upload": "20/hour",  # File uploads
    "admin": "200/minute",  # Admin operations
    "contact": "5/hour",  # Contact form submissions
}

