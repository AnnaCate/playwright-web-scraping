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

  const locator = page.locator('#search')
  const searchResults = await locator.evaluate(searchContainer => {
      const data = [];
      const anchors = searchContainer.querySelectorAll('a:not(.WlydOe):not(.jRKCUd):not(a[href*="/search"])')
      anchors.forEach(a => {
        const headline = a.querySelector('h3, [role="heading"]')?.innerText
        // no headline indicates it's not the type of link we want
        if (!headline) return

        const parent = a.closest('.kvH3mc.BToiNc.UK95Uc')
        const timeframe = parent?.querySelector('.MUxGbd.wuQ4Ob.WZ8Tjf')?.querySelector('span').innerText

        const regex = new RegExp(/hours|day/, 'g')
        const timeframeIsRecent = regex.test(timeframe)
        // no recent timeframe indicates it's not the type of link we want
        if (!timeframeIsRecent) return

        const href = a.href
        const description = parent?.querySelector('em')?.closest('span').innerText
        
        data.push({ description, headline, href, timeframe })
      })
      return data
  })
  await browser.close()
  return searchResults
}

getOrgSearchResults(QUERY).then(res => console.log(res))