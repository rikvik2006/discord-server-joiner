import { Captcha, Client, ClientOptions } from "discord.js-selfbot-v13";
import { Solver } from "2captcha";
import { HttpsProxyAgent } from "https-proxy-agent"
import { ConfigType } from "./types";
import fs from "fs";


class ServerJoiner {
    debug: boolean
    inviteCode: string = "";
    joinDelay: number = 3000;
    tokens: string[] = [];
    captchaApiKey: string = "";
    useProxy: boolean = false
    proxyes: string[] = []
    readonly solver: Solver
    private client?: Client;

    constructor(debug: boolean = false) {
        this.debug = debug;
        try {
            let data = fs.readFileSync("./files/config.json")
            const JSONDataConfig: ConfigType = JSON.parse(data.toString());

            this.inviteCode = JSONDataConfig.inviteCode;
            this.joinDelay = JSONDataConfig.joinDelay;
            this.useProxy = JSONDataConfig.useProxy
            this.captchaApiKey = JSONDataConfig.captchaApiKey;

            this.loadTokens();
            this.loadProxy()
        } catch (err) {
            console.log(err);
        }

        this.solver = new Solver(this.captchaApiKey);
    }

    loadTokens(): void {
        try {
            const data = fs.readFileSync('./file/tokens.txt');
            let tokenArray = data.toString().split("\n")
            tokenArray = tokenArray.map((token) => token.trim().replace("\r", "").replace("\n", ""))
            this.tokens = tokenArray;
        } catch (err) {
            console.log("❌ There was an error in token loading")
            console.log(err);
        }
    }

    loadProxy(): void {
        try {
            let proxyes = fs.readFileSync("./files/proxy.txt").toString().split("\n")
            proxyes.map((proxy) => proxy.replace("\r", "").replace("\n", ""));

            this.proxyes = proxyes;
        } catch (err) {
            console.log("❌ There was an erorr reading the proxy file")
            console.log(err);
        }
    }

    getRandomProxy(): string {
        const proxy = this.proxyes[Math.floor(Math.random() * this.proxyes.length)]
        return proxy;
    }

    private createClient(): void {


        let proxyAgent: HttpsProxyAgent<string> | undefined;
        if (this.useProxy) {
            proxyAgent = new HttpsProxyAgent(this.getRandomProxy());
        }

        const options: ClientOptions = {
            captchaSolver: async (captcha: Captcha, userAgent: string) => {
                this.debug ?? console.log(`🍜 Captcha Sitekey: ${captcha.captcha_sitekey}`)
                try {
                    const { data } = await this.solver.hcaptcha(
                        captcha.captcha_sitekey,
                        'discord.com',
                        {
                            invisible: 1,
                            userAgent: userAgent,
                            data: captcha.captcha_rqdata
                        }
                    )

                    return data
                } catch (err) {
                    console.log("❌ There was an error, while soving the captcha")
                    throw err;
                }
            },
            ...(proxyAgent ? {
                ws: {
                    agent: proxyAgent,
                },
                http: {
                    agent: proxyAgent,
                }
            } : {})
        }


        this.client = new Client(options);
    }

    async bulkJoin(): Promise<void> {
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
                const invite = await this.client.fetchInvite(this.inviteCode)
                try {
                    await this.client!.acceptInvite(this.inviteCode)
                } catch (err) {
                    console.log("❌ There was an error during accept invite");
                    console.log(err);
                }

                console.log(`⭐ ${this.client.user?.username} joined in guild: ${invite.guild?.name}`)
                this.client.destroy();
            })

        }
    }
}

const app = new ServerJoiner(true);
