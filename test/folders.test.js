const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const { folders } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API resource', function () {
  // Connect to DB before all tests
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true})
      .then(() => mongoose.connection.db.dropDatabase());
  });

  // Seed DB before each test
  beforeEach(function () {
    return Folder.insertMany(folders)
      .then(() => {
        return Folder.createIndexes();
      });
  });

  // Drop DB after each test
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  // Disconnect from DB after all tests
  after(function () {
    return mongoose.disconnect();
  });


  // ================ Tests for reading all folders
  describe('GET all endpoint /api/folders', function () {

    it('should get all of the folders', function () {
      let res;

      return chai.request(app)
        .get('/api/folders')
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          
          return Folder.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return folders with the right fields', function () {
      // get back all folders and make sure theyh ave expected keys
      let resFolder;

      return chai.request(app)
        .get('/api/folders')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(function (folder) {
            expect(folder).to.be.a('object');
            expect(folder).to.include.keys('id', 'name', 'updatedAt', 'createdAt');
          });

          resFolder = res.body[0];
          return Folder.findById(resFolder.id);
        })
        .then(folder => {
          expect(resFolder.id).to.equal(folder.id);
          expect(resFolder.name).to.equal(folder.name);
        });
      
    });
  });

  // ================ Tests for reading single folder by id
  describe('GET endpoint w/ id', function () {
    
    it('should get a single folder by id', function () {
      let data;

      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'createdAt', 'updatedAt', 'id');
          // compare the api response to the database results 
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
        
    });

    it('should respond with a 400 for invalid id', function () {
      return chai.request(app)
        .get('/api/folders/NOT-A-VALID-ID')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 not found for Id that does not exist', function() {
      return chai.request(app)
      // the str 'DOESNOTEXITS' is 12 bytes, which is a valid Mongo ObjectId
        .get('/api/folders/DOESNOTEXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  // ================ Tests for creating a folder
  describe('POST endpoint for createing folder', function () {
    
    it('should add a new folder to the collection', function () {

      const newFolder = {
        name: 'Newly Named Folder'
      };

      let res;

      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(_res => {

          res = _res;

          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('name', 'createdAt', 'updatedAt', 'id');

          return Folder.findById(res.body.id);
        })
        .then(folder => {
          expect(res.body.id).to.equal(folder.id);
          expect(res.body.name).to.equal(folder.name);
          expect(new Date(res.body.createdAt)).to.eql(folder.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(folder.updatedAt);
        });
    });

    it('should return an error when missing `name` field', function () {
      const newItem = {foo: 'bar'};

      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res).to.be.an('object');
          expect(res.body.message).to.eq('`name` field is missing');
        });
    });

    it('should return an error 400 when given a duplicate name', function () {
      return Folder.findOne()
        .then(data => {
          const newItem = {name: data.name};
          return chai.request(app).post('/api/folders').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.eq('The folder name already exists');
        });
    });

  });
  // ================ Tests for updating a folder by id
  describe('PUT endpoint updating folder', function () {
    it('should update the folder', function () {
      const updateFolder = {name: 'Updated This'};
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateFolder);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          // compare api response to database response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return a 404 not found error when given an ID that does not exist', function () {
      const updateFolder = {name: 'Updated This'};
      return chai.request(app)
        .put('/api/folders/DOESNOTEXIST')
        .send(updateFolder)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return a 400 error when given an invalid ID', function () {
      const updateFolder = {name: 'Updated This'};
      return chai.request(app)
        .put('/api/folders/NOT-A-VALID-ID')
        .send(updateFolder)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should return a 400 error when `name` field is missing', function () {
      const updateFolder = {foo: 'Updated This'};
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateFolder);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.eq('The `id` is not valid');
        });  
    });

    it('should return an error when given duplicate `name`', function () {
      return Folder.find().limit(2)
        .then(results => {
          const [item1, item2] = results;
          // set name of item1 to be name of item2
          item1.name = item2.name;
          return chai.request(app).put(`/api/folders/${item1.id}`).send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.eq('The folder name already exists');
        });  
    });
      
  });
  // ================ Tests for Deleting a folder by id

});
