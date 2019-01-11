const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../models/tag');
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

});

/* ========== PUT/UPDATE SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

});

/* ========== DELETE SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;