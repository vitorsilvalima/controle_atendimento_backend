//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);
describe('Teste do endpoint atendimento', () => {
beforeEach((done) => { //Before each test we empty the database
           done();             
    });
    describe('/Post atendimento', () => {
        it('Nao deve funcionar', (done) => {
            var atendimento = {
                'nome': 'vitor2', 
                'email': 'vlima2@redhat.com',
                'tipo':'administrador'
            };
            chai.request(server)
            .post('/api/atendimentos')
            .send(atendimento)
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.property('status');
                res.body.status.should.be.a('boolean');
                res.body.status.should.equal(false);
                done();
            });
        });
        it('Deve colocar atendimento', function(done) {
            var atendimento={
                'nome': 'vitor2', 
                'email': 'vlima2@redhat.com',
                'username':'vitor2',
                'password':'teste2',
                'tipo':'administrador'
            };
            chai.request(server)
            .post('/api/atendimentos')
            .send(atendimento)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('status');
                res.body.status.should.be.a('boolean');
                res.body.status.should.equal(true);
                done();
            });
        });
    });
  /*
  * Test the /GET/:username route
  */
  describe('/GET/:username atendimento', () => {
      it('it should GET a book by the given id', (done) => {
        var atendimento={
                'nome': 'vitor2', 
                'email': 'vlima2@redhat.com',
                'username':'vitor2',
                'password':'teste2',
                'tipo':'administrador'
                };
        chai.request(server)
        .get('/api/atendimentos/'+ atendimento.username)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.data.should.have.property('nome');
            res.body.data.should.have.property('email');
            res.body.data.should.have.property('password');
            res.body.data.should.have.property('tipo');
            res.body.data.should.have.property('username').eql(atendimento.username);
            done();
        });

      });
  });
  /*
  * Put atendimento
  */
  describe('/Put atendimento', () => {
    var atendimento={
        'nome': 'vitor2', 
        'email': 'vlima2@redhat.com',
        'username':'vitor2',
        'password':'teste2',
        'tipo':'administrador'
        };
    it('deve atualizar atendimento', (done) => {    
            chai.request(server)
            .get('/api/atendimentos/'+ atendimento.username)
            .end((err, res) => {
                chai.request(server)
                .put('/api/atendimentos/'+ res.body.data.atendimento_id)
            .send(atendimento)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('status');
                response.body.status.should.be.a('boolean');
                response.body.status.should.equal(true);
                done();
            });
        });
    });
  });
 /*
  * Test the /GET route
  */
  describe('/GET atendimentos', () => {
      it('it should GET all the atendimentos', (done) => {
        chai.request(server)
            .get('/api/atendimentos')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('status');
                res.body.status.should.be.a('boolean');
                res.body.status.should.equal(true);
                res.body.data.should.be.a('array');
                //res.body.data.length.should.be.eql(0);
                done();
            });
      });
  });


  /**
   * Delete atendimento
   */
  describe('/Delete atendimento', () => {
    var atendimento={
        'nome': 'vitor2', 
        'email': 'vlima2@redhat.com',
        'username':'vitor2',
        'password':'teste2',
        'tipo':'administrador'
        };
        it('deve deletar atendimento', (done) => {    
                 chai.request(server)
                .get('/api/atendimentos/'+ atendimento.username)
                .end((err, res) => {
                    chai.request(server)
                    .delete('/api/atendimentos/'+ res.body.data.atendimento_id)
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('status');
                        response.body.status.should.be.a('boolean');
                        response.body.status.should.equal(true);
                        done();
                     });
                });
            });
        });
});