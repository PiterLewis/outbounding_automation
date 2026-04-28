import { ChatOpenAI } from "@langchain/openai";

export const llm = new ChatOpenAI({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "gemini-2.5-flash",
    configuration: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" },
    temperature: 0,
    timeout: 50000,
    maxRetries: 0,
});