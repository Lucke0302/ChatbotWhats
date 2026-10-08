'use strict';

/**
 * [FASE 3 - BLINDAGEM FINANCEIRA]
 * Utilitários de acesso ao SQLite com garantias de atomicidade para a economia do bot.
 *
 *  - withTransaction(db, fn): BEGIN IMMEDIATE / COMMIT / ROLLBACK com mutex em memória,
 *    garantindo que fluxos multi-statement (Pix, resgates, compras) sejam tudo-ou-nada.
 *  - debitarSaldo / creditarSaldo / confiscarSaldo: UPDATEs condicionais (WHERE bostocoins >= ?),
 *    abolindo o padrão "ler no JS -> validar -> gravar" que permitia Double-Spend.
 *  - setJson / incrementarJson / debitarJson / appendarArrayJson / removerJsonChave:
 *    escritas atômicas em blobs JSON via json_set()/json_insert()/json_remove(),
 *    evitando "lost updates" de JSON.parse() -> mutar -> JSON.stringify().
 *
 * Segurança: valores e paths SEMPRE via placeholders (?) e os identificadores
 * (tabela/coluna) são resolvidos por whitelist interna, eliminando SQL Injection.
 */

const COLUNA_ID_POR_TABELA = {
    usuarios: 'id_usuario',
    legado_grupos: 'group_id',
    fazenda_inventario: 'id_usuario'
};

const COLUNAS_JSON_PERMITIDAS = new Set([
    'financas',
    'pescaria_data',
    'parque_data',
    'conquistas_json',
    'canteiros',
    'upgrades',
    'armazem',
    'trofeus'
]);

const REGEX_PATH = /^\$(?:\.[A-Za-z_][A-Za-z0-9_]*|\[\d+\]|\[#\])+$/;
const REGEX_PATH_ARRAY = /^\$(\.[A-Za-z_][A-Za-z0-9_]*|\[\d+\])*$/;

function resolverIdColuna(tabela) {
    const idColuna = COLUNA_ID_POR_TABELA[tabela];
    if (!idColuna) throw new Error(`dbHelper: tabela não permitida (${tabela})`);
    return idColuna;
}

function validarColuna(coluna) {
    if (!COLUNAS_JSON_PERMITIDAS.has(coluna)) throw new Error(`dbHelper: coluna JSON não permitida (${coluna})`);
    return coluna;
}

function validarPath(path, regex = REGEX_PATH) {
    if (typeof path !== 'string' || !regex.test(path)) throw new Error(`dbHelper: path JSON inválido (${path})`);
    return path;
}

// Blob pode estar NULL, '' (legado) ou inválido: normaliza antes de falar com o json_set().
function colunaNormalizada(coluna, padrao) {
    return `COALESCE(NULLIF(${coluna}, ''), '${padrao}')`;
}

function inteiroSeguro(valor) {
    const numero = Math.floor(Number(valor));
    return Number.isFinite(numero) ? numero : 0;
}

/* -------------------------------------------------------------------------- */
/*                              TRANSAÇÕES                                    */
/* -------------------------------------------------------------------------- */

// A conexão do sqlite3 é única e compartilhada por todo o processo. Este mutex
// impede que duas transações intercalem BEGIN/COMMIT na mesma sessão.
let _filaTransacoes = Promise.resolve();
const _dbsEmTransacao = new WeakSet();

async function rollbackSeguro(db) {
    try {
        await db.exec('ROLLBACK');
    } catch (erro) {
        console.error('⚠️ [DB] Falha ao executar ROLLBACK:', erro.message);
    }
}

/**
 * Executa o callback dentro de uma transação real (BEGIN IMMEDIATE).
 * Qualquer erro dentro do callback provoca ROLLBACK e é propagado ao chamador.
 * Chamadas aninhadas no mesmo `db` NÃO abrem nova transação (reentrância segura).
 *
 * IMPORTANTE: use apenas operações de banco dentro do callback (nada de redes/APIs),
 * para manter a transação curta e não segurar o lock de escrita.
 */
async function withTransaction(db, fn) {
    if (!db || typeof db.exec !== 'function') throw new Error('dbHelper: conexão inválida para withTransaction');
    if (typeof fn !== 'function') throw new Error('dbHelper: callback inválido para withTransaction');

    // Reentrância: já estamos dentro de uma transação neste db -> apenas participa dela.
    if (_dbsEmTransacao.has(db)) return fn(db);

    const anterior = _filaTransacoes;
    let liberar;
    _filaTransacoes = new Promise((resolve) => { liberar = resolve; });

    // Espera a transação anterior terminar (mesmo que ela tenha falhado).
    await anterior.catch(() => {});

    _dbsEmTransacao.add(db);

    let transacaoAberta = false;
    let resultado;

    try {
        await db.exec('BEGIN IMMEDIATE');
        transacaoAberta = true;

        resultado = await fn(db);

        await db.exec('COMMIT');
        transacaoAberta = false;
    } catch (erro) {
        if (transacaoAberta) await rollbackSeguro(db);
        throw erro;
    } finally {
        _dbsEmTransacao.delete(db);
        liberar();
    }

    return resultado;
}

function emTransacao(db) {
    return _dbsEmTransacao.has(db);
}

/* -------------------------------------------------------------------------- */
/*                       SALDO (bostocoins) ATÔMICO                           */
/* -------------------------------------------------------------------------- */

/**
 * Debita bostocoins de forma condicional e atômica.
 * @returns {Promise<boolean>} true apenas se a linha foi atualizada (saldo suficiente).
 */
async function debitarSaldo(db, userId, amount) {
    const valor = inteiroSeguro(amount);
    if (valor <= 0) return false;

    const resultado = await db.run(
        "UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ? AND bostocoins >= ?",
        [valor, userId, valor]
    );

    return !!(resultado && resultado.changes === 1);
}

/**
 * Credita bostocoins (apenas somas - nunca permite crédito negativo).
 * @returns {Promise<boolean>} true se a conta existia e foi creditada.
 */
async function creditarSaldo(db, userId, amount) {
    const valor = inteiroSeguro(amount);
    if (valor <= 0) return false;

    const resultado = await db.run(
        "UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?",
        [valor, userId]
    );

    return !!(resultado && resultado.changes === 1);
}

/**
 * Confisco (Plano Collor / multas): nunca deixa a carteira negativa.
 * @returns {Promise<number>} quantidade de contas afetadas.
 */
async function confiscarSaldo(db, userId, amount) {
    const valor = inteiroSeguro(amount);
    if (valor <= 0) return 0;

    const resultado = await db.run(
        "UPDATE usuarios SET bostocoins = MAX(0, bostocoins - ?) WHERE id_usuario = ?",
        [valor, userId]
    );

    return resultado ? resultado.changes : 0;
}

/** Garante a existência da linha do usuário (usado antes de creditar um desconhecido). */
async function garantirUsuario(db, userId) {
    await db.run(
        "INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) VALUES (?, 'Anônimo', 0, 0, '', '')",
        [userId]
    );
}

/* -------------------------------------------------------------------------- */
/*                        BLOBS JSON (sem lost update)                        */
/* -------------------------------------------------------------------------- */

/** Grava um valor em um path do blob JSON (json_set). */
async function setJson(db, tabela, coluna, id, path, valor) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(path);

    const resultado = await db.run(
        `UPDATE ${tabela} SET ${coluna} = json_set(${colunaNormalizada(coluna, '{}')}, ?, ?) WHERE ${idColuna} = ?`,
        [path, valor, id]
    );

    return resultado ? resultado.changes : 0;
}

/** Soma (ou subtrai) um valor numérico em um path do blob JSON, sem ler no JS. */
async function incrementarJson(db, tabela, coluna, id, path, delta, padrao = 0) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(path);

    const normalizada = colunaNormalizada(coluna, '{}');
    const resultado = await db.run(
        `UPDATE ${tabela}
         SET ${coluna} = json_set(${normalizada}, ?, CAST(COALESCE(json_extract(${normalizada}, ?), ?) AS REAL) + ?)
         WHERE ${idColuna} = ?`,
        [path, path, inteiroSeguro(padrao), inteiroSeguro(delta), id]
    );

    return resultado ? resultado.changes : 0;
}

/**
 * Soma/subtrai um valor em um path JSON travando o resultado em um piso (padrão 0).
 * Usado em penalidades (debuffs, multas, confiscos) para nunca deixar o estoque negativo.
 */
async function incrementarJsonComPiso(db, tabela, coluna, id, path, delta, piso = 0, padrao = 0) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(path);

    const normalizada = colunaNormalizada(coluna, '{}');
    const resultado = await db.run(
        `UPDATE ${tabela}
         SET ${coluna} = json_set(${normalizada}, ?, MAX(?, CAST(COALESCE(json_extract(${normalizada}, ?), ?) AS REAL) + ?))
         WHERE ${idColuna} = ?`,
        [path, inteiroSeguro(piso), path, inteiroSeguro(padrao), inteiroSeguro(delta), id]
    );

    return resultado ? resultado.changes : 0;
}

/**
 * Debita um valor numérico de um path JSON de forma CONDICIONAL
 * (só executa se o valor atual for >= o débito). Ideal para estoques/investimentos.
 * @returns {Promise<boolean>} true se o débito foi aplicado.
 */
async function debitarJson(db, tabela, coluna, id, path, amount, padrao = 0) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(path);

    const valor = inteiroSeguro(amount);
    if (valor <= 0) return false;

    const normalizada = colunaNormalizada(coluna, '{}');
    const resultado = await db.run(
        `UPDATE ${tabela}
         SET ${coluna} = json_set(${normalizada}, ?, CAST(COALESCE(json_extract(${normalizada}, ?), ?) AS REAL) - ?)
         WHERE ${idColuna} = ?
           AND CAST(COALESCE(json_extract(${normalizada}, ?), ?) AS REAL) >= ?`,
        [path, path, inteiroSeguro(padrao), valor, id, path, inteiroSeguro(padrao), valor]
    );

    return !!(resultado && resultado.changes === 1);
}

/** Remove uma chave/path do blob JSON (json_remove). */
async function removerJsonChave(db, tabela, coluna, id, path) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(path);

    const resultado = await db.run(
        `UPDATE ${tabela} SET ${coluna} = json_remove(${colunaNormalizada(coluna, '{}')}, ?) WHERE ${idColuna} = ?`,
        [path, id]
    );

    return resultado ? resultado.changes : 0;
}

/**
 * Anexa um item ao final de um array JSON (json_insert com o token [#]),
 * garantindo antes que o path seja realmente um array.
 * @param {string} pathArray caminho do array ('$' para a raiz ou a chave, ex: '$.records').
 */
async function appendarArrayJson(db, tabela, coluna, id, pathArray, item) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(pathArray, REGEX_PATH_ARRAY);

    const payload = JSON.stringify(item);
    if (typeof payload !== 'string') throw new Error('dbHelper: item inválido para appendarArrayJson');

    const normalizada = colunaNormalizada(coluna, pathArray === '$' ? '[]' : '{}');
    const pathAppend = `${pathArray}[#]`;

    const resultado = await db.run(
        `UPDATE ${tabela}
         SET ${coluna} = json_insert(
                json_set(
                    ${normalizada},
                    ?,
                    CASE WHEN json_type(${normalizada}, ?) = 'array'
                         THEN json(COALESCE(json_extract(${normalizada}, ?), '[]'))
                         ELSE json('[]') END
                ),
                ?, json(?)
             )
         WHERE ${idColuna} = ?`,
        [pathArray, pathArray, pathArray, pathAppend, payload, id]
    );

    return resultado ? resultado.changes : 0;
}

/**
 * Só grava o valor se ele for MAIOR que o valor atual do path de comparação
 * (usado em recordes/troféus, evitando derrubar o recorde de outro jogador).
 */
async function setJsonSeMaior(db, tabela, coluna, id, pathDestino, pathComparacao, valorObjeto, valorComparado) {
    const idColuna = resolverIdColuna(tabela);
    validarColuna(coluna);
    validarPath(pathDestino);
    validarPath(pathComparacao);

    const normalizada = colunaNormalizada(coluna, '{}');
    const resultado = await db.run(
        `UPDATE ${tabela}
         SET ${coluna} = json_set(${normalizada}, ?, json(?))
         WHERE ${idColuna} = ?
           AND CAST(COALESCE(json_extract(${normalizada}, ?), 0) AS REAL) < ?`,
        [pathDestino, JSON.stringify(valorObjeto), id, pathComparacao, Number(valorComparado) || 0]
    );

    return !!(resultado && resultado.changes === 1);
}

module.exports = {
    withTransaction,
    emTransacao,
    debitarSaldo,
    creditarSaldo,
    confiscarSaldo,
    garantirUsuario,
    setJson,
    incrementarJson,
    incrementarJsonComPiso,
    debitarJson,
    removerJsonChave,
    appendarArrayJson,
    setJsonSeMaior
};

