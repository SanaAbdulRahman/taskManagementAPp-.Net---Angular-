import { GoogleGenAI, Type, SchemaType } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSubtasks = async (taskTitle: string, taskDescription: string): Promise<{ title: string; description: string }[]> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const prompt = `
      I have a task: "${taskTitle}".
      Description: "${taskDescription}".
      
      Please break this task down into 3 to 5 actionable subtasks. 
      Keep titles concise and descriptions helpful.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const suggestPriority = async (taskTitle: string, dueDate: string): Promise<{ priority: string; reason: string }> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
            reason: { type: Type.STRING },
          },
          required: ["priority", "reason"],
        },
      },
    });

    const prompt = `
      Analyze this task: "${taskTitle}" due on ${dueDate || "no specific date"}.
      Suggest a priority level based on typical project management standards.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) return { priority: "MEDIUM", reason: "Default fallback" };

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { priority: "MEDIUM", reason: "Error contacting AI" };
  }
};
