import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';
import type { JamInfo, Posts } from './interface';
import { GetGameJams, GetPosts } from './lib.js'; //keep as .js in prod or else vercel will kill itself 
// import testData from './test.json'

const PORT = 8000;
const app = express();


app.get('/gamejams/minMembers/:minMembers', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const minMembers = req.params.minMembers;
    let entries : JamInfo[] = [];
    let linkOngoing = 'https://itch.io/jams/in-progress/ranked/with-participants';
    let linkUpcoming = 'https://itch.io/jams/upcoming/ranked/with-participants';
    
    let entriesOngoing = await GetGameJams(Number(minMembers), linkOngoing);
    let entriesUpcoming = await GetGameJams(Number(minMembers), linkUpcoming);
    
    if (entriesOngoing) {
      entries = entries.concat(entriesOngoing);
    }
    if (entriesUpcoming) {
      entries = entries.concat(entriesUpcoming);
    }

    return res.json(entries);
  }
  catch (e) {
    console.log('Something went wrong while fetching game jams.', e);
    return undefined;
  }
});

app.get('/gamejam/details/:link', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('RUNNING');
  const link = 'https://itch.io/jam/' + req.params.link;

  axios.get(link).then((response) => {
      let entries : JamInfo[] = [];
      const html = response.data;
      const $ = cheerio.load(html);
 
      $('.view_jam_page').each((_, element) => {
        const $element = $(element);
        const title = $element.find('.user_formatted').text();
        const url = 'https://itch.io' + $element.find('a').attr('href');
        const members = Number($element.find('.stat').find('.number').first().text()); 
        const deadline = $element.find('.date_countdown').text();
        const host = $element.find('.hosted_by').text().slice(10);
        console.log(title)
      });

      res.json(entries);

    }).catch((err) => {
      console.log('Error fetching game jam information.',err);
    })
});

app.get('/gamejam/posts/:link', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const link = 'https://itch.io/jam/' + req.params.link + '/community';

  try {
    let nextPageText = 'Next page';
    let nextPageLink = link;
    let entries : Posts[] = [];

    while(nextPageText==='Next page') {
      let response = await axios.get(nextPageLink);
      let html = response.data;
      let $ = cheerio.load(html);
      nextPageText = $('.category_pager').find('a').first().text();
      nextPageLink = 'https://itch.io' + $('.category_pager').find('a').attr('href');
      
      let collectedEntries = GetPosts($);
      if (collectedEntries) {
        entries = entries.concat(collectedEntries);
      };
    }
    
    console.log(entries);
    res.json(entries);
  }

  catch (e) {
    console.log('Something went wrong while fetching posts.', e);
    return undefined;
  }  
});

// In case connection can't be made; use test to to run app on test data, 
/* app.get('/test', async (req, res) => {
  return testData;
}) */

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

export default app;