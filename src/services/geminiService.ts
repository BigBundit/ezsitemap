import { GoogleGenAI, Type } from "@google/genai";

export async function generateSitemapFromUrl(url: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Read the content of this exact URL: ${url}. 
    Extract ONLY the MAIN NAVIGATION MENU (header menu, sidebar menu) and its direct sub-menus found on the page. 
    CRITICAL RULES: 
    1. DO NOT guess, hallucinate, or invent pages. 
    2. DO NOT include footer links, legal pages, or minor links unless they are part of the main primary navigation.
    3. ONLY include links and categories that actually exist in the main menu structure of this specific website.
    
    Return a JSON array of nodes representing the main menu structure.
    Each node must have:
    - id: unique string (e.g., "1", "2", "3")
    - label: string (title of the menu item, exactly as it appears on the site)
    - type: string (must be exactly one of: "pageNode", "categoryNode", "linkNode")
    - parentId: string (ID of the parent node. Use an empty string "" for the root node. There must be exactly one root node representing the website's Home or Main domain.)
    
    Limit the output to 10-25 essential nodes to keep the diagram clean but comprehensive. Make sure the hierarchy perfectly matches the actual website's main menu structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING },
              parentId: { type: Type.STRING, description: "ID of the parent node. Use empty string '' for the root node." }
            },
            required: ["id", "label", "type", "parentId"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  }
}
