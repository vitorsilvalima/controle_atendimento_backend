var db = require('../database/postgresqlDB');

function all(req, res, next){

	var usuario_id = parseInt(req.params.usuario_id);

	db.any("SELECT * FROM ATENDIMENTO "
		+"LEFT JOIN CLIENTE "+
		"ON CLIENTE.CNPJ=ATENDIMENTO.cliente_id "
		+"LEFT JOIN TIPO_ATENDIMENTO ON "
		+"ATENDIMENTO.tipo_atendimento_id=tipo_atendimento.tipo_atendimento_id "
		+"LEFT JOIN ATENDIMENTO_VALOR ON ATENDIMENTO_VALOR.at_id=ATENDIMENTO.ATENDIMENTO_ID "
		+"LEFT JOIN (SELECT username , usuario_id  FROM USUARIO) U ON "
		+"ATENDIMENTO.usuario_id=U.usuario_id "
		+"ORDER BY aberto DESC, data_inicio DESC")
	.then(function(data){
		res.status(200)
		.json(data);
	})
	.catch(function(err){
		next(err);
	});

}

function allByMonth(req, res, next){

	var mes=parseInt(req.params.mes);
    	var ano=parseInt(req.params.ano);

	var usuario_id = parseInt(req.params.usuario_id);

	db.any('SELECT "atendimento"."id", "atendimento"."created_at", "atendimento"."updated_at", "atendimento"."finalizado_at", "atendimento"."contato", "atendimento"."chamado", "atendimento"."problema", "atendimento"."solucao", "atendimento"."tipo_acesso", "atendimento"."tipo_atendimento", "atendimento"."aberto", "atendimento"."cliente_id", "atendimento"."valor_id", "atendimento"."usuario_id", "valor"."id" AS "valor.id", "valor"."valor" AS "valor.valor", "valor"."motivo" AS "valor.motivo", "valor"."faturado_at" AS "valor.faturado_at", "valor"."status" AS "valor.status", "cliente"."cnpj" AS "cliente.cnpj", "cliente"."nome" AS "cliente.nome", "usuario"."id" AS "usuario.id", "usuario"."nome" AS "usuario.nome", "usuario"."email" AS "usuario.email", "usuario"."username" AS "usuario.username", "usuario"."password" AS "usuario.password", "usuario"."tipo" AS "usuario.tipo" FROM "atendimento" AS "atendimento" LEFT OUTER JOIN "valor" AS "valor" ON "atendimento"."valor_id" = "valor"."id" LEFT OUTER JOIN "cliente" AS "cliente" ON "atendimento"."cliente_id" = "cliente"."cnpj" LEFT OUTER JOIN "usuario" AS "usuario" ON "atendimento"."usuario_id" = "usuario"."id" WHERE ("atendimento"."created_at" >='+"'2016-12-01 02:00:00.000 +00:00'"+ ' AND "atendimento"."created_at" <='+ "'2016-12-31 02:00:00.000 +00:00'"+')', req.params)
	.then(function(data){
		res.status(200)
		.json(data);
	})
	.catch(function(err){
		next(err);
	});

}


/**
 * Insere na tabela atendimento
 */
function insert(req, res, next){

	db.tx(function(t) {
		return t.oneOrNone("Select cnpj from cliente where nome=${nome}",req.body)
		.then(cliente=>{
				if(cliente==null){
					return t.one('INSERT INTO cliente(cnpj,nome)'
							+'VALUES(${cnpj},${nome}) RETURNING cnpj', req.body);
				}else{
					return cliente;
				}
			})
		.then(()=> {
			req.body.data_inicio= new Date();
			return t.one('INSERT INTO atendimento(data_inicio,'
				+'contato, tipo_acesso, chamado, problema, solucao, '
				+'tipo_atendimento_id, usuario_id, cliente_id, aberto) '
				+'VALUES(${data_inicio},'
				+'${contato},${tipo_acesso},${chamado},${problema},'
				+'${solucao},(select tipo_atendimento_id from tipo_atendimento where descricao=${tipo_atendimento}),'
				+'${userId},'
				+'${cnpj},true) RETURNING atendimento_id', req.body);
		})
		.then(atendimento=>{
			req.body.data=new Date();
			if(req.body.tipo_atendimento==="Avulso Online" ||
			req.body.tipo_atendimento==="Avulso Local"){
				req.body.atendimento_id=atendimento.atendimento_id;
				return t.none("INSERT INTO atendimento_valor "
				+"(valor, status, at_id, motivo, data)"
				+" VALUES (${valor}, ${status},${atendimento_id},${motivo}, ${data})",req.body);
			}
			else{
				return atendimento;
			}
		});
	})
	.then(function(data) {
		// data = as returned from the transaction's callback
		console.log(data);
		res.status(200)
		.json({
			status: true,
			data:data,
			message: 'Atualizado com sucesso'
		});
	})
	.catch(function(error) {
		// error
		next(error);
	});

}

/**
 * Insere na tabela atendimento
 */
function update(req, res, next){
	db.tx(function(t) {
		return t.none("update atendimento set chamado=${chamado},"
			+"problema=${problema}, solucao=${solucao} ,"
			+"contato=${contato} where atendimento_id=${atendimento_id}",req.body)
		.then(()=>{
			if(req.body.tipo_atendimento==="Avulso Online" || req.body.tipo_atendimento==="Avulso Local"){
				return t.oneOrNone("select status from atendimento_valor "
					+"inner join atendimento on "
					+"atendimento_id=at_id AND "
					+"atendimento_id=${atendimento_id}",req.body)
			}else{
				return {};
			}

		})
		.then(data=>{
			if(data.status!==undefined){
				if(data.status!==req.body.status){
					req.body.data = new Date();
				}
				return t.none("update atendimento_valor set valor=${valor} ,status=${status},"
					   +"motivo=${motivo} ,data=${data} where at_id=${atendimento_id}",req.body)
			}else{
				return {};
			}
		});
	})
	.then(function(data) {
		// data = as returned from the transaction's callback
		console.log(data);
		res.status(200)
		.json({
		});
	})
	.catch(function(error) {
		// error
		next(error);
	});
}


/**
 * finaliza na tabela atendimento
 */
function finalizar(req, res, next){
	db.tx(function(t) {
		req.body.data_fim= new Date();
		return t.none("update atendimento set aberto=false ,chamado=${chamado},"
			+"problema=${problema}, solucao=${solucao} , data_fim=${data_fim},"
			+"contato=${contato} where atendimento_id=${atendimento_id}",req.body)
		.then(()=>{
			if(req.body.tipo_atendimento==="Avulso Online" || req.body.tipo_atendimento==="Avulso Local"){
				return t.oneOrNone("select status from atendimento_valor "
					+"inner join atendimento on "
					+"atendimento_id=at_id AND "
					+"atendimento_id=${atendimento_id}",req.body)
			}else{
				return {};
			}

		})
		.then(data=>{
			if(data.status!==undefined){
				if(data.status!==req.body.status){
					req.body.data = new Date();
				}
				return t.none("update atendimento_valor set valor=${valor} ,status=${status},"
					   +"motivo=${motivo} ,data=${data} where at_id=${atendimento_id}",req.body)
			}else{
				return {};
			}
		});
	})
	.then(function(data) {
		// data = as returned from the transaction's callback
		console.log(data);
		res.status(200)
		.json({
		});
	})
	.catch(function(error) {
		// error
		next(error);
	});
}



module.exports = {
  all:all,
  finalizar:finalizar,
  insert:insert,
  update:update,
  allByMonth:allByMonth
};