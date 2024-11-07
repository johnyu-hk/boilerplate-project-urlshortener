require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const regex = /^(https?:\/\/)?(www\.)?([A-Za-z0-9-]{1,63})(\.[A-Za-z0-9-]{1,63})*(\.[A-Za-z]{2,})(\/.*)?$/i;
  const url_valid = req.body.url.match(regex)
  if (!url_valid){
    return res.json({
      error: "Invalid URL"
    })  
  } 
  // const hostName = url_valid.slice(3,).join("")
  // console.log("host_name: " + hostName);
  // dns.lookup('forum.freecodecamp.org/',(err, address, family) => {
  //   // if (err) return console.log(err);
  //   console.log('address: %j family: IPv%s', address, family)
  //   })
  // res.json({
  //   "url":hostName
  // })
  const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };

  dns.lookup('forum.freecodecamp.org', options, (err, addresses) => {
    console.log('addresses: %j', addresses);
    res.json({   "url": addresses  })
  }
  )
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
