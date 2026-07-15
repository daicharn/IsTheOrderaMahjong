import {Meld} from "./Meld";

export class Melds {
    melds: Meld[] = [];

    add(meld: Meld){
        this.melds.push(meld);
    }

    get length() {
        return this.melds.length;
    }
}