const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.dir(request.url);

  const parsedUrl = url.parse(request.url);

  // swithc based on the type of method used
  switch (request.method) {
    case 'GET':
      // go to the correct get json function
      switch (parsedUrl.pathname) {
        case '/':
          htmlHandler.getClient(request, response);
          break;
        case '/style.css':
          htmlHandler.getStyle(request, response);
          break;
        case '/getUsers':
          jsonHandler.getUsers(request, response);
          break;
        default:
          jsonHandler.notReal(request, response);
          break;
      }
      break;
    case 'HEAD':
      // got to correct get json meta data function
      if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsersMeta(request, response);
      } else {
        jsonHandler.notRealMeta(request, response);
      }
      break;
    case 'POST':
      // if we add user, go through and recieve data
      if (parsedUrl.pathname === '/addUser') {
        const res = response;

        const body = [];

        request.on('error', (err) => {
          console.dir(err);
          res.statusCode = 400;
          res.end();
        });

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          const bodyString = Buffer.concat(body).toString();

          const bodyParams = query.parse(bodyString);

          jsonHandler.addUser(request, res, bodyParams);
        });
      }
      break;
    default:
      // If users go manually to /getUsers they go here
      if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsers(request, response);
      // amything else is 404
      } else {
        jsonHandler.notReal(request, response);
      }
      break;
  }
};

http.createServer(onRequest).listen(port);


console.log(`Listening on Localhost: ${port}`);
