const fs = require('fs');

const pokemonData = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));

const pokemonTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon'];

const respond = (request, response, status, data) => {
  const dataString = JSON.stringify(data);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dataString, 'utf8'),
  });
  // if not a head request, write data
  if (request.method !== 'HEAD' && status !== 204) {
    console.log('not head');
    response.write(dataString);
  }
  response.end();
};

// GET - return data of a random pokemon
const getRandom = (request, response) => {
  const random = pokemonData[Math.floor(Math.random() * pokemonData.length)];
  return respond(request, response, 200, random);
};

// GET - return data of all pokemon
const getAll = (request, response) => {
// return data of all pokemon
  respond(request, response, 200, pokemonData);
};

// GET - return data of a pokemon according to their name or id
const getPokemon = (request, response) => {
  // go through all pokemon to see if their id or name matches with that of the request query
  for (let i = 0; i < pokemonData.length; i++) {
    if (pokemonData[i].id === parseInt(request.query.id, 10)) {
      console.log('id match');
      return respond(request, response, 200, pokemonData[i]);
    }
    if (pokemonData[i].name.toLowerCase() === request.query.name) {
      console.log('name match');
      return respond(request, response, 200, pokemonData[i]);
    }
  }
  // if nothing matches, check to see if the request query doesn't have a name or id
  if (!request.query.name && !request.query.id) {
    return respond(request, response, 400, { message: 'You are missing search parameters.', id: 'badRequest' });
  }
  // if none of the above
  console.log('no match');
  return respond(request, response, 404, { message: 'The page you are looking for was not found.', id: 'notFound' });
};

// GET - return data of pokemon of a certain type
const getPokemonFromType = (request, response) => {
  // array to hold pokemon of a certain type
  const typeJSON = [];
  // if there is a request query with type
  if (request.query.type) {
    // if request query is an existing pokemon type
    if (pokemonTypes.includes(request.query.type)) {
      // loop through pokemon
      for (let p = 0; p < pokemonData.length; p++) {
        const typeArray = pokemonData[p].type;
        // loop through each pokemon's type(s)
        for (let t = 0; t < typeArray.length; t++) {
          // if request query type matches with a pokemon's type, add that pokemon to the array
          if (request.query.type === typeArray[t].toLowerCase()) {
            typeJSON.push(pokemonData[p]);
          }
        }
      }
    } else {
      // if there is a type request query but it's not an existing pokemon type
      console.log('no match');
      return respond(request, response, 404, { message: 'The page you are looking for was not found.', id: 'notFound' });
    }
    // return array as json
    return respond(request, response, 200, { typeJSON });
  }
  // if no type request query
  return respond(request, response, 400, { message: 'You are missing search parameters.', id: 'badRequest' });
};

const addDescription = (request, response) => {
  const responseJSON = {
    message: 'ID and description are both required.',
  };
  const { id, description } = request.body;
  if (!id || !description) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }
  // default status code to 204 updated
  const responseCode = 204;
  // if pokemon with this id
  if (id > 1 || id < 151) {
    pokemonData[id - 1].description = description;
  } else {
    return respond(request, response, 400, { message: 'The page you are looking for was not found.', id: 'notFound' });
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }
  return respond(request, response, responseCode, {});
};

// POST - mark a pokemon as your favorite
const addRating = (request, response) => {
  const responseJSON = {
    message: 'ID and rating are both required.',
  };
  const { id, rating } = request.body;
  if (!id || !rating) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }
  // default status code to 204 updated
  const responseCode = 204;
  // if pokemon with this id
  if (id > 1 || id < 151) {
    pokemonData[id - 1].rating = rating;
  } else {
    return respond(request, response, 400, { message: 'The page you are looking for was not found.', id: 'notFound' });
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }
  return respond(request, response, responseCode, {});
};

// // POST - create a pokemon
// const makePokemon = (request, response) => {

// };

const notReal = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  respond(request, response, 404, responseJSON);
};

module.exports = {
  getRandom,
  getAll,
  getPokemon,
  getPokemonFromType,
  addDescription,
  addRating,
  notReal,
};
