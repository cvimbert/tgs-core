import { ScriptModel } from "tgs-model";
import { Instruction } from "./instruction.class";

export class Script {

  instructions: Instruction[];

  constructor(
    model: ScriptModel
  ) {
    this.instructions = model.instructions.map(instructionModel => new Instruction(instructionModel));
  }

  execute() {
    this.instructions.forEach(instruction => instruction.execute());
  }
}
