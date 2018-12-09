let expect = require('expect');
let request = require('supertest');
let assert = require('chai').assert;
const server = require('../../server');

describe('/Testing Base Endpoint',()=>{
    it('it should test the base endpoint',(done)=>{
       setTimeout(done,1000);
       request(server)
           .get('/')
           .expect(200)
           .expect(res=>{
               assert(res.status,200);
           })
    });
});