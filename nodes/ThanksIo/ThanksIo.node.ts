import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodeOperationError, NodeConnectionTypes } from 'n8n-workflow';
import { thanksIoApiRequest } from './GenericFunctions';
import { getCountryOptions } from './utils';
import { mailerOperations, mailerFields, mailerOperationToEndpoint } from './MailerDescription';


export class ThanksIo implements INodeType {
	description: INodeTypeDescription = {
		usableAsTool: true,
		displayName: 'thanks.io',
		name: 'thanksIo',
		icon : { light: 'file:icons/thanksIo.svg', dark: 'file:icons/thanksIo.dark.svg' } as const,
		group: ['transform'],
		version: 1,
		description: 'Interact with thanks.io API',
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		defaults: {
			name: 'thanks.io',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'thanksIoApi',
				required: true,
				displayOptions: { show: { authentication: ['apiKey'] } },
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'Personal Access Tokens (API Key)', value: 'apiKey' },
				],
				default: 'apiKey',
			},
			// Resource
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Mailer', value: 'mailer' },
					{ name: 'Recipient', value: 'recipient' },
				],
				default: 'recipient',
			},

			// Mailer operations + fields
			...mailerOperations,
			...mailerFields,

			// Recipient operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['recipient'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create recipient',
						description: 'Add recipient to mailing list',
					},
				],
				default: 'create',
			},

			// Create recipient fields
			{
				displayName: 'Mailing List ID',
				name: 'mailing_list_id',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Mailing List...',
						typeOptions: {
							searchListMethod: 'searchMailingLists',
							searchable: true,
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 12345',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[0-9]{1,}',
									errorMessage: 'Not a valid Mailing List ID',
								},
							},
						],
						url: '=https://dashboard.thanks.io/mailing_lists/{{$value}}',
					},
				],
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
				description: 'ID of the mailing list to add the recipient to',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Street Address (or Full Address)',
				name: 'address',
				type: 'string',
				default: '',
				placeholder: '7777 Main st',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Address 2',
				name: 'address2',
				type: 'string',
				default: '',
				placeholder: 'Apartment #1',
				description: 'Address line 2 (e.g. apartment, suite, unit, or building)',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'State',
				name: 'province',
				type: 'string',
				description: 'State or Province',
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Postal Code',
				name: 'postal_code',
				type: 'string',
				description: "ZIP or Postal Code",
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'options',
				typeOptions: { searchable: true },
				options: getCountryOptions(),
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
				options: [
					{ displayName: 'Company (or Spouse)', name: 'company', type: 'string', default: '' },
					{ displayName: 'Custom 1', name: 'custom1', type: 'string', default: '', description: 'Custom info about the recipient like order ID or customer ID' },
					{ displayName: 'Custom 2', name: 'custom2', type: 'string', default: '', description: 'Custom info about the recipient like order ID or customer ID'  },
					{ displayName: 'Custom 3', name: 'custom3', type: 'string', default: '', description: 'Custom info about the recipient like order ID or customer ID'  },
					{ displayName: 'Custom 4', name: 'custom4', type: 'string', default: '', description: 'Custom info about the recipient like order ID or customer ID'  },
					{ displayName: 'DOB', name: 'dob', type: 'string', default: '', placeholder: 'MM/DD/YYYY', description: 'Date of birth of the recipient' },
					{ displayName: 'Email', name: 'email', type: 'string', default: '', placeholder: 'name@email.com' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'Telephone number of the recipient to create', },
				],
			},

			// Get recipient fields
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'number',
				required: true,
				default: 1,
				displayOptions: { show: { resource: ['recipient'], operation: ['get'] } },
			},
		],
	};

	methods = {
		listSearch: {
			async searchMailingLists(
				this: ILoadOptionsFunctions,
				query?: string,
			): Promise<INodeListSearchResult> {
				const searchResults = (await thanksIoApiRequest.call(
					this,
					'GET',
					'/mailing-lists',
					{},
					{
						query
					},
				)) as {
					data: Array<{
						id: number;
						description: string;
						total_recipients: number;
						created_at: string;
					}>;
				};

				return {
					results: searchResults.data.map((mailing_list) => ({
						name: mailing_list.description + ' (' + mailing_list.total_recipients + ')',
						value: mailing_list.id,
						description: mailing_list.created_at,
					})),
				};
			},

			async searchGiftcardBrands(
				this: ILoadOptionsFunctions,
				query?: string,
			): Promise<INodeListSearchResult> {
				const result = (await thanksIoApiRequest.call(
					this,
					'GET',
					'/giftcard-brands-list',
				)) as {
					brands: Array<{
						brand_code: string;
						title: string;
						group: string;
						available_amounts: number[];
					}>;
				};

				let brands = result.brands;
				if (query) {
					const q = query.toLowerCase();
					brands = brands.filter(
						(b) => b.title.toLowerCase().includes(q) || b.brand_code.toLowerCase().includes(q),
					);
				}

				return {
					results: brands.map((b) => ({
						name: b.title,
						value: b.brand_code,
						description: b.group,
					})),
				};
			},

			async searchGiftcardAmounts(
				this: ILoadOptionsFunctions,
			): Promise<INodeListSearchResult> {
				// Resolve selected brand code from the resourceLocator parameter
				const brandParam = this.getNodeParameter('giftcard_brand', 0) as
					| { value?: string }
					| string;
				const brandCode =
					typeof brandParam === 'object' && brandParam !== null
						? (brandParam.value ?? '')
						: String(brandParam ?? '');

				const result = (await thanksIoApiRequest.call(
					this,
					'GET',
					'/giftcard-brands-list',
				)) as {
					brands: Array<{
						brand_code: string;
						title: string;
						available_amounts: number[];
					}>;
				};

				const brand = brandCode
					? result.brands.find((b) => b.brand_code === brandCode)
					: undefined;
				const amounts = brand ? brand.available_amounts : [];

				return {
					results: amounts.map((cents) => ({
						name: '$' + (cents / 100).toFixed(2),
						value: cents,
					})),
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'recipient') {
					const operation = this.getNodeParameter('operation', i) as string;
					if (operation === 'create') {
						// Handle Resource Locator value for mailing_list_id coming from either list or id mode
						const mailingListParam = this.getNodeParameter('mailing_list_id', i) as unknown;
						let mailing_list_id_value: string | number | undefined;
						if (typeof mailingListParam === 'object' && mailingListParam !== null) {
							mailing_list_id_value = (mailingListParam as { value?: string | number }).value;
						} else {
							mailing_list_id_value = mailingListParam as string | number;
						}

						const mailing_list_id = Number.parseInt(String(mailing_list_id_value), 10);
						if (Number.isNaN(mailing_list_id)) {
							throw new NodeOperationError(this.getNode(), 'Invalid Mailing List ID');
						}
						const address2 = this.getNodeParameter('address2', i, '') as string;
						const name = this.getNodeParameter('name', i, '') as string;
						const address = this.getNodeParameter('address', i, '') as string;
						const city = this.getNodeParameter('city', i, '') as string;
						const province = this.getNodeParameter('province', i, '') as string;
						const postal_code = this.getNodeParameter('postal_code', i, '') as string;
						const country = this.getNodeParameter('country', i, 'US') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							mailing_list_id,
							name,
							address,
							address2,
							city,
							province,
							postal_code,
							country,
							...additionalFields,
						};

						const response = await thanksIoApiRequest.call(this, 'POST', '/recipients', body);
						returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'get') {
						const recipientId = this.getNodeParameter('recipientId', i) as number;
						const response = await thanksIoApiRequest.call(this, 'GET', `/recipients/${recipientId}`);
						returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'mailer') {
					const operation = this.getNodeParameter('operation', i) as string;
					const endpoint = mailerOperationToEndpoint[operation];
					if (!endpoint) {
						throw new NodeOperationError(this.getNode(), `Unknown mailer operation: ${operation}`);
					}

					const body: IDataObject = {};

					// Audience
					const audienceType = this.getNodeParameter('audienceType', i) as string;
					if (audienceType === 'mailingLists') {
						const mlParam = this.getNodeParameter('mailingListIds', i, {}) as {
							list?: Array<{ id: { value?: string | number } | string | number }>;
						};
						const ids = (mlParam.list ?? [])
							.map((entry) => {
								const raw =
									typeof entry.id === 'object' && entry.id !== null
										? (entry.id as { value?: string | number }).value
										: (entry.id as string | number);
								return Number.parseInt(String(raw), 10);
							})
							.filter((n) => !Number.isNaN(n));
						if (ids.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one Mailing List ID is required', { itemIndex: i });
						}
						body.mailing_list_ids = ids;
					} else if (audienceType === 'recipients') {
						const recParam = this.getNodeParameter('recipientsCollection', i, {}) as {
							recipient?: IDataObject[];
						};
						const recipients = (recParam.recipient ?? []).map((r) => {
							const cleaned: IDataObject = {};
							for (const [k, v] of Object.entries(r)) {
								if (v !== '' && v !== undefined && v !== null) cleaned[k] = v;
							}
							return cleaned;
						});
						if (recipients.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one recipient is required', { itemIndex: i });
						}
						body.recipients = recipients;
					} else if (audienceType === 'radiusSearch') {
						const rs = this.getNodeParameter('radiusSearch', i, {}) as IDataObject;
						if (!rs.address) {
							throw new NodeOperationError(this.getNode(), 'Radius Search requires an Address', { itemIndex: i });
						}
						body.radius_search = rs;
					}

					const setIfPresent = (key: string, val: unknown) => {
						if (val === undefined || val === null) return;
						if (typeof val === 'string' && val === '') return;
						if (typeof val === 'number' && val === 0) return;
						body[key] = val as IDataObject[string];
					};

					setIfPresent('image_template_id', this.getNodeParameter('image_template_id', i, 0));
					setIfPresent('front_image_url', this.getNodeParameter('front_image_url', i, ''));
					const message = this.getNodeParameter('message', i, '') as string;
					if (message !== '') body.message = message;
					setIfPresent('message_template_id', this.getNodeParameter('message_template_id', i, 0));

					if (operation === 'sendPostcard') {
						setIfPresent('size', this.getNodeParameter('size', i, ''));
					}

					if (['sendPostcard', 'sendNotecard', 'sendLetter', 'sendWindowlessLetter'].includes(operation)) {
						setIfPresent('qrcode_url', this.getNodeParameter('qrcode_url', i, ''));
					}

					if (['sendPostcard', 'sendNotecard', 'sendMagnacard'].includes(operation)) {
						const useCustomBg = this.getNodeParameter('use_custom_background', i, false) as boolean;
						if (useCustomBg) body.use_custom_background = true;
						setIfPresent('custom_background_image', this.getNodeParameter('custom_background_image', i, ''));
					}

					if (['sendLetter', 'sendWindowlessLetter'].includes(operation)) {
						setIfPresent('additional_pages_url', this.getNodeParameter('additional_pages_url', i, ''));
						setIfPresent('pdf_only_url', this.getNodeParameter('pdf_only_url', i, ''));
					}

					if (operation === 'sendGiftcard') {
						const brandRaw = this.getNodeParameter('giftcard_brand', i, {}) as
							| { value?: string }
							| string;
						const brandCode =
							typeof brandRaw === 'object' && brandRaw !== null
								? (brandRaw.value ?? '')
								: String(brandRaw ?? '');
						if (brandCode) body.giftcard_brand = brandCode;

						const amountRaw = this.getNodeParameter('giftcard_amount_in_cents', i, {}) as
							| { value?: string | number }
							| string
							| number;
						const amountVal =
							typeof amountRaw === 'object' && amountRaw !== null
								? amountRaw.value
								: amountRaw;
						const amountCents = Number(amountVal);
						if (!Number.isNaN(amountCents) && amountCents > 0) {
							body.giftcard_amount_in_cents = amountCents;
						}
					}

					const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
					for (const [k, v] of Object.entries(additional)) {
						if (v === '' || v === undefined || v === null) continue;
						if (typeof v === 'number' && v === 0 && (k === 'handwriting_style_id' || k === 'sub_account')) continue;
						body[k] = v as IDataObject[string];
					}

					const response = await thanksIoApiRequest.call(this, 'POST', endpoint, body);
					returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), (error as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
