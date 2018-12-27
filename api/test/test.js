let request = require('supertest');
let assert = require('chai').assert;
const server = require('../../server');
const chai = require('chai');
const expect = require('expect');

describe('/Testing Query',()=>{
    it('it should test event query requests',(done)=>{
       setTimeout(done,1000);
       request(server)
           .post('/graphql')
           .send({query:'{events { description title _id} }'})
           .expect(200)
           .end((err,res)=>{
               if(err){
                   return done(err);
               }
               res.body.events.should.have.property('description');
               res.body.events.should.have.property('_id');
               res.body.events.should.have.property('title');
               res.body.events.should.have.lengthOf(5);

               done();
           })
    });
    it('it should fail on Bad Requests',(done)=>{
        setTimeout(done,1000);
        request(server)
            .post('/graphql')
            .send({query:'{events: {describe id} }'})
            .expect(400)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                done();
                //console.log(res.body);
            });
    });
    it('it should not create duplicate users',(done)=>{
       setTimeout(done,1000);
       request(server)
           .post('/graphql')
           .send({query:'{events: {describe id} }'})
           .expect(400)
           .end((err,res)=>{
               if(err){
                   console.log(err.message);
                   console.log(res);

                   return done(err);
               }
               done();
           })
    });


});
