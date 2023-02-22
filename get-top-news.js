const playwright = require('playwright');

const QUERY = process.argv.slice(2)[0]

// scrape top stories from google.com for a given search term
async function getTopStories (query) {
  const browser = await playwright.chromium.launch({
    headless: true,
  })

  const page = await browser.newPage()
  const encodedQuery = encodeURIComponent(query)
  await page.goto(`https://www.google.com/search?q=${encodedQuery}`)

  const locator = page.locator('.WlydOe')
  const newsArticles = await locator.evaluateAll((all_items) => {
    {
      const data = [];

      all_items.forEach(newsItem => {
        const headline = newsItem.querySelector('.mCBkyc')?.innerText
        const href = newsItem.href

        const timeframe = newsItem.querySelector('.OSrXXb')?.innerText
        const regex = new RegExp(/hours|day/, 'g')
        const timeframeIsRecent = regex.test(timeframe)
        // no recent timeframe indicates it's not the type of link we want
        if (!timeframeIsRecent) return

        data.push({headline, href, timeframe})
      })
      return data
  }
  })

  await browser.close()
  return newsArticles
}

getTopStories(QUERY).then(res => console.log(res))