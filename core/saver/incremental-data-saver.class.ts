import { GameStep } from "./interfaces/game-step.interface";
import { SequenceStep } from "./interfaces/sequence-step.interface";
import { LogItem } from "../data-interfaces/log-item.interface";
import { GameContext } from '../game-context.class';
import { GameMode } from '../game-mode.enum';

export class IncrementalDataSaver {

    steps: GameStep[] = [];
    currentStep: GameStep;
    logs: LogItem[];

    constructor() {
        
    }

    init(): boolean {
        this.load();

        if (this.steps.length === 0) {
            return false;
        }

        this.currentStep = this.steps[this.steps.length - 1];
        return true;
    }

    private saveToLocalStorage() {

        // à voir si il y a une manière plus judicieuse de faire
        //if (GameContext.displayMode === GameMode.NORMAL) {
            localStorage.setItem("steps", JSON.stringify(this.steps));
            localStorage.setItem("logs", JSON.stringify(this.logs));
        //}
    }

    private loadFromLocalStorage() {
        let storageText: string = localStorage.getItem("steps");
        let logsText: string = localStorage.getItem("logs");

        this.steps = (storageText && storageText !== "") ? JSON.parse(storageText) : [];
        this.logs = (logsText && logsText !== "") ? JSON.parse(logsText) : [];
    }

    private get lastSequenceStep(): SequenceStep {
        if (this.currentStep && this.currentStep.steps.length > 0) {
            return this.currentStep.steps[this.currentStep.steps.length - 1];
        }
    }

    deleteVariable(variableName: string, inWholeTree: boolean = false) {
        // suppression de l'arbre complet de sauvegarde, ou uniquement à partir du point local ?
        
    }

    hasBlockBeenSeen(blockId: string): boolean {
        for (let step of this.currentStep.steps) {
            if (step.blockId === blockId) {
                return true;
            }
        }

        return false;
    }

    save() {
        this.saveToLocalStorage();
    }

    load() {
        this.loadFromLocalStorage();
    }

    addStep(sequenceId: string) {

        if (!this.currentStep) {
            this.currentStep = {
                sequenceId: sequenceId,
                steps: [],
                variables: {}
            };
    
            this.steps.push(this.currentStep);
        }
    }

    addSequenceStep(blockId: string) {

        this.currentStep.steps.push({
            blockId: blockId,
            variables: {}
        });

        //console.log("variables", this.getCurrentVariables());
    }

    setVariable(name: string, value: any) {

        let lastSequenceStep = this.lastSequenceStep;

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

    getVariable(variableName: string, sequenceIndex?: number, sequenceStepIndex?: number): any {

        if (sequenceIndex === undefined) {
            sequenceIndex = this.steps.length - 1;
        }

        let startStep: number = sequenceStepIndex;

        if (sequenceStepIndex === undefined) {
            startStep = this.steps[sequenceIndex].steps.length - 1;
        }

        for (let i: number = sequenceIndex; i >= 0; i--) {

            for (let j: number = startStep; j >= 0; j--) {
                if (this.steps[i].steps[j].variables[variableName] !== undefined) {
                    return this.steps[i].steps[j].variables[variableName];
                }
            }

            if (this.steps[i].variables[variableName] !== undefined) {
                return this.steps[i].variables[variableName];
            }

            if (i > 0) {
                startStep = this.steps[i - 1].steps.length;
            }
        }
    }

    removeLast() {
        if (this.currentStep.steps.length > 1) {
            this.currentStep.steps.pop();
            this.save();
            //console.log("suppression au sein de la séquence");
        } else if (this.steps.length > 1) {
            this.steps.pop();
            this.save();
            //console.log("suppression de séquence");
        } else  {
            console.log("can't go back");
        }
    }

    clear() {
        localStorage.setItem("steps", "");
        this.steps = [];
        this.logs = [];
        this.currentStep = null;
        this.save();
    }

    private mergeObjects(object1: Object, object2: Object): Object {
        for (let key in object2) {
            object1[key] = object2[key];
        }

        return object1;
    }
}