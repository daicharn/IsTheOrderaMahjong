import {MANZU, PINZU, SOUZU, JIHAI, BACK} from "./tileDefs";

export class Hai{
    id: number;

    constructor(id: number){
        this.id = id;
    }

    get type(): string{
        if(MANZU.includes(this.id)) return "MANZU";
        if(PINZU.includes(this.id)) return "PINZU";
        if(SOUZU.includes(this.id)) return "SOUZU";
        if(JIHAI.includes(this.id)) return "JIHAI";
        return "BACK";
    }

    get num(): number{
        if(this.type == "MANZU") return this.id;
        if(this.type == "PINZU") return this.id - 9;
        if(this.type == "SOUZU") return this.id - 18;
        if(this.type == "JIHAI") return this.id - 27;
        return BACK;
    }

    get imageUrl(): string{
        let base: string = "../images/";
        //萬子
        if(this.type === "MANZU") return `${base}m_${this.num}.png`;
        //筒子
        if(this.type === "PINZU") return `${base}p_${this.num}.png`;
        //索子
        if(this.type === "SOUZU") return `${base}s_${this.num}.png`;
        //字牌
        if(this.type === "JIHAI") return `${base}j_${this.num}.png`;
        
        return `${base}back.png`;
    }

    isNumberTile(): boolean {
        return this.type == "MANZU" || this.type === "PINZU" || this.type === "SOUZU";
    }
}