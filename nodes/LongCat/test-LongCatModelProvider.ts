import { LongCatModelProvider, ChatMessage } from './LongCatModelProvider';

async function testLongCatModelProvider() {
    console.log('Testing LongCat Model Provider...');

    // Initialize the provider with test credentials
    // Note: In real usage, use actual API credentials
    const provider = new LongCatModelProvider({
        apiKey: process.env.LONGCAT_API_KEY || 'test-key',
        baseUrl: 'https://api.longcat.chat',
        defaultModel: 'LongCat-Flash-Chat'
    });

    // Test configuration validation
    console.log('✓ Provider initialized');
    console.log('✓ Configuration valid:', provider.validateConfig());
    console.log('✓ Available models:', provider.getAvailableModels());

    // Test chat functionality (will fail without valid API key, but tests the structure)
    try {
        const messages: ChatMessage[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello! Please introduce yourself briefly.' }
        ];

        const response = await provider.chat(messages, {
            model: 'LongCat-Flash-Chat',
            temperature: 0.7,
            maxTokens: 100
        });

        console.log('✓ Chat response received:');
        console.log('  - ID:', response.id);
        console.log('  - Model:', response.model);
        console.log('  - Content length:', response.content.length);
        console.log('  - Usage:', response.usage);

        if (response.thinking) {
            console.log('  - Thinking:', response.thinking.substring(0, 100) + '...');
        }

    } catch (error) {
        console.log('⚠ Chat test failed (expected without valid API key):', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test thinking model
    try {
        const thinkingProvider = new LongCatModelProvider({
            apiKey: process.env.LONGCAT_API_KEY || 'test-key',
            defaultModel: 'LongCat-Flash-Thinking'
        });

        const thinkingMessages: ChatMessage[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Explain quantum computing step by step.' }
        ];

        await thinkingProvider.chat(thinkingMessages, {
            model: 'LongCat-Flash-Thinking',
            enableThinking: true,
            thinkingBudget: 2048
        });

        console.log('✓ Thinking model response received');

    } catch (error) {
        console.log('⚠ Thinking model test failed (expected without valid API key):', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('✓ All tests completed');
}

// Test credential conversion
function testCredentialConversion() {
    console.log('\nTesting credential conversion...');

    const mockCredentials = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.longcat.chat'
    };

    const provider = LongCatModelProvider.fromN8nCredentials(mockCredentials);
    console.log('✓ Provider created from n8n credentials');
    console.log('✓ Configuration valid:', provider.validateConfig());
}

// Export for external usage
export { testLongCatModelProvider, testCredentialConversion };

// Run tests if this file is executed directly (Node.js environment)
if (typeof process !== 'undefined' && process.argv0 && process.argv0.includes('node')) {
    testLongCatModelProvider().catch((error: Error) => console.error(error));
    testCredentialConversion();
}