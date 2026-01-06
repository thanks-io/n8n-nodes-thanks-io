# n8n-nodes-thanks-io

This is an n8n community node. It lets you use thanks.io in your n8n workflows.

thanks.io provides everything you need for direct mail success: AI Realistic Handwritten postcards, letters & notecards, QR tracking, delivery notifcations, automation, and texting all at super competitive pricing.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

* Add Recipeint To Mailing List

## Credentials
### API Key
- Generate a Personal Access Token in thanks.io (Dashboard → Settings → API Access) - [https://dashboard.thanks.io/profile/account/billing](https://dashboard.thanks.io/profile/account/billing)
- In n8n, create a credential "Thanks.io API" and paste your token.
- Requests will use `Authorization: Bearer <token>`.

Env-based via Credentials Overwrites:
```bash
export THANKSIO_API_KEY=shhh
cat > ~/.config/n8n/credentials-overwrites.json <<'JSON'
{
	"thanksIoApi": {
		"apiKey": "={{ $env.THANKSIO_API_KEY }}"
	}
}
JSON
export N8N_CREDENTIALS_OVERWRITE_DATA_FILE="$HOME/.config/n8n/credentials-overwrites.json"
```

## Compatibility

Tested against n8n version 2.2.1

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [thanks.io technical documentation](https://docs.thanks.io)
* [thanks.io producc documentation](https://help.thanks.io)