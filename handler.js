const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const fetch = require("node-fetch")

const HASURA_OPERATION = `
mutation add_todo ($title:String!, $is_public:Boolean = false, $user_id:Int) {
  insert_todos_one(object:{title:$title, is_public:$is_public, user_id:$user_id}) {
    id
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    //TODO: Change this
    "https://react-summit-hasura-workshop.herokuapp.com/v1/graphql",
    {
      method: 'POST',
      headers: {
        //TODO: Change this
        'x-hasura-admin-secret': process.env.SECRET
      },
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};
  

// Request Handler
app.post('/add_todo', async (req, res) => {

  // get request input
  const { title, is_public, user_id } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ title, is_public, user_id });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    id: data.insert_todos_one.id
  })

});


app.listen(PORT);
