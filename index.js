const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

//app.get('/', (req, res) => {
//  res.json('Welcome! Go to /jams to get the list of gamejams. Go to /posts to get the list of posts per gamejam.');
//});

let entries = []

app.get('/jams', (req, res) => {
  axios.get('https://itch.io/jams/in-progress/ranked/with-participants')
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('.jam').each((_, element) => {
        const $element = $(element);
        const title = $element.text();
        const url = 'https://itch.io' + $element.find('a').attr('href');
        const members = $element.find('.number').text();
        const deadline = $element.find('.date_countdown').text();
        const host = $element.find('.hosted_by').text();
        
        if (Number(members) >= 100) {
          entries.push({title, url, members, deadline, host});
        }
      });

      res.json(entries);
    }).catch((err) => {
      console.log(err);
    })
});


app.get('/posts', (req, res) => {
  entries.forEach(entry => {
    axios.get(entry.url);
  })
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));


export default app;