import { NextResponse } from "next/server";
import initPinecone from "../../lib/initPinecone";
import queryPineconeVectorStoreAndQueryLLM from "../../lib/queryPinecone";

export async function POST(req) {
    try {
        const data = await req.json();
        const question = data.find(x => x.role === 'user')?.content;

        if (!question) {
            return new NextResponse('No question provided', { status: 400 });
        }

        const { pinecone, indexName } = await initPinecone();
        const { context, openai } = await queryPineconeVectorStoreAndQueryLLM(pinecone, indexName, question);

        if (!context) {
            return new NextResponse('No relevant context found', { status: 200 });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Summarize key points only. You are trained on react documentation and nothing else.'
                },
                {
                    role: 'user',
                    content: `Context: ${context}`
                }
            ],
            max_tokens: 150,  
            temperature: 0.7,
            stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    } catch (error) {
        console.error('Error in API route:', error);
        return new NextResponse('Failed to process request', { status: 500 });
    }
}
