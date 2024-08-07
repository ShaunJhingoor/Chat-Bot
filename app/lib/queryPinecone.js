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
                    { role: 'user', content: `Provide a concise and clear answer based on the following context:\n\n${context}\n\nQuestion: ${question}` }
                ],
                max_tokens: 100
            });
            console.log(context)
            console.log(completion)
            const answer =  completion.choices[0]?.message?.content?.trim() 
            if (answer) {
                // console.log(chalk.cyan('Completion:'), answer);
                return answer;
              } else {
                return 'I do not have access to that information.';
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
