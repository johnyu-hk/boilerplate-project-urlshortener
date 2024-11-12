require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const url = require('url')

//MongoDB
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const shortURLSchema = new Schema({
  original_url: { type: String, required: true },
  short: Number,
})
const shortURL = mongoose.model('shortURL', shortURLSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',
  function (req, res, next) {
    const targetHost = url.parse(req.body.url).host
    // fetch URL
    const options = {
      family: 4,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    const expression = /(?:http:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm
    const urlRegex = new RegExp(expression)

    if (!req.body.url.match(urlRegex)){
      return res.json(
        { error: 'invalid url' }
      )
    }

    dns.lookup(targetHost, options, (err, data) => {
      if (err) {
        console.log(err)
      }
    })
    next()
  },
  function (req, res, next) {
    let inputShort = 1;
    shortURL.findOne({})
      .sort({ short: -1 }).then(
        //check if there is any record
        data => {
          console.log(data)
          console.log("current short no. :", data.short)
          if (data) {
            inputShort = data.short + 1
            console.log("update short:", inputShort)
          } 
        }
      ).then(
        shortURL.findOne({ original_url: req.body.url, })
          .then(data => {
            if (data != null) {
              return res.json(
                {
                  "original_url": req.body.url,
                  "short_url": data.short
                }
              )
            } else {
              shortURL.create({
                original_url: req.body.url,
                short:inputShort
              }).then(
                data =>{
                  return res.json(
                    {
                      "original_url": data.original_url,
                      "short_url": data.short
                    }
                  )
                }
              )
            }
          })
      )
      .catch(err => {
        console.error(err)
      })

  
  }
);

app.get('/api/shorturl/:shortid',
  function(req,res,next){
    shortURL.findOne({short:req.params.shortid}).then(data=>{
      if(data!=null){
        res.redirect(data.original_url)
    }
    }
    )
  }
)

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
})
