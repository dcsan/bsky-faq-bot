# useful tools and commands
# install from https://github.com/casey/just
# use `just` command on its own to see a summary


set export
set dotenv-load # load .env values to use in here
set ignore-comments := true

# list all recipes
default:
  @just --list

# remove build artifacts
clean:
  rm -rf build/*

cls:
  clear && printf '\e[3J'

show-invited:
  curl -s -H "Authorization: Bearer $(curl -s --json '{"identifier": "${BSKY_USERNAME}", "password": "${BSKY_PASSWORD}"}' https://bsky.social/xrpc/com.atproto.server.createSession | jq -j ".accessJwt")" "https://bsky.social/xrpc/com.atproto.server.getAccountInviteCodes" | jq -r '.codes[].uses[].usedBy' | xargs -I{} -P10 curl -s 'https://plc.directory/{}' | jq -r '.alsoKnownAs[0]' | sed -e 's#at://#@#'

start: cls
  npm run start

build: cls clean
  time npm run build

run: cls build
  npm run start

# --- deployment ----

fetch-deploy: cls faqs-fetch deploy

deploy: build
  fly deploy

# remove local bot module
# npm i easy-bsky-bot-sdk
# use botsdk from DCs build at github.com:dcsan/easy-bsky-bot-sdk.git
deploy-prepare:
  npm uninstall easy-bsky-bot-sdk
  npm i https://github.com/dcsan/easy-bsky-bot-sdk

# update bot module assuming path is ../easy-bsky-bot-sdk
dev-prepare:
  npm uninstall easy-bsky-bot-sdk
  cd ../easy-bsky-bot-sdk && npm run build
  npm i ../easy-bsky-bot-sdk

test-faq-replies: cls
  ts-node src/test/dispatcher.test.ts

test-gpt-lib: cls
  ts-node src/test/gptLib.test.ts

test-sheet: cls build
  ts-node src/utils/sheets.ts

#--- working with FAQ data ----

# fetch from google sheet
faqs-fetch: cls
  ts-node src/cli.ts faqs-fetch

# show for previewing
faqs-show: cls
  ts-node src/cli.ts faqs-show

docker-build:
  docker build . -t bsfaqbot
  docker run -dp 8080:8080 bsfaqbot

docker-login name='bsfaqbot':
  docker exec -it $name sh

