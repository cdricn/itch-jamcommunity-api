import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Posts, Entries, TagType } from './interface.ts';
import { keywords } from './keywords.js';
import { defined_tags } from './definedTags.js';

export async function GetGameJams(minMembers:number, link:string) {
  try {
    let response = await axios.get(link);
    let html = response.data;
    let $ = cheerio.load(html);
    let entries : Entries[] = [];

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
  catch (err) {
    console.log('Something went wrong while fetching game jams.');
    throw err;
  }
}

export function GetPosts($:cheerio.CheerioAPI) {
  
  try {
    const entries : Posts[] = [];
    $('.topic_row').each((_, element) => {
      const $element = $(element);
      const title = $element.find('.topic_link').text();
      const url = 'https://itch.io' + $element.find('.topic_title').find('a').attr('href');
      const content = $element.find('.topic_preview').text();
      const replies = Number($element.find('.number_value').first().text().replace(/[^a-zA-Z0-9]/g, ''));
      const datePosted = $element.find('.topic_date').attr('title')!;
      const author = $element.find('.topic_author').text();

      // put title into an array
      const titleArr = title.toLowerCase().split(' ');

      for (let i=0; i<titleArr.length; i++) {
        // put in variable before checking to avoid ts error
        const word = titleArr[i];
        if (word !== undefined) {
          // remove special characters from the word EXCEPT '/'
          // because the keywords we look for may be written with one; e.g. 'Member needed!'
          // however, we keep the slash because some titles use it; e.g. 'Developer/VA needed!'
          // then we just separate them later
          const split = word.replace(/[^a-zA-Z0-9\/]/g, '').split('/');
          
          // split will put the whole word in an array if there's nothing to split
          // so index 0 will always have a value, but not 1
          const splitOne = split[0];
          const splitTwo = split[1] ? split[1] : '';

          if (Object.hasOwn(keywords, splitOne || splitTwo)) {
            let tags = AddTags(title);
            entries.push({title, url, content, replies, datePosted, author, tags});
            break;
          } 
        }
      }
    });

    return entries;
  }
  catch (err) {
    console.log('Something went wrong while fetching posts');
  }
}

function AddTags(fullTitle:string) {
  const definedTags : TagType = defined_tags;
  
  const titleArray = fullTitle.split(" ");
  let tags : TagType = {};
  console.log('==============Full Title==============', fullTitle)
  
  for (const i in titleArray) {
    let word = titleArray[i]!.toLowerCase();
    // turn word into singular form
    if (word[word.length-1] === 's') {
      word = word.slice(0,word.length-1);
    }

    if (Object.hasOwn(definedTags, word)) {
      word = word.replace(/[^a-zA-Z0-9]/g, '');

      // store and check to tell typescript it's not underfined
      const mapped_tag = definedTags[word];
      if (mapped_tag) tags[mapped_tag] = mapped_tag;
    }

    //if the word has a slash, we split again; ex: "musician/composer"
    else if (word.includes("/")) {
      let [firstWord, secondWord] = word.replace(/[^a-zA-Z0-9\/]/g, '').split("/");
      firstWord = firstWord ? definedTags[firstWord] : '';
      secondWord = secondWord ? definedTags[secondWord] : '';
      
      if (firstWord && Object.hasOwn(definedTags, firstWord)) {
        tags[firstWord] = firstWord;
      }
      if (secondWord && Object.hasOwn(definedTags, secondWord)) {
        tags[secondWord] = secondWord;
      }
    }
  }
  return tags;
}
