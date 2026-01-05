import type { IExecuteFunctions, IHttpRequestOptions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';

export async function thanksIoApiRequest(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	optionOverrides: Partial<IHttpRequestOptions> = {},
) {
	const authMethod = this.getNodeParameter('authentication', 0) as string;
	const credentialName = authMethod === 'apiKey' ? 'thanksIoApi' : 'thanksIoOAuth2Api';
	const options: IHttpRequestOptions = {
		method: method as IHttpRequestMethods,
		url: `https://api.thanks.io/api/v2${endpoint}`,
		json: true,
		qs,
		body: Object.keys(body).length ? body : undefined,
		ignoreHttpStatusErrors: false,
		...optionOverrides,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, credentialName, options);
}