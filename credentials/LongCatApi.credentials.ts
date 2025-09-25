import {
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
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for LongCat Chat API',
		},
	];
}
