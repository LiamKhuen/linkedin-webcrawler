const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { components } = require('@aws-amplify/ui-react');
//LinkedIn Login Environment Variables
require('dotenv').config();


async function main() {
    let linksToVisit = ["https://www.linkedin.com/in/anthony-khuen/"];
    const visitedLinks = [];


    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: {width: 1920, height: 1080},
    });
    const page = await browser.newPage();

    await page.goto('https://www.linkedin.com/login');
    await page.type('#username', process.env.LINKEDIN_USERNAME);
    await page.type('#password', '' + process.env.LINKEDIN_PASSWORD);
    await page.click('.btn__primary--large.from__button--floating');
    
    while(linksToVisit.length > 0) {
        const currentUrl = linksToVisit.pop();
        if(visitedLinks.includes(currentUrl)) continue;

        await page.goto(currentUrl);
        //console.log(currentUrl);
        //console.log(linksToVisit.length);

        const htmlContent = await page.content();

        const $ = cheerio.load(htmlContent);
        const newLinksToVisit = $('.optional-action-target-wrapper.display-flex')
            .map((index, element) => $(element).attr('href'))
            .get()
            .filter(link => link.startsWith('https://www.linkedin.com/in/') && !(link.includes('anthony-khuen') || link.includes('?miniProfileUrn')));
        //console.log(newLinksToVisit);

        linksToVisit = [...linksToVisit, ...newLinksToVisit];
        visitedLinks.push(currentUrl);
        await sleep(10000);
    }
}

async function sleep(miliseconds) {
    return new Promise ((resolve) => setTimeout(resolve, miliseconds));
}

main();