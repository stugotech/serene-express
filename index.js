
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');


module.exports = SereneExpress;


function SereneExpress(service) {
  var api = express.Router();
  api.use(bodyParser.json());
  api.use(cookieParser());

  api.get('/:resource', makeHandler(service, 'list'));
  api.get('/:resource/:id', makeHandler(service, 'get'));
  api.post('/:resource', makeHandler(service, 'create'));
  api.patch('/:resource/:id', makeHandler(service, 'update'));
  api.put('/:resource/:id', makeHandler(service, 'replace'));
  api.delete('/:resource/:id', makeHandler(service, 'delete'));

  api.use(function (error, request, response, next) {
    // make name and message enumerable
    Object.defineProperty(error, 'name', {enumerable: true, value: error.name})
    Object.defineProperty(error, 'message', {enumerable: true, value: error.message})

    response
      .status(error.status || 500)
      .json({error: error});

    next(error);
  });

  return api;
}


function makeHandler(service, operation) {
  return function (request, response, next) {
    service.dispatch(
        operation,
        request.params.resource,
        request.query,
        request.body,
        request.params.id,
        request.headers,
        request.cookies
      )
      .then(
        function (sereneResponse) {
          if (sereneResponse.headers) {
            for (var k in sereneResponse.headers) {
              response.set(k, sereneResponse.headers[k]);
            }
          }

          if (sereneResponse.result) {
            response
              .status(sereneResponse.status || (operation === 'create' ? 201 : 200))
              .json(sereneResponse.result);
          } else {
            response
              .status(sereneResponse.status || 204)
              .send();
          }
        },
        next
      );
  };
}
