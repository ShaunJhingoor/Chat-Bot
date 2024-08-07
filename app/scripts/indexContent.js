import axios from 'axios';
import cheerio from 'cheerio';
import { OpenAI } from 'openai';
import initPinecone from '../lib/initPinecone.js';
import async from 'async';
import { URL } from 'url';
import chalk from 'chalk'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Ensure you have your OpenAI API key set in your environment variables
});

// Generate embeddings for text chunks
const generateEmbeddings = async (texts) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts
    });
    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

const cleanAndChunkText = (text) => {
  let cleanedText = text
  .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
  .replace(/https?:\/\/\S+/g, '') // Remove URLs
  .replace(/\d{1,2}[:\d]{1,2}/g, '') // Remove timestamps
  .replace(/[^\w\s]/g, '') // Remove special characters
  .replace(/\s+/g, ' ') // Normalize whitespace
  .trim()


  return cleanedText.match(/.{1,1000}/g) || []; // Chunk text into manageable pieces
};

const updatePinecone = async (client, indexName, docs) => {
  const index = client.Index(indexName);

  for (const doc of docs) {
    const text = doc.pageContent;
    const chunks = cleanAndChunkText(text);
    console.log(chalk.blue(`raw : ${text}`));
    console.log(chalk.green(`chunk: ${chunks}`));
    const chunkTexts = chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
    console.log(chalk.yellow('Chunk Texts:'), chalk.magenta(chunkTexts)); // Debugging chunked texts

    const embeddings = await generateEmbeddings(chunkTexts);
  
    const batchSize = 100;
    let batch = [];

    for (let idx = 0; idx < chunkTexts.length; idx++) {
      const chunk = chunkTexts[idx];
      const vector = {
        id: `${doc.metadata.source}_${idx}`,
        values: embeddings[idx],
        metadata: {
          ...doc.metadata,
          pageContent: chunk,
        },
      };
      batch.push(vector);

      if (batch.length === batchSize || idx === chunkTexts.length - 1) {
        await index.upsert(batch);
        batch = [];
      }
    }
  }
};

const scrapePage = async (url, baseUrl, visited, queue, pinecone, indexName) => {
  if (visited.has(url)) return;
  visited.add(url);

  // console.log(`Scraping URL: ${url}`); // Debugging URL being scraped

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Print the raw HTML for debugging
    const rawHtml = $.html();
    // console.log('Raw HTML:', rawHtml);

    // Extract text and check
    const text = $('main').text().trim() || $('body').text().trim();
    // console.log('Extracted Text:', text); // Debugging extracted text

    if (text.length === 0) {
      console.log('No content found at this URL.');
      return;
    }

    const chunks = cleanAndChunkText(text);
    // console.log('Chunks:', chunks); // Debugging chunks

    const docs = chunks.map((chunk, index) => ({
      pageContent: chunk,
      metadata: { source: `${url}_chunk_${index}` }
    }));

    if (docs.length === 0) {
      return;
    }

    await updatePinecone(pinecone, indexName, docs);
   

    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const link = new URL(href, baseUrl).toString();
        if (link.startsWith(baseUrl) && !visited.has(link)) {
          queue.push(() => scrapePage(link, baseUrl, visited, queue, pinecone, indexName));
        }
      }
    });
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
};

(async () => {
  const { pinecone, indexName } = await initPinecone();
  const startUrl = 'https://react.dev/';
  // console.log(`Starting scraping at ${startUrl}`);

  const visited = new Set();
  const queue = async.queue(async (task, done) => {
    await task();
    done();
  }, 5); // Concurrency level: number of simultaneous requests

  queue.push(() => scrapePage(startUrl, startUrl, visited, queue, pinecone, indexName));

  queue.drain(() => {
    console.log('Website content indexed successfully.');
  });
})();

