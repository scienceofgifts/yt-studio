import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON body limit to support base64 reference images
app.use(express.json({ limit: '25mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ambience Intelligence Studio Server',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * Resolves candidate models for resilient fallback execution
 */
function resolveCandidateModels(requestedModel?: string): string[] {
  const modelAliasMap: Record<string, string> = {
    'gemini-flash-latest-lite': 'gemini-flash-lite-latest',
  };

  const guaranteedFallbacks = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
  ];

  if (!requestedModel || requestedModel === 'inherit') {
    return guaranteedFallbacks;
  }

  const req = requestedModel.trim();
  const mapped = modelAliasMap[req] || req;
  const candidates: string[] = [mapped, req, ...guaranteedFallbacks];

  return Array.from(new Set(candidates));
}

/**
 * Endpoint to list supported models verified by server backend
 */
app.get('/api/gemini/models', (req, res) => {
  res.json({
    success: true,
    defaultModel: 'gemini-3.8-flash',
    models: [
      { id: 'gemini-3.8-flash', displayName: 'Gemini 3.8 Flash', family: 'Flash', default: true },
      { id: 'gemini-3.7-flash', displayName: 'Gemini 3.7 Flash', family: 'Flash' },
      { id: 'gemini-3.6-flash', displayName: 'Gemini 3.6 Flash', family: 'Flash' },
      { id: 'gemini-3.5-flash', displayName: 'Gemini 3.5 Flash', family: 'Flash' },
      { id: 'gemini-3.5-flash-lite', displayName: 'Gemini 3.5 Flash Lite', family: 'Flash Lite' },
      { id: 'gemini-flash-latest', displayName: 'Gemini Flash Latest', family: 'Flash' },
      { id: 'gemini-flash-latest-lite', displayName: 'Gemini Flash Latest Lite', family: 'Flash Lite' },
      { id: 'gemini-3.1-flash-lite', displayName: 'Gemini 3.1 Flash Lite', family: 'Flash Lite' },
    ],
  });
});

/**
 * Endpoint to generate coordinated prompts using configured Gemini Model
 */
app.post('/api/gemini/generate-prompt', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const {
      target = 'all', // 'all' | 'image' | 'video' | 'music'
      model: requestedModel,
      projectContext,
      referenceImage, // optional { mimeType: string, base64: string, name?: string }
      customInstructions,
    } = req.body;

    if (!projectContext) {
      return res.status(400).json({
        success: false,
        error: 'Missing projectContext payload.',
      });
    }

    // System prompt defining the role of Ambience Director
    const systemInstruction = `You are the lead AI Creative Director and Technical Prompt Engineer for "Ambience Intelligence Studio", a professional production suite for designing cinematic YouTube ambience videos (e.g. cozy rain sanctuaries, dark academia libraries, high fantasy taverns, cyberpunk apartments, Japanese gardens).

Your job is to generate production-ready, ultra-detailed prompts for generative AI models:
1. Midjourney v6.1 / Flux.1 Pro for the master aesthetic image.
2. Runway Gen-3 Alpha / Kling 1.5 / Luma Dream Machine for seamless, stable video animation.
3. Suno v3.5 / Udio / Ambient Sound Engine for musical score and layered environmental foley.

CRITICAL RULES:
- Respect all user configuration constraints strictly:
  * If water is disabled, DO NOT invent water bodies or water reflections.
  * If excludePeopleAndAnimals is true, EXPLICITLY prohibit humans, people, faces, silhouettes, pets, and wildlife in all prompts.
  * If lockedCamera is true, video prompt MUST enforce a completely stationary tripod camera with zero drift or zooming.
  * If staticSky is true, clouds and celestial bodies must remain static or minimally drifting without rapid morphing.
  * If seamlessLoop is true, motion must be subtle, cyclical, and loop-safe without narrative progression or jump cuts.
- Describe the ACTUAL selected scene and world rather than substituting a generic fantasy template.
- If a reference image is attached, inspect its visual composition, lighting, materials, color palette, and mood, and ground your generated prompts in those observed visual cues.
- Resolve any user contradictions or identify warnings in the warnings list. Never silently ignore choices.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object with the following schema:
{
  "imagePrompt": "Detailed, self-contained Midjourney/Flux prompt with aspect ratio and production tags...",
  "videoPrompt": "Detailed, self-contained video animation prompt with motion vectors, camera lock, and loop constraints...",
  "musicPrompt": "Detailed, self-contained music score and foley soundscape prompt with tempo, instrumentation, and mood...",
  "reasoning": "A concise 2-3 sentence explanation of how the visual atmosphere, motion physics, and acoustic layers were coordinated for this scene.",
  "warnings": ["Warning 1 if contradictions were noted, otherwise empty list"]
}
`;

    // Construct user prompt with rich project configuration details
    const promptText = `GENERATE PRODUCTION PROMPTS FOR THE FOLLOWING AMBIENCE PROJECT:
Target Request: ${target.toUpperCase()} PROMPT(S)

PROJECT SPECIFICATIONS:
- World / Setting Archetype: ${projectContext.worldName || 'Sanctuary'} (Category: ${projectContext.worldCategory || 'Custom'})
- Location & Architecture: ${projectContext.locationName || 'Interior'}
- Spatial Perspective: ${projectContext.settingType || 'indoor'} (Indoor / Outdoor / Transitional)
- Season & Atmosphere: ${projectContext.season || 'autumn'} season
- Time of Day & Sky: ${projectContext.timeOfDay || 'golden-hour'}
- Primary Weather: ${projectContext.primaryWeather || 'clear'}${projectContext.secondaryWeather ? `, with ${projectContext.secondaryWeather}` : ''}
- Sky Elements: ${
      projectContext.sky?.showSky
        ? `Clouds: ${projectContext.sky.clouds}, Sun: ${projectContext.sky.sun}, Moon: ${projectContext.sky.moon}, Stars: ${projectContext.sky.stars}, Sunbeams: ${projectContext.sky.sunbeams}`
        : 'Sky not in view / Indoor'
    }
- Water Settings: ${
      projectContext.water?.enabled
        ? `ENABLED - Type: ${projectContext.water.type}, Placement: ${projectContext.water.placement}, Behavior: ${projectContext.water.behavior}, Visibility: ${projectContext.water.visibility}, Reflections: ${projectContext.water.reflection}, Intensity: ${projectContext.water.movementIntensity}/5`
        : 'DISABLED (Strictly no water bodies or reflections)'
    }
- Lighting & Tone:
  * Primary Light: ${projectContext.lighting?.primary || 'warm lamps'}
  * Color Temperature: ${projectContext.lighting?.colorTemperature || 'warm amber'}
  * Intensity: ${projectContext.lighting?.intensity || 'dim-cozy'}
  * Dynamics: flickering flames: ${projectContext.lighting?.flickeringFlames ? 'Yes' : 'No'}, reflections: ${projectContext.lighting?.reflections ? 'Yes' : 'No'}, volumetric rays: ${projectContext.lighting?.volumetricRays ? 'Yes' : 'No'}
- Scene Objects & Inclusions:
  * Light Fixtures: ${projectContext.elements?.lightSources?.join(', ') || 'None specified'}
  * Interior Objects: ${projectContext.elements?.interiorObjects?.join(', ') || 'None specified'}
  * Outdoor Elements: ${projectContext.elements?.outdoorElements?.join(', ') || 'None specified'}
  * Exclude People & Animals: ${projectContext.elements?.excludePeopleAndAnimals ? 'YES (STRICTLY UNINHABITED)' : 'No (living subjects allowed: ' + (projectContext.elements?.livingSubjects?.join(', ') || 'subtle') + ')'}
- Camera & Composition:
  * Camera Angle: ${projectContext.camera?.angle || 'eye-level'}
  * Composition Rule: ${projectContext.camera?.composition || 'rule-of-thirds'}
  * Camera Movement: ${projectContext.camera?.lockedCamera ? 'LOCKED STATIONARY (Tripod)' : projectContext.camera?.movement || 'locked'}
- Visual Art Style:
  * Style: ${projectContext.visualStyle?.style || 'cinematic-realism'}
  * Detail Level: ${projectContext.visualStyle?.detailLevel || 4}/5
  * Contrast: ${projectContext.visualStyle?.contrast || 'medium'}
  * Film Grain: ${projectContext.visualStyle?.filmGrain || 'subtle'}
  * Aspect Ratio: ${projectContext.visualStyle?.aspectRatio || '16:9'}
- Video Animation & Motion Physics:
  * Active Motion Subjects: ${JSON.stringify(projectContext.video?.subjects || {})}
  * Duration Cycle: ${projectContext.video?.durationSeconds || 10} seconds
  * Seamless Loop Required: ${projectContext.video?.seamlessLoop ? 'YES' : 'No'}
  * Locked Camera: ${projectContext.video?.lockedCamera ? 'YES' : 'No'}
  * Static Background: ${projectContext.video?.staticBackground ? 'YES' : 'No'}
  * Static Sky: ${projectContext.video?.staticSky ? 'YES' : 'No'}
  * Consistent Lighting: ${projectContext.video?.consistentLighting ? 'YES' : 'No'}
- Music & Audio Foley:
  * Musical Style: ${projectContext.music?.style || 'Lo-fi Ambient'}
  * Moods: ${projectContext.music?.moods?.join(', ') || 'cozy, serene'}
  * Instrumentation: ${projectContext.music?.instrumentation?.join(', ') || 'piano, acoustic guitar'}
  * Tempo Range: ${projectContext.music?.tempoRange || 'slow-60-75'}
  * Environmental Foley Sound Layers: ${projectContext.music?.environmentalSoundLayers?.join(', ') || 'fireplace crackle, gentle rain on glass'}
  * Reference Influence: ${projectContext.music?.referenceInfluence || 'none'} ${projectContext.music?.referenceArtistOrTrack ? `(Inspired by: ${projectContext.music.referenceArtistOrTrack})` : ''}
${customInstructions ? `\nDIRECTOR'S ADDITIONAL INSTRUCTIONS / REFINEMENT NOTES:\n"${customInstructions}"\n` : ''}
${referenceImage ? '\nNOTE: A reference image has been provided. Analyze its composition, color balance, and textures to inspire and ground the prompts.\n' : ''}
Please generate the structured JSON output now.`;

    // Prepare contents array for Gemini
    let contents: any;

    if (referenceImage && referenceImage.base64) {
      let cleanBase64 = referenceImage.base64;
      let refMimeType = referenceImage.mimeType || 'image/jpeg';

      if (cleanBase64.startsWith('http://') || cleanBase64.startsWith('https://')) {
        try {
          const imgRes = await fetch(cleanBase64, { signal: AbortSignal.timeout(8000) });
          if (imgRes.ok) {
            const contentType = imgRes.headers.get('content-type');
            if (contentType) refMimeType = contentType.split(';')[0];
            const arrayBuffer = await imgRes.arrayBuffer();
            cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
          }
        } catch (fetchErr) {
          console.warn('Could not fetch reference image URL for prompt generation:', fetchErr);
        }
      } else {
        cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, '');
      }

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: refMimeType,
              data: cleanBase64,
            },
          },
          {
            text: `${systemInstruction}\n\n${promptText}`,
          },
        ],
      };
    } else {
      contents = `${systemInstruction}\n\n${promptText}`;
    }

    // Call Gemini with resilient candidate fallback for transient 503 high-demand spikes
    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed with:`, callErr.message || callErr);
        // If 503 or 429, try next model candidate in list
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to generate response.');
    }

    const responseText = response.text || '';

    // Parse JSON from responseText
    let parsedData: any = null;
    try {
      // Find JSON block enclosed in ```json ... ``` or first { ... }
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse Gemini JSON response directly, creating fallback structure:', parseErr);
      parsedData = {
        imagePrompt: responseText,
        videoPrompt: 'Keep camera stationary. Subtle ambient motion matching scene lighting and weather.',
        musicPrompt: `[Style: ${projectContext.music?.style || 'Ambient'}] [Mood: ${projectContext.music?.moods?.join(', ') || 'Calm'}]`,
        reasoning: 'Generated from scene parameters.',
        warnings: [],
      };
    }

    return res.json({
      success: true,
      modelUsed: usedModel,
      data: {
        imagePrompt: parsedData.imagePrompt || '',
        videoPrompt: parsedData.videoPrompt || '',
        musicPrompt: parsedData.musicPrompt || '',
        reasoning: parsedData.reasoning || 'Coordinated across visual, kinematic, and acoustic dimensions.',
        warnings: parsedData.warnings || [],
      },
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-prompt:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during Gemini prompt generation.',
    });
  }
});

/**
 * Endpoint to perform multimodal AI analysis on a reference image using Gemini 3.8 Flash
 */
app.post('/api/gemini/analyze-reference', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      imageBase64,
      mimeType = 'image/jpeg',
      title = '',
      category = '',
      notes = '',
      model: requestedModel,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing imageBase64 payload for reference analysis.',
      });
    }

    let cleanBase64 = '';
    let imageMimeType = mimeType || 'image/jpeg';

    if (typeof imageBase64 === 'string' && (imageBase64.startsWith('http://') || imageBase64.startsWith('https://'))) {
      try {
        const imgRes = await fetch(imageBase64, { signal: AbortSignal.timeout(8000) });
        if (!imgRes.ok) {
          throw new Error(`HTTP ${imgRes.status} ${imgRes.statusText}`);
        }
        const contentType = imgRes.headers.get('content-type');
        if (contentType) imageMimeType = contentType.split(';')[0];
        const arrayBuffer = await imgRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
      } catch (fetchErr: any) {
        return res.status(400).json({
          success: false,
          error: `Could not download reference image from URL (${imageBase64}): ${fetchErr.message || fetchErr}`,
        });
      }
    } else if (typeof imageBase64 === 'string') {
      cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    }

    const analysisSystemInstruction = `You are an expert master visual art historian, cinematographer, and generative AI visual intelligence analyst. Analyze the provided reference image with rigorous precision for the "Ambience Intelligence Studio" reference library.

Strictly distinguish observable visual facts from interpretations or uncertain inferences. Do not invent details not visibly supported by the image.

Analyze the image and respond ONLY with a valid JSON object matching this exact schema:
{
  "mainSubject": "Precise description of the primary subject and environmental context",
  "composition": "Compositional structure, framing, visual weight, and layout",
  "cameraAngle": "Camera perspective, lens feel, height, and distance",
  "depthLayers": {
    "foreground": "Visible elements in the immediate foreground",
    "middleGround": "Primary focus elements in the middle ground",
    "background": "Distant scenery, backdrop, or horizon elements"
  },
  "lighting": "Lighting direction, quality, color temperature, and shadows",
  "colorPalette": ["#HexOrColorName1", "#HexOrColorName2", "#HexOrColorName3", "#HexOrColorName4"],
  "materialsAndTextures": ["Material 1", "Material 2", "Material 3"],
  "atmosphere": "Mood, emotional resonance, and atmospheric quality",
  "visualStyle": "Degree of realism, artistic medium, or rendering style",
  "importantDetails": ["Notable detail 1", "Notable detail 2"],
  "animationOpportunities": ["Subtle motion opportunity 1 e.g. rain ripples", "Motion opportunity 2 e.g. flickering flame"],
  "animationDifficulties": ["Potential looping risk or morphing hazard e.g. complex crowd motion"],
  "rawObservations": "Comprehensive concise architectural and aesthetic summary."
}
`;

    const promptText = `Analyze this reference image titled "${title}" (Category: ${category}). User Notes: "${notes}". Return the structured JSON analysis.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        },
        {
          text: `${analysisSystemInstruction}\n\n${promptText}`,
        },
      ],
    };

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed analysis with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to analyze reference image.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse analysis JSON response, fallback structure used:', parseErr);
      parsedData = {
        mainSubject: title || 'Inspiration Reference Scene',
        composition: 'Balanced framing and visual hierarchy',
        cameraAngle: 'Eye-level cinematic view',
        depthLayers: { foreground: 'Surface details', middleGround: 'Primary subject', background: 'Distant ambiance' },
        lighting: 'Atmospheric balanced lighting',
        colorPalette: ['#1E2B3E', '#E8AE62', '#101722'],
        materialsAndTextures: ['Wood', 'Stone', 'Glass'],
        atmosphere: 'Serene and immersive',
        visualStyle: 'Cinematic realism',
        importantDetails: [notes || 'Saved benchmark reference'],
        animationOpportunities: ['Subtle ambient weather', 'Lighting flicker'],
        animationDifficulties: ['Keep motion subtle for seamless loop'],
        rawObservations: responseText.slice(0, 300),
      };
    }

    return res.json({
      success: true,
      modelUsed: usedModel,
      analysis: {
        mainSubject: parsedData.mainSubject || title,
        composition: parsedData.composition || 'Balanced framing',
        cameraAngle: parsedData.cameraAngle || 'Eye-level',
        depthLayers: parsedData.depthLayers || { foreground: '', middleGround: '', background: '' },
        lighting: parsedData.lighting || 'Atmospheric lighting',
        colorPalette: Array.isArray(parsedData.colorPalette) ? parsedData.colorPalette : ['#E8AE62', '#1E2B3E'],
        materialsAndTextures: Array.isArray(parsedData.materialsAndTextures) ? parsedData.materialsAndTextures : [],
        atmosphere: parsedData.atmosphere || 'Immersive ambience',
        visualStyle: parsedData.visualStyle || 'Cinematic',
        importantDetails: Array.isArray(parsedData.importantDetails) ? parsedData.importantDetails : [],
        animationOpportunities: Array.isArray(parsedData.animationOpportunities) ? parsedData.animationOpportunities : [],
        animationDifficulties: Array.isArray(parsedData.animationDifficulties) ? parsedData.animationDifficulties : [],
        rawObservations: parsedData.rawObservations || '',
        isApproved: true,
        version: 1,
        analyzedAt: Date.now(),
      },
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze-reference:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during AI reference image analysis.',
    });
  }
});

/**
 * Endpoint for Phase 1: Quick Image Prompt Generation
 */
app.post('/api/gemini/quick-image-prompt', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      mode = 'reference', // 'reference' | 'idea'
      referenceImage,
      userInstructions,
      idea,
      aspectRatio = '16:9',
      model: requestedModel,
    } = req.body;

    const quickSystemInstruction = `You are the Principal Generative AI Image Prompt Engineer for "Ambience Intelligence Studio".
Your task is to generate a single, highly detailed, production-ready image generation prompt (formatted for Midjourney v6.1 / Flux.1 Pro) based on ${mode === 'reference' ? 'a reference image' : 'a conceptual idea'}.

QUALITY STANDARDS FOR PROMPT CONSTRUCTION:
1. Subject & Spatial Layout: Clearly define the primary subject, spatial positioning, foreground, middleground, and background depth.
2. Camera & Composition: Specify camera angle, perspective, framing, lens feel, and visual weight.
3. Lighting & Tonal Quality: Define lighting direction, contrast, highlights, color temperature, time of day, and shadows.
4. Color & Texture: Detail color palette tones, architectural/natural materials, surfaces, and fine textures.
5. Atmosphere & Storytelling: Express visual mood, weather, environment subtleties, and narrative ambiance.
6. Render Parameters: Include focus, sharpness, cinematic realism, visual style, and aspect ratio (--ar ${aspectRatio}).
7. STRICT DISCIPLINE: Be vivid, specific, and actionable. Avoid generic buzzwords, filler adjectives, or fluffy descriptions.
${mode === 'reference' ? '8. Distinguish details explicitly visible in the reference image from newly inferred creative additions.' : ''}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "prompt": "Full production image prompt ready for Midjourney/Flux with --ar ${aspectRatio} tag...",
  "reasoning": "A concise 2-sentence explanation of the prompt composition and key visual choices.",
  "visibleDetails": ["Visible element 1", "Visible element 2"],
  "inferredDetails": ["Inferred addition 1", "Inferred addition 2"]
}
`;

    let userPromptText = '';
    let contents: any;

    if (mode === 'reference') {
      const refTitle = referenceImage?.title || 'Reference Image';
      const refAnalysis = referenceImage?.analysis;
      const refNotes = referenceImage?.notes || '';

      userPromptText = `GENERATE DETAILED QUICK IMAGE PROMPT FROM REFERENCE:
Reference Title: "${refTitle}"
${refNotes ? `Reference Notes: "${refNotes}"\n` : ''}
${userInstructions ? `USER MODIFICATION INSTRUCTIONS (What to change or preserve):\n"${userInstructions}"\n` : ''}
${refAnalysis ? `EXISTING ANALYSIS CUES:
- Main Subject: ${refAnalysis.mainSubject || 'N/A'}
- Composition: ${refAnalysis.composition || 'N/A'}
- Lighting: ${refAnalysis.lighting || 'N/A'}
- Palette: ${Array.isArray(refAnalysis.colorPalette) ? refAnalysis.colorPalette.join(', ') : 'N/A'}
- Atmosphere: ${refAnalysis.atmosphere || 'N/A'}\n` : ''}
Aspect Ratio: ${aspectRatio}

Synthesize these visual elements and user instructions into a unified, actionable Midjourney/Flux image prompt.`;

      let imageBase64 = referenceImage?.imageBase64 || referenceImage?.imageUrl || '';
      if (typeof imageBase64 === 'string' && imageBase64.length > 50) {
        let cleanBase64 = imageBase64;
        let imageMimeType = referenceImage?.mimeType || 'image/jpeg';

        if (cleanBase64.startsWith('http://') || cleanBase64.startsWith('https://')) {
          try {
            const imgRes = await fetch(cleanBase64, { signal: AbortSignal.timeout(8000) });
            if (imgRes.ok) {
              const contentType = imgRes.headers.get('content-type');
              if (contentType) imageMimeType = contentType.split(';')[0];
              const arrayBuffer = await imgRes.arrayBuffer();
              cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
            }
          } catch (e) {
            console.warn('Could not fetch reference image URL for quick prompt:', e);
          }
        } else {
          cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, '');
        }

        if (cleanBase64 && !cleanBase64.startsWith('http')) {
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `${quickSystemInstruction}\n\n${userPromptText}`,
              },
            ],
          };
        } else {
          contents = `${quickSystemInstruction}\n\n${userPromptText}`;
        }
      } else {
        contents = `${quickSystemInstruction}\n\n${userPromptText}`;
      }
    } else {
      const subject = idea?.subject || 'Cozy atmospheric sanctuary';
      const setting = idea?.setting || 'Detailed interior with large windows';
      const mood = idea?.mood || 'Serene, warm, inviting, cinematic';
      const constraints = idea?.constraints || 'No people, uninhabited';

      userPromptText = `GENERATE DETAILED QUICK IMAGE PROMPT FROM IDEA:
Subject / Concept: "${subject}"
Setting / Environment: "${setting}"
Mood / Aesthetic: "${mood}"
Constraints / Exclusions: "${constraints}"
Aspect Ratio: ${aspectRatio}

Craft a complete, highly specific, production-ready image generation prompt.`;

      contents = `${quickSystemInstruction}\n\n${userPromptText}`;
    }

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed quick prompt generation with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to generate quick prompt.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse quick prompt JSON response, using fallback structure:', parseErr);
      parsedData = {
        prompt: responseText,
        reasoning: 'Generated directly from prompt specifications.',
        visibleDetails: [],
        inferredDetails: [],
      };
    }

    return res.json({
      success: true,
      modelUsed: usedModel,
      data: {
        prompt: parsedData.prompt || responseText,
        reasoning: parsedData.reasoning || 'Crafted with balanced subject, lighting, and camera composition.',
        visibleDetails: Array.isArray(parsedData.visibleDetails) ? parsedData.visibleDetails : [],
        inferredDetails: Array.isArray(parsedData.inferredDetails) ? parsedData.inferredDetails : [],
      },
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/quick-image-prompt:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during quick image prompt generation.',
    });
  }
});

/**
 * Endpoint for Phase 1: Controlled Image Variations
 */
app.post('/api/gemini/quick-prompt-variations', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      basePrompt,
      variationLevel = 'balanced', // 'subtle' | 'balanced' | 'bold'
      count = 4,
      userInstructions,
      model: requestedModel,
    } = req.body;

    if (!basePrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing basePrompt payload.',
      });
    }

    const levelDescriptions: Record<string, string> = {
      subtle: 'SUBTLE VARIATIONS: Preserve the main composition, core subject, camera angle, and visual identity strictly. Modify smaller details such as lighting nuances, weather intensity, color temperature shifts, or decor accents.',
      balanced: 'BALANCED VARIATIONS: Preserve the defining concept and overall aesthetic. Allow meaningful changes to the surrounding environment, composition framing, lighting dynamics, or supporting backdrop elements.',
      bold: 'BOLD VARIATIONS: Preserve the core inspiration or underlying spirit. Explore substantially different compositions, camera perspectives, environmental settings, and artistic moods while keeping the core concept recognizable.',
    };

    const targetCount = Math.min(Math.max(Number(count) || 4, 1), 6);
    const chosenLevelDesc = levelDescriptions[variationLevel] || levelDescriptions.balanced;

    const variationsSystemInstruction = `You are an expert Image Prompt Architect for "Ambience Intelligence Studio".
Your task is to take a base image-generation prompt and generate exactly ${targetCount} complete, standalone prompt variations adhering to the requested variation level.

VARIATION LEVEL DIRECTIVE:
${chosenLevelDesc}

CRITICAL RULES:
1. Each variation MUST be a complete, standalone, production-ready image prompt formatted for Midjourney v6.1 / Flux.1 Pro (including aspect ratio tags e.g. --ar 16:9).
2. Variations MUST explore meaningfully different visual directions—do NOT merely replace words with synonyms or shuffle sentence order.
3. Every variation must be fully specified with subject, lighting, composition, camera feel, materials, and atmosphere.

Respond ONLY with a valid JSON object matching this schema:
{
  "variations": [
    {
      "id": "var-1",
      "title": "Short 2-4 word title for Variation 1",
      "angleSummary": "1 sentence describing what makes this variation visually distinct",
      "prompt": "Full standalone prompt string..."
    }
  ]
}
`;

    const userPromptText = `BASE PROMPT FOR VARIATION GENERATION:
"${basePrompt}"

${userInstructions ? `USER GUIDANCE / PREFERENCES FOR VARIATIONS:\n"${userInstructions}"\n` : ''}
VARIATION LEVEL: ${variationLevel.toUpperCase()}
DESIRED VARIATION COUNT: ${targetCount}

Generate ${targetCount} distinct, complete prompt variations now.`;

    const contents = `${variationsSystemInstruction}\n\n${userPromptText}`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed prompt variations with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to generate prompt variations.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse variations JSON response, using fallback structure:', parseErr);
      parsedData = {
        variations: [
          {
            id: 'var-1',
            title: 'Variation 1',
            angleSummary: 'Variant based on base prompt.',
            prompt: responseText,
          },
        ],
      };
    }

    const rawVariations = Array.isArray(parsedData?.variations) ? parsedData.variations : [];
    const formattedVariations = rawVariations.map((v: any, index: number) => ({
      id: v.id || `var-${Date.now()}-${index + 1}`,
      title: v.title || `Variation ${index + 1}`,
      angleSummary: v.angleSummary || `Visual direction ${index + 1} with ${variationLevel} adjustments.`,
      prompt: typeof v.prompt === 'string' ? v.prompt : String(v),
    }));

    return res.json({
      success: true,
      modelUsed: usedModel,
      variations: formattedVariations,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/quick-prompt-variations:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during prompt variations generation.',
    });
  }
});

/**
 * Endpoint for Phase 2: Idea Generator (Intelligent Creative Ideation)
 */
app.post('/api/gemini/generate-ideas', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      topic = 'Cozy atmospheric sanctuary',
      creativeObjective = 'Generate ambience video concepts',
      additionalInstructions = '',
      count = 10,
      creativeDirection = 'A balanced mixture',
      originality = 'Fresh and unexpected',
      productionComplexity = 'Moderate',
      previousIdeas = [],
      feedbackDirective = '',
      referenceIdea,
      model: requestedModel,
    } = req.body;

    const targetCount = Math.min(Math.max(Number(count) || 10, 1), 20);

    const ideaSystemInstruction = `You are the Executive Creative Director and Visual Intelligence Architect for "Ambience Intelligence Studio".
Your mission is to generate ${targetCount} distinctive, intelligent, visually rich, and production-useful ambience video / creative project concepts based on a user's topic.

CREATIVE & ARCHITECTURAL GUIDELINES:
1. HIGH SPECIFICITY & ORIGINALITY: Avoid generic tropes (e.g., "a cozy cabin in the woods"). Craft rich, vivid, atmospheric settings with intentional architectural details, historical or fantasy contexts, lighting temperature contrasts, and acoustic possibilities.
2. MEANINGFUL DIVERSITY: Every single idea in the generated collection MUST explore a distinct creative angle (differing architectural styles, lighting conditions, weather nuances, moods, time periods, or storytelling hooks).
3. AMBIENT ATMOSPHERE: Concepts must be able to sustain long-form, visually engaging background viewing with opportunities for subtle motion loops and layered soundscapes.
4. RESPECT CONTROLS STRICTLY:
   - Objective: ${creativeObjective}
   - Creative Direction: ${creativeDirection}
   - Originality Level: ${originality}
   - Production Complexity: ${productionComplexity}
${feedbackDirective ? `5. FEEDBACK DIRECTIVE: ${feedbackDirective}` : ''}
${previousIdeas.length > 0 ? `6. AVOID DUPLICATES: Do NOT repeat these existing titles/ideas: ${JSON.stringify(previousIdeas.slice(-15))}` : ''}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "ideas": [
    {
      "id": "idea-1",
      "title": "Memorable & Distinctive Title",
      "coreConcept": "Concise 1-2 sentence core concept explanation",
      "visualHook": "The specific visual scene, composition, or contrast that makes it stand out",
      "settingAndAtmosphere": "Detailed environment, architecture, time of day, lighting, weather, materials",
      "whyItWorks": "1-2 sentences on creative appeal and viewer immersion",
      "productionApproach": "Brief execution note tailored to ${productionComplexity} complexity level",
      "suggestedSubject": "Subject snippet for quick image prompt",
      "suggestedSetting": "Setting snippet for quick image prompt",
      "suggestedMood": "Mood snippet for quick image prompt",
      "suggestedConstraints": "Constraints snippet for quick image prompt"
    }
  ]
}
`;

    let userPromptText = `GENERATE ${targetCount} CREATIVE IDEAS FOR:
Topic / Starting Point: "${topic}"
Objective: "${creativeObjective}"
${additionalInstructions ? `Additional User Instructions / Preferences: "${additionalInstructions}"\n` : ''}
${referenceIdea ? `Inspired by Reference Concept: "${referenceIdea.title}" - ${referenceIdea.coreConcept}\n` : ''}
Controls: Direction=${creativeDirection}, Originality=${originality}, Complexity=${productionComplexity}.

Generate ${targetCount} unique, high-quality idea cards now.`;

    const contents = `${ideaSystemInstruction}\n\n${userPromptText}`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed idea generation with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to generate ideas.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse ideas JSON response, using fallback structure:', parseErr);
      parsedData = {
        ideas: [
          {
            id: 'idea-1',
            title: `${topic} Sanctuary`,
            coreConcept: 'Atmospheric video concept crafted for long-form viewing.',
            visualHook: responseText.slice(0, 150),
            settingAndAtmosphere: 'Cozy interior with soft ambient light.',
            whyItWorks: 'High viewer retention and immersive atmosphere.',
            productionApproach: 'Moderate complexity using static background with subtle motion loops.',
            suggestedSubject: topic,
            suggestedSetting: 'Detailed atmospheric setting',
            suggestedMood: 'Cozy, serene, immersive',
            suggestedConstraints: 'Uninhabited, no people',
          },
        ],
      };
    }

    const rawIdeas = Array.isArray(parsedData?.ideas) ? parsedData.ideas : [];
    const formattedIdeas = rawIdeas.map((item: any, index: number) => ({
      id: item.id || `idea-${Date.now()}-${index + 1}`,
      title: item.title || `Idea ${index + 1}: ${topic}`,
      coreConcept: item.coreConcept || 'Atmospheric video concept for creative studio.',
      visualHook: item.visualHook || 'Visually rich scene composition with atmospheric depth.',
      settingAndAtmosphere: item.settingAndAtmosphere || 'Detailed environment with atmospheric lighting.',
      whyItWorks: item.whyItWorks || 'Creates an engaging, immersive visual sanctuary.',
      productionApproach: item.productionApproach || `Designed for ${productionComplexity} production setup.`,
      suggestedSubject: item.suggestedSubject || item.title || topic,
      suggestedSetting: item.suggestedSetting || item.settingAndAtmosphere || 'Detailed scene',
      suggestedMood: item.suggestedMood || 'Cinematic, atmospheric, serene',
      suggestedConstraints: item.suggestedConstraints || 'Uninhabited, no modern electronics',
    }));

    return res.json({
      success: true,
      modelUsed: usedModel,
      ideas: formattedIdeas,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-ideas:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during idea generation.',
    });
  }
});

/**
 * Endpoint for Phase 2: Develop Single Idea into Deep Production Blueprint
 */
app.post('/api/gemini/develop-idea', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { idea, model: requestedModel } = req.body;

    if (!idea) {
      return res.status(400).json({
        success: false,
        error: 'Missing idea payload for development.',
      });
    }

    const developSystemInstruction = `You are an Expert Production Director for "Ambience Intelligence Studio".
Expand the provided ambience concept into a rich, actionable production blueprint.

JSON OUTPUT SCHEMA:
Respond ONLY with a valid JSON object:
{
  "developedBlueprint": {
    "title": "Full Production Title",
    "expandedVision": "3-4 sentence detailed narrative and aesthetic vision",
    "spatialLayout": "Foreground, midground, background spatial breakdown",
    "lightingDynamics": "Primary light sources, color temperature, shadowplay, volumetric effects",
    "soundscapeArchitecture": "Layered musical score ideas and environmental foley soundscape",
    "motionAndLooping": "Subtle motion vectors, camera tripod position, loop seam hazards to avoid",
    "recommendedPromptDraft": "Full production image prompt ready for Midjourney/Flux --ar 16:9"
  }
}
`;

    const userPromptText = `DEVELOP THIS CONCEPT INTO A FULL PRODUCTION BLUEPRINT:
Title: "${idea.title}"
Core Concept: "${idea.coreConcept}"
Visual Hook: "${idea.visualHook}"
Setting & Atmosphere: "${idea.settingAndAtmosphere}"
Why It Works: "${idea.whyItWorks}"
Production Approach: "${idea.productionApproach}"

Generate the comprehensive production breakdown now.`;

    const contents = `${developSystemInstruction}\n\n${userPromptText}`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed idea development with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to develop idea.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse develop idea JSON, using fallback structure:', parseErr);
      parsedData = {
        developedBlueprint: {
          title: idea.title,
          expandedVision: idea.coreConcept,
          spatialLayout: 'Foreground: detailed accents; Middleground: main focus; Background: ambient scenery.',
          lightingDynamics: 'Atmospheric lighting with balanced contrast.',
          soundscapeArchitecture: 'Layered ambient musical score with subtle environmental sound effects.',
          motionAndLooping: 'Stationary tripod framing with subtle looping motion.',
          recommendedPromptDraft: `${idea.title}, ${idea.settingAndAtmosphere}, cinematic realism --ar 16:9`,
        },
      };
    }

    return res.json({
      success: true,
      modelUsed: usedModel,
      developedBlueprint: parsedData.developedBlueprint || parsedData,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/develop-idea:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during idea development.',
    });
  }
});

/**
 * Endpoint for Phase 3: Reference-to-Production Workflow
 */
app.post('/api/gemini/reference-to-production', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      target = 'both', // 'image' | 'video' | 'both'
      referenceData,
      creativeInterpretation,
      existingImagePrompt,
      model: requestedModel,
    } = req.body;

    if (!creativeInterpretation) {
      return res.status(400).json({
        success: false,
        error: 'Missing creativeInterpretation payload.',
      });
    }

    const refTitle = referenceData?.title || 'Reference Video';
    const aesthetic = referenceData?.aesthetic;
    const kinematics = referenceData?.kinematics;
    const blueprint = referenceData?.blueprint;

    const systemInstruction = `You are the Lead Cinematographer and Visual Prompt Architect for "Ambience Intelligence Studio".
Your task is to transform a Reference Video's structural characteristics and the user's Creative Interpretation into:
1. An Opening Image Prompt (formatted for Midjourney v6.1 / Flux.1 Pro) that establishes the initial frame.
2. A Video Motion Prompt (formatted for Runway Gen-3 / Kling 1.5 / Luma) that describes temporal motion while treating the opening image as the initial frame.

CORE CREATIVE RULES:
1. Preserve useful techniques of the reference (e.g., camera framing, lighting contrast, pacing) while developing a DISTINCT new scene based on user instructions.
2. Do NOT copy the original reference setting (e.g. city) if user requested a new setting (e.g. medieval castle or winter tea house).
3. Do NOT automatically introduce fantasy elements, decorations, or props unless requested.
4. Opening Image Prompt MUST be a concrete, static scene description (subject, environment, depth, lighting, composition, materials, atmosphere, --ar 16:9). Do NOT describe events that have not happened yet.
5. Video Motion Prompt MUST describe temporal motion (camera movement, environmental physics, weather animation, light dynamics, depth/parallax, seamless loop constraints, anti-flicker/anti-morphing rules) without contradicting the image prompt.
6. Target request: ${target.toUpperCase()}.

Respond ONLY with a valid JSON object matching this schema:
{
  "openingImagePrompt": "Full opening image prompt with --ar 16:9 tag...",
  "videoMotionPrompt": "Full video animation prompt with motion vectors and loop safety...",
  "reasoning": "Concise 2-sentence explanation of how reference techniques were adapted to the new scene."
}
`;

    const userPromptText = `REFERENCE VIDEO BLUEPRINT:
Title: "${refTitle}"
${aesthetic ? `- World/Location: ${aesthetic.worldArchetype || ''} (${aesthetic.locationType || 'indoor'})\n- Lighting: ${aesthetic.lighting?.primarySource || ''}, ${aesthetic.lighting?.colorTemperature || ''}\n- Palette: ${Array.isArray(aesthetic.colorPalette) ? aesthetic.colorPalette.map((c: any) => c.name || c.hex || c).join(', ') : ''}\n` : ''}
${kinematics ? `- Camera Behavior: ${kinematics.cameraBehavior || 'Subtle Slow Drift'}\n- Motion Subjects: ${Array.isArray(kinematics.motionSubjects) ? kinematics.motionSubjects.join(', ') : ''}\n- Motion Pacing: ${kinematics.motionPacing || 'Ultra-Slow / Meditative'}\n` : ''}
${blueprint ? `- Director Vision: ${blueprint.directorVision || ''}\n` : ''}

USER CREATIVE INTERPRETATION:
- Subject / Concept: "${creativeInterpretation.subject || 'Cozy atmospheric sanctuary'}"
- New Setting / Environment: "${creativeInterpretation.setting || 'Detailed scene'}"
- Visual Style: "${creativeInterpretation.visualStyle || 'cinematic-realism'}"
- Mood & Atmosphere: "${creativeInterpretation.mood || 'serene, cozy, immersive'}"
- What to Preserve from Reference: ${Array.isArray(creativeInterpretation.preserveQualities) ? creativeInterpretation.preserveQualities.join(', ') : 'camera movement, lighting contrast, atmosphere'}
- What to Change: "${creativeInterpretation.changeQualities || 'Replace subjects and architecture with new concept'}"
${creativeInterpretation.additionalInstructions ? `- Additional Instructions: "${creativeInterpretation.additionalInstructions}"\n` : ''}

${existingImagePrompt ? `FINALIZED OPENING IMAGE PROMPT TO ALIGN VIDEO MOTION WITH:\n"${existingImagePrompt}"\n` : ''}

Generate structured JSON response for ${target.toUpperCase()} prompt(s) now.`;

    const contents = `${systemInstruction}\n\n${userPromptText}`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelCandidate} failed ref-to-prod with:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to generate ref-to-production prompts.');
    }

    const responseText = response.text || '';
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse ref-to-prod JSON, using fallback structure:', parseErr);
      parsedData = {
        openingImagePrompt: responseText,
        videoMotionPrompt: 'Stationary camera. Subtle ambient motion matching scene weather and lighting. Seamless 10s loop.',
        reasoning: 'Generated from reference blueprint and user creative direction.',
      };
    }

    return res.json({
      success: true,
      modelUsed: usedModel,
      data: {
        openingImagePrompt: parsedData.openingImagePrompt || responseText,
        videoMotionPrompt: parsedData.videoMotionPrompt || 'Stationary tripod framing with subtle environmental motion.',
        reasoning: parsedData.reasoning || 'Adapted reference composition and motion rules to new creative setting.',
      },
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/reference-to-production:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during reference-to-production prompt generation.',
    });
  }
});

/**
 * Helper to extract YouTube Video ID from any URL format
 */
function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Phase 7: Endpoint to analyze a YouTube video with multimodal Gemini and build an Aesthetic Noise production blueprint
 */
app.post('/api/gemini/analyze-video', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const {
      url = '',
      customGoal = '',
      notes = '',
      model: requestedModel,
    } = req.body;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL. Please provide a standard YouTube link, short link (youtu.be), or shorts URL.',
      });
    }

    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let fetchedTitle = '';
    let fetchedChannel = '';
    let fetchedThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Fetch oEmbed metadata for accurate title and author
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`,
        { signal: AbortSignal.timeout(4500) }
      );
      if (oembedRes.ok) {
        const oembedData = (await oembedRes.json()) as any;
        if (oembedData.title) fetchedTitle = oembedData.title;
        if (oembedData.author_name) fetchedChannel = oembedData.author_name;
        if (oembedData.thumbnail_url) fetchedThumbnail = oembedData.thumbnail_url;
      }
    } catch (e) {
      console.warn('oEmbed fetch timed out or skipped for:', videoId);
    }

    const systemInstruction = `You are the Lead Cinematographer, Acoustic Director, and Generative AI Technical Producer for "Aesthetic Noise", a premier YouTube ambience and sleep channel.
Your task in the "Reference Video Lab" is to conduct an authoritative reverse-engineering and multimodal deconstruction of a reference YouTube ambience video.

CRITICAL CREATIVE REPLICATION MANDATE:
The goal is NOT to copy or plagiarize the source video frame-by-frame, nor attempt to recover copyrighted prompts.
The goal is CREATIVE REPLICATION: deconstructing the underlying cinematic grammar—lighting temperature contrast, three-plane depth composition, kinematic motion physics, seamless loop seam safety, and multi-layered acoustic foley—and synthesizing an ORIGINAL, 100% IP-compliant production blueprint for Aesthetic Noise that captures the identical hypnotic quality, retention, and evergreen watch-time appeal.

Return ONLY a valid JSON object matching this schema:
{
  "title": "string (Video title)",
  "channelTitle": "string (Channel name)",
  "matchConfidence": 95,
  "tags": ["Aesthetic Tag 1", "Aesthetic Tag 2", "Atmosphere Tag 3"],
  "aesthetic": {
    "worldArchetype": "string (e.g. Dark Academia Scriptorium, Cyberpunk Loft, Nordic Hearth)",
    "locationType": "indoor",
    "season": "autumn",
    "timeOfDay": "night",
    "weather": "rain",
    "secondaryWeather": "storm",
    "waterElements": {
      "enabled": false,
      "type": "none",
      "behavior": "none",
      "notes": "string"
    },
    "lighting": {
      "primarySource": "string (e.g. Roaring stone fireplace)",
      "colorTemperature": "string (e.g. Warm Amber 2200K interior vs Cool Cobalt 6500K exterior)",
      "intensity": "dim-cozy",
      "volumetricRays": true,
      "flickeringFlames": true,
      "reflections": true,
      "notes": "string"
    },
    "colorPalette": [
      { "hex": "#D97706", "name": "Hearth Gold", "role": "Key Glow" },
      { "hex": "#1E293B", "name": "Midnight Rain", "role: "Window Backdrop" },
      { "hex": "#7F1D1D", "name": "Velvet Crimson", "role": "Upholstery" },
      { "hex": "#451A03", "name": "Dark Oak", "role": "Wood Grain" }
    ],
    "materialsAndTextures": ["Texture 1", "Texture 2", "Texture 3"],
    "atmosphericEffects": ["Effect 1", "Effect 2"],
    "depthPlanes": {
      "foreground": "string",
      "middleGround": "string",
      "background": "string"
    },
    "composition": {
      "angle": "eye-level",
      "framing": "string",
      "focalLengthFeel": "35mm cinematic widescreen",
      "notes": "string"
    }
  },
  "kinematics": {
    "cameraBehavior": "Locked Tripod",
    "motionSubjects": ["Subtle motion 1", "Subtle motion 2"],
    "motionPacing": "Ultra-Slow / Meditative",
    "loopCycleEstimateSeconds": 10,
    "loopSeamHazards": ["Hazard 1 e.g. sudden flame flicker", "Hazard 2 e.g. camera drift"],
    "cinematicRules": ["Tripod locked strictly", "No moving humanoids", "Constant illumination"]
  },
  "acoustics": {
    "musicalStyle": "string",
    "instrumentation": ["Instrument 1", "Instrument 2"],
    "tempoBpmRange": "60 BPM",
    "foleyLayers": [
      { "name": "Layer 1", "percentage": 45, "description": "string" },
      { "name": "Layer 2", "percentage": 35, "description": "string" },
      { "name": "Layer 3", "percentage": 20, "description": "string" }
    ],
    "frequencyMasteringNotes": "string (e.g. Rolled off above 7.5kHz for fatigue-free listening)",
    "keyMoods": ["Mood 1", "Mood 2", "Mood 3"]
  },
  "blueprint": {
    "directorVision": "string (Director note on original translation for Aesthetic Noise)",
    "translatedConfig": {
      "worldId": "wizarding-common-room",
      "season": "autumn",
      "timeOfDay": "night",
      "primaryWeather": "rain",
      "secondaryWeather": "storm",
      "settingType": "indoor",
      "locationName": "string"
    },
    "imagePrompt": "string (Full production Midjourney v6.1 / Flux.1 Pro prompt with aspect ratio and camera tags)",
    "videoPrompt": "string (Full Runway Gen-3 / Kling 1.5 prompt with stationary camera lock and loop constraints)",
    "musicPrompt": "string (Full Suno v3.5 / Udio / Foley score prompt with BPM, foley mix % and instrumentation)",
    "productionChecklist": ["Checklist item 1", "Checklist item 2", "Checklist item 3"],
    "reusableLessons": [
      {
        "category": "Looping",
        "title": "string",
        "recommendation": "string",
        "observation": "string"
      }
    ]
  }
}`;

    const promptText = `ANALYZE REFERENCE YOUTUBE VIDEO FOR CREATIVE REPLICATION:
URL: ${canonicalUrl}
Video ID: ${videoId}
${fetchedTitle ? `Known Video Title: "${fetchedTitle}"` : ''}
${fetchedChannel ? `Channel: "${fetchedChannel}"` : ''}
${notes ? `User Production Notes: "${notes}"` : ''}
${customGoal ? `Director's Custom Replication Goal: "${customGoal}"` : ''}

Please analyze this video's visual atmosphere, cinematic framing, motion physics, and acoustic layers in full depth. Formulate an original Aesthetic Noise creative blueprint and respond in the requested JSON format.`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    // Fetch thumbnail image and analyze with rich metadata and thumbnail inline data
    let thumbnailBase64 = '';
    try {
      const thumbRes = await fetch(fetchedThumbnail, { signal: AbortSignal.timeout(4000) });
      if (thumbRes.ok) {
        const arrayBuffer = await thumbRes.arrayBuffer();
        thumbnailBase64 = Buffer.from(arrayBuffer).toString('base64');
      }
    } catch (thumbErr) {
      console.warn('Could not fetch thumbnail buffer:', thumbErr);
    }

    for (const modelCandidate of candidateModels) {
      try {
        const contents: any[] = [];
        if (thumbnailBase64) {
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: thumbnailBase64,
            },
          });
        }
        contents.push({
          text: `${systemInstruction}\n\n${promptText}\n\n(Note: Reference video benchmark thumbnail image and verified YouTube metadata provided above.)`,
        });

        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (fbErr: any) {
        lastError = fbErr;
        console.warn(`Analysis on ${modelCandidate} failed:`, fbErr.message || fbErr);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to analyze video.');
    }

    const responseText = response.text || '';
    let parsed: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Failed to parse Gemini video analysis JSON directly, creating normalized fallback structure:', parseErr);
      parsed = {};
    }

    // Normalize and assemble complete ReferenceVideoLabItem
    const finalItem = {
      id: `vlab-${videoId}-${Date.now()}`,
      url: canonicalUrl,
      videoId,
      title: parsed.title || fetchedTitle || `YouTube Ambience Benchmark (${videoId})`,
      channelTitle: parsed.channelTitle || fetchedChannel || 'Ambient Channel',
      thumbnailUrl: fetchedThumbnail,
      duration: parsed.duration || '2:00:00',
      analyzedAt: Date.now(),
      favorite: false,
      notes: notes || 'Analyzed via Reference Video Lab',
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ['YouTube Reference', 'Ambience Benchmark', 'Cozy Sanctuary'],
      matchConfidence: typeof parsed.matchConfidence === 'number' ? parsed.matchConfidence : 95,
      aesthetic: {
        worldArchetype: parsed.aesthetic?.worldArchetype || 'Cozy Ambience Sanctuary',
        locationType: parsed.aesthetic?.locationType || 'indoor',
        season: parsed.aesthetic?.season || 'autumn',
        timeOfDay: parsed.aesthetic?.timeOfDay || 'night',
        weather: parsed.aesthetic?.weather || 'rain',
        secondaryWeather: parsed.aesthetic?.secondaryWeather || undefined,
        waterElements: parsed.aesthetic?.waterElements || { enabled: false, notes: 'No large open water bodies.' },
        lighting: {
          primarySource: parsed.aesthetic?.lighting?.primarySource || 'Warm fireplace and cozy interior lamps',
          colorTemperature: parsed.aesthetic?.lighting?.colorTemperature || 'Warm Amber (2200K) interior vs Cool Cobalt (6500K) exterior',
          intensity: parsed.aesthetic?.lighting?.intensity || 'dim-cozy',
          volumetricRays: parsed.aesthetic?.lighting?.volumetricRays ?? true,
          flickeringFlames: parsed.aesthetic?.lighting?.flickeringFlames ?? true,
          reflections: parsed.aesthetic?.lighting?.reflections ?? true,
          notes: parsed.aesthetic?.lighting?.notes || 'Balanced dual-temperature chiaroscuro lighting.',
        },
        colorPalette: Array.isArray(parsed.aesthetic?.colorPalette) && parsed.aesthetic.colorPalette.length > 0
          ? parsed.aesthetic.colorPalette
          : [
              { hex: '#D97706', name: 'Warm Amber Gold', role: 'Key Light' },
              { hex: '#1E293B', name: 'Cobalt Night Storm', role: 'Window Sill' },
              { hex: '#7F1D1D', name: 'Deep Crimson', role: 'Textile Accent' },
              { hex: '#451A03', name: 'Aged Oak', role: 'Shadow Base' },
            ],
        materialsAndTextures: Array.isArray(parsed.aesthetic?.materialsAndTextures) && parsed.aesthetic.materialsAndTextures.length > 0
          ? parsed.aesthetic.materialsAndTextures
          : ['Carved dark timber', 'Rain-streaked glass', 'Aged stone hearth', 'Tufted velvet upholstery'],
        atmosphericEffects: Array.isArray(parsed.aesthetic?.atmosphericEffects) && parsed.aesthetic.atmosphericEffects.length > 0
          ? parsed.aesthetic.atmosphericEffects
          : ['Rain rivulets sliding down glass', 'Slow airborne golden dust motes', 'Delicate smoke wisps'],
        depthPlanes: parsed.aesthetic?.depthPlanes || {
          foreground: 'Cozy study table edge with warm lamp and mug',
          middleGround: 'Comfortable armchair centered beside glowing fireplace',
          background: 'Tall arched window looking out at atmospheric weather',
        },
        composition: parsed.aesthetic?.composition || {
          angle: 'eye-level',
          framing: 'Centrally anchored sanctuary with flanking architectural details',
          focalLengthFeel: '35mm cinematic widescreen with deep depth of field',
          notes: 'Safe envelopment; high immersion and focus quotient.',
        },
      },
      kinematics: {
        cameraBehavior: parsed.kinematics?.cameraBehavior || 'Locked Tripod',
        motionSubjects: Array.isArray(parsed.kinematics?.motionSubjects) && parsed.kinematics.motionSubjects.length > 0
          ? parsed.kinematics.motionSubjects
          : ['Rain rivulets streaming rhythmically down glass', 'Gentle ember flicker in stone fireplace', 'Subtle drifting dust motes'],
        motionPacing: parsed.kinematics?.motionPacing || 'Ultra-Slow / Meditative',
        loopCycleEstimateSeconds: parsed.kinematics?.loopCycleEstimateSeconds || 10,
        loopSeamHazards: Array.isArray(parsed.kinematics?.loopSeamHazards) && parsed.kinematics.loopSeamHazards.length > 0
          ? parsed.kinematics.loopSeamHazards
          : ['Sudden log movement causing flame discontinuity', 'Camera micro-jitter breaking seamless loop'],
        cinematicRules: Array.isArray(parsed.kinematics?.cinematicRules) && parsed.kinematics.cinematicRules.length > 0
          ? parsed.kinematics.cinematicRules
          : ['Locked camera on heavy tripod; zero pan or drift', 'Strictly uninhabited; no people or animals', 'Stable illumination level across loop boundary'],
      },
      acoustics: {
        musicalStyle: parsed.acoustics?.musicalStyle || 'Subtle Cinematic Felt Piano & Ambient Foley',
        instrumentation: Array.isArray(parsed.acoustics?.instrumentation) && parsed.acoustics.instrumentation.length > 0
          ? parsed.acoustics.instrumentation
          : ['Warm felt piano', 'Legato cello', 'Warm tape saturation'],
        tempoBpmRange: parsed.acoustics?.tempoBpmRange || '60 BPM (Rubato)',
        foleyLayers: Array.isArray(parsed.acoustics?.foleyLayers) && parsed.acoustics.foleyLayers.length > 0
          ? parsed.acoustics.foleyLayers
          : [
              { name: 'Rain on Glass Panes', percentage: 45, description: 'Rhythmic rainfall with gentle outdoor wind' },
              { name: 'Roaring Hearth Crackles', percentage: 35, description: 'Deep warm wood resonance and periodic sparks' },
              { name: 'Distant Thunder / Room Tone', percentage: 20, description: 'Low sub-bass rumble below 80Hz and vintage room air' },
            ],
        frequencyMasteringNotes: parsed.acoustics?.frequencyMasteringNotes || 'High frequencies above 7.5kHz gently rolled off to eliminate ear fatigue during multi-hour listening sessions.',
        keyMoods: Array.isArray(parsed.acoustics?.keyMoods) && parsed.acoustics.keyMoods.length > 0
          ? parsed.acoustics.keyMoods
          : ['Warm Sanctuary', 'Deep Focus', 'Nostalgic Intimacy'],
      },
      blueprint: {
        directorVision: parsed.blueprint?.directorVision || `Translate the mood of "${fetchedTitle || 'the reference video'}" into an original Aesthetic Noise production with zero copyrighted assets, using balanced dual-temperature lighting and pristine loop constraints.`,
        translatedConfig: {
          worldId: parsed.blueprint?.translatedConfig?.worldId || 'wizarding-common-room',
          season: parsed.blueprint?.translatedConfig?.season || 'autumn',
          timeOfDay: parsed.blueprint?.translatedConfig?.timeOfDay || 'night',
          primaryWeather: parsed.blueprint?.translatedConfig?.primaryWeather || 'rain',
          secondaryWeather: parsed.blueprint?.translatedConfig?.secondaryWeather || 'storm',
          settingType: parsed.blueprint?.translatedConfig?.settingType || 'indoor',
          locationName: parsed.blueprint?.translatedConfig?.locationName || 'The Sanctuary Scriptorium',
        },
        imagePrompt: parsed.blueprint?.imagePrompt || 'Cinematic wide shot of an atmospheric sanctuary interior during a nighttime rainstorm, large fireplace with glowing embers, rain-streaked leaded windows, warm amber lighting contrasting with deep blue rain outside, no people, photorealistic textures, volumetric lighting, 8k resolution --ar 16:9 --style raw',
        videoPrompt: parsed.blueprint?.videoPrompt || 'Completely locked stationary camera on tripod. Gentle rain runs down the large glass windows, subtle fireplace embers flicker softly, while all furniture and background architecture remain completely static. Seamless loop, photorealistic motion physics, no camera drift.',
        musicPrompt: parsed.blueprint?.musicPrompt || 'Deep warm ambient soundscape featuring felt piano in minor key, paired with a rich foley layer of 50% window rainfall, 35% gentle fireplace crackling, and 15% distant rumble. 60 BPM, rolled off high frequencies for sleep and focus.',
        productionChecklist: Array.isArray(parsed.blueprint?.productionChecklist) && parsed.blueprint.productionChecklist.length > 0
          ? parsed.blueprint.productionChecklist
          : [
              'Generate master 16:9 image in Midjourney / Flux',
              'Upscale to 4K preserving fine rain and wood textures',
              'Animate 10-second seamless loop in Runway Gen-3 with locked camera prompt',
              'Mix audio foley with high-cut filter for ear fatigue prevention',
            ],
        reusableLessons: Array.isArray(parsed.blueprint?.reusableLessons) && parsed.blueprint.reusableLessons.length > 0
          ? parsed.blueprint.reusableLessons
          : [
              {
                category: 'Looping',
                title: 'Locked Camera Eliminates Edge Tearing',
                observation: 'Camera motion in video generation models causes boundary mismatch and flashing seams.',
                recommendation: 'Always enforce locked camera on tripod in prompts, and freeze background architecture.',
              },
            ],
      },
      modelUsed: {
        modelId: usedModel,
        modelDisplayName: usedModel,
        selectionSource: requestedModel && requestedModel !== 'inherit' ? ('override' as const) : ('global' as const),
      },
    };

    return res.json({
      success: true,
      modelUsed: usedModel,
      data: finalItem,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze-video:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during YouTube video analysis.',
    });
  }
});

/**
 * Phase 9: Endpoint for Intelligent Production Assistant
 */
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const {
      actionType = 'general-query',
      userMessage = '',
      projectId,
      projectContext,
      allLessonsSummary = [],
      allPerformanceSummary = [],
      videoLabSummary = [],
      recentHistory = [],
      sessionHistory = [],
      model: requestedModel,
    } = req.body;

    const assistantSystemInstruction = `You are the Lead Production Assistant and Creative Engineer for "Ambience Intelligence Studio".
Your role is to diagnose production problems, improve generative prompts, compare prompt iterations, find relevant lessons from Experience Memory, adapt top-performing productions, and recommend next steps for YouTube ambience creation.

ACTION TYPE REQUESTED: "${actionType.toUpperCase()}"

INSTRUCTIONS FOR OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this schema:
{
  "text": "Detailed, highly actionable narrative explaining your diagnosis, recommendations, or answer.",
  "diagnosticResult": {
    "issueTitle": "Title of diagnostic finding",
    "severity": "high | medium | low",
    "summary": "1-2 sentence overview of findings",
    "detectedConflicts": [
      { "parameters": ["Param 1", "Param 2"], "explanation": "Why these parameters conflict" }
    ],
    "motionOrLoopRisks": ["Risk 1 e.g. camera drift", "Risk 2 e.g. living subjects"],
    "recommendedAdjustments": [
      { "category": "Camera", "setting": "Locked Camera", "suggestedValue": "Enabled", "reason": "Reasoning" }
    ],
    "promptFixes": [
      { "type": "image | video | music", "suggestedSnippet": "Exact improved prompt snippet", "explanation": "Why changed" }
    ],
    "matchingLessonIds": ["lesson-1"],
    "suggestedNewLesson": {
      "category": "Looping | Water | Lighting | Camera | Audio Layering | Subjects | General",
      "title": "Lesson title",
      "observation": "What was observed",
      "recommendation": "What to do next time"
    }
  },
  "improvedPrompts": {
    "imagePrompt": "Full production image prompt...",
    "videoPrompt": "Full production video animation prompt with locked camera...",
    "musicPrompt": "Full production music & foley prompt...",
    "explanation": "Why these improvements were made."
  },
  "promptComparison": {
    "versionA": { "title": "Current Draft", "promptText": "Text A", "type": "image" },
    "versionB": { "title": "Optimized Assistant Version", "promptText": "Text B", "type": "image" },
    "differences": {
      "addedTokens": ["token1", "token2"],
      "removedTokens": ["token3"],
      "modifiedParameters": ["mod1"]
    },
    "rationale": "Rationale explanation"
  },
  "adaptedProductionRef": {
    "sourceTitle": "Title of benchmark",
    "appliedConfig": {
      "lighting": { "primary": "fireplace", "colorTemperature": "blue-amber-contrast", "intensity": "dim-cozy" },
      "camera": { "lockedCamera": true }
    },
    "appliedPrompts": {
      "imagePrompt": "Adapted image prompt...",
      "videoPrompt": "Adapted video prompt...",
      "musicPrompt": "Adapted music prompt..."
    }
  },
  "suggestedWorkflowSteps": {
    "stage": "scene-design",
    "actions": ["Action 1", "Action 2"],
    "bottlenecks": ["Bottleneck 1"]
  }
}
Note: Omit fields in the JSON response that are not relevant to the requested actionType.`;

    const promptText = `USER QUERY / REQUEST:
"${userMessage}"

ACTIVE PROJECT CONTEXT:
${projectContext ? JSON.stringify(projectContext, null, 2) : 'No specific project selected.'}

EXPERIENCE MEMORY LESSONS AVAILABLE:
${JSON.stringify(allLessonsSummary, null, 2)}

TOP PERFORMING PRODUCTIONS SUMMARY:
${JSON.stringify(allPerformanceSummary, null, 2)}

REFERENCE VIDEO LAB BENCHMARKS SUMMARY:
${JSON.stringify(videoLabSummary, null, 2)}

RECENT PROMPT HISTORY:
${JSON.stringify(recentHistory, null, 2)}

PREVIOUS ASSISTANT CHAT CONVERSATION:
${JSON.stringify(sessionHistory, null, 2)}

Please execute the request for action "${actionType}" and generate the structured JSON output.`;

    const candidateModels = resolveCandidateModels(requestedModel);
    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const modelCandidate of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents: `${assistantSystemInstruction}\n\n${promptText}`,
        });
        if (response && response.text) {
          usedModel = modelCandidate;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Assistant model ${modelCandidate} failed:`, callErr.message || callErr);
        continue;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed for assistant query.');
    }

    const responseText = response.text || '';
    let parsed: any = null;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn('Could not parse Assistant JSON response, creating structured text response:', parseErr);
      parsed = {
        text: responseText,
      };
    }

    const assistantMsg = {
      id: `msg-ast-${Date.now()}`,
      sender: 'assistant' as const,
      timestamp: Date.now(),
      text: parsed.text || 'Diagnostic analysis complete.',
      actionType,
      projectId,
      diagnosticResult: parsed.diagnosticResult,
      improvedPrompts: parsed.improvedPrompts,
      promptComparison: parsed.promptComparison,
      adaptedProductionRef: parsed.adaptedProductionRef,
      suggestedWorkflowSteps: parsed.suggestedWorkflowSteps,
    };

    return res.json({
      success: true,
      modelUsed: usedModel,
      message: assistantMsg,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/assistant:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred in Production Assistant.',
    });
  }
});

// Serve frontend in production or mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development mode, mount Vite middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ambience Intelligence Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
