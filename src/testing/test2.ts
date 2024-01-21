import { Client, Captcha } from "discord.js-selfbot-v13";
import CaptchaClient from "@infosimples/node_two_captcha";

console.log("🍜 Starting test2.ts script")

const captchaClient = new CaptchaClient("8fef4ac82a9076dfa21485fab1ea5d2b", {
    timeout: 60000,
    polling: 5000,
    throwErrors: false,
})

const client = new Client({
    captchaSolver: async function (captcha: Captcha, userAgent: string) {
        const response = await captchaClient.decodeHCaptcha({
            sitekey: captcha.captcha_sitekey,
            pageurl: "https://discord.com",
            invisible: false,

        })

        console.log("🤖", response.text)
        return response.text as string
    }
});


client.on('debug', console.log);

client.on("ready", async () => {
    console.log(`💚 Loged in as ${client.user?.username}`)

    const invite = await client.fetchInvite("https://discord.gg/86rWJqqW")
    try {
        await client.acceptInvite("86rWJqqW");
        console.log(`⭐ User ${client.user?.username} Joined in the guild ${invite.guild?.name}`)
    } catch (err) {
        console.log("❌ There was an error");
        console.log(err)
    }
})


client.login("MTE1Njk2NTIyMzg2NjA0ODU2Mg.G7kuBM.4zk9mllD8-2ZDAO2jCTj0PxLRIYX1g7Pa1w-Vw");