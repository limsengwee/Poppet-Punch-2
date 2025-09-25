import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Tool, FaceBounds } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64String: string) => {
  const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 string');
  }
  const mimeType = match[1];
  const data = match[2];
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

export const moderateImage = async (base64Image: string): Promise<boolean> => {
  try {
    const imagePart = fileToGenerativePart(base64Image);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [
            imagePart,
            { text: "Is this image safe for a general audience? Does it contain nudity, explicit violence, or hate symbols? Please answer with only the word 'SAFE' or 'UNSAFE'."}
        ]},
    });
    const text = response.text.trim().toUpperCase();
    return text === 'SAFE';
  } catch (error) {
    console.error("Error in image moderation:", error);
    // Default to safe to not block users on API errors, but log it.
    // In a real app, might want to default to unsafe.
    return true; 
  }
};

export const detectFace = async (base64Image: string): Promise<FaceBounds | null> => {
    try {
        const imagePart = fileToGenerativePart(base64Image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [
                imagePart,
                { text: "Detect the primary face in this image and provide its bounding box as percentages."}
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER, description: "The x-coordinate of the top-left corner as a percentage of image width." },
                        y: { type: Type.NUMBER, description: "The y-coordinate of the top-left corner as a percentage of image height." },
                        width: { type: Type.NUMBER, description: "The width of the box as a percentage of image width." },
                        height: { type: Type.NUMBER, description: "The height of the box as a percentage of image height." },
                    },
                    required: ["x", "y", "width", "height"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed && typeof parsed.x === 'number') {
            return parsed as FaceBounds;
        }
        return null;

    } catch (error) {
        console.error("Error in face detection:", error);
        return null;
    }
};


export const editImage = async (base64Image: string, tool: Tool): Promise<string> => {
    const imagePart = fileToGenerativePart(base64Image);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: tool.prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
        console.error("Image editing failed: No candidates returned. Response:", JSON.stringify(response, null, 2));
        throw new Error("AI failed to process the image. No response was generated.");
    }
    
    // Check for safety blocks first
    const finishReason = candidate.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'IMAGE_SAFETY') {
        console.error(`Image editing blocked for safety. Reason: ${finishReason}. Response:`, JSON.stringify(response, null, 2));
        // Throw a specific error to be caught by the UI
        throw new Error("EDITING_SAFETY_BLOCK"); 
    }

    // Now check for the actual content parts
    const imageContentPart = candidate.content?.parts?.find(part => part.inlineData);

    if (imageContentPart?.inlineData) {
        const mimeType = imageContentPart.inlineData.mimeType;
        const base64Data = imageContentPart.inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
    }

    // If we reach here, something else went wrong.
    console.error("Image editing failed: No image data found in response parts. Response:", JSON.stringify(response, null, 2));
    throw new Error("AI did not return an edited image.");
};
