
import { GoogleGenAI } from "@google/genai";
import { PurchaseOrder } from "../types";

export const getAIPOResponse = async (query: string, pos: PurchaseOrder[]) => {
  // Initialize AI client inside function to ensure it uses latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Minimize context to save tokens if list is huge
  const context = pos.map(p => ({
    no: p.poNumber,
    vendor: p.vendor,
    due: p.deliveryDate,
    status: p.status,
    priority: p.priority,
    amount: p.totalAmount
  }));

  const prompt = `
    You are the Purchase Order Reminder Assistant. 
    Below are the current Purchase Orders:
    ---
    ${JSON.stringify(context, null, 2)}
    ---
    User Question: "${query}"
    
    Instructions:
    1. Be concise and professional.
    2. Focus on high urgency and overdue orders if not specified.
    3. Use markdown bolding for PO numbers and dates.
    4. If the user asks for a summary, give a quick breakdown of high-value vs high-urgency orders.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't process that. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The system is currently experiencing high load. Please try again in a few moments.";
  }
};
