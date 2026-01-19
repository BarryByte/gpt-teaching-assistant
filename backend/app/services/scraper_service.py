
from functools import lru_cache
from typing import Dict
from fastapi import HTTPException
from .scrapers import get_scraper, extract_identifier

@lru_cache(maxsize=100)
def get_problem_data(identifier: str) -> Dict:
    scraper, platform = get_scraper(identifier)
    if not scraper:
        raise HTTPException(status_code=400, detail="Unsupported platform or invalid URL")
    
    clean_id = extract_identifier(identifier, platform)
    data = scraper.fetch_problem(clean_id)
    
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for {identifier} on {platform}")
        
    return data
