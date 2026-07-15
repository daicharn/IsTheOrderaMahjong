import {MANZU, PINZU, SOUZU, JIHAI, BACK} from "./tileDefs";
import {Hais} from "./Hais";
import { PlayerHand } from "./PlayerHand";
import { Melds } from "./Melds";
import { PlayerContext } from "./PlayerContext";
import { YakuChecker } from "./YakuChecker";
import { BlockHais } from "./BlockHais";

const hand = new PlayerHand(new Hais([1,1,1,1,2,2,2,2,3,3,3,3,4,4]), new Melds());
const ctx = new PlayerContext({isTsumo: false, isMenzen: false, playerWind: "E", roundWind: "E"});
const yaku = new YakuChecker(hand, ctx);
const blocks: BlockHais[][] = yaku.testToBlocks();
for(let i = 0; i < blocks.length; i++){
    console.log("--------------------------------------------");
    for(let j = 0; j < blocks[i].length; j++){
        console.log("type:", blocks[i][j].type, ", ids:", blocks[i][j].ids)
    }
    console.log("--------------------------------------------");
}