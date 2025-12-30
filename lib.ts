import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Posts } from './interface';

export function GetPosts($:cheerio.CheerioAPI, entries:Posts[]) {
  const keywords = ["looking", "team", "teams", "need"]; 
  const tags = ["artist", "producer", "musician", "coder", "composer", "programmer", "developer"];

  $('.topic_row').each((_, element) => {
    const $element = $(element);
    const title = $element.find('.topic_link').text();
    const url = 'https://itch.io' + $element.find('.topic_title').find('a').attr('href');
    const preview = $element.find('.topic_preview').text();
    const replies = Number($element.find('.number_value').first().text());
    const datePosted = $element.find('.topic_date').attr('title')!;
    const author = $element.find('.topic_author').text();
    let tag = 'generic';

    if(keywords.some(word=>title.includes(word))) {
      for(const item of tags) {
        if(title.includes(item)){
          tag = item;
        } 
      }
      entries.push({title, url, preview, replies, datePosted, author, tag});
    }
    
  });
  return entries;
}

export async function LoadPage(currentPageLink:string, entries:Posts[]) {
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