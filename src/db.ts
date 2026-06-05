import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
};

let db: duckdb.AsyncDuckDB | null = null;
let connection: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<any> | null = null;

export const initDB = async () => {
    if (db) return { db, connection: connection! };
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
            const worker = new Worker(bundle.mainWorker!);
            const logger = new duckdb.ConsoleLogger();

            const newDb = new duckdb.AsyncDuckDB(logger, worker);
            await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);

            const newConn = await newDb.connect();
            db = newDb;
            connection = newConn;
            return { db, connection };
        } catch (e) {
            initPromise = null;
            throw e;
        }
    })();
    return initPromise;
};

export const runQuery = async (query: string) => {
    const { connection } = await initDB();
    const result = await connection.query(query);
    return result.toArray().map(row => row.toJSON());
};

export const closeDB = async () => {
    if (connection) {
        await connection.close();
        connection = null;
    }
    if (db) {
        await db.terminate();
        db = null;
    }
};
