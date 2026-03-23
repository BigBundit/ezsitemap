import { GoogleGenAI, Type } from "@google/genai";

export async function generateSitemapFromUrl(url: string) {
  try {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    const apiKey = storedKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
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
      model: "gemini-3-flash-preview",
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

    const data = JSON.parse(response.text);
    if (!data || data.length === 0) {
      throw new Error("NO_DATA_FOUND");
    }
    return data;
  } catch (error: any) {
    console.error("Error generating sitemap:", error);
    if (error.message?.includes("API key not valid") || error.status === 403 || (error.status === 400 && error.message?.includes("API key"))) {
      throw new Error("INVALID_API_KEY");
    }
    throw error;
  }
}

export async function generateSitemapFromText(text: string) {
  try {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    const apiKey = storedKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Parse the following text outline (which may contain headings, bullet points, or indented lists) into a hierarchical sitemap structure.
    Text to parse:
    """
    ${text}
    """

    CRITICAL RULES:
    1. Identify the hierarchy based on indentation, bullet points, or heading levels.
    2. Create a logical parent-child relationship.
    3. Return a JSON array of nodes representing the menu structure.

    Each node must have:
    - id: unique string (e.g., "1", "2", "3")
    - label: string (title of the menu item, remove any markdown symbols like # or - if they are just for formatting, but keep them if they are part of the name like a #hashtag)
    - type: string (must be exactly one of: "pageNode", "categoryNode", "linkNode", "tagNode", "textNode", "lineNode"). 
      * Use "tagNode" if the text starts with '#' or explicitly mentions it's a tag.
      * Use "linkNode" if the text is a URL or explicitly mentions it's a link.
      * Use "textNode" if the text is a long description, note, or plain paragraph.
      * Use "categoryNode" for items that act as folders or group other items.
      * Use "lineNode" if the text represents a divider or separator.
      * Use "pageNode" for standard pages or items.
    - parentId: string (ID of the parent node. Use an empty string "" for the root node. There must be exactly one root node.)

    Limit the output to essential nodes to keep the diagram clean but comprehensive. Make sure the hierarchy perfectly matches the provided text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
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

    const data = JSON.parse(response.text);
    if (!data || data.length === 0) {
      throw new Error("NO_DATA_FOUND");
    }
    return data;
  } catch (error: any) {
    console.error("Error generating sitemap from text:", error);
    if (error.message?.includes("API key not valid") || error.status === 403 || (error.status === 400 && error.message?.includes("API key"))) {
      throw new Error("INVALID_API_KEY");
    }
    throw error;
  }
}
