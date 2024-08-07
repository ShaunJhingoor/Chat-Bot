import { OpenAI } from 'openai';

const queryPineconeVectorStoreAndQueryLLM = async (client, indexName, question) => {
    if (!question) {
        console.error("No question provided.");
        return '';
    }

    try {
        const index = client.Index(indexName);
        const openai = new OpenAI();

        console.log("Requesting embeddings for:", question);
        const queryEmbedding = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: question
        });
        const embeddingVector = queryEmbedding.data[0]?.embedding;

        if (!embeddingVector) {
            console.error("No embedding vector received.");
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
            context = context
                .replace(/React Blog|React Docs|React Versions|Legacy Docs/g, '') // Remove headers or specific unwanted text
                .replace(/\s{2,}/g, ' ') 
                .trim();

            const completion = await openai.chat.completions.create({
                model: 'gpt-4', 
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Based on the following context:\n\n${context}\n\nAnswer the question: ${question}. If you can't provide a relevant answer based on the context, respond with "Not trained on this information."` }
                ],
                max_tokens: 100
            });

            const answer = completion.choices[0]?.message?.content?.trim();
            
            if (answer) {
                // Optionally, you can add additional checks here to see if the answer seems relevant
                return answer;
            } else {
                return 'Not trained on this information.';
            }
        } else {
            return 'No relevant information found.';
        }
    } catch (error) {
        console.error("Error in queryPineconeVectorStoreAndQueryLLM:", error);
        return 'An error occurred while processing your request.';
    }
};

export default queryPineconeVectorStoreAndQueryLLM;
