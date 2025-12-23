import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/api';

async function runWorker() {
    console.log("Worker started...");

    let article;
    try {
        const response = await axios.get(`${API_URL}/articles/pending`);
        article = response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log("No pending articles found.");
            return;
        }
        console.error("API Error:", error.message);
        return;
    }

    console.log(`Processing: "${article.title}"`);

    const searchParam = article.title.split(' ').slice(0, 5).join(' ') + " blog";
    console.log(`Searching Google for: "${searchParam}"`);

    let links = [];
    try {
        links = await searchGoogle(searchParam);
    } catch (err) {
        console.error("Google Search failed:", err.message);
    }

    if (links.length > 0) {
        console.log(`Found links:`, links);
    } else {
        console.log("No links found. Proceeding with AI rewrite only.");
    }

    let competitorContext = "";
    for (const link of links) {
        console.log(`Scraping: ${link}`);
        const content = await scrapeContent(link);
        if (content) {
            competitorContext += `\n\n--- SOURCE: ${link} ---\n${content.substring(0, 1500)}`;
        }
    }

    console.log("Generating new content with AI...");
    let enhancedContent = "";
    try {
        enhancedContent = await generateNewArticle(article, competitorContext, links);
    } catch (err) {
        console.error("AI Generation failed:", err.message);
        return;
    }

    try {
        await axios.put(`${API_URL}/articles/${article.id}`, {
            updated_content: enhancedContent,
            references_json: links,
            status: 'completed'
        });
        console.log("Article updated successfully!");
    } catch (error) {
        console.error("Failed to save update:", error.message);
    }
}

async function searchGoogle(query) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
        
        const links = await page.evaluate(() => {
            const results = Array.from(document.querySelectorAll('.g a'));
            return results
                .map(a => a.href)
                .filter(href => href.startsWith('http') && !href.includes('google.com') && !href.includes('youtube.com'))
                .slice(0, 2);
        });
        return links;
    } finally {
        await browser.close();
    }
}

async function scrapeContent(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000 
        });
        const $ = cheerio.load(data);
        
        $('script, style, nav, footer, header, aside, .ads').remove();
        
        return $('p').map((i, el) => $(el).text()).get().join(' ');
    } catch (error) {
        console.log(`Scrape skipped (${url})`);
        return null;
    }
}

async function generateNewArticle(original, context, links) {
    const prompt = `
    You are an expert editor. Rewrite the following article to make it more comprehensive using the competitor insights provided.
    
    ORIGINAL TITLE: ${original.title}
    ORIGINAL CONTENT: ${original.original_content}
    
    COMPETITOR INSIGHTS:
    ${context}
    
    REQUIREMENTS:
    1. Output valid Markdown.
    2. Use ## for Section Headers.
    3. The content should be comprehensive (approx 500-800 words).
    4. At the very end, create a section called "## References" and list the URLs provided below.
    
    URLS TO CITE:
    ${links.join(', ')}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

runWorker();