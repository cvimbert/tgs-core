import { FunctionModel } from "tgs-model";
import { Argument } from "./argument.class";
import { GameContext } from "./game-context.class";

export class FunctionObject {

    args: Argument[] = [];

    constructor(
        private model: FunctionModel
    ) {
        this.args = model.args.map(arg => new Argument(arg));
    }

    execute(): any {

        let val: any;

        switch(this.model.name) {
            case "log":
                let logs = this.args.map(arg => arg.value);
                console.log("Gamelog: ", ...logs);
                GameContext.log(logs);
                break;

            case "rand":
                let max: number = this.args[0].value;
                console.log("rand !!!");
                return Math.floor(Math.random() * max);
        }

        return val;
    }
}