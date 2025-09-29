import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
} from 'n8n-workflow';

export class LongCat implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'LongCat',
        name: 'longCat',
        icon: 'file:LongCat.svg',
        group: ['transform'],
        version: 2,
        description: 'AI-powered chat completion using LongCat models with thinking capabilities and AI Agent integration',
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
                displayName: 'User Message',
                name: 'userMessage',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '{{ $json.message || $json.content || $json.text || $json.input }}',
                placeholder: 'Enter your message here or use expressions like {{ $json.message }}',
                description: 'The user message to send to LongCat. Can reference input data fields.',
            },
            {
                displayName: 'Advanced Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add Advanced Option',
                default: {},
                options: [
                    {
                        displayName: 'System Prompt',
                        name: 'systemPrompt',
                        type: 'string',
                        typeOptions: {
                            rows: 4,
                        },
                        default: '',
                        placeholder: 'You are a helpful assistant that responds accurately and helpfully.',
                        description: 'The system prompt to set the behavior of the AI. Leave empty to use default behavior.',
                    },
                    {
                        displayName: 'AI Agent Integration',
                        name: 'aiAgentMode',
                        type: 'boolean',
                        default: false,
                        description: 'Enable enhanced compatibility with n8n AI Agent nodes',
                    },
                    {
                        displayName: 'Tool Usage Support',
                        name: 'toolUsage',
                        type: 'boolean',
                        default: false,
                        displayOptions: {
                            show: {
                                aiAgentMode: [true],
                            },
                        },
                        description: 'Enable PACKAGES_ALLOW_TOOL_USAGE for AI agent tool calling',
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
                        default: 2048,
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
                            {
                                name: 'Structured',
                                value: 'structured',
                                description: 'Structured response for AI agents',
                            },
                        ],
                        default: 'text',
                        displayOptions: {
                            show: {
                                aiAgentMode: [true],
                            },
                        },
                        description: 'Response format for AI agent usage',
                    },
                    {
                        displayName: 'Temperature',
                        name: 'temperature',
                        type: 'number',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 2,
                            numberStepSize: 0.1,
                        },
                        default: 0.7,
                        description: 'Controls randomness. Lower values are more deterministic, higher values are more creative.',
                    },
                    {
                        displayName: 'Top P',
                        name: 'topP',
                        type: 'number',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 1,
                            numberStepSize: 0.1,
                        },
                        default: 0.9,
                        description: 'Controls diversity via nucleus sampling',
                    },
                    {
                        displayName: 'Thinking Budget',
                        name: 'thinkingBudget',
                        type: 'number',
                        typeOptions: {
                            minValue: 1024,
                            maxValue: 8192,
                            numberPrecision: 0,
                        },
                        default: 2048,
                        displayOptions: {
                            show: {
                                model: ['LongCat-Flash-Thinking'],
                                enableThinking: [true],
                            },
                        },
                        description: 'Maximum length of thinking content (minimum 1024)',
                    },
                    {
                        displayName: 'Include Input Data',
                        name: 'includeInputData',
                        type: 'boolean',
                        default: false,
                        description: 'Include original input data in the output for downstream processing',
                    },
                    {
                        displayName: 'Conversation History',
                        name: 'conversationHistory',
                        type: 'string',
                        typeOptions: {
                            rows: 3,
                        },
                        default: '',
                        placeholder: '{{ $json.conversationHistory }}',
                        description: 'Optional conversation history for context. Should be a JSON array of messages.',
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        // Process each item individually
        for (let i = 0; i < items.length; i++) {
            try {
                const model = this.getNodeParameter('model', i) as string;
                const userMessage = this.getNodeParameter('userMessage', i) as string;
                const options = this.getNodeParameter('options', i, {}) as any;
                const systemPrompt = options.systemPrompt || '';

                const credentials = await this.getCredentials('longCatApi');
                const messages: any[] = [];

                // Add system prompt if provided
                if (systemPrompt) {
                    messages.push({
                        role: 'system',
                        content: systemPrompt,
                    });
                }

                // Add conversation history if provided
                const conversationHistory = options.conversationHistory;
                if (conversationHistory) {
                    try {
                        const history = JSON.parse(conversationHistory);
                        if (Array.isArray(history)) {
                            messages.push(...history);
                        }
                    } catch (error) {
                        // Ignore invalid conversation history
                    }
                }

                // Add user message
                if (userMessage) {
                    messages.push({
                        role: 'user',
                        content: userMessage,
                    });
                }

                // Make API call directly in execute method
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
                if (options.topP !== undefined) {
                    body.top_p = options.topP;
                }

                // Add thinking model specific parameters
                if (model === 'LongCat-Flash-Thinking' && options.enableThinking) {
                    body.enable_thinking = true;
                    if (options.thinkingBudget !== undefined) {
                        body.thinking_budget = Math.max(1024, options.thinkingBudget);
                    }
                }

                // Add tool usage support for AI agents
                if (options.aiAgentMode && options.toolUsage) {
                    body.tools = [];
                    body.tool_choice = 'auto';
                }

                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: 'https://api.longcat.chat/openai/v1/chat/completions',
                    headers: {
                        'Authorization': `Bearer ${credentials.apiKey}`,
                        'Content-Type': 'application/json',
                        ...(options.aiAgentMode && options.toolUsage && { 'PACKAGES_ALLOW_TOOL_USAGE': 'true' }),
                    },
                    body,
                    json: true,
                });

                const currentItem = items[i];

                // Format response directly in execute method
                const content = response.choices?.[0]?.message?.content || '';
                const aiAgentMode = options.aiAgentMode || false;
                const responseFormat = options.responseFormat || 'text';
                const includeInputData = options.includeInputData || false;

                let processedContent = content;

                // Format response based on AI agent requirements
                if (aiAgentMode) {
                    switch (responseFormat) {
                        case 'json':
                            try {
                                JSON.parse(content);
                                processedContent = content;
                            } catch {
                                processedContent = JSON.stringify({
                                    response: content,
                                    model: response.model,
                                    usage: response.usage,
                                });
                            }
                            break;
                        case 'structured':
                            processedContent = {
                                response: content,
                                metadata: {
                                    provider: 'LongCat',
                                    model: response.model,
                                    usage: response.usage,
                                    finishReason: response.choices?.[0]?.finish_reason,
                                },
                            };
                            break;
                        default:
                            processedContent = content;
                    }
                }

                const outputData: IDataObject = {
                    id: response.id,
                    model: response.model,
                    content: processedContent,
                    usage: response.usage,
                    finishReason: response.choices?.[0]?.finish_reason,
                    timestamp: new Date().toISOString(),

                    // AI agent specific fields
                    ...(aiAgentMode && {
                        aiAgentMode: true,
                        responseFormat: responseFormat,
                        toolUsage: options.toolUsage || false,
                    }),

                    // Enhanced metadata
                    metadata: {
                        provider: 'LongCat',
                        modelType: response.model,
                        hasThinking: response.model === 'LongCat-Flash-Thinking' && options.enableThinking,
                        nodeVersion: 2,
                    },

                    // Include original input data if requested
                    ...(includeInputData && currentItem && {
                        originalInput: currentItem.json
                    }),
                };

                // Add thinking content if available
                if (response.choices?.[0]?.message?.thinking) {
                    outputData.thinking = response.choices[0].message.thinking;
                }

                // Add tool calls if available
                if (response.choices?.[0]?.message?.tool_calls) {
                    outputData.toolCalls = response.choices[0].message.tool_calls;
                }

                returnData.push({
                    json: outputData,
                    ...(includeInputData && currentItem?.binary && { binary: currentItem.binary }),
                });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error instanceof Error ? error.message : 'Unknown error occurred',
                            success: false,
                            timestamp: new Date().toISOString(),
                            metadata: {
                                provider: 'LongCat',
                                nodeVersion: 2,
                                errorType: error instanceof Error ? error.constructor.name : 'Unknown',
                                itemIndex: i,
                            },
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