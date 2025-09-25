import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class LongCatApi implements ICredentialType {
    name = 'longCatApi';
    displayName = 'LongCat API';
    documentationUrl = 'https://longcat.chat/platform/docs/';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
            description: 'Your LongCat API key',
        },
        {
            displayName: 'API Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.longcat.chat',
            description: 'The base URL for the LongCat API (leave default unless using a custom endpoint)',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}/openai/v1',
            url: '/models',
            method: 'GET',
        },
    };
}