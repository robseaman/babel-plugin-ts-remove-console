# Babel Plugin TypeScript Remove Console

This should not be released. It's just a copy of [babel-plugin-transform-remove-console](https://github.com/babel/minify/tree/master/packages/babel-plugin-transform-remove-console) that was adapted to TypeScript using the [babel-plugin-ts-starter](https://github.com/robseaman/babel-plugin-ts-starter) as a learning exercise and test of the starter package.

## Installation

```bash
yarn
```

## Usage

- `yarn test` runs test suite with text fixtures from the original babel-plugin-transform-remove-console plugin. There is also a vscode debug configuration called `Jest Babel Plugin`.
- `yarn watch` runs test suite in watch mode.
- `yarn coverage` tests and runs a coverage report.
- `yarn lint` linting of code and markdown docs. A placeholder for linting code in markdown also exists. `prettier` is also including in the linting.
- `yarn type-check` ... just that
- `yarn build` creates build targeted at node 6.9, chose based on current `nodeVersion` in Babel's [babel.config.js](https://github.com/babel/babel/blob/master/babel.config.js).

## References

- [minify repo](https://github.com/babel/minify) with original [babel-plugin-transform-remove-console](https://github.com/babel/minify/tree/master/packages/babel-plugin-transform-remove-console) package
- [AST Explorer](https://astexplorer.net/#)
- [Babel repl](https://babeljs.io/repl)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [Babel AST Spec](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md)
