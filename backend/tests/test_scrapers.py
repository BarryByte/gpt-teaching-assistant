from app.services.scrapers import (
    CodeforcesScraper,
    LeetCodeScraper,
    extract_identifier,
    get_scraper,
)


def test_leetcode_scraper(mocker):
    scraper = LeetCodeScraper()

    # Mock requests.post
    mock_post = mocker.patch("requests.post")
    mock_response = mocker.Mock()
    mock_response.json.return_value = {
        "data": {
            "question": {
                "title": "Two Sum",
                "difficulty": "Easy",
                "topicTags": [{"name": "Array"}],
                "content": "<p>Find two numbers...</p>",
                "hints": ["Use a hash map"],
            }
        }
    }
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response

    data = scraper.fetch_problem("two-sum")

    assert data is not None
    assert data["title"] == "Two Sum"
    assert data["difficulty"] == "Easy"
    assert data["platform"] == "LeetCode"
    assert "Find two numbers" in data["description"]


def test_codeforces_scraper_fail(mocker):
    # Test invalid identifier format
    scraper = CodeforcesScraper()
    data = scraper.fetch_problem("invalid")
    assert data is None


def test_get_scraper_factory():
    scraper, platform = get_scraper("https://leetcode.com/problems/two-sum/")
    assert isinstance(scraper, LeetCodeScraper)
    assert platform == "leetcode"

    scraper, platform = get_scraper("https://codeforces.com/contest/1/problem/A")
    assert isinstance(scraper, CodeforcesScraper)
    assert platform == "codeforces"


def test_extract_identifier():
    assert (
        extract_identifier(
            "https://leetcode.com/problems/two-sum/description/", "leetcode"
        )
        == "two-sum"
    )
    assert (
        extract_identifier("https://codeforces.com/contest/123/problem/C", "codeforces")
        == "123/C"
    )
