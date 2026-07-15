import {Hais} from "../modules/Hais";
import { PlayerHand } from "../modules/PlayerHand";
import { Melds } from "../modules/Melds";
import { PlayerContext } from "../modules/PlayerContext";
import { YakuChecker } from "../modules/YakuChecker";
import { BlockHaisList } from "../modules/BlockHaisList";

test("tehai1", () => {
    const hand = new PlayerHand(new Hais([1,1,1,1,2,2,2,2,3,3,3,3,4,4]), new Melds());
    const ctx = new PlayerContext({isTsumo: false, isMenzen: false, playerWind: "E", roundWind: "E"});
    const yaku = new YakuChecker(hand, ctx);
    const blocks: BlockHaisList[] = yaku.testToBlocks();

    const results: string[] = [];
    for(let i = 0; i < blocks.length; i++){
        results.push(blocks[i].blockToString());
    }

    expect(results).toContain("[1,1],[1,2,3],[1,2,3],[2,3,4],[2,3,4]");
    expect(results).toContain("[4,4],[1,1,1],[1,2,3],[2,2,2],[3,3,3]");
    expect(results).toContain("[4,4],[1,2,3],[1,2,3],[1,2,3],[1,2,3]");
});
test("tehai2", () => {
    const hand = new PlayerHand(new Hais([1,1,1,2,2,2,3,3,3,4,4,4,5,5]), new Melds());
    const ctx = new PlayerContext({isTsumo: false, isMenzen: false, playerWind: "E", roundWind: "E"});
    const yaku = new YakuChecker(hand, ctx);
    const blocks: BlockHaisList[] = yaku.testToBlocks();

    const results: string[] = [];
    for(let i = 0; i < blocks.length; i++){
        results.push(blocks[i].blockToString());
    }
    
    expect(results).toContain("[2,2],[1,1,1],[2,3,4],[3,4,5],[3,4,5]");
    expect(results).toContain("[5,5],[1,1,1],[2,2,2],[3,3,3],[4,4,4]");
    expect(results).toContain("[5,5],[1,2,3],[1,2,3],[1,2,3],[4,4,4]");
});
