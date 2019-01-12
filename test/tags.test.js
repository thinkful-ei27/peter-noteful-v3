const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');

const { tags } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tags API resource', function () {
  // Connect to DB before all tests
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true})
      .then(() => mongoose.connection.db.dropDatabase());
  });

  // Seed DB before each test
  beforeEach(function () {
    return Tag.insertMany(tags)
      .then(() => {
        return Tag.createIndexes();
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
  describe('GET all endpoint /api/tags', function () {

    it('should get all of the tags', function () {
      let res;
  
      return chai.request(app)
        .get('/api/tags')
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
            
          return Tag.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });
  
    it('should return tags with the right fields', function () {
      // get back all tags and make sure theyh ave expected keys
      let resTag;
  
      return chai.request(app)
        .get('/api/tags')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
  
          res.body.forEach(function (tag) {
            expect(tag).to.be.a('object');
            expect(tag).to.include.keys('id', 'name', 'updatedAt', 'createdAt');
          });
  
          resTag = res.body[0];
          return Tag.findById(resTag.id);
        })
        .then(tag => {
          expect(resTag.id).to.equal(tag.id);
          expect(resTag.name).to.equal(tag.name);
        });
    });
  });

  // ================ Tests for reading single tag by id

  // ================ Tests for creating a tag

  // ================ Tests for updating a tag by id

  // ================ Tests for Deleting a tag by id
  describe('DELETE endpoint for tags', function () {

    it('should delete an item by Id', function () {
      let deleteTagId;
      return Tag.findOne()
        .then((data) => {
          deleteTagId = data.id;
          return chai.request(app)
            .delete(`/api/tags/${deleteTagId}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Tag.findById(deleteTagId);
        })
        .then(_tag => {
          expect(_tag).to.be.null;
        });
    });

  });
});