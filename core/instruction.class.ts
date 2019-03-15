import { ScriptInstructionModel, ScriptInstructionType } from "tgs-model";
import { Condition } from "./condition.class";

export class Instruction {

  constructor(
    private model: ScriptInstructionModel
  ) {}

  // Peut-être pas très utile, à voir
  execute() {
    switch (this.model.type) {
      case ScriptInstructionType.COMMAND:
        this.executeCommand(this.model);
        break;

      case ScriptInstructionType.IF:
        if (Condition.evaluateInContext(this.model.condition)) {
          this.executeInstructions(this.model.instructions);
        }
        break;
    }
  }

  executeInstructions(models: ScriptInstructionModel[]) {
    //models.forEach(model => this.executeInstruction(model));
  }

  executeCommand(model: ScriptInstructionModel) {
    switch (model.commandName) {
      case "log":
        console.log("ok");
        break;
    }
  }
}
