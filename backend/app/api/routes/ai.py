from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()


class GenerateMessageRequest(BaseModel):
    recipient_name: str
    sender_name: str
    gift_name: str
    gift_type: Optional[str] = None
    recipient_age: Optional[int] = None  # Age in years
    recipient_country: Optional[str] = None  # Country code or name


class MessageResponse(BaseModel):
    message: str
    success: bool


class TemplateMessagesRequest(BaseModel):
    recipient_name: str
    recipient_age: Optional[int] = None
    recipient_country: Optional[str] = None


@router.post("/generate-gift-message")
async def generate_gift_message(request: GenerateMessageRequest):
    """
    Generate an AI-powered personalized gift message using Google Gemini API
    """
    
    # Fallback template messages (500 unique messages)
    from app.utils.template_messages import get_template_messages
    template_messages = get_template_messages(
        recipient_name=request.recipient_name,
        recipient_age=request.recipient_age,
        recipient_country=request.recipient_country
    )
    
    # Try to use Gemini API
    # Get API key from environment variable only (for production security)
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    
    if not gemini_api_key:
        # Fallback to template if API key not configured
        import random
        message = random.choice(template_messages)
        return MessageResponse(
            message=message,
            success=True
        )
    
    try:
        import google.generativeai as genai
        
        # Configure Gemini
        genai.configure(api_key=gemini_api_key)
        
        # Initialize the model (using gemini-2.5-flash for fast responses)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Build age and culture context for prompt
        age_context = ""
        if request.recipient_age is not None:
            if request.recipient_age < 13:
                age_context = " The recipient is a child, so keep the message simple, fun, and age-appropriate."
            elif request.recipient_age < 18:
                age_context = " The recipient is a teenager, so keep the message energetic and relatable."
            elif request.recipient_age < 65:
                age_context = " The recipient is an adult, so keep the message mature and thoughtful."
            else:
                age_context = " The recipient is a senior, so keep the message respectful and warm, avoiding references to getting older."
        
        culture_context = ""
        if request.recipient_country:
            culture_context = f" The recipient is from {request.recipient_country}, so consider cultural appropriateness."
        
        # Create the prompt
        prompt = f"""Write a warm, personalized birthday message from {request.sender_name} to {request.recipient_name} for a {request.gift_name}.{age_context}{culture_context}

Requirements:
- Message must be between 80-150 characters
- Be genuine, warm, and celebratory
- Include 1-2 emojis (like 🎉, 🎂, ✨, 🎈)
- Make it personal and heartfelt
- Sound natural and conversational
- Do NOT include quotes, asterisks, brackets, or any formatting
- Do NOT include phrases like "Here's a message:" or "Message:"

Example format: "Happy Birthday, Sarah! 🎉 Wishing you a day filled with joy and all the wonderful things you deserve. Enjoy your special day!"

Now write the message:"""
        
        # Generate the message
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=200,  # Increased from 100 to allow full messages
                top_p=0.95,
                top_k=40,
            )
        )
        
        # Extract message from response
        if hasattr(response, 'text'):
            message = response.text.strip()
        elif hasattr(response, 'candidates') and len(response.candidates) > 0:
            message = response.candidates[0].content.parts[0].text.strip()
        else:
            raise ValueError("Unexpected response format from Gemini API")
        
        # Log the raw response for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Raw Gemini response: {message[:100]}...")
        
        # Clean up the message (remove quotes if present)
        if message.startswith('"') and message.endswith('"'):
            message = message[1:-1]
        if message.startswith("'") and message.endswith("'"):
            message = message[1:-1]
        
        # Remove any prefix like "Message:" or "Here's a message:"
        prefixes_to_remove = [
            "Message:",
            "Here's a message:",
            "Here is a message:",
            "Birthday message:",
            "Gift message:",
            "Here's your message:",
            "Your message:",
        ]
        for prefix in prefixes_to_remove:
            if message.lower().startswith(prefix.lower()):
                message = message[len(prefix):].strip()
                # Remove colon if present after prefix
                if message.startswith(':'):
                    message = message[1:].strip()
        
        # Remove any markdown formatting
        message = message.replace('**', '').replace('*', '').replace('_', '').replace('`', '')
        
        # Ensure message is not too long
        if len(message) > 200:
            message = message[:197] + "..."
        
        # Ensure message is not too short (if it's less than 5 words, use template)
        word_count = len(message.split())
        if word_count < 5:
            logger.warning(f"AI generated short message ({word_count} words): '{message}'. Using template fallback.")
            import random
            message = random.choice(template_messages)
        
    except Exception as e:
        # Fallback to template if API fails
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Gemini API error: {e}")
        import random
        message = random.choice(template_messages)
    
    return MessageResponse(
        message=message,
        success=True
    )


@router.post("/get-template-messages")
async def get_template_messages_endpoint(request: TemplateMessagesRequest):
    """
    Get template birthday messages (500 unique messages with age/culture filtering)
    """
    from app.utils.template_messages import get_template_messages
    
    messages = get_template_messages(
        recipient_name=request.recipient_name,
        recipient_age=request.recipient_age,
        recipient_country=request.recipient_country
    )
    
    return {
        "messages": messages,
        "count": len(messages)
    }

