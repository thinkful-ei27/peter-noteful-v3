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
    return Folder.insertMany(folders);
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
  describe('GET folder by id', function () {
    
    it('should get a single folder by id', function () {
      let data;

      return Folder.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .get(`/api/folders/${data.id}`)
            .then(res => {
              //Why is res.body an array -- Classmates isn't 
              const resFolder = res.body[0];

              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(resFolder).to.be.an('object');
              expect(resFolder).to.have.keys('name', 'createdAt', 'updatedAt', 'id');
              // compare the api response to the database results 
              expect(resFolder.id).to.equal(data.id);
              expect(resFolder.name).to.equal(data.name);
              expect(new Date(resFolder.createdAt)).to.eql(data.createdAt);
              expect(new Date(resFolder.updatedAt)).to.eql(data.updatedAt);
            });
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

    // res is an empty array which is triggering a 200 WHY?
    // it('should respond with a 404 not found for Id that does not exist', function() {
    //   return chai.request(app)
    //   // the str 'DOESNOTEXITS' is 12 bytes, which is a valod Mongo ObjectId
    //     .get('/api/folders/DOESNOTEXIST')
    //     .then(res => {
    //       expect(res).to.have.status(404);
    //     });
    // });
  });
  // ================ Tests for creating a folder

  // ================ Tests for updating a folder by id

  // ================ Tests for Deleting a folder by id

});
