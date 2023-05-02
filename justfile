set export
set dotenv-load

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
  npm run build

run: cls build
  npm run start

# update bot module assuming path is ../easy-bsky-bot-sdk
update-bot-module:
  cd ../easy-bsky-bot-sdk && npm run build
  npm i ../easy-bsky-bot-sdk

test: cls
  ts-node src/test/dispatcher.test.ts

test-sheet: cls build
  ts-node src/utils/sheets.ts

update-faqs: cls
  ts-node src/cli.ts update-faqs

show-faqs: cls
  ts-node src/cli.ts show-faqs
