export interface SequenceStep {
    blockId: string;
    variables: {[key: string]: any};
    localVariables: {[key: string]: any};
}