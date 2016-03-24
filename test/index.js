
var expect = require('chai').expect;
var express = require('express');
var Serene = require('serene');
var SereneExpress = require('../index');
var supertest = require('supertest-as-promised');


describe('serene-express', function () {
  var app;
  var service;

  beforeEach(function () {
    app = express();
    service = new Serene();
    app.use(new SereneExpress(service));

    if (!process.env.STACK) {
      app.use(function (err, request, response, next) {
        // quiet, you!
      });
    }
  });


  describe('list action', function () {
    it('should call the handler and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('list');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        response.result = {value: 'test'};
      });

      return supertest(app)
        .get('/widgets?fields=foo')
        .expect(200)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });


    it('should set the headers correctly', function () {
      service.use(function (request, response) {
        expect(request.headers.authorization).to.equal('Bearer frobble');
      });

      return supertest(app)
        .get('/widgets')
        .set('Authorization', 'Bearer frobble')
        .expect(204);
    });


    it('should set the cookies correctly', function () {
      service.use(function (request, response) {
        expect(request.cookies.auth).to.equal('frobble');
      });

      return supertest(app)
        .get('/widgets')
        .set('Cookie', 'auth=frobble')
        .expect(204);
    });
  });


  describe('get action', function () {
    it('should call the handler and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('get');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        expect(request.id).to.equal('5');
        response.result = {value: 'test'};
      });

      return supertest(app)
        .get('/widgets/5?fields=foo')
        .expect(200)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });
  });


  describe('create action', function () {
    it('should call the handler and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('create');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        expect(request.body).to.eql({name: 'fred'});
        response.result = {value: 'test'};
      });

      return supertest(app)
        .post('/widgets?fields=foo')
        .send({name: 'fred'})
        .expect(201)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });

    it('should 204 if result is null', function () {
      return supertest(app)
        .post('/widgets?fields=foo')
        .send({name: 'fred'})
        .expect(204);
    });
  });


  describe('update action', function () {
    it('should the handler update and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('update');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        expect(request.id).to.equal('5');
        expect(request.body).to.eql({name: 'fred'});
        response.result = {value: 'test'};
      });

      return supertest(app)
        .patch('/widgets/5?fields=foo')
        .send({name: 'fred'})
        .expect(200)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });

    it('should 204 if result is null', function () {
      return supertest(app)
        .patch('/widgets/5?fields=foo')
        .send({name: 'fred'})
        .expect(204);
    });
  });


  describe('replace action', function () {
    it('should the handler replace and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('replace');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        expect(request.id).to.equal('5');
        expect(request.body).to.eql({name: 'fred'});
        response.result = {value: 'test'};
      });

      return supertest(app)
        .put('/widgets/5?fields=foo')
        .send({name: 'fred'})
        .expect(200)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });

    it('should 204 if result is null', function () {
      return supertest(app)
        .put('/widgets/5?fields=foo')
        .send({name: 'fred'})
        .expect(204);
    });
  });


  describe('delete action', function () {
    it('should the handler delete and respond with the result', function () {
      var called = false;

      service.use(function (request, response) {
        called = true;
        expect(request.operation.name).to.equal('delete');
        expect(request.resourceName).to.equal('widgets');
        expect(request.query).to.eql({fields: 'foo'});
        expect(request.id).to.equal('5');
        response.result = {value: 'test'};
      });

      return supertest(app)
        .delete('/widgets/5?fields=foo')
        .expect(200)
        .then(function (response) {
          expect(called).to.be.true;
          expect(response.body.value).to.equal('test');
        });
    });

    it('should 204 if result is null', function () {
      return supertest(app)
        .delete('/widgets/5?fields=foo')
        .send({name: 'fred'})
        .expect(204);
    });
  });


  describe('error handling', function () {
    it('should handle an error with default 500 code', function () {
      service.use(function () {
        throw new Error('help');
      });

      return supertest(app)
        .get('/widgets/5')
        .expect(500)
        .then(function (response) {
          expect(response.body).to.eql({
            error: {
              name: 'Error',
              message: 'help'
            }
          });
        });
    });


    it('should handle an error with the specified code', function () {
      service.use(function () {
        throw new NotFoundError();
      });

      return supertest(app)
        .get('/widgets/5')
        .expect(404)
        .then(function (response) {
          expect(response.body).to.eql({
            error: {
              name: 'NotFoundError',
              message: 'not found',
              status: 404
            }
          });
        });
    });
  });
});


function NotFoundError() {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'not found'
  this.status = 404;
}

require('util').inherits(NotFoundError, Error);
