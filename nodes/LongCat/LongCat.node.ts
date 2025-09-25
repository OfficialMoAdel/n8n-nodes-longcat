import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

export class LongCat implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'LongCat',
        name: 'longCat',
        icon: 'file:LongCat.svg',
        group: ['transform'],
        version: 1,
        description: 'AI-powered chat completion using LongCat models with thinking capabilities',
        subtitle: '={{$parameter["model"]}}',
        defaults: {
            name: 'LongCat',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'longCatApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Model',
                name: 'model',
                type: 'options',
                options: [
                    {
                        name: 'LongCat-Flash-Chat',
                        value: 'LongCat-Flash-Chat',
                        description: 'Standard chat model',
                    },
                    {
                        name: 'LongCat-Flash-Thinking',
                        value: 'LongCat-Flash-Thinking',
                        description: 'Chat model with thinking capabilities',
                    },
                ],
                default: 'LongCat-Flash-Chat',
                description: 'The LongCat model to use',
            },
            {
                displayName: 'System Prompt',
                name: 'systemPrompt',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                placeholder: 'You are a helpful assistant.',
                description: 'The system prompt to set the behavior of the AI',
            },
            {
                displayName: 'User Message',
                name: 'userMessage',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                placeholder: 'Enter your message here...',
                description: 'The user message to send to LongCat',
            },
            {
                displayName: 'Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                options: [
                    {
                        displayName: 'AI Tool Mode',
                        name: 'aiToolMode',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to enable AI tool mode for better integration with AI agents',
                    },
                    {
                        displayName: 'Enable Thinking',
                        name: 'enableThinking',
                        type: 'boolean',
                        default: false,
                        displayOptions: {
                            show: {
                                model: ['LongCat-Flash-Thinking'],
                            },
                        },
                        description: 'Whether to enable thinking mode for the LongCat-Flash-Thinking model',
                    },
                    {
                        displayName: 'Max Tokens',
                        name: 'maxTokens',
                        type: 'number',
                        typeOptions: {
                            minValue: 1,
                            maxValue: 8192,
                            numberPrecision: 0,
                        },
                        default: 1024,
                        description: 'The maximum number of tokens to generate in the response',
                    },
                    {
                        displayName: 'Response Format',
                        name: 'responseFormat',
                        type: 'options',
                        options: [
                            {
                                name: 'Text',
                                value: 'text',
                                description: 'Plain text response',
                            },
                            {
                                name: 'JSON',
                                value: 'json',
                                description: 'JSON formatted response',
                            },
                        ],
                        default: 'text',
                        displayOptions: {
                            show: {
                                aiToolMode: [true],
                            },
                        },
                        description: 'Response format for AI tool usage',
                    },
                    {
                        displayName: 'Temperature',
                        name: 'temperature',
                        type: 'number',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 2,
                            numberPrecision: 1,
                        },
                        default: 0.7,
                        description: 'Controls randomness. Lower values are more deterministic, higher values are more creative.',
                    },
                    {
                        displayName: 'Thinking Budget',
                        name: 'thinkingBudget',
                        type: 'number',
                        typeOptions: {
                            minValue: 1024,
                            maxValue: 4096,
                            numberPrecision: 0,
                        },
                        default: 1024,
                        displayOptions: {
                            show: {
                                model: ['LongCat-Flash-Thinking'],
                                enableThinking: [true],
                            },
                        },
                        description: 'Maximum length of thinking content (minimum 1024)',
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const model = this.getNodeParameter('model', i) as string;
                const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
                const userMessage = this.getNodeParameter('userMessage', i) as string;
                const options = this.getNodeParameter('options', i, {}) as any;

                const credentials = await this.getCredentials('longCatApi');

                // Build messages array
                const messages: any[] = [];

                // Add system prompt if provided
                if (systemPrompt) {
                    messages.push({
                        role: 'system',
                        content: systemPrompt,
                    });
                }

                // Add user message
                if (userMessage) {
                    messages.push({
                        role: 'user',
                        content: userMessage,
                    });
                }

                // Build request body
                const body: any = {
                    model,
                    messages,
                };

                // Add optional parameters
                if (options.temperature !== undefined) {
                    body.temperature = options.temperature;
                }
                if (options.maxTokens !== undefined) {
                    body.max_tokens = options.maxTokens;
                }

                // Add thinking model specific parameters
                if (model === 'LongCat-Flash-Thinking') {
                    if (options.enableThinking !== undefined) {
                        body.enable_thinking = options.enableThinking;
                    }
                    if (options.enableThinking && options.thinkingBudget !== undefined) {
                        body.thinking_budget = Math.max(1024, options.thinkingBudget);
                    }
                }

                // Make API request
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: 'https://api.longcat.chat/openai/v1/chat/completions',
                    headers: {
                        'Authorization': `Bearer ${credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body,
                    json: true,
                });

                const content = response.choices?.[0]?.message?.content || '';

                // Enhanced response for AI agents
                const aiToolMode = options.aiToolMode || false;
                const responseFormat = options.responseFormat || 'text';

                let processedContent = content;
                if (aiToolMode && responseFormat === 'json') {
                    try {
                        // Try to parse as JSON for structured output
                        JSON.parse(content);
                        processedContent = content;
                    } catch {
                        // If not JSON, wrap in structured format
                        processedContent = JSON.stringify({
                            response: content,
                            model: response.model,
                            usage: response.usage,
                        });
                    }
                }

                returnData.push({
                    json: {
                        id: response.id,
                        model: response.model,
                        content: processedContent,
                        usage: response.usage,
                        finishReason: response.choices?.[0]?.finish_reason,
                        // AI agent specific fields
                        aiToolMode: aiToolMode,
                        responseFormat: responseFormat,
                        timestamp: new Date().toISOString(),
                        metadata: {
                            provider: 'LongCat',
                            modelType: model,
                            hasThinking: model === 'LongCat-Flash-Thinking' && options.enableThinking,
                        },
                    },
                });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            success: false,
                            timestamp: new Date().toISOString(),
                        },
                    });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }
}