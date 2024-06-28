# Discord Server Joiner

## What is this?

This is a bulk discord server joiner. It will join all account tokens in the `tokens.txt` file to the server specified in the `config.json` file under `inviteCode` (server invite code).

## How do I use this?

-   Clone (reccomanded) or download the latest release from the [releases]()
-   Extract the zip file
-   Download the latest version of [NodeJS](https://nodejs.org/en/download/)
-   Download the latest version of PNPM [here](https://pnpm.io/installation)
-   Install the dependencies by running `pnpm i` in the terminal
-   Copy the folder files.template and paste it in the same directory, rename it to `files`
-   Open the `tokens.txt` file and paste all your tokens in there as file shows (one token per line)
-   [OPTIONAL] Put you proxy list in the `proxies.txt` file (one proxy per line)
-   Compile the `config.json` file as following:
    1. Under `inviteCode` put the server invite code you want to join
    2. Under `joinDelay` put the delay between each join (in milliseconds)
    3. Under `useProxies` put `true` if you want to use proxies, `false` if you don't want to use proxies
    4. Under `captchaApiKey` put your 2captcha api key. If you don't have one, you can get one [here](https://2captcha.com/enterpage). The price for 1000 hCaptcha resolves is $2.99. This very cheap. This program need a 2captcha api key to solve hCaptcha. Without you will not be able to join the server, because now discord put hCaptcha every time you join a server.
    5. Under `captchaRetryLimit` put the amount of retries the program will do if the captcha fails, default amount is 5, but if you can afford it you can put more, this will increase the time it takes to join the server, but it will increase the chance of success, my reccomandation is to put 10
    6. Under `discordWebhookJoinLogs` put your discord webhook url if you want to get logs of the joins/fails and join statistics
-   Build the project by running `pnpm build` in the terminal
-   Run the project by running `pnpm start` in the terminal

## How do I get my tokens?

**Run code (Discord Console - [Ctrl + Shift + I])**

```js
window.webpackChunkdiscord_app.push([
    [Math.random()],
    {},
    (req) => {
        if (!req.c) return;
        for (const m of Object.keys(req.c)
            .map((x) => req.c[x].exports)
            .filter((x) => x)) {
            if (m.default && m.default.getToken !== undefined) {
                return copy(m.default.getToken());
            }
            if (m.getToken !== undefined) {
                return copy(m.getToken());
            }
        }
    },
]);
console.log("%cWorked!", "font-size: 50px");
console.log(`%cYou now have your token in the clipboard!`, "font-size: 16px");
```

If this code doesn't work, you can open your chrome developer tools and go to the `Network` tab. Then send a message on discord and look for a request with the name `messages`. Click on it and go to the `Headers` tab. Search for `Request Headers` section, scroll down until you see `authorization` and copy the value of it.
