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

# compile botsdk package and run bot
pack-run: dev-prepare run

# --- deployment ----

fetch-deploy: cls faqs-fetch deploy fly-logs

fly-logs:
  fly logs

deploy: build fly-resume
  fly deploy

# use botsdk from DCs build at github.com:dcsan/easy-bsky-bot-sdk.git
prod-prepare:
  npm uninstall easy-bsky-bot-sdk
  npm i https://github.com/dcsan/easy-bsky-bot-sdk

# use local dev version of bot SDK assuming path is ../easy-bsky-bot-sdk
dev-prepare:
  npm uninstall easy-bsky-bot-sdk
  cd ../easy-bsky-bot-sdk && npm run build
  npm i ../easy-bsky-bot-sdk


# stop app on fly https://fly.io/docs/apps/scale-count/#scale-to-zero-and-back-up
fly-stop:
  fly scale count 0
  fly scale show

fly-resume:
  flyctl scale count 1


# use a different .env file via symlink
switch-env newenv:
  -mv .env .env.old
  @echo "switching to {{newenv}}"
  ln -s {{newenv}} .env
  ls -lah .env*

# --- testing -----

test-cmds: cls
  ts-node src/test/mudCommands.test.ts

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

#--- story data ----

story-fetch-all: cls
  ts-node src/cli.ts story-fetch-all

story-parse-scenes: cls
  ts-node src/cli.ts story-parse-scenes

story-redo: cls
  ts-node src/cli.ts story-redo

story-render: cls
  ts-node src/cli.ts story-render

story-html5 mdfile='/Users/dc/dev/bsky/bsky-faq-bot/src/data/story/1684126037240/story.md': cls
  pandoc --from=markdown --to=html5 --output=test.html ${mdfile}


#--- docker ----
docker-build:
  docker build . -t bsfaqbot
  docker run -dp 8080:8080 bsfaqbot

docker-login name='bsfaqbot':
  docker exec -it $name sh

