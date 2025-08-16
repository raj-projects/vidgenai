"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Type,
  Link,
  ImageIcon,
  Mic,
  Volume2,
  Video,
  MessageSquare,
  Scissors,
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
  Search,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Play,
  Grid3X3,
  Calendar,
  Trash2,
  Filter,
  SortDesc,
  Monitor,
  Smartphone,
} from "lucide-react";
import { generateVideo, type GeneratedVideo } from "@/lib/video-generator";
import {
  generateImage,
  convertImageToVideo,
  generateSpeech,
  generateThumbnail,
} from "@/lib/media-generators";

interface Tool {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ReactNode;
  emoji: string;
  inputType: "text" | "url" | "file" | "record" | "textarea";
  placeholder?: string;
  acceptedFiles?: string;
  category: "creation" | "editing" | "conversion";
  features: string[];
  customFields?: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "select";
    options?: string[];
    placeholder?: string;
  }>;
}

interface CustomField {
  key: string;
  value: string;
}

export interface StoredVideo extends GeneratedVideo {
  id: string;
  createdAt: Date;
  tool: string;
  settings: {
    visualStyle: string;
    sceneType: string;
    voiceType?: string;
    includeCaptions: boolean;
    includeAudio: boolean;
    videoLength?: number;
    videoOrientation?: string;
  };
}

export default function AIShortsGeneratorSingle() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [visualStyle, setVisualStyle] = useState<
    "realistic" | "cartoon" | "sketch"
  >("realistic");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(
    null
  );
  const [sceneType, setSceneType] = useState<
    "talking-head" | "product-demo" | "nature" | "abstract" | "tutorial"
  >("talking-head");
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [voiceType, setVoiceType] = useState<
    "male" | "female" | "child" | "robotic"
  >("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGeminiInsights, setShowGeminiInsights] = useState(false);
  const [showGenerationOverlay, setShowGenerationOverlay] = useState(false);
  const [captionBgColor, setCaptionBgColor] = useState("#000000");
  const [captionTextColor, setCaptionTextColor] = useState("#ffffff");
  const [captionBgOpacity, setCaptionBgOpacity] = useState(0.8);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // New states for gallery and right sidebar
  const [currentView, setCurrentView] = useState<"generator" | "gallery">(
    "generator"
  );
  const [videoGallery, setVideoGallery] = useState<StoredVideo[]>([]);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [gallerySearchQuery, setGallerySearchQuery] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [gallerySortBy, setGallerySortBy] = useState<
    "newest" | "oldest" | "title"
  >("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGalleryVideo, setSelectedGalleryVideo] =
    useState<StoredVideo | null>(null);
  const [videosPerPage, setVideosPerPage] = useState(12);

  const [videoLength, setVideoLength] = useState<15 | 30 | 45 | 60>(30);
  const [videoOrientation, setVideoOrientation] = useState<
    "landscape" | "portrait"
  >("portrait");

  const [showCustomFields, setShowCustomFields] = useState(false);

  // Add these new states after the existing state declarations
  const [galleryCategory, setGalleryCategory] = useState<
    "all" | "images" | "videos" | "audio"
  >("all");
  const [generatedMedia, setGeneratedMedia] = useState<any[]>([]);

  const tools: Tool[] = [
    {
      id: "text-to-video",
      title: "Text to Video",
      description: "Transform text into engaging video content with AI",
      detailedDescription:
        "Convert written content into stunning videos with AI-generated visuals, voiceover, and dynamic animations. Supports scripts, articles, and creative content.",
      icon: <Type className="w-6 h-6" />,
      emoji: "📝",
      inputType: "textarea",
      placeholder: "Enter your text content, script, or article here...",
      category: "creation",
      features: [
        "Gemini AI analysis",
        "Smart scene generation",
        "Natural voiceover",
        "Dynamic animations",
      ],
      customFields: [
        {
          key: "content_type",
          label: "Content Type",
          type: "select",
          options: ["Article", "Script", "Story", "Tutorial"],
        },
        {
          key: "tone",
          label: "Tone",
          type: "select",
          options: ["Professional", "Casual", "Energetic", "Calm"],
        },
        {
          key: "target_audience",
          label: "Target Audience",
          type: "text",
          placeholder: "e.g., Young professionals",
        },
      ],
    },
    {
      id: "text-to-image",
      title: "Text to Image",
      description: "Generate stunning AI images from text descriptions",
      detailedDescription:
        "Create high-quality, realistic images from detailed text prompts using advanced AI image generation technology.",
      icon: <ImageIcon className="w-6 h-6" />,
      emoji: "🎨",
      inputType: "textarea",
      placeholder: "Describe the image you want to generate in detail...",
      category: "creation",
      features: [
        "High-resolution output",
        "Multiple art styles",
        "Realistic rendering",
        "Creative flexibility",
      ],
      customFields: [
        {
          key: "art_style",
          label: "Art Style",
          type: "select",
          options: [
            "Photorealistic",
            "Digital Art",
            "Oil Painting",
            "Watercolor",
            "Sketch",
            "Abstract",
          ],
        },
        {
          key: "aspect_ratio",
          label: "Aspect Ratio",
          type: "select",
          options: [
            "1:1 Square",
            "16:9 Landscape",
            "9:16 Portrait",
            "4:3 Classic",
          ],
        },
        {
          key: "quality",
          label: "Quality",
          type: "select",
          options: ["Standard", "High", "Ultra"],
        },
      ],
    },
    {
      id: "image-to-video",
      title: "Image to Video",
      description: "Convert static images into animated video clips",
      detailedDescription:
        "Transform your images into engaging video content with smooth transitions, zoom effects, and professional animations.",
      icon: <Video className="w-6 h-6" />,
      emoji: "🎬",
      inputType: "file",
      acceptedFiles: "image/*",
      category: "conversion",
      features: [
        "Smooth animations",
        "Multiple transition effects",
        "Customizable duration",
        "HD output",
      ],
      customFields: [
        {
          key: "animation_type",
          label: "Animation Type",
          type: "select",
          options: [
            "Zoom In",
            "Zoom Out",
            "Pan Left",
            "Pan Right",
            "Fade",
            "Parallax",
          ],
        },
        {
          key: "video_duration",
          label: "Duration",
          type: "select",
          options: ["3 seconds", "5 seconds", "10 seconds", "15 seconds"],
        },
        {
          key: "transition_speed",
          label: "Speed",
          type: "select",
          options: ["Slow", "Medium", "Fast"],
        },
      ],
    },
    {
      id: "text-to-speech",
      title: "Text to Speech",
      description: "Convert text to natural-sounding speech",
      detailedDescription:
        "Generate high-quality, realistic voiceovers from text with multiple voice options, accents, and speaking styles.",
      icon: <Volume2 className="w-6 h-6" />,
      emoji: "🎤",
      inputType: "textarea",
      placeholder: "Enter the text you want to convert to speech...",
      category: "conversion",
      features: [
        "Natural voices",
        "Multiple accents",
        "Adjustable speed",
        "High-quality audio",
      ],
      customFields: [
        {
          key: "voice_gender",
          label: "Voice Gender",
          type: "select",
          options: ["Female", "Male", "Child"],
        },
        {
          key: "accent",
          label: "Accent",
          type: "select",
          options: ["American", "British", "Australian", "Canadian", "Indian"],
        },
        {
          key: "speaking_rate",
          label: "Speaking Rate",
          type: "select",
          options: ["Slow", "Normal", "Fast"],
        },
        {
          key: "pitch",
          label: "Pitch",
          type: "select",
          options: ["Low", "Normal", "High"],
        },
      ],
    },
    {
      id: "text-to-thumbnail",
      title: "Text to Thumbnail",
      description: "Create eye-catching video thumbnails from text",
      detailedDescription:
        "Generate professional, click-worthy thumbnails for your videos using AI-powered design and compelling visual elements.",
      icon: <ImageIcon className="w-6 h-6" />,
      emoji: "🖼️",
      inputType: "textarea",
      placeholder:
        "Describe your video content or enter the title for thumbnail generation...",
      category: "creation",
      features: [
        "Click-worthy designs",
        "Multiple templates",
        "Custom text overlay",
        "Social media optimized",
      ],
      customFields: [
        {
          key: "thumbnail_style",
          label: "Thumbnail Style",
          type: "select",
          options: ["YouTube", "Instagram", "TikTok", "Generic"],
        },
        {
          key: "color_scheme",
          label: "Color Scheme",
          type: "select",
          options: [
            "Bright & Bold",
            "Dark & Moody",
            "Clean & Minimal",
            "Colorful",
          ],
        },
        {
          key: "text_overlay",
          label: "Text Overlay",
          type: "text",
          placeholder: "Main title text for thumbnail",
        },
      ],
    },
    {
      id: "url-to-video",
      title: "URL to Video",
      description: "Convert web content into videos",
      detailedDescription:
        "Transform web articles, blog posts, or online content into engaging video format with intelligent content extraction.",
      icon: <Link className="w-6 h-6" />,
      emoji: "🔗",
      inputType: "url",
      placeholder: "https://example.com/article",
      category: "conversion",
      features: [
        "Content extraction",
        "Key point highlighting",
        "Visual storytelling",
        "Automated editing",
      ],
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
      id: "media-to-video",
      title: "Media to Video",
      description: "Transform images, presentations, and videos",
      detailedDescription:
        "Upload images, PPT files, or existing videos to create enhanced content with AI-powered editing, effects, and animations.",
      icon: <ImageIcon className="w-6 h-6" />,
      emoji: "🎬",
      inputType: "file",
      acceptedFiles: "image/*,video/*,.ppt,.pptx,.pdf",
      category: "editing",
      features: [
        "Multi-format support",
        "Smart editing",
        "Auto transitions",
        "Enhancement effects",
      ],
      customFields: [
        {
          key: "media_type",
          label: "Media Type",
          type: "select",
          options: ["Image", "Video", "Presentation"],
        },
        {
          key: "enhancement",
          label: "Enhancement",
          type: "select",
          options: ["Color", "Audio", "Transitions", "All"],
        },
        {
          key: "motion_type",
          label: "Animation",
          type: "select",
          options: ["Zoom", "Pan", "Rotate", "Parallax"],
        },
      ],
    },
    {
      id: "ai-voice-video",
      title: "AI Voice & Record",
      description: "Generate voiceovers and record content",
      detailedDescription:
        "Create professional voiceovers with AI or record yourself/screen with automatic enhancement and optimization.",
      icon: <Volume2 className="w-6 h-6" />,
      emoji: "🎤",
      inputType: "textarea",
      placeholder:
        "Enter text for voiceover or click record to capture content...",
      category: "creation",
      features: [
        "AI voice synthesis",
        "Screen recording",
        "Auto enhancement",
        "Multi-language support",
      ],
      customFields: [
        {
          key: "mode",
          label: "Mode",
          type: "select",
          options: ["AI Voiceover", "Screen Record", "Camera Record"],
        },
        {
          key: "voice_type",
          label: "Voice Type",
          type: "select",
          options: ["Male", "Female", "Child", "Elderly"],
        },
        {
          key: "accent",
          label: "Accent",
          type: "select",
          options: ["American", "British", "Australian", "Canadian"],
        },
      ],
    },
    {
      id: "smart-clips",
      title: "Smart Clips",
      description: "Create optimized short clips",
      detailedDescription:
        "Generate engaging short clips from longer content, optimized for social media with intelligent highlight detection.",
      icon: <Scissors className="w-6 h-6" />,
      emoji: "✂️",
      inputType: "file",
      acceptedFiles: "video/*",
      category: "editing",
      features: [
        "Highlight detection",
        "Social optimization",
        "Auto cropping",
        "Engagement analysis",
      ],
      customFields: [
        {
          key: "clip_length",
          label: "Clip Length",
          type: "select",
          options: ["15s", "30s", "60s", "90s"],
        },
        {
          key: "platform",
          label: "Platform",
          type: "select",
          options: ["TikTok", "Instagram", "YouTube", "General"],
        },
        {
          key: "highlight_type",
          label: "Focus",
          type: "select",
          options: ["Action", "Dialogue", "Music", "All"],
        },
      ],
    },
  ];

  // Load gallery from localStorage on component mount
  useEffect(() => {
    const savedGallery = localStorage.getItem("videoGallery");
    if (savedGallery) {
      try {
        const parsedGallery = JSON.parse(savedGallery).map((video: any) => ({
          ...video,
          createdAt: new Date(video.createdAt),
        }));
        setVideoGallery(parsedGallery);
      } catch (error) {
        console.error("Error loading gallery:", error);
      }
    }
  }, []);

  // Save gallery to localStorage whenever it changes
  useEffect(() => {
    if (videoGallery.length > 0) {
      localStorage.setItem("videoGallery", JSON.stringify(videoGallery));
    }
  }, [videoGallery]);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((feature) =>
        feature.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Tools" },
    { value: "creation", label: "Creation" },
    { value: "editing", label: "Editing" },
    { value: "conversion", label: "Conversion" },
  ];

  const videoStyles = [
    { value: "minimal", label: "Minimal & Clean" },
    { value: "dynamic", label: "Dynamic & Energetic" },
    { value: "professional", label: "Professional" },
    { value: "creative", label: "Creative & Artistic" },
    { value: "educational", label: "Educational" },
    { value: "storytelling", label: "Storytelling" },
  ];

  const sceneTypes = [
    {
      value: "talking-head",
      label: "Talking Head",
      description: "Person speaking with gestures and expressions",
    },
    {
      value: "product-demo",
      label: "Product Demo",
      description: "Showcase products with animated features",
    },
    {
      value: "nature",
      label: "Nature Scene",
      description: "Outdoor scenes with moving elements",
    },
    {
      value: "abstract",
      label: "Abstract",
      description: "Creative abstract visuals and patterns",
    },
    {
      value: "tutorial",
      label: "Tutorial",
      description: "Step-by-step instructional content",
    },
  ];

  const visualStyles = [
    {
      value: "realistic",
      label: "Realistic",
      description: "Photorealistic visuals with depth and lighting",
    },
    {
      value: "cartoon",
      label: "Cartoon",
      description: "Colorful, animated cartoon-style graphics",
    },
    {
      value: "sketch",
      label: "Sketch",
      description: "Hand-drawn, artistic sketch appearance",
    },
  ];

  const voiceTypes = [
    {
      value: "female",
      label: "Female Voice",
      description: "Natural female voice with clear pronunciation",
    },
    {
      value: "male",
      label: "Male Voice",
      description: "Professional male voice with deep tone",
    },
    {
      value: "child",
      label: "Child Voice",
      description: "Young, energetic voice for kid-friendly content",
    },
    {
      value: "robotic",
      label: "Robotic Voice",
      description: "Futuristic AI-style synthetic voice",
    },
  ];

  const handleGenerate = async () => {
    if (!inputValue.trim() && selectedTool !== "smart-record") return;

    setShowGenerationOverlay(true);
    setIsGenerating(true);
    setGenerationProgress(0);
    setShowPreview(false);
    setGeneratedVideo(null);
    setShowGeminiInsights(false);

    try {
      const progressSteps = [15, 30, 45, 60, 75, 90, 95];
      let currentStep = 0;

      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setGenerationProgress(progressSteps[currentStep]);
          currentStep++;
        }
      }, 1200);

      // Convert custom fields to object
      const customFieldsObj = customFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {} as Record<string, string>);

      let result: any;

      // Handle different tool types
      switch (selectedTool) {
        case "text-to-image":
          result = await generateImage({
            prompt: inputValue,
            style: customFieldsObj.art_style || "Photorealistic",
            aspectRatio: customFieldsObj.aspect_ratio || "1:1 Square",
            quality: customFieldsObj.quality || "High",
          });
          break;

        case "image-to-video":
          result = await convertImageToVideo({
            imageFile: inputValue, // This would be the uploaded file
            animationType: customFieldsObj.animation_type || "Zoom In",
            duration: customFieldsObj.video_duration || "5 seconds",
            speed: customFieldsObj.transition_speed || "Medium",
          });
          break;

        case "text-to-speech":
          result = await generateSpeech({
            text: inputValue,
            voice: customFieldsObj.voice_gender || "Female",
            accent: customFieldsObj.accent || "American",
            rate: customFieldsObj.speaking_rate || "Normal",
            pitch: customFieldsObj.pitch || "Normal",
          });
          break;

        case "text-to-thumbnail":
          result = await generateThumbnail({
            prompt: inputValue,
            style: customFieldsObj.thumbnail_style || "YouTube",
            colorScheme: customFieldsObj.color_scheme || "Bright & Bold",
            textOverlay: customFieldsObj.text_overlay || "",
          });
          break;

        default:
          // Original video generation
          result = await generateVideo({
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
            duration: videoLength,
          });
          break;
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setTimeout(() => {
        setGeneratedVideo(result);
        setIsGenerating(false);
        setShowPreview(true);
        setShowGenerationOverlay(false);

        // Add to gallery with proper categorization
        const mediaType = getMediaType(selectedTool ?? "");
        const storedMedia = {
          ...result,
          id: Date.now().toString(),
          createdAt: new Date(),
          tool: selectedTool || "text-to-video",
          mediaType,
          settings: {
            visualStyle,
            sceneType,
            voiceType: includeAudio ? voiceType : undefined,
            includeCaptions,
            includeAudio,
            videoLength,
            videoOrientation,
            customFields: customFieldsObj,
          },
        };

        setVideoGallery((prev) => [storedMedia, ...prev]);

        // Auto-redirect to gallery after 2 seconds
        setTimeout(() => {
          setCurrentView("gallery");
          setRightSidebarOpen(false);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
      setShowGenerationOverlay(false);
      alert("Generation failed. Please try again.");
    }
  };

  // Helper function to determine media type
  const getMediaType = (toolId: string) => {
    switch (toolId) {
      case "text-to-image":
      case "text-to-thumbnail":
        return "images";
      case "text-to-speech":
        return "audio";
      case "image-to-video":
      case "text-to-video":
      case "url-to-video":
      case "media-to-video":
      case "ai-voice-video":
      case "smart-clips":
        return "videos";
      default:
        return "videos";
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("Recording completed (0:45)");
      }, 3000);
    }
  };

  const addCustomField = () => {
    const currentTool = tools.find((t) => t.id === selectedTool);
    if (
      currentTool?.customFields &&
      customFields.length < currentTool.customFields.length
    ) {
      const availableFields = currentTool.customFields.filter(
        (field) => !customFields.some((cf) => cf.key === field.key)
      );
      if (availableFields.length > 0) {
        setCustomFields([
          ...customFields,
          { key: availableFields[0].key, value: "" },
        ]);
      }
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, value: string) => {
    const updated = [...customFields];
    updated[index].value = value;
    setCustomFields(updated);
  };

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
        );
      case "text":
        return (
          <Input
            placeholder={tool.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-white/50 border-slate-200/50 focus:border-cyan-400"
            disabled={isGenerating}
          />
        );
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
        );
      case "file":
        return (
          <div className="space-y-3">
            <Input
              type="file"
              accept={tool.acceptedFiles}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setInputValue(file.name);
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
        );
      case "record":
        return (
          <div className="space-y-4">
            <Button
              onClick={handleRecord}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full h-12 bg-white/50 border-slate-200/50"
              disabled={isGenerating}
            >
              <Mic
                className={`w-5 h-5 mr-2 ${isRecording ? "animate-pulse" : ""}`}
              />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            {inputValue && (
              <p className="text-sm text-green-600 flex items-center justify-center">
                <Video className="w-4 h-4 mr-2" />
                {inputValue}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const canGenerate = () => {
    if (selectedTool === "smart-record") {
      return inputValue && inputValue.includes("completed");
    }
    return inputValue && inputValue.trim().length > 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "creation":
        return "from-cyan-500 to-teal-500";
      case "editing":
        return "from-purple-500 to-pink-500";
      case "conversion":
        return "from-green-500 to-teal-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  // Gallery functions
  const filteredGalleryVideos = videoGallery.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(gallerySearchQuery.toLowerCase());
    const matchesFilter =
      galleryFilter === "all" || item.tool === galleryFilter;
    const matchesCategory =
      galleryCategory === "all" || item.mediaType === galleryCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const sortedGalleryVideos = [...filteredGalleryVideos].sort((a, b) => {
    switch (gallerySortBy) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const paginatedVideos = sortedGalleryVideos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );

  const totalPages = Math.ceil(sortedGalleryVideos.length / videosPerPage);

  const deleteVideo = (videoId: string) => {
    setVideoGallery((prev) => prev.filter((video) => video.id !== videoId));
    if (selectedGalleryVideo?.id === videoId) {
      setSelectedGalleryVideo(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const currentTool = tools.find((t) => t.id === selectedTool);
  const themeClass = darkMode ? "dark" : "";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClass}`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                {(selectedTool || currentView === "gallery") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentView === "gallery") {
                        setCurrentView("generator");
                        setSelectedGalleryVideo(null);
                      } else {
                        setSelectedTool(null);
                        setInputValue("");
                        setShowPreview(false);
                        setIsGenerating(false);
                        setGeneratedVideo(null);
                        setCustomFields([]);
                        setCustomPrompt("");
                        setShowGeminiInsights(false);
                        setRightSidebarOpen(false);
                      }
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
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  VideoAI
                </span>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by Gemini
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                {/* Gallery Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentView(
                      currentView === "gallery" ? "generator" : "gallery"
                    );
                    setSelectedGalleryVideo(null);
                  }}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  {currentView === "gallery"
                    ? "Generator"
                    : `Gallery (${videoGallery.length})`}
                </Button>

                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile sidebar overlay */}
        {selectedTool && sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Tools */}
        {selectedTool && currentView === "generator" && (
          <div
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 z-40 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "w-80" : "w-16"
            } overflow-hidden`}
          >
            {/* Sidebar Header with Expand/Collapse Button */}
            <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex items-center justify-between">
              {sidebarOpen && (
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white transition-opacity duration-200">
                  Quick Access Tools
                </h3>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors p-2 rounded-lg flex-shrink-0"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="p-3">
              {sidebarOpen ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Search */}
                  <div className="relative">
                    <Input
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-white/50 border-slate-200/50 text-sm"
                    />
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  </div>

                  {/* Category Filter */}
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="bg-white/50 border-slate-200/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tools List - Expanded */}
                  <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {filteredTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setSelectedTool(tool.id);
                          setInputValue("");
                          setShowPreview(false);
                          setIsGenerating(false);
                          setSelectedStyle("");
                          setGeneratedVideo(null);
                          setCustomFields([]);
                          setCustomPrompt("");
                          setShowGeminiInsights(false);
                        }}
                        disabled={isGenerating}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center space-x-3 text-left ${
                          tool.id === selectedTool
                            ? `bg-gradient-to-r ${getCategoryColor(
                                tool.category
                              )} text-white border-transparent shadow-md`
                            : "bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300"
                        } ${
                          isGenerating
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${getCategoryColor(
                            tool.category
                          )} rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                            tool.id === selectedTool ? "bg-white/20" : ""
                          }`}
                        >
                          {React.cloneElement(
                            tool.icon as React.ReactElement<{
                              className?: string;
                            }>,
                            { className: "w-4 h-4" }
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-sm font-medium truncate">
                              {tool.title}
                            </span>
                            <span className="text-sm">{tool.emoji}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              tool.id === selectedTool
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {tool.category}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Collapsed sidebar - show only icons */
                <div className="space-y-2 animate-in fade-in duration-200">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool.id);
                        setInputValue("");
                        setShowPreview(false);
                        setIsGenerating(false);
                        setSelectedStyle("");
                        setGeneratedVideo(null);
                        setCustomFields([]);
                        setCustomPrompt("");
                        setShowGeminiInsights(false);
                        setSidebarOpen(true); // Auto-expand when selecting a tool
                      }}
                      disabled={isGenerating}
                      className={`w-10 h-10 rounded-lg border transition-all duration-200 flex items-center justify-center mx-auto ${
                        tool.id === selectedTool
                          ? `bg-gradient-to-r ${getCategoryColor(
                              tool.category
                            )} text-white border-transparent shadow-md`
                          : "bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300"
                      } ${
                        isGenerating
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      title={tool.title}
                    >
                      {React.cloneElement(
                        tool.icon as React.ReactElement<{ className?: string }>,
                        {
                          className: "w-4 h-4",
                        }
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Sidebar - Output (only show when there's actual output AND it should be visible) */}
        {currentView === "generator" &&
          (generatedVideo || rightSidebarOpen) && (
            <div
              className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-700/50 z-40 transition-all duration-300 ease-in-out ${
                rightSidebarOpen && generatedVideo ? "w-96" : "w-16"
              } overflow-hidden`}
            >
              {/* Right Sidebar Header */}
              <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex items-center justify-between">
                {rightSidebarOpen && (
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white transition-opacity duration-200">
                    Generated Output
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors p-2 rounded-lg flex-shrink-0"
                  title={rightSidebarOpen ? "Collapse output" : "Expand output"}
                >
                  {rightSidebarOpen ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Right Sidebar Content */}
              <div className="p-3 overflow-y-auto">
                {rightSidebarOpen && generatedVideo ? (
                  // Show full content only when expanded AND there's a video
                  <div className="animate-in fade-in duration-200">
                    {generatedVideo ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                              🎉 Video Ready!
                              {generatedVideo.hasAudio && (
                                <Badge className="ml-2 bg-green-500 text-white">
                                  <Volume2 className="w-3 h-3 mr-1" />
                                  Audio
                                </Badge>
                              )}
                            </h3>
                            {generatedVideo.geminiInsights && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowGeminiInsights(!showGeminiInsights)
                                }
                                className="text-xs"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                {showGeminiInsights ? "Hide" : "Show"} Insights
                              </Button>
                            )}
                          </div>

                          {/* Video Player */}
                          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[9/16] shadow-2xl mb-4">
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
                              <source
                                src={generatedVideo.videoUrl}
                                type="video/webm"
                              />
                              <source
                                src={generatedVideo.audioUrl}
                                type="audio/wav"
                              />
                              Your browser does not support the video tag.
                            </video>
                          </div>

                          {/* Video Info */}
                          <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                              {generatedVideo.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Duration: {generatedVideo.duration} • Style:{" "}
                              {visualStyle}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = generatedVideo.videoUrl;
                                link.download = `${generatedVideo.title
                                  .replace(/[^a-z0-9]/gi, "_")
                                  .toLowerCase()}.webm`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              className={`flex-1 bg-gradient-to-r ${getCategoryColor(
                                currentTool?.category || "creation"
                              )} hover:opacity-90 text-white border-0`}
                              // Replace the share button onClick handlers with this improved version
                              onClick={async () => {
                                try {
                                  // Check if Web Share API is supported and available
                                  if (navigator.share && navigator.canShare) {
                                    const shareData = {
                                      title: generatedVideo.title,
                                      text: `Check out this AI-generated video!`,
                                      url: window.location.href,
                                    };

                                    // Check if the data can be shared
                                    if (navigator.canShare(shareData)) {
                                      await navigator.share(shareData);
                                    } else {
                                      // Fallback to clipboard
                                      await navigator.clipboard.writeText(
                                        window.location.href
                                      );
                                      alert("Link copied to clipboard!");
                                    }
                                  } else {
                                    // Fallback to clipboard for browsers without Web Share API
                                    await navigator.clipboard.writeText(
                                      window.location.href
                                    );
                                    alert("Link copied to clipboard!");
                                  }
                                } catch (error) {
                                  // Handle any errors (user cancelled, permission denied, etc.)
                                  if (
                                    error instanceof Error &&
                                    error.name !== "AbortError"
                                  ) {
                                    // Only show error if it's not user cancellation
                                    try {
                                      await navigator.clipboard.writeText(
                                        window.location.href
                                      );
                                      alert("Link copied to clipboard!");
                                    } catch (clipboardError) {
                                      // Final fallback - show the URL
                                      prompt(
                                        "Copy this link:",
                                        window.location.href
                                      );
                                    }
                                  }
                                }
                              }}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                          Generated videos will appear here
                        </p>
                      </div>
                    )}
                  </div>
                ) : generatedVideo ? (
                  // Show collapsed state only when there's a video but sidebar is collapsed
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Video className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

        {/* Main Content Area */}
        <div
          className={`transition-all duration-300 ${
            currentView === "generator" && selectedTool && sidebarOpen
              ? "lg:ml-80"
              : currentView === "generator" && selectedTool
              ? "lg:ml-16"
              : ""
          }${
            // Only add right margin when right sidebar is actually open, not just when preview exists
            currentView === "generator" && rightSidebarOpen ? " lg:mr-96" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {currentView === "gallery" ? (
              // Gallery View
              <div className="space-y-6">
                {/* Gallery Header */}
                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                    Video
                    <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                      {" "}
                      Gallery
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-6">
                    Browse and manage all your AI-generated videos. Download,
                    share, or re-watch your creations anytime.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <Grid3X3 className="w-4 h-4" />
                    <span>{videoGallery.length} videos in your collection</span>
                  </div>
                </div>

                {/* Gallery Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Input
                        placeholder="Search content..."
                        value={gallerySearchQuery}
                        onChange={(e) => setGallerySearchQuery(e.target.value)}
                        className="pl-8 bg-white/50 border-slate-200/50"
                      />
                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                    </div>

                    {/* Category Filter */}
                    <Select
                      value={galleryCategory}
                      onValueChange={(value: any) => setGalleryCategory(value)}
                    >
                      <SelectTrigger className="w-48 bg-white/50 border-slate-200/50">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Media</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="videos">Videos</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Tool Filter */}
                    <Select
                      value={galleryFilter}
                      onValueChange={setGalleryFilter}
                    >
                      <SelectTrigger className="w-48 bg-white/50 border-slate-200/50">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tools</SelectItem>
                        {tools.map((tool) => (
                          <SelectItem key={tool.id} value={tool.id}>
                            {tool.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select
                      value={gallerySortBy}
                      onValueChange={(value: any) => setGallerySortBy(value)}
                    >
                      <SelectTrigger className="w-48 bg-white/50 border-slate-200/50">
                        <SortDesc className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">By Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Gallery Grid */}
                {paginatedVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedVideos.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="relative">
                          {/* Media Thumbnail */}
                          <div className="relative aspect-[9/16] bg-slate-900 rounded-t-lg overflow-hidden">
                            {item.mediaType === "images" ? (
                              <img
                                src={
                                  item.imageUrl ||
                                  item.thumbnail ||
                                  "/placeholder.svg"
                                }
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : item.mediaType === "audio" ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                                <Volume2 className="w-16 h-16 text-white" />
                              </div>
                            ) : (
                              <img
                                src={item.thumbnail || "/placeholder.svg"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <Button
                                size="sm"
                                className="bg-white/90 text-slate-900 hover:bg-white"
                                onClick={() => setSelectedGalleryVideo(item)}
                              >
                                {item.mediaType === "audio" ? (
                                  <>
                                    <Volume2 className="w-4 h-4 mr-2" />
                                    Play
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Preview
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Media Type Badge */}
                            <Badge className="absolute top-2 right-2 bg-black/70 text-white capitalize">
                              {item.mediaType?.slice(0, -1) || "video"}
                            </Badge>

                            {/* Duration/Info Badge */}
                            {item.duration && (
                              <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                                {item.duration}
                              </Badge>
                            )}

                            {/* Audio Badge for videos */}
                            {item.hasAudio && item.mediaType === "videos" && (
                              <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
                                <Volume2 className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>

                          {/* Media Info */}
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 flex-1">
                                {item.title}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-red-500 p-1 ml-2"
                                onClick={() => deleteVideo(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(item.createdAt)}
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-slate-100 dark:bg-slate-700"
                                >
                                  {tools.find((t) => t.id === item.tool)
                                    ?.title || item.tool}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-slate-100 dark:bg-slate-700 capitalize"
                                >
                                  {item.mediaType?.slice(0, -1) || "video"}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => {
                                  const mediaUrl =
                                    item.videoUrl ||
                                    item.imageUrl ||
                                    item.audioUrl;

                                  if (!mediaUrl) {
                                    console.error(
                                      "No media URL available to download."
                                    );
                                    return;
                                  }
                                  const link = document.createElement("a");
                                  link.href = mediaUrl;

                                  const extension =
                                    item.mediaType === "images"
                                      ? ".png"
                                      : item.mediaType === "audio"
                                      ? ".wav"
                                      : ".webm";
                                  link.download = `${item.title
                                    .replace(/[^a-z0-9]/gi, "_")
                                    .toLowerCase()}${extension}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent"
                                // Replace the share button onClick handlers with this improved version
                                onClick={async () => {
                                  try {
                                    if (navigator.share && navigator.canShare) {
                                      const shareData = {
                                        title: item.title,
                                        text: `Check out this AI-generated ${item.mediaType?.slice(
                                          0,
                                          -1
                                        )}!`,
                                        url: window.location.href,
                                      };

                                      if (navigator.canShare(shareData)) {
                                        await navigator.share(shareData);
                                      } else {
                                        await navigator.clipboard.writeText(
                                          window.location.href
                                        );
                                        alert("Link copied to clipboard!");
                                      }
                                    } else {
                                      await navigator.clipboard.writeText(
                                        window.location.href
                                      );
                                      alert("Link copied to clipboard!");
                                    }
                                  } catch (error) {
                                    if (
                                      error instanceof Error &&
                                      error.name !== "AbortError"
                                    ) {
                                      try {
                                        await navigator.clipboard.writeText(
                                          window.location.href
                                        );
                                        alert("Link copied to clipboard!");
                                      } catch (clipboardError) {
                                        prompt(
                                          "Copy this link:",
                                          window.location.href
                                        );
                                      }
                                    }
                                  }
                                }}
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No videos found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {videoGallery.length === 0
                        ? "Start creating videos to build your gallery"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                    {videoGallery.length === 0 && (
                      <Button
                        onClick={() => setCurrentView("generator")}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Your First Video
                      </Button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : !selectedTool ? (
              // Tool Selection Screen
              <>
                <div className="text-center mb-6">
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                    Choose Your AI
                    <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                      {" "}
                      Video Tool
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
                    Select from our comprehensive collection of AI-powered video
                    creation tools. Each tool is designed for specific use cases
                    and optimized for the best results.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <Brain className="w-4 h-4" />
                    <span>
                      Enhanced with Google Gemini AI for intelligent content
                      generation
                    </span>
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
                              className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(
                                tool.category
                              )} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
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
                        <CardTitle className="text-xl text-slate-900 dark:text-white">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {tool.features.slice(0, 3).map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                            >
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
              // Tool Interface - Keep original full-screen layout
              <div className="space-y-4">
                {/* Tool Header - keep same */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(
                        currentTool?.category ?? ""
                      )} rounded-2xl flex items-center justify-center text-white`}
                    >
                      {currentTool?.icon}
                    </div>
                    <span className="text-4xl">{currentTool?.emoji}</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm">
                      <Brain className="w-4 h-4 mr-2" />
                      Gemini AI Enhanced
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentTool?.title}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    {currentTool?.detailedDescription ?? ""}
                  </p>
                </div>

                {/* Features - keep same */}
                <div className="flex flex-wrap justify-center gap-2">
                  {currentTool?.features.map((feature, index) => (
                    <Badge
                      key={index}
                      className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Main Tool Interface - Keep original full-width layout */}
                <div className="max-w-4xl mx-auto">
                  <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                    <CardContent className="p-4 sm:p-6">
                      {/* Gemini AI Notice */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                              Powered by Gemini AI
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Advanced content analysis, intelligent scene
                              generation, and smart optimization
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left Column */}
                        <div className="space-y-3 sm:space-y-4">
                          {/* Primary Input */}
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                              <Settings className="w-4 h-4 mr-2" />
                              {currentTool?.inputType === "file"
                                ? "Upload File"
                                : "Primary Input"}
                            </Label>
                            {currentTool && renderInput(currentTool)}
                          </div>

                          {/* Custom Prompt - Full Width on mobile, spans both columns on desktop */}
                          <div className="xl:col-span-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                              <Brain className="w-4 h-4 mr-2" />
                              Custom Prompt for Gemini AI
                            </Label>
                            <Textarea
                              placeholder="Add specific instructions for Gemini AI to enhance your video generation. Describe the mood, style, specific elements, or any creative direction you want to include..."
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              className="bg-white/50 border-slate-200/50 focus:border-cyan-400 focus:ring-cyan-400/20 text-sm min-h-[80px] sm:min-h-[100px] w-full"
                              disabled={isGenerating}
                              rows={3}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Optional: Provide detailed instructions to help
                              Gemini AI create exactly what you envision
                            </p>
                          </div>

                          {/* Visual Style Selection */}
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                              <Palette className="w-4 h-4 mr-2" />
                              Visual Style
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                              {visualStyles.map((style) => (
                                <button
                                  key={style.value}
                                  onClick={() =>
                                    setVisualStyle(
                                      style.value as
                                        | "realistic"
                                        | "cartoon"
                                        | "sketch"
                                    )
                                  }
                                  disabled={isGenerating}
                                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm ${
                                    visualStyle === style.value
                                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                  } ${
                                    isGenerating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                    {style.label}
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {style.description}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Content Style */}
                          {(currentTool?.inputType === "textarea" ||
                            currentTool?.inputType === "text") && (
                            <div>
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Content Style (Optional)
                              </Label>
                              <Select
                                value={selectedStyle}
                                onValueChange={setSelectedStyle}
                                disabled={isGenerating}
                              >
                                <SelectTrigger className="bg-white/50 border-slate-200/50 focus:border-cyan-400 text-sm">
                                  <SelectValue placeholder="Choose a style" />
                                </SelectTrigger>
                                <SelectContent>
                                  {videoStyles.map((style) => (
                                    <SelectItem
                                      key={style.value}
                                      value={style.value}
                                    >
                                      {style.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Video Format Section */}
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-200/50 dark:border-slate-600/50">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                              <Video className="w-4 h-4 mr-2" />
                              Video Format
                            </h3>

                            {/* Video Length Selection */}
                            <div className="mb-4">
                              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                Duration
                              </Label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[15, 30, 45, 60].map((length) => (
                                  <button
                                    key={length}
                                    onClick={() =>
                                      setVideoLength(
                                        length as 15 | 30 | 45 | 60
                                      )
                                    }
                                    disabled={isGenerating}
                                    className={`p-2 rounded-lg border-2 transition-all duration-200 text-center text-sm ${
                                      videoLength === length
                                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300"
                                    } ${
                                      isGenerating
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    <div className="font-semibold text-xs sm:text-sm">
                                      {length}s
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                                      {length === 15 && "Quick"}
                                      {length === 30 && "Standard"}
                                      {length === 45 && "Extended"}
                                      {length === 60 && "Long"}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Video Orientation Selection */}
                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                Orientation
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() =>
                                    setVideoOrientation("portrait")
                                  }
                                  disabled={isGenerating}
                                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                                    videoOrientation === "portrait"
                                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300"
                                  } ${
                                    isGenerating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <div className="flex flex-col items-center space-y-1">
                                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <div className="font-semibold text-xs sm:text-sm">
                                      Portrait
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      9:16
                                    </div>
                                  </div>
                                </button>
                                <button
                                  onClick={() =>
                                    setVideoOrientation("landscape")
                                  }
                                  disabled={isGenerating}
                                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                                    videoOrientation === "landscape"
                                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300"
                                  } ${
                                    isGenerating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <div className="flex flex-col items-center space-y-1">
                                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <div className="font-semibold text-xs sm:text-sm">
                                      Landscape
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      16:9
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3 sm:space-y-4">
                          {/* Scene Type Selection */}
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                              <Video className="w-4 h-4 mr-2" />
                              Scene Type
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                              {sceneTypes.map((scene) => (
                                <button
                                  key={scene.value}
                                  onClick={() =>
                                    setSceneType(scene.value as any)
                                  }
                                  disabled={isGenerating}
                                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm ${
                                    sceneType === scene.value
                                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                  } ${
                                    isGenerating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                    {scene.label}
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {scene.description}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Audio & Caption Settings */}
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-200/50 dark:border-slate-600/50">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                              <Settings className="w-4 h-4 mr-2" />
                              Media Settings
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Caption Settings */}
                              <div>
                                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                  Captions
                                </Label>
                                <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                  <Switch
                                    checked={includeCaptions}
                                    onCheckedChange={setIncludeCaptions}
                                    disabled={isGenerating}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      Include
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      AI-timed
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Audio Settings */}
                              <div>
                                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                                  Audio
                                </Label>
                                <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                  <Switch
                                    checked={includeAudio}
                                    onCheckedChange={setIncludeAudio}
                                    disabled={isGenerating}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      Include
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      AI voiceover
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Voice Type Selection */}
                          {includeAudio && (
                            <div>
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                <Mic className="w-4 h-4 mr-2" />
                                Voice Type
                              </Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {voiceTypes.map((voice) => (
                                  <button
                                    key={voice.value}
                                    onClick={() =>
                                      setVoiceType(voice.value as any)
                                    }
                                    disabled={isGenerating}
                                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm ${
                                      voiceType === voice.value
                                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                    } ${
                                      isGenerating
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                      {voice.label}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      {voice.description}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {currentTool?.customFields &&
                        currentTool.customFields.length > 0 && (
                          <div className="mt-4 sm:mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Custom Fields
                              </Label>
                              {customFields.length <
                                currentTool.customFields.length && (
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {customFields.map((field, index) => {
                                const fieldDef = currentTool.customFields?.find(
                                  (f) => f.key === field.key
                                );
                                if (!fieldDef) return null;

                                return (
                                  <div key={index} className="relative">
                                    <div className="pr-8">
                                      <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                                        {fieldDef.label}
                                      </Label>
                                      {fieldDef.type === "select" ? (
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) =>
                                            updateCustomField(index, value)
                                          }
                                          disabled={isGenerating}
                                        >
                                          <SelectTrigger className="bg-white/50 border-slate-200/50 text-sm">
                                            <SelectValue
                                              placeholder={`Select ${fieldDef.label.toLowerCase()}`}
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {fieldDef.options?.map((option) => (
                                              <SelectItem
                                                key={option}
                                                value={option}
                                              >
                                                {option}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : fieldDef.type === "textarea" ? (
                                        <Textarea
                                          placeholder={fieldDef.placeholder}
                                          value={field.value}
                                          onChange={(e) =>
                                            updateCustomField(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="bg-white/50 border-slate-200/50 text-sm"
                                          disabled={isGenerating}
                                          rows={2}
                                        />
                                      ) : (
                                        <Input
                                          placeholder={fieldDef.placeholder}
                                          value={field.value}
                                          onChange={(e) =>
                                            updateCustomField(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="bg-white/50 border-slate-200/50 text-sm"
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
                                      className="absolute top-6 right-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      <Separator className="my-4 sm:my-6" />

                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate() || isGenerating}
                        className={`w-full bg-gradient-to-r ${getCategoryColor(
                          currentTool?.category ?? ""
                        )} hover:opacity-90 text-white border-0 h-12 text-lg`}
                      >
                        {isGenerating ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-pulse" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Video
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Video Preview Modal */}
        {selectedGalleryVideo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedGalleryVideo.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGalleryVideo(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Media Player */}
              <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[9/16] max-h-96 mx-auto mb-4">
                {selectedGalleryVideo.mediaType === "images" ? (
                  <img
                    src={
                      selectedGalleryVideo.imageUrl ||
                      selectedGalleryVideo.thumbnail
                    }
                    alt={selectedGalleryVideo.title}
                    className="w-full h-full object-cover"
                  />
                ) : selectedGalleryVideo.mediaType === "audio" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-8">
                    <Volume2 className="w-16 h-16 text-white mb-4" />
                    <audio
                      controls
                      className="w-full max-w-sm"
                      preload="metadata"
                    >
                      <source
                        src={selectedGalleryVideo.audioUrl}
                        type="audio/wav"
                      />
                      Your browser does not support the audio element.
                    </audio>
                    {selectedGalleryVideo.waveformUrl && (
                      <img
                        src={
                          selectedGalleryVideo.waveformUrl || "/placeholder.svg"
                        }
                        alt="Audio waveform"
                        className="w-full max-w-sm mt-4 rounded-lg"
                      />
                    )}
                  </div>
                ) : (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster={selectedGalleryVideo.thumbnail}
                    preload="metadata"
                    autoPlay={false}
                    muted={false}
                    loop
                  >
                    <source
                      src={selectedGalleryVideo.videoUrl}
                      type="video/webm"
                    />
                    <source
                      src={selectedGalleryVideo.audioUrl}
                      type="audio/wav"
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Media Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Created:
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(selectedGalleryVideo.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Type:
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white capitalize">
                      {selectedGalleryVideo.mediaType?.slice(0, -1) || "Video"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Tool:
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {tools.find((t) => t.id === selectedGalleryVideo.tool)
                        ?.title || selectedGalleryVideo.tool}
                    </p>
                  </div>
                  {selectedGalleryVideo.duration && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Duration:
                      </span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedGalleryVideo.duration}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => {
                      const mediaUrl =
                        selectedGalleryVideo.videoUrl ||
                        selectedGalleryVideo.imageUrl ||
                        selectedGalleryVideo.audioUrl;

                      if (!mediaUrl) {
                        console.error("No media URL available to download.");
                        return;
                      }
                      const link = document.createElement("a");
                      link.href = mediaUrl;

                      const extension =
                        selectedGalleryVideo.mediaType === "images"
                          ? ".png"
                          : selectedGalleryVideo.mediaType === "audio"
                          ? ".wav"
                          : ".webm";
                      link.download = `${selectedGalleryVideo.title
                        .replace(/[^a-z0-9]/gi, "_")
                        .toLowerCase()}${extension}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white border-0"
                    // Replace the share button onClick handlers with this improved version
                    onClick={async () => {
                      try {
                        if (navigator.share && navigator.canShare) {
                          const shareData = {
                            title: selectedGalleryVideo.title,
                            text: `Check out this AI-generated ${selectedGalleryVideo.mediaType?.slice(
                              0,
                              -1
                            )}!`,
                            url: window.location.href,
                          };

                          if (navigator.canShare(shareData)) {
                            await navigator.share(shareData);
                          } else {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                            alert("Link copied to clipboard!");
                          }
                        } else {
                          await navigator.clipboard.writeText(
                            window.location.href
                          );
                          alert("Link copied to clipboard!");
                        }
                      } catch (error) {
                        if (
                          error instanceof Error &&
                          error.name !== "AbortError"
                        ) {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                            alert("Link copied to clipboard!");
                          } catch (clipboardError) {
                            prompt("Copy this link:", window.location.href);
                          }
                        }
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      deleteVideo(selectedGalleryVideo.id);
                      setSelectedGalleryVideo(null);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Generation Modal */}
        {showGenerationOverlay && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Gemini AI is Creating Your Video
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Generating {visualStyle} style video with{" "}
                  {sceneType.replace("-", " ")} scene
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Progress</span>
                  <span className="font-mono">
                    {Math.round(generationProgress)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 min-h-[2.5rem] flex items-center justify-center">
                  {generationProgress < 20 && (
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      "Gemini AI analyzing your content and generating scene
                      plan..."
                    </div>
                  )}
                  {generationProgress >= 20 && generationProgress < 35 && (
                    <div className="flex items-center">
                      <Palette className="w-4 h-4 mr-2 animate-bounce" />
                      `Creating ${visualStyle} visual elements with AI-optimized
                      colors...`
                    </div>
                  )}
                  {generationProgress >= 35 && generationProgress < 50 && (
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2 animate-pulse" />
                      "Generating intelligent scene transitions and camera
                      movements..."
                    </div>
                  )}
                  {generationProgress >= 50 && generationProgress < 65 && (
                    <div className="flex items-center">
                      <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                      `$
                      {includeAudio
                        ? `Creating ${voiceType} AI voiceover with`
                        : "Adding"}{" "}
                      smart audio timing...`
                    </div>
                  )}
                  {generationProgress >= 65 && generationProgress < 80 && (
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      "Applying Gemini's visual effects and custom field
                      integration..."
                    </div>
                  )}
                  {generationProgress >= 80 && generationProgress < 95 && (
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 animate-bounce" />
                      `$
                      {includeCaptions
                        ? "Generating AI-timed captions and"
                        : "Adding"}{" "}
                      final optimizations...`
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
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Style
                    </div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {visualStyle}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Scene
                    </div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {sceneType.replace("-", " ")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Length
                    </div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {videoLength} sec
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Format
                    </div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {videoOrientation}
                    </div>
                  </div>
                  {includeAudio && (
                    <div className="text-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Voice
                      </div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {voiceType} AI
                      </div>
                    </div>
                  )}
                  {includeCaptions && (
                    <div className="text-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Captions
                      </div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        AI Timed
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerationOverlay(false);
                  setIsGenerating(false);
                }}
                className="mt-6 w-full"
              >
                Cancel Generation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
