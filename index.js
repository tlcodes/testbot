// require Express and create Express app
var express = require('express');
var app = express();
// intialize request to use later
var url = require('url');
var request = require('request');
const snoowrap = require('snoowrap');

// Don't know if I need all these credentials
const r = new snoowrap({
  "clientId": 'BNRf5lcvjHQsCw',
  //"clientSecret": '',
  "userAgent": 'morningbunch redditbot',
  "accessToken": "olxjb8aa0C946cSge-88j6lcMMk",
  "tokenType": "bearer",
  "expires_in": 3600,
  "refreshToken": "3806543-gT3lWoEwmO3mrpv7xX7Ucj8Gwew",
  "scope": "read",
  "redirect_uri": "http://881d35be.ngrok.io" // to update everytime
});


// require the body parser to parse json data and urls
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set the port to whaever or 9001
app.set('port', (process.env.PORT || 9001));

// for testing purpose on the root of app
app.get('/', function(req, res){
  res.send('WOOF!');
});

//get hot posts from the home page
//r.getHot().map(post => post.title).then(console.log);

app.post('/', function(req, res){
  // get the command text
  //var text = req.body.text;

// get the subreddit by name, get the new posts, wait for the data and do...
r.getSubreddit('aww').getNew().then(address => {
  var body = {
    //'response_type': "ephemeral",
      // the very newest post in the subreddit
    'text': address[0].title,
    "attachments": [
        {
          // ATTENTION, image links from reddit may have no .jpg or extension
          // and Slack only pproves .jpeg, .BMP, .gif and .png. So .gifv won't
          // pass either
          'image_url': address[0].url
        }]
      }
  console.log(body);
  res.send(body);
});


});


// Listen!
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
//app.listen(9001);
