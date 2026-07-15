import { Hai } from './Hai';
import { Hais } from './Hais';
import {PlayerHand} from './PlayerHand';
import {PlayerContext} from './PlayerContext';
import {BlockHais} from './BlockHais';

export class YakuChecker {
    hand: PlayerHand;
    ctx: PlayerContext;

    constructor(hand: PlayerHand, ctx: PlayerContext){
        this.hand = hand;
        this.ctx = ctx;
    }

    private removeHai(arr: Hai[], target: Hai) {
        const idx = arr.findIndex(h => h.id === target.id);
        if(idx !== -1) arr.splice(idx, 1);
    }

    private countBlocks(blocks: BlockHais[], janto_arg: number, mentsu_arg: number): boolean{
        let janto = 0;
        let mentsu = 0;

        for (const b of blocks) {
            if (b.type === "JANTO") janto++;
            if (b.type === "KOTSU") mentsu++;
            if (b.type === "SHUNTSU") mentsu++;
        }

        if(janto === janto_arg && mentsu === mentsu_arg) return true;

        return false;
    }

    private dedupeBlockHais(blockhais: BlockHais[][]): BlockHais[][]{
        const order = {"JANTO": 0, "KOTSU": 1, "SHUNTSU": 2};
        const normalize = (blocks: BlockHais[]): string =>{
            const sorted = [...blocks].sort((a, b) => {
                const t = order[a.type] - order[b.type];
                if(t !== 0) return t;

                const aMin = Math.min(...a.ids.map(h => h.id));
                const bMin = Math.min(...b.ids.map(h => h.id));

                return aMin - bMin;
            });

            return sorted.map(b => `${b.type}:${b.ids.map(h => h.id).join(",")}`).join("|");
        }
        
        const unique = new Map<string, BlockHais[]>();
        for(const blocks of blockhais){
            const key = normalize(blocks);
            if(!unique.has(key)){
                unique.set(key, blocks);
            }
        }

        return [...unique.values()];
    }

    testToBlocks(): BlockHais[][]{
        return this.toBlocks([...this.hand.tehai.hais]);
    } 

    toBlocks(hais: Hai[]): BlockHais[][]{
        const results: BlockHais[][] = [];
        const arr_hai: Hai[] = [...hais].sort((a, b) => a.id - b.id);
        const blockhais: BlockHais[] = [];

        const dfs = (arr: Hai[], blocks: BlockHais[]) => {
            if(arr.length === 0 && this.countBlocks(blocks, 1, 4)){
                results.push([...blocks]);
                return;
            }

            for(let j = 0; j < arr.length; j++){
                const first = arr[j];

                //刻子の処理
                if(arr.filter(h => h.id === first.id).length >= 3){
                    const next = arr.slice();
                    this.removeHai(next, first);
                    this.removeHai(next, first);
                    this.removeHai(next, first);

                    blocks.push(new BlockHais("KOTSU", [first, first, first]));
                    dfs(next, blocks);
                    blocks.pop();
                }
                //順子の処理
                if(first.isNumberTile() && first.num <= 7){
                    const id1 = first.id + 1;
                    const id2 = first.id + 2;

                    const h1 = arr.find(h => h.id === id1);
                    const h2 = arr.find(h => h.id === id2);

                    if(h1 && h2){
                        const next = arr.slice();
                        this.removeHai(next, first);
                        this.removeHai(next, h1);
                        this.removeHai(next, h2);

                        blocks.push(new BlockHais("SHUNTSU", [first, h1, h2]));
                        dfs(next, blocks);
                        blocks.pop();
                    }
                }
            }
        };

        for(let i = 0; i < arr_hai.length; i++){
            const first = arr_hai[i];

            if(i > 0 && arr_hai[i].id === arr_hai[i - 1].id) continue;

            //雀頭の処理
            if(arr_hai.filter(h => h.id === first.id).length >= 2){
                const next = arr_hai.slice();
                this.removeHai(next, first);
                this.removeHai(next, first);

                blockhais.push(new BlockHais("JANTO", [first, first]));
                dfs(next, blockhais);
                blockhais.pop();
            }
        }

        return this.dedupeBlockHais(results);
    }
    
}