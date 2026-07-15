import {Hais} from './Hais';
import {Melds} from './Melds';

export class PlayerHand {
    tehai: Hais;
    furo: Melds;

    constructor(tehai: Hais, furo: Melds){
        this.tehai = tehai;
        this.furo = furo;
    }
}