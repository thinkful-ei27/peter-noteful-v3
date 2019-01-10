const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId: [{type: mongoose.Schema.Types.ObjectId, ref: 'Folder'}]
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

noteSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Note', noteSchema);