//This is my Combined Code

var express = require('express');
var hbs = require('hbs');
const yargs = require('yargs');
var fs = require('fs');
var port = process.env.PORT || 3000;
const axios = require('axios');
const bodyParser = require("body-parser");


//SOME IMPORTANT VARIBALES
const key = 'feeee4522e3dbab0407cd470c7f43acc';
var errormsg = '';
var actualaddress = '';
var actualtemperature = '';

var app = express();

app.set('view engine' ,'hbs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('getCurrentYear',() => {
  return new Date().getFullYear();
});

app.use((req,res,next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  fs.appendFile('server.log',log +'\n',(err) => {
  console.log('Unable to append server file log');
  });
  next();
})




//Home Page Setup
app.get('/',(req,res) => {
  res.render('Home.hbs',{
    pageTitle:'Home Page',
    welcome:'Welcome for the weather updates'
  });
});

//Get the temperature and display back
app.post("/", function (req, res) {
  var encodedURIAdress = encodeURIComponent(JSON.stringify(req.body.address));
  var geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedURIAdress}`;

  axios.get(geoUrl)
  .then((response) => {
    if(response.data.status === 'ZERO_RESULTS'){
      throw new Error('Not Able to relocate that address');
    }
    var latitude = JSON.stringify(response.data.results[0].geometry.location.lat);
    var longitude = JSON.stringify(response.data.results[0].geometry.location.lng);
    actualaddress = JSON.stringify(response.data.results[0].formatted_address);
    var weatherURL = `https://api.darksky.net/forecast/${key}/${latitude},${longitude}`;
    return axios.get(weatherURL);
  })
  .then((response) => {
    actualtemperature = JSON.stringify(response.data.currently.temperature);
    res.send(`The address you typed is :${actualaddress} and the current temperature is ${actualtemperature}`);
  })
  .catch((error) => {
    if(error.code === 'ENOTFOUND'){
      errormsg = 'Unable to connect to API servers';
      res.send(errormsg);
    }
    else {
      errormsg = error.message;
      res.send(errormsg);
  }
});
});


//starting the server
app.listen(port, () => {
  console.log(`The server is listning on port:${port}`);
})
