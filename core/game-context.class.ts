import { Condition } from "./condition.class";
import { IncrementalDataSaver } from "./saver/incremental-data-saver.class";
import { LogItem } from './data-interfaces/log-item.interface';

export class GameContext {

  static initialized: boolean = false;

  static conditionsStore: {[key: string]: Condition} = {};

  // extraction du contexte courant (ou à un point déterminé)
  static variablesStore: {[key: string]: any} = {};

  static dataSaver: IncrementalDataSaver;

  static currentSequenceIndex: number;
  static currentSequenceStepIndex: number;

  static displayMode: string;

  //static currentLogs: LogItem[] = [];

  static init(): boolean {
    if (!this.initialized) {
      this.dataSaver = new IncrementalDataSaver();
      this.initialized = true;
    }

    return this.dataSaver.init();
  }

  static get currentLogs(): LogItem[] {
    return this.dataSaver.logs;
  }

  static getCondition(conditionName: string): Condition {
    if (this.conditionsStore[conditionName]) {
      return this.conditionsStore[conditionName];
    } else {
      console.error(`No condition named '${ conditionName }' in store.`);
    }
  }

  static getVariable(variableName: string, dispatchError = true): any {

    let value: any = this.dataSaver.getVariable(variableName, this.currentSequenceIndex, this.currentSequenceStepIndex);

    if (value !== undefined) {
      return value;
    } else {
      if (dispatchError) {
        console.error(`No variable named '${ variableName }' in store.`);
      }
    }
  }

  static hasBlockBeenSeen(blockId: string): boolean {
    return this.dataSaver.hasBlockBeenSeen(blockId);
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

    //this.variablesStore[variableName] = value;
    this.dataSaver.setVariable(variableName, value);

    // temp
    this.dataSaver.save();
  }

  static deleteVariable(variableName: string) {
    //delete this.variablesStore[variableName];
  }

  static save() {
    this.dataSaver.save();
  }

  static clearGame() {
    this.dataSaver.clear();
    this.initialized = false;
  }

  static getCurrentVariables(): {[key: string]: any} {
    return this.dataSaver.getCurrentVariables();
  }

  static onSequenceLoaded(sequenceId: string) {
    this.dataSaver.addStep(sequenceId);
  }

  static onBlockLoaded(blockId: string) {
    this.dataSaver.addSequenceStep(blockId);
  }

  static log(logs: string[]) {
    this.dataSaver.logs.push(...logs.map(log => {
      return {
        date: Date.now(),
        text: log
      }
    }));
  }

}
