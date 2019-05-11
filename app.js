const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const qraphqlResolver = require('./graphql/resolver/index');

const app = express()
  .use(bodyParser.json())
  .use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: qraphqlResolver,
    graphiql: true
  }))

// app.get('/', (req, res) => res.send('I am in'))

mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@dustfirst-n4vhp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  })
// app.listen(3000);