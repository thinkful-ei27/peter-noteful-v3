const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server'); 

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const { notes, folders } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API resouce', function () {

  // Connect to the DB before all the tests
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  // Seed data runs before each test
  beforeEach(function () {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders)
    ])
      .then(() => {
        return Note.createIndexes();
      });
  });

  // Drop the databse after each test
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  // Disconnect after all tests
  after(function () {
    return mongoose.disconnect();
  });

  // ================ Test for Get All notes
  describe('GET /api/notes', function () {
    let res;

    it('Should return all existing notes', function () {
      return chai.request(app)
        .get('/api/notes')
        .then(_res => {
          res = _res;
          // console.log(res);
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Note.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });
    
    it('should return notes with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resNote;
      return chai.request(app)
        .get('/api/notes')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(note => {
            expect(note).to.be.a('object');
            expect(note).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId');
          });

          resNote = res.body[0];
          return Note.findById(resNote.id);
        })
        .then(note => {

          expect(resNote.id).to.equal(note.id);
          expect(resNote.title).to.equal(note.title);
          expect(resNote.content).to.equal(note.content);
        });
    });

    it('should return correct search results for a folderId query', function () {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return Promise.all([
            Note.find({ folderId: data.id }),
            chai.request(app).get(`/api/notes?folderId=${data.id}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  // ================ Test for get single note by id 
  describe('GET single note by id', function () {

    it('should get a single note from the collection', function () {

      let note;

      return Note.findOne()
        .then(_note => {
          note = _note;
          return chai.request(app)
            .get(`/api/notes/${note.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          // 3) then compare database results to API response
          expect(res.body.id).to.equal(note.id);
          expect(res.body.title).to.equal(note.title);
          expect(res.body.content).to.equal(note.content);
          expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
        });
    });
  });
  
  // ================ Test for creating note
  describe('POST to /api/notes ', function () {

    it('should add a new note to the collection', function () {

      const newNote = {
        title: 'BRAND NEW TITLE',
        content: 'SHINEY NEW CONTENT',
        _id: '111111111111111111111109'
      };
      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(_res => {

          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id','title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');

          return Note.findById(res.body.id);
        })
        .then(note => {
          expect(res.body.id).to.equal(note.id);
          expect(res.body.title).to.equal(note.title);
          expect(res.body.content).to.equal(note.content);
          expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
        });
    });
  });

  // ================ Test for updating single note
  describe('PUT update an item in the collection', function () {

    it('should update fields you send over', function() {
      const updateData = {
        title: 'I have updated this',
        content: 'update update update'
      };
  
      return Note.findOne()
        .then(note => {
          updateData.id = note.id;
  
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(200);
  
          return Note.findById(updateData.id);
        })
        .then(note => {
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });
  });

  // ================ Test for delete single note
  describe('DELETE endpoint', function() {
        
    it('should delete a note by id', function() {
      let deleteNoteId;
      
      return Note.findOne()
        .then(note => {
          deleteNoteId = note.id;
          return chai.request(app)
            .delete(`/api/notes/${deleteNoteId}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Note.findById(deleteNoteId);
        })
        .then(_note => {
          expect(_note).to.be.null;
        });
    });
  });
});
