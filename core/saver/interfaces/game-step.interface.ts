import { SequenceStep } from "./sequence-step.interface";

export interface GameStep  {
    sequenceId: string;
    steps: SequenceStep[];
}