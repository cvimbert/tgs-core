import { GameStep } from "./interfaces/game-step.interface";
import { SequenceStep } from "./interfaces/sequence-step.interface";

export class IncrementalDataSaver {

    private steps: GameStep[];
    currentStep: GameStep;

    constructor() {

        // temporairement

        //this.load();

        /*if (this.steps.length > 0) {
            this.currentStep = this.steps[0];
        }*/

        this.steps = [];
    }

    init(): boolean {
        this.load();

        if (this.steps.length === 0) {
            return false;
        }

        return true;
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

        // peut-être pas très futé (cas où on reprend d'une sauvegarde existante) - Pour débug
        // sécurité pour ne pas créer un nouveau step

        if (!this.currentStep || this.currentStep.sequenceId !== sequenceId) {
            this.currentStep = {
                sequenceId: sequenceId,
                steps: [],
                variables: {}
            };
    
            this.steps.push(this.currentStep);
        }
    }

    addSequenceStep(blockId: string) {
        let lastSequenceStep: SequenceStep = this.lastSequenceStep;

        if (!lastSequenceStep || lastSequenceStep.blockId !== blockId) {
            this.currentStep.steps.push({
                blockId: blockId,
                variables: {}
            });
        }

        console.log("variables", this.getCurrentVariables());
    }

    setVariable(name: string, value: any) {
        let lastSequenceStep: SequenceStep = this.lastSequenceStep;

        if (lastSequenceStep) {
            lastSequenceStep.variables[name] = value;
        } else {
            this.currentStep.variables[name] = value;
        }
    }

    getCurrentVariables(): {[key: string]: any} {
        let variables: {[key: string]: any} = {};

        this.steps.forEach(saverStep => {
            this.mergeObjects(variables, saverStep.variables);

            saverStep.steps.forEach(sequenceStep => {
                this.mergeObjects(variables, sequenceStep.variables);
            });
        });

        return variables;
    }

    private mergeObjects(object1: Object, object2: Object): Object {
        for (let key in object2) {
            object1[key] = object2[key];
        }

        return object1;
    }
}