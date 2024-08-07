import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const createPineconeIndex = async (client, indexName, vectorDimension) => {
//   console.log(`Checking "${indexName}"...`);
  const data = await client.listIndexes();
  const existingIndexes = data.indexes.map((index) => index.name);
  if (!existingIndexes.includes(indexName)) {
    // console.log(`Creating "${indexName}"...`);
    await client.createIndex({
      name: indexName,
      dimension: vectorDimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-west-2',
        },
      },
    });
    // console.log(`Index "${indexName}" created. Please wait for it to initialize.`);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for index to initialize
  }
};

const initPinecone = async () => {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = 'frontend-helper'; // Your desired index name
  const vectorDimension = 1536; // Adjust based on your use case

  if (!apiKey) {
    throw new Error('Missing Pinecone API key');
  }

  const pinecone = new Pinecone({ apiKey: apiKey });

  await createPineconeIndex(pinecone, indexName, vectorDimension);

  return {
    pinecone: pinecone,
    indexName: indexName
  };
};

export default initPinecone;
