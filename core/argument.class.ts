import { ArgumentModel, ArgumentType } from "tgs-model";
import { GameContext } from "./game-context.class";
import { FunctionObject } from "./function-object.class";

export class Argument {

  constructor(
    public model: ArgumentModel
  ) {}

  get value(): any {
    if (this.model.type === ArgumentType.VARIABLE) {
      return GameContext.getVariable(this.model.variableName);
    } else if (this.model.type === ArgumentType.FUNCTION) {
      let func = new FunctionObject(this.model.function);
      return func.execute();
    }

    return this.model.value;
  }

  get variableName(): string {
    return this.model.variableName;
  }
}
