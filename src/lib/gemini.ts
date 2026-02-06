import { GoogleGenAI, type Part } from "@google/genai";
import type { StoryData } from '../types';

// Gemini 3.0 Models
const STORY_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

// Helper for exponential backoff retry
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0 && (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded'))) {
            // console.warn(`Retrying operation due to 503... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function generateStory(apiKey: string, prompt: string): Promise<StoryData> {
    const ai = new GoogleGenAI({ apiKey });

    return withRetry(async () => {
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
            throw error;
        }
    });
}

export async function generateImage(apiKey: string, prompt: string, referenceImage?: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    return withRetry(async () => {
        try {
            const chat = ai.chats.create({
                model: IMAGE_MODEL,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });

            const parts: Part[] = [{ text: prompt }];

            if (referenceImage) {
                // referenceImage is expected to be "data:image/png;base64,..."
                // Extract base64 and mimeType
                const match = referenceImage.match(/^data:(.*);base64,(.*)$/);
                if (match) {
                    parts.push({
                        inlineData: {
                            mimeType: match[1],
                            data: match[2]
                        }
                    });
                }
            }

            const response = await chat.sendMessage({
                message: { role: 'user', parts }
            });

            // Find the image part in the response
            let base64Image = null;

            if (response.candidates?.[0]?.content?.parts) {
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
    });
}
