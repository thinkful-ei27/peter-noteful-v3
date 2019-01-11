'use strict';

const express = require('express');
const Note = require('../models/note');
const mongoose = require('mongoose');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  let filter = {};
  let regex;

  if (searchTerm) {
    regex = new RegExp(searchTerm, 'i');
    filter = {
      $or: [
        {title: regex}, 
        {content: regex}
      ]
    };
  }

  if(folderId) {
    filter.folderId = folderId;
  }

  if(tagId) {
    filter.tagId = tagId;
  }

  Note
    .find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(notes => res.json(notes))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 404;
    return next(err);
  }
  
  Note
    .findById(id)
    .populate('tags')
    .sort({updatedAt: 'desc'})
    .then(note => {
      if (note) {
        res.json(note);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content , folderId, tags = [] } = req.body;
  
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  tags.forEach(tag => {
    if (!mongoose.Types.ObjectId.isValid(tag)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }
  });

  const newNote = { title, content , folderId, tags};

  if (newNote.folderId === '') {
    delete newNote.folderId;
  }

  Note
    .create(newNote)
    .then(note => {
      res.location(`${req.originalUrl}/${note.id}`).status(201).json(note);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags = [] } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    const badIds = tags.filter(tag => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The `tags` array contains an invalid `id`');
      err.status = 400;
      return next(err);
    }
  }

  const updateNote = { title, content, folderId };
  
  if (folderId === '') {
    delete updateNote.folderId;
    updateNote.$unset = { folderId: '' };
  }

  Note
    .findByIdAndUpdate(id, updateNote, {new: true})
    .then(notes => {
      if (notes) {
        res.json(notes);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  
  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;
