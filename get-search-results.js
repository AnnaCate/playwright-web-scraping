const playwright = require('playwright');

const QUERY = process.argv.slice(2)[0]

// scrape top search results
async function getOrgSearchResults (query) {
  const browser = await playwright.chromium.launch({
    headless: true,
  })

  const page = await browser.newPage()
  const encodedQuery = encodeURIComponent(query)
  await page.goto(`https://www.google.com/search?q=${encodedQuery}`)

  const locator = page.locator("xpath=//div[@id='search']")
  const searchResults = await locator.evaluate(searchContainer => {
     const data = [];
     const container = document.evaluate(".//a[descendant::h3]/ancestor::div[position() = 3]", searchContainer)
     let node = null

      while (node = container.iterateNext()) {
        const { stringValue: headline} = document.evaluate(".//a/h3/text()", node, null, XPathResult.STRING_TYPE, null )
        // no headline indicates it's not the type of link we want
        if (!headline) return

        const { stringValue: timeframe } = document.evaluate(".//span[contains(text(), 'min ago') or contains(text(), 'mins ago') or contains(text(), 'hour ago') or contains(text(), 'hours ago') or contains(text(), 'day ago') or contains(text(), 'days ago')]/text()", node, null, XPathResult.STRING_TYPE, null)

        const { stringValue: href} = document.evaluate(".//a/@href", node, null, XPathResult.STRING_TYPE, null )
        const { stringValue: description} = document.evaluate("string(.//span[descendant::em])", node, null, XPathResult.STRING_TYPE, null )

        // no timeframe indicates it's not the type of link we want
        if (timeframe) data.push({ description, headline, href, timeframe})
      }
      return data
  })
  await browser.close()
  return searchResults
}

getOrgSearchResults(QUERY).then(res => console.log(res))