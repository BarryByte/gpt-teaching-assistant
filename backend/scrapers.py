import requests
import json
from bs4 import BeautifulSoup
from typing import Dict, Optional, List
import logging
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def clean_text(text: str) -> str:
    """Removes extra newlines, spaces, and formatting artifacts."""
    return ' '.join(text.split()).strip()

class Scraper:
    def fetch_problem(self, identifier: str) -> Optional[Dict]:
        raise NotImplementedError

class LeetCodeScraper(Scraper):
    def fetch_problem(self, slug: str) -> Optional[Dict]:
        url = "https://leetcode.com/graphql"
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Referer": f"https://leetcode.com/problems/{slug}/"
        }
        query = {
            "query": """
            query getQuestionDetail($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    title
                    difficulty
                    topicTags { name }
                    content
                    hints
                    stats
                }
            }""",
            "variables": {"titleSlug": slug}
        }

        try:
            response = requests.post(url, headers=headers, json=query)
            response.raise_for_status()
            data = response.json().get("data", {}).get("question", {})
            if not data:
                return None

            soup = BeautifulSoup(data.get("content", ""), "html.parser")
            description = clean_text(soup.get_text())

            return {
                "title": data.get("title"),
                "difficulty": data.get("difficulty"),
                "tags": [tag["name"] for tag in data.get("topicTags", [])],
                "description": description,
                "hints": data.get("hints", []),
                "platform": "LeetCode"
            }
        except Exception as e:
            logging.error(f"LeetCode Scraper Error: {e}")
            return None

class CodeforcesScraper(Scraper):
    def fetch_problem(self, identifier: str) -> Optional[Dict]:
        # identifier expected as: contestId/index (e.g. 1/A)
        try:
            if "/" not in identifier:
                return None
            contest_id, index = identifier.split("/")
            url = f"https://codeforces.com/api/contest.standings?contestId={contest_id}&from=1&count=1"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            if data["status"] != "OK":
                return None
            
            # Codeforces API doesn't give description easily via contest.standings
            # We would need to scrape the HTML for description
            problem_url = f"https://codeforces.com/contest/{contest_id}/problem/{index}"
            html_response = requests.get(problem_url)
            html_response.raise_for_status()
            soup = BeautifulSoup(html_response.text, "html.parser")
            
            problem_statement = soup.find("div", class_="problem-statement")
            if not problem_statement:
                return None
                
            title = problem_statement.find("div", class_="title").get_text()
            description = clean_text(problem_statement.find("div", class_="") .get_text()) # This is a bit broad, but CF structure is complex
            
            # Simple extraction for CF
            content = problem_statement.find("div", class_="header").next_sibling
            # This is hard to get perfectly without more specific logic, but let's start with title and basic tags
            
            return {
                "title": title,
                "difficulty": "Unknown", # CF difficulty is usually points or *rating
                "tags": [], # Can be found in contest data
                "description": description,
                "hints": [],
                "platform": "Codeforces"
            }
        except Exception as e:
            logging.error(f"Codeforces Scraper Error: {e}")
            return None

def get_scraper(url_or_slug: str):
    parsed = urlparse(url_or_slug)
    if "leetcode.com" in parsed.netloc:
        return LeetCodeScraper(), "leetcode"
    elif "codeforces.com" in parsed.netloc:
        return CodeforcesScraper(), "codeforces"
    
    # Default to LeetCode if it looks like a slug
    if not parsed.netloc and url_or_slug:
        return LeetCodeScraper(), "leetcode"
    
    return None, None

def extract_identifier(url_or_slug: str, platform: str) -> str:
    if platform == "leetcode":
        parsed = urlparse(url_or_slug)
        if not parsed.netloc: return url_or_slug
        path_segments = parsed.path.strip('/').split('/')
        if len(path_segments) > 1 and path_segments[0] == "problems":
            return path_segments[1]
        return url_or_slug
    elif platform == "codeforces":
        parsed = urlparse(url_or_slug)
        if not parsed.netloc: return url_or_slug
        # URL format: https://codeforces.com/contest/1915/problem/A
        path_segments = parsed.path.strip('/').split('/')
        if "contest" in path_segments and "problem" in path_segments:
            c_idx = path_segments.index("contest")
            p_idx = path_segments.index("problem")
            return f"{path_segments[c_idx+1]}/{path_segments[p_idx+1]}"
        return url_or_slug
    return url_or_slug
