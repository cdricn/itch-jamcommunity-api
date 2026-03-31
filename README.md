# itch.io Community Scraper
A scraper API that collects recruitment posts in itch.io game jam community forums created using Cheerio and Express.

## Endpoints
GET endpoints return data in json format. <br/>
- ``[GET] /gamejams/minMembers/{:minMembers}`` - retrieve upcoming and on-going ranked game jams from itch.io. Requires a number to set the minimum member count; the API will only return game jams that exceed this value. Returns two objects with array values.
``
{
  upcoming: [
    {
    title: '$5K GameName Game Jam',
    url: 'https://itch.io/jam/game-name-game-jam-1',
    members: 1506,
    deadline: '2026-04-01T16:00:00Z',
    host: 'GameName Game Jams, DualWielded, HakJak, RugbugRedfern, GameName'
    },
    ...
  ];
  ongoing: [{
    ...(same as above)
  }];
}
``</br>
- ``[GET] /gamejam/details/:link`` - retrieve the details of the specified game jam. Must be supplied with the sub-directory string of the game jam link.
``
{
  title:	"$5K GameName Game Jam"
  host:	"Hosted by GameName Game Jams, DualWielded, HakJak, RugbugRedfern, GameName"
  members:	1506
  startDate:	"2026-04-01 16:00:00"
  endDate:	"2026-04-15 16:00:00"
}
``</br>
- ``[GET] /gamejam/posts/:link`` - retrieve role/team finding posts from the specified game jam's community forums. Must be supplied with the sub-directory string of the game jam link. </br>
``
[
  {
    title:	"Looking for a motivated 2d pixel artist"
    url:	"https://itch.io/jam/game-name-game-jam-1/topic/6116991/looking-for-a-motivated-2d-pixel-artist"
    content:	"I can do pretty much everything required in game dev besides the art. If you'd like to have your art in a game that will..."
    replies:	1
    datePosted:	"18 March 2026 @ 20:27 UTC"
    author:	"NobSwitch"
  },
  ...
]
``</br>

``Game jam link: https://itch.io/jam/your-game-jam`` </br>
``Endpoint link: your-game-jam`` </br>
This endpoint modifies the data by adding a Tags property to the returned json. Tags is an array of strings added by the script to separate posts based on the contents of their title.

## Run
To run: </br>
Clone the project: ``git clone https://github.com/cdricn/itch-jamcommunity-api.git`` </br>
Run the project ``npm run start`` </br>
