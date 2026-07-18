import {BlockHais} from './BlockHais';

export class BlockHaisList {
    private blocks: BlockHais[] = [];

    constructor(blocks: BlockHais[] = []) {
        this.blocks = blocks;
    }

    [Symbol.iterator]() { return this.blocks[Symbol.iterator](); }
    push(b: BlockHais) {
         this.blocks.push(b);
    }
    pop() { 
        return this.blocks.pop(); 
    }
    length() {
        return this.blocks.length;
    }

    count(type: BlockHais["type"]): number{
        return this.blocks.filter(b => b.type == type).length;
    }

    isStandardHand(mentsu: number){
        return this.count("JANTO") === 1 && (this.count("KOTSU") + this.count("SHUNTSU")) === mentsu;
    }

    blockToString(): string {
        return this.blocks.map(b => `[${b.ids.map(h => h.id).join(",")}]`).join(",");
    }

    clone(): BlockHaisList {
        return new BlockHaisList(this.blocks.map(b => b.clone()));
    }
}