import { OpenAI } from 'openai';
import chalk from 'chalk';

const cleanText = (text) => {
    return text
        .replace(/React Blog|React Docs|React Versions|Legacy Docs/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const preprocessQuestion = (question) => {
    return question.trim().toLowerCase();
};

const queryPineconeVectorStoreAndQueryLLM = async (client, indexName, question) => {
    if (!question) {
        console.error(chalk.red("No question provided."));
        return '';
    }

    try {
        const index = client.Index(indexName);
        const openai = new OpenAI();

        // console.log(chalk.blue("Requesting embeddings for:"), question);
        const queryEmbedding = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: preprocessQuestion(question),
        });

        const embeddingVector = queryEmbedding.data[0]?.embedding;
        if (!embeddingVector) {
            console.error(chalk.red("No embedding vector received."));
            return '';
        }

        const queryResponse = await index.query({
            topK: 10,
            vector: embeddingVector,
            includeMetadata: true,
            includeValues: true,
        });
        console.log(chalk.green("length:"), queryResponse.matches.length)
        if (!queryResponse.matches.length ) {
            return 'No relevant information found.';
        }

        let context = queryResponse.matches.map(match => match.metadata.pageContent).join("\n");
        context = cleanText(context);

        // console.log(chalk.red("context:"), context);

        return { context, openai }; 
    } catch (error) {
        console.error(chalk.red("Error in queryPineconeVectorStoreAndQueryLLM:"), error);
        return 'An error occurred while processing your request.';
    }
};

export default queryPineconeVectorStoreAndQueryLLM;
