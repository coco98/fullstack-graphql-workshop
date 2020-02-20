# 3factor workshop deploy to Heroku

### bit.ly/3factor

## Options:

1. Local development: Requires docker, node/npm
2. Browser based: Requires no installation, except a Heroku account

## Browser based (Heroku / Glitch)
[![Deploy to
Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/coco98/3factor-workshop-heroku)

**Glitch:** https://glitch.com/~transparent-book-j4rrqo19xb

## Environment variables:

HASURA_GRAPHQL_ADMIN_SECRET: secret

HASURA_GRAPHQL_JWT_SECRET: {"type": "HS256", "key": "myjwtsecretkey111111111111111111111111111111111"}
