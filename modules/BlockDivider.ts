import { Hai } from './Hai';
import {BlockHais} from './BlockHais';
import {BlockHaisList} from './BlockHaisList';

export class BlockDivider{
    private readonly hais: Hai[];

    constructor(hais: Hai[]){
        this.hais = hais.map(h => h.clone());
    }

    private removeHai(arr: Hai[], target: Hai) {
        const idx = arr.findIndex(h => h.id === target.id);
        if(idx !== -1) arr.splice(idx, 1);
    }

    private dedupeBlockHais(blockhaislist: BlockHaisList[]): BlockHaisList[]{
        const order = {"JANTO": 0, "KOTSU": 1, "SHUNTSU": 2};
        const normalize = (blocks: BlockHaisList): string =>{
            const sorted = [...blocks].sort((a, b) => {
                const t = order[a.type] - order[b.type];
                if(t !== 0) return t;

                const aMin = Math.min(...a.ids.map(h => h.id));
                const bMin = Math.min(...b.ids.map(h => h.id));

                return aMin - bMin;
            });

            return sorted.map(b => `${b.type}:${b.ids.map(h => h.id).join(",")}`).join("|");
        }
        
        const unique = new Map<string, BlockHaisList>();
        for(const blocks of blockhaislist){
            const key = normalize(blocks);
            if(!unique.has(key)){
                unique.set(key, blocks);
            }
        }

        return [...unique.values()];
    }

    divide(): BlockHaisList[]{
        const results: BlockHaisList[] = [];
        const arr_hai: Hai[] = this.hais.sort((a, b) => a.id - b.id);
        const blockhaislist: BlockHaisList = new BlockHaisList();

        const dfs = (arr: Hai[], blocks: BlockHaisList) => {
            if(arr.length === 0 && blocks.isStandardHand(Math.floor(arr_hai.length / 3))){
                results.push(blocks.clone());
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

                    blocks.push(new BlockHais("KOTSU", [first.clone(), first.clone(), first.clone()]));
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

                        blocks.push(new BlockHais("SHUNTSU", [first.clone(), h1.clone(), h2.clone()]));
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

                blockhaislist.push(new BlockHais("JANTO", [first.clone(), first.clone()]));
                dfs(next, blockhaislist);
                blockhaislist.pop();
            }
        }

        return this.dedupeBlockHais(results);
    }
}