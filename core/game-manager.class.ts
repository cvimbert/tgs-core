import { GameConfiguration } from "./data-interfaces/game-configuration.interface";
import { GameSequence } from "./game-sequence.class";
import { TGSParser, ParsingResult } from "tgs-parser";
import { MainStructure } from "tgs-model";
import { GameContext } from "./game-context.class";
import { SequenceStructure } from "./data-interfaces/sequence-structure.interface";

export class GameManager {

  private parser: TGSParser = new TGSParser();

  currentSequence: GameSequence;
  sequence: GameSequence;
  structure: SequenceStructure;

  loading: boolean = false;

  constructor(
    public configuration: GameConfiguration = null
  ) {
    this.initGame(GameContext.init());
  }

  initGame(alreadyLaunched: boolean) {
    // deux cas possible
    // 1- Pas de partie lançée
    // dans ce cas on crée une sauvegarde vide
    // 2- Une partie est séjà lancée
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
    this.loadFile(this.configuration.rootSequence);
  }

  loadGameFromSave() {
    console.log(GameContext.dataSaver.currentStep);
  }

  loadFile(path: string): Promise<GameSequence> {

    this.loading = true;

    return new Promise<GameSequence>((success: Function) => {

      let assetsFolder: string = this.configuration.assetsFolder || "";

      this.parser.loadTGSFile(assetsFolder + "tgs/" + path + ".tgs").then((resp: ParsingResult) => {
        let structure: MainStructure = MainStructure.loadFromParsingResult(resp);
        this.sequence = new GameSequence(structure);
        this.sequence.init(path);
        this.structure = this.sequence.sequence;

        this.currentSequence = this.sequence;
        success(this.sequence);

        this.loading = false;
      });
    });
  }
}