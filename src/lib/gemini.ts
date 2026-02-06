import { GoogleGenAI } from "@google/genai";
import type { StoryData } from '../types';

// Gemini 3.0 Models
const STORY_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

export async function generateStory(apiKey: string, prompt: string): Promise<StoryData> {
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: STORY_MODEL,
            contents: { role: 'user', parts: [{ text: prompt }] },
            config: {
                // @ts-ignore - thinkingConfig might not be fully typed in the SDK yet or requires specific version
                thinkingConfig: {
                    thinkingLevel: "low",
                },
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) throw new Error('No text generated');

        return JSON.parse(text) as StoryData;
    } catch (error: any) {
        console.error("Story Generation Error:", error);
        throw new Error(error.message || 'Failed to generate story');
    }
}

export async function generateImage(apiKey: string, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    try {
        // Using chat session as per user example for the image model, 
        // though generateContent on model might work, sticking to the proven example pattern.
        const chat = ai.chats.create({
            model: IMAGE_MODEL,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                // tools: [{googleSearch: {}}], // Omitting search for pure image generation focus unless requested
            },
        });

        const response = await chat.sendMessage({
            message: prompt
        });

        // Find the image part in the response
        let base64Image = null;

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (!base64Image) {
            throw new Error('No image returned from the model');
        }

        return base64Image;

    } catch (error: any) {
        console.error("Image Generation Error:", error);
        throw new Error(error.message || 'Failed to generate image');
    }
}
