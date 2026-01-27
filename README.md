# itch.io Community Scraper
A scraper API that collects recruitment posts in itch.io game jam community forums created using Cheerio and Express.

## Endpoints
GET endpoints return data in json format. <br/>
- ``[GET] /gamejams/minMembers/{:minMembers}`` - retrieve upcoming and in-progress ranked game jams from itch.io. Requires a number to set the minimum member count; the API will only return game jams that exceed this value. </br>
- ``[GET] /gamejam/details/:link`` - retrieve the details of the specified game jam. Must be supplied with the sub-directory string of the game jam link.
- ``[GET] /gamejam/posts/:link`` - retrieve role/team finding posts from the specified game jam's community forums. Must be supplied with the sub-directory string of the game jam link. </br>
Example: </br>
``Game jam link: https://itch.io/jam/your-game-jam`` </br>
``Endpoint link: your-game-jam`` </br>
This endpoint modifies the data by adding a Tags property to the returned json. Tags is an array of strings added by the script to separate posts based on the contents of their title.

## Run
To run: </br>
Clone the project: ``git clone https://github.com/cdricn/itch-jamcommunity-api.git`` </br>
Run the project ``npm run start`` </br>
