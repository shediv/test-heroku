var express = require('express');
var request = require("request");
const article = require('article');
const bodyParser = require('body-parser')
var app = express();

this.params = {};
var self = this;
var envConfig = require('./app/env');
console.log(" envConfig = ", envConfig.newsAPI)

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(request, response, next){
  console.log(  "\033[34m \033[1m" + request.method , 
                "\033[36m \033[1m REQUEST URL: " + "\033[32m "+request.url , 
                "\033[36m \033[1m REQUEST TIME: " + "\033[32m "+ new Date() + "\033[31m ");
  next();
});

app.use(express.static("./app"));

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});

//Get top 5 news from country.
app.get("/topNews", function(req, res) {
  var newsAPIUrl = envConfig.newsAPI+'?country='+req.query.country+'&pageSize='+envConfig.newsPageSize+'&apiKey='+envConfig.newsAPIKey;
  // Configure the request
  var options = {
    url: newsAPIUrl,
    method: 'GET'
  }
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        return res.status(200).json({'articles': body.articles})
    }else{
      return res.status(500).json({'error': error})
    }
  })
});

//Get Article Details.
app.get("/articleDetails", function(req, res) {
  //var diffBotAPIUrl = envConfig.diffBotAPI+'?token='+envConfig.diffBotAPIToken+'&url='+req.query.url;
  // Configure the request
  request(req.query.url).pipe(article(req.query.url, function (err, result) {
	  if (err) return res.status(500).json({'error': error});
	  return res.status(200).json({text: result.text});
	}));
});

//Get Summary of text.
app.post("/summary", function(req, res) {
  // Set the headers
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
    'Api-Key': envConfig.deepaiAPIKey
  }

  // Configure the request
  var options = {
    url: envConfig.deepaiAPI,
    method: 'POST',
    headers: headers,
    form: { text: req.body.text },
  }

  // Start the request
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var summary = JSON.parse(body);
        return res.status(200).json({'summary': summary.output})
    }else{
      return res.status(500).json({'error': error})
    }
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});