# n8n-nodes-thanks-io

This is an n8n community node. It lets you use _app/service name_ in your n8n workflows.

_App/service name_ is _one or two sentences describing the service this node integrates with_.

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

_List the operations supported by your node._

## Credentials
### API Key
- Generate a Personal Access Token in Thanks.io (Dashboard → Profile → API).
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

Thanks.io uses OAuth2. Create a Thanks.io OAuth app and use the `Thanks.io OAuth2 API` credential.

### Redirect URI
- Use your n8n callback URL: `https://<your-n8n-host>/rest/oauth2-credential/callback`

### Default OAuth endpoints
- The node defaults to your OAuth server:
	- Authorization URL: `https://oauth.yourdomain.com/oauth/authorize`
	- Access Token URL: `https://oauth.yourdomain.com/oauth/token`
- Users can override these in the Credentials UI or via credentials overwrites.

### Configure via UI
- Enter `Client ID` and `Client Secret` provided by your OAuth server.
- Optional: use expressions like `={{ $env.THANKSIO_CLIENT_ID }}` to pull values from environment variables.

### Configure via credentials overwrites (self-hosted)
Create a JSON file and point n8n at it:

```bash
mkdir -p ~/.config/n8n
cat > ~/.config/n8n/credentials-overwrites.json <<'JSON'
{
	"thanksIoOAuth2Api": {
		"clientId": "={{ $env.THANKSIO_CLIENT_ID }}",
		"clientSecret": "={{ $env.THANKSIO_CLIENT_SECRET }}",
		"authUrl": "={{ $env.THANKSIO_AUTH_URL }}",
		"accessTokenUrl": "={{ $env.THANKSIO_TOKEN_URL }}"
	}
}
JSON

export N8N_CREDENTIALS_OVERWRITE_DATA_FILE="$HOME/.config/n8n/credentials-overwrites.json"
n8n start
```

## Compatibility

_State the minimum n8n version, as well as which versions you test against. You can also include any known version incompatibility issues._

## Usage

_This is an optional section. Use it to help users with any difficult or confusing aspects of the node._

_By the time users are looking for community nodes, they probably already know n8n basics. But if you expect new users, you can link to the [Try it out](https://docs.n8n.io/try-it-out/) documentation to help them get started._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* _Link to app/service documentation._

## Version history

_This is another optional section. If your node has multiple versions, include a short description of available versions and what changed, as well as any compatibility impact._
