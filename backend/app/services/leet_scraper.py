import json
import os

import requests
from bs4 import BeautifulSoup


def clean_text(text):
    """Removes extra newlines, spaces, and formatting artifacts."""
    return " ".join(text.split()).strip()


def get_leetcode_problem_data(slug):
    url = "https://leetcode.com/graphql"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/problems/{slug}/",
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
        "variables": {"titleSlug": slug},
    }

    response = requests.post(url, headers=headers, json=query, timeout=10)
    if response.status_code != 200:
        print(f"Error fetching {slug}: {response.status_code} {response.reason}")
        return None

    data = response.json()
    question = data.get("data", {}).get("question", {})

    if not question:
        print(f"Error: No data found for {slug}")
        return None

    # Parse and clean description
    description_html = question.get("content", "")
    soup = BeautifulSoup(description_html, "html.parser")
    description_text = clean_text(soup.get_text())

    # Extract hints (if available)
    hints = question.get("hints", [])
    clean_hints = [clean_text(hint) for hint in hints]

    # Extract problem stats
    # stats = json.loads(question.get("stats", "{}"))

    # Structured output
    problem_data = {
        "title": question.get("title"),
        "difficulty": question.get("difficulty"),
        "tags": [tag["name"] for tag in question.get("topicTags", [])],
        "description": description_text,
        "hints": clean_hints if clean_hints else None,
    }

    return problem_data


def save_problem_data(slug, data):
    """Ensure the directory exists and save the problem data into a JSON file."""
    directory = "leetcode_problems"
    os.makedirs(directory, exist_ok=True)

    filename = os.path.join(directory, f"{slug}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"Saved: {filename}")


# Example usage
slug = "majority-element"
data = get_leetcode_problem_data(slug)
if data:
    save_problem_data(slug, data)
