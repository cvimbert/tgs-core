import { GameConfiguration } from "./data-interfaces/game-configuration.interface";
import { SequenceItem } from "./data-interfaces/sequence-item.interface";
import { GameSequence } from "./game-sequence.class";
import { TGSParser, ParsingResult } from "tgs-parser";
import { MainStructure } from "tgs-model";
import { GameContext } from "./game-context.class";
import { LogItem } from './data-interfaces/log-item.interface';
import { GameMode } from './game-mode.enum';
import { SequenceItemType } from './data-interfaces/sequence-item-type.enum';

export class GameManager {

  protected parser: TGSParser = new TGSParser();

  currentSequence: GameSequence;
  sequence: GameSequence;

  loading: boolean = false;

  constructor(
    public configuration: GameConfiguration = null
  ) {}

  init() {
    this.initGame(GameContext.init());
  }

  initGame(alreadyLaunched: boolean) {
    // Deux cas possible
    // 1- Pas de partie lancée
    // dans ce cas on crée une sauvegarde vide
    // 2- Une partie est déjà lancée
    // dans ce cas, on chargé les données de la séquence en cours, pour initialisation dans ce contexte

    if (alreadyLaunched && this.mode === GameMode.NORMAL) {
      console.log("On a des données");
      this.loadGameFromSave();
    } else {
      console.log("Pas de données");
      this.newGame();
    }
  }

  registerSequence(path: string) {

    // this.getFolderContent("path");

    var sequences = this.getRegisteredSequencesList();

    if (sequences.indexOf(path) === -1) {
      // le path n'a jamais été visité

      sequences.push(path);
      localStorage.setItem("sequences", JSON.stringify(sequences));
    }
  }

  getRegisteredSequencesList(): string[] {
    let sequencesStr: string = localStorage.getItem("sequences");
    
    if (!sequencesStr || sequencesStr === "") {
      return [];
    } else {
      return JSON.parse(sequencesStr);
    }
  }

  getFolderContent(path: string): SequenceItem[] {

    //console.log("get folder content");

    let items: SequenceItem[] = [];

    this.getRegisteredSequencesList().forEach(sequencePath => {

      //console.log("path", sequencePath);

      let index = sequencePath.lastIndexOf("/");
      let baseName = sequencePath.substr(index + 1);
      let folder = sequencePath.substring(0, index);

      //console.log ("basename", baseName, "fold", folder);

      if (folder.indexOf(path) === 0) {
        // c'est un élément dans le dossier requis
        let after = folder.substr(path.length);

        if (after === "") {
          // fichier
          items.push({
            name: baseName,
            type: SequenceItemType.FILE
          });
        } else {
          // dossier
          let sindex = after.indexOf("/");
          let sfolder = sindex !== -1 ? after.substring(0, sindex) : after;

          let unique = true;

          for (let item of items) {
            if (item.type === SequenceItemType.FOLDER && item.name === sfolder) {
              unique = false;
              break;
            }
          }

          if (unique) {
            items.push({
              name: sfolder,
              type: SequenceItemType.FOLDER
            });
          }
        }

        //console.log("ici", after);
      }
    });

    // console.log("items", items);
    return items;
  }

  get logs(): LogItem[] {
    return GameContext.currentLogs;
  }

  set mode(value: string) {
    GameContext.displayMode = value;
  }

  get mode(): string {
    return GameContext.displayMode;
  }

  deleteLog(logIndex: number) {
    GameContext.currentLogs.splice(logIndex, 1);
    GameContext.save();
  }

  clearLogs() {
    GameContext.currentLogs.length = 0;
    GameContext.save();
  }

  newGame() {
    this.loadFile(this.configuration.rootSequence).then(sequence => {
      sequence.init(this.configuration.rootSequence);
      this.currentSequence = this.sequence;
    });
  }

  loadSequence(sequenceId: string, blockId: string) {
    this.loadFile(sequenceId).then(sequence => {
      sequence.init(sequenceId, blockId);
      this.currentSequence = this.sequence;
    });
  }

  loadGameFromSave() {
    //console.log(GameContext.dataSaver.currentStep);

    // l'extraction des variables ne doit pas être fait ici, mais à chaque step
    GameContext.extractVariables();
    
    let sequenceId: string = GameContext.dataSaver.currentStep.sequenceId;
    this.loadFile(sequenceId).then(sequence => {
      sequence.initFromSave(GameContext.dataSaver.currentStep, GameContext.dataSaver.steps.length - 1);
      this.currentSequence = this.sequence;
    });
  }

  resetGame() {
    //console.log("game reset");
    GameContext.clearGame();
    this.newGame();
  }

  refreshGame() {
    // un peu brutal, mais bon...
    this.loadGameFromSave();
  }

  goBack() {
    GameContext.dataSaver.removeLast();
    this.initGame(GameContext.init());
  }

  getVariables(): {[key: string]: any} {
    return GameContext.getCurrentVariables();
  }

  setVariable(name: string, value: any, forcedType: string = null) {
    GameContext.setVariable(name, value, forcedType);
  }

  loadFile(path: string): Promise<GameSequence> {

    this.loading = true;

    return new Promise<GameSequence>((success: Function) => {

      let assetsFolder: string = this.configuration.assetsFolder || "";

      this.parser.loadTGSFile(assetsFolder + "tgs/" + path + ".tgs").then((resp: ParsingResult) => {
        let structure: MainStructure = MainStructure.loadFromParsingResult(resp);
        this.sequence = new GameSequence(structure, this);
        this.loading = false;
        success(this.sequence);
      });
    });
  }
}