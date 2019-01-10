'use strict';

const express = require('express');
const Folder = require('../models/folder');
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

});
/* ========== PUT/UPDATE AN ITEM ========== */
router.put('/:id', (req, res, next) => {

});
/* ========== DELETE/ DELETE AN ITEM ========== */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;