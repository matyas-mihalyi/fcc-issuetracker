const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const { validInputMock, requiredValidInputMock, invalidInputMock, responseKeys, invalidDelRequestMock } = require('./mocks');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let document;
  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(validInputMock)
    .end((err, res) => {
      assert.equal(res.status, 201, 'res status should be 200');

      for (const key in validInputMock) {
        assert.equal(res.body[key], validInputMock[key], `${key} property of request and response should match`);
      }
      assert.hasAllKeys(res.body, responseKeys, 'should have all keys of the schema');
      document = res.body
      done();
    });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(requiredValidInputMock)
    .end((err, res) => {
      assert.equal(res.status, 201, 'res status should be 200');

      for (const key in validInputMock) {
        assert.equal(res.body[key], requiredValidInputMock[key], `${key} property of request and response should match`);
      }
      assert.hasAllKeys(res.body, responseKeys, 'should have all keys of the schema');
      done();
    });
  });
  
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(invalidInputMock)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, { error: "required field(s) missing"}, 'should send an error message');
      done();
    });
  });

  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/mytests')
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.isAtLeast(res.body.length, 1, 'should return an array with a minimum length of 1');
      done();
    });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/mytests?status_text=design')
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.isAtLeast(res.body.length, 2, 'should return an array with a length of 2');
      res.body.forEach(document => {
        assert.equal(document.status_text, "design")
      });
      done();
    });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/mytests?created_by=tester&assigned_to=James')
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.isAtLeast(res.body.length, 1, 'should return an array with a length of 1');
      res.body.forEach(document => {
        assert.equal(document.created_by, "tester")
        assert.equal(document.assigned_to, "James")
      });
      done();
    });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    const update = {_id: document._id, assigned_to: 'matyi'};
    chai
    .request(server)
    .put('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(update)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {result: 'successfully updated', _id: document._id}, 'success ,essage should be returned');
      done();
    });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
    const update = {_id: document._id, assigned_to: 'James', open: false};
    chai
    .request(server)
    .put('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(update)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {result: 'successfully updated', _id: document._id}, 'success ,essage should be returned');
      done();
    });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    const update = {assigned_to: 'James', open: false};
    chai
    .request(server)
    .put('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(update)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {error: 'missing _id'}, 'error message should be returned');
      done();
    });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    const update = {_id: document._id};
    chai
    .request(server)
    .put('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(update)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {error: 'no update field(s) sent', _id: update._id}, 'error message should be returned');
      done();
    });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    const update = {_id: 'abc', assigned_to: 'James', open: false};
    chai
    .request(server)
    .put('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(update)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {error: 'could not update', _id: update._id}, 'error message should be returned');
      done();
    });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
    const toDelete = {_id: document._id};
    chai
    .request(server)
    .delete('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(toDelete)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {result: 'successfully deleted', _id: toDelete._id}, 'success message should be returned');
      done();
    });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .delete('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(invalidDelRequestMock)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {error: "could not delete", _id: invalidDelRequestMock._id}, 'should send an error message');
      done();
    });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
    const toDelete = {assigned_to: 'James'};
    chai
    .request(server)
    .delete('/api/issues/mytests')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(toDelete)
    .end((err, res) => {
      assert.equal(res.status, 200, 'res status should be 200');
      assert.deepEqual(res.body, {error: 'missing _id'}, 'error message should be returned');
      done();
    });
  });
  
});
