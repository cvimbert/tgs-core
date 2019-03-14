import { Condition } from "./condition.class";

export class GameContext {

  static conditionsStore: {[key: string]: Condition} = {};
  static variablesStore: {[key: string]: any} = {};

  static getCondition(conditionName: string): Condition {
    if (this.conditionsStore[conditionName]) {
      return this.conditionsStore[conditionName];
    } else {
      console.error(`No condition named '${ conditionName }' in store.`);
    }
  }

  static addDebugConditions() {
    //this.conditionsStore["variableTest"] = new Condition(null);
  }

  static getVariable(variableName: string): any {
    if (this.variablesStore[variableName]) {
      return this.variablesStore[variableName];
    } else {
      console.error(`No variable named '${ variableName }' in store.`);
    }
  }

  static addDebugVariables() {
    this.variablesStore["variableTest"] = 8;
  }

}
