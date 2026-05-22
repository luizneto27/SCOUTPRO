import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

app = Flask(__name__)


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("POSTGRES_DB", "scoutpro"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "admin123"),
        sslmode=os.getenv("DB_SSLMODE", "prefer"),
    )


def run_query(query, params=None, fetchone=False, fetchall=False):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = None
            if fetchone:
                result = cur.fetchone()
            elif fetchall:
                result = cur.fetchall()
            conn.commit()
            return result
    finally:
        conn.close()


@app.get("/")
def home():
    return jsonify(
        {
            "app": "ScoutPro CRUD Basico",
            "recursos": [
                "/jogadores",
                "/relatorios",
                "/estatisticas",
                "/scouts",
                "/clubes",
                "/competicoes",
                "/paises",
                "/posicoes",
            ],
        }
    )


@app.get("/paises")
def listar_paises():
    dados = run_query("SELECT * FROM paises ORDER BY nome", fetchall=True)
    return jsonify(dados)


@app.get("/posicoes")
def listar_posicoes():
    dados = run_query("SELECT * FROM posicoes ORDER BY id", fetchall=True)
    return jsonify(dados)


@app.get("/scouts")
def listar_scouts():
    dados = run_query("SELECT * FROM scouts ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.post("/scouts")
def criar_scout():
    data = request.get_json(force=True)
    query = """
        INSERT INTO scouts (nome, email, regiao, ativo)
        VALUES (%s, %s, %s, COALESCE(%s, TRUE))
        RETURNING *
    """
    novo = run_query(
        query,
        (data.get("nome"), data.get("email"), data.get("regiao"), data.get("ativo")),
        fetchone=True,
    )
    return jsonify(novo), 201


@app.get("/clubes")
def listar_clubes():
    dados = run_query("SELECT * FROM clubes ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.post("/clubes")
def criar_clube():
    data = request.get_json(force=True)
    query = """
        INSERT INTO clubes (nome, pais_id, cidade, fundacao)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """
    novo = run_query(
        query,
        (
            data.get("nome"),
            data.get("pais_id"),
            data.get("cidade"),
            data.get("fundacao"),
        ),
        fetchone=True,
    )
    return jsonify(novo), 201


@app.get("/competicoes")
def listar_competicoes():
    dados = run_query("SELECT * FROM competicoes ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.post("/competicoes")
def criar_competicao():
    data = request.get_json(force=True)
    query = """
        INSERT INTO competicoes (nome, pais_id, nivel)
        VALUES (%s, %s, COALESCE(%s, 1))
        RETURNING *
    """
    novo = run_query(
        query,
        (data.get("nome"), data.get("pais_id"), data.get("nivel")),
        fetchone=True,
    )
    return jsonify(novo), 201


@app.get("/jogadores")
def listar_jogadores():
    dados = run_query("SELECT * FROM jogadores ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.get("/jogadores/<int:jogador_id>")
def buscar_jogador(jogador_id):
    dado = run_query(
        "SELECT * FROM jogadores WHERE id = %s", (jogador_id,), fetchone=True
    )
    if not dado:
        return jsonify({"erro": "Jogador nao encontrado"}), 404
    return jsonify(dado)


@app.post("/jogadores")
def criar_jogador():
    data = request.get_json(force=True)
    query = """
        INSERT INTO jogadores
        (nome, nome_completo, data_nascimento, pais_id, posicao_id, posicao_sec_id,
         altura_cm, peso_kg, pe_dominante, clube_atual_id, ativo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, TRUE))
        RETURNING *
    """
    params = (
        data.get("nome"),
        data.get("nome_completo"),
        data.get("data_nascimento"),
        data.get("pais_id"),
        data.get("posicao_id"),
        data.get("posicao_sec_id"),
        data.get("altura_cm"),
        data.get("peso_kg"),
        data.get("pe_dominante"),
        data.get("clube_atual_id"),
        data.get("ativo"),
    )
    novo = run_query(query, params, fetchone=True)
    return jsonify(novo), 201


@app.put("/jogadores/<int:jogador_id>")
def atualizar_jogador(jogador_id):
    data = request.get_json(force=True)
    query = """
        UPDATE jogadores
        SET nome = %s,
            nome_completo = %s,
            data_nascimento = %s,
            pais_id = %s,
            posicao_id = %s,
            posicao_sec_id = %s,
            altura_cm = %s,
            peso_kg = %s,
            pe_dominante = %s,
            clube_atual_id = %s,
            ativo = %s
        WHERE id = %s
        RETURNING *
    """
    params = (
        data.get("nome"),
        data.get("nome_completo"),
        data.get("data_nascimento"),
        data.get("pais_id"),
        data.get("posicao_id"),
        data.get("posicao_sec_id"),
        data.get("altura_cm"),
        data.get("peso_kg"),
        data.get("pe_dominante"),
        data.get("clube_atual_id"),
        data.get("ativo", True),
        jogador_id,
    )
    atualizado = run_query(query, params, fetchone=True)
    if not atualizado:
        return jsonify({"erro": "Jogador nao encontrado"}), 404
    return jsonify(atualizado)


@app.delete("/jogadores/<int:jogador_id>")
def deletar_jogador(jogador_id):
    removido = run_query(
        "DELETE FROM jogadores WHERE id = %s RETURNING id",
        (jogador_id,),
        fetchone=True,
    )
    if not removido:
        return jsonify({"erro": "Jogador nao encontrado"}), 404
    return jsonify({"mensagem": "Jogador removido"})


@app.get("/relatorios")
def listar_relatorios():
    dados = run_query("SELECT * FROM relatorios ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.post("/relatorios")
def criar_relatorio():
    data = request.get_json(force=True)
    query = """
        INSERT INTO relatorios
        (jogador_id, scout_id, clube_id, competicao_id, data_observacao, local,
         tecnica, tatica, fisico, mentalidade, potencial, recomendacao, observacoes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    params = (
        data.get("jogador_id"),
        data.get("scout_id"),
        data.get("clube_id"),
        data.get("competicao_id"),
        data.get("data_observacao"),
        data.get("local"),
        data.get("tecnica"),
        data.get("tatica"),
        data.get("fisico"),
        data.get("mentalidade"),
        data.get("potencial"),
        data.get("recomendacao"),
        data.get("observacoes"),
    )
    novo = run_query(query, params, fetchone=True)
    return jsonify(novo), 201


@app.put("/relatorios/<int:relatorio_id>")
def atualizar_relatorio(relatorio_id):
    data = request.get_json(force=True)
    query = """
        UPDATE relatorios
        SET jogador_id = %s,
            scout_id = %s,
            clube_id = %s,
            competicao_id = %s,
            data_observacao = %s,
            local = %s,
            tecnica = %s,
            tatica = %s,
            fisico = %s,
            mentalidade = %s,
            potencial = %s,
            recomendacao = %s,
            observacoes = %s
        WHERE id = %s
        RETURNING *
    """
    params = (
        data.get("jogador_id"),
        data.get("scout_id"),
        data.get("clube_id"),
        data.get("competicao_id"),
        data.get("data_observacao"),
        data.get("local"),
        data.get("tecnica"),
        data.get("tatica"),
        data.get("fisico"),
        data.get("mentalidade"),
        data.get("potencial"),
        data.get("recomendacao"),
        data.get("observacoes"),
        relatorio_id,
    )
    atualizado = run_query(query, params, fetchone=True)
    if not atualizado:
        return jsonify({"erro": "Relatorio nao encontrado"}), 404
    return jsonify(atualizado)


@app.delete("/relatorios/<int:relatorio_id>")
def deletar_relatorio(relatorio_id):
    removido = run_query(
        "DELETE FROM relatorios WHERE id = %s RETURNING id",
        (relatorio_id,),
        fetchone=True,
    )
    if not removido:
        return jsonify({"erro": "Relatorio nao encontrado"}), 404
    return jsonify({"mensagem": "Relatorio removido"})


@app.get("/estatisticas")
def listar_estatisticas():
    dados = run_query("SELECT * FROM estatisticas ORDER BY id DESC", fetchall=True)
    return jsonify(dados)


@app.post("/estatisticas")
def criar_estatistica():
    data = request.get_json(force=True)
    query = """
        INSERT INTO estatisticas
        (jogador_id, clube_id, competicao_id, temporada, jogos, minutos, titularidades,
         gols, assistencias, chutes, chutes_gol, interceptacoes, desarmes, amarelos, vermelhos)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    params = (
        data.get("jogador_id"),
        data.get("clube_id"),
        data.get("competicao_id"),
        data.get("temporada"),
        data.get("jogos", 0),
        data.get("minutos", 0),
        data.get("titularidades", 0),
        data.get("gols", 0),
        data.get("assistencias", 0),
        data.get("chutes", 0),
        data.get("chutes_gol", 0),
        data.get("interceptacoes", 0),
        data.get("desarmes", 0),
        data.get("amarelos", 0),
        data.get("vermelhos", 0),
    )
    novo = run_query(query, params, fetchone=True)
    return jsonify(novo), 201


@app.put("/estatisticas/<int:estatistica_id>")
def atualizar_estatistica(estatistica_id):
    data = request.get_json(force=True)
    query = """
        UPDATE estatisticas
        SET jogador_id = %s,
            clube_id = %s,
            competicao_id = %s,
            temporada = %s,
            jogos = %s,
            minutos = %s,
            titularidades = %s,
            gols = %s,
            assistencias = %s,
            chutes = %s,
            chutes_gol = %s,
            interceptacoes = %s,
            desarmes = %s,
            amarelos = %s,
            vermelhos = %s
        WHERE id = %s
        RETURNING *
    """
    params = (
        data.get("jogador_id"),
        data.get("clube_id"),
        data.get("competicao_id"),
        data.get("temporada"),
        data.get("jogos", 0),
        data.get("minutos", 0),
        data.get("titularidades", 0),
        data.get("gols", 0),
        data.get("assistencias", 0),
        data.get("chutes", 0),
        data.get("chutes_gol", 0),
        data.get("interceptacoes", 0),
        data.get("desarmes", 0),
        data.get("amarelos", 0),
        data.get("vermelhos", 0),
        estatistica_id,
    )
    atualizado = run_query(query, params, fetchone=True)
    if not atualizado:
        return jsonify({"erro": "Estatistica nao encontrada"}), 404
    return jsonify(atualizado)


@app.delete("/estatisticas/<int:estatistica_id>")
def deletar_estatistica(estatistica_id):
    removido = run_query(
        "DELETE FROM estatisticas WHERE id = %s RETURNING id",
        (estatistica_id,),
        fetchone=True,
    )
    if not removido:
        return jsonify({"erro": "Estatistica nao encontrada"}), 404
    return jsonify({"mensagem": "Estatistica removida"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
