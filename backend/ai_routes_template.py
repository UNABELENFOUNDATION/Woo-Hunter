"""
FastAPI AI routes template for integrating Google Gemini (Generative AI) via a secure backend proxy.
- Keep keys and service account credentials out of the frontend.
- Use environment variables or a secrets manager.
- Add rate limiting, caching, and prompt template validation before calling the model.
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import os
import logging
import google.generativeai as genai
from .api_monitor import record_gemini_usage

router = APIRouter(prefix="/ai", tags=["ai"])

class GenerateRequest(BaseModel):
    prompt: str
    template: str = "default"
    max_tokens: int = 512

@router.post("/generate")
async def generate(req: GenerateRequest):
    # Read config/prompt templates from ai_config.json
    # Basic validation
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    # Check API key
    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise HTTPException(status_code=503, detail="AI service not configured on server")

    # Configure Gemini API
    genai.configure(api_key=api_key)

    try:
        # Initialize model
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Generate response
        response = model.generate_content(
            req.prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=req.max_tokens,
                temperature=0.7,
            )
        )

        # Record usage (estimate tokens)
        input_tokens = len(req.prompt.split()) * 1.3  # Rough estimate
        output_tokens = len(response.text.split()) * 1.3  # Rough estimate

        budget_check = record_gemini_usage(
            tokens_input=int(input_tokens),
            tokens_output=int(output_tokens),
            model="gemini-1.5-flash"
        )

        # Check if we should block due to budget
        if budget_check["status"] == "blocked":
            raise HTTPException(
                status_code=429,
                detail=f"API budget exceeded: {', '.join(budget_check['warnings'])}"
            )

        return {
            "ok": True,
            "text": response.text,
            "usage": {
                "input_tokens": int(input_tokens),
                "output_tokens": int(output_tokens),
                "budget_status": budget_check["status"],
                "warnings": budget_check["warnings"]
            }
        }

    except Exception as e:
        logging.exception("AI call failed")
        # Record failed call
        record_gemini_usage(tokens_input=0, tokens_output=0, model="gemini-1.5-flash")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

# Briefing generation endpoint
@router.post("/generate-briefing")
async def generate_briefing(req: GenerateRequest):
    """Generate a market briefing using AI"""
    briefing_prompt = f"""
    Generate a comprehensive market briefing based on the following request:

    {req.prompt}

    Please structure the briefing with:
    1. Executive Summary
    2. Market Analysis
    3. Key Opportunities
    4. Competitive Landscape
    5. Recommendations
    6. Risk Assessment

    Keep it professional and actionable.
    """

    # Use the same generate function but with enhanced prompt
    enhanced_req = GenerateRequest(
        prompt=briefing_prompt,
        template="briefing",
        max_tokens=2048
    )

    return await generate(enhanced_req)
