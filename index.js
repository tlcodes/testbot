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
  "redirect_uri": "https://lit-journey-20870.herokuapp.com/" // to update everytime
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

// message building function
app.post('/', function(req, res){
  // get the command text
  if (req.body.text === ''){
    // no text, just the command, send a random post from homepage
    r.getHot().then(post => {

      var i = Math.floor(Math.random() * 25);
      //console.log(post[i]);
      var body = {
        'response_type': "in_channel",
        'text': '<'+post[i].url+'|'+ post[i].title +'>',
        'unfurl_links': true,
        'unfurl_media': true,
          'attachments': [
              {
                'title': 'Random Hot Post From Reddit\'s Home Page',
                'pretext': 'Posted in ' + post[i].subreddit_name_prefixed + ' by ' + post[i].author.name
                + '\nFrom ' + post[i].domain,
                //'title': post[i].title,
                //'title_link': post[i].url,
                'footer': '<https://www.reddit.com'+post[i].permalink+'|See on Reddit>',
                "color": "#439FE0"
              }],
          }
      //console.log(body);

      res.send(body);
    })
  } else {
    var command = req.body.text.toLowerCase();
    command = command.split(' ');
    if (command.length === 1) {
      switch (command[0]) {
        case 'hot':
        r.getHot().map(post => '<'+post.url+'|'+post.title+'>').then(function(postlist) {
          var home = {
            'response_type': "ephemeral",
            'username': 'testbot',
            'as_user': false,
            'text': '*Reddit Homepage Hot Posts*',
            'unfurl_links': true,
            'attachments': [{
              'text': '+ ' + postlist.join('\n+ ')
            }]
        }
        res.send(home);

      });
        break;
        case 'new': // write get new function
        r.getNew().map(post => '<'+post.url+'|'+post.title+'>').then(function(postlist) {
          console.log(postlist)
          var homeNew = {
            'response_type': "ephemeral",
            'username': 'testbot',
            'as_user': false,
            'text': '*Reddit Homepage New Posts*',
            'unfurl_links': true,
            'attachments': [{
              'text': '+ ' + postlist.join('\n+ ')
            }]
        }
        res.send(homeNew);
      });
        break;
        case 'top': // write get top function
        r.getTop().map(post => '<'+post.url+'|'+post.title+'>').then(function(postlist) {
          console.log(postlist)
          var homeTop = {
            'response_type': "ephemeral",
            'username': 'testbot',
            'as_user': false,
            'text': '*Reddit Homepage Top Posts*',
            'unfurl_links': true,
            'attachments': [{
              'text': '+ ' + postlist.join('\n+ ')
            }]
        }
        res.send(homeTop);
      });
        break;
        case 'rising': // write get rising function
        r.getRising().map(post => '<'+post.url+'|'+post.title+'>').then(function(postlist) {
          console.log(postlist)
          var homeRising = {
            'response_type': "ephemeral",
            'username': 'testbot',
            'as_user': false,
            'text': '*Reddit Homepage Rising Posts*',
            'unfurl_links': true,
            'attachments': [{
              'text': '+ ' + postlist.join('\n+ ')
            }]
        }
        res.send(homeRising);
      });
        break;
        case 'controversial': // write get controversial function
        r.getControversial().map(post => '<'+post.url+'|'+post.title+'>').then(function(postlist) {
          console.log(postlist)
          var homeControversial = {
            'response_type': "ephemeral",
            'username': 'testbot',
            'as_user': false,
            'text': '*Reddit Homepage Controversial Posts*',
            'unfurl_links': true,
            'attachments': [{
              'text': '+ ' + postlist.join('\n+ ')
            }]
        }
        res.send(homeControversial);
      });
        break;
        case 'help' : // help/usage message
        var help = {
          'response_type': 'ephemeral',
          'text':'*bot usage*',
          //"username": "testbot",
          "mrkdwn": true,
          'attachments': [
            {
            "mrkdwn": true,
            'text': '*/reddit help* _This help message_\n' +
            '*/reddit* _Random (from latest 25) hot post from Reddit homepage_\n' +
            '*/reddit subreddit* _Random hot post (from latest 25) in subreddit_\n' +
            '*/reddit new/rising/controversial/top* _List latest hot/new/rising/controversial/top posts from reddit homepage_\n' +
            '*/reddit subreddit new/rising/controversial/top* _List latest hot/new/rising/controversial/top posts from subreddit_\n' +
            '*/reddit [kw]* _Top post from reddit homepage search_\n' +
            '*/reddit [kw] list* _List of posts from reddit homepage search_\n' +
            '*/reddit subreddit [kw]* _Top post from subreddit search_\n' +
            '*/reddit subreddit [kw] list* _List of posts from subreddit search_\n'
          }]
        }
        res.send(help);
        break;
        default: // write getSubreddit random hot post
        r.getSubreddit(command[0]).getHot().then(post => {

          var i = Math.floor(Math.random() * 25);
          //console.log(post[i]);
          var body = {
            'response_type': "ephemeral",
            'text': '<'+post[i].url+'|'+ post[i].title +'>',
            'unfurl_links': true,
            'unfurl_media': true,
              'attachments': [
                  {
                    'pretext': 'Posted in ' + post[i].subreddit_name_prefixed + ' by ' + post[i].author.name
                    + '\nFrom ' + post[i].domain,
                    //'title': post[i].title,
                    //'title_link': post[i].url,
                    'footer': '<https://www.reddit.com'+post[i].permalink+'|See on Reddit>',
                    "color": "#439FE0"
                  }],
              }
          //console.log(body);
          res.send(body);
      });
    }
  }
  }
});

/*
    if (!command === ''){
      text = command.split(' ');
      // Now if we get more than one words after the command
      if (command.length > 1) {
        // make a call for a search in the subreddit, for example
      }
      // else, we only got 1 word after the command, that's the subreddit only
      else if (command.length === 1) {
        // post a random post from the subreddit
      }
    } else {
      //no arguments get hot posts from the home page

    });
  } */

/*
  // get the subreddit by name, get the new posts, wait for the data and do...
  r.getSubreddit('funny').getHot().then(post => {

    var i = Math.floor(Math.random() * 25);
    console.log(post[i]);
    var body = {
      'response_type': "ephemeral",
      'text': '<'+post[i].url+'|'+ post[i].title +'>',
      'unfurl_links': true,
      'unfurl_media': true,
        'attachments': [
            {
              'pretext': 'Posted in ' + post[i].subreddit_name_prefixed + ' by ' + post[i].author.name
              + '\nFrom ' + post[i].domain,
              //'title': post[i].title,
              //'title_link': post[i].url,
              'footer': '<https://www.reddit.com'+post[i].permalink+'|See on Reddit>',
              "color": "#439FE0"
            }],
        }
    console.log(body);
    res.send(body);
});
*/

// Listen!
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
//app.listen(9001);
