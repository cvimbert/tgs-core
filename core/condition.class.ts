import { ConditionModel, ComparisonOperandModel, BooleanComparisonModel, ComparisonOperator, ComparisonOperandType } from "tgs-model";
import { GameContext } from "./game-context.class";

export class Condition {

  constructor(
    private model: ConditionModel
  ) {}

  evaluate(): boolean {
    //console.log("Evaluation", this.model);

    if (this.model.booleanValue && this.model.booleanValue.comparison) {
      // comparaison booléenne
      let comparison: BooleanComparisonModel = this.model.booleanValue.comparison;

      let operandValue1 = this.evaluateOperand(comparison.operand1);
      let operandValue2 = this.evaluateOperand(comparison.operand2);
      let operator: ComparisonOperator = comparison.operator;

      return this.compare(operandValue1, operandValue2, operator);
    }

    return true;
  }

  evaluateOperand(comparisonOperand: ComparisonOperandModel): string | number | boolean {
    //console.log("operand", comparisonOperand);

    switch(comparisonOperand.type) {
      case ComparisonOperandType.VALUE:
        return comparisonOperand.value;
      case ComparisonOperandType.VARIABLE:
        return GameContext.getVariable(comparisonOperand.variableName);
    }

    return;
  }

  compare(value1: any, value2: any, operator: ComparisonOperator): boolean {

    if (typeof value1 === "string") {
      value1 = `"${ value1 }"`;
    }

    if (typeof value2 === "string") {
      value2 = `"${ value2 }"`;
    }

    let evaluation: string = value1 + operator + value2;
    return eval(evaluation);
  }

  static evaluateInContext(model: ConditionModel): boolean {
    if (model.conditionName) {
      let condition: Condition = GameContext.getCondition(model.conditionName);
      return condition ? condition.evaluate() : false;
    } else if (model.booleanValue) {
      // création d'une condition temporaire
      let condition = new Condition(model);
      return condition.evaluate();
    }
  }
}
