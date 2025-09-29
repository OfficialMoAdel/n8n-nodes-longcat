import { URL } from 'url';
import * as https from 'https';
import * as http from 'http';

export interface LongCatModelConfig {
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    enableThinking?: boolean;
    thinkingBudget?: number;
}

export interface ChatCompletionResponse {
    id: string;
    model: string;
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    finish_reason?: string;
    thinking?: string;
}

export class LongCatModelProvider {
    private config: LongCatModelConfig;

    constructor(config: LongCatModelConfig) {
        this.config = {
            baseUrl: 'https://api.longcat.chat',
            defaultModel: 'LongCat-Flash-Chat',
            ...config
        };
    }

    async chat(messages: ChatMessage[], options: ChatCompletionOptions = {}): Promise<ChatCompletionResponse> {
        const model = options.model || this.config.defaultModel!;

        // Prepare the request body
        const body: any = {
            model,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
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

        // For n8n environment, we'll need to use the httpRequest helper
        // This is a simplified version - in practice, you'd use n8n's IExecuteFunctions
        const response = await this.makeHttpRequest({
            method: 'POST',
            url: `${this.config.baseUrl}/openai/v1/chat/completions`,
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body,
            json: true,
        });

        return {
            id: response.id,
            model: response.model,
            content: response.choices?.[0]?.message?.content || '',
            usage: response.usage,
            finish_reason: response.choices?.[0]?.finish_reason,
            thinking: response.choices?.[0]?.message?.thinking
        };
    }

    // Helper method for HTTP requests (to be implemented with n8n's httpRequest)
    private async makeHttpRequest(config: any): Promise<any> {
        // This would use n8n's this.helpers.httpRequest() in practice
        // For now, providing a basic implementation using Node.js https
        return new Promise((resolve, reject) => {
            const url = new URL(config.url);
            const isHttps = url.protocol === 'https:';

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: config.method,
                headers: config.headers
            };

            const req = (isHttps ? https : http).request(options, (res: any) => {
                let data = '';
                res.on('data', (chunk: Buffer) => data += chunk.toString());
                res.on('end', () => {
                    try {
                        const parsedData = config.json ? JSON.parse(data) : data;
                        resolve(parsedData);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', reject);

            if (config.body) {
                req.write(typeof config.body === 'string' ? config.body : JSON.stringify(config.body));
            }

            req.end();
        });
    }

    // Helper method to create a provider instance from n8n credentials
    static fromN8nCredentials(credentials: any): LongCatModelProvider {
        return new LongCatModelProvider({
            apiKey: credentials.apiKey,
            baseUrl: credentials.baseUrl
        });
    }

    // Get available models
    getAvailableModels(): string[] {
        return ['LongCat-Flash-Chat', 'LongCat-Flash-Thinking'];
    }

    // Validate configuration
    validateConfig(): boolean {
        return !!(this.config.apiKey && this.config.apiKey.trim());
    }
}