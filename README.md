# PML Extension for `Visual Studio Code`

## Features

It provides syntax highlight for `Programmable Macro Language`.

> Supported File Types: `.pmlfrm`, `.pmlmac`, `.pmlfnc`, `.pmlobj`, `.pmldat`

## Snippets

Enable the support for tab-completion in Visual Studio code by setting:

> "editor.tabCompletion": "on".

Then just type a snippet prefix, and press Tab to insert a snippet. Pressing tab again will move the cursor to different predefined areas.

As of this release it has the following snippets defined:

- **`pmlform`** : Creates the basic scaffolding for a new pml form.
- **`pmlformg`**: Creates the basic scaffolding for a new pml form with a grid. This will also add the following methods out of the box, besides the constructor:
  - _`rightClickGrid`_ : Defines right click trigger functionality;
  - _`removeAll`_ : Removes all grid Contents;
  - _`removeSelected`_ : Removes Selected rows from Grid;
  - _`exportToExcel`_ : Exports grid contents to .xls file;
  - _`initializeEmptyGrid`_ : Initialize an empty grid & set up the columns;
  - _`appendToGrid(rows)`_ : Add an array of rows to the grid.
- **`pmlfunc`** : Creates the basic scaffolding for a new pml function.
- **`pmlmet`** : Creates the basic scaffolding for a new pml method.
- **`pmlobj`** : Creates the basic scaffolding for a new pml object.
- **`pmlbut`** : Creates the basic code for adding a new button on a plm form.

## Commands

- `PML Uglify` will encrypt the pml file using a trivial encryption (for testing purposes).

## Code Completion

- Basic code completion logic added

## Release Notes

For a full list of changes please check `CHANGELOG.md`

### 0.1.6

- Fixed problems in syntax highlighter
- Added basic code completion logic

---

### For more information

- [Programmable Macro Language](https://en.wikipedia.org/wiki/Programmable_Macro_Language)
- [Visual Studio Code](https://code.visualstudio.com/)

**All contributions are welcomed!**
