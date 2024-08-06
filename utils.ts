import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "@langchain/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { timeout } from "./config";
import { match } from "assert";
import { spec } from "node:test/reporters";

export const createPineconeIndex = async (
  client,
  indexName,
  vectorDimension
) => {
  console.log(`Checking "${indexName}"...`);
  const data = await client.listIndexes();
  const existingIndexes = data.indexes.map((index) => index.name);
  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating "${indexName}"...`);
    await client.createIndex({
      name: indexName,
      dimension: vectorDimension,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-west-2",
        },
      },
    });
    console.log(
      `Creating index.... please wait for it to finish initializing.`
    );
    await new Promise((resolve) => setTimeout(resolve, timeout));
  } else {
    console.log(`"${indexName}" already exists.`);
  }
};

export const updatePinecone = async (client, indexName, docs) => {
  const index = client.Index(indexName);
  console.log(`Pinecone index retreived: "${indexName}"`);

  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    console.log(`Splitting text into chunks...`);
    const chunks = await textSplitter.createDocuments(text);
    console.log(`Text split into ${chunks.length} chunks.`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} chunks...`
    );

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`
    );

    const batchSize = 100;
    let batch: any = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch = [...batch, vector];

      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert(batch);
        batch = [];
      }
    }
  }
};

export const queryPineconeVectorStoreAndQueryLLM = async (
  client,
  indexName,
  question
) => {
    if (!question) {
        console.error("No question provided to queryPineconeVectorStoreAndQueryLLM.");
        return;
      }
  console.log("Querying Pinecone vector store...");
  const index = client.Index(indexName);
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
  let queryResponse = await index.query({
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
  });
  console.log(`Found ${queryResponse.matches.length}`);
  console.log(`Asking question: ${question}...`);
  if (queryResponse.matches.length) {
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);

    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join("\n");

    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });

    console.log(`Answer: ${result.text}`);
    return result.text;
  } else {
    console.log("Since no matches were found, GPT will not be queried.");
  }
};
