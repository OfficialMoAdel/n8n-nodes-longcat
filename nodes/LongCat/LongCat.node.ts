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
                        value: 'longcat-flash-chat',
                        description: 'Standard chat model',
                    },
                    {
                        name: 'LongCat-Flash-Thinking',
                        value: 'longcat-flash-thinkingai-tx-0921-ppo',
                        description: 'Chat model with thinking capabilities',
                    },
                    {
                        name: 'LongCat-Flash-Chat (Tool Enabled)',
                        value: 'longcat-flash-chat-tool',
                        description: 'Chat model with tool calling support',
                    },
                    {
                        name: 'LongCat-Flash-Thinking (Tool Enabled)',
                        value: 'longcat-flash-thinkingai-tx-0921-ppo-tool',
                        description: 'Thinking model with tool calling support',
                    },
                ],
                default: 'longcat-flash-chat',
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
            // Moved AI Tool Mode outside collection
            {
                displayName: 'AI Tool Mode',
                name: 'aiToolMode',
                type: 'boolean',
                default: false,
                description: 'Whether to enable AI tool mode for better integration with AI agents',
            },
            // Moved Response Format outside collection
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
            // Tools parameter for function calling
            {
                displayName: 'Tools',
                name: 'tools',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {},
                displayOptions: {
                    show: {
                        model: ['longcat-flash-chat-tool', 'longcat-flash-thinkingai-tx-0921-ppo-tool'],
                    },
                },
                description: 'Define functions that the AI can call',
                options: [
                    {
                        name: 'tool',
                        displayName: 'Tool',
                        values: [
                            {
                                displayName: 'Function Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'The name of the function',
                                required: true,
                            },
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'A description of what the function does',
                            },
                            {
                                displayName: 'Parameters',
                                name: 'parameters',
                                type: 'json',
                                default: '{}',
                                description: 'JSON schema defining the function parameters',
                                typeOptions: {
                                    rows: 4,
                                },
                            },
                        ],
                    },
                ],
            },
            // Tool Choice parameter
            {
                displayName: 'Tool Choice',
                name: 'toolChoice',
                type: 'options',
                options: [
                    {
                        name: 'None',
                        value: 'none',
                        description: 'The model will not call any tools',
                    },
                    {
                        name: 'Auto',
                        value: 'auto',
                        description: 'The model can choose to call tools or not',
                    },
                    {
                        name: 'Required',
                        value: 'required',
                        description: 'The model must call at least one tool',
                    },
                ],
                default: 'auto',
                displayOptions: {
                    show: {
                        model: ['longcat-flash-chat-tool', 'longcat-flash-thinkingai-tx-0921-ppo-tool'],
                    },
                },
                description: 'Control whether the model should use tools',
            },
            // Moved Enable Thinking outside collection
            {
                displayName: 'Enable Thinking',
                name: 'enableThinking',
                type: 'boolean',
                default: false,
                displayOptions: {
                    show: {
                        model: ['longcat-flash-thinkingai-tx-0921-ppo', 'longcat-flash-thinkingai-tx-0921-ppo-tool'],
                    },
                },
                description: 'Whether to enable thinking mode for the LongCat-Flash-Thinking model',
            },
            // Moved Thinking Budget outside collection
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
                        model: ['longcat-flash-thinkingai-tx-0921-ppo', 'longcat-flash-thinkingai-tx-0921-ppo-tool'],
                        enableThinking: [true],
                    },
                },
                description: 'Maximum length of thinking content (minimum 1024)',
            },
            // Simplified collection without conditional parameters
            {
                displayName: 'Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                options: [
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

                // Get parameters that were moved outside collection
                const aiToolMode = this.getNodeParameter('aiToolMode', i, false) as boolean;
                const responseFormat = this.getNodeParameter('responseFormat', i, 'text') as string;
                const enableThinking = this.getNodeParameter('enableThinking', i, false) as boolean;
                const thinkingBudget = this.getNodeParameter('thinkingBudget', i, 1024) as number;

                // Get tool-related parameters
                const tools = this.getNodeParameter('tools', i, {}) as any;
                const toolChoice = this.getNodeParameter('toolChoice', i, 'auto') as string;

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
                if (model === 'longcat-flash-thinkingai-tx-0921-ppo' || model === 'longcat-flash-thinkingai-tx-0921-ppo-tool') {
                    body.enable_thinking = enableThinking;
                    if (enableThinking) {
                        body.thinking_budget = Math.max(1024, thinkingBudget);
                    }
                }

                // Add tools if using tool-enabled models
                if ((model === 'longcat-flash-chat-tool' || model === 'longcat-flash-thinkingai-tx-0921-ppo-tool') && tools.tool && tools.tool.length > 0) {
                    const formattedTools = tools.tool.map((tool: any) => ({
                        type: 'function',
                        function: {
                            name: tool.name,
                            description: tool.description || '',
                            parameters: tool.parameters ? JSON.parse(tool.parameters) : {},
                        },
                    }));
                    body.tools = formattedTools;
                    body.tool_choice = toolChoice;
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

                const message = response.choices?.[0]?.message;
                const content = message?.content || '';
                const toolCalls = message?.tool_calls || [];

                // Enhanced response for AI agents
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

                // Build response object
                const responseData: any = {
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
                        hasThinking: (model === 'longcat-flash-thinkingai-tx-0921-ppo' || model === 'longcat-flash-thinkingai-tx-0921-ppo-tool') && enableThinking,
                        hasTools: (model === 'longcat-flash-chat-tool' || model === 'longcat-flash-thinkingai-tx-0921-ppo-tool'),
                    },
                };

                // Add tool calls if present
                if (toolCalls && toolCalls.length > 0) {
                    responseData.toolCalls = toolCalls.map((call: any) => ({
                        id: call.id,
                        type: call.type,
                        function: {
                            name: call.function.name,
                            arguments: call.function.arguments,
                        },
                    }));
                }

                returnData.push({
                    json: responseData,
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
