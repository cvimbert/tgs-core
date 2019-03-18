import { ArgumentModel, ArgumentType } from "tgs-model";
import { GameContext } from "./game-context.class";

export class Argument {

  constructor(
    public model: ArgumentModel
  ) {}

  get value(): any {
    if (this.model.type === ArgumentType.VARIABLE) {
      return GameContext.getVariable(this.model.variableName);
    }

    return this.model.value;
  }

  get variableName(): string {
    return this.model.variableName;
  }
}
