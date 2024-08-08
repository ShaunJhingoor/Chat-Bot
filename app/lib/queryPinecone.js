import { OpenAI } from 'openai';
import chalk from 'chalk';

const cleanText = (text) => {
    // Remove specific unwanted text and excessive whitespace
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

        console.log(chalk.blue("Requesting embeddings for:"), question);
        const queryEmbedding = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: preprocessQuestion(question)
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
            includeValues: true
        });

        if (queryResponse.matches.length) {
            let context = queryResponse.matches.map(match => match.metadata.pageContent).join("\n");
            
            // Clean up the text
            context = cleanText(context);
            console.log(chalk.red("context:"), context);
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a knowledgeable assistant who creates detailed summaries of provided contexts, capturing key points and nuances without omitting important information.'
                    },
                    {
                        role: 'user',
                        content: `
                    Provide a detailed summary of the following context, capturing all key points and nuances:
            
                    ---
            
                    **Context:**
            
                    ${context}
                    `
                    }
                ],
                max_tokens: 300
            });
            
            
            

            const answer = completion.choices[0]?.message?.content?.trim();
            console.log(chalk.blue("Answer:"), answer);
            if (answer) {
                return answer;
            } else {
                return 'Not trained on this information.';
            }
        } else {
            return 'No relevant information found.';
        }
    } catch (error) {
        console.error(chalk.red("Error in queryPineconeVectorStoreAndQueryLLM:"), error);
        return 'An error occurred while processing your request.';
    }
};

export default queryPineconeVectorStoreAndQueryLLM;
