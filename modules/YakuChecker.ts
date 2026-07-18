import {PlayerHand} from './PlayerHand';
import {PlayerContext} from './PlayerContext';
import {BlockHaisList} from './BlockHaisList';
import {BlockDivider} from './BlockDivider';

export class YakuChecker {
    private hand: PlayerHand;
    private ctx: PlayerContext;
    private blockedhaislists: BlockHaisList[];

    constructor(hand: PlayerHand, ctx: PlayerContext){
        this.hand = hand;
        this.ctx = ctx;
        this.blockedhaislists = new BlockDivider([...this.hand.tehai.hais]).divide();
    }

    get blockedhais(): BlockHaisList[]{
        return this.blockedhaislists;
    }
    
}