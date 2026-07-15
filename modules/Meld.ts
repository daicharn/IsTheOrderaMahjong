import {Hai} from './Hai';
import { MeldType } from './MahjongConsts';

export class Meld {
    hais: Hai[];
    type: MeldType;

    constructor(hais: Hai[], type: MeldType){
        this.hais = hais;
        this.type = type;
    }
}