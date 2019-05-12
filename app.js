const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const qraphqlResolver = require('./graphql/resolver/index');

const isAuth = require('./middleware/is-auth');


const app = express()
  .use(bodyParser.json())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  })
  .use(isAuth)
  .use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: qraphqlResolver,
    graphiql: true
  }))

// app.get('/', (req, res) => res.send('I am in'))

mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@dustfirst-n4vhp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
  .then(() => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  })
// app.listen(3000);