# Välkommen hit - frontend
This is the source code for the frontend of Välkommen hit.

## Development
```
npm start
```

## Build
```
REACT_APP_ENV argument can be any of these: dev, cont, prod

eg: REACT_APP_ENV=cont npm run build
```

## Environment Variables
Add the variables to a file called __.env.{stage}__

### Available environment variables
- __REACT_APP_ENV__
- __REACT_APP_LAMBDA_URL__
- __REACT_APP_AWS_DEFAULT_REGION__
- __REACT_APP_AWS_COGNITO_APP_CLIENT_ID__
- __REACT_APP_AWS_COGNITO_USER_POOL_ID__
- __REACT_APP_AWS_DOMAIN_NAME__
- __REACT_APP_MAP_PROXY_URL__
- __REACT_APP_GA_ID__

