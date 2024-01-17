import { Client, ClientOptions } from "discord.js-selfbot-v13";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ConfigType } from "./types";
import fs from "fs";


class ServerJoiner {
    inviteCode: string = "";
    joinDelay: number = 3000;
    tokens: string[] = []
    captchaService: string = "";
    captchaApiKey: string = "";
    private client?: Client;

    constructor() {
        try {
            let data = fs.readFileSync("./files/config.json",)
            const JSONDataConfig: ConfigType = JSON.parse(data.toString());

            this.inviteCode = JSONDataConfig.inviteCode;
            this.joinDelay = JSONDataConfig.joinDelay;
            this.captchaService = JSONDataConfig.captchaService;
            this.captchaApiKey = JSONDataConfig.captchaApiKey;

            data = fs.readFileSync('./file/tokens.txt');
            let tokenArray = data.toString().split("\n")
            tokenArray = tokenArray.map((token) => token.trim().replace("\r", "").replace("\n", ""))
            this.tokens = tokenArray;
        } catch (err) {
            console.log(err);
        }
    }

    private createClient() {
        /*
        captchaService: config.captcha_service.toLowerCase(),
        captchaKey: config.captcha_api_key,
        checkUpdate: false,
        http: { agent: agent },
        captchaWithProxy: true,
        proxy: randomProxy,
        restRequestTimeout: 60 * 1000,
        interactionTimeout: 60 * 1000,
        restWsBridgeTimeout: 5 * 1000,
        */

        const options: ClientOptions = {
            captchaSolver(
            )
        }

        this.client = new Client({
            captchaSolver()
        });
    }

    async bulkJoin() {
        if (this.tokens.length == 0) {
            throw new Error("tokens list is empty. load tokens in the file ./files/tokens.txt")
        }

        for (let token of this.tokens) {
            this.createClient()
            if (!this.client) {
                throw new Error(`Can't create the client with token: ${token}`)
            }

            this.client.login(token);

            this.client.on("ready", async () => {
                if (!this.client) {
                    throw new Error(`Can't create the client with token: ${token}`)
                }

                console.log(`✅ Logged in as ${this.client.user?.username}`)
                try {
                    await this.client!.acceptInvite(`https://discord.gg/${this.inviteCode}`)
                } catch (err) {
                    console.log("❌ There was an error during accept invite");
                    console.log(err);
                }

                console.log(`⭐ ${this.client.user?.username} joined in the guild`)
                this.client.destroy();
            })

        }
    }
}

const app = new ServerJoiner()
