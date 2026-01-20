import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Entries, Posts } from './interface';
import { LoadPage } from './lib';
import cors from 'cors';
// import testData from './test.json'

const PORT = 8000;
const app = express();

let corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
}

app.use(cors(corsOptions))

app.get('/jams', (req, res) => {
  //res.setHeader('Access-Control-Allow-Origin', '*')
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
      console.log('Error fetching gamejams from itch.io.',err);
    })
});

app.get('/posts/:jamLink', async (req, res) => {
  const jamLink = 'https://itch.io/jam/' + req.params.jamLink + '/community';
  const entries : Posts[] | undefined = await LoadPage(jamLink, []);
  res.json(entries);
});

// In case connection can't be made; use test to to run app on test data, 
/* app.get('/test', async (req, res) => {
  return testData;
}) */

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

export default app;