import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { thanksIoApiRequest } from './GenericFunctions';

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
					{ name: 'Create', value: 'create', action: 'Create recipient' },
					{ name: 'Get', value: 'get', action: 'Get recipient' },
				],
				default: 'create',
			},

			// Create recipient fields
			{
				displayName: 'Mailing List ID',
				name: 'mailing_list_id',
				type: 'number',
				required: true,
				default: 1,
				description: 'ID of the mailing list to add the recipient to',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Street address',
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
				displayName: 'Province/State',
				name: 'province',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Postal Code',
				name: 'postal_code',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['recipient'], operation: ['create'] } },
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
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
					{ displayName: 'Address 2', name: 'address2', type: 'string', default: '' },
					{ displayName: 'Company', name: 'company', type: 'string', default: '' },
					{ displayName: 'Custom 1', name: 'custom1', type: 'string', default: '' },
					{ displayName: 'Custom 2', name: 'custom2', type: 'string', default: '' },
					{ displayName: 'Custom 3', name: 'custom3', type: 'string', default: '' },
					{ displayName: 'Custom 4', name: 'custom4', type: 'string', default: '' },
					{ displayName: 'DOB', name: 'dob', type: 'string', default: '' },
					{ displayName: 'Email', name: 'email', type: 'string', default: '', placeholder: 'name@email.com' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'recipient') {
					const operation = this.getNodeParameter('operation', i) as string;
					if (operation === 'create') {
						const mailing_list_id = this.getNodeParameter('mailing_list_id', i) as number;
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
