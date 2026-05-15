import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Entries, EntriesType, GameJamInfo, Posts } from './interface.ts';
import { GetGameJams, GetPosts } from './lib.js'; // keep as js because of vercel

const PORT = 8000;
const app = express();

app.get('/gamejams/upcoming/minMembers/:minMembers', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const minMembers = req.params.minMembers;
    let entries : Entries[] = [];
    let linkUpcoming = 'https://itch.io/jams/upcoming/ranked/with-participants';

    let entriesUpcoming = await GetGameJams(Number(minMembers), linkUpcoming);
    if (entriesUpcoming) {
      entries = entriesUpcoming;
    }

    if (entries.length > 0) {
      return res.json(entries);
    } else {
      res.status(404).send('Something went wrong while fetching data.');
    }
  }
  catch (err) {
    console.log('Something happened while fettching game jam data. Req Param:', req.params.minMembers);
    throw err;
  }
});

app.get('/gamejams/ongoing/minMembers/:minMembers', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const minMembers = req.params.minMembers;
    let entries : Entries[] = [];
    let linkOngoing = 'https://itch.io/jams/in-progress/ranked/with-participants';
    let entriesOngoing = await GetGameJams(Number(minMembers), linkOngoing);
    if (entriesOngoing) {
      entries = entriesOngoing;
    }

    if (entries.length > 0) {
      return res.json(entries);
    } else {
      res.status(404).send('Something went wrong while fetching data.');
    }
  }
  catch (err) {
    console.log('Something happened while fettching game jam data. Req Param:', req.params.minMembers);
    throw err;
  }
});

app.get('/gamejams/featured', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let entries : Entries[] = [];
    let linkUpcoming = 'https://itch.io/jams/upcoming/ranked/with-participants';

    // let entriesUpcoming = await GetGameJams(Number(minMembers), linkUpcoming);
    // if (entriesUpcoming) {
    //   entries = entriesUpcoming;
    // }

    if (entries.length > 0) {
      return res.json(entries);
    } else {
      res.status(404).send('Something went wrong while fetching data.');
    }
  }
  catch (err) {
    console.log('Something happened while fettching game jam data. Req Param:', req.params);
    throw err;
  }
});

app.get('/gamejam/details/:link', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const link = 'https://itch.io/jam/' + req.params.link;

  try {
    axios.get(link).then((response) => {
      let entries : GameJamInfo = { 
        title:'', host:'', members:0, startDate:'', endDate:''
      };
      const html = response.data;
      const $ = cheerio.load(html);

      $('.jam_body').each((_, element) => {
        const $element = $(element);
        const title = $element.find('.jam_title_header').text();
        const host = $element.find('.jam_host_header').text();
        const members = Number($element.find('.stat_box:nth-child(1)').find('.stat_value').text().replace(/[^a-zA-Z0-9]/g, '')); 
        const startDate = $element.find('.date_format:nth-child(1)').text();
        const endDate = $element.find('.date_format:nth-child(2)').text();
        
        entries = {title, host, members, startDate, endDate};
      });
      res.json(entries);

    }).catch((err) => {
      console.log('Error fetching game jam information.');
      res.status(404).send('Invalid data.');
    })
  }
  catch (err) {
    console.log('Something happened while fetching game jam details. Req Param:', req.params.link);
    throw err;
  }
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
    res.json(entries);
  }

  catch (err) {
    console.log(`Something went wrong while fetching posts. Link: ${link}`);
    res.status(404).send('Invalid data.');
  }  
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

export default app;


// saving myself the headache in case zombie process happens again
// # Find the Process ID (PID) using the port
// netstat -ano | findstr :8000
// # Replace 1234 with PID 
// taskkill /PID 1234 /F