import { Client, Captcha } from "discord.js-selfbot-v13";
import CaptchaResolver from "2captcha"

const solver = new CaptchaResolver.Solver("8fef4ac82a9076dfa21485fab1ea5d2b")

const captchaInfo: Captcha = {
    captcha_sitekey: "a9b5fb07-92ff-493f-86fe-352a2803b3df",
    captcha_service: "hcaptcha",
    captcha_key: ["You need to update your app to join this server."]
}
const client = new Client({
    captchaSolver: async function (captcha: Captcha, userAgent: string) {
        const { data } = await solver.hcaptcha(captcha.captcha_sitekey, "discord.com",
            {
                invisible: 1,
                userAgent: userAgent,
                data: captcha.captcha_rqdata,
            }
        )

        return data
    }
});

client.login("MTE1Njk2NTIyMzg2NjA0ODU2Mg.G2oMgH.c-9IUQ__45Aj8evp8RdX6Ib8-CaieH8Jf4jSXE");

client.on("ready", async () => {
    console.log(`💚 Loged in as ${client.user?.username}`)

    const invite = await client.fetchInvite("https://discord.gg/knWPDXVt")
    client.acceptInvite(invite.code);
})

