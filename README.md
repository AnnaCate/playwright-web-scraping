## Google Search Results Scraping POC

A quick demo on scraping the top news stories and search results for a given query. Returns only recent articles.

### Get Started

```
npm install

node get-top-stories "Your search term or phrase goes here"

node get-search-results "Your search term or phrase goes here"

```

**Note:** not every search term will have top stories, nor will every search term have search results. Remember that the functions only return recent results. If you try one and get an empty array back, try the other one. If you still can't get any results, perhaps your search term isn't trending.
