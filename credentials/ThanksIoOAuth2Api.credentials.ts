import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ThanksIoOAuth2Api implements ICredentialType {
	name = 'thanksIoOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'thanks.io OAuth2 API';

	documentationUrl = 'https://docs.thanks.io/';

	icon = { light: 'file:icons/thanksIo.svg', dark: 'file:icons/thanksIo.dark.svg' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://dashboard.thanks.io/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://dashboard.thanks.io/oauth/token',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
	];
}