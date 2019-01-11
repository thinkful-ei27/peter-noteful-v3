const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

mongoose.set('timestamps', true);

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret._id;
  }
});

module.exports = mongoose.model('Tag', tagSchema);