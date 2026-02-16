'use server'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-f697524978d54652a68750709103c2bb';

export async function searchProduct(query: string) {
  if (!query) {
    throw new Error('Query is required');
  }

  console.log(`Starting search for: ${query}`);

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 3,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firecrawl Search API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Firecrawl Search API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`Firecrawl Search Failed: ${JSON.stringify(data)}`);
      throw new Error(`Search failed: ${data.error || 'Unknown error'}`);
    }
    
    if (data.data && data.data.length > 0) {
        // Return top 3 results
        return data.data.slice(0, 3).map((item: any) => ({
            url: item.url,
            markdown: item.markdown || '',
            title: item.title || ''
        }));
    } else {
        throw new Error('No search results found');
    }

  } catch (error: any) {
    console.error('SearchProduct Error:', error.message);
    throw new Error(`Failed to search product: ${error.message}`);
  }
}

export async function scrapeUrl(url: string) {
  if (!url) {
    throw new Error('URL is required');
  }

  console.log(`Starting scrape for: ${url}`);

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
      console.error(`Firecrawl API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Firecrawl API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`Firecrawl Scraping Failed: ${JSON.stringify(data)}`);
      throw new Error(`Scraping failed: ${data.error || 'Unknown error'}`);
    }
    
    const markdown = data.data?.markdown || '';
    
    console.log('--- Scraped Content (First 500 chars) ---');
    console.log(markdown.substring(0, 500));
    console.log('-----------------------------------------');

    return markdown;

  } catch (error: any) {
    console.error('ScrapeUrl Error:', error.message);
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

export async function analyzeProduct(formData: FormData) {
  const url = formData.get('url') as string;
  
  if (!url) {
    return { error: 'URL is required' };
  }

  try {
    // Call scrapeUrl
    const scrapedContent = await scrapeUrl(url);

    // Simulate analysis delay (or replace with actual LLM call later)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        title: "Product Analysis",
        scrapedPreview: scrapedContent.substring(0, 200) + "...",
        swot: {
          strengths: ["High build quality (inferred)", "Positive reviews detected"],
          weaknesses: ["Price point mentioned", "Availability issues"],
          opportunities: ["Expand to new markets", "Bundle offers"],
          threats: ["Competitor X", "Market saturation"]
        }
      }
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
