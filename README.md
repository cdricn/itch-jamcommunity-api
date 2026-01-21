# itch.io Community Scraper
A scraper API that collects recruitment posts in itch.io game jam community forums created using Cheerio and Express.

## Endpoints
GET endpoints return data in json format. <br/>
``[GET] /jams/minMembers/{minMembers}`` - retrieve game jams from itch.io. Requires a number to set the minimum member count; the API will only return game jams that exceed this value. </br>
``[GET] /posts/{link}/teams`` - retrieve recruitment posts from the specified game jam's community forums. Must be supplied with the sub-directory string of the game jam link. </br>
Example: </br>
``Game jam link: https://itch.io/jam/super-game-jam`` </br>
``Endpoint link: super-game-jam`` </br>

## Run/Deploy
To run: </br>
Clone the project: ``git clone https://github.com/cdricn/itch-jamcommunity-api.git`` </br>
Run the project ``npm run start`` </br>
To deploy: </br>
Find a web-hosting service like Vercel and host the project there.
