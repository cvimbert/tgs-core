import { SequenceStep } from "./sequence-step.interface";

export interface GameStep  {
    sequenceId: string;
    steps: SequenceStep[];
    variables: {[key: string]: any};
    localVariables: {[key: string]: any};
}