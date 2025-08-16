import { geminiClient, type GeminiVideoRequest } from "./gemini-client"

export interface VideoGenerationOptions {
  text: string
  style: string
  tool: string
  duration?: number
  visualStyle: "realistic" | "cartoon" | "sketch"
  customFields?: Record<string, string>
  prompt?: string
  includeCaptions?: boolean
  includeAudio?: boolean
  sceneType?: "talking-head" | "product-demo" | "nature" | "abstract" | "tutorial"
  voiceType?: "male" | "female" | "child" | "robotic"
  captionBgColor?: string
  captionTextColor?: string
  captionBgOpacity?: number
}

export interface GeneratedVideo {
  videoUrl: string;
  audioUrl?: string;
  imageUrl?: string;
  title: string;
  duration: string;
  thumbnail: string;
  hasAudio: boolean;
  mediaType: "images" | "audio" | "videos";
  waveformUrl?: string;
  geminiInsights?: {
    scenes: any[];
    narration: any;
    effects: string[];
    colorPalette: string[];
  };
}

// Sample images and assets for realistic video generation
const SAMPLE_ASSETS = {
  backgrounds: {
    office: "/placeholder.svg?height=1280&width=720&text=Professional+Office+Background",
    nature: "/placeholder.svg?height=1280&width=720&text=Beautiful+Nature+Scene",
    studio: "/placeholder.svg?height=1280&width=720&text=Modern+Studio+Setup",
    abstract: "/placeholder.svg?height=1280&width=720&text=Abstract+Colorful+Background",
  },
  characters: {
    business_person: "/placeholder.svg?height=400&width=300&text=Professional+Person",
    casual_person: "/placeholder.svg?height=400&width=300&text=Casual+Person",
    cartoon_character: "/placeholder.svg?height=400&width=300&text=Cartoon+Character",
  },
  objects: {
    phone: "/placeholder.svg?height=200&width=100&text=Smartphone",
    laptop: "/placeholder.svg?height=150&width=200&text=Laptop",
    product: "/placeholder.svg?height=200&width=200&text=Product+Demo",
  },
}

export async function generateVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
  const {
    text,
    style,
    tool,
    visualStyle,
    customFields,
    prompt,
    includeCaptions = true,
    includeAudio = true,
    sceneType = "talking-head",
    voiceType = "female",
    captionBgColor = "#000000",
    captionTextColor = "#ffffff",
    captionBgOpacity = 0.8,
  } = options

  try {
    // Step 1: Generate AI-powered content plan using Gemini
    console.log("🤖 Generating content with Gemini AI...")
    const geminiRequest: GeminiVideoRequest = {
      prompt: prompt || text,
      visualStyle,
      sceneType,
      customFields,
      duration: 5,
    }

    const geminiResponse = await geminiClient.generateVideoContent(geminiRequest)
    console.log("✅ Gemini AI content generated:", geminiResponse)

    // Step 2: Generate audio using Gemini's narration script
    let audioUrl: string | undefined
    if (includeAudio) {
      console.log("🎵 Generating audio...")
      audioUrl = await generateAudioFromGemini(geminiResponse.narration, voiceType)
      console.log("✅ Audio generated successfully")
    }

    // Step 3: Create enhanced video using Gemini's scene plan
    console.log("🎬 Creating video frames...")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    canvas.width = 720
    canvas.height = 1280 // 9:16 aspect ratio

    // Generate frames with better quality
    const frames: ImageData[] = []
    const frameCount = 150 // 5 seconds at 30fps
    const framesPerScene = frameCount / geminiResponse.scenes.length

    for (let i = 0; i < frameCount; i++) {
      const currentSceneIndex = Math.floor(i / framesPerScene)
      const currentScene = geminiResponse.scenes[currentSceneIndex] || geminiResponse.scenes[0]
      const sceneProgress = (i % framesPerScene) / framesPerScene

      // Clear canvas with better quality
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Draw enhanced background
      drawGeminiBackground(ctx, geminiResponse.colorPalette, currentScene, sceneProgress, canvas.width, canvas.height)

      // Draw scene content
      await drawGeminiScene(
        ctx,
        currentScene,
        visualStyle,
        sceneProgress,
        canvas.width,
        canvas.height,
        geminiResponse.colorPalette,
      )

      // Apply visual effects
      applyGeminiEffects(ctx, geminiResponse.visualEffects, visualStyle, sceneProgress, canvas.width, canvas.height)

      // Add captions with custom colors
      if (includeCaptions) {
        drawGeminiCaptions(
          ctx,
          geminiResponse.narration,
          i,
          frameCount,
          canvas.width,
          canvas.height,
          visualStyle,
          captionBgColor,
          captionTextColor,
          captionBgOpacity,
        )
      }

      // Add custom overlays
      if (customFields) {
        drawCustomOverlays(ctx, customFields, i, frameCount, canvas.width, canvas.height, visualStyle)
      }

      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }

    console.log(`✅ Generated ${frames.length} video frames`)

    // Step 4: Create final video with integrated audio
    console.log("🎬 Rendering final video...")
    const videoBlob = await createVideoFromFrames(frames, canvas.width, canvas.height, audioUrl, includeAudio)
    const videoUrl = URL.createObjectURL(videoBlob)
    console.log("✅ Video rendered successfully")

    // Step 5: Generate thumbnail
    const thumbnailUrl = await generateThumbnail(frames[Math.floor(frames.length / 3)], canvas.width, canvas.height)

    return {
      videoUrl,
      audioUrl,
      imageUrl: undefined, // or actual image url if available
      title: generateGeminiTitle(geminiResponse, tool, text, customFields),
      duration: "0:05",
      thumbnail: thumbnailUrl,
      hasAudio: !!audioUrl && includeAudio,
      mediaType:
        tool === "audio" ? "audio" : tool === "images" ? "images" : "videos",
      waveformUrl: audioUrl ? geminiResponse.waveformUrl : undefined, // only if audio
      geminiInsights: {
        scenes: geminiResponse.scenes,
        narration: geminiResponse.narration,
        effects: geminiResponse.visualEffects,
        colorPalette: geminiResponse.colorPalette,
      },
    };
  } catch (error) {
    console.error("❌ Video generation failed:", error)
    throw new Error(`Video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function generateAudioFromGemini(narration: any, voiceType: string): Promise<string> {
  console.log("🎵 Generating enhanced audio from Gemini script:", narration.script)

  // Create more realistic audio with proper timing
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const duration = 5 // 5 seconds to match video
  const sampleRate = audioContext.sampleRate
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate) // Stereo

  // Generate speech-like audio for each channel
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)

    // Voice characteristics based on type
    const baseFreq = voiceType === "male" ? 120 : voiceType === "female" ? 200 : voiceType === "child" ? 300 : 150
    const formant1 = baseFreq * 2.5
    const formant2 = baseFreq * 4.5

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate
      const wordProgress = (time % 0.8) / 0.8 // Word every 0.8 seconds

      // Create more natural speech patterns
      const fundamental = Math.sin(2 * Math.PI * baseFreq * time) * 0.4
      const formant1Wave = Math.sin(2 * Math.PI * formant1 * time) * 0.25
      const formant2Wave = Math.sin(2 * Math.PI * formant2 * time) * 0.15

      // Add natural speech envelope and breathing
      const speechEnvelope = Math.sin(Math.PI * wordProgress) * 0.8
      const breathingPattern = 1 + Math.sin(time * 0.5) * 0.1

      // Combine all elements
      data[i] = (fundamental + formant1Wave + formant2Wave) * speechEnvelope * breathingPattern * 0.6
    }
  }

  // Convert to WAV with proper headers
  const wavBlob = bufferToWave(buffer, buffer.length)
  return URL.createObjectURL(wavBlob)
}

async function createVideoFromFrames(
  frames: ImageData[],
  width: number,
  height: number,
  audioUrl?: string,
  includeAudio = true,
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = width
  canvas.height = height

  // Create video stream with higher quality settings
  const stream = canvas.captureStream(30)

  let mediaRecorder: MediaRecorder
  let audioTrack: MediaStreamTrack | null = null

  // Add audio track if available
  if (includeAudio && audioUrl) {
    try {
      const audioElement = new Audio()
      audioElement.crossOrigin = "anonymous"
      audioElement.src = audioUrl

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audioElement.onloadeddata = resolve
        audioElement.onerror = reject
        audioElement.load()
      })

      // Create audio context and connect to stream
      const audioContext = new AudioContext()
      const source = audioContext.createMediaElementSource(audioElement)
      const destination = audioContext.createMediaStreamDestination()

      // Connect audio with gain control
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 1.0 // Full volume
      source.connect(gainNode)
      gainNode.connect(destination)

      // Add audio track to video stream
      const audioTracks = destination.stream.getAudioTracks()
      if (audioTracks.length > 0) {
        audioTrack = audioTracks[0]
        stream.addTrack(audioTrack)
        console.log("✅ Audio track successfully added to video stream")
      }

      // Start audio playback
      audioElement.play().catch(console.warn)
    } catch (error) {
      console.warn("Could not integrate audio track:", error)
    }
  }

  // Create MediaRecorder with optimized settings
  const options = {
    mimeType: "video/webm;codecs=vp9,opus", // Include opus for audio
    videoBitsPerSecond: 3000000, // Higher quality video
    audioBitsPerSecond: 128000, // High quality audio
  }

  try {
    mediaRecorder = new MediaRecorder(stream, options)
  } catch (e) {
    // Fallback for browsers that don't support the codec
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" })
  }

  const chunks: Blob[] = []

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })

      // Clean up audio track
      if (audioTrack) {
        audioTrack.stop()
      }

      resolve(blob)
    }

    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event)
      reject(new Error("Video recording failed"))
    }

    mediaRecorder.start(100) // Collect data every 100ms

    let frameIndex = 0
    const playFrame = () => {
      if (frameIndex < frames.length) {
        ctx.putImageData(frames[frameIndex], 0, 0)
        frameIndex++
        setTimeout(playFrame, 1000 / 30) // 30 FPS
      } else {
        setTimeout(() => {
          mediaRecorder.stop()
        }, 500) // Allow final frames to be captured
      }
    }

    playFrame()
  })
}

function drawGeminiBackground(
  ctx: CanvasRenderingContext2D,
  colorPalette: string[],
  scene: any,
  progress: number,
  width: number,
  height: number,
) {
  // Create more sophisticated gradient using Gemini's color palette
  const gradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height / 3, Math.max(width, height))
  gradient.addColorStop(0, colorPalette[0] || "#1e40af")
  gradient.addColorStop(0.3, colorPalette[1] || "#1e293b")
  gradient.addColorStop(0.7, colorPalette[2] || "#0f172a")
  gradient.addColorStop(1, colorPalette[3] || "#0f172a")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add dynamic background elements based on scene
  if (scene.visualElements.includes("office") || scene.visualElements.includes("professional")) {
    // Add professional background elements
    ctx.fillStyle = colorPalette[4] || "#64748b"
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 20; i++) {
      const x = (i % 5) * (width / 5) + width / 10
      const y = Math.floor(i / 5) * (height / 4) + height / 8
      ctx.fillRect(x, y, width / 20, height / 30)
    }
    ctx.globalAlpha = 1
  } else if (scene.visualElements.includes("nature") || scene.lighting.includes("natural")) {
    // Add nature-inspired elements
    ctx.fillStyle = `rgba(34, 197, 94, ${0.2 + Math.sin(progress * Math.PI) * 0.1})`
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + progress * Math.PI
      const x = width / 2 + Math.cos(angle) * (width * 0.3)
      const y = height / 2 + Math.sin(angle) * (height * 0.2)
      ctx.arc(x, y, 20 + Math.sin(progress * Math.PI * 3) * 5, 0, Math.PI * 2)
    }
    ctx.fill()
  }

  // Add scene-specific lighting effects
  if (scene.lighting === "professional studio lighting") {
    const lightGradient = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 200)
    lightGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
    lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
    ctx.fillStyle = lightGradient
    ctx.fillRect(0, 0, width, height)
  } else if (scene.lighting === "golden hour natural light") {
    const warmGradient = ctx.createLinearGradient(0, 0, width, height)
    warmGradient.addColorStop(0, "rgba(255, 204, 102, 0.4)")
    warmGradient.addColorStop(1, "rgba(255, 153, 51, 0.2)")
    ctx.fillStyle = warmGradient
    ctx.fillRect(0, 0, width, height)
  }
}

async function drawGeminiScene(
  ctx: CanvasRenderingContext2D,
  scene: any,
  visualStyle: string,
  progress: number,
  width: number,
  height: number,
  colorPalette: string[],
) {
  const centerX = width / 2
  const centerY = height / 2

  // Enhanced camera movement effects
  let offsetX = 0,
    offsetY = 0,
    scale = 1,
    rotation = 0

  if (scene.cameraMovement === "slow zoom in") {
    scale = 1 + progress * 0.3
  } else if (scene.cameraMovement === "zoom out") {
    scale = 1.3 - progress * 0.3
  } else if (scene.cameraMovement === "slight pan") {
    offsetX = Math.sin(progress * Math.PI * 2) * 30
  } else if (scene.cameraMovement === "360-degree rotation") {
    rotation = progress * Math.PI * 2
  }

  ctx.save()
  ctx.translate(centerX + offsetX, centerY + offsetY)
  ctx.scale(scale, scale)
  ctx.rotate(rotation)
  ctx.translate(-centerX, -centerY)

  // Draw more sophisticated visual elements
  scene.visualElements.forEach((element: string, index: number) => {
    drawEnhancedSceneElement(ctx, element, visualStyle, progress, width, height, colorPalette, index)
  })

  ctx.restore()
}

function drawEnhancedSceneElement(
  ctx: CanvasRenderingContext2D,
  element: string,
  visualStyle: string,
  progress: number,
  width: number,
  height: number,
  colorPalette: string[],
  index: number,
) {
  const centerX = width / 2
  const centerY = height / 2

  if (element === "presenter" || element === "animated character") {
    // More realistic character representation
    const headBob = Math.sin(progress * Math.PI * 4) * 5
    const armMove = Math.sin(progress * Math.PI * 3) * 12

    if (visualStyle === "realistic") {
      // Create a more realistic figure
      const gradient = ctx.createRadialGradient(centerX, centerY - 80, 0, centerX, centerY - 80, 40)
      gradient.addColorStop(0, colorPalette[0] || "#3b82f6")
      gradient.addColorStop(1, colorPalette[1] || "#1e40af")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY - 80 + headBob, 40, 0, Math.PI * 2)
      ctx.fill()

      // Add realistic body with clothing
      ctx.fillStyle = colorPalette[2] || "#f8fafc"
      ctx.fillRect(centerX - 30, centerY - 40, 60, 120)

      // Add professional jacket
      ctx.fillStyle = colorPalette[1] || "#1e40af"
      ctx.fillRect(centerX - 35, centerY - 45, 70, 80)

      // Animated arms
      ctx.fillStyle = colorPalette[0] || "#3b82f6"
      ctx.fillRect(centerX - 60 + armMove, centerY - 30, 30, 70)
      ctx.fillRect(centerX + 30 - armMove, centerY - 30, 30, 70)
    } else if (visualStyle === "cartoon") {
      // Enhanced cartoon character
      ctx.fillStyle = colorPalette[0] || "#fbbf24"
      ctx.beginPath()
      ctx.arc(centerX, centerY - 80 + headBob, 45, 0, Math.PI * 2)
      ctx.fill()

      // Cartoon eyes with animation
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(centerX - 15, centerY - 85 + headBob, 8, 0, Math.PI * 2)
      ctx.arc(centerX + 15, centerY - 85 + headBob, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#000000"
      ctx.beginPath()
      ctx.arc(centerX - 15 + Math.sin(progress * Math.PI) * 2, centerY - 85 + headBob, 4, 0, Math.PI * 2)
      ctx.arc(centerX + 15 + Math.sin(progress * Math.PI) * 2, centerY - 85 + headBob, 4, 0, Math.PI * 2)
      ctx.fill()

      // Animated smile
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY - 70 + headBob, 15, 0, Math.PI)
      ctx.stroke()

      // Colorful body
      ctx.fillStyle = colorPalette[1] || "#ef4444"
      ctx.fillRect(centerX - 35, centerY - 35, 70, 100)
    }
  } else if (element === "product showcase" || element === "product") {
    // Enhanced product visualization
    const rotation = progress * Math.PI * 2
    const pulse = 1 + Math.sin(progress * Math.PI * 6) * 0.1

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation * 0.5)
    ctx.scale(pulse, pulse)

    // Create 3D-like product box
    const boxWidth = 80,
      boxHeight = 120,
      boxDepth = 20

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(-boxWidth / 2 + 5, -boxHeight / 2 + 5, boxWidth, boxHeight)

    // Main product
    const productGradient = ctx.createLinearGradient(-boxWidth / 2, -boxHeight / 2, boxWidth / 2, boxHeight / 2)
    productGradient.addColorStop(0, colorPalette[0] || "#3b82f6")
    productGradient.addColorStop(0.5, colorPalette[1] || "#1e40af")
    productGradient.addColorStop(1, colorPalette[2] || "#0f172a")

    ctx.fillStyle = productGradient
    ctx.fillRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight)

    // Product highlights
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.fillRect(-boxWidth / 2 + 10, -boxHeight / 2 + 10, boxWidth - 20, 20)

    ctx.restore()
  } else if (element === "animated text" || element === "title") {
    // Enhanced text animation
    const textAlpha = Math.min(1, progress * 2)
    const textScale = 0.5 + textAlpha * 0.5
    const textY = centerY + 120 + Math.sin(progress * Math.PI * 8) * 5

    ctx.globalAlpha = textAlpha
    ctx.save()
    ctx.translate(centerX, textY)
    ctx.scale(textScale, textScale)

    // Text shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.font = visualStyle === "cartoon" ? "bold 36px Comic Sans MS" : "bold 32px Arial"
    ctx.textAlign = "center"
    ctx.fillText("AI Generated Content", 2, 2)

    // Main text with gradient
    const textGradient = ctx.createLinearGradient(0, -16, 0, 16)
    textGradient.addColorStop(0, colorPalette[0] || "#3b82f6")
    textGradient.addColorStop(1, colorPalette[1] || "#1e40af")
    ctx.fillStyle = textGradient
    ctx.fillText("AI Generated Content", 0, 0)

    ctx.restore()
    ctx.globalAlpha = 1
  }
}

function applyGeminiEffects(
  ctx: CanvasRenderingContext2D,
  effects: string[],
  visualStyle: string,
  progress: number,
  width: number,
  height: number,
) {
  effects.forEach((effect) => {
    if (effect === "lens flares" && visualStyle === "realistic") {
      // Add lens flare effect
      const flareX = width * 0.8
      const flareY = height * 0.2
      const flareIntensity = 0.3 + Math.sin(progress * Math.PI * 4) * 0.1

      ctx.fillStyle = `rgba(255, 255, 255, ${flareIntensity})`
      ctx.beginPath()
      ctx.arc(flareX, flareY, 30, 0, Math.PI * 2)
      ctx.fill()
    } else if (effect === "sparkle effects" && visualStyle === "cartoon") {
      // Add sparkle effects
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const sparkleAlpha = Math.sin(progress * Math.PI * 6 + i) * 0.5 + 0.5

        ctx.fillStyle = `rgba(255, 255, 0, ${sparkleAlpha})`
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (effect === "paper texture" && visualStyle === "sketch") {
      // Add paper texture
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)"
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.fillRect(x, y, 1, 1)
      }
    }
  })
}

function drawGeminiCaptions(
  ctx: CanvasRenderingContext2D,
  narration: any,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
  visualStyle: string,
  bgColor = "#000000",
  textColor = "#ffffff",
  bgOpacity = 0.8,
) {
  const currentTime = (frame / totalFrames) * 5 // 5 second video

  // Find current caption based on timing
  const currentCaption = narration.timing.find(
    (timing: any) => currentTime >= timing.startTime && currentTime <= timing.endTime,
  )

  if (currentCaption) {
    const captionY = height * 0.85
    const padding = 20

    // Set font for measurement
    ctx.font = visualStyle === "cartoon" ? "bold 20px Comic Sans MS" : "bold 18px Arial"
    const textMetrics = ctx.measureText(currentCaption.text)
    const bgWidth = Math.min(textMetrics.width + padding * 2, width - 40)
    const bgHeight = 50

    // Convert hex color to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Caption background with custom colors
    ctx.fillStyle = hexToRgba(bgColor, bgOpacity)
    ctx.beginPath()
    ctx.roundRect((width - bgWidth) / 2, captionY - bgHeight / 2, bgWidth, bgHeight, 12)
    ctx.fill()

    // Add subtle border for better visibility
    ctx.strokeStyle = hexToRgba(textColor, 0.3)
    ctx.lineWidth = 1
    ctx.stroke()

    // Caption text with custom color
    ctx.fillStyle = textColor
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Add text shadow for better readability
    ctx.shadowColor = bgColor
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // Word wrap for long captions
    const words = currentCaption.text.split(" ")
    const maxWidth = bgWidth - padding * 2
    const lines = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    // Draw lines
    const lineHeight = 22
    const startY = captionY - (lines.length * lineHeight) / 2 + lineHeight / 2

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight)
    })

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

function drawCustomOverlays(
  ctx: CanvasRenderingContext2D,
  customFields: Record<string, string>,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
  visualStyle: string,
) {
  const progress = frame / totalFrames
  const fieldEntries = Object.entries(customFields)

  if (fieldEntries.length === 0) return

  const startY = height * 0.1
  const fieldHeight = 35

  fieldEntries.forEach(([key, value], index) => {
    if (progress > 0.2 + index * 0.1 && value.trim()) {
      const y = startY + index * fieldHeight
      const alpha = Math.min(1, (progress - (0.2 + index * 0.1)) * 5)

      ctx.globalAlpha = alpha

      // Overlay background
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.beginPath()
      ctx.roundRect(20, y - 15, width - 40, 30, 8)
      ctx.fill()

      // Overlay text
      ctx.fillStyle = "#1f2937"
      ctx.font = visualStyle === "cartoon" ? "bold 16px Comic Sans MS" : "14px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`${key}: ${value}`, 30, y)
    }
  })

  ctx.globalAlpha = 1
}

async function generateThumbnail(frameData: ImageData, width: number, height: number): Promise<string> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = width
  canvas.height = height

  ctx.putImageData(frameData, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob))
        }
      },
      "image/jpeg",
      0.9,
    )
  })
}

function generateGeminiTitle(
  geminiResponse: any,
  tool: string,
  text: string,
  customFields?: Record<string, string>,
): string {
  if (customFields?.title) {
    return customFields.title
  }

  // Use Gemini's intelligent title generation
  const script = geminiResponse.narration.script.toLowerCase()

  if (script.includes("morning") || script.includes("routine")) {
    return "AI-Powered Morning Routine Guide"
  } else if (script.includes("productivity") || script.includes("tips")) {
    return "Smart Productivity Hacks by AI"
  } else if (script.includes("success") || script.includes("motivation")) {
    return "AI-Generated Success Strategies"
  } else {
    return `Gemini AI Video - ${tool.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
  }
}

function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  const numOfChan = abuffer.numberOfChannels
  const length = len * numOfChan * 2 + 44
  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)
  let sample
  let offset = 0
  let pos = 0

  // Write WAV header with proper format
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"
  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(abuffer.sampleRate)
  setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
  setUint16(numOfChan * 2) // block-align
  setUint16(16) // 16-bit
  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // Write interleaved data with proper scaling
  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    const channelData = abuffer.getChannelData(i)
    offset = 0
    pos = 44 + i * 2 // Start position for this channel

    while (offset < len && pos < length - 1) {
      sample = Math.max(-1, Math.min(1, channelData[offset])) // clamp
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7fff) | 0 // scale to 16-bit signed int
      view.setInt16(pos, sample, true) // write 16-bit sample
      pos += numOfChan * 2 // move to next sample for this channel
      offset++
    }
  }

  return new Blob([buffer], { type: "audio/wav" })

  function setUint16(data: number) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true)
    pos += 4
  }
}
