const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const puppeteer = require('puppeteer');
const express = require('express');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
})

 client.on('ready', () => {
    console.log('Bot ON')
 })

 client.on('messageCreate', (msg) => {
    
    if(msg.content.substring(0, msg.content.indexOf(' ')) === ('$liga')){
        priceSearch(msg);
    }

    if(msg.content.substring(0, msg.content.indexOf(' ')) === ('$rules')){
        //ruleSearch(ruleSearchLink(msg),msg);
        ruleSearchLink(msg);
    }

 })
 client.login(token)

/*
FUNÇÕES
*/

async function priceSearch(msg) {
        
    const m = msg.content;
    const channel = msg.channel.id;

    const searchString = m.substring(m.indexOf(' ') + 1);
    const searchURL =  "https://www.ligamagic.com.br/?view=cards/card&card=" + searchString.replace(`'`, '%27').replace(',','%2C').replaceAll(' ', '+').replace('#','%23')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(searchURL);

    try{
    const pageContent = await page.evaluate(() =>{
    return {
        card_image: document.querySelector('.main-card').src,
        min_preco: document.querySelector('.col-prc.col-prc-menor').innerText,
        med_preco: document.querySelector('.col-prc.col-prc-medio').innerText,
        max_preco: document.querySelector('.col-prc.col-prc-maior').innerText
    }
    });

    msg.reply(pageContent.card_image)

    msg.channel.send("Menor: " + pageContent.min_preco + "\nMédio: " + pageContent.med_preco + "\nMaior: " + pageContent.max_preco)
    
    await browser.close();
    }catch(e){;

        try{
            const searchList = await page.evaluate(() =>{
            return {
                card_image: document.querySelector('#item_1').querySelector('.main-card').src,
                min_preco: document.querySelector('.price-min').innerText,
                med_preco: document.querySelector('.price-avg').innerText,
                max_preco: document.querySelector('.price-max').innerText
            }
            });
            
            msg.reply(searchList.card_image)

            msg.channel.send("Menor: " + searchList.min_preco + "\nMédio: " + searchList.med_preco + "\nMaior: " + searchList.max_preco)

        }catch(e){
            msg.reply("***Não consegui encontrar sua carta*** :sob:")
        }
        
    }
}

async function ruleSearchLink(msg){
    const m = msg.content;
    const channel = msg.channel.id;

    const searchString = m.substring(m.indexOf(' ') + 1);
    const searchURL =  "https://gatherer.wizards.com/Pages/Search/Default.aspx?name=+["+ searchString.replaceAll(' ',"]+[")+"]"
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(searchURL);

    try{
        const pageContent = await page.evaluate(() =>{
        return {
            link: document.getElementById("ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl00_listRepeater_ctl00_cardTitle").href
        }
        });
    
        msg.reply(pageContent.link) // REPLY
        await browser.close();
    }catch(e){;
            console.log(searchURL);
            msg.reply(":sob: ***Não consegui encontrar sua carta*** :sob:")
    }
}

async function ruleSearch(link, msg){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(link);

    try{
        const pageContent = await page.evaluate(() =>{
        return {
            link: document.getElementById("ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl00_listRepeater_ctl00_cardTitle").href
        }
        });
    
        msg.reply(pageContent.link) // REPLY
        msg.channel.send("Menor: " + pageContent.min_preco + "\nMédio: " + pageContent.med_preco + "\nMaior: " + pageContent.max_preco)
        await browser.close();
    }catch(e){;
            console.log(e);
            msg.reply(":sob: ***Não consegui encontrar sua carta*** :sob:")
    }
}