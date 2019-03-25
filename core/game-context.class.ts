import { Condition } from "./condition.class";
import { IncrementalDataSaver } from "./saver/incremental-data-saver.class";

export class GameContext {

  static initialized: boolean = false;

  static conditionsStore: {[key: string]: Condition} = {};

  // extraction du contexte courant (ou à un point déterminé)
  static variablesStore: {[key: string]: any} = {};

  static dataSaver: IncrementalDataSaver;

  static init(): boolean {
    if (!this.initialized) {
      this.dataSaver = new IncrementalDataSaver();
      this.load();
      this.initialized = true;
    }

    return this.dataSaver.init();
  }

  static getCondition(conditionName: string): Condition {
    if (this.conditionsStore[conditionName]) {
      return this.conditionsStore[conditionName];
    } else {
      console.error(`No condition named '${ conditionName }' in store.`);
    }
  }

  static getVariable(variableName: string): any {
    if (this.variablesStore[variableName] !== undefined) {
      return this.variablesStore[variableName];
    } else {
      console.error(`No variable named '${ variableName }' in store.`);
    }
  }

  static setVariable(variableName: string, value: any) {
    this.variablesStore[variableName] = value;
    this.dataSaver.setVariable(variableName, value);

    // temp
    this.dataSaver.save();
  }

  static saveToLocalStorage() {
    localStorage.setItem("variables", JSON.stringify(this.variablesStore));
  }

  static loadFromLocalStorage() {
    let variablesText: string = localStorage.getItem("variables");

    if (variablesText && variablesText !== "") {
      this.variablesStore = JSON.parse(variablesText);
    }
  }

  static save() {
    this.dataSaver.save();
    this.saveToLocalStorage();
  }

  static load() {
    this.loadFromLocalStorage();
  }

  static onSequenceLoaded(sequenceId: string) {
    this.dataSaver.addStep(sequenceId);
  }

  static onBlockLoaded(blockId: string) {
    this.dataSaver.addSequenceStep(blockId);
  }

}
