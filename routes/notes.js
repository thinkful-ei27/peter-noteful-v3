'use strict';

const express = require('express');
const Note = require('../models/note');
const mongoose = require('mongoose');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
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
    regex = new RegExp(searchTerm, 'i');
  }

  Note
    .find(filter)
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
    .find({_id: id})
    .sort({updatedAt: 'desc'})
    .then(note => res.json(note))
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newNote = req.body;
  
  Note
    .create(newNote)
    .then(note => {
      res.location(`${req.originalUrl}/${note.id}`).status(201).json(note);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const noteToUpdateId = req.params.id;
  const updateNote = req.body;

  Note
    .findByIdAndUpdate(noteToUpdateId, updateNote)
    .then(notes => res.json(notes))
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
    .then(notes => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;
