import { MainStructure, GameBlockModel, GameBlockLineModel, BlockLineType, LinkModel, ConditionModel } from 'tgs-model'
import { SequenceStructure } from './data-interfaces/sequence-structure.interface';
import { Condition } from './condition.class';
import { GameContext } from './game-context.class';
import { Script } from './script.class';
import { TextUnit } from './data-interfaces/text-unit.interface';
import { GameStep } from './saver/interfaces/game-step.interface';
import { SequenceStep } from './saver/interfaces/sequence-step.interface';
import { GameManager } from './game-manager.class';

export class GameSequence {

  scripts: {[key: string]: Script} = {};
  conditions: {[key: string]: Condition} = {};

  units: TextUnit[][] = [];
  links: LinkModel[];

  constructor(
    public structureData: MainStructure,
    private manager: GameManager
  ) {
    for (let key in structureData.scripts) {
      this.scripts[key] = new Script(structureData.scripts[key]);
    }

    for (let key in structureData.conditions) {
      this.conditions[key] = new Condition(structureData.conditions[key]);
    }
  }

  init(sequenceId: string, blockId?: string) {
    // on devra peut-être attendre que le contexte soit correctement initialisé
    GameContext.onSequenceLoaded(sequenceId);

    // différencier init et firstUse ??
    if (this.scripts["init"]) {
      this.scripts["init"].execute();
    }

    this.loadBlock(blockId || this.structureData.entryBlockId);
  }

  loadBlock(blockId: string) {
    
    GameContext.onBlockLoaded(blockId);

    let block: GameBlockModel = this.structureData.blocks[blockId];

    // execution des scripts locaux, à voir si on les éxécute toujours
    this.executeBlockScript(block, "init");
    this.executeBlockScript(block, "head");
    
    let links: LinkModel[] = this.getBlockLinks(block.links);
    this.units.push(this.getTextUnits(block.lines));
     
    this.links = links || [];
    
    GameContext.save();

    if (block.redirections) {
      // on teste les conditions de redirection une à une, en executant la premère valable

      for (let redirection of block.redirections) {
        if (redirection.condition) {
          let condition = new Condition(redirection.condition);

          if (condition.evaluate()) {
            this.loadBlock(redirection.localLinkRef);
            break;
          }
        } else {
          this.loadBlock(redirection.localLinkRef);
          break;
        }
      }
    }
    //console.log("sequence", this.sequence);
  }

  navigateToSequence(sequenceId: string, blockId: string) {
    this.manager.loadSequence(sequenceId, blockId);
  }

  executeBlockScript(block: GameBlockModel, scriptId: string) {
    if (block.scripts && block.scripts[scriptId]) {
      let script: Script = new Script(block.scripts[scriptId]);
      script.execute();
    }
  }

  executeScript(scriptId: string) {
    if (this.scripts[scriptId]) {
      this.scripts[scriptId].execute();
    } else {
      console.warn(`No script named "${scriptId}" to execute.`);
    }
  }

  evaluateConditionById(conditionId: string): boolean {
    if (this.conditions[conditionId]) {
      return this.conditions[conditionId].evaluate();
    } else {
      console.warn(`No condition named "${conditionId}" to execute.`);
    }
  }

  initFromSave(step: GameStep) {
    //console.log("step to reconstitute", step);

    step.steps.forEach((sequenceStep: SequenceStep, index: number) => {

      if (index === step.steps.length - 1) {
        this.links = this.getLinks(sequenceStep.blockId) || [];

        let block: GameBlockModel = this.structureData.blocks[sequenceStep.blockId];

        this.executeBlockScript(block, "head");
      }

      this.units.push(this.getBlocks(sequenceStep.blockId));
    });
  }

  getBlocks(blockId: string): TextUnit[] {
    let block: GameBlockModel = this.structureData.blocks[blockId];
    return this.getTextUnits(block.lines);
  }

  getLinks(blockId: string): LinkModel[] {
    let block: GameBlockModel = this.structureData.blocks[blockId];
    return this.getBlockLinks(block.links);
  }

  getTextUnits(lines: GameBlockLineModel[]): TextUnit[] {
    let units: TextUnit[] = [];

    lines.forEach(line => {

      let unit: TextUnit = {
        styles: line.formats,
        textType: line.type
      };

      switch(line.type) {
        case BlockLineType.SIMPLE:
          unit.text = this.replaceVariables(line.text);
          units.push(unit);
          break;

        case BlockLineType.COMPLEX:
          if (this.evaluateCondition(line.condition)) {
            unit.units = this.getTextUnits(line.lines);
            units.push(unit);
          }

          break;

        case BlockLineType.TAG:
          unit.tag = line.tag;
          units.push(unit);
          break;

        case BlockLineType.PARAGRAPH_SEPARATOR:
        case BlockLineType.LINE_BREAK:
          units.push(unit);
          break;
      }
    });

    return units;
  }

  replaceVariables(text: string): string {
    let exp = /%([A-Za-z0-9.]+)%/;
    let res: RegExpExecArray;

    while(res = exp.exec(text)) {
      let varName: string = res[1];
      let replacement: any = GameContext.getVariable(varName);
      text = text.replace(res[0], replacement);
      //console.log(res);
    }

    //console.log(text);
    return text;
  }

  evaluateCondition(model: ConditionModel): boolean {
    //console.log(model)
    if (!model) {
      return true;
    } else {
      return Condition.evaluateInContext(model);
    }
  }

  getBlockLinks(blockLinks: LinkModel[]): LinkModel[] {
    let links: LinkModel[] = [];

    if (blockLinks) {
      return blockLinks.filter(link => this.evaluateCondition(link.condition));
    }

    return links;
  }
}
