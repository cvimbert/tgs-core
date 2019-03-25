import { GameConfiguration } from "./data-interfaces/game-configuration.interface";
import { GameSequence } from "./game-sequence.class";
import { TGSParser, ParsingResult } from "tgs-parser";
import { MainStructure } from "tgs-model";
import { GameContext } from "./game-context.class";
import { SequenceStructure } from "./data-interfaces/sequence-structure.interface";

export class GameManager {

    currentSequence: GameSequence;
    sequence: GameSequence;
    structure: SequenceStructure;

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

      } else {

      }

    }

    loadFile(path: string): Promise<GameSequence> {

        return new Promise<GameSequence>((success: Function) => {

          let parser: TGSParser = new TGSParser();

          let assetsFolder: string = this.configuration.assetsFolder || "";

          parser.loadTGSFile(assetsFolder + "tgs/" + path + ".tgs").then((resp: ParsingResult) => {
            let structure: MainStructure = MainStructure.loadFromParsingResult(resp);
            let sequence = new GameSequence(structure);
            sequence.init(path);
            this.currentSequence = sequence;
            success(sequence);
          });
        });
      }
}