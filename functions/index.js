/* eslint-disable object-curly-spacing */
const functions = require("firebase-functions");
const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  cloud: {
    // eslint-disable-next-line max-len
    id: "My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDI1NmIzODE3OTdkMjQ4MDY4M2U0YzVlMGZmYjA4MTZhJDZjOGNhNTJmMmRhZjRlOGY4ZmQ0OTEzZmIxMGJkYWYw",
  },
  auth: {
    apiKey: "VHF5UlEzOEJQVDNweFc5d2NJWE86WC1NRGhKQ19SX1dnTlZjUG1hWE9VUQ==",
  },
});

exports.searchDocs = functions.https.onCall(async (data, context) => {
  functions.logger.log(data);
  const query = data.query;
  try {
    const searchRes = await client.search({
      query: {
        query_string: {
          query: `*${query}*`,
          fields: ["name", "type", "comments"],
        },
      },
    });
    //   // Each entry will have the following properties:
    //   //   _score: a score for how well the item matches the search
    //   //   _source: the original item data
    const hits = searchRes.hits.hits;
    const documents = hits.map((h) => h["_source"]);

    return { documents };
  } catch (err) {
    functions.logger.error("Error Searching Documents: ", { err });
    return {
      status: err.meta.statusCode,
      error: err,
    };
  }
});
