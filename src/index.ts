import { Captcha, Client, ClientOptions, WebhookClient, MessageEmbed, MessageAttachment } from "discord.js-selfbot-v13";
import { Solver } from "2captcha";
import { HttpsProxyAgent } from "https-proxy-agent"
import { ConfigType } from "./types";
// import { setInterval as wait } from "node:timers/promises"
import { setTimeout as wait } from "node:timers/promises"
import fs from "fs";
import path from "path";

class ServerJoiner {
    debug: boolean
    inviteCode: string = "";
    joinDelay: number = 3000;
    tokens: string[] = [];
    captchaApiKey: string = "";
    captchaRetryLimit: number = 5
    discordWebhookJoinLogs: string = "";
    useProxy: boolean = false
    proxyes: string[] = []
    readonly solver: Solver
    private client?: Client;

    constructor(debug: boolean = false) {
        this.debug = debug;
        try {
            let data = fs.readFileSync(path.join(".", "files", "config.json"))
            const JSONDataConfig: ConfigType = JSON.parse(data.toString());

            this.inviteCode = JSONDataConfig.inviteCode;
            this.joinDelay = JSONDataConfig.joinDelay;
            this.useProxy = JSONDataConfig.useProxy
            this.captchaApiKey = JSONDataConfig.captchaApiKey;
            this.captchaRetryLimit = JSONDataConfig.captchaRetryLimit
            this.discordWebhookJoinLogs = JSONDataConfig.discordWebhookJoinLogs;

            this.loadTokens();
            this.loadProxy()
        } catch (err) {
            console.log(err);
        }

        this.solver = new Solver(this.captchaApiKey);
    }

    loadTokens(): void {
        try {
            const data = fs.readFileSync(path.join(".", "files", "tokens.txt"));
            let tokenArray = data.toString().split("\n");
            tokenArray = tokenArray.map((token) => token.trim().replace("\r", "").replace("\n", ""));
            tokenArray = tokenArray.filter((token) => token.length > 0);
            this.tokens = tokenArray;
        } catch (err) {
            console.log("❌ There was an error in token loading")
            console.log(err);
        }
    }

    loadProxy(): void {
        try {
            let proxyes = fs.readFileSync(path.join(".", "files", "proxyes.txt")).toString().split("\n")
            proxyes = proxyes.map((proxy) => proxy.replace("\r", "").replace("\n", ""));
            proxyes = proxyes.filter((proxy) => proxy.length > 0);

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
                    console.log(err);
                    throw err;
                }
            },
            ...(proxyAgent ? {
                http: {
                    // TODO: FIX: Proxy seem not working
                    agent: proxyAgent,
                    // Prevent Unknown Message erorr, but coulden't be the final solution
                    headers: { "x-super-properties": "ewogICJvcyI6ICJXaW5kb3dzIiwKICAiYnJvd3NlciI6ICJEaXNjb3JkIENsaWVudCIsCiAgInJlbGVhc2VfY2hhbm5lbCI6ICJjYW5hcnkiLAogICJjbGllbnRfdmVyc2lvbiI6ICIxLjAuNDkiLAogICJvc192ZXJzaW9uIjogIjEwLjAuMjI2MjEiLAogICJvc19hcmNoIjogIng2NCIsCiAgInN5c3RlbV9sb2NhbGUiOiAiZW4tVVMiLAogICJjbGllbnRfYnVpbGRfbnVtYmVyIjogIjE1MjQ1MCIsCiAgImNsaWVudF9ldmVudF9zb3VyY2UiOiBudWxsCn0=" }
                }
            } : {}),

            captchaRetryLimit: this.captchaRetryLimit
        }

        this.client = new Client(options);
    }

    async bulkJoin(): Promise<void> {
        console.log("Tokens:", this.tokens.length)
        if (this.tokens.length == 0) {
            throw new Error("tokens list is empty. load tokens in the file ./files/tokens.txt")
        }

        for (let token of this.tokens) {
            await this.joinWithToken(token);
        }
    }

    private async joinWithToken(token: string): Promise<void> {
        this.createClient();
        if (!this.client) {
            throw new Error(`Can't create the client with token: ${token}`);
        }

        // Wrap the entire process in a try-catch block to handle errors
        try {
            await new Promise<void>((resolve) => {
                const readyListener = async () => {
                    console.log(`[${new Date().toLocaleString("it-IT")}] ✅ Logged in as ${this.client?.user?.username}`);
                    const invite = await this.client!.fetchInvite(this.inviteCode);

                    try {
                        if (!this.client) {
                            throw new Error(`Can't create the client with token: ${token}`)
                        }
                        await this.client.acceptInvite(this.inviteCode);
                        console.log(`⭐ ${this.client?.user?.username} joined in guild: ${invite.guild?.name}`);

                        const webhookClient = new WebhookClient({ url: this.discordWebhookJoinLogs })
                        const joinEmbed = new MessageEmbed()
                            .setColor("GREEN")
                            .addFields([
                                {
                                    name: "username",
                                    value: this.client.user?.username ? this.client.user?.username : "Undefined Username"
                                },
                                {
                                    name: "Guild name",
                                    value: invite.guild?.name ? invite.guild?.name : "undefined Guild name"
                                }
                            ])
                            .setAuthor({ name: "Server Joiner", url: "https://github.com/rikvik2006/discord-server-joiner" })

                        await webhookClient.send({
                            embeds: [joinEmbed]
                        })

                        await wait(this.joinDelay);
                    } catch (err) {
                        console.log("❌ There was an error during accept invite");
                        console.log(err);
                        const webhookClient = new WebhookClient({ url: this.discordWebhookJoinLogs })
                        const failEmbed = new MessageEmbed()
                            .setColor("RED")
                            .addFields([
                                {
                                    name: "username",
                                    value: this.client?.user?.username ? this.client.user?.username : "Undefined Username"
                                },
                                {
                                    name: "Guild name",
                                    value: invite.guild?.name ? invite.guild?.name : "undefined Guild name"
                                }
                            ])

                        const errorBuffer: Buffer = Buffer.from(`${err}`)
                        const errorAttachments = new MessageAttachment(errorBuffer, "Join Error")
                        await webhookClient.send({
                            embeds: [failEmbed],
                            attachments: [errorAttachments]
                        })
                    } finally {
                        this.client!.destroy();
                        resolve();
                    }
                }

                this.client!.once("ready", readyListener);

                this.client!.login(token).catch((err) => {
                    console.log("❌ There was an error in login token");
                    console.log(err);
                    resolve(); // Resolve the promise even if login fails to move to the next iteration
                });
            });
        } catch (err) {
            console.log("❌ There was an error in joinWithToken");
            console.log(err);
        }
    }
}

const app = new ServerJoiner(true);
app.bulkJoin()
