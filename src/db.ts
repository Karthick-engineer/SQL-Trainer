import * as duckdb from '@duckdb/duckdb-wasm';

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

let db: duckdb.AsyncDuckDB | null = null;
let connection: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<any> | null = null;

export const initDB = async () => {
    if (db) return { db, connection: connection! };
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
            const workerUrl = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' }));
            const worker = new Worker(workerUrl);
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
