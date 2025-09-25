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
                displayName: 'Processing Mode',
                name: 'processingMode',
                type: 'options',
                options: [
                    {
                        name: 'Individual Items',
                        value: 'individual',
                        description: 'Process each input item separately',
                    },
                    {
                        name: 'Batch Processing',
                        value: 'batch',
                        description: 'Process all items as a single conversation',
                    },
                ],
                default: 'individual',
                description: 'How to handle multiple input items',
            },
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
                placeholder: 'You are a helpful assistant that responds accurately and helpfully.',
                description: 'The system prompt to set the behavior of the AI. Leave empty to use default behavior.',
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
        const processingMode = this.getNodeParameter('processingMode', 0) as string;

        if (processingMode === 'batch') {
            // Process all items as a single conversation
            try {
                // @ts-ignore - processBatch is a private method called within the class
                const batchResult = await this.processBatch(items, this);
                returnData.push(...batchResult);
            } catch (error) {
                if (this.continueOnFail()) {
                    // @ts-ignore - createErrorResponse is a private method called within the class
                    returnData.push(this.createErrorResponse(error, undefined));
                } else {
                    throw error;
                }
            }
        } else {
            // Process each item individually
            for (let i = 0; i < items.length; i++) {
                try {
                    // @ts-ignore - processIndividualItem is a private method called within the class
                    const itemResult = await this.processIndividualItem(i, this);
                    returnData.push(itemResult);
                } catch (error) {
                    if (this.continueOnFail()) {
                        // @ts-ignore - createErrorResponse is a private method called within the class
                        returnData.push(this.createErrorResponse(error, i));
                    } else {
                        throw error;
                    }
                }
            }
        }

        return [returnData];
    }

    // @ts-ignore - Private method used within the class
    private async processBatch(items: INodeExecutionData[], executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[]> {
        const model = executeFunctions.getNodeParameter('model', 0) as string;
        const systemPrompt = executeFunctions.getNodeParameter('systemPrompt', 0, '') as string;
        const options = executeFunctions.getNodeParameter('options', 0, {}) as any;

        const credentials = await executeFunctions.getCredentials('longCatApi');
        const messages: any[] = [];

        // Add system prompt if provided
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt,
            });
        }

        // Process all items as conversation history
        for (let i = 0; i < items.length; i++) {
            const userMessage = executeFunctions.getNodeParameter('userMessage', i) as string;
            if (userMessage) {
                messages.push({
                    role: 'user',
                    content: userMessage,
                });
            }
        }

        const response = await this.makeApiCall(model, messages, options, credentials, executeFunctions);
        return [this.formatResponse(response, options, items, 0, executeFunctions)];
    }

    // @ts-ignore - Private method used within the class
    private async processIndividualItem(itemIndex: number, executeFunctions: IExecuteFunctions): Promise<INodeExecutionData> {
        const model = executeFunctions.getNodeParameter('model', itemIndex) as string;
        const systemPrompt = executeFunctions.getNodeParameter('systemPrompt', itemIndex, '') as string;
        const userMessage = executeFunctions.getNodeParameter('userMessage', itemIndex) as string;
        const options = executeFunctions.getNodeParameter('options', itemIndex, {}) as any;

        const credentials = await executeFunctions.getCredentials('longCatApi');
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

        const response = await this.makeApiCall(model, messages, options, credentials, executeFunctions);
        const inputData = executeFunctions.getInputData();
        const currentItem = inputData[itemIndex] || inputData[0];
        return this.formatResponse(response, options, currentItem ? [currentItem] : [], itemIndex, executeFunctions);
    }

    private async makeApiCall(model: string, messages: any[], options: any, credentials: any, executeFunctions: IExecuteFunctions): Promise<any> {
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
        if (model === 'LongCat-Flash-Thinking') {
            if (options.enableThinking !== undefined) {
                body.enable_thinking = options.enableThinking;
            }
            if (options.enableThinking && options.thinkingBudget !== undefined) {
                body.thinking_budget = Math.max(1024, options.thinkingBudget);
            }
        }

        // Add tool usage support for AI agents
        if (options.toolUsage) {
            body.tools = [];
            body.tool_choice = 'auto';
        }

        return await executeFunctions.helpers.httpRequest({
            method: 'POST',
            url: 'https://api.longcat.chat/openai/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${credentials.apiKey}`,
                'Content-Type': 'application/json',
                ...(options.toolUsage && { 'PACKAGES_ALLOW_TOOL_USAGE': 'true' }),
            },
            body,
            json: true,
        });
    }

    private formatResponse(response: any, options: any, inputItems: INodeExecutionData[], itemIndex: number, executeFunctions: IExecuteFunctions): INodeExecutionData {
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
                processingMode: executeFunctions.getNodeParameter('processingMode', itemIndex),
                nodeVersion: 2,
            },
            
            // Include original input data if requested
            ...(includeInputData && inputItems.length > 0 && inputItems[0] && {
                originalInput: inputItems[0].json
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

        return {
            json: outputData,
            ...(includeInputData && inputItems.length > 0 && inputItems[0]?.binary && { binary: inputItems[0].binary }),
        };
    }

    // @ts-ignore - Private method used within the class
    private createErrorResponse(error: any, itemIndex?: number): INodeExecutionData {
        return {
            json: {
                error: error.message || 'Unknown error occurred',
                success: false,
                timestamp: new Date().toISOString(),
                metadata: {
                    provider: 'LongCat',
                    nodeVersion: 2,
                    errorType: error.constructor.name,
                    ...(itemIndex !== undefined && { itemIndex }),
                },
            },
        };
    }
}