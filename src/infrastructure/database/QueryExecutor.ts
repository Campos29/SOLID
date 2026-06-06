import { QueryResult, QueryResultRow } from 'pg';

export type QueryExecutor = {
  query<T extends QueryResultRow>(sql: string, values?: unknown[]): Promise<QueryResult<T>>;
};
