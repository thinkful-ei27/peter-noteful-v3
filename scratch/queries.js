const mongoose = require('mongoose');

const { MONGODB_URI } =  require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI,   {useNewUrlParser: true})
  .then(() => {
    const searchTerm = 'in';

    const regex = new RegExp(searchTerm, 'i');
    // let filter = {};
    // if (searchTerm) {
    //   filter.title =  { $regex: searchTerm, $options:  'i' };
    // }

    return Note.find({$or: [{title: regex}, {content: regex}]}).sort({ updatedAt: 'desc' });
  })
  .then((results) => console.log(JSON.stringify(results, null, 2)))
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// mongoose.connect(MONGODB_URI,   {useNewUrlParser: true})
//   .then(() => {
//     const searchId = '111111111111111111111101';
//     let filter = {};

//     filter._id = searchId;

//     return Note.findById(filter);
//   })
//   .then((results) => console.log(results))
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//     mongoose.disconnect();
//   });

// mongoose.connect(MONGODB_URI,   {useNewUrlParser: true})
//   .then(() => {
//     const note = {
//       title: 'This is fine',
//       content: 'no really its fine'
//     };

//     return Note.create(note);
//   })
//   .then((results) => console.log(results))
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {

//     const searchId = {_id: '5c3510f623279e128f2a350b'};
//     const updatedNote = {
//       title: 'sdkfjhsdfkjhsdkjhsdkjfh',
//       content: 'It\'s 4:20 muthaFer'
//     };

//     return Note.findByIdAndUpdate(searchId, updatedNote, {
//       new: true,
//       upsert: true
//     });
//   })
//   .then((results) => console.log(results))
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {

//     const searchId = {_id: '5c3510f623279e128f2a350b'};

//     return Note.findByIdAndRemove(searchId);
//   })
//   .then((results) => console.log(results))
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });