import type { ModelParamsSchema, VideoModelParamsSchema } from '../standard-parameters';
import type {
  AIChatModelCard,
  AIImageModelCard,
  AISTTModelCard,
  AIVideoModelCard,
} from '../types/aiModel';

const openrouterImageParameters: ModelParamsSchema = {
  aspectRatio: {
    default: 'auto',
    enum: ['auto', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
  },
  prompt: { default: '' },
  resolution: {
    default: '1K',
    enum: ['512', '1K', '2K', '4K'],
  },
};

const openrouterGrokImagineVideoParameters: VideoModelParamsSchema = {
  aspectRatio: {
    default: '16:9',
    enum: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
  },
  duration: { default: 8, max: 15, min: 1 },
  imageUrl: {
    default: null,
  },
  prompt: { default: '' },
  resolution: {
    default: '480p',
    enum: ['480p', '720p'],
  },
  size: {
    default: '848x480',
    enum: ['848x480', '1696x960', '1280x720', '1920x1080'],
  },
};

const openrouterVeoVideoParameters: VideoModelParamsSchema = {
  aspectRatio: {
    default: '16:9',
    enum: ['16:9', '9:16'],
  },
  duration: { default: 8, enum: [4, 6, 8] },
  endImageUrl: {
    default: null,
  },
  imageUrls: {
    default: [],
    maxCount: 3,
  },
  prompt: { default: '' },
  resolution: {
    default: '720p',
    enum: ['720p', '1080p', '4k'],
  },
  seed: { default: null },
};

const openrouterKlingVideoParameters: VideoModelParamsSchema = {
  aspectRatio: {
    default: '16:9',
    enum: ['16:9', '9:16', '1:1'],
  },
  duration: { default: 5, max: 12, min: 3 },
  endImageUrl: {
    default: null,
  },
  imageUrl: {
    default: null,
  },
  prompt: { default: '' },
  resolution: {
    default: '1080p',
    enum: ['720p', '1080p'],
  },
  seed: { default: null },
};

const withOpenRouterPrefix = <
  T extends AIChatModelCard | AIImageModelCard | AISTTModelCard | AIVideoModelCard,
>(
  models: T[],
): T[] => models.flatMap((model) => [model, { ...model, id: `openrouter/${model.id}` }]);

const freeTokenPricing = {
  units: [
    { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
    { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
  ],
} satisfies AIChatModelCard['pricing'];

// https://openrouter.ai/docs/api-reference/list-available-models
const openrouterImageModels: AIImageModelCard[] = withOpenRouterPrefix([
  {
    description:
      'GPT 5.4 Image 2 through OpenRouter for text-to-image generation and image editing via an OpenAI-compatible image route.',
    displayName: 'GPT 5.4 Image 2',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.4',
    id: 'openai/gpt-5.4-image-2',
    organization: 'OpenAI',
    parameters: openrouterImageParameters,
    type: 'image',
  },
  {
    contextWindowTokens: 65_536 + 65_536,
    description:
      'Gemini 3.1 Flash Image Preview, a.k.a. "Nano Banana 2," through OpenRouter. It delivers Pro-level visual quality at Flash speed for text-to-image generation, contextual understanding, and iterative image editing.',
    displayName: 'Nano Banana 2',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-3.1',
    id: 'google/gemini-3.1-flash-image-preview',
    knowledgeCutoff: '2025-01',
    maxOutput: 65_536,
    organization: 'Google',
    parameters: openrouterImageParameters,
    pricing: {
      approximatePricePerImage: 0.067,
      units: [
        { name: 'imageOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-02-26',
    type: 'image',
  },
  {
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image, a.k.a. "Nano Banana," through OpenRouter. It is a fast image generation and editing model with strong contextual understanding for generation, edits, and multi-turn creative workflows.',
    displayName: 'Nano Banana',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-2.5',
    id: 'google/gemini-2.5-flash-image',
    knowledgeCutoff: '2025-06',
    maxOutput: 8192,
    organization: 'Google',
    parameters: openrouterImageParameters,
    pricing: {
      approximatePricePerImage: 0.039,
      units: [
        { name: 'imageOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-07',
    type: 'image',
  },
  {
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Gemini 3 Pro Image Preview, a.k.a. "Nano Banana Pro," through OpenRouter. It focuses on high-fidelity visual synthesis, multimodal reasoning, real-world grounding, and complex image generation such as infographics, diagrams, and cinematic composites.',
    displayName: 'Nano Banana Pro',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-3',
    id: 'google/gemini-3-pro-image-preview',
    knowledgeCutoff: '2025-01',
    maxOutput: 32_768,
    organization: 'Google',
    parameters: openrouterImageParameters,
    pricing: {
      approximatePricePerImage: 0.134,
      units: [
        { name: 'imageOutput', rate: 120, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-20',
    type: 'image',
  },
]);

const openrouterVideoModels: AIVideoModelCard[] = withOpenRouterPrefix([
  {
    description:
      'Grok Imagine Video through OpenRouter for text-to-video and image-to-video generation, balancing quality, cost, and latency.',
    displayName: 'Grok Imagine Video',
    enabled: true,
    id: 'x-ai/grok-imagine-video',
    organization: 'xAI',
    parameters: openrouterGrokImagineVideoParameters,
    pricing: {
      units: [{ name: 'videoGeneration', rate: 0.05, strategy: 'fixed', unit: 'second' }],
    },
    releasedAt: '2026-01-28',
    type: 'video',
  },
  {
    description:
      'Veo 3.1 Fast through OpenRouter for fast text-to-video generation with optional image references, aspect-ratio control, duration presets, and 720p/1080p/4k output options.',
    displayName: 'Veo 3.1 Fast',
    enabled: true,
    id: 'google/veo-3.1-fast',
    organization: 'Google',
    parameters: openrouterVeoVideoParameters,
    pricing: {
      units: [{ name: 'videoGeneration', rate: 0.35, strategy: 'fixed', unit: 'second' }],
    },
    releasedAt: '2026-01-13',
    type: 'video',
  },
  {
    description:
      'Kling v3.0 Pro through OpenRouter for text-to-video and image-to-video generation with storyboard-oriented scene understanding, motion consistency, and 720p/1080p output.',
    displayName: 'Kling v3.0 Pro',
    enabled: true,
    id: 'kwaivgi/kling-v3.0-pro',
    organization: 'Kuaishou',
    parameters: openrouterKlingVideoParameters,
    type: 'video',
  },
]);

const openrouterSTTModels: AISTTModelCard[] = [
  {
    description:
      'Private OpenRouter speech recognition model alias for Qwen3-ASR-1.7B. The Apache-2.0 Qwen3-ASR family supports language identification and ASR for 30 languages plus 22 Chinese dialects, covering offline and streaming inference for speech, singing voice, and songs with background music. The Hugging Face release provides transformers and vLLM backends, forced alignment timestamps through Qwen3-ForcedAligner-0.6B, and vLLM serving with OpenAI-compatible transcription APIs.',
    displayName: 'Qwen3-ASR-1.7B（私有化）',
    enabled: true,
    family: 'qwen',
    generation: 'qwen3-asr',
    id: 'Qwen3-ASR-1.7B',
    organization: 'Qwen',
    type: 'stt',
  },
];

const openrouterChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 2_000_000,
    description:
      'Based on context length, topic, and complexity, your request is routed to Llama 3 70B Instruct, Claude 3.5 Sonnet (self-moderated), or GPT-4o.',
    displayName: 'Auto (best for prompt)',
    enabled: true,
    id: 'openrouter/auto',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Local vLLM deployment alias for Qwen3.6-35B-A3B. This Apache-2.0 open-weight Qwen model uses a sparse MoE architecture with 35B total parameters and 3B activated per token, combining Gated DeltaNet linear attention with gated attention layers. The Hugging Face release is a causal language model with a vision encoder, compatible with Transformers, vLLM, and SGLang, and supports OpenAI-compatible chat completions for text, image, and video understanding. It provides thinking mode, tool calling, structured output, and reasoning trace preservation for multi-turn work, with strong agentic coding, repository-level reasoning, math/code reasoning, spatial intelligence, object localization, and target detection. Native context is 262K tokens and can be extended to about 1.01M tokens.',
    displayName: 'Qwen3.6-35B-A3B（私有化）',
    enabled: true,
    family: 'qwen',
    generation: 'qwen3.6',
    id: 'Qwen3.6-35B-A3B',
    maxOutput: 65_536,
    organization: 'Qwen',
    pricing: freeTokenPricing,
    releasedAt: '2026-04-16',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Local vLLM deployment alias for Qwen3.6-27B. This Apache-2.0 open-weight dense Qwen3.6 model has 27B parameters and is released as a causal language model with a vision encoder. Its Hugging Face card provides Transformers and vLLM examples with OpenAI-compatible chat completions, including image inputs, and the benchmark section covers both vision-language and video understanding. The architecture alternates Gated DeltaNet linear-attention blocks with gated attention blocks and FFN layers, includes MTP training, supports thinking mode by default, tool calling, structured output, and long agent workflows. Native context is 262K tokens and can be extended to about 1.01M tokens.',
    displayName: 'Qwen3.6-27B（私有化）',
    enabled: true,
    family: 'qwen',
    generation: 'qwen3.6',
    id: 'Qwen3.6-27B',
    maxOutput: 65_536,
    organization: 'Qwen',
    pricing: freeTokenPricing,
    releasedAt: '2026-04-23',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Private OpenRouter/vLLM deployment alias for Qwen3-8B. Qwen3-8B is an Apache-2.0 dense 8.2B-parameter causal language model from the Qwen3 series, designed for reasoning-heavy tasks and efficient dialogue. It supports switching between thinking mode for math, coding, and logical inference, and non-thinking mode for general conversation. The Hugging Face release supports Transformers, vLLM, and SGLang with OpenAI-compatible chat completions, strong instruction following, agent integration, creative writing, and multilingual use across 100+ languages and dialects. Native context is 32K tokens and can be extended to 131K tokens with YaRN.',
    displayName: 'Qwen3-8B（私有化）',
    enabled: true,
    family: 'qwen',
    generation: 'qwen3',
    id: 'qwen3-8b',
    knowledgeCutoff: '2025-03',
    maxOutput: 32_768,
    organization: 'Qwen',
    pricing: freeTokenPricing,
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Local vLLM deployment alias for DeepSeek-V4-Flash. This DeepSeek V4 MoE language model is designed for high-throughput local or private inference, with 284B total parameters, 13B activated parameters, and a 1M-token context window. The DeepSeek V4 series uses a hybrid attention architecture that combines Compressed Sparse Attention (CSA) and Heavily Compressed Attention (HCA), plus mHC and the Muon optimizer for stable and efficient long-context reasoning. Flash keeps the V4 reasoning, coding, and agent capabilities while prioritizing lower latency and deployment efficiency. It supports non-thinking, Think High, and Think Max reasoning-effort modes through the DeepSeek V4 chat template.',
    displayName: 'DeepSeek-V4-Flash（私有化）',
    enabled: true,
    family: 'deepseek',
    generation: 'deepseek-v4',
    id: 'DeepSeek-V4-Flash',
    maxOutput: 393_216,
    organization: 'DeepSeek',
    pricing: freeTokenPricing,
    releasedAt: '2026-04-24',
    settings: {
      extendParams: ['deepseekV4ReasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Local vLLM deployment alias for DeepSeek-V4-Pro. This flagship DeepSeek V4 MoE language model has 1.6T total parameters, 49B activated parameters, and a 1M-token context window. It uses the V4 hybrid CSA + HCA attention design to improve million-token inference efficiency, with mHC for signal propagation stability and the Muon optimizer for convergence. Pro targets high-complexity reasoning, code generation, long-context understanding, and agent workflows. Its instruct model supports non-thinking, Think High, and Think Max reasoning-effort modes, with the Max mode aimed at pushing reasoning depth for difficult coding, math, planning, and tool-use tasks.',
    displayName: 'DeepSeek-V4-Pro（私有化）',
    enabled: true,
    family: 'deepseek',
    generation: 'deepseek-v4',
    id: 'DeepSeek-V4-Pro',
    maxOutput: 393_216,
    organization: 'DeepSeek',
    pricing: freeTokenPricing,
    releasedAt: '2026-04-24',
    settings: {
      extendParams: ['deepseekV4ReasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-V3.1 is a large hybrid reasoning model with 128K context and efficient mode switching, delivering excellent performance and speed for tool use, code generation, and complex reasoning.',
    displayName: 'DeepSeek V3.1',
    family: 'deepseek',
    generation: 'deepseek-v3.1',
    id: 'deepseek/deepseek-chat-v3.1',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-21',
    type: 'chat',
  },
  ...withOpenRouterPrefix([
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 262_144,
      description:
        'Gemma 4 31B Instruct is Google DeepMind\'s Apache-2.0 dense multimodal model with 30.7B parameters. It supports text and image input with text output, a 256K-token context window, configurable thinking mode, native function calling, multilingual use across 140+ languages, and strong coding, reasoning, and document understanding. The Hugging Face release supports Transformers, vLLM, and SGLang through OpenAI-compatible chat completions.',
      displayName: 'Gemma 4 31B Free',
      enabled: true,
      family: 'gemma',
      generation: 'gemma-4',
      id: 'google/gemma-4-31b-it:free',
      organization: 'Google',
      pricing: freeTokenPricing,
      releasedAt: '2026-04-02',
      settings: {
        extendParams: ['enableReasoning', 'reasoningBudgetToken'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 1_000_000,
      description:
        'Qwen3.5-Flash is a native vision-language Flash model built on Qwen\'s hybrid linear-attention and sparse-MoE architecture. It is optimized for fast responses while balancing inference speed and quality across pure-text and multimodal tasks, with a 1M-token context window and strong improvements over the Qwen 3 series.',
      displayName: 'Qwen3.5 Flash',
      enabled: true,
      family: 'qwen',
      generation: 'qwen3.5',
      id: 'qwen/qwen3.5-flash-02-23',
      organization: 'Qwen',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.065, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 0.26, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-02-25',
      settings: {
        extendParams: ['enableReasoning', 'reasoningBudgetToken'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
      },
      contextWindowTokens: 202_752,
      description:
        'GLM-4.7-Flash is a 30B-class Z.ai model that balances performance and efficiency. It is optimized for agentic coding, long-horizon task planning, tool collaboration, and open-source same-size benchmark performance, with a 203K context window. The OpenRouter model links to open weights on Hugging Face.',
      displayName: 'GLM 4.7 Flash',
      enabled: true,
      family: 'glm',
      generation: 'glm-4.7',
      id: 'z-ai/glm-4.7-flash',
      organization: 'Z.ai',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.06, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-01-19',
      settings: {
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        search: true,
      },
      contextWindowTokens: 262_144,
      description:
        'Qwen3-Coder-Next is an open-weight causal language model for coding agents and local development. It uses a sparse MoE design with 80B total parameters and 3B activated per token, plus a 256K native context window. Hugging Face highlights long-horizon coding, complex tool use, execution-failure recovery, and real-world CLI/IDE integration. It runs in non-thinking mode and does not emit think blocks.',
      displayName: 'Qwen3 Coder Next',
      enabled: true,
      family: 'qwen',
      generation: 'qwen3-coder',
      id: 'qwen/qwen3-coder-next',
      maxOutput: 262_144,
      organization: 'Qwen',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.11, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-02-04',
      settings: {
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 1_048_576,
      description:
        'Gemini 3.1 Flash Lite Preview is Google\'s high-efficiency Gemini 3.1 model for high-volume use cases. It improves over Gemini 2.5 Flash Lite and approaches Gemini 2.5 Flash across key capabilities, including audio input and ASR, RAG snippet ranking, translation, data extraction, and code completion. It supports full thinking levels for cost/performance trade-offs.',
      displayName: 'Gemini 3.1 Flash Lite Preview',
      enabled: true,
      family: 'gemini',
      generation: 'gemini-3.1',
      id: 'google/gemini-3.1-flash-lite-preview',
      maxOutput: 65_536,
      organization: 'Google',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-03-03',
      settings: {
        extendParams: ['thinkingLevel', 'urlContext'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
      },
      contextWindowTokens: 205_000,
      description:
        'MiniMax M2.7 is an open-weight, agent-oriented model for autonomous real-world productivity. It emphasizes multi-agent collaboration, planning, execution, and refinement across dynamic workflows. The Hugging Face card highlights production debugging, root-cause analysis, financial modeling, editable Word/Excel/PowerPoint generation, 56.22% on SWE-Pro, 57.0% on Terminal Bench 2, and native Agent Teams. MiniMax recommends SGLang, vLLM, Transformers, ModelScope, or NVIDIA NIM for deployment.',
      displayName: 'MiniMax M2.7',
      enabled: true,
      family: 'minimax',
      generation: 'minimax-m2.7',
      id: 'minimax/minimax-m2.7',
      organization: 'MiniMax',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-03-18',
      settings: {
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        video: true,
        vision: true,
      },
      contextWindowTokens: 1_000_000,
      description:
        'Qwen3.6 Plus builds on a hybrid architecture combining efficient linear attention with sparse MoE routing. Compared with the Qwen 3.5 series, it improves agentic coding, frontend development, reasoning, multimodal capability, and repository-level problem solving, with OpenRouter noting a 78.8 score on SWE-bench Verified and strong performance on complex tasks such as 3D scenes and games.',
      displayName: 'Qwen3.6 Plus',
      enabled: true,
      family: 'qwen',
      generation: 'qwen3.6',
      id: 'qwen/qwen3.6-plus',
      organization: 'Qwen',
      pricing: {
        units: [
          { name: 'textInput', rate: 0.325, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 1.95, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-04-02',
      settings: {
        extendParams: ['enableReasoning', 'reasoningBudgetToken', 'preserveThinking'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        structuredOutput: true,
        video: true,
        vision: true,
      },
      contextWindowTokens: 1_048_576,
      description:
        'Gemini 3.1 Pro Preview is Google\'s frontier reasoning model for complex workflows. It combines text, image, video, audio, and code understanding with a 1M-token context window, stronger software engineering performance, improved agentic reliability, reasoning-details preservation for multi-turn tool calling, better long-horizon tool orchestration, and a new medium thinking level for cost/speed/performance balance.',
      displayName: 'Gemini 3.1 Pro Preview',
      enabled: true,
      family: 'gemini',
      generation: 'gemini-3.1',
      id: 'google/gemini-3.1-pro-preview',
      maxOutput: 65_536,
      organization: 'Google',
      pricing: {
        units: [
          { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-02-19',
      settings: {
        extendParams: ['thinkingLevel', 'urlContext'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 1_050_000,
      description:
        'GPT-5.4 is OpenAI\'s frontier model on OpenRouter, unifying Codex and GPT-style workflows into a single system. It supports text and image inputs, a 1M+ token window with 922K input and 128K output, high-context reasoning, coding, multimodal analysis, document understanding, tool use, instruction following, and complex multi-step software engineering workflows with fewer iterations.',
      displayName: 'GPT-5.4',
      enabled: true,
      family: 'gpt',
      generation: 'gpt-5.4',
      id: 'openai/gpt-5.4',
      maxOutput: 128_000,
      organization: 'OpenAI',
      pricing: {
        units: [
          { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-03-05',
      settings: {
        extendParams: ['enableReasoning', 'reasoningBudgetToken'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 1_000_000,
      description:
        'Claude Sonnet 4.6 is Anthropic\'s most capable Sonnet-class model on OpenRouter, with frontier performance across coding, agents, and professional work. It is suited for iterative development, complex codebase navigation, end-to-end project management with memory, polished document creation, confident computer use, web QA, and workflow automation.',
      displayName: 'Claude Sonnet 4.6',
      enabled: true,
      family: 'claude-sonnet',
      generation: 'claude-4.6',
      id: 'anthropic/claude-sonnet-4.6',
      maxOutput: 64_000,
      organization: 'Anthropic',
      pricing: {
        units: [
          { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-02-17',
      settings: {
        extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
    {
      abilities: {
        files: true,
        functionCall: true,
        reasoning: true,
        search: true,
        vision: true,
      },
      contextWindowTokens: 1_000_000,
      description:
        'Claude Opus 4.8 is Anthropic\'s most capable generally available Opus-family model on OpenRouter. It supports text, image, and file inputs with text output, reasoning, and a 1M-token context window. It is aimed at highly autonomous agents, long-horizon agentic work, memory-driven tasks, multi-step reasoning, complex coding, project orchestration, multi-stage debugging, long-running asynchronous agent pipelines, document drafting, presentation building, and data analysis.',
      displayName: 'Claude Opus 4.8',
      enabled: true,
      family: 'claude-opus',
      generation: 'claude-4.8',
      id: 'anthropic/claude-opus-4.8',
      maxOutput: 64_000,
      organization: 'Anthropic',
      pricing: {
        units: [
          { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 25, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
      releasedAt: '2026-05-27',
      settings: {
        extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
        searchImpl: 'params',
      },
      type: 'chat',
    },
  ]),
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 65_536 + 65_536,
    description:
      'Gemini 3.1 Flash Image Preview, a.k.a. "Nano Banana 2," is Google’s latest state of the art image generation and editing model, delivering Pro-level visual quality at Flash speed. It combines advanced contextual understanding with fast, cost-efficient inference, making complex image generation and iterative edits significantly more accessible.',
    displayName: 'Nano Banana 2',
    family: 'gemini',
    generation: 'gemini-3.1',
    id: 'google/gemini-3.1-flash-image-preview',
    knowledgeCutoff: '2025-01',
    maxOutput: 65_536,
    pricing: {
      approximatePricePerImage: 0.067,
      units: [
        { name: 'imageOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-02-26',
    settings: {
      extendParams: ['imageAspectRatio2', 'imageResolution2', 'thinkingLevel4'],
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Nano Banana Pro is Google’s most advanced image-generation and editing model, built on Gemini 3 Pro. It extends the original Nano Banana with significantly improved multimodal reasoning, real-world grounding, and high-fidelity visual synthesis. The model generates context-rich graphics, from infographics and diagrams to cinematic composites, and can incorporate real-time information via Search grounding.',
    displayName: 'Nano Banana Pro',
    family: 'gemini',
    generation: 'gemini-3',
    id: 'google/gemini-3-pro-image-preview',
    knowledgeCutoff: '2025-01',
    maxOutput: 32_768,
    pricing: {
      approximatePricePerImage: 0.134,
      units: [
        { name: 'imageOutput', rate: 120, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-20',
    settings: {
      extendParams: ['imageAspectRatio', 'imageResolution'],
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image, a.k.a. "Nano Banana," is now generally available. It is a state of the art image generation model with contextual understanding. It is capable of image generation, edits, and multi-turn conversations.',
    displayName: 'Nano Banana',
    family: 'gemini',
    generation: 'gemini-2.5',
    id: 'google/gemini-2.5-flash-image',
    knowledgeCutoff: '2025-06',
    maxOutput: 8192,
    pricing: {
      approximatePricePerImage: 0.039,
      units: [
        { name: 'imageOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-07',
    settings: {
      extendParams: ['imageAspectRatio', 'imageResolution'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 40_960,
    description:
      'Qwen3 is the latest Qwen LLM generation with dense and MoE architectures, excelling at reasoning, multilingual support, and advanced agent tasks. Its unique ability to switch between a thinking mode for complex reasoning and a non-thinking mode for efficient chat ensures versatile, high-quality performance.\n\nQwen3 significantly outperforms prior models like QwQ and Qwen2.5, delivering excellent math, coding, commonsense reasoning, creative writing, and interactive chat. The Qwen3-30B-A3B variant has 30.5B parameters (3.3B active), 48 layers, 128 experts (8 active per task), and supports up to 131K context with YaRN, setting a new bar for open models.',
    displayName: 'Qwen3 30B A3B',
    family: 'qwen',
    generation: 'qwen3',
    id: 'qwen/qwen3-30b-a3b',
    maxOutput: 40_960,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 40_960,
    description:
      'Qwen3-14B is a dense 14.8B-parameter causal LLM built for complex reasoning and efficient chat. It switches between a thinking mode for math, coding, and logic and a non-thinking mode for general chat. Fine-tuned for instruction following, agent tool use, and creative writing across 100+ languages and dialects. It natively handles 32K context and scales to 131K with YaRN.',
    displayName: 'Qwen3 14B',
    family: 'qwen',
    generation: 'qwen3',
    id: 'qwen/qwen3-14b',
    maxOutput: 40_960,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.08, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 40_960,
    description:
      'Qwen3-32B is a dense 32.8B-parameter causal LLM optimized for complex reasoning and efficient chat. It switches between a thinking mode for math, coding, and logic and a non-thinking mode for faster general chat. It performs strongly on instruction following, agent tool use, and creative writing across 100+ languages and dialects. It natively handles 32K context and scales to 131K with YaRN.',
    displayName: 'Qwen3 32B',
    family: 'qwen',
    generation: 'qwen3',
    id: 'qwen/qwen3-32b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 40_960,
    description:
      'Qwen3-235B-A22B is a 235B-parameter MoE model from Qwen with 22B active per forward pass. It switches between a thinking mode for complex reasoning, math, and code and a non-thinking mode for efficient chat. It offers strong reasoning, multilingual support (100+ languages/dialects), advanced instruction following, and agent tool use. It natively handles 32K context and scales to 131K with YaRN.',
    displayName: 'Qwen3 235B A22B',
    family: 'qwen',
    generation: 'qwen3',
    id: 'qwen/qwen3-235b-a22b',
    maxOutput: 40_960,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      'GLM-4-32B-0414 is a 32B bilingual (Chinese/English) open-weights model optimized for code generation, function calling, and agent tasks. It is pretrained on 15T high-quality and reasoning-heavy data and further refined with human preference alignment, rejection sampling, and RL. It excels at complex reasoning, artifact generation, and structured output, reaching GPT-4o and DeepSeek-V3-0324-level performance on multiple benchmarks.',
    displayName: 'GLM 4 32B',
    family: 'glm',
    generation: 'glm-4',
    id: 'thudm/glm-4-32b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.24, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 2.5 Pro is Google’s most advanced thinking model for reasoning over complex problems in code, math, and STEM, and for analyzing large datasets, codebases, and documents with long context.',
    displayName: 'Gemini 2.5 Pro',
    family: 'gemini',
    generation: 'gemini-2.5',
    id: 'google/gemini-2.5-pro',
    knowledgeCutoff: '2025-01',
    maxOutput: 65_536,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 2.5 Pro Preview is Google’s most advanced thinking model for reasoning over complex problems in code, math, and STEM, and for analyzing large datasets, codebases, and documents with long context.',
    displayName: 'Gemini 2.5 Pro Preview',
    family: 'gemini',
    generation: 'gemini-2.5',
    id: 'google/gemini-2.5-pro-preview',
    knowledgeCutoff: '2025-01',
    maxOutput: 65_536,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 2.5 Flash is Google’s most advanced flagship model, built for advanced reasoning, coding, math, and science tasks. It includes built-in “thinking” to deliver higher-accuracy responses with finer context processing.\n\nNote: This model has two variants—thinking and non-thinking. Output pricing differs significantly depending on whether thinking is enabled. If you choose the standard variant (without the “:thinking” suffix), the model will explicitly avoid generating thinking tokens.\n\nTo use thinking and receive thinking tokens, you must select the “:thinking” variant, which incurs higher thinking output pricing.\n\nGemini 2.5 Flash can also be configured via the “max reasoning tokens” parameter as documented (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).',
    displayName: 'Gemini 2.5 Flash',
    family: 'gemini',
    generation: 'gemini-2.5',
    id: 'google/gemini-2.5-flash',
    knowledgeCutoff: '2025-01',
    maxOutput: 65_535,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3 is a powerful general-purpose model that excels across domains. It sets a new bar for math, science, coding, and vision reasoning, and is strong at technical writing and instruction following. Use it to analyze text, code, and images and solve complex multi-step problems.',
    displayName: 'o3',
    family: 'o-series',
    generation: 'o3',
    id: 'openai/o3',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini high reasoning tier, optimized for fast, efficient reasoning with strong coding and vision performance.',
    displayName: 'o4-mini (high)',
    family: 'o-series',
    generation: 'o4',
    id: 'openai/o4-mini-high',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.275, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini is optimized for fast, effective reasoning with strong efficiency and performance in coding and vision tasks.',
    displayName: 'o4-mini',
    family: 'o-series',
    generation: 'o4',
    id: 'openai/o4-mini',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.275, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 is the flagship model for complex tasks and cross-domain problem solving.',
    displayName: 'GPT-4.1',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'openai/gpt-4.1',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 mini balances intelligence, speed, and cost for many use cases.',
    displayName: 'GPT-4.1 mini',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'openai/gpt-4.1-mini',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 nano is the fastest and most cost-effective GPT-4.1 model.',
    displayName: 'GPT-4.1 nano',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'openai/gpt-4.1-nano',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini (high reasoning) delivers higher intelligence at the same cost and latency targets as o1-mini.',
    displayName: 'o3-mini (high)',
    family: 'o-series',
    generation: 'o3',
    id: 'openai/o3-mini-high',
    knowledgeCutoff: '2023-10',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.55, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-31',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini delivers higher intelligence at the same cost and latency targets as o1-mini.',
    displayName: 'o3-mini',
    family: 'o-series',
    generation: 'o3',
    id: 'openai/o3-mini',
    knowledgeCutoff: '2023-10',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.55, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-31',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini is OpenAI’s latest model after GPT-4 Omni, supporting image+text input with text output. As their most advanced small model, it is far cheaper than recent frontier models and over 60% cheaper than GPT-3.5 Turbo, while retaining top-tier intelligence. It scores 82% on MMLU and ranks above GPT-4 in chat preference.',
    displayName: 'GPT-4o mini',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'openai/gpt-4o-mini',
    knowledgeCutoff: '2023-10',
    maxOutput: 16_385,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o is a dynamic model updated in real time. It combines strong language understanding and generation for large-scale use cases like customer support, education, and technical assistance.',
    displayName: 'GPT-4o',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'openai/gpt-4o',
    knowledgeCutoff: '2023-10',
    pricing: {
      units: [
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-R1 greatly improves reasoning with minimal labeled data and outputs a chain-of-thought before the final answer to improve accuracy.',
    displayName: 'DeepSeek R1 0528',
    family: 'deepseek',
    generation: 'deepseek-r1',
    id: 'deepseek/deepseek-r1-0528',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.18, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-05-28',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-R1 greatly improves reasoning with minimal labeled data and outputs a chain-of-thought before the final answer to improve accuracy.',
    displayName: 'DeepSeek R1',
    family: 'deepseek',
    generation: 'deepseek-r1',
    id: 'deepseek/deepseek-r1',
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-20',
    type: 'chat',
  },
  {
    contextWindowTokens: 163_840,
    description:
      'DeepSeek V3 is a 685B-parameter MoE model and the latest iteration of DeepSeek’s flagship chat series.\n\nIt builds on [DeepSeek V3](/deepseek/deepseek-chat-v3) and performs strongly across tasks.',
    displayName: 'DeepSeek V3 0324',
    family: 'deepseek',
    generation: 'deepseek-v3',
    id: 'deepseek/deepseek-chat-v3-0324',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.07, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.27, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4.5 is Anthropic’s flagship model, combining top-tier intelligence with scalable performance for complex, high-quality reasoning tasks.',
    displayName: 'Claude Opus 4.5',
    family: 'claude-opus',
    generation: 'claude-4.5',
    id: 'anthropic/claude-opus-4.5',
    knowledgeCutoff: '2025-05',
    maxOutput: 64_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheWrite', rate: 6.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-24',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude Sonnet 4.5 is Anthropic’s most intelligent model to date.',
    displayName: 'Claude Sonnet 4.5',
    family: 'claude-sonnet',
    generation: 'claude-4.5',
    id: 'anthropic/claude-sonnet-4.5',
    knowledgeCutoff: '2025-01',
    maxOutput: 64_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheWrite', rate: 3.75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-30',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Haiku is Anthropic’s fastest and most compact model, designed for near-instant responses with fast, accurate performance.',
    displayName: 'Claude 3 Haiku',
    family: 'claude-haiku',
    generation: 'claude-3',
    id: 'anthropic/claude-3-haiku',
    knowledgeCutoff: '2023-08',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        {
          lookup: { prices: { '5m': 0.3125 }, pricingParams: ['ttl'] },
          name: 'textInput_cacheWrite',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2024-03-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Haiku is Anthropic’s fastest next-gen model. Compared to Claude 3 Haiku, it improves across skills and surpasses the previous largest model Claude 3 Opus on many intelligence benchmarks.',
    displayName: 'Claude 3.5 Haiku',
    family: 'claude-haiku',
    generation: 'claude-3.5',
    id: 'anthropic/claude-3.5-haiku',
    knowledgeCutoff: '2024-07',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        {
          lookup: { prices: { '5m': 1.25 }, pricingParams: ['ttl'] },
          name: 'textInput_cacheWrite',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2024-11-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.7 Sonnet is Anthropic’s most intelligent model and the first hybrid reasoning model on the market. It can produce near-instant responses or extended step-by-step reasoning that users can see. Sonnet is especially strong at coding, data science, vision, and agent tasks.',
    displayName: 'Claude 3.7 Sonnet',
    family: 'claude-sonnet',
    generation: 'claude-3.7',
    id: 'anthropic/claude-3.7-sonnet',
    knowledgeCutoff: '2024-10',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        {
          lookup: { prices: { '5m': 3.75 }, pricingParams: ['ttl'] },
          name: 'textInput_cacheWrite',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2025-02-24',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Sonnet 4 can produce near-instant responses or extended step-by-step reasoning that users can see. API users can finely control how long the model thinks.',
    displayName: 'Claude Sonnet 4',
    family: 'claude-sonnet',
    generation: 'claude-4',
    id: 'anthropic/claude-sonnet-4',
    knowledgeCutoff: '2025-01',
    maxOutput: 64_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-05-23',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4 is Anthropic’s most powerful model for highly complex tasks, excelling in performance, intelligence, fluency, and comprehension.',
    displayName: 'Claude Opus 4',
    family: 'claude-opus',
    generation: 'claude-4',
    id: 'anthropic/claude-opus-4',
    knowledgeCutoff: '2025-01',
    maxOutput: 32_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-05-23',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description:
      'Gemini 2.0 Flash delivers next-gen capabilities, including excellent speed, native tool use, multimodal generation, and a 1M-token context window.',
    displayName: 'Gemini 2.0 Flash',
    family: 'gemini',
    generation: 'gemini-2.0',
    id: 'google/gemini-2.0-flash-001',
    knowledgeCutoff: '2024-08',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-02-05',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'LLaMA 3.2 is designed for tasks combining vision and text. It excels at image captioning and visual QA, bridging language generation and visual reasoning.',
    displayName: 'Llama 3.2 11B Vision',
    family: 'llama',
    generation: 'llama-3.2',
    id: 'meta-llama/llama-3.2-11b-vision-instruct',
    knowledgeCutoff: '2023-12',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.162, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.162, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Llama 3.3 is the most advanced multilingual open-source Llama model, delivering near-405B performance at very low cost. It is Transformer-based and improved with SFT and RLHF for usefulness and safety. The instruction-tuned version is optimized for multilingual chat and beats many open and closed chat models on industry benchmarks. Knowledge cutoff: Dec 2023.',
    displayName: 'Llama 3.3 70B Instruct',
    family: 'llama',
    generation: 'llama-3.3',
    id: 'meta-llama/llama-3.3-70b-instruct',
    knowledgeCutoff: '2023-12',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.12, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'Llama 3.3 is the most advanced multilingual open-source Llama model, delivering near-405B performance at very low cost. It is Transformer-based and improved with SFT and RLHF for usefulness and safety. The instruction-tuned version is optimized for multilingual chat and beats many open and closed chat models on industry benchmarks. Knowledge cutoff: Dec 2023.',
    displayName: 'Llama 3.3 70B Instruct (Free)',
    family: 'llama',
    generation: 'llama-3.3',
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    knowledgeCutoff: '2023-12',
    type: 'chat',
  },
];

export const allModels = [
  ...openrouterImageModels,
  ...openrouterVideoModels,
  ...openrouterSTTModels,
  ...openrouterChatModels,
];

export default allModels;
