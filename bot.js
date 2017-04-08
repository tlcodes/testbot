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

// Printing a list of the titles on the front page
//r.getHot().map(post => post.title).then(console.log);

// The post request, evaluates the user input and returns data
app.post('/', (req, res) => {
  // this command should only contain ONE word, so maybe check for spaces

  let text = req.body.text;
  // bot implementation comes here:
  hotPostList(text)
    .then((result) => {
      let thread = chooseThread(result);
      let message = buildMessage(thread);
      return message;

  }).then(message => res.send(message));

});

/*
app.post('/list', (req, res) => {
  // make an array of string from the input text
  let text = req.body.text.split(' ');

  var sub = '';
  // if there are 2 words, firt one is the subreddit name
  if (text.length === 2) {
    sub = text[0];
  }

// if the last word is...
  switch (text[text.length - 1]) {
    //empty, use the grab posts from home page 'hot' Post List
    case '': hotPostList('')
    // map through the post list and grab some properties
    .then((postlist) => listThat(postlist))
    .then((list) => {
      // format that into a nice list
      let listMessage = buildList(list);
      return listMessage;
    })
    // send it
    .then(listMessage => res.send(listMessage));
    break;

    case 'new': newPostList(sub)
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;

    case 'top': topPostList(sub)
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;

    case 'rising': risingPostList(sub)
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;

    case 'controversial': controPostList(sub)
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;

    case 'hot': hotPostList(sub)
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;
    // if hot/new/rising/top/controversial was not used,
    // then the text is a subreddit only, this is where the app crashes.
    // in the r.getSubreddit of the hotPostList?!?
    default: hotPostList(text)
    //.map(post => '<' + post.url + '|' + post.title + '>\nScore: ' + post.score + ' | Comments: ' + post.num_comments +' | Posted in ' + post.subreddit_name_prefixed+ '\n')
    .then((postlist) => listThat(postlist))
    .then((list) => {
      let listMessage = buildList(list);
      return listMessage;
    })
    .then(listMessage => res.send(listMessage));
    break;
  }
});

function listThat(rdtObject) {
  console.log(rdtObject);
  return rdtObject.map(post => '<' + post.url + '|' + post.title + '>\nScore: ' + post.score + ' | Comments: ' + post.num_comments +' | Posted in ' + post.subreddit_name_prefixed+ '\n');
}
*/

// example for random 'new' post, can repeat for top/rising/controversial
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


// Search command
app.post('/search', (req, res) => {
  let text = req.body.text;
  searchFor(text)
  .then((list) => {
    let listMessage = buildList(list);
    return listMessage;
  })
  .then(listMessage => res.send(listMessage)) ;

});

// Search a subreddit
app.post('/searchsub', (req, res) => {
  // add condition check here, req.body.text can't be empty, send "you must enter a search query + usage"

  let text = req.body.text.split(' ');
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
  .map(post => '<' + post.url + '|' + post.title + '>\nScore: ' + post.score + ' | Comments: ' + post.num_comments +' | Posted in ' + post.subreddit_name_prefixed+ '\n')
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


// Fetches hot posts from a subreddit
function hotPostList (name) {
  // crashes in list command
  return r.getSubreddit(name).getHot()
            .then(posts => posts);
  }

function newPostList (name) {
  return r.getSubreddit(name).getNew()
            .then(posts => posts);
}

function risingPostList (name) {
  return r.getSubreddit(name).getRising()
            .then(posts => posts);
}

function controPostList (name) {
  return r.getSubreddit(name).getControversial()
            .then(posts => posts);
}

function topPostList (name) {
  return r.getSubreddit(name).getTop()
            .then(posts => posts);
}

// Chooses a random post from the collection of posts
function chooseThread (threads) {
  return threads[parseInt(Math.random() * (threads.length))];
}

function buildMessage (post) {
  let data = {
    'response_type': 'in_channel',
    'text': '<'+post.url+'|'+ post.title +'>',
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
  if(post.over_18) {
    // will need to change this again, to update the text
    data = {
      'response_type': 'ephemeral';
      'text': 'Oops, we can\'t show you this content :flushed:',
      'attachments': [
        {
          'text': ':thinking_face: You may want to try again',
          'footer': 'The Morning Bunch :green_heart:',
          'color': '#439FE0'
        }
      ]
    }
  }
  return data;
}

// Format list message with these slack properties
function buildList (searchResults) {
  let format = {
    'response_type': "ephemeral",
    'as_user': true,
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


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
