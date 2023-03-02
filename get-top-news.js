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

  const locator = page.locator("xpath=//g-section-with-header[descendant::span[contains(text(),'Top stories')]]//a")

  const newsArticles = await locator.evaluateAll((a) => {
    {
      const data = [];

      a.forEach(newsItem => {
        const headline = newsItem.querySelector('[role="heading"]')?.innerText
        const href = newsItem.href

        const { stringValue: timeframe } = document.evaluate(".//span[contains(text(), 'min ago') or contains(text(), 'mins ago') or contains(text(), 'hour ago') or contains(text(), 'hours ago') or contains(text(), 'day ago') or contains(text(), 'days ago')]/text()", newsItem, null, XPathResult.STRING_TYPE, null)

        // no timeframe indicates it's not the type of link we want
        if (timeframe) data.push({headline, href, timeframe})
      })
      return data
  }
  })

  await browser.close()
  return newsArticles
}

getTopStories(QUERY).then(res => console.log(res))