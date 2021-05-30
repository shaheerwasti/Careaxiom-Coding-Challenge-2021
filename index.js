const https = require('https');
const express = require('express');
const fs = require('fs');
var async = require("async");
const request = require('request');
let ejs = require('ejs');
const util = require('util');
const app = express();
const port = process.env.PORT || 3000;



app.get('/I/want/title/', function (req, res) {
  //GET Addresses from url as addresses
  var addresses = req.query.address;
 //Title returns are pushed into titles
  var Titlewithhtml = '';
  
  var titles = new Array();

  //first function
  var domainNames = domainNameExtractionREGEX(addresses);
  //second function
  domainNames = CheckForTLD_regularExpression(domainNames)

  //reverse loop last domainName is processed first
  for (var l = domainNames.length - 1; l >= 0; l--) {
    //console.log(domainNames[l]);
    //after senitizing the tld from regex checks
    const options = {
      hostname: domainNames[l],
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/json',
      },
    };
    //initiating the man function
    main(options)
      .then((data1) => {
        titles.push(data1); Titlewithhtml = Titlewithhtml+'<li>'+data1+'</li>';
      console.log(Titlewithhtml);  
      })//JSON.stringify(data1))
      .catch(error => Titlewithhtml = Titlewithhtml+'<li>'+ error['hostname']+': No Response </li>')
        //console.log(error['hostname'])); //console.log(util.inspect( error, {showHidden: false, depth: null})))//Titlewithhtml = Titlewithhtml+'<li>'+ error.split(/:443No Response/i)[0]+'No Response </li>')//console.error('caught error!', error));

  }

  //this is the main function responsible for promise handling and firing functions asynchronously
  function main(options) {
    //now time
    let start = Date.now();
    //wait time for 1 ms
    const minWaitTime = 1000;

    return httpRequest(options).then(handler(start, minWaitTime), handler(start, minWaitTime, true));
  }
  function httpRequest(params, postData) {
    return new Promise(function (resolve, reject) {
      var req = https.request(params, function (res) {
        //console.log(res);
        // reject on bad status
        if (res.statusCode < 200 || res.statusCode > 301) {
          return reject(new Error('statusCode=' + res.statusCode));
        }
        // cumulate data
        var body = '';
        res.on('data', function (chunk) {
          body = body + chunk;
        });
        // resolve on end
        res.on('end', function () {
          var parsed = {};
          try {
            //console.log(params.hostname);
            //title extression from body
            var TitleSpliting = body.split(/<\/title>/i)[0].split(/<title>/i)[1];
            parsed = params.hostname + " : " + TitleSpliting;
          }
          catch (er) {
            reject(er); //do nothing
          }
          //   body = JSON.parse(Buffer.concat(body).toString());

          resolve(parsed);

        });
      });
      // reject on request error
      req.on('error', function (err) {
        // This is not a "Second reject", just a different sort of failure
        reject(err);
      });
      if (postData) {
        req.write(postData);
      }
      // IMPORTANT
      req.end();
    });
  }

  function CheckForTLD_regularExpression(url) {
    var dn = new Array();
    //console.log((url));

    //extraction of domain names using regexpressions  //https://stackoverflow.com/a/16491074/5588821
    const regex = "^(?!\-)(?:(?:[a-zA-Z\d][a-zA-Z\d\-]{0,61})?[a-zA-Z\d]\.){1,126}(?!\d+)[a-zA-Z\d]{1,63}$";

    if (Array.isArray(url)) {
      if (url.length > 1) {
        for (var i = 0; i < url.length; i++) {
          dn.push(url[i].match(regex)[0])
        }

      }
      else dn.push(url[0][0]);

    }


    else {
      address = String(url)
      dn.push(address.match(regex));

    }
    return dn;
  }

  function domainNameExtractionREGEX(url) {
    var dn = new Array();
    // console.log(url);
    // console.log(url.length);
    //extraction of domain names using regexpressions
    const regex2 = "^(?:.*://)?(?:www\.)?([^:/]*).*$";

    if (Array.isArray(url)) {

      for (var i = 0; i < url.length; i++) {

        dn.push(url[i].match(regex2)[1]);

      }

    }
    else {
      address = String(url)
      dn.push(address.match(regex2));

    }

    return dn;

  }

  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  function handler(start, minWaitTime, isErr = false) {
    return async function (val) {
      let diff = minWaitTime - (Date.now() - start);
      if (diff > 0) {
        await sleep(diff);
      }
      if (isErr) {
        throw val;
      } else {
        //console.info(val);
        return val;
      }
    }
  }

  //options.agent = new https.Agent(options);
  //console.log(titles);

  // req = request("http://google.com", function (e, r, d) {});
  // req.on('socket', function (socket) {
  //     console.log("========\nRequest\n========")
  //     console.log(JSON.stringify(socket._pendingData, null, 3));
  //     console.log("========\nResponse\n========");
  //     socket.on('data', function (data) { console.log(data.toString()); });
  // });



  // res.send(titles);
  // setTimeout(() => {
  //   //console.log(titles);
  //   res.status(200).json({
  //     status: 'succes',
  //     data: JSON.stringify(titles),
  //   })
  //   res.end();
  // }, 3000);
  
  setTimeout(() => {

      let html = ejs.render('<html><title>html file sent</title><head></head><body><h1> Following are the titles of given websites: </h1><ul>'+Titlewithhtml+'</ul></body></html>', {titles}); 
          res.write(html);  
          res.end();  
  }, 3000);
});

app.listen(port);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');