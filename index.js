const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

let entries = []

app.get('/', (req, res) => {
  res.json('Hey hey hey!')
});

app.get('/hey', (req, res) => {

  axios.get('https://itch.io/jams/starting-this-month/ranked/with-participants')
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('.jam').each((_, element) => {
        const $element = $(element);
        const title = $element.text();
        const url = $element.find('a').attr('href');
        
        entries.push({title, url});
      });

      res.json(entries);
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Failed to fetch or process data.' });
    })
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));