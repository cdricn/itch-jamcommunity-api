# itch.io Community Scraper
A scraper API that collects recruitment posts in itch.io game jam community forums created using Cheerio.

# Endpoints
[GET] /jams/{minMemberCount} - retrieve game jams from itch.io. Must be supplied with a number.
[GET] /posts/{link} - retrieve posts from itch.io

In the future, I'll probably make this more customizable so usage isn't limited to just recruitment posts.