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

  static setVariable(variableName: string, value: any, forcedType: string = null) {

    if ((typeof value) === "string") {
      switch(forcedType) {
        case "number":
          value = +value;
          break;
  
        case "boolean":
          value = (value === "true");
          break;
      }
    }

    this.variablesStore[variableName] = value;
    this.dataSaver.setVariable(variableName, value);

    // temp
    this.dataSaver.save();
  }

  static save() {
    this.dataSaver.save();
  }

  static clearGame() {
    this.dataSaver.clear();
    this.initialized = false;
  }

  static extractVariables() {
    this.variablesStore = this.dataSaver.getCurrentVariables();
  }

  static onSequenceLoaded(sequenceId: string) {
    this.dataSaver.addStep(sequenceId);
  }

  static onBlockLoaded(blockId: string) {
    this.dataSaver.addSequenceStep(blockId);
  }

}
