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
        .then(function (folders) {
          console.log(folders);
          expect(folders).to.be.a('array'); 
        });
    });
  });

  // ================ Tests for reading single folder by id

  // ================ Tests for creating a folder

  // ================ Tests for updating a folder by id

  // ================ Tests for Deleting a folder by id

});
