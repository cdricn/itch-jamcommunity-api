import * as cheerio from 'cheerio';
import axios from 'axios';
import type { Posts, Entries, TagType } from './interface';

export function GetPosts($:cheerio.CheerioAPI) {
  try {
    console.log('fetching')
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
      const replies = Number($element.find('.number_value').first().text().replace(/[^a-zA-Z0-9]/g, ''));
      const datePosted = $element.find('.topic_date').attr('title')!;
      const author = $element.find('.topic_author').text();

      if(keywords.some(word=>title.includes(word.toLowerCase() || word.toLowerCase()+"s"))) {
        let tags = AddTags(title);
        entries.push({title, url, content, replies, datePosted, author, tags});
      }
      
    });

    return entries;
  }
  catch (e) {
    console.log('Something went wrong while fetching posts', e);
  }
}

function AddTags(title:string) {
  const definedTags : TagType = {
    programmer: "developer", 
    developer: "developer",
    dev: "developer",
    coder: "developer",
    sound: "music",
    audio: "music",
    musician: "music",
    music: "music",
    composer: "music", 
    sfx: "music",
    artist: "artist", 
    voice: "voice actor", 
    actor: "voice actor",
    va: "voice actor",
    narrative: "writer",
    writer: "writer",
    playtester: "playtester"
  };
  const titleArray = title.split(" ");
  let tags : TagType = {};

  for (const word in titleArray) {
    let title = titleArray[word].toLowerCase();
    if (title[title.length-1] === 's') title=title.slice(0,title.length-1);
    if (definedTags.hasOwnProperty(title)) {
      //remove special chars
      title = title.replace(/[^a-zA-Z0-9]/g, '');
      tags[definedTags[title]] = definedTags[title];
    }
    //if the word has a slash, we split again; ex: "musician/composer"
    else if (titleArray[word].includes("/")) {
      //split first, then remove remaining special characters
      let [firstWord, secondWord] = title.split("/");
      firstWord = firstWord.replace(/[^a-zA-Z0-9]/g, '');
      secondWord = secondWord.replace(/[^a-zA-Z0-9]/g, '');
      
      if (definedTags.hasOwnProperty(firstWord)) {
        tags[definedTags[firstWord]] = definedTags[firstWord];
      }
      if (definedTags.hasOwnProperty(secondWord)) {
        tags[definedTags[secondWord]] = definedTags[secondWord];
      }
    }
  }
  return tags;
}

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
  catch (e) {
    console.log('Something went wrong while fetching game jams.', e);
  }
}