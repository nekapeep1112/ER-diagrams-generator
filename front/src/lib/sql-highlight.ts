import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

type TokenKind = 'keyword' | 'type' | 'string' | 'comment' | 'number' | 'text';

interface Token {
  kind: TokenKind;
  value: string;
}

const KEYWORDS = new Set([
  'CREATE', 'TABLE', 'INDEX', 'UNIQUE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'NOT', 'NULL', 'DEFAULT', 'ON', 'DELETE', 'UPDATE', 'CASCADE', 'RESTRICT',
  'IF', 'EXISTS', 'AS', 'CHECK', 'CONSTRAINT', 'AND', 'OR', 'IN', 'WHERE',
  'SELECT', 'FROM', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP', 'BY',
  'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES',
  'ALTER', 'ADD', 'COLUMN', 'DROP', 'WITH',
]);

const TYPES = new Set([
  'UUID', 'VARCHAR', 'CHAR', 'TEXT', 'CITEXT',
  'TIMESTAMP', 'TIMESTAMPTZ', 'DATE', 'TIME', 'TIMETZ', 'INTERVAL',
  'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL',
  'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE', 'PRECISION',
  'BOOLEAN', 'BOOL', 'BYTEA', 'JSON', 'JSONB', 'ENUM',
]);

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comment to end of line
    if (line[i] === '-' && line[i + 1] === '-') {
      tokens.push({ kind: 'comment', value: line.slice(i) });
      i = line.length;
      break;
    }

    // String literal
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") j++;
      if (j < line.length) j++; // include closing quote
      tokens.push({ kind: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier / keyword / type
    if (/[A-Za-z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const upper = word.toUpperCase();
      const kind: TokenKind = KEYWORDS.has(upper) ? 'keyword' : TYPES.has(upper) ? 'type' : 'text';
      tokens.push({ kind, value: word });
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ kind: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Whitespace / punctuation
    let j = i;
    while (j < line.length && !/[A-Za-z0-9_'-]/.test(line[j])) {
      // Stop before --
      if (line[j] === '-' && line[j + 1] === '-') break;
      j++;
    }
    if (j === i) j++;
    tokens.push({ kind: 'text', value: line.slice(i, j) });
    i = j;
  }

  return tokens;
}

const CLASS_BY_KIND: Record<TokenKind, string | undefined> = {
  keyword: 'sql-keyword',
  type: 'sql-type',
  string: 'sql-string',
  comment: 'sql-comment',
  number: 'sql-number',
  text: undefined,
};

export function highlightSqlLine(line: string): ReactNode {
  const tokens = tokenize(line);
  return createElement(
    Fragment,
    null,
    ...tokens.map((t, idx) => {
      const className = CLASS_BY_KIND[t.kind];
      if (!className) return t.value;
      return createElement('span', { key: idx, className }, t.value);
    }),
  );
}
