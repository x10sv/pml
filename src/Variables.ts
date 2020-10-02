interface IVariable {
    name: string;
    type: string;
    fromLine: Number;
    fromColumn: Number;
    toLine: Number | null;
    toColumn: Number | null;
    global: Boolean;
}

type VariableType =
    | 'Form'
    | 'MarUi'
    | 'MarUtil'
    | 'MarDrafting'
    | 'MarCaptureRegionPlanar'
    | 'MarContourPlanar'
    | 'MarRectanglePlanar'
    | 'MarElementHandle'
    | 'MarModel'
    | 'MarDex'
    | 'MarPanelSchema'
    | 'MarPoint'
    | 'MarPointPlanar'
    | 'MarSymbolicView'
    | 'MarHullPan'
    | 'MarHullPan'
    | 'MarPrintOptions'
    | 'NetDataSource'
    | 'MarPythonEngine'
    | 'PMLFileBrowser'
    | 'file'
    | 'format'
    | 'DateTime'
    | 'MarText'
    | 'MarSymbol'
    | 'MarColour'
    | 'Collection'
    | 'array'
    | 'boolean'
    | 'string'
    | 'gadget'
    | 'real'
    | 'any'
    | 'project'
    | 'DBRef';

class Variables {
    data: IVariable[] = [];
}

export default new Variables();
