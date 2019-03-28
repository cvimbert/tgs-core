import { ScriptInstructionModel, ScriptInstructionType } from "tgs-model";
import { Condition } from "./condition.class";
import { Argument } from "./argument.class";
import { GameContext } from "./game-context.class";
import { Assignation } from "./assignation.class";

export class Instruction {

  // dans le cas du if
  instructions: Instruction[];

  // dans le cas d'une commande simple (ou autre, plus tard)
  arguments: Argument[];

  constructor(
    private model: ScriptInstructionModel
  ) {
    if (model.type === ScriptInstructionType.IF) {
      this.instructions = model.instructions.map(instructionModel => new Instruction(instructionModel));
    } else if (model.type === ScriptInstructionType.COMMAND) {
      if (model.commandArguments) {
        this.arguments = model.commandArguments.map(argumentModel => new Argument(argumentModel));
      }
    } else if (model.type === ScriptInstructionType.ASSIGNATION) {
      // rien de particulier à enregistrer, à priori
    }
  }

  execute() {
    switch (this.model.type) {
      case ScriptInstructionType.COMMAND:
        this.executeCommand(this.model);
        break;

      case ScriptInstructionType.IF:
        if (Condition.evaluateInContext(this.model.condition)) {
          this.executeInstructions();
        }
        break;

      case ScriptInstructionType.ASSIGNATION:
        // la classe assignation n'est pas des plus utiles, mais on y gagne en clarté
        Assignation.execute(this.model);
        break;
    }
  }

  executeInstructions() {
    this.instructions.forEach(instruction => instruction.execute());
  }

  executeCommand(model: ScriptInstructionModel) {
    switch (model.commandName) {
      case "log":
        console.log("gamelog:", ...this.arguments.map(argument => argument.value));
        break;

      case "setvar":
        GameContext.setVariable(this.arguments[0].variableName, this.arguments[1].value);
        break;
    }
  }
}
