import { MainStructure, GameBlockModel, GameBlockLineModel, BlockLineType, LinkModel, ConditionModel } from 'tgs-model'
import { SequenceStructure } from './data-interfaces/sequence-structure.interface';
import { Condition } from './condition.class';
import { GameContext } from './game-context.class';
import { Script } from './script.class';
import { TextUnit } from './data-interfaces/text-unit.interface';

export class GameSequence {

  PARAGRAPH_SEPARATOR = "---";

  scripts: {[key: string]: Script} = {};
  styleStack: string[] = [];

  sequence: SequenceStructure = {
    paragraphs: [],
    links: []
  };

  units: TextUnit[][] = [];

  constructor(
    public structureData: MainStructure
  ) {
    for (let key in structureData.scripts) {
      this.scripts[key] = new Script(structureData.scripts[key]);
    }
  }

  init(sequenceId: string, fromSave: boolean = false) {
    // on devra peut-être attendre que le contexte soit correctement initialisé
    GameContext.onSequenceLoaded(sequenceId);

    if (this.scripts["init"]) {
      this.scripts["init"].execute();
    }

    

    this.loadBlock(this.structureData.entryBlockId);
  }

  loadBlock(blockId: string) {
    
    GameContext.onBlockLoaded(blockId);

    let block: GameBlockModel = this.structureData.blocks[blockId];
    let links: LinkModel[] = this.getBlockLinks(block.links);

    this.units.push(this.getTextUnits(block.lines));

    // execution des scripts locaux
    if (block.scripts && block.scripts["start"]) {
      let script: Script = new Script(block.scripts["start"]);
      script.execute();
    }

    // if pas utile
    if (links) {
      this.sequence.links = links;
    } else {
      this.sequence.links = [];
    }
    
    GameContext.save();
    //console.log("sequence", this.sequence);
  }

  getTextUnits(lines: GameBlockLineModel[]): TextUnit[] {
    let units: TextUnit[] = [];

    lines.forEach(line => {

      let unit: TextUnit = {
        styles: line.formats
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
