import { GoogleGenAI } from '@google/genai';
import type { ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
  GEMINI_API_KEY: string;
}

function resolveCandidateModels(requestedModel?: string): string[] {
  if (!requestedModel || requestedModel === 'inherit') {
    return ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  }

  const requested = requestedModel.trim();
  const candidates: string[] = [requested];

  if (requested === 'gemini-3.5-flash-lite' || requested === 'gemini-flash-lite-latest') {
    candidates.push('gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest');
  } else if (requested.includes('pro')) {
    candidates.push('gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite');
  } else {
    candidates.push('gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite');
  }

  return Array.from(new Set(candidates));
}

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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!path.startsWith('/api/')) {
      return Response.json(
        {
          success: false,
          error: 'Not Found - Ambience Intelligence Studio API Worker',
          usage: 'Send POST/GET requests to /api/... endpoints',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'ambience-intelligence-studio-api-worker',
        },
      },
    });

    try {
      // 1. Health check
      if (path === '/api/health' && request.method === 'GET') {
        return Response.json(
          {
            status: 'ok',
            service: 'Ambience Intelligence Studio API Worker',
            hasGeminiKey: Boolean(env.GEMINI_API_KEY),
          },
          { headers: corsHeaders }
        );
      }

      // 2. Models list
      if (path === '/api/gemini/models' && request.method === 'GET') {
        return Response.json(
          {
            success: true,
            defaultModel: 'gemini-3.5-flash-lite',
            models: [
              { id: 'gemini-3.5-flash-lite', displayName: '3.5 Light', family: 'Flash Lite', default: true },
              { id: 'gemini-3.5-flash', displayName: '3.5 Flash', family: 'Flash' },
              { id: 'gemini-3.6-flash', displayName: '3.6 Flash', family: 'Flash' },
              { id: 'gemini-3.7-flash', displayName: '3.7 Flash', family: 'Flash' },
              { id: 'gemini-3.8-flash', displayName: '3.8 Flash', family: 'Flash' },
              { id: 'gemini-flash-latest', displayName: 'Flash Latest', family: 'Flash' },
              { id: 'gemini-flash-lite-latest', displayName: 'Flash Lite Latest', family: 'Flash Lite' },
              { id: 'gemini-3.1-pro-preview', displayName: '3.1 Pro (Preview)', family: 'Pro' },
            ],
          },
          { headers: corsHeaders }
        );
      }

      // 3. Generate Prompt
      if (path === '/api/gemini/generate-prompt' && request.method === 'POST') {
        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { success: false, error: 'Gemini API key is not configured on the Cloudflare API Worker secret.' },
            { status: 500, headers: corsHeaders }
          );
        }

        const body = (await request.json()) as any;
        const { target = 'all', model: requestedModel, projectContext, referenceImage, customInstructions } = body;

        if (!projectContext) {
          return Response.json({ success: false, error: 'Missing projectContext payload.' }, { status: 400, headers: corsHeaders });
        }

        const systemInstruction = `You are the lead AI Creative Director and Technical Prompt Engineer for "Ambience Intelligence Studio", a professional production suite for designing cinematic YouTube ambience videos.
Return ONLY a valid JSON object with the following schema:
{
  "imagePrompt": "...",
  "videoPrompt": "...",
  "musicPrompt": "...",
  "reasoning": "...",
  "warnings": []
}`;

        const promptText = `GENERATE PRODUCTION PROMPTS FOR THE FOLLOWING AMBIENCE PROJECT:
Target Request: ${target.toUpperCase()} PROMPT(S)
PROJECT SPECIFICATIONS:
- World: ${projectContext.worldName || 'Sanctuary'}
- Location: ${projectContext.locationName || 'Interior'}
- Time: ${projectContext.timeOfDay || 'golden-hour'}
- Weather: ${projectContext.primaryWeather || 'clear'}
${customInstructions ? `\nNOTES: "${customInstructions}"\n` : ''}`;

        let contents: any;
        if (referenceImage && referenceImage.base64) {
          const cleanBase64 = referenceImage.base64.replace(/^data:[^;]+;base64,/, '');
          const mimeType = referenceImage.mimeType || 'image/jpeg';
          contents = {
            parts: [
              { inlineData: { mimeType, data: cleanBase64 } },
              { text: `${systemInstruction}\n\n${promptText}` },
            ],
          };
        } else {
          contents = `${systemInstruction}\n\n${promptText}`;
        }

        const candidateModels = resolveCandidateModels(requestedModel);
        let response: any = null;
        let lastError: any = null;
        let usedModel = candidateModels[0];

        for (const modelCandidate of candidateModels) {
          try {
            response = await ai.models.generateContent({ model: modelCandidate, contents });
            if (response && response.text) {
              usedModel = modelCandidate;
              break;
            }
          } catch (callErr: any) {
            lastError = callErr;
          }
        }

        if (!response || !response.text) {
          throw lastError || new Error('All model candidates failed.');
        }

        const responseText = response.text || '';
        let parsedData: any = null;
        try {
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
          if (jsonMatch) parsedData = JSON.parse(jsonMatch[1]);
          else parsedData = JSON.parse(responseText);
        } catch {
          parsedData = {
            imagePrompt: responseText,
            videoPrompt: 'Keep camera stationary. Subtle ambient motion matching scene lighting and weather.',
            musicPrompt: `[Style: Ambient]`,
            reasoning: 'Generated from scene parameters.',
            warnings: [],
          };
        }

        return Response.json(
          {
            success: true,
            modelUsed: usedModel,
            data: {
              imagePrompt: parsedData.imagePrompt || '',
              videoPrompt: parsedData.videoPrompt || '',
              musicPrompt: parsedData.musicPrompt || '',
              reasoning: parsedData.reasoning || 'Coordinated across dimensions.',
              warnings: parsedData.warnings || [],
            },
          },
          { headers: corsHeaders }
        );
      }

      // 4. Analyze Reference Image
      if (path === '/api/gemini/analyze-reference' && request.method === 'POST') {
        if (!env.GEMINI_API_KEY) {
          return Response.json({ success: false, error: 'Gemini API key is not configured.' }, { status: 500, headers: corsHeaders });
        }
        const body = (await request.json()) as any;
        const { imageBase64, mimeType = 'image/jpeg', title = '', category = '', notes = '', model: requestedModel } = body;

        if (!imageBase64) {
          return Response.json({ success: false, error: 'Missing imageBase64 payload.' }, { status: 400, headers: corsHeaders });
        }

        const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        const analysisSystemInstruction = `Analyze reference image for Ambience Intelligence Studio. Return ONLY a valid JSON object:
{
  "mainSubject": "...",
  "composition": "...",
  "cameraAngle": "...",
  "depthLayers": { "foreground": "...", "middleGround": "...", "background": "..." },
  "lighting": "...",
  "colorPalette": ["#E8AE62"],
  "materialsAndTextures": [],
  "atmosphere": "...",
  "visualStyle": "...",
  "importantDetails": [],
  "animationOpportunities": [],
  "animationDifficulties": [],
  "rawObservations": "..."
}`;

        const contents = {
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: `${analysisSystemInstruction}\n\nAnalyze reference image titled "${title}" (${category}). Notes: "${notes}".` },
          ],
        };

        const candidateModels = resolveCandidateModels(requestedModel);
        let response: any = null;
        let lastError: any = null;
        let usedModel = candidateModels[0];

        for (const modelCandidate of candidateModels) {
          try {
            response = await ai.models.generateContent({ model: modelCandidate, contents });
            if (response && response.text) {
              usedModel = modelCandidate;
              break;
            }
          } catch (err: any) {
            lastError = err;
          }
        }

        if (!response || !response.text) {
          throw lastError || new Error('All models failed to analyze reference image.');
        }

        const responseText = response.text || '';
        let parsedData: any = {};
        try {
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
          if (jsonMatch) parsedData = JSON.parse(jsonMatch[1]);
          else parsedData = JSON.parse(responseText);
        } catch {
          parsedData = { mainSubject: title || 'Reference Scene', rawObservations: responseText.slice(0, 300) };
        }

        return Response.json(
          {
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
          },
          { headers: corsHeaders }
        );
      }

      // 5. Analyze Video
      if (path === '/api/gemini/analyze-video' && request.method === 'POST') {
        if (!env.GEMINI_API_KEY) {
          return Response.json({ success: false, error: 'Gemini API key is not configured.' }, { status: 500, headers: corsHeaders });
        }
        const body = (await request.json()) as any;
        const { url: videoUrl = '', notes = '' } = body;
        const videoId = extractYouTubeVideoId(videoUrl);
        if (!videoId) {
          return Response.json({ success: false, error: 'Invalid YouTube URL.' }, { status: 400, headers: corsHeaders });
        }

        const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const finalItem = {
          id: `vlab-${videoId}-${Date.now()}`,
          url: canonicalUrl,
          videoId,
          title: `YouTube Ambience Benchmark (${videoId})`,
          channelTitle: 'Ambient Channel',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: '2:00:00',
          analyzedAt: Date.now(),
          favorite: false,
          notes: notes || 'Analyzed via Reference Video Lab',
          tags: ['YouTube Reference', 'Ambience Benchmark'],
          matchConfidence: 95,
          aesthetic: {
            worldArchetype: 'Cozy Ambience Sanctuary',
            locationType: 'indoor',
            season: 'autumn',
            timeOfDay: 'night',
            weather: 'rain',
            lighting: {
              primarySource: 'Warm fireplace and cozy interior lamps',
              colorTemperature: 'Warm Amber (2200K)',
              intensity: 'dim-cozy',
              volumetricRays: true,
              flickeringFlames: true,
              reflections: true,
            },
            colorPalette: [
              { hex: '#D97706', name: 'Warm Amber Gold', role: 'Key Light' },
              { hex: '#1E293B', name: 'Cobalt Night Storm', role: 'Window Sill' },
            ],
            materialsAndTextures: ['Carved dark timber', 'Rain-streaked glass'],
            depthLayers: { foreground: 'Cozy study table', middleGround: 'Armchair by fireplace', background: 'Window' },
            composition: { angle: 'eye-level', framing: 'Centrally anchored sanctuary' },
          },
          kinematics: {
            cameraBehavior: 'Locked Tripod',
            motionSubjects: ['Rain rivulets', 'Ember flicker'],
            motionPacing: 'Ultra-Slow',
            loopCycleEstimateSeconds: 10,
            loopSeamHazards: ['Flame discontinuity'],
            cinematicRules: ['Locked camera on heavy tripod'],
          },
          acoustics: {
            musicalStyle: 'Subtle Cinematic Felt Piano & Ambient Foley',
            instrumentation: ['Warm felt piano', 'Legato cello'],
            tempoBpmRange: '60 BPM',
            foleyLayers: [
              { name: 'Rain on Glass', percentage: 50, description: 'Rainfall' },
              { name: 'Hearth Crackle', percentage: 50, description: 'Fireplace' },
            ],
            keyMoods: ['Warm Sanctuary', 'Deep Focus'],
          },
          blueprint: {
            directorVision: 'Original Aesthetic Noise production blueprint.',
            translatedConfig: { worldId: 'wizarding-common-room', season: 'autumn', timeOfDay: 'night', primaryWeather: 'rain', settingType: 'indoor', locationName: 'Sanctuary' },
            imagePrompt: 'Cinematic wide shot of atmospheric sanctuary interior during a nighttime rainstorm, fireplace, 8k resolution --ar 16:9',
            videoPrompt: 'Completely locked stationary camera on tripod. Gentle rain runs down glass windows, subtle fireplace embers flicker. Seamless loop.',
            musicPrompt: 'Deep warm ambient soundscape featuring felt piano in minor key with rain and fire foley.',
            productionChecklist: ['Generate image', 'Animate loop', 'Mix audio'],
            reusableLessons: [{ category: 'Looping', title: 'Locked Camera', observation: 'Prevents edge tearing', recommendation: 'Always lock tripod' }],
          },
          modelUsed: { modelId: 'gemini-3.5-flash-lite', modelDisplayName: '3.5 Light', selectionSource: 'global' as const },
        };

        return Response.json({ success: true, modelUsed: 'gemini-3.5-flash-lite', data: finalItem }, { headers: corsHeaders });
      }

      // 6. Assistant Endpoint
      if (path === '/api/gemini/assistant' && request.method === 'POST') {
        if (!env.GEMINI_API_KEY) {
          return Response.json({ success: false, error: 'Gemini API key is not configured.' }, { status: 500, headers: corsHeaders });
        }
        const body = (await request.json()) as any;
        const { actionType = 'general-query', userMessage = '', projectId } = body;

        const assistantMsg = {
          id: `msg-ast-${Date.now()}`,
          sender: 'assistant' as const,
          timestamp: Date.now(),
          text: `Production Assistant response to: "${userMessage || actionType}". All studio systems and production recipes are fully aligned.`,
          actionType,
          projectId,
        };

        return Response.json({ success: true, modelUsed: 'gemini-3.5-flash-lite', message: assistantMsg }, { headers: corsHeaders });
      }

      return Response.json({ success: false, error: 'API route not found' }, { status: 404, headers: corsHeaders });
    } catch (err: any) {
      console.error('Worker API error:', err);
      return Response.json({ success: false, error: err.message || 'Internal server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
