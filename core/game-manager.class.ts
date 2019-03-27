import { GameConfiguration } from "./data-interfaces/game-configuration.interface";
import { GameSequence } from "./game-sequence.class";
import { TGSParser, ParsingResult } from "tgs-parser";
import { MainStructure } from "tgs-model";
import { GameContext } from "./game-context.class";

export class GameManager {

  private parser: TGSParser = new TGSParser();

  currentSequence: GameSequence;
  sequence: GameSequence;

  loading: boolean = false;

  constructor(
    public configuration: GameConfiguration = null
  ) {
    this.initGame(GameContext.init());
  }

  initGame(alreadyLaunched: boolean) {
    // Deux cas possible
    // 1- Pas de partie lancée
    // dans ce cas on crée une sauvegarde vide
    // 2- Une partie est déjà lancée
    // dans ce cas, on chargé les données de la séquence en cours, pour initialisation dans ce contexte

    if (alreadyLaunched) {
      console.log("On a des données");
      this.loadGameFromSave();
    } else {
      console.log("Pas de données");
      this.newGame();
    }
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
    GameContext.extractVariables();
    let sequenceId: string = GameContext.dataSaver.currentStep.sequenceId;
    this.loadFile(sequenceId).then(sequence => {
      sequence.initFromSave(GameContext.dataSaver.currentStep);
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

  getVariables(): {[key: string]: any} {
    return GameContext.variablesStore;
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