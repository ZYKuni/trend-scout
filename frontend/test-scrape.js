const FIRECRAWL_API_KEY = 'fc-f697524978d54652a68750709103c2bb';

async function testScrape(url) {
  console.log(`Testing scrape for: ${url}`);
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      return;
    }

    const data = await response.json();
    if (!data.success) {
      console.error('Scraping failed:', data);
      return;
    }

    console.log('--- Scraped Content (First 500 chars) ---');
    console.log(data.data.markdown.substring(0, 500));
    console.log('-----------------------------------------');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testScrape('https://www.google.com'); // Simple test
