interface UserOptions {
    isTsumo: boolean;
    isMenzen: boolean;
    playerWind: "E" | "S" | "W" | "N";
    roundWind: "E" | "S" | "W" | "N";
    tenho?: boolean;
    chiho?: boolean;
    riichi?: boolean;
    daburii?: boolean;
    ippatsu?: boolean;
    rinshan?: boolean;
    chankan?: boolean;
    haitei?: boolean;
    houtei?: boolean;
}

export class PlayerContext{
    isTsumo: boolean;
    isMenzen: boolean;
    playerWind: "E" | "S" | "W" | "N";
    roundWind: "E" | "S" | "W" | "N";
    tenho: boolean;
    chiho: boolean;
    riichi: boolean;
    daburii: boolean;
    ippatsu: boolean;
    rinshan: boolean;
    chankan: boolean;
    haitei: boolean;
    houtei: boolean;

    constructor(options: UserOptions) {
        this.isTsumo = options.isTsumo;
        this.isMenzen =  options.isMenzen;
        this.playerWind = options.playerWind;
        this.roundWind = options.roundWind;
        this.tenho = options.tenho ?? false;
        this.chiho =  options.chiho ?? false;
        this.riichi =  options.riichi ?? false;
        this.daburii =  options.daburii ?? false;
        this.ippatsu =  options.ippatsu ?? false;
        this.rinshan =  options.rinshan ?? false;
        this.chankan =  options.chankan ?? false;
        this.haitei =  options.haitei ?? false;
        this.houtei =  options.houtei ?? false;
    }
}