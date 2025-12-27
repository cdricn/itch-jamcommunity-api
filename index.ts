import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Entries, Posts } from './interface';

const PORT = 8000;
const app = express();

app.get('/', (req, res) => {
  res.json('Welcome! Go to /jams to get the list of gamejams. Go to /posts to get the list of posts per gamejam.');
});

app.get('/jams', (req, res) => {
  axios.get('https://itch.io/jams/in-progress/ranked/with-participants')
    .then((response) => {
      let entries : Entries[] = [];
      const html = response.data;
      const $ = cheerio.load(html);
 
      $('.jam').each((_, element) => {
        const $element = $(element);
        const title = $element.find('.primary_info').text();
        const url = 'https://itch.io' + $element.find('a').attr('href');
        const members = Number($element.find('.stat').find('.number').first().text()); 
        const deadline = $element.find('.date_countdown').text();
        const host = $element.find('.hosted_by').text().slice(10);
        
        if (members >= 300) {
          entries.push({title, url, members, deadline, host});
        }
      });

      res.json(entries);

    }).catch((err) => {
      console.log(err);
    })
});

function GetPosts($:cheerio.CheerioAPI, entries:Posts[]) {
  const keywords = ["looking", "team", "teams", "need"]; 
  const tags = ["artist", "musician", "composer", "programmer", "developer"];

  $('.topic_row').each((_, element) => {
    const $element = $(element);
    const title = $element.find('.topic_link').text();
    const url = 'https://itch.io' + $element.find('a').attr('href');
    const preview = $element.find('.topic_preview').text();
    const replies = Number($element.find('.number_value').first().text());
    const datePosted = $element.find('.topic_date').attr('title')!;
    const author = $element.find('.topic_author').text();

    if(keywords.some(word=>title.includes(word))) {
      const tag = '';
      entries.push({title, url, preview, replies, datePosted, author, tag});
    }
  });
  return entries;
}

async function LoadPage(currentPageLink:string, entries:Posts[]) {
  const response = await axios.get(currentPageLink);
  const html = response.data;
  const $ = cheerio.load(html);

  const nextPageText = $('.category_pager').find('a').first().text();
  const nextPageLink = 'https://itch.io' + $('.category_pager').find('a').attr('href');

  const collectedEntries = GetPosts($, entries);
  entries.concat(collectedEntries);

  if (nextPageText==='Next page') {
    entries.concat(await LoadPage(nextPageLink, entries));
  }
  return entries;
}

app.get('/posts/:jamLink', async (req, res) => {
  const jamLink = 'https://itch.io/jam/' + req.params.jamLink + '/community';
  const entries : Posts[] = await LoadPage(jamLink, []);
  res.json(entries);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

export default app;