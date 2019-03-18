import { MainStructure, GameBlockModel, GameBlockLineModel, BlockLineType, LinkModel, ConditionModel } from 'tgs-model'
import { SequenceStructure } from './data-interfaces/sequence-structure.interface';
import { Condition } from './condition.class';
import { GameContext } from './game-context.class';
import { Script } from './script.class';

export class GameSequence {

  PARAGRAPH_SEPARATOR = "---";

  scripts: {[key: string]: Script} = {};
  styleStack: string[] = [];

  sequence: SequenceStructure = {
    paragraphs: [],
    links: []
  };

  constructor(
    public structureData: MainStructure
  ) {
    // pour debug
    GameContext.addDebugConditions();
    GameContext.addDebugVariables();

    for (let key in structureData.scripts) {
      this.scripts[key] = new Script(structureData.scripts[key]);
    }
  }

  init() {
    this.loadBlock(this.structureData.entryBlockId);

    // on devra peut-être attrendre que le contexte soit correctement initialisé
    if (this.scripts["start"]) {
      this.scripts["start"].execute();
    }
  }

  loadBlock(blockId: string) {

    let block: GameBlockModel = this.structureData.blocks[blockId];

    let lines: string[] = this.getBlockTextLines(block.lines);
    //console.log("lines", lines);

    let paragraphs: string[] = this.stringsToParagraphs(lines);
    this.sequence.paragraphs.push(paragraphs);
    //console.log("paragraphs", this.sequence.paragraphs);

    let links: LinkModel[] = this.getBlockLinks(block.links);

    // if pas utile
    if (links) {
      this.sequence.links = links;
    } else {
      this.sequence.links = [];
    }

    //console.log("sequence", this.sequence);
  }

  getBlockTextLines(lines: GameBlockLineModel[]): string[] {
    let texts: string[] = [];

    lines.forEach(line => {
      switch(line.type) {
        case BlockLineType.SIMPLE:
          texts.push(line.text);
          break;

        case BlockLineType.COMPLEX:
          if (this.evaluateCondition(line.condition)) {
            texts.push(...this.getBlockTextLines(line.lines));
          }

          break;

        case BlockLineType.FORMAT_OPENER:
          this.styleStack.push(line.format);
          console.log("stack", this.styleStack);
          break;

        case BlockLineType.FORMAT_CLOSER:
          let index: number = this.styleStack.lastIndexOf(line.format);

          if (index !== -1) {
            this.styleStack.splice(index, 1);
            console.log("stack", this.styleStack);
          }

          break;
      }
    });

    return texts;
  }

  getStyleStack(): string[] {
    return this.styleStack.slice();
  }

  getClasses(): string {

    let styles: string = "";

    this.styleStack.forEach((styleName: string, index: number) => {
      styles += styleName;

      if (index < this.styleStack.length - 1) {
        styles += "";
      }
    });

    return styles;
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

  addString(added: string, addedTo: string): string {
    return (addedTo === "") ? added : (addedTo + " " + added);
  }

  stringsToParagraphs(texts: string[]): string[] {
    let paragraphs: string[] = [];
    let currentLine = "";

    for (let i: number = 0; i < texts.length; i++) {
      if (i < texts.length - 1) {
        if (texts[i + 1] !== this.PARAGRAPH_SEPARATOR) {
          currentLine = this.addString(texts[i], currentLine);
        } else if (texts[i + 1] === this.PARAGRAPH_SEPARATOR)  {
          paragraphs.push(this.addString(texts[i], currentLine));
          currentLine = "";
          i++;
        }
      }
      else {
        if (texts[i] != this.PARAGRAPH_SEPARATOR) {
          currentLine = this.addString(texts[i], currentLine);
        }
      }
    }

    if (currentLine !== "") {
      paragraphs.push(currentLine);
    }

    return paragraphs;
  }
}
