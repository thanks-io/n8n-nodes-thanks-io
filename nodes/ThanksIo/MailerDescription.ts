import type { INodeProperties } from 'n8n-workflow';
import { getCountryOptions } from './utils';

const MAILER = 'mailer';
const ALL_OPS = [
	'sendPostcard',
	'sendLetter',
	'sendWindowlessLetter',
	'sendNotecard',
	'sendGiftcard',
	'sendMagnacard',
];

export const mailerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [MAILER] } },
		options: [
			{
				name: 'Send Giftcard',
				value: 'sendGiftcard',
				action: 'Send a giftcard',
				description: 'Send a giftcard mailer',
			},
			{
				name: 'Send Magnacard',
				value: 'sendMagnacard',
				action: 'Send a magnacard',
				description: 'Send a magnet-style mailer',
			},
			{
				name: 'Send Notecard',
				value: 'sendNotecard',
				action: 'Send a notecard',
				description: 'Send a folded notecard mailer',
			},
			{
				name: 'Send Postcard',
				value: 'sendPostcard',
				action: 'Send a 4x6 6x9 or 6x11 postcard',
				description: 'Send a postcard mailer',
			},
			{
				name: 'Send Windowed Letter',
				value: 'sendLetter',
				action: 'Send a windowed letter',
				description: 'Send a cover letter in a windowed envelope',
			},
			{
				name: 'Send Windowless Letter',
				value: 'sendWindowlessLetter',
				action: 'Send a windowless letter',
				description: 'Send a cover letter in a windowless envelope',
			},
		],
		default: 'sendPostcard',
	},
];

const recipientCollectionFields: INodeProperties[] = [
	{ displayName: 'Name', name: 'name', type: 'string', default: '' },
	{ displayName: 'Company', name: 'company', type: 'string', default: '' },
	{ displayName: 'Address', name: 'address', type: 'string', default: '', placeholder: '123 Main Street' },
	{ displayName: 'Address 2', name: 'address2', type: 'string', default: '' },
	{ displayName: 'City', name: 'city', type: 'string', default: '' },
	{ displayName: 'State', name: 'province', type: 'string', default: '', description: 'State or Province' },
	{ displayName: 'Postal Code', name: 'postal_code', type: 'string', default: '' },
	{
		displayName: 'Country',
		name: 'country',
		type: 'options',
		typeOptions: { searchable: true },
		options: getCountryOptions(),
		default: '',
	},
	{ displayName: 'Email', name: 'email', type: 'string', default: '', placeholder: 'name@email.com' },
	{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
	{ displayName: 'DOB', name: 'dob', type: 'string', default: '', placeholder: 'YYYY-MM-DD' },
	{ displayName: 'Custom 1', name: 'custom1', type: 'string', default: '' },
	{ displayName: 'Custom 2', name: 'custom2', type: 'string', default: '' },
	{ displayName: 'Custom 3', name: 'custom3', type: 'string', default: '' },
	{ displayName: 'Custom 4', name: 'custom4', type: 'string', default: '' },
];

const audienceFields: INodeProperties[] = [
	{
		displayName: 'Audience',
		name: 'audienceType',
		type: 'options',
		required: true,
		default: 'mailingLists',
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		options: [
			{ name: 'Mailing Lists', value: 'mailingLists', description: 'Send to one or more existing mailing lists' },
			{ name: 'Recipients', value: 'recipients', description: 'Send to recipients provided directly' },
			{ name: 'Radius Search', value: 'radiusSearch', description: 'Buy a list near an address' },
		],
		description: 'How recipients are specified for this order',
	},
	{
		displayName: 'Mailing Lists',
		name: 'mailingListIds',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Mailing List',
		default: {},
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS, audienceType: ['mailingLists'] } },
		options: [
			{
				name: 'list',
				displayName: 'Mailing List',
				values: [
					{
						displayName: 'Mailing List ID',
						name: 'id',
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
					},
				],
			},
		],
	},
	{
		displayName: 'Recipients',
		name: 'recipientsCollection',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Recipient',
		default: {},
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS, audienceType: ['recipients'] } },
		options: [
			{
				name: 'recipient',
				displayName: 'Recipient',
				values: recipientCollectionFields,
			},
		],
	},
	{
		displayName: 'Radius Search',
		name: 'radiusSearch',
		type: 'collection',
		placeholder: 'Add Radius Search Field',
		default: {},
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS, audienceType: ['radiusSearch'] } },
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				placeholder: '123 Main Street, Fake City, NY, 55555',
				description: 'Full street address to use as the center point of the nearest-neighbor search',
			},
			{
				displayName: 'Append Data',
				name: 'append_data',
				type: 'boolean',
				default: false,
				description: 'Whether to append phone and email to each record for an additional fee ($.20 per record)',
			},
			{ displayName: 'Include Condos', name: 'include_condos', type: 'boolean', default: false },
			{
				displayName: 'Include Search Address',
				name: 'include_search_address',
				type: 'boolean',
				default: false,
				description: 'Whether to include the search address in the generated mailing list',
			},
			{
				displayName: 'Preview',
				name: 'preview',
				type: 'boolean',
				default: false,
				description: 'Whether to return a preview of matching recipients and estimated cost without buying the list',
			},
			{
				displayName: 'Record Count',
				name: 'record_count',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1, maxValue: 10000 },
				description: 'Number of nearby records to return',
			},
			{
				displayName: 'Record Types',
				name: 'record_types',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'Absentee Owner', value: 'absenteeowner' },
					{ name: 'All', value: 'all' },
					{ name: 'First Time Homebuyer', value: 'firsttimehomebuyer' },
					{ name: 'High Net Worth', value: 'highnetworth' },
					{ name: 'Home Free Clear', value: 'homefreeclear' },
					{ name: 'Kids in Household', value: 'kidsinhousehold' },
					{ name: 'Likely to Move', value: 'likelytomove' },
					{ name: 'Likely to Refi', value: 'likelytorefi' },
					{ name: 'Majority Home Equity', value: 'majorityhomeequity' },
					{ name: 'New Business', value: 'newbusiness' },
					{ name: 'New Homeowner', value: 'newhomeowner' },
					{ name: 'Only Businesses', value: 'onlybusinesses' },
					{ name: 'Pool', value: 'pool' },
					{ name: 'Renters', value: 'renters' },
					{ name: 'Retired', value: 'retired' },
					{ name: 'Retiring', value: 'retiring' },
					{ name: 'Underwater', value: 'underwater' },
				],
			},
			{
				displayName: 'Use Property Owner',
				name: 'use_property_owner',
				type: 'boolean',
				default: false,
				description: "Whether to use the property owner's address when searching commercial records",
			},
		],
	},
];

const HAS_QR = ['sendPostcard', 'sendNotecard', 'sendLetter', 'sendWindowlessLetter'];
const HAS_BACKGROUND = ['sendPostcard', 'sendNotecard', 'sendMagnacard'];
const IS_LETTER = ['sendLetter', 'sendWindowlessLetter'];

const creativeFields: INodeProperties[] = [
	{
		displayName: 'Image Template ID',
		name: 'image_template_id',
		type: 'number',
		default: 0,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		description:
			'ID of the image template to use for the front (or background, for letters). Required if Front Image URL is not specified. Use 0 to omit.',
	},
	{
		displayName: 'Front Image URL',
		name: 'front_image_url',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/image.png',
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		description:
			'URL to the image to use for the front of the mailer (or background for letters). Required if Image Template ID is not specified.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		placeholder: 'Hey %FIRST_NAME%! Thanks for your business.',
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		description: 'Handwritten message content for the mailer. Use placeholders like %FIRST_NAME% for personalization.',
	},
	{
		displayName: 'Message Template ID',
		name: 'message_template_id',
		type: 'number',
		default: 0,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		description: 'ID of the message template to use. Use 0 to omit.',
	},

	// Postcard-only
	{
		displayName: 'Size',
		name: 'size',
		type: 'options',
		default: '4x6',
		options: [
			{ name: '4x6', value: '4x6' },
			{ name: '6x9', value: '6x9' },
			{ name: '6x11', value: '6x11' },
		],
		displayOptions: { show: { resource: [MAILER], operation: ['sendPostcard'] } },
		description: 'Size of the postcard',
	},

	// QR code (postcards, notecards, letters)
	{
		displayName: 'QR Code URL',
		name: 'qrcode_url',
		type: 'string',
		default: '',
		placeholder: 'https://www.example.com',
		displayOptions: { show: { resource: [MAILER], operation: HAS_QR } },
		description:
			'URL to autogenerate a QR code on the mailer. If not specified, the account default QR code URL will be used.',
	},

	// Background (postcards, notecards, magnacards)
	{
		displayName: 'Use Custom Background',
		name: 'use_custom_background',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: [MAILER], operation: HAS_BACKGROUND } },
		description: 'Whether to use a custom background image (turns off the default background)',
	},
	{
		displayName: 'Custom Background Image URL',
		name: 'custom_background_image',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/background.png',
		displayOptions: { show: { resource: [MAILER], operation: HAS_BACKGROUND } },
		description: 'URL to a custom background image placed behind the handwritten message',
	},

	// Letter-only
	{
		displayName: 'Additional Pages URL',
		name: 'additional_pages_url',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: [MAILER], operation: IS_LETTER } },
		description: 'URL to additional pages to include with the cover letter',
	},
	{
		displayName: 'PDF Only URL',
		name: 'pdf_only_url',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: [MAILER], operation: IS_LETTER } },
		description:
			'URL to a PDF file to use for the entire mailer. If specified, no cover letter is generated.',
	},

	// Giftcard-only
	{
		displayName: 'Giftcard Brand',
		name: 'giftcard_brand',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions: { show: { resource: [MAILER], operation: ['sendGiftcard'] } },
		description: 'Brand of giftcard to send',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a brand...',
				typeOptions: {
					searchListMethod: 'searchGiftcardBrands',
					searchable: true,
				},
			},
			{
				displayName: 'Brand Code',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. amazonus',
			},
		],
	},
	{
		displayName: 'Giftcard Amount',
		name: 'giftcard_amount_in_cents',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions: { show: { resource: [MAILER], operation: ['sendGiftcard'] } },
		description: 'Amount of the giftcard. Available amounts depend on the selected brand.',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select an amount...',
				typeOptions: {
					searchListMethod: 'searchGiftcardAmounts',
					searchable: false,
				},
			},
			{
				displayName: 'Amount (Cents)',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 5000 for $50',
			},
		],
	},
];

const additionalFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [MAILER], operation: ALL_OPS } },
		options: [
			{
				displayName: 'Handwriting Color',
				name: 'handwriting_color',
				type: 'color',
				default: '',
				placeholder: 'blue or #4287f5',
				description: 'Preset color (blue, black, green, purple, red) or hex string',
			},
			{
				displayName: 'Handwriting Realism',
				name: 'handwriting_realism',
				type: 'boolean',
				default: false,
				description: 'Whether to enable the realism effect for AI fonts',
			},
			{
				displayName: 'Handwriting Style ID',
				name: 'handwriting_style_id',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'ID of the handwriting style to use',
			},
			{
				displayName: 'Notification Emails',
				name: 'notification_emails',
				type: 'string',
				default: '',
				placeholder: 'ops@example.com,sales@example.com',
				description: 'Comma-separated list of email addresses to notify about order events',
			},
			{
				displayName: 'Preview',
				name: 'preview',
				type: 'boolean',
				default: false,
				description: 'Whether to return a preview instead of sending the mail piece',
			},
			{ displayName: 'Return Address', name: 'return_address', type: 'string', default: '' },
			{ displayName: 'Return Address 2', name: 'return_address2', type: 'string', default: '' },
			{ displayName: 'Return City', name: 'return_city', type: 'string', default: '' },
			{ displayName: 'Return Name', name: 'return_name', type: 'string', default: '' },
			{ displayName: 'Return Postal Code', name: 'return_postal_code', type: 'string', default: '' },
			{ displayName: 'Return State', name: 'return_state', type: 'string', default: '' },
			{
				displayName: 'Send Standard Mail',
				name: 'send_standard_mail',
				type: 'boolean',
				default: false,
				description: 'Whether to use Standard Mail postage instead of First Class',
			},
			{
				displayName: 'Sub-Account ID',
				name: 'sub_account',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Sub-account ID to use for this order',
			},
		],
	},
];

export const mailerFields: INodeProperties[] = [
	...audienceFields,
	...creativeFields,
	...additionalFields,
];

export const mailerOperationToEndpoint: Record<string, string> = {
	sendPostcard: '/send/postcard',
	sendLetter: '/send/letter',
	sendWindowlessLetter: '/send/windowlessletter',
	sendNotecard: '/send/notecard',
	sendGiftcard: '/send/giftcard',
	sendMagnacard: '/send/magnacard',
};
