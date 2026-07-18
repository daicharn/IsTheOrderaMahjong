import {Hai} from "./Hai";

export class BlockHais {
    type: "JANTO" | "KOTSU" | "SHUNTSU";
    ids: Hai[]

    constructor(type: "JANTO" | "KOTSU" | "SHUNTSU", ids: Hai[]){
        this.type = type;
        this.ids = ids;
    }

    clone(): BlockHais {
        return new BlockHais(this.type, this.ids.map(h => h.clone()));
    }
}