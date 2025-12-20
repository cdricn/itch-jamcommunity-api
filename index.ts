import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';

const PORT = 8000;
const app = express();

app.get('/', (req, res) => {
  res.json('Welcome! Go to /jams to get the list of gamejams. Go to /posts to get the list of posts per gamejam.');
});

interface Entries {
  title: string,
  url: string,
  members: number,
  deadline: string,
  host: string
}

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
        const host = $element.find('.hosted_by').text();
        
        if (members >= 300) {
          entries.push({title, url, members, deadline, host});
        }
      });

      res.json(entries);
    }).catch((err) => {
      console.log(err);
    })
});


/*app.get('/posts', (req, res) => {
  entries.forEach(entry => {
    axios.get(entry.url);
  })
});*/

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

export default app;