import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Posts, JamInfo } from './interface';

export function GetPosts($:cheerio.CheerioAPI) {
  const keywords = [
    "looking", "team", "need", "group", "contribute", //priority
    "actor", "artist", "producer", "musician", "coder", "composer", 
    "programmer", "developer"
  ]; 
  const entries : Posts[] = [];
  $('.topic_row').each((_, element) => {
    const $element = $(element);
    const title = $element.find('.topic_link').text();
    const url = 'https://itch.io' + $element.find('.topic_title').find('a').attr('href');
    const content = $element.find('.topic_preview').text();
    const replies = Number($element.find('.number_value').first().text());
    const datePosted = $element.find('.topic_date').attr('title')!;
    const author = $element.find('.topic_author').text();

    if(keywords.some(word=>title.includes(word.toLowerCase() || word.toLowerCase()+"s"))) {
      entries.push({title, url, content, replies, datePosted, author});
    }
    
  });
  return entries;
}

export async function GetGameJams(minMembers:number, link:string) {
  try {
    let response = await axios.get(link);
    let html = response.data;
    let $ = cheerio.load(html);
    let entries : JamInfo[] = [];

    $('.jam').each((_, element) => {
      const $element = $(element);
      const title = $element.find('.primary_info').text();
      const url = 'https://itch.io' + $element.find('a').attr('href');
      const members = Number($element.find('.stat').find('.number').first().text().replace(/[^a-zA-Z0-9]/g, '')); 
      const deadline = $element.find('.date_countdown').text();
      const host = $element.find('.hosted_by').text().slice(10);

      if (members >= Number(minMembers)) {
        entries.push({title, url, members, deadline, host});
      }
    });

    return entries;
  }
  catch (e) {
    console.log('Something went wrong while fetching game jams.', e);
    return undefined;
  }
}