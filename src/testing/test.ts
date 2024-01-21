import { Client, Captcha } from "discord.js-selfbot-v13";
const CaptchaResolver = require("2captcha");

const solver = new CaptchaResolver.Solver("8fef4ac82a9076dfa21485fab1ea5d2b")
const inviteCode = "86rWJqqW"

const captchaInfo: Captcha = {
    captcha_sitekey: "a9b5fb07-92ff-493f-86fe-352a2803b3df",
    captcha_service: "hcaptcha",
    captcha_key: ["You need to update your app to join this server."]
}
const client = new Client({
    captchaSolver: async function (captcha: Captcha, userAgent: string) {
        console.log(`🍜 Captcha Sitekey: ${captcha.captcha_sitekey}`)
        const { data } = await solver.hcaptcha(
            captcha.captcha_sitekey,
            "discord.com",
            {
                invisible: 1,
                userAgent: userAgent,
                data: captcha.captcha_rqdata,
            }
        )

        console.log(`🤖 Captcha result: ${data}`)
        return data
    }
});

client.on('debug', console.log);

client.on("ready", async () => {
    console.log(`💚 Loged in as ${client.user?.username}`)

    const invite = await client.fetchInvite(`https://discord.gg/${inviteCode}`)
    try {
        await client.acceptInvite(`${inviteCode}`);
        console.log(`⭐ User ${client.user?.username} Joined in the guild ${invite.guild?.name}`)
        console.log("⭐ Joined in the guild")
    } catch (err) {
        console.log("❌ There was an error");
        console.log(err)
    }
})

client.login("MTE1Njk2NTIyMzg2NjA0ODU2Mg.G7kuBM.4zk9mllD8-2ZDAO2jCTj0PxLRIYX1g7Pa1w-Vw");