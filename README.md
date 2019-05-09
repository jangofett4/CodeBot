# CodeBot
CodeBot is a discord bot. CodeBot filters messages in specified channels, so there can only be code in that channel (for easier access).

CodeBot offers some predefined languages to use, and adding languages is easy!
Currently predefined languages are:
 - C++
 - C#
 - SQL
 - JavaScript

## Hosting
CodeBot does not offer a free/paid hosting service. You have to clone this reposity and setup for your server.

## Performance
This bot uses string operations to check if message is code or not. This will create overhead IF a message is processing.
Bot won't load CPU when idle. Algorithm for filtering messages is pretty badly designed, but can be improved.

## Setting Up
This bot reqires nodejs to run. Install it to your system before trying to setup.

Open terminal (or equivalent)

You will need TypeScript to compile this bot. If not installed type:

`npm install -g typescript`

Clone this repository:

```
git clone https://github.com/jangofett4/CodeBot
cd CodeBot
```

Install node packages and types:

```
npm install
npm install @types/node
```

Installing types are generally not needed but will be useful for development.

Compile Bot using tsc:

```
tsc CodeBot.ts
```

Or use make to compile (Windows users will need MinGW or Cygwin):

```
make all
```

Start the bot:

```
nodejs CodeBot.js > CodeBot.log
```

Or in windows:

```
node CodeBot.js > CodeBot.log
```

Or with make:

```
make run
```

If you want to run it headless (Linux):

```
setsid node > codebot.log
# OR
make headless
```