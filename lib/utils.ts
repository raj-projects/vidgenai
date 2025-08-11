import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export async function generateAudio(text: string, prompt: string, voiceType: string): Promise<string> {
  // Simulate audio generation
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return "/sample-audio.wav" // Placeholder audio URL
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function getBackgroundForScene(sceneType: string, visualStyle: string): string {
  switch (sceneType) {
    case "talking-head":
      return "/placeholder.svg?height=1280&width=720&text=Talking+Head+Background"
    case "product-demo":
      return "/placeholder.svg?height=1280&width=720&text=Product+Demo+Background"
    case "nature":
      return "/placeholder.svg?height=1280&width=720&text=Nature+Background"
    case "abstract":
      return "/placeholder.svg?height=1280&width=720&text=Abstract+Background"
    case "tutorial":
      return "/placeholder.svg?height=1280&width=720&text=Tutorial+Background"
    default:
      return "/placeholder.svg?height=1280&width=720&text=Default+Background"
  }
}

export function getCharacterForStyle(visualStyle: string): string {
  switch (visualStyle) {
    case "realistic":
      return "/placeholder.svg?height=400&width=300&text=Realistic+Character"
    case "cartoon":
      return "/placeholder.svg?height=400&width=300&text=Cartoon+Character"
    case "sketch":
      return "/placeholder.svg?height=400&width=300&text=Sketch+Character"
    default:
      return "/placeholder.svg?height=400&width=300&text=Default+Character"
  }
}

export async function drawBackground(
  ctx: CanvasRenderingContext2D,
  backgroundImage: HTMLImageElement,
  sceneType: string,
  visualStyle: string,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
) {
  ctx.drawImage(backgroundImage, 0, 0, width, height)
}

export async function drawSceneContent(
  ctx: CanvasRenderingContext2D,
  characterImage: HTMLImageElement,
  sceneType: string,
  visualStyle: string,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
  text: string,
  prompt?: string,
) {
  ctx.drawImage(characterImage, width / 2 - 150, height / 2 - 200, 300, 400)
}

export function drawVisualEffects(
  ctx: CanvasRenderingContext2D,
  visualStyle: string,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
) {
  // Add some simple visual effects
  if (visualStyle === "cartoon") {
    ctx.fillStyle = `rgba(255, 255, 0, ${frame / totalFrames})`
    ctx.fillRect(0, 0, width, height)
  }
}

export function drawAdvancedCaptions(
  ctx: CanvasRenderingContext2D,
  text: string,
  prompt: string,
  frame: number,
  totalFrames: number,
  width: number,
  height: number,
  visualStyle: string,
) {
  ctx.fillStyle = "white"
  ctx.font = "24px Arial"
  ctx.textAlign = "center"
  ctx.fillText(text.substring(0, 20), width / 2, height - 50)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
