var fs = require("fs");
var keys = require("./keys.js");
var twitter = require('twitter');
var request = require("request");
var Spotify = require("node-spotify-api");
var inquirer = require("inquirer");

var spotifyKeys = keys.spotifyKeys;
var twitterKeys = keys.twitterKeys;

var nodeArgs = process.argv;
var searchValue = "";

inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do?",
        choices: ["Music", "Movies", "Tweets", "Random"],
        name: "command"
    }
])
.then(function(inquirerResponse){
    
    var command = inquirerResponse.command;
    
    switch(command){
        case "Tweets":
            inquirer.prompt([
                {
                    type: "input",
                    message: "Search tweets by Twitter user name or hit enter to see my tweets:",
                    name: "searchValue"
                }
            ])
            .then(function(inquirerResponse){
                var searchValue = inquirerResponse.searchValue;
                tweets(searchValue);
            });
            break;
        case "Music":
            inquirer.prompt([
                {
                    type: "input",
                    message: "What song would you like to search for?",
                    name: "searchValue"
                }
            ])
            .then(function(inquirerResponse){
                var searchValue = inquirerResponse.searchValue;
                spotifySearch(searchValue);
            });
            break;
        case "Movies":
            inquirer.prompt([
                {
                    type: "input",
                    message: "What movie would you like to search for?",
                    name: "searchValue"
                }
            ])
            .then(function(inquirerResponse){
                var searchValue = inquirerResponse.searchValue;
                movieSearch(searchValue);
            });
            break;
        case "Random":
            doIt();
            break;
    }
});

function tweets(searchValue){
    var client = new twitter({
		consumer_key: twitterKeys.consumer_key,
		consumer_secret: twitterKeys.consumer_secret,
		access_token_key: twitterKeys.access_token_key,
		access_token_secret: twitterKeys.access_token_secret,
    });
    
    var params = {screen_name: searchValue, count: "20", trim_user: false,}

    client.get('statuses/user_timeline', params, function(error, timeline, response){
		if(!error){
			for(tweet in timeline){
                var tDate = new Date(timeline[tweet].created_at);

                console.log("");
				console.log("(" + tDate.toString().slice(0, 24) + ")");
                console.log(timeline[tweet].text);
                console.log("------------------------------------");
            }    
        }
    })
}

function spotifySearch(searchValue){
    var spotify = new Spotify({
        id: spotifyKeys.client_id,
        secret: spotifyKeys.client_secret
      });

    spotify.search({type: 'track', query: searchValue, count: "20"}, function(err, data) {
	    if (err) throw err;
        var music = data.tracks.items;
		    for (var i = 0; i<music.length; i++){
		    	for (j=0; j<music[i].artists.length; j++){                   
                    console.log("------------------------------------");
                    console.log("Artist: " + music[i].artists[j].name);
		        	console.log("Song Name: " + music[i].name);
		        	console.log("Preview Link of the song from Spotify: " + music[i].preview_url);
                    console.log("Album Name: " + music[i].album.name);
                    console.log("------------------------------------");
                    console.log("");
		    	}
		    }
	});
};

function movieSearch(searchValue){
   
    var queryURL = "http://www.omdbapi.com/?t=" + searchValue + "&y=&plot=full&apikey=trilogy"
    console.log(queryURL);

    request(queryURL, function(error, response, body){
        if(!error && response.statusCode === 200){
            var source = JSON.parse(body);
            console.log("");
            console.log("------------------------------------");
            console.log("Title: " + source.Title);
            console.log("Release Date: " + source.Released);
            console.log("IMDB Rating: "  + source.imdbRating);
            if (source.Ratings.length > 1){
                console.log("Rotten Tomatoes Rating: " + source.Ratings[1].Value);
            }else{
                console.log("Rotten Tomatoes Rating: null")
            };
            console.log("Produced in " + source.Country);
            console.log("Language: " + source.Language);
            console.log("Plot: " + source.Plot);
            console.log("Actors/ Actresses: " + source.Actors);
            console.log("------------------------------------");
            console.log("");

        }
    })
};

function doIt(){
    fs.readFile("random.txt", "UTF-8", function(error, data){
        if(error){
            return console.log(error);
        }else{
            var searchValue = data;
            spotifySearch(searchValue);
            
        }
	});
};