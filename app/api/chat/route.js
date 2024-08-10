

import {NextResponse} from 'next/server' 
import OpenAI from 'openai'


const systemPrompt = "Hello user, I am an AI assistance bot."// Use your own system prompt here


export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "", // Use it here aswell
    defaultHeaders: {
      'Content-Type': 'application/json'
    }
  }); 
  const data = await req.json() 


  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], 
    model: 'meta-llama/llama-3.1-8b-instruct:free', 
    stream: true, 
  })


  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() 
      try {

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content 
          if (content) {
            const text = encoder.encode(content) 
            controller.enqueue(text) 
          }
        }
      } catch (err) {
        controller.error(err) 
      } finally {
        controller.close() 
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}


