const { MongoClient } = require('mongodb');
const username = 'system';
const password = 'scorego_6'
const client = new MongoClient(`mongodb+srv://${username}:${password}@score-go-db.nxi0dar.mongodb.net/?retryWrites=true&w=majority`);

module.exports = client