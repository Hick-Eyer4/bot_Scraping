const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { token } = require("./config.json");
const puppeteer = require("puppeteer");
const express = require("express");
const mtg = require("mtgsdk");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Bot ON");
});

client.on("messageCreate", (msg) => {
  if (msg.content.substring(0, msg.content.indexOf(" ")) === "$liga") {
    priceSearch(msg);
  }

  if (msg.content.substring(0, msg.content.indexOf(" ")) === "$scry") {
    //ruleSearch(ruleSearchLink(msg),msg);
    ruleSearchLink(msg);
  }
});
client.login(token);

/*
FUNÇÕES
*/

async function priceSearch(msg) {
  const m = msg.content;
  const channel = msg.channel.id;
  const embed = new EmbedBuilder();

  const searchString = m.substring(m.indexOf(" ") + 1);
  const searchURL =
    "https://www.ligamagic.com.br/?view=cards/card&card=" +
    searchString
      .replace(`'`, "%27")
      .replace(",", "%2C")
      .replaceAll(" ", "+")
      .replace("#", "%23");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(searchURL);

  try {
    const pageContent = await page.evaluate(() => {
      return {
        card_name: document.querySelector(".nome-principal > span").textContent,
        card_image: document.querySelector(".main-card").src,
        min_preco: document.querySelector(".col-prc.col-prc-menor").innerText,
        med_preco: document.querySelector(".col-prc.col-prc-medio").innerText,
        max_preco: document.querySelector(".col-prc.col-prc-maior").innerText,
      };
    });
    
    embed.setTitle(pageContent.card_name)
      .setURL(searchURL)
      .setImage(pageContent.card_image)
      .addFields({
        name: "Menor Preço",
        value: pageContent.min_preco,
        inline: true,
      },
      {
        name: "Preço Médio",
        value: pageContent.med_preco,
        inline: true,
      },
      {
        name: "Maior Preço",
        value: pageContent.max_preco,
        inline: true,
      }
    );

    msg.reply({ embeds: [embed] });

    // msg.reply(pageContent.card_image);

    // msg.channel.send(
    //   "Menor: " +
    //     pageContent.min_preco +
    //     "\nMédio: " +
    //     pageContent.med_preco +
    //     "\nMaior: " +
    //     pageContent.max_preco
    // );

    await browser.close();
  } catch (e) {
    //SE NÃO CONSEGUIR ENCONTRAR

    try {
      const searchList = await page.evaluate(() => {
        return {
          card_name: document.querySelector(".mtg-info .mtg-name > a").textContent,
          card_image: document.querySelector("#item_1 .main-card").src,
          min_preco: document.querySelector(".price-min").innerText,
          med_preco: document.querySelector(".price-avg").innerText,
          max_preco: document.querySelector(".price-max").innerText,
        };
      });

      embed.setTitle(searchList.card_name)
      .setURL(searchURL)
      .setImage(searchList.card_image)
      .addFields({
        name: "Menor Preço",
        value: searchList.min_preco,
        inline: true,
      },
      {
        name: "Preço Médio",
        value: searchList.med_preco,
        inline: true,
      },
      {
        name: "Maior Preço",
        value: searchList.max_preco,
        inline: true,
      }
    );

      msg.reply({ embeds: [embed] });

      // msg.reply(searchList.card_image);

      // msg.channel.send(
      //   "Menor: " +
      //   searchList.min_preco +
      //     "\nMédio: " +
      //     searchList.med_preco +
      //     "\nMaior: " +
      //     searchList.max_preco
      // );
    } catch (e) {
      msg.reply("***Não consegui encontrar sua carta*** :sob:");
      console.log(e);
    }
  }
}

async function ruleSearchLink(msg) {
  const m = msg.content.slice(6);
  const channel = msg.channel.id;
  const embed = new EmbedBuilder().setTitle(m);

  msg.reply({ embeds: [embed] });
  // try {
  //   mtg.card.all({ name: m }).on("data", function (card) {

  //   }); // REPLY
  // } catch (e) {
  //   msg.reply(":sob: ***Não consegui encontrar sua carta*** :sob:");
  // }
}
