import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.openai.com/docs/deprecations
const OpenAI: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 1_047_576,
      description:
        'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
      displayName: 'GPT-4.1 mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4.1-mini',
      maxOutput: 32_768,
      pricing: {
        cachedInput: 0.1,
        input: 0.4,
        output: 1.6,
      },
      releasedAt: '2025-04-14',
      vision: true,
    },
    {
      contextWindowTokens: 1_047_576,
      description:
        'GPT-4.1 nano 是速度最快、最具成本效益的 GPT-4.1 型号。',
      displayName: 'gpt-4.1-nano',
      enabled: true,
      functionCall: true,
      id: 'gpt-4.1-nano',
      maxOutput: 32_768,
      pricing: {
        cachedInput: 0.1,
        input: 0.4,
        output: 1.6,
      },
      releasedAt: '2025-04-14',
      vision: true,
    },
    {
      contextWindowTokens: 1_047_576,
      description:
        'GPT-4.1 是针对复杂任务的旗舰模型，非常适合跨领域问题解决。',
      displayName: 'GPT-4.1',
      enabled: true,
      functionCall: true,
      id: 'gpt-4.1',
      maxOutput: 32_768,
      pricing: {
        cachedInput: 0.1,
        input: 0.4,
        output: 1.6,
      },
      releasedAt: '2025-04-14',
      vision: true,
    },
    // {
    //   contextWindowTokens: 200_000,
    //   description:
    //     'o4-mini是一款针对快速、有效的推理进行了优化，在编码和视觉任务中表现出卓越的高效性能。该模型具有200K上下文和2024年6月的知识截止日期。',
    //   displayName: 'OpenAI o4-mini',
    //   enabled: true,
    //   id: 'o4-mini-2025-04-16',
    //   maxOutput: 100_000,
    //   pricing: {
    //     input: 1.1,
    //     output: 4.4,
    //   },
    //   releasedAt: '2025-04-16',
    // },
    // {
    //   contextWindowTokens: 200_000,
    //   description:
    //     'o3-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
    //   displayName: 'o3-mini',
    //   enabled: true,
    //   id: 'o3-mini',
    //   maxOutput: 100_000,
    //   pricing: {
    //     input: 1.1,
    //     output: 4.4,
    //   },
    //   releasedAt: '2025-01-31',
    // },
    // {
    //   contextWindowTokens: 200_000,
    //   description:
    //     'o3是一个全面且强大的跨领域模型。它为数学、科学、编程和视觉推理任务树立了新的标准。它在技术写作和指令执行方面也表现出色。使用它来思考涉及跨文本、代码和图像分析的多步骤问题。该模型具有200K上下文和2025年6月的知识截止日期。',
    //   displayName: 'o3',
    //   enabled: true,
    //   id: 'o3',
    //   maxOutput: 100_000,
    //   pricing: {
    //     input: 10,
    //     output: 40,
    //   },
    //   releasedAt: '2025-04-16',
    // },
    {
      contextWindowTokens: 128_000,
      description:
        'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1-mini',
      enabled: true,
      id: 'o1-mini',
      maxOutput: 65_536,
      pricing: {
        input: 3,
        output: 12,
      },
      releasedAt: '2024-09-12',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'o1-pro系列模型经过强化学习训练，能够在回答之前进行思考，并执行复杂的推理。该模型具有200K上下文和2023年10月的知识截止日期。',
      displayName: 'o1-pro',
      enabled: true,
      functionCall: true,
      id: 'o1-pro',
      maxOutput: 100_000,
      pricing: {
        input: 150,
        output: 600,
      },
      reasoning: true,
      releasedAt: '2025-03-19',
      vision: true,

    },
    // {
    //   contextWindowTokens: 128_000,
    //   description:
    //     'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
    //   displayName: 'OpenAI o1-preview',
    //   enabled: true,
    //   id: 'o1-preview',
    //   maxOutput: 32_768,
    //   pricing: {
    //     input: 15,
    //     output: 60,
    //   },
    //   releasedAt: '2024-09-12',
    // },
    {
      contextWindowTokens: 128_000,
      description:
        'GPT-4o mini（“o”代表“omni”）是轻量级多模态模型，支持文本和视觉输入，适合预算有限但需多模态处理的场景。',
      displayName: 'GPT-4o mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-mini',
      maxOutput: 16_385,
      pricing: {
        input: 0.15,
        output: 0.6,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o(适用于大多数问题)',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-2024-11-20',
      pricing: {
        input: 2.5,
        output: 10,
      },
      releasedAt: '2024-11-20',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      pricing: {
        input: 2.5,
        output: 10,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o 0806',
      functionCall: true,
      id: 'gpt-4o-2024-08-06',
      pricing: {
        input: 2.5,
        output: 10,
      },
      releasedAt: '2024-08-06',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o 0513',
      functionCall: true,
      id: 'gpt-4o-2024-05-13',
      pricing: {
        input: 5,
        output: 15,
      },
      releasedAt: '2024-05-13',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'ChatGPT-4o',
      enabled: true,
      id: 'chatgpt-4o-latest',
      pricing: {
        input: 5,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
      displayName: 'GPT-4 Turbo',
      functionCall: true,
      id: 'gpt-4-turbo',
      pricing: {
        input: 10,
        output: 30,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
      displayName: 'GPT-4 Turbo Vision 0409',
      functionCall: true,
      id: 'gpt-4-turbo-2024-04-09',
      pricing: {
        input: 10,
        output: 30,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
      displayName: 'GPT-4 Turbo Preview',
      functionCall: true,
      id: 'gpt-4-turbo-preview',
      pricing: {
        input: 10,
        output: 30,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
      displayName: 'GPT-4 Turbo Preview 0125',
      functionCall: true,
      id: 'gpt-4-0125-preview',
      pricing: {
        input: 10,
        output: 30,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
      displayName: 'GPT-4 Turbo Preview 1106',
      functionCall: true,
      id: 'gpt-4-1106-preview',
      pricing: {
        input: 10,
        output: 30,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
      displayName: 'GPT-4',
      functionCall: true,
      id: 'gpt-4',
      pricing: {
        input: 30,
        output: 60,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
      displayName: 'GPT-4 0613',
      functionCall: true,
      id: 'gpt-4-0613',
      pricing: {
        input: 30,
        output: 60,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
      // Will be discontinued on June 6, 2025
      displayName: 'GPT-4 32K',
      functionCall: true,
      id: 'gpt-4-32k',
      pricing: {
        input: 60,
        output: 120,
      },
    },
    {
      contextWindowTokens: 32_768,
      // Will be discontinued on June 6, 2025
      description:
        'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
      displayName: 'GPT-4 32K 0613',
      functionCall: true,
      id: 'gpt-4-32k-0613',
      pricing: {
        input: 60,
        output: 120,
      },
    },
    {
      contextWindowTokens: 16_385,
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-3.5-turbo',
      pricing: {
        input: 0.5,
        output: 1.5,
      },
    },
    {
      contextWindowTokens: 16_385,
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo 0125',
      functionCall: true,
      id: 'gpt-3.5-turbo-0125',
      pricing: {
        input: 0.5,
        output: 1.5,
      },
    },
    {
      contextWindowTokens: 16_385,
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo 1106',
      functionCall: true,
      id: 'gpt-3.5-turbo-1106',
      pricing: {
        input: 1,
        output: 2,
      },
    },
    {
      contextWindowTokens: 4096,
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo Instruct',
      id: 'gpt-3.5-turbo-instruct',
      pricing: {
        input: 1.5,
        output: 2,
      },
    },
  ],
  checkModel: 'gpt-4o-mini',
  description:
    'OpenAI 是全球领先的人工智能研究机构，其开发的模型如GPT系列推动了自然语言处理的前沿。OpenAI 致力于通过创新和高效的AI解决方案改变多个行业。他们的产品具有显著的性能和经济性，广泛用于研究、商业和创新应用。',
  enabled: true,
  id: 'openai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.openai.com/docs/models',
  name: 'OpenAI',
  settings: {
    showModelFetcher: true,
    smoothing: {
      text: true,
    },
  },
  url: 'https://openai.com',
};

export default OpenAI;
