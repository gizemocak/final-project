const express = require('express');
const ENV = process.env.ENV || "development"
const bcrypt = require('bcrypt')
const cookieSession = require('cookie-session')
const NodeGeocoder = require('node-geocoder');
const saltRounds = 10;
const path = require('path');
const enforce = require('express-sslify');
require('dotenv').config()
var bodyParser = require('body-parser')

const app = express();
const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig[ENV]);
const knexLogger = require('knex-logger');

require('dotenv').config()
// Serve the static files from the React app
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(knexLogger(knex));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

var options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GOOGLEMAPS_APIKEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
console.log("api", process.env.GOOGLEMAPS_APIKEY)
var geocoder = NodeGeocoder(options);

// An api endpoint that returns a short list of items
app.get('/api/getList', (req, res) => {
  const list = ["item1", "item2", "item3"];
  res.json(list);
  console.log('Sent list of items');
});

///////////GEt google api key////////////
app.get('/api/getApiKey', (req, res) => {
  const key = process.env.GOOGLEMAPS_APIKEY
  res.send({
    apiKey: key
  })
})

////Home page/////
app.get('/', (req, res) => {
  knex
    .select("*")
    .from("users")
    .then((results) => {
      res.json(results);
  });
});

////////////REGISTER ROUTES///////////////

app.post("/api/register", (req, res) => {
  console.log("register reqbody", req.body)
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address;
  const city = req.body.city;
  const province = req.body.province;
  const postalcode = req.body.postalcode;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  const type = req.body.type;

  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Email or password is empty");
  } 
  knex.select('*').from('users').where('email', email).first().then((user) => {
    console.log('regisger user', user)
      if (user && (user.username || user.email)) {
        res.status(403).send('User already exists')
        return false
    }
    let latitude = ''
    let longitude = ''
    geocoder.geocode({address, city, zipcode: postalcode},function(err, res) {
      knex('users')
      .returning('id')
      .insert([{
        type:type,
        username: username, 
        email: email,
        password: hashedPassword,
        address: address,
        city: city,
        province: province,
        postalcode: postalcode,
        latitude: res[0].latitude,
        longitude: res[0].longitude
      }])
      .then((ids) => {
        console.log("ids", ids)
        let user_id = ids[0];
        console.log("user_id", user_id)
        req.session.user_id = user_id;
    })      
    });

    console.log("latitute", typeof latitude)
    console.log("longtitute", typeof longitude)
  })
});
///////////LOGIN ROUTES///////////////////
app.post("/api/login", (req, res) => {
  console.log(req.body)
  const email = req.body.email;
    const password = req.body.password;

    knex.select('*').from('users').where('email', email).first().then((user) => {
      console.log('userusersueruseruser',user);
      if ( bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.send({
          name: user.username,
          email: user.email,
          address: user.address,
          user_id: user.id,
          type: user.type
        })
      } else {
        res.sendStatus(401)
      }
    })

});

//////////// Make a donation////////////////////
 app.post("/api/products", (req, res) => {
  let rows = req.body
  console.log('rowwwwwwwwwwwwwwwwww', rows)
  let chunkSize = 1000;
    knex.batchInsert('products', rows, chunkSize)
    .then(product => {
      console.log('product', product)
      res.status(200.).send('OK')
    })
}); 


/////////Get stores//////////
app.get("/api/stores", (req, res) => {
  //check if query string exists, search that query in the database and show the ones that have the key
    knex.select("*")
    .from("users")
    .join("products", {"users.id": "products.user_id"})
    .then(users =>{
      console.log("users:",users)
      res.send(users)
    })
});

////////////Get A Donation/////////////////////
app.get("/api/products", (req, res) => {
  //check if query string exists, search that query in the database and show the ones that have the key
  const {
    search
  } = req.query;
  if (search) {
    knex
      .select("*")
      .from("products")
      .where("name", "like", `%${search}%`)
      .then(products => {
        console.log("searched products",products)
        res.json(products);
      });
  } else {
    knex
      .select("*")
      .from("products")
      .then(products => {
          console.log("products", products);
          res.json(products);
      });
  }
});
////////////get order/////////////////////\\COME BACK!!!
app.get("/api/orders", (req, res) => {
  //check if query string exists, search that query in the database and show the ones that have the key
    knex
      .select("*")
      .from("orders")
      .where("user_id", "like", `%${req.session.user_id}%`)
      .then(orders => {
       // console.log("searched products",orders)
        res.json(orders);
      });
});


////////////place order/////////////////////
app.post("/api/order", (req, res) => {
  const { quantity, unit } = req.body
  if(req.session.user_id){
    knex('orders').insert({
      quantity: quantity,
      unit: unit,
      user_id: req.session.user_id
    }).then(order => {
     // console.log('order', order)
      res.status(200).send("Ok")
    })
  }
}); 


// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port);

console.log('App is listening on port ' + port);