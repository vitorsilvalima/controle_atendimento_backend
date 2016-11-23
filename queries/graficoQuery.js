var db = require('../database/postgresqlDB');

/**
 * Insere na tabela atendimento
 */
function all(req, res, next){
    var retorno = {
    };

    var mes=parseInt(req.params.mes);
    var dia=parseInt(req.params.dia);
    var ano=parseInt(req.params.ano);
    var mes2=parseInt(req.params.mes2);
    var dia2=parseInt(req.params.dia2);
    var ano2=parseInt(req.params.ano2);

    req.params.date= (ano+"-"+mes+"-"+dia);
    req.params.date2= (ano2+"-"+mes2+"-"+dia2);
    db.tx(function(t) {   
        return t.oneOrNone("select count(*) as total_ano from atendimento "
                          +"where extract(year from data_inicio)>=${ano} AND "
                          +"extract(year from data_inicio)<=${ano2}",req.params)
        .then(data=>{
            retorno.total_ano=parseInt(data.total_ano);
            return t.oneOrNone("select count(*) as total_mes from atendimento "
                          +"where extract(year from data_inicio)>=${ano} AND "
                          +"extract(year from data_inicio)<=${ano2} AND "
                          +"extract(MONTH from data_inicio)>=${mes} AND "
                          +"extract(MONTH from data_inicio)<=${mes2}",req.params);
        })
        .then(data=>{
            retorno.total_mes=parseInt(data.total_mes);
            return t.any("select count(*) as total, "
            +"(select nome from usuario where usuario.usuario_id=atendimento.usuario_id) "
            +"from atendimento  "
            +"where extract(year from data_inicio)>=${ano} AND "
            +"extract(year from data_inicio)<=${ano2} AND "
            +"extract(MONTH from data_inicio)>=${mes} AND "
            +"extract(MONTH from data_inicio)<=${mes2} "
            +"GROUP BY usuario_id  ORDER BY total DESC",req.params);
        })
        .then(data=>{
            retorno.destaques=data;
            return t.oneOrNone("select count(*) as total_semana "
            +"from atendimento "
            +"where extract(year from data_inicio)>=${ano} AND "
            +"extract(year from data_inicio)<=${ano2} AND "
            +"extract(MONTH from data_inicio)>=${mes} AND "
            +"extract(MONTH from data_inicio)<=${mes2} AND "
            +"extract(WEEK from data_inicio) >= extract(WEEK from to_date(${date}, 'YYYY-MM-DD')) AND "
            +"extract(WEEK from data_inicio) <= extract(WEEK from to_date(${date2}, 'YYYY-MM-DD'))",req.params);
         })
        .then(data=>{
            retorno.total_semana=parseInt(data.total_semana);
            return t.oneOrNone("select count(*) as total_visitas from atendimento "
                          +"INNER JOIN TIPO_ATENDIMENTO ON "
		                  +"ATENDIMENTO.tipo_atendimento_id=tipo_atendimento.tipo_atendimento_id "
                          +"AND (descricao='Avulso Online' "
                          +"OR descricao='Avulso Local') AND "
                          +"extract(year from data_inicio)>=${ano} AND "
                          +"extract(year from data_inicio)<=${ano2} AND "
                          +"extract(MONTH from data_inicio)>=${mes} AND "
                          +"extract(MONTH from data_inicio)<=${mes2} ",req.params);
        })
        .then(data=>{
            retorno.total_visitas=parseInt(data.total_visitas);
            //retorno.semana=data;
            return t.any("select count(*) as total_tipo, "
            +"(select descricao from tipo_atendimento where tipo_atendimento.tipo_atendimento_id=atendimento.tipo_atendimento_id) "
            +"from atendimento "
            +"where extract(year from data_inicio)>=${ano} AND "
            +"extract(year from data_inicio)<=${ano2} AND "
            +"extract(MONTH from data_inicio)>=${mes} AND "
            +"extract(MONTH from data_inicio)<=${mes2} "
            +"GROUP BY descricao  ORDER BY total_tipo DESC",req.params);
        });
    })
    .then(function(data) {
        retorno.porTipo=data;
        console.log(data);
        res.status(200)
        .json(retorno);
    })
    .catch(function(error) {
        // error
        next(error);
    })
}

function teste(req, res, next){
    var month=parseInt(req.params.month)-1;
    var day=parseInt(req.params.day);
    var year=parseInt(req.params.year);
    console.log("Month"+month);
    var date = (year+"-"+month+"-"+day);
    console.log(date);
    var retorno = {
    };
    db.tx(function(t) {   
        return t.oneOrNone("select count(*) as total_atendimentos from atendimento "
                          +"where extract(year from data_inicio)=extract(year from to_date($1, 'YYYY-MM-DD'))",date);
    })
    .then(function(data) {
        retorno.porTipo=data;
        console.log(data);
        res.status(200)
        .json(retorno);
    })
    .catch(function(error) {
        // error
        next(error);
    })
   
}


module.exports = {
  all:all,
  teste:teste
};