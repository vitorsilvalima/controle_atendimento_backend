var express = require('express');
var router = express.Router();
var db_atendimento = require('../queries/atendimentoQuery');


//router.post('/api/atendimentos', db_atendimento.create);
router.post('/api/atendimentos', db_atendimento.insert);
router.get('/api/atendimentos', db_atendimento.all);
router.get('/api/atendimentos/:ano/:mes', db_atendimento.allByMonth);
router.put('/api/atendimentos/finalizar/:atendimento_id', db_atendimento.finalizar);
router.put('/api/atendimentos/:atendimento_id', db_atendimento.update);

module.exports = router;