

const WebSearch = (query) => {
    const url = "http://10.96.1.130/search"

    const params = {
        "q": query,
        "format": "json",
        "language": "en",
        "pageno": 1,
        "categories": "general"
    }

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
    }

    
}

export default WebSearch;