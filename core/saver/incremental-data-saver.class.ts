import { GameStep } from "./interfaces/game-step.interface";
import { SequenceStep } from "./interfaces/sequence-step.interface";

export class IncrementalDataSaver {

    private steps: GameStep[];
    currentStep: GameStep;

    constructor() {
        this.load();
    }

    private saveToLocalStorage() {
        localStorage.setItem("steps", JSON.stringify(this.steps));
    }

    private loadFromLocalStorage() {
        let storageText: string = localStorage.getItem("steps");

        if (storageText && storageText !== "") {
            this.steps = JSON.parse(storageText);
        } else {
            this.steps = [];
        }
    }

    private get lastSequenceStep(): SequenceStep {
        if (this.currentStep && this.currentStep.steps.length > 0) {
            return this.currentStep.steps[this.currentStep.steps.length - 1];
        }
    }

    save() {
        this.saveToLocalStorage();
    }

    load() {
        this.loadFromLocalStorage();
    }

    addStep(sequenceId: string) {

        this.currentStep = {
            sequenceId: sequenceId,
            steps: []
        };

        this.steps.push(this.currentStep);
    }

    addSequenceStep(blockId: string) {
        this.currentStep.steps.push({
            blockId: blockId,
            variableUpdates: {}
        });
    }

    setVariable(name: string, value: any) {
        let lastSequenceStep: SequenceStep = this.lastSequenceStep;

        if (lastSequenceStep) {
            lastSequenceStep.variableUpdates[name] = value;
        }
    }
}