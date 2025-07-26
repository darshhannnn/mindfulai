const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const journalEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mood: { type: String, required: true },
  sentiment: { type: Object },
}, {
  timestamps: true,
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;
