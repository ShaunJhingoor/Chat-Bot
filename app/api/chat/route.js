import { NextResponse } from "next/server";
import initPinecone from "../../lib/initPinecone";
import queryPineconeVectorStoreAndQueryLLM from "../../lib/queryPinecone";

export async function POST(req) {
    try {
        const data = await req.json();
        console.log('data in post route: ', data)
        const question = data.content;

        if (!question) {
            return new NextResponse('No question provided', { status: 400 });
        }

        const { pinecone, indexName } = await initPinecone();
        const completion = await queryPineconeVectorStoreAndQueryLLM(
            pinecone,
            indexName,
            question
        );
        return new NextResponse(JSON.stringify({ answer: completion }), { status: 200 });
    } catch (error) {
        console.error('Error in API route:', error);
        return new NextResponse('Failed to process request', { status: 500 });
    }
}
