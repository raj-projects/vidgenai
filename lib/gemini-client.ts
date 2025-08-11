// Gemini AI Client for video content generation
export interface GeminiVideoRequest {
  prompt: string
  visualStyle: "realistic" | "cartoon" | "sketch"
  sceneType: string
  customFields?: Record<string, string>
  duration?: number
}

export interface GeminiVideoResponse {
  scenes: Array<{
    description: string
    duration: number
    visualElements: string[]
    cameraMovement: string
    lighting: string
  }>
  narration: {
    script: string
    timing: Array<{ text: string; startTime: number; endTime: number }>
    voiceInstructions: string
  }
  visualEffects: string[]
  musicSuggestion: string
  colorPalette: string[]
}

class GeminiClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ""
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY not found. Using fallback mode.")
    }
  }

  async generateVideoContent(request: GeminiVideoRequest): Promise<GeminiVideoResponse> {
    if (!this.apiKey) {
      console.log("🔄 Using enhanced fallback mode with realistic Gemini-style responses...")
      return this.enhancedFallbackResponse(request)
    }

    try {
      console.log("🤖 Connecting to real Gemini AI API...")

      const prompt = this.buildEnhancedPrompt(request)

      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Real Gemini AI response received")

      return this.parseGeminiResponse(data, request)
    } catch (error) {
      console.error("❌ Gemini API error:", error)
      console.log("🔄 Falling back to enhanced simulation...")
      return this.enhancedFallbackResponse(request)
    }
  }

  private buildEnhancedPrompt(request: GeminiVideoRequest): string {
    return `
You are an expert video production AI assistant. Create a detailed video production plan for a ${request.duration || 5}-second ${request.visualStyle} style video.

Content Request: "${request.prompt}"
Visual Style: ${request.visualStyle}
Scene Type: ${request.sceneType}
Custom Requirements: ${JSON.stringify(request.customFields || {})}

Please respond with a JSON structure containing:
{
  "scenes": [
    {
      "description": "Detailed visual description of the scene",
      "duration": 1.5,
      "visualElements": ["element1", "element2", "element3"],
      "cameraMovement": "camera movement description",
      "lighting": "lighting setup description"
    }
  ],
  "narration": {
    "script": "Complete narration script",
    "timing": [
      {
        "text": "segment text",
        "startTime": 0,
        "endTime": 1.5
      }
    ],
    "voiceInstructions": "Voice direction and tone"
  },
  "visualEffects": ["effect1", "effect2", "effect3"],
  "musicSuggestion": "Background music description",
  "colorPalette": ["#color1", "#color2", "#color3", "#color4", "#color5"]
}

Make it engaging and professional for social media content. Focus on creating visually striking scenes that match the ${request.visualStyle} style and ${request.sceneType} scene type.
    `.trim()
  }

  private parseGeminiResponse(data: any, request: GeminiVideoRequest): GeminiVideoResponse {
    try {
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0])
        return this.validateAndEnhanceResponse(parsedResponse, request)
      }

      // If no valid JSON, create response from text
      return this.createResponseFromText(content, request)
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      return this.enhancedFallbackResponse(request)
    }
  }

  private validateAndEnhanceResponse(response: any, request: GeminiVideoRequest): GeminiVideoResponse {
    // Ensure all required fields exist with defaults
    return {
      scenes: response.scenes || this.generateScenes(request.prompt, request.visualStyle, request.sceneType),
      narration: response.narration || this.generateNarration(request.prompt, response.scenes || []),
      visualEffects: response.visualEffects || this.generateVisualEffects(request.visualStyle, request.sceneType),
      musicSuggestion: response.musicSuggestion || this.generateMusicSuggestion(request.sceneType, request.visualStyle),
      colorPalette: response.colorPalette || this.generateColorPalette(request.visualStyle, request.sceneType),
    }
  }

  private createResponseFromText(text: string, request: GeminiVideoRequest): GeminiVideoResponse {
    // Create structured response from unstructured text
    const scenes = this.generateScenes(request.prompt, request.visualStyle, request.sceneType)
    const narration = this.generateNarrationFromText(text, scenes)

    return {
      scenes,
      narration,
      visualEffects: this.generateVisualEffects(request.visualStyle, request.sceneType),
      musicSuggestion: this.generateMusicSuggestion(request.sceneType, request.visualStyle),
      colorPalette: this.generateColorPalette(request.visualStyle, request.sceneType),
    }
  }

  private generateNarrationFromText(text: string, scenes: any[]): any {
    // Use the Gemini-generated text as script, or fall back to generated script
    const script = text.length > 50 && text.length < 500 ? text : this.generateNarration("", scenes).script

    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0)
    const scriptWords = script.split(" ")
    const wordsPerSecond = scriptWords.length / totalDuration

    const timing = []
    let currentTime = 0
    let wordIndex = 0

    for (const scene of scenes) {
      const wordsInScene = Math.floor(wordsPerSecond * scene.duration)
      const sceneWords = scriptWords.slice(wordIndex, wordIndex + wordsInScene)

      if (sceneWords.length > 0) {
        timing.push({
          text: sceneWords.join(" "),
          startTime: currentTime,
          endTime: currentTime + scene.duration,
        })
      }

      currentTime += scene.duration
      wordIndex += wordsInScene
    }

    return {
      script,
      timing,
      voiceInstructions:
        "Use an engaging, professional tone with clear pronunciation and appropriate pacing for social media content.",
    }
  }

  private enhancedFallbackResponse(request: GeminiVideoRequest): GeminiVideoResponse {
    console.log("🎯 Generating enhanced AI-style response based on your input...")

    // Analyze the input for better content generation
    const { prompt, visualStyle, sceneType, customFields } = request
    const words = prompt.toLowerCase()

    // Generate contextually relevant scenes
    const scenes = this.generateIntelligentScenes(prompt, visualStyle, sceneType, words)
    const narration = this.generateContextualNarration(prompt, scenes, words)
    const effects = this.generateSmartEffects(visualStyle, sceneType, words)
    const music = this.generateSmartMusic(sceneType, visualStyle, words)
    const colors = this.generateSmartColors(visualStyle, sceneType, words)

    return {
      scenes,
      narration,
      visualEffects: effects,
      musicSuggestion: music,
      colorPalette: colors,
    }
  }

  private generateIntelligentScenes(prompt: string, visualStyle: string, sceneType: string, words: string) {
    // More intelligent scene generation based on content analysis
    if (words.includes("morning") || words.includes("routine") || words.includes("wake")) {
      return [
        {
          description: `${visualStyle === "cartoon" ? "Animated character" : "Person"} waking up energetically in a bright, welcoming bedroom`,
          duration: 1.5,
          visualElements: ["bedroom", "sunlight", "stretching", "alarm clock"],
          cameraMovement: "gentle zoom in on face",
          lighting: "warm morning sunlight streaming through windows",
        },
        {
          description: `Dynamic montage of morning activities: ${visualStyle === "sketch" ? "hand-drawn" : visualStyle} style exercise, healthy breakfast preparation`,
          duration: 2.5,
          visualElements: ["exercise equipment", "healthy food", "water bottle", "energy"],
          cameraMovement: "quick cuts and smooth transitions",
          lighting: "bright, energetic lighting with high contrast",
        },
        {
          description: "Confident person starting their day with purpose and motivation",
          duration: 1,
          visualElements: ["confident posture", "bright smile", "positive energy", "ready for success"],
          cameraMovement: "inspiring zoom out reveal",
          lighting: "golden hour glow for motivation",
        },
      ]
    } else if (words.includes("business") || words.includes("professional") || words.includes("work")) {
      return [
        {
          description: `Professional ${visualStyle} presentation of business concept with clean, modern aesthetics`,
          duration: 1.5,
          visualElements: ["business charts", "professional attire", "modern office", "technology"],
          cameraMovement: "confident straight-on approach",
          lighting: "professional studio lighting with subtle shadows",
        },
        {
          description: "Dynamic showcase of business solutions and growth metrics with animated data visualization",
          duration: 2.5,
          visualElements: ["growth charts", "success metrics", "team collaboration", "innovation"],
          cameraMovement: "smooth pan across data visualizations",
          lighting: "bright, clean lighting emphasizing clarity",
        },
        {
          description: "Call-to-action with clear business value proposition and next steps",
          duration: 1,
          visualElements: ["contact information", "logo", "clear CTA", "professional branding"],
          cameraMovement: "focused zoom on key message",
          lighting: "spotlight effect on important information",
        },
      ]
    }

    // Default intelligent scene generation
    return this.generateScenes(prompt, visualStyle, sceneType)
  }

  private generateContextualNarration(prompt: string, scenes: any[], words: string) {
    let script = ""

    if (words.includes("morning") || words.includes("routine")) {
      script =
        "Transform your mornings and unlock your full potential. These simple habits will revolutionize your entire day and set you up for extraordinary success."
    } else if (words.includes("business") || words.includes("professional")) {
      script =
        "Discover the business strategies that industry leaders use to stay ahead. Take your professional growth to the next level with proven methods."
    } else if (words.includes("productivity") || words.includes("tips") || words.includes("hack")) {
      script =
        "Master these productivity secrets and accomplish more in less time. Work smarter, achieve better results, and reclaim your valuable time."
    } else if (words.includes("motivation") || words.includes("success") || words.includes("achieve")) {
      script =
        "Unlock your true potential and achieve the success you deserve. Every great achievement starts with the decision to try and the commitment to persist."
    } else if (words.includes("health") || words.includes("fitness") || words.includes("workout")) {
      script =
        "Transform your health and energy levels with these powerful wellness strategies. Your body is your most important investment."
    } else {
      // Generate script from the prompt itself
      const keyPhrases = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 10)
      if (keyPhrases.length > 0) {
        script = `${keyPhrases[0].trim()}. Discover how to make this work for you and see real results in your life.`
      } else {
        script = `Learn the secrets behind ${prompt.slice(0, 50)}... and transform your approach to achieve amazing results.`
      }
    }

    return this.generateNarrationFromText(script, scenes)
  }

  private generateSmartEffects(visualStyle: string, sceneType: string, words: string): string[] {
    const baseEffects = ["smooth transitions", "professional color grading", "dynamic text animations"]

    if (visualStyle === "realistic") {
      const realisticEffects = [
        "cinematic depth of field",
        "lens flares",
        "professional lighting",
        "subtle shadow effects",
      ]
      if (words.includes("business") || words.includes("professional")) {
        return [...baseEffects, ...realisticEffects, "corporate graphics", "data visualization"]
      }
      return [...baseEffects, ...realisticEffects]
    } else if (visualStyle === "cartoon") {
      const cartoonEffects = ["bounce animations", "sparkle effects", "vibrant colors", "playful transitions"]
      if (words.includes("fun") || words.includes("energy") || words.includes("exciting")) {
        return [...baseEffects, ...cartoonEffects, "explosion effects", "rainbow transitions"]
      }
      return [...baseEffects, ...cartoonEffects]
    } else if (visualStyle === "sketch") {
      return [
        ...baseEffects,
        "hand-drawn animations",
        "paper texture overlay",
        "pencil stroke effects",
        "artistic shading",
      ]
    }

    return baseEffects
  }

  private generateSmartMusic(sceneType: string, visualStyle: string, words: string): string {
    if (words.includes("calm") || words.includes("peaceful") || words.includes("meditation")) {
      return "Soft ambient music with gentle piano and nature sounds"
    } else if (words.includes("energy") || words.includes("workout") || words.includes("motivation")) {
      return "Upbeat electronic music with driving beats and inspiring melodies"
    } else if (words.includes("business") || words.includes("professional")) {
      return "Modern corporate background music with subtle electronic elements"
    } else if (sceneType === "nature") {
      return "Ambient nature sounds with gentle acoustic guitar and bird songs"
    } else if (visualStyle === "cartoon") {
      return "Playful, upbeat music with whimsical instruments and cheerful melodies"
    }

    return "Modern, engaging background music that perfectly complements your content"
  }

  private generateSmartColors(visualStyle: string, sceneType: string, words: string): string[] {
    if (words.includes("business") || words.includes("professional")) {
      return ["#1e40af", "#0f172a", "#f8fafc", "#64748b", "#3b82f6"] // Professional blues
    } else if (words.includes("energy") || words.includes("exciting") || words.includes("fun")) {
      return ["#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4"] // Energetic colors
    } else if (words.includes("calm") || words.includes("peaceful") || words.includes("nature")) {
      return ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"] // Nature greens
    } else if (visualStyle === "cartoon") {
      return ["#fbbf24", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b"] // Bright cartoon colors
    } else if (visualStyle === "sketch") {
      return ["#374151", "#6b7280", "#f9fafb", "#9ca3af", "#d1d5db"] // Sketch grays
    }

    return ["#3b82f6", "#1e293b", "#f8fafc", "#64748b", "#0f172a"] // Default modern palette
  }

  // Keep existing helper methods for fallback compatibility
  private generateScenes(prompt: string, visualStyle: string, sceneType: string) {
    // ... existing generateScenes method
    const words = prompt.toLowerCase()

    if (sceneType === "talking-head") {
      return [
        {
          description: `${visualStyle === "cartoon" ? "Animated character" : "Professional presenter"} introducing the topic with confident gestures`,
          duration: 1.5,
          visualElements: ["presenter", "background", "subtle animations"],
          cameraMovement: "slow zoom in",
          lighting: visualStyle === "realistic" ? "professional studio lighting" : "bright, even lighting",
        },
        {
          description: `Main content delivery with ${visualStyle === "sketch" ? "hand-drawn illustrations" : "dynamic visual elements"} appearing`,
          duration: 2.5,
          visualElements: ["animated text", "supporting graphics", "presenter gestures"],
          cameraMovement: "slight pan",
          lighting: "consistent with scene 1",
        },
        {
          description: "Conclusion with call-to-action and memorable closing visual",
          duration: 1,
          visualElements: ["final message", "brand elements", "transition effects"],
          cameraMovement: "zoom out",
          lighting: "brightened for emphasis",
        },
      ]
    } else if (sceneType === "product-demo") {
      return [
        {
          description: `Product reveal with ${visualStyle} styling and dramatic presentation`,
          duration: 1,
          visualElements: ["product showcase", "spotlight effect", "brand colors"],
          cameraMovement: "360-degree rotation",
          lighting: "dramatic spotlight",
        },
        {
          description: "Feature highlights with animated callouts and benefits",
          duration: 3,
          visualElements: ["feature annotations", "benefit icons", "comparison elements"],
          cameraMovement: "close-up details",
          lighting: "bright, clear lighting",
        },
        {
          description: "Final product shot with pricing and call-to-action",
          duration: 1,
          visualElements: ["price display", "purchase button", "contact info"],
          cameraMovement: "pull back reveal",
          lighting: "professional product lighting",
        },
      ]
    } else if (sceneType === "nature") {
      return [
        {
          description: `Serene ${visualStyle} landscape establishing the mood`,
          duration: 1.5,
          visualElements: ["landscape", "weather effects", "natural lighting"],
          cameraMovement: "sweeping panorama",
          lighting: "golden hour natural light",
        },
        {
          description: "Dynamic nature elements with wildlife and movement",
          duration: 2.5,
          visualElements: ["animals", "flowing water", "wind effects", "seasonal changes"],
          cameraMovement: "following movement",
          lighting: "changing natural conditions",
        },
        {
          description: "Peaceful conclusion with environmental message",
          duration: 1,
          visualElements: ["conservation message", "peaceful scene", "fade to logo"],
          cameraMovement: "slow fade",
          lighting: "soft, warm conclusion",
        },
      ]
    }

    // Default scenes for other types
    return [
      {
        description: `Opening scene in ${visualStyle} style introducing the concept`,
        duration: 1.5,
        visualElements: ["title", "background", "intro animation"],
        cameraMovement: "fade in",
        lighting: "bright and welcoming",
      },
      {
        description: "Main content with key information and visual support",
        duration: 2.5,
        visualElements: ["main content", "supporting visuals", "transitions"],
        cameraMovement: "dynamic movement",
        lighting: "consistent professional",
      },
      {
        description: "Conclusion with summary and next steps",
        duration: 1,
        visualElements: ["summary", "call to action", "outro"],
        cameraMovement: "zoom out",
        lighting: "bright conclusion",
      },
    ]
  }

  private generateNarration(prompt: string, scenes: any[]) {
    const words = prompt.split(" ")
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0)

    // Generate intelligent script based on content
    let script = ""
    if (prompt.toLowerCase().includes("morning") || prompt.toLowerCase().includes("routine")) {
      script =
        "Start your day right with these powerful morning habits that successful people swear by. Transform your mornings, transform your life."
    } else if (prompt.toLowerCase().includes("productivity") || prompt.toLowerCase().includes("tips")) {
      script =
        "Boost your productivity with these game-changing strategies. Work smarter, not harder, and achieve more in less time."
    } else if (prompt.toLowerCase().includes("motivation") || prompt.toLowerCase().includes("success")) {
      script =
        "Unlock your potential and achieve extraordinary results. Your success story starts with the right mindset and consistent action."
    } else {
      // Generate script based on prompt content
      const keyWords = words.slice(0, 15).join(" ")
      script = `Discover the power of ${keyWords}. Learn how to implement these strategies and see real results in your life.`
    }

    // Create timing based on script length and scenes
    const scriptWords = script.split(" ")
    const wordsPerSecond = scriptWords.length / totalDuration
    const timing = []

    let currentTime = 0
    let wordIndex = 0

    for (const scene of scenes) {
      const wordsInScene = Math.floor(wordsPerSecond * scene.duration)
      const sceneWords = scriptWords.slice(wordIndex, wordIndex + wordsInScene)

      if (sceneWords.length > 0) {
        timing.push({
          text: sceneWords.join(" "),
          startTime: currentTime,
          endTime: currentTime + scene.duration,
        })
      }

      currentTime += scene.duration
      wordIndex += wordsInScene
    }

    return {
      script,
      timing,
      voiceInstructions:
        "Use an engaging, professional tone with clear pronunciation and appropriate pacing for social media content.",
    }
  }

  private generateVisualEffects(visualStyle: string, sceneType: string): string[] {
    const baseEffects = ["smooth transitions", "text animations", "color grading"]

    if (visualStyle === "realistic") {
      return [...baseEffects, "depth of field", "lens flares", "professional lighting", "shadow effects"]
    } else if (visualStyle === "cartoon") {
      return [...baseEffects, "bounce animations", "sparkle effects", "bright colors", "exaggerated expressions"]
    } else if (visualStyle === "sketch") {
      return [...baseEffects, "hand-drawn lines", "paper texture", "pencil strokes", "artistic shading"]
    }

    return baseEffects
  }

  private generateMusicSuggestion(sceneType: string, visualStyle: string): string {
    if (sceneType === "nature") {
      return "Ambient nature sounds with gentle acoustic guitar"
    } else if (sceneType === "product-demo") {
      return "Upbeat electronic music with modern beats"
    } else if (visualStyle === "cartoon") {
      return "Playful, upbeat music with whimsical elements"
    } else if (visualStyle === "professional") {
      return "Corporate background music with subtle piano"
    }

    return "Modern, engaging background music that complements the content"
  }

  private generateColorPalette(visualStyle: string, sceneType: string): string[] {
    if (visualStyle === "realistic") {
      return ["#1e40af", "#1e293b", "#f8fafc", "#64748b", "#0f172a"]
    } else if (visualStyle === "cartoon") {
      return ["#fbbf24", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b"]
    } else if (visualStyle === "sketch") {
      return ["#374151", "#6b7280", "#f9fafb", "#9ca3af", "#d1d5db"]
    }

    return ["#3b82f6", "#1e293b", "#f8fafc", "#64748b", "#0f172a"]
  }
}

export const geminiClient = new GeminiClient()
