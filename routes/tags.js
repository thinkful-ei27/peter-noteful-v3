const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Note = require('../models/note')
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Tag.find()
    .sort('name')
    .then(results => res.json(results))
    .catch(err => next(err));
});

/* ========== GET/READ SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag
    .findById(id)
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE SINGLE ITEM ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newTag = { name };

  // validate user
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag
    .create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});

/* ========== PUT/UPDATE SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const updateTag = { name };

  Tag
    .findByIdAndUpdate(id, updateTag, { new: true })
    .then(result => res.json(result))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const removeTagPromise = Tag.findByIdAndRemove(id);

  const removeTagFromNotePromise = Note.updateMany(
    { tags: id },
    { $pull: { tags: id } }
  );

  Promise.all([removeTagPromise, removeTagFromNotePromise])
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;