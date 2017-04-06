const express = require('express');
const app = express();
// intialize request to use later
const url = require('url');
const request = require('request');
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
  "redirect_uri": "https://lit-journey-20870.herokuapp.com/" // to update everytime
});


// require the body parser to parse json data and urls
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set the port to whaever or 9001
app.set('port', (process.env.PORT || 9001));

// The post request, evaluates the user input and returns data
app.post('/', (req, res) => {
  //console.log(req.body);
  let text = req.body.text;

  // bot implementation comes here:
  hotPostList(text)
    .then((result) => {
      let thread = chooseThread(result);
      let message = buildMessage(thread);
      return message;

  }).then(message => res.send(message));

});

app.post('/new', (req, res) => {
  //console.log(req.body);
  let text = req.body.text;

  // bot implementation comes here:
  newPostList(text)
    .then((result) => {
      let thread = chooseThread(result);
      let message = buildMessage(thread);
      return message;

  }).then(message => res.send(message));

});


// Printing a list of the titles on the front page
//r.getHot().map(post => post.title).then(console.log);

// Search command
app.post('/search', (req, res) => {
  let text = req.body.text;
// r.getSubreddit('sub').search({query: text, sort: 'year'}).then(console.log)
  searchFor(text)
  .then((list) => {
    let listMessage = buildList(list);
    return listMessage;
  })
  .then(listMessage => res.send(listMessage)) ;

});

// Search command
app.post('/searchsub', (req, res) => {
  let text = req.body.text.split(' ');
// add condition check, text can't be empty, send "you must enter a search query + usage"

// r.getSubreddit('sub').search({query: text, sort: 'year'}).then(console.log)
  searchSub(text)
  .then((list) => {
    let listMessage = buildList(list);
    return listMessage;
  })
  .then(listMessage => res.send(listMessage)) ;

});

// search Reddit for the query terms
function searchFor (theQuery) {
  return r.search({query: theQuery, sort: 'all'})
  .map(post => '<' + post.url + '|' + post.title + '>\nScore: ' + post.score + ' | Comments: ' + post.num_comments +'\n')
  .then(postlist => postlist);
}

// search subreddit
function searchSub (subQuery) {
  let sub = subQuery.shift();
  subQuery = subQuery.join(' ');
  return r.getSubreddit(sub).search({query: subQuery, sort: 'all'})
  .map(post => '<' + post.url + '|' + post.title + '>\nScore: ' + post.score + ' | Comments: ' + post.num_comments +'\n')
  .then(postlist => postlist);
}

// Format list message with these slack properties
function buildList (searchResults) {
  let format = {
    'response_type': "in_channel",
    'username': 'testbot',
    'channel': 'directmessage',
    'as_user': false,
    'text': '*Here are your results*',
    'unfurl_links': true,
    'mrkdwn': true,
    'attachments': [{
      'text': ':small_orange_diamond: ' + searchResults.join('\n:small_orange_diamond: '),
      'footer': 'The Morning Bunch :green_heart:',
      'color': '#439FE0'
    }]
  }
return format;
}

// Fetches hot posts from a subreddit
function hotPostList (name) {
  console.log(name);
  name = name.split(' ');
  return r.getSubreddit(name[0]).getHot()
            .then(posts => posts);
  }

function newPostList (name) {
  console.log(name);
  name = name.split(' ');
  return r.getSubreddit(name[0]).getNew()
            .then(posts => posts);
}

function risingPostList (name) {
  console.log(name);
  name = name.split(' ');
  return r.getSubreddit(name[0]).getRising()
            .then(posts => posts);
}

function controPostList (name) {
  console.log(name);
  name = name.split(' ');
  return r.getSubreddit(name[0]).getControversial()
            .then(posts => posts);
}

function topPostList (name) {
  console.log(name);
  name = name.split(' ');
  return r.getSubreddit(name[0]).getTop()
            .then(posts => posts);
}

// Chooses a random post from the collection of posts
function chooseThread (threads) {
  return threads[parseInt(Math.random() * (threads.length))];
}

function buildMessage (post) {
  //console.log(post);
  let data = {
    'response_type': 'in_channel',
    'text': '*<'+post.url+'|'+ post.title +'>*',
    'unfurl_links': true,
    'unfurl_media': true,
    'attachments': [
      {
        'pretext': post.selftext,
        'text': 'Fresh from ' + post.subreddit_name_prefixed + '! <https://www.reddit.com'+post.permalink+'|See on Reddit>',
        'author_name': 'posted by ' + post.author.name + ' | Score: ' + post.score + ' | Comments: ' + post.num_comments,
        'ts': post.created,
        'footer': 'The Morning Bunch :green_heart:',
        'color': '#439FE0'
      }
    ]
  };
  return data;
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
