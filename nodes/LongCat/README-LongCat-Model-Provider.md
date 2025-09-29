# LongCat Model Provider for n8n AI Agent

This directory contains a custom AI model provider that allows n8n's AI Agent node to use LongCat models directly.

## Files

- `LongCatModelProvider.ts` - The main model provider class
- `README-LongCat-Model-Provider.md` - This documentation

## How to Use with n8n AI Agent

### 1. Installation

First, install the required dependencies:

```bash
npm install @types/node
```

### 2. Configuration

Create a custom model provider configuration in your n8n instance. You can do this by:

1. **Option A: Direct Integration**
   - Copy the `LongCatModelProvider.ts` to your n8n custom nodes directory
   - Configure the AI Agent node to use the custom provider

2. **Option B: Environment Variables**
   ```bash
   # Set your LongCat API credentials
   export LONGCAT_API_KEY="your-api-key-here"
   export LONGCAT_BASE_URL="https://api.longcat.chat"
   ```

### 3. Usage in AI Agent Node

When configuring the AI Agent node in n8n:

1. **Model Selection**: Choose "Custom Model" or configure the provider
2. **API Configuration**:
   - API Key: Your LongCat API key
   - Base URL: `https://api.longcat.chat`
   - Default Model: `LongCat-Flash-Chat` or `LongCat-Flash-Thinking`

3. **Advanced Options**:
   - Enable thinking mode for `LongCat-Flash-Thinking`
   - Set temperature, max tokens, and other parameters
   - Configure tool usage if needed

## API Reference

### LongCatModelProvider Class

```typescript
const provider = new LongCatModelProvider({
	apiKey: 'your-api-key',
	baseUrl: 'https://api.longcat.chat',
	defaultModel: 'LongCat-Flash-Chat',
});
```

### Chat Method

```typescript
const response = await provider.chat(
	[
		{ role: 'system', content: 'You are a helpful assistant.' },
		{ role: 'user', content: 'Hello!' },
	],
	{
		model: 'LongCat-Flash-Chat',
		temperature: 0.7,
		maxTokens: 1000,
		enableThinking: false,
	},
);
```

### Available Models

- `LongCat-Flash-Chat` - Standard chat model
- `LongCat-Flash-Thinking` - Chat model with thinking capabilities

## Integration Examples

### Basic Chat

```typescript
import { LongCatModelProvider } from './LongCatModelProvider';

const provider = new LongCatModelProvider({
	apiKey: process.env.LONGCAT_API_KEY!,
});

const messages = [
	{ role: 'system', content: 'You are a helpful assistant.' },
	{ role: 'user', content: 'Explain quantum computing' },
];

const response = await provider.chat(messages, {
	model: 'LongCat-Flash-Chat',
	temperature: 0.7,
});

console.log(response.content);
```

### With Thinking Model

```typescript
const response = await provider.chat(messages, {
	model: 'LongCat-Flash-Thinking',
	enableThinking: true,
	thinkingBudget: 2048,
	temperature: 0.1,
});

console.log('Content:', response.content);
console.log('Thinking:', response.thinking);
```

### Error Handling

```typescript
try {
	const response = await provider.chat(messages);
} catch (error) {
	console.error('LongCat API Error:', error.message);
}
```

## Benefits

1. **Direct Integration**: Use LongCat models directly in AI agents
2. **Thinking Capabilities**: Access to LongCat-Flash-Thinking model
3. **Custom Parameters**: Full control over model parameters
4. **Type Safety**: Full TypeScript support
5. **Error Handling**: Comprehensive error handling and validation

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your LongCat API key is valid and has sufficient credits
2. **Network Errors**: Check your internet connection and LongCat API status
3. **Model Not Found**: Verify the model name is correct
4. **Rate Limiting**: Implement proper retry logic for production use

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const provider = new LongCatModelProvider({
	apiKey: 'your-api-key',
	// Add debug logging in production implementation
});
```

## Support

For issues specific to the LongCat Model Provider:

1. Check the LongCat API documentation
2. Verify your API credentials
3. Test with the official LongCat API first
4. Check the n8n community forums for integration issues
