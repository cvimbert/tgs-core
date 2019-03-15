import { ScriptModel, ScriptInstructionModel, ScriptInstructionType } from "tgs-model";
import { GameContext } from "./game-context.class";
import { Condition } from "./condition.class";
import { Instruction } from "./instruction.class";

export class Script {

  instructions: Instruction[];

  constructor(
    private model: ScriptModel
  ) {}

  execute() {
    this.executeInstructions(this.model.instructions);
  }

  executeInstructions(models: ScriptInstructionModel[]) {
    models.forEach(model => this.executeInstruction(model));
  }

  executeInstruction(instructionModel: ScriptInstructionModel) {

  }


}
