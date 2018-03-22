var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../sample_server');
var should = chai.should();

chai.use(chaiHttp);
console.log("Console logging:: from test-Server.js");
describe('product', function() {
    it('should list ALL product on /product GET', function(done) {
        chai.request('http://localhost:4000')
            .get('/product')
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });
    /*it('should list a SINGLE product on /product/<id> GET');
     it('should add a SINGLE product on /product POST');
     it('should update a SINGLE product on /product/<id> PUT');
     it('should delete a SINGLE product on /product/<id> DELETE');*/
});

