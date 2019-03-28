import { ScriptInstructionModel } from "tgs-model";
import { GameContext } from "./game-context.class";
import { Argument } from "./argument.class";

export class Assignation {

    static execute(model: ScriptInstructionModel) {

        let arg = model.value ? new Argument(model.value) : null;
        let variableValue: any = GameContext.getVariable(model.variableName, false);

        switch (model.assignationOperator) {
            case "equals":
                GameContext.setVariable(model.variableName, arg.value);
                break;

            case "equalsNoOverride":
                if (variableValue === undefined) {
                    GameContext.setVariable(model.variableName, arg.value);
                }
                break;

            case "increments":
                GameContext.setVariable(model.variableName, variableValue + 1);
                break;

            case "decrements":
                GameContext.setVariable(model.variableName, variableValue - 1);
                break;

            case "adds":
                GameContext.setVariable(model.variableName, variableValue + arg.value);
                break;

            case "deletes":
                GameContext.setVariable(model.variableName, variableValue - arg.value);
                break;

            default:
                console.warn("Unkown assignation operator: " + model.assignationOperator);
        }
    }
}