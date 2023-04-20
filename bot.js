const fs = require('fs');

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const shortid = require('shortid');

require('dotenv').config({ path: "config/.env" });

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async ctx => {
    const startPayload = ctx.startPayload;
    if (!startPayload) ctx.reply(`Hi ${ctx.chat.first_name}! Welcome to Mosallas Group Uploader bot is there anything you want to upload?`);
    else {
        const exist = fs.existsSync(`./uploads/${startPayload}.mp4`);

        if (exist) {
            await ctx.reply("Sending...");
            ctx.replyWithVideo({ source: `./uploads/${startPayload}.mp4` });
        } else ctx.reply("There is no video with this id");
    }
});

bot.on(message('video'), async ctx => {
    ctx.reply("Downloading...");

    const fileId = ctx.message.video.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const response = await fetch(fileLink);
    const buffer = await response.arrayBuffer();

    const fileName = `${shortid.generate()}`;
    fs.writeFileSync(`./uploads/${fileName}.mp4`, Buffer.from(buffer));

    ctx.reply(`https://t.me/mosallas_group_uploader_bot?start=${fileName}`, { reply_to_message_id: ctx.message.message_id });
});

bot.launch();