import path from 'path';
import fs from 'fs';
import * as babel from '@babel/core';
import plugin from '..';

const rootPath = (fixtureName: string): string =>
  path.join(path.resolve(), 'src', '__tests__', '__fixtures__', fixtureName);
const inputPath = (fixtureName: string): string =>
  path.join(rootPath(fixtureName), 'input.js');
const optionsPath = (fixtureName: string): string =>
  path.join(rootPath(fixtureName), 'options.js');
const readOptions = (fixtureName: string): string | undefined => {
  let optionsString;
  try {
    optionsString = fs.readFileSync(optionsPath(fixtureName), 'utf8');
  } catch (err) {
    // no options are passed as undefined, {} would work
    if (err.code === 'ENOENT') {
      return undefined;
    }
    throw err; // any other readfile error is a concern
  }
  let options;
  return eval(`options = ${optionsString}`); // allow eval to throw it's own errors
};

const runTransform = (fixtureName: string): string => {
  const options = readOptions(fixtureName);

  const result = babel.transformFileSync(inputPath(fixtureName), {
    plugins: [[plugin, options]],
    filename: fixtureName, // name for errors
    root: rootPath(fixtureName), // allow the fixture to contain babelrc
    configFile: false, // don't search
  });
  return result && result.code ? result.code : '';
};

describe('babel-plugin-ts-remove-console', () => {
  [
    'basic',
    'bound-excludes',
    'excludes',
    'guards',
    'local-binding',
    'member-expr-assignment-no-op',
    'member-expr-no-op',
    'replace-with-empty-block',
    'top-level',
    'top-level-stmts',
  ].forEach((testCase) => {
    it(`handles ${testCase}`, () => {
      expect(runTransform(testCase)).toMatchSnapshot();
    });
  });
});
