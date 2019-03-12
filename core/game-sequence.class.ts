import { MainStructure, GameBlockModel, GameBlockLineModel, BlockLineType, LinkModel } from 'tgs-model'
import { SequenceStructure } from './data-interfaces/sequence-structure.interface';

export class GameSequence {

  PARAGRAPH_SEPARATOR = "---";

  sequence: SequenceStructure = {
    paragraphs: [],
    links: []
  };

  constructor(
    public structureData: MainStructure
  ) {}

  init() {
    this.loadBlock(this.structureData.entryBlockId);
  }

  loadBlock(blockId: string) {

    let block: GameBlockModel = this.structureData.blocks[blockId];

    let lines: string[] = this.getBlockTextLines(block.lines);
    //console.log("lines", lines);

    let paragraphs: string[] = this.stringsToParagraphs(lines);
    this.sequence.paragraphs.push(...paragraphs);
    //console.log("paragraphs", paragraphs);

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
          // TODO: ici, on a une condition à traiter
          texts.push(...this.getBlockTextLines(line.lines));
          break;
      }
    });

    return texts;
  }

  getBlockLinks(blockLinks: LinkModel[]): LinkModel[] {
    let links: LinkModel[] = [];

    if (blockLinks) {
      blockLinks.forEach(link => {
        // évaluation potentielle de la condition
        links.push(link);
      });
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
