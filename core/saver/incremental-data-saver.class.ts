import { GameStep } from "./interfaces/game-step.interface";
import { SequenceStep } from "./interfaces/sequence-step.interface";
import { LogItem } from "../data-interfaces/log-item.interface";

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

        // if (GameContext.displayMode === GameMode.NORMAL) {
            this.steps = (storageText && storageText !== "") ? JSON.parse(storageText) : [];
        /* } else {
            this.steps = [];
        } */
        
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
                variables: {},
                localVariables: {}
            };
    
            this.steps.push(this.currentStep);
        }
    }

    addSequenceStep(blockId: string) {

        this.currentStep.steps.push({
            blockId: blockId,
            variables: {},
            localVariables: {}
        });

        //console.log("variables", this.getCurrentVariables());
    }

    isVariableLocal(variableName: string): boolean {
        return variableName.match("^local\.") !== null;
    }

    setVariable(name: string, value: any) {

        let lastSequenceStep = this.lastSequenceStep;
        let isLocal = this.isVariableLocal(name);

        let step: SequenceStep | GameStep = lastSequenceStep ? lastSequenceStep : this.currentStep;
        let storageObject = isLocal ? step.localVariables : step.variables;

        storageObject[name] = value;
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

        let isLocal = this.isVariableLocal(variableName);

        if (!this.steps || this.steps.length === 0) {
            return;
        }

        if (sequenceIndex === undefined) {
            sequenceIndex = this.steps.length - 1;
        }

        let startStep: number = sequenceStepIndex;

        if (sequenceStepIndex === undefined) {
            startStep = this.steps[sequenceIndex].steps.length - 1;
        }

        for (let i: number = sequenceIndex; i >= 0; i--) {

            for (let j: number = startStep; j >= 0; j--) {

                let provider = isLocal ? this.steps[i].steps[j].localVariables : this.steps[i].steps[j].variables;

                if (provider[variableName] !== undefined) {
                    return provider[variableName];
                }
            }

            let provider = isLocal ? this.steps[i].localVariables : this.steps[i].variables;

            if (provider[variableName] !== undefined) {
                return provider[variableName];
            }

            if (i > 0) {
                startStep = this.steps[i - 1].steps.length;
            }
        }
    }

    rewindTo(index: number) {
        this.currentStep.steps = this.currentStep.steps.slice(0, index + 1);
        this.save();
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