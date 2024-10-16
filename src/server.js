const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const apiHandler = require('./api.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);
    handler(request, response);
  });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addDescription') {
    parseBody(request, response, apiHandler.addDescription);
  }
  if (parsedUrl.pathname === '/addRating') {
    parseBody(request, response, apiHandler.addRating);
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  // route to correct method based on url
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getRandom') {
    apiHandler.getRandom(request, response);
  } else if (parsedUrl.pathname === '/getAll') {
    apiHandler.getAll(request, response);
  } else if (parsedUrl.pathname === '/getPokemon') {
    apiHandler.getPokemon(request, response);
  } else if (parsedUrl.pathname === '/getPokemonFromType') {
    apiHandler.getPokemonFromType(request, response);
  } else {
    apiHandler.notReal(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  request.query = Object.fromEntries(parsedUrl.searchParams);
  console.log(request.method);
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
