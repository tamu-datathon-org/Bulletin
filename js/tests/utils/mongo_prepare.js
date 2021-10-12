// it-helper.js
const prepare = require('mocha-prepare');
const mongoUnit = require('mongo-unit');

prepare(done => mongoUnit.start()
    .then(testMongoUrl => {
        process.env.MONGODB_URL = testMongoUrl;
        done();
    }));
