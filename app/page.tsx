"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Type,
  Link,
  Edit3,
  ImageIcon,
  FileText,
  Mic,
  Volume2,
  Video,
  FileVideo,
  MessageSquare,
  Scissors,
  Monitor,
  Upload,
  Sparkles,
  Download,
  Share2,
  Moon,
  Sun,
  ArrowLeft,
  Plus,
  X,
  Palette,
  Settings,
  Brain,
  Lightbulb,
  Eye,
  Wand2,
} from "lucide-react"
import { generateVideo, type GeneratedVideo } from "@/lib/video-generator"

interface Tool {
  id: string
  title: string
  description: string
  detailedDescription: string
  icon: React.ReactNode
  emoji: string
  inputType: "text" | "url" | "file" | "record" | "textarea"
  placeholder?: string
  acceptedFiles?: string
  category: "creation" | "editing" | "conversion"
  features: string[]
  customFields?: Array<{
    key: string
    label: string
    type: "text" | "textarea" | "select"
    options?: string[]
    placeholder?: string
  }>
}

interface CustomField {
  key: string
  value: string
}

export default function AIShortsGeneratorSingle() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [visualStyle, setVisualStyle] = useState<"realistic" | "cartoon" | "sketch">("realistic")
  const [customPrompt, setCustomPrompt] = useState("")
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)
  const [sceneType, setSceneType] = useState<"talking-head" | "product-demo" | "nature" | "abstract" | "tutorial">(
    "talking-head",
  )
  const [includeCaptions, setIncludeCaptions] = useState(true)
  const [includeAudio, setIncludeAudio] = useState(true)
  const [voiceType, setVoiceType] = useState<"male" | "female" | "child" | "robotic">("female")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGeminiInsights, setShowGeminiInsights] = useState(false)
  const [showGenerationOverlay, setShowGenerationOverlay] = useState(false)
  const [captionBgColor, setCaptionBgColor] = useState("#000000")
  const [captionTextColor, setCaptionTextColor] = useState("#ffffff")
  const [captionBgOpacity, setCaptionBgOpacity] = useState(0.8)

  const tools: Tool[] = [
    {
      id: "text-to-video",
      title: "Text to Video",
      description: "Transform any text into engaging video content",
      detailedDescription:
        "Convert your written content into stunning videos with AI-generated visuals, voiceover, and dynamic animations. Powered by Gemini AI for intelligent content analysis and scene generation.",
      icon: <Type className="w-6 h-6" />,
      emoji: "📝",
      inputType: "textarea",
      placeholder:
        "Enter your text content here...\n\nExample: 'Create an inspiring video about morning routines. Show someone waking up early, exercising, having a healthy breakfast, and starting their day with purpose.'",
      category: "creation",
      features: ["Gemini AI analysis", "Smart scene generation", "Natural voiceover", "Dynamic animations"],
      customFields: [
        { key: "title", label: "Video Title", type: "text", placeholder: "Enter custom video title" },
        { key: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Energetic", "Calm"] },
        { key: "target_audience", label: "Target Audience", type: "text", placeholder: "e.g., Young professionals" },
      ],
    },
    {
      id: "url-to-video",
      title: "URL to Video",
      description: "Convert web articles into videos",
      detailedDescription:
        "Transform any web article, blog post, or online content into engaging video format. Gemini AI extracts key information and creates compelling visual narratives with intelligent content structuring.",
      icon: <Link className="w-6 h-6" />,
      emoji: "🔗",
      inputType: "url",
      placeholder: "https://example.com/article",
      category: "conversion",
      features: ["Gemini content extraction", "Key point highlighting", "Visual storytelling", "Automated editing"],
      customFields: [
        {
          key: "focus",
          label: "Content Focus",
          type: "select",
          options: ["Main Points", "Statistics", "Quotes", "All"],
        },
        {
          key: "length",
          label: "Video Length",
          type: "select",
          options: ["Short (30s)", "Medium (60s)", "Long (90s)"],
        },
      ],
    },
    {
      id: "ai-video-editor",
      title: "AI Video Editor",
      description: "Enhance videos with AI-powered editing",
      detailedDescription:
        "Upload your existing videos and let Gemini AI enhance them with professional editing, effects, transitions, and optimizations for maximum engagement through intelligent analysis.",
      icon: <Edit3 className="w-6 h-6" />,
      emoji: "✂️",
      inputType: "file",
      acceptedFiles: "video/*",
      category: "editing",
      features: ["Gemini video analysis", "Smart editing", "Auto transitions", "Audio enhancement"],
      customFields: [
        {
          key: "enhancement",
          label: "Enhancement Type",
          type: "select",
          options: ["Color", "Audio", "Transitions", "All"],
        },
        { key: "intensity", label: "Effect Intensity", type: "select", options: ["Subtle", "Moderate", "Strong"] },
      ],
    },
    {
      id: "image-to-video",
      title: "Image to Video",
      description: "Bring static images to life",
      detailedDescription:
        "Transform your photos and images into dynamic videos with motion effects, zoom animations, and cinematic transitions. Gemini AI analyzes image content for optimal animation strategies.",
      icon: <ImageIcon className="w-6 h-6" />,
      emoji: "🖼️",
      inputType: "file",
      acceptedFiles: "image/*",
      category: "creation",
      features: ["Gemini image analysis", "Motion effects", "Cinematic transitions", "Background music"],
      customFields: [
        { key: "motion_type", label: "Motion Type", type: "select", options: ["Zoom", "Pan", "Rotate", "Parallax"] },
        { key: "speed", label: "Animation Speed", type: "select", options: ["Slow", "Normal", "Fast"] },
      ],
    },
    {
      id: "ppt-to-video",
      title: "PPT to Video",
      description: "Convert presentations to videos",
      detailedDescription:
        "Turn your PowerPoint presentations into engaging video content with smooth transitions, voiceover, and professional animations. Gemini AI optimizes slide flow and timing.",
      icon: <FileText className="w-6 h-6" />,
      emoji: "📊",
      inputType: "file",
      acceptedFiles: ".ppt,.pptx,.pdf",
      category: "conversion",
      features: ["Gemini slide analysis", "Professional voiceover", "Smooth transitions", "Brand consistency"],
      customFields: [
        {
          key: "transition_style",
          label: "Transition Style",
          type: "select",
          options: ["Fade", "Slide", "Zoom", "Flip"],
        },
        { key: "narration", label: "Add Narration", type: "select", options: ["Yes", "No"] },
      ],
    },
    {
      id: "smart-record",
      title: "Smart Record",
      description: "Record and enhance with AI",
      detailedDescription:
        "Record yourself or your screen and let Gemini AI automatically enhance the footage with professional editing, noise reduction, and intelligent optimization based on content analysis.",
      icon: <Mic className="w-6 h-6" />,
      emoji: "🎤",
      inputType: "record",
      category: "creation",
      features: ["Gemini content analysis", "Auto enhancement", "Smart cropping", "Professional editing"],
      customFields: [
        { key: "recording_type", label: "Recording Type", type: "select", options: ["Screen", "Camera", "Both"] },
        { key: "quality", label: "Quality", type: "select", options: ["HD", "Full HD", "4K"] },
      ],
    },
    {
      id: "ai-voice-generator",
      title: "AI Voice Generator",
      description: "Generate natural voiceovers",
      detailedDescription:
        "Create professional-quality voiceovers with Gemini AI-powered voice synthesis. Intelligent script analysis ensures perfect timing, emotion, and delivery for your content.",
      icon: <Volume2 className="w-6 h-6" />,
      emoji: "🗣️",
      inputType: "textarea",
      placeholder: "Enter text for voiceover generation...",
      category: "creation",
      features: ["Gemini script analysis", "Natural speech", "Emotion control", "Multi-language support"],
      customFields: [
        { key: "voice_type", label: "Voice Type", type: "select", options: ["Male", "Female", "Child", "Elderly"] },
        { key: "accent", label: "Accent", type: "select", options: ["American", "British", "Australian", "Canadian"] },
        { key: "emotion", label: "Emotion", type: "select", options: ["Neutral", "Happy", "Serious", "Excited"] },
      ],
    },
    {
      id: "script-to-video",
      title: "Script to Video",
      description: "Turn scripts into cinematic videos",
      detailedDescription:
        "Transform your scripts and stories into professional video content with Gemini AI-powered scene generation, character animation, and cinematic effects based on narrative analysis.",
      icon: <FileVideo className="w-6 h-6" />,
      emoji: "🎬",
      inputType: "textarea",
      placeholder: "Paste your script here...",
      category: "creation",
      features: ["Gemini narrative analysis", "Scene generation", "Character animation", "Story visualization"],
      customFields: [
        { key: "genre", label: "Genre", type: "select", options: ["Drama", "Comedy", "Action", "Documentary"] },
        { key: "characters", label: "Number of Characters", type: "select", options: ["1", "2", "3", "4+"] },
      ],
    },
    {
      id: "chatgpt-video-generator",
      title: "Gemini Video Generator",
      description: "AI-powered content creation",
      detailedDescription:
        "Describe your video idea and let Gemini AI create the script, analyze the concept, and generate corresponding visuals with intelligent content structuring and creative suggestions.",
      icon: <Brain className="w-6 h-6" />,
      emoji: "🤖",
      inputType: "text",
      placeholder: "Describe what video you want to create...",
      category: "creation",
      features: ["Gemini AI script writing", "Concept visualization", "Creative suggestions", "Automated production"],
      customFields: [
        {
          key: "creativity",
          label: "Creativity Level",
          type: "select",
          options: ["Conservative", "Balanced", "Creative", "Wild"],
        },
        {
          key: "format",
          label: "Video Format",
          type: "select",
          options: ["Tutorial", "Story", "Presentation", "Advertisement"],
        },
      ],
    },
    {
      id: "video-clip-generator",
      title: "Video Clip Generator",
      description: "Create clips from longer videos",
      detailedDescription:
        "Upload longer videos and let Gemini AI automatically identify the best moments, analyze content flow, and create engaging short clips optimized for social media platforms.",
      icon: <Scissors className="w-6 h-6" />,
      emoji: "🎞️",
      inputType: "file",
      acceptedFiles: "video/*",
      category: "editing",
      features: ["Gemini content analysis", "Smart clipping", "Highlight detection", "Social optimization"],
      customFields: [
        { key: "clip_length", label: "Clip Length", type: "select", options: ["15s", "30s", "60s", "90s"] },
        {
          key: "highlight_type",
          label: "Highlight Type",
          type: "select",
          options: ["Action", "Dialogue", "Music", "All"],
        },
      ],
    },
    {
      id: "presentation-video-maker",
      title: "Presentation Video Maker",
      description: "Professional presentation videos",
      detailedDescription:
        "Create polished presentation videos with Gemini AI-powered slide analysis, animated transitions, professional narration, and engaging visual elements optimized for your content.",
      icon: <Monitor className="w-6 h-6" />,
      emoji: "📺",
      inputType: "file",
      acceptedFiles: ".ppt,.pptx,.pdf,.key",
      category: "conversion",
      features: ["Gemini slide analysis", "Animated slides", "Professional narration", "Brand integration"],
      customFields: [
        { key: "template", label: "Template", type: "select", options: ["Corporate", "Creative", "Minimal", "Bold"] },
        { key: "branding", label: "Add Branding", type: "select", options: ["Yes", "No"] },
      ],
    },
    {
      id: "text-video-generator",
      title: "Text Video Generator",
      description: "Dynamic text-based videos",
      detailedDescription:
        "Create engaging videos focused on text content with Gemini AI-powered typography analysis, kinetic animations, and dynamic visual effects that enhance readability and engagement.",
      icon: <Video className="w-6 h-6" />,
      emoji: "💬",
      inputType: "textarea",
      placeholder: "Enter text for animated video...",
      category: "creation",
      features: ["Gemini typography analysis", "Kinetic typography", "Dynamic effects", "Text animations"],
      customFields: [
        {
          key: "typography",
          label: "Typography Style",
          type: "select",
          options: ["Modern", "Classic", "Handwritten", "Bold"],
        },
        {
          key: "animation_speed",
          label: "Animation Speed",
          type: "select",
          options: ["Slow", "Normal", "Fast", "Very Fast"],
        },
      ],
    },
  ]

  const videoStyles = [
    { value: "minimal", label: "Minimal & Clean" },
    { value: "dynamic", label: "Dynamic & Energetic" },
    { value: "professional", label: "Professional" },
    { value: "creative", label: "Creative & Artistic" },
    { value: "educational", label: "Educational" },
    { value: "storytelling", label: "Storytelling" },
  ]

  const sceneTypes = [
    { value: "talking-head", label: "Talking Head", description: "Person speaking with gestures and expressions" },
    { value: "product-demo", label: "Product Demo", description: "Showcase products with animated features" },
    { value: "nature", label: "Nature Scene", description: "Outdoor scenes with moving elements" },
    { value: "abstract", label: "Abstract", description: "Creative abstract visuals and patterns" },
    { value: "tutorial", label: "Tutorial", description: "Step-by-step instructional content" },
  ]

  const visualStyles = [
    { value: "realistic", label: "Realistic", description: "Photorealistic visuals with depth and lighting" },
    { value: "cartoon", label: "Cartoon", description: "Colorful, animated cartoon-style graphics" },
    { value: "sketch", label: "Sketch", description: "Hand-drawn, artistic sketch appearance" },
  ]

  const voiceTypes = [
    { value: "female", label: "Female Voice", description: "Natural female voice with clear pronunciation" },
    { value: "male", label: "Male Voice", description: "Professional male voice with deep tone" },
    { value: "child", label: "Child Voice", description: "Young, energetic voice for kid-friendly content" },
    { value: "robotic", label: "Robotic Voice", description: "Futuristic AI-style synthetic voice" },
  ]

  const handleGenerate = async () => {
    if (!inputValue.trim() && selectedTool !== "smart-record") return

    setShowGenerationOverlay(true)
    setIsGenerating(true)
    setGenerationProgress(0)
    setShowPreview(false)
    setGeneratedVideo(null)
    setShowGeminiInsights(false)

    try {
      const progressSteps = [15, 30, 45, 60, 75, 90, 95]
      let currentStep = 0

      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setGenerationProgress(progressSteps[currentStep])
          currentStep++
        }
      }, 1200)

      // Convert custom fields to object
      const customFieldsObj = customFields.reduce(
        (acc, field) => {
          acc[field.key] = field.value
          return acc
        },
        {} as Record<string, string>,
      )

      const video = await generateVideo({
        text: inputValue,
        style: selectedStyle || "dynamic",
        tool: selectedTool || "text-to-video",
        visualStyle,
        customFields: customFieldsObj,
        prompt: customPrompt,
        includeCaptions,
        includeAudio,
        sceneType,
        voiceType,
        captionBgColor,
        captionTextColor,
        captionBgOpacity,
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      setTimeout(() => {
        setGeneratedVideo(video)
        setIsGenerating(false)
        setShowPreview(true)
        setShowGenerationOverlay(false)
      }, 1000)
    } catch (error) {
      console.error("Video generation failed:", error)
      setIsGenerating(false)
      setShowGenerationOverlay(false)
      alert("Video generation failed. Please try again.")
    }
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        setInputValue("Recording completed (0:45)")
      }, 3000)
    }
  }

  const addCustomField = () => {
    const currentTool = tools.find((t) => t.id === selectedTool)
    if (currentTool?.customFields && customFields.length < currentTool.customFields.length) {
      const availableFields = currentTool.customFields.filter(
        (field) => !customFields.some((cf) => cf.key === field.key),
      )
      if (availableFields.length > 0) {
        setCustomFields([...customFields, { key: availableFields[0].key, value: "" }])
      }
    }
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const updateCustomField = (index: number, value: string) => {
    const updated = [...customFields]
    updated[index].value = value
    setCustomFields(updated)
  }

  const renderInput = (tool: Tool) => {
    switch (tool.inputType) {
      case "textarea":
        return (
          <Textarea
            placeholder={tool.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="min-h-[140px] text-base resize-none bg-white/50 border-slate-200/50 focus:border-cyan-400 focus:ring-cyan-400/20"
            disabled={isGenerating}
          />
        )
      case "text":
        return (
          <Input
            placeholder={tool.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-white/50 border-slate-200/50 focus:border-cyan-400"
            disabled={isGenerating}
          />
        )
      case "url":
        return (
          <Input
            type="url"
            placeholder={tool.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-white/50 border-slate-200/50 focus:border-cyan-400"
            disabled={isGenerating}
          />
        )
      case "file":
        return (
          <div className="space-y-3">
            <Input
              type="file"
              accept={tool.acceptedFiles}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setInputValue(file.name)
                }
              }}
              disabled={isGenerating}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 bg-white/50 border-slate-200/50"
            />
            {inputValue && (
              <p className="text-sm text-slate-600 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {inputValue}
              </p>
            )}
          </div>
        )
      case "record":
        return (
          <div className="space-y-4">
            <Button
              onClick={handleRecord}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full h-12 bg-white/50 border-slate-200/50"
              disabled={isGenerating}
            >
              <Mic className={`w-5 h-5 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            {inputValue && (
              <p className="text-sm text-green-600 flex items-center justify-center">
                <Video className="w-4 h-4 mr-2" />
                {inputValue}
              </p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const canGenerate = () => {
    if (selectedTool === "smart-record") {
      return inputValue && inputValue.includes("completed")
    }
    return inputValue && inputValue.trim().length > 0
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "creation":
        return "from-cyan-500 to-teal-500"
      case "editing":
        return "from-purple-500 to-pink-500"
      case "conversion":
        return "from-green-500 to-teal-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const currentTool = tools.find((t) => t.id === selectedTool)
  const themeClass = darkMode ? "dark" : ""

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClass}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                {selectedTool && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTool(null)
                      setInputValue("")
                      setShowPreview(false)
                      setIsGenerating(false)
                      setGeneratedVideo(null)
                      setCustomFields([])
                      setCustomPrompt("")
                      setShowGeminiInsights(false)
                    }}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">VideoAI</span>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by Gemini
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedTool ? (
            // Tool Selection Screen
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  Choose Your AI
                  <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                    {" "}
                    Video Tool
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
                  Select from our comprehensive collection of AI-powered video creation tools. Each tool is designed for
                  specific use cases and optimized for the best results.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Brain className="w-4 h-4" />
                  <span>Enhanced with Google Gemini AI for intelligent content generation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(tool.category)} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                          >
                            {tool.icon}
                          </div>
                          <span className="text-2xl">{tool.emoji}</span>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {tool.category}
                          </Badge>
                          <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                            <Brain className="w-3 h-3 mr-1" />
                            Gemini
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">{tool.title}</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tool.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Single Tool Interface
            currentTool && (
              <div className="space-y-8">
                {/* Tool Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(currentTool.category)} rounded-2xl flex items-center justify-center text-white`}
                    >
                      {currentTool.icon}
                    </div>
                    <span className="text-4xl">{currentTool.emoji}</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm">
                      <Brain className="w-4 h-4 mr-2" />
                      Gemini AI Enhanced
                    </Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    {currentTool.title}
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    {currentTool.detailedDescription}
                  </p>
                </div>

                {/* Tool Switcher */}
                <Card className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 max-w-4xl mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Tool Switch</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {currentTool.category}
                        </Badge>
                        <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool.id)
                            setInputValue("")
                            setShowPreview(false)
                            setIsGenerating(false)
                            setSelectedStyle("")
                            setGeneratedVideo(null)
                            setCustomFields([])
                            setCustomPrompt("")
                            setShowGeminiInsights(false)
                          }}
                          disabled={isGenerating}
                          className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center space-y-1 ${
                            tool.id === selectedTool
                              ? `bg-gradient-to-r ${getCategoryColor(tool.category)} text-white border-transparent shadow-lg`
                              : "bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:shadow-md text-slate-700 dark:text-slate-300"
                          } ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div
                            className={`w-6 h-6 flex items-center justify-center ${tool.id === selectedTool ? "text-white" : ""}`}
                          >
                            {tool.icon}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight">
                            {tool.title.split(" ")[0]}
                          </span>
                          <span className="text-lg">{tool.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-3">
                  {currentTool.features.map((feature, index) => (
                    <Badge
                      key={index}
                      className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Main Tool Interface */}
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl max-w-4xl mx-auto">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Gemini AI Notice */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Powered by Gemini AI</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Advanced content analysis, intelligent scene generation, and smart optimization
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Primary Input */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          {currentTool.inputType === "file" ? "Upload File" : "Primary Input"}
                          <Badge className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Enhanced
                          </Badge>
                        </Label>
                        {renderInput(currentTool)}
                      </div>

                      {/* Visual Style Selection */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                          <Palette className="w-4 h-4 mr-2" />
                          Visual Style
                          <Badge className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            <Eye className="w-3 h-3 mr-1" />
                            AI Optimized
                          </Badge>
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {visualStyles.map((style) => (
                            <button
                              key={style.value}
                              onClick={() => setVisualStyle(style.value as "realistic" | "cartoon" | "sketch")}
                              disabled={isGenerating}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                visualStyle === style.value
                                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                              } ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{style.label}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{style.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scene Type Selection */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Scene Type
                          <Badge className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Smart Selection
                          </Badge>
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {sceneTypes.map((scene) => (
                            <button
                              key={scene.value}
                              onClick={() => setSceneType(scene.value as any)}
                              disabled={isGenerating}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                sceneType === scene.value
                                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                              } ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{scene.label}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{scene.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Audio & Caption Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Caption Settings */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Caption Settings
                            <Badge className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                              <Wand2 className="w-3 h-3 mr-1" />
                              AI Timed
                            </Badge>
                          </Label>
                          <div className="flex items-center space-x-3 p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                            <Switch
                              checked={includeCaptions}
                              onCheckedChange={setIncludeCaptions}
                              disabled={isGenerating}
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Include Captions</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Gemini AI generates perfectly timed captions
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Audio Settings */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                            <Volume2 className="w-4 h-4 mr-2" />
                            Audio Settings
                            <Badge className="ml-2 text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Voice
                            </Badge>
                          </Label>
                          <div className="flex items-center space-x-3 p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                            <Switch checked={includeAudio} onCheckedChange={setIncludeAudio} disabled={isGenerating} />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Include Audio</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Generate natural AI voiceover with Gemini script
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Voice Type Selection */}
                      {includeAudio && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                            <Mic className="w-4 h-4 mr-2" />
                            Voice Type
                            <Badge className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              <Volume2 className="w-3 h-3 mr-1" />
                              Natural AI
                            </Badge>
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {voiceTypes.map((voice) => (
                              <button
                                key={voice.value}
                                onClick={() => setVoiceType(voice.value as any)}
                                disabled={isGenerating}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                  voiceType === voice.value
                                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                } ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{voice.label}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{voice.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Caption Color Customization */}
                      {includeCaptions && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                            <Palette className="w-4 h-4 mr-2" />
                            Caption Colors
                            <Badge className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              <Eye className="w-3 h-3 mr-1" />
                              Customizable
                            </Badge>
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                Background Color
                              </Label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={captionBgColor}
                                  onChange={(e) => setCaptionBgColor(e.target.value)}
                                  disabled={isGenerating}
                                  className="w-12 h-8 rounded border border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <Input
                                  value={captionBgColor}
                                  onChange={(e) => setCaptionBgColor(e.target.value)}
                                  placeholder="#000000"
                                  className="flex-1 text-xs bg-white/50 border-slate-200/50"
                                  disabled={isGenerating}
                                />
                              </div>
                              <div className="mt-2">
                                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                                  Opacity: {Math.round(captionBgOpacity * 100)}%
                                </Label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={captionBgOpacity}
                                  onChange={(e) => setCaptionBgOpacity(Number.parseFloat(e.target.value))}
                                  disabled={isGenerating}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                Text Color
                              </Label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={captionTextColor}
                                  onChange={(e) => setCaptionTextColor(e.target.value)}
                                  disabled={isGenerating}
                                  className="w-12 h-8 rounded border border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <Input
                                  value={captionTextColor}
                                  onChange={(e) => setCaptionTextColor(e.target.value)}
                                  placeholder="#ffffff"
                                  className="flex-1 text-xs bg-white/50 border-slate-200/50"
                                  disabled={isGenerating}
                                />
                              </div>
                              <div
                                className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-600"
                                style={{
                                  backgroundColor: `${captionBgColor}${Math.round(captionBgOpacity * 255)
                                    .toString(16)
                                    .padStart(2, "0")}`,
                                  color: captionTextColor,
                                }}
                              >
                                <p className="text-sm text-center font-medium">Caption Preview</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content Style */}
                      {(currentTool.inputType === "textarea" || currentTool.inputType === "text") && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Content Style (Optional)
                          </Label>
                          <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isGenerating}>
                            <SelectTrigger className="bg-white/50 border-slate-200/50 focus:border-cyan-400">
                              <SelectValue placeholder="Choose a style" />
                            </SelectTrigger>
                            <SelectContent>
                              {videoStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Custom Prompt */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                          Custom Prompt (Optional)
                          <Badge className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                            <Brain className="w-3 h-3 mr-1" />
                            Gemini Enhanced
                          </Badge>
                        </Label>
                        <Textarea
                          placeholder="Add specific instructions for Gemini AI to enhance video generation..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="bg-white/50 border-slate-200/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                          disabled={isGenerating}
                          rows={3}
                        />
                      </div>

                      {/* Custom Fields */}
                      {currentTool.customFields && currentTool.customFields.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Custom Fields
                            </Label>
                            {customFields.length < currentTool.customFields.length && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCustomField}
                                disabled={isGenerating}
                                className="text-xs bg-transparent"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Field
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {customFields.map((field, index) => {
                              const fieldDef = currentTool.customFields?.find((f) => f.key === field.key)
                              if (!fieldDef) return null

                              return (
                                <div key={index} className="flex items-center space-x-3">
                                  <div className="flex-1">
                                    <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                                      {fieldDef.label}
                                    </Label>
                                    {fieldDef.type === "select" ? (
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => updateCustomField(index, value)}
                                        disabled={isGenerating}
                                      >
                                        <SelectTrigger className="bg-white/50 border-slate-200/50">
                                          <SelectValue placeholder={`Select ${fieldDef.label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {fieldDef.options?.map((option) => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : fieldDef.type === "textarea" ? (
                                      <Textarea
                                        placeholder={fieldDef.placeholder}
                                        value={field.value}
                                        onChange={(e) => updateCustomField(index, e.target.value)}
                                        className="bg-white/50 border-slate-200/50"
                                        disabled={isGenerating}
                                        rows={2}
                                      />
                                    ) : (
                                      <Input
                                        placeholder={fieldDef.placeholder}
                                        value={field.value}
                                        onChange={(e) => updateCustomField(index, e.target.value)}
                                        className="bg-white/50 border-slate-200/50"
                                        disabled={isGenerating}
                                      />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomField(index)}
                                    disabled={isGenerating}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate() || isGenerating}
                        className={`w-full bg-gradient-to-r ${getCategoryColor(currentTool.category)} hover:opacity-90 text-white border-0 h-12 text-lg`}
                      >
                        {isGenerating ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-pulse" />
                            Gemini AI is generating your {visualStyle} video...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate with Gemini AI
                          </>
                        )}
                      </Button>

                      {/* Generation Overlay */}
                      {showGenerationOverlay && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                            <div className="mb-6">
                              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-10 h-10 text-white animate-pulse" />
                              </div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Gemini AI is Creating Your Video
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                Generating {visualStyle} style video with {sceneType.replace("-", " ")} scene
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-medium">Progress</span>
                                <span className="font-mono">{Math.round(generationProgress)}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${generationProgress}%` }}
                                />
                              </div>

                              <div className="text-sm text-slate-600 dark:text-slate-400 min-h-[2.5rem] flex items-center justify-center">
                                {generationProgress < 20 && (
                                  <div className="flex items-center">
                                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                                    "Gemini AI analyzing your content and generating scene plan..."
                                  </div>
                                )}
                                {generationProgress >= 20 && generationProgress < 35 && (
                                  <div className="flex items-center">
                                    <Palette className="w-4 h-4 mr-2 animate-bounce" />
                                    `Creating ${visualStyle} visual elements with AI-optimized colors...`
                                  </div>
                                )}
                                {generationProgress >= 35 && generationProgress < 50 && (
                                  <div className="flex items-center">
                                    <Video className="w-4 h-4 mr-2 animate-pulse" />
                                    "Generating intelligent scene transitions and camera movements..."
                                  </div>
                                )}
                                {generationProgress >= 50 && generationProgress < 65 && (
                                  <div className="flex items-center">
                                    <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                                    `${includeAudio ? `Creating ${voiceType} AI voiceover with` : "Adding"} smart audio
                                    timing...`
                                  </div>
                                )}
                                {generationProgress >= 65 && generationProgress < 80 && (
                                  <div className="flex items-center">
                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                    "Applying Gemini's visual effects and custom field integration..."
                                  </div>
                                )}
                                {generationProgress >= 80 && generationProgress < 95 && (
                                  <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2 animate-bounce" />
                                    `${includeCaptions ? "Generating AI-timed captions and" : "Adding"} final
                                    optimizations...`
                                  </div>
                                )}
                                {generationProgress >= 95 && (
                                  <div className="flex items-center">
                                    <Wand2 className="w-4 h-4 mr-2 animate-pulse" />
                                    "✨ Finalizing your Gemini AI-powered masterpiece..."
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="text-center">
                                  <div className="text-xs text-slate-500 dark:text-slate-400">Style</div>
                                  <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                                    {visualStyle}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-500 dark:text-slate-400">Scene</div>
                                  <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                                    {sceneType.replace("-", " ")}
                                  </div>
                                </div>
                                {includeAudio && (
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Voice</div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                                      {voiceType} AI
                                    </div>
                                  </div>
                                )}
                                {includeCaptions && (
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Captions</div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">Custom Colors</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowGenerationOverlay(false)
                                setIsGenerating(false)
                              }}
                              className="mt-6 w-full"
                            >
                              Cancel Generation
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Video Preview */}
                      {showPreview && generatedVideo && (
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                              🎉 Your Gemini AI Video is Ready!
                              {generatedVideo.hasAudio && (
                                <Badge className="ml-2 bg-green-500 text-white">
                                  <Volume2 className="w-3 h-3 mr-1" />
                                  With AI Audio
                                </Badge>
                              )}
                            </h3>
                            {generatedVideo.geminiInsights && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowGeminiInsights(!showGeminiInsights)}
                                className="text-xs"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                {showGeminiInsights ? "Hide" : "Show"} AI Insights
                              </Button>
                            )}
                          </div>

                          {/* Gemini Insights */}
                          {showGeminiInsights && generatedVideo.geminiInsights && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                <Brain className="w-4 h-4 mr-2" />
                                Gemini AI Analysis & Insights
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Scene Breakdown:
                                  </h5>
                                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                                    {generatedVideo.geminiInsights.scenes.map((scene, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                                          {index + 1}
                                        </span>
                                        <span>{scene.description}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    AI Effects Applied:
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {generatedVideo.geminiInsights.effects.map((effect, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs text-blue-700 border-blue-300"
                                      >
                                        {effect}
                                      </Badge>
                                    ))}
                                  </div>
                                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 mt-3">
                                    Color Palette:
                                  </h5>
                                  <div className="flex space-x-1">
                                    {generatedVideo.geminiInsights.colorPalette.map((color, index) => (
                                      <div
                                        key={index}
                                        className="w-6 h-6 rounded border border-blue-300"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 mt-3">
                                    Caption Colors:
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: captionBgColor }}
                                        title={`Background: ${captionBgColor}`}
                                      />
                                      <span className="text-xs">BG</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: captionTextColor }}
                                        title={`Text: ${captionTextColor}`}
                                      />
                                      <span className="text-xs">Text</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="max-w-sm mx-auto">
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[9/16] shadow-2xl">
                              <video
                                className="w-full h-full object-cover"
                                controls
                                poster={generatedVideo.thumbnail}
                                preload="metadata"
                                autoPlay={false}
                                muted={false}
                                loop
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                              >
                                <source src={generatedVideo.videoUrl} type="video/webm" />
                                Your browser does not support the video tag.
                              </video>
                              <div className="absolute top-4 right-4 flex gap-2">
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                  <Brain className="w-3 h-3 mr-1" />
                                  Gemini AI
                                </Badge>
                                <Badge className="bg-cyan-500/90 text-white text-xs capitalize">{visualStyle}</Badge>
                                {sceneType && (
                                  <Badge className="bg-purple-500/90 text-white text-xs capitalize">
                                    {sceneType.replace("-", " ")}
                                  </Badge>
                                )}
                              </div>
                              {generatedVideo.hasAudio && (
                                <div className="absolute top-4 left-4">
                                  <Badge className="bg-green-500/90 text-white text-xs">
                                    <Volume2 className="w-3 h-3 mr-1" />
                                    {voiceType} AI Voice
                                  </Badge>
                                </div>
                              )}
                              {includeCaptions && (
                                <div className="absolute bottom-4 left-4">
                                  <Badge
                                    className="text-xs"
                                    style={{
                                      backgroundColor: `${captionBgColor}${Math.round(captionBgOpacity * 255)
                                        .toString(16)
                                        .padStart(2, "0")}`,
                                      color: captionTextColor,
                                      border: "none",
                                    }}
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Custom Captions
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                {generatedVideo.title}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Duration: {generatedVideo.duration} • Style: {visualStyle} • Scene:{" "}
                                {sceneType?.replace("-", " ")}
                                {generatedVideo.hasAudio && ` • Voice: ${voiceType} AI`}
                                {includeCaptions && ` • Custom Captions`}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                                  <Brain className="w-3 h-3 mr-1" />
                                  Gemini Enhanced
                                </Badge>
                                {includeCaptions && (
                                  <Badge variant="outline" className="text-xs">
                                    <Palette className="w-3 h-3 mr-1" />
                                    Custom Colors
                                  </Badge>
                                )}
                                {generatedVideo.hasAudio && (
                                  <Badge variant="outline" className="text-xs">
                                    <Volume2 className="w-3 h-3 mr-1" />
                                    Integrated Audio
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <Button
                                className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = generatedVideo.videoUrl
                                  link.download = `${generatedVideo.title
                                    .replace(/[^a-z0-9]/gi, "_")
                                    .toLowerCase()}_gemini_${visualStyle}_${sceneType}.webm`
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Video
                              </Button>
                              <Button
                                className={`flex-1 bg-gradient-to-r ${getCategoryColor(currentTool.category)} hover:opacity-90 text-white border-0`}
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({
                                      title: generatedVideo.title,
                                      text: `Check out this Gemini AI-generated ${visualStyle} video with ${sceneType} scene and custom captions!`,
                                      url: window.location.href,
                                    })
                                  } else {
                                    navigator.clipboard.writeText(window.location.href)
                                    alert("Link copied to clipboard!")
                                  }
                                }}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
