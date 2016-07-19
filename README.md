
# serene-express

Allows you to use [Serene](https://www.npmjs.com/package/serene) with [Express](https://www.npmjs.com/package/express).

## Installation

    $ npm install --save serene-express

## Usage

```js
import express from 'express';
import Serene from 'serene';
import sereneExpress from 'serene-express';

let service = new Serene();
// set up service...

let app = express();
app.use(sereneExpress(service));
```

## Documentation

This package maps the following routes to the specified Serene operations:

| Route | Serene operation |
|---|---|
| `GET /:resource` | `list` |
| `GET /:resource/:id` | `get` |
| `POST /:resource` | `create` |
| `PATCH /:resource/:id` | `update` |
| `PUT /:resource/:id` | `replace` |
| `DELETE /:resource/:id` | `delete` |

It also defines an error handler that serialises the error to JSON in the `error` field of the response, using the status code specified by the `status` field on the error if it exists, or 500 by default.

If you pass `false` as a second argument to `sereneExpress`, it will not register the error handler nor the handler that formats the response to JSON.  These handlers can be referenced manually like so:

```js
import {errorHandler, formatJson} from 'serene-express';
```

This could be useful for setting it up to serialise to a different format, such as XML or CSV.
