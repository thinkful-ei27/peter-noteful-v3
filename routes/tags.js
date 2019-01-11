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