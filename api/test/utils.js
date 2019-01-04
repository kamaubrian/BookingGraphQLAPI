const {dateToString} = require('../graphql/helpers/date');
let expect = require('chai').expect;
const randomDate = '2018-12-28T12:47:43.529Z';

describe('Convert Date to ISO String', () => {
    it('it should convert Date to ISO String', (done) => {
        var date = new Date();
        let convertedDate = dateToString(date);
        expect(date).to.be.instanceOf(Date);
        done();
    });
});