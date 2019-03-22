export interface SequenceStep {
    blockId: string;
    variableUpdates: {[key: string]: any};
}