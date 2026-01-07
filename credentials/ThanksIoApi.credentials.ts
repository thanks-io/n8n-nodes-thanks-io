import type { ICredentialType, INodeProperties, IHttpRequestMethods } from 'n8n-workflow';

export class ThanksIoApi implements ICredentialType {
	name = 'thanksIoApi';

	displayName = 'Thanks.io API';

	// Icon is required for n8n credential classes
	icon = { light: 'file:icons/thanksIo.svg', dark: 'file:icons/thanksIo.dark.svg' } as const;

	documentationUrl = 'https://dashboard.thanks.io/profile/api';

	properties: INodeProperties[] = [
		{
			displayName: 'Personal Access Tokens (API Key)',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	// Instruct n8n how to apply the API key to requests (Bearer token)
		authenticate = {
			type: 'generic' as const,
			properties: {
				headers: {
					Authorization: '={{ "Bearer " + $credentials.apiKey }}',
				},
			},
		};

	// Basic credential test that hits a protected endpoint
	test = {
		request: {
			url: 'https://api.thanks.io/api/v2/ping',
			method: 'GET' as IHttpRequestMethods,
		},
	};
}
