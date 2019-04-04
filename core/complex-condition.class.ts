import { ComplexConditionModel } from "tgs-model";
import { Condition } from "./condition.class";

export class ComplexCondition {

    private simpleCondition: Condition;
    private operand1: Condition;
    private operand2: ComplexCondition;

    constructor(
        private model: ComplexConditionModel
    ) {
        if (model.simpleCondition) {
            this.simpleCondition = new Condition(model.simpleCondition);
        } else {
            this.operand1 = new Condition(model.operand1);
            this.operand2 = new ComplexCondition(model.operand2);
        }
    }

    private evaluateCondition(): boolean {
        if (this.simpleCondition) {
            // condition simple
            return this.simpleCondition.evaluate();
        } else {
            // condition composée
            switch (this.model.operator) {
                case "and":
                    return this.operand1.evaluate() && this.operand2.evaluate();

                case "or":
                    return this.operand1.evaluate() || this.operand2.evaluate();
            }
        }
    }

    evaluate(): boolean {
        let val: boolean = this.evaluateCondition();
        return this.model.negated ? !val : val;
    }

    static evaluateModel(model: ComplexConditionModel): boolean {
        let condition = new ComplexCondition(model);
        return condition.evaluate();
    }
}