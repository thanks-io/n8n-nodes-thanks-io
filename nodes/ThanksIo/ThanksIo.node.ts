import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { thanksIoApiRequest } from './GenericFunctions';
import { getCountryOptions } from './utils';


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
		inputs: ['main'],
		outputs: ['main'],
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
					{ name: 'Recipient', value: 'recipient' },
				],
				default: 'recipient',
			},

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
						returnData.push({ json: response as IDataObject });
					} else if (operation === 'get') {
						const recipientId = this.getNodeParameter('recipientId', i) as number;
						const response = await thanksIoApiRequest.call(this, 'GET', `/recipients/${recipientId}`);
						returnData.push({ json: response as IDataObject });
					}
				}
			} catch (error) {
				throw new NodeOperationError(this.getNode(), (error as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
