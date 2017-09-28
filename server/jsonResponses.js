const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');

// General response function for get requests
const respond = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// General response question for head requests and some gets that don't need bodys
const respondMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

// Check if we have the info for a 304 vs 200
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondMeta(request, response, 304);
  }

  return respond(request, response, 200, responseJSON);
};

// Check if we have the info for a 304 vs 200 but never give the users
const getUsersMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondMeta(request, response, 304);
  }

  return respondMeta(request, response, 200);
};

// called upon a 404 error
const notReal = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };

  respond(request, response, 404, responseJSON);
};

// called upon a 404 error through head
const notRealMeta = (request, response) => {
  respondMeta(request, response, 404);
};

// adding a user to the list
const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };

  // return 400 for missing params
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  etag = crypto.createHash('sha1').update(JSON.stringify(users));

  digest = etag.digest('hex');

  // return 201 for a new user
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }

  // return 204 for a update user
  return respondMeta(request, response, responseCode);
};


module.exports = {
  getUsers,
  getUsersMeta,
  notReal,
  notRealMeta,
  addUser,
};
