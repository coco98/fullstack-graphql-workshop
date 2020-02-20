const express = require('express');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");

const app = express();

app.use(bodyParser.json());

const HASURA_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';

const HASURA_OPERATION1 = `
mutation($user_id: String!, $restaurant_id: String!, $items:[items_insert_input!]!) {
  order : insert_orders_one(object: {user_id: $user_id, restaurant_id: $restaurant_id, items: {data: $items}}){
    order_id
  }
}
`;

const HASURA_OPERATION2 = `
mutation($order_id: String!, $type: String, $amount:Int!) {
  payment: insert_payments_one(object: {order_id: $order_id, type: $type, amount: $amount}) {
    id
  }

  order: update_orders_by_pk(pk_columns: {order_id: $order_id}, _set: {payment_rcvd: true}) {
    payment_rcvd
  }
}
`;

const HASURA_OPERATION3 = `
mutation($order_id: String!) {
  order: update_orders_by_pk(pk_columns: {order_id: $order_id}, _set: {driver_assigned: true}) {
    driver_assigned
  }
}
`;

// execute the parent mutation in Hasura
const execute = async (query, variables, reqHeaders) => {
    const fetchResponse = await fetch(
	HASURA_GRAPHQL_ENDPOINT,
        {
            method: 'POST',
            headers: reqHeaders || {},
            body: JSON.stringify({
                query: query,
                variables
            })
        }
    );
    return await fetchResponse.json();
};

app.post('/place-order', async function (req, res) {
    console.log("recvd action");
    var user_id = req.body.session_variables["x-hasura-user-id"];
    if (!user_id) {
        res.status(400).json({
            message: "user_id not given"
        });
    }
    const {restaurant_id, items} = req.body.input;

    // do business logic
    const { data, errors } = await execute(HASURA_OPERATION1,
        { user_id, restaurant_id, items },
        {"x-hasura-admin-secret": "secret"});

    console.log(data);
    console.log(errors);
    var resp = data["order"];
    res.json(resp);
});

app.post('/payment-callback', async function (req, res) {
    console.log("payment callback");
    const { order_id, type, amount} = req.body;
    if (!order_id) {
        res.status(400).json({
            message: "order_id not given"
        });
    }
    const { data, errors } = await execute(HASURA_OPERATION2,
        { order_id, type, amount },
        {"x-hasura-admin-secret": "secret"});

    console.log(data);
    console.log(errors);
    var resp = data["order"];
    res.json(resp);
});

app.post('/initiate-assignment', async function (req, res) {
    console.log("initiate assignment");
    const { order_id } = req.body["event"]["data"]["new"];
    if (!order_id) {
        res.status(400).json({
            message: "order_id not given"
        });
    }

    await setTimeout(async () => {}, 5000);
    const { data, errors } = await execute(HASURA_OPERATION3,
                                           { order_id },
                                           {"x-hasura-admin-secret": "secret"});

    console.log(data);
    console.log(errors);
    var resp = data["order"];
    res.json(resp);
});


app.post('/', function (req, res) {
    console.log(req);
    res.json({"hello": "world"});
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(process.env.PORT || 3000, function () {
    console.log("server listening on " + (process.env.PORT || 3000));
});

