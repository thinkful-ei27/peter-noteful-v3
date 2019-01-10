'use strict';

const express = require('express');
const Folder = require('../models/folder');
const Note = require('../models/note');
const mongoose = require('mongoose');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};
  let regex;

  if (searchTerm) {
    regex = new RegExp(searchTerm, 'i');
    filter = { name: regex };
  }

  Folder
    .find(filter)
    .sort({name: 'asc'})
    .then(folders => res.json(folders))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 404;
    return next(err);
  }

  Folder
    .find({_id: id})
    .then(folder => res.json(folder))
    .catch(err => next(err));
});

/* ========== POST/ CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newFolder = req.body;

  /* Validate user input */
  if (!newFolder.name) {
    const err = new Error('`name` field is missing');
    err.status = 400;
    return next(err);
  }

  Folder
    .create(newFolder)
    .then(note => res.location(`${req.originalUrl}/${note.id}`).status(201).json(note))
    .catch(err => {
      
      // Check for `duplicate key error` code from Mongo
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE AN ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const updateFolder = req.body;

  /* Validate user input */
  if (!updateFolder.name) {
    const err = new Error('`name` field is missing'); 
    err.status = 400;
    return next(err);
  }

  /* Validate id for mongo */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder
    .findByIdAndUpdate(id, updateFolder)
    .then(folders => res.json(folders))
    .catch(err => {

      // Check for `duplicate key error` code from Mongo
      if(err.code === 11000) {
        const err = new Error('The folder name already exists');
        err.status = 400;
        return next(err);
      }
      next(err);
    });
});

/* ========== DELETE/ DELETE AN ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const removeFolderPromise = Folder.findByIdAndRemove(id);

  // ON DELETE CASCADE style where all notes in the folder that 
  // is getting deleted are also delete 
  // const removeNotesPromise = Note.deleteMany({folderId: id});

  // ON DELETE SET NULL style where the folderId is removed from the
  // note belonging to the folder that was deleted
  const updateNotesPromise = Note.updateMany(
    {folderId: id},
    {$unset: {folderId: ''}}
  );
  
  Promise.all([removeFolderPromise, updateNotesPromise])
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;