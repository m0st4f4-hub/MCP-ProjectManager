# OAuth Setup

Configure the following environment variables in `backend/.env` to enable OAuth login:

```
OAUTH_CLIENT_ID=<client id>
OAUTH_CLIENT_SECRET=<client secret>
OAUTH_SERVER_METADATA_URL=<provider metadata url>
OAUTH_REDIRECT_URI=http://localhost:8000/auth/oauth/callback
OAUTH_SCOPE=openid email profile
```

`OAUTH_SERVER_METADATA_URL` should point to the provider's OpenID Connect discovery document.
`OAUTH_REDIRECT_URI` must match the callback URL configured in your provider.
Install dependencies and restart the backend after updating these values.
