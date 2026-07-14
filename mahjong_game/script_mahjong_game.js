//右クリックを禁止
//window.addEventListener('contextmenu', function(e) { e.preventDefault(); });

//牌の種類数
const PAI_TYPE_NUM = 34;
//王牌の数
const WANPAI_NUM = 14;

//牌の種類
const Hai_Type = {
    manzu : 0,
    pinzu : 1,
    souzu : 2,
    jihai : 3
}

//プレイヤーとCOMの定義
const Player_List = {
    player : 0,
    com1 : 1,
    com2 : 2,
    com3 : 3
}

//COMの数
const Com_Num = {
    one : 0,
    two : 1,
    three : 2
}

//親を記憶する変数
let parent_num = 0;

//牌山のリスト
let haiyama_list = [];
//王牌のリスト
let wanpai_list = [];

//プレイヤーの手牌
let tehai_player_list = [];
//COM1の手牌
let tehai_com1_list = [];
//COM2の手牌
let tehai_com2_list = [];
//COM3の手牌
let tehai_com3_list = [];

//プレイモード（コンピュータの数）
let play_mode = Com_Num.one;

//親決め
parent_num = decideParent(play_mode);
//初期化
initProcess();

//初期化処理
function initProcess(){
    //牌山を生成
    haiyama_list = generateHaiyama();
    //王牌を取り出す（14枚）
    wanpai_list = takePaisFromHaiyama(WANPAI_NUM);
    //プレイヤーとCOMに対して配牌を行う
    takePaisToPlayerAndCom(play_mode);
}

//親を決定（COMの数によって処理を変える）
function decideParent(com_num){
    return Math.floor(Math.random() * (com_num + 2));
}

//サイコロを振る
function rollTheDice(){
    return Math.floor(Math.random() * 6) + 1;
}

//牌山のリストを生成
function generateHaiyama(){
    let result_list = [];
    //並び変えられる前の牌山を生成
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        for(let j = 0; j < 4; j++){
            result_list.push(i + 1);
        }
    }
    //牌山をランダムに並び替える
    for(let i = PAI_TYPE_NUM * 4 - 1; i > 0; i--){
        //入れ替える牌を決定
        let j = Math.floor(Math.random() * (i + 1));
        [result_list[i], result_list[j]] = [result_list[j], result_list[i]];
    }

    return result_list;
}

//牌山のリストを文字列に変換
function convertHaiyamaToString(list_arg){
    let result_str = "";
    for(let i = 0; i < list_arg.length; i++){
        //牌の種類を特定する
        let pai_type = Math.floor((list_arg[i] - 1) / 9);
        //牌の値を特定する
        let pai_num = (list_arg[i] - 1) % 9 + 1;
        //牌の種類と値ごとに文字を生成する
        switch(pai_type){
            case Hai_Type.manzu:
                result_str += pai_num.toString() + "m";
                break;
            case Hai_Type.pinzu:
                result_str += pai_num.toString() + "p";
                break;
            case Hai_Type.souzu:
                result_str += pai_num.toString() + "s";
                break;
            case Hai_Type.jihai:
                result_str += pai_num.toString() + "j";
                break;
        }
    }

    return result_str;
}

//文字列をsha512ハッシュ値に変換
async function sha512(str){
    //Convert string to ArrayBuffer
    const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
    //Calculate digest
    const digest = await crypto.subtle.digest('SHA-512', buff);
    //Convert ArrayBuffer to hex string
    return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
}

//牌山から指定した数の牌を取り出す（取り出した牌は牌山のリストから削除され、リストとして返されます）
function takePaisFromHaiyama(num){
    let result_list = [];
    if(num <= haiyama_list.length){
        for(let i = 0; i < num; i++){
            result_list.push(haiyama_list.shift());
        }
    }
    
    return result_list;
}

//プレイヤーおよび指定したモードのCOMの数分に対して配牌を行う
function takePaisToPlayerAndCom(com_num){
    //プレイヤーと指定したCOMの数で山牌を4枚ずつ3回とる
    for(let i = 0; i < 3; i++){
        //プレイヤー
        tehai_player_list = tehai_player_list.concat(takePaisFromHaiyama(4));
        //COM
        switch(com_num){
            case Com_Num.one:
                tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(4));
                break;
            case Com_Num.two:
                tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(4));
                tehai_com2_list = tehai_com2_list.concat(takePaisFromHaiyama(4));
            case Com_Num.three:
                tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(4));
                tehai_com2_list = tehai_com2_list.concat(takePaisFromHaiyama(4));
                tehai_com3_list = tehai_com3_list.concat(takePaisFromHaiyama(4));
        }
    }
    //さらに子は1枚、親は2枚とる
    let take_num_list = new Array(com_num + 2).fill(1);
    take_num_list[parent_num] = 2;
    //プレイヤー
    tehai_player_list = tehai_player_list.concat(takePaisFromHaiyama(take_num_list[Player_List.player]));
    //COM
    switch(com_num){
        case Com_Num.one:
            tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com1]));
            break;
        case Com_Num.two:
            tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com1]));
            tehai_com2_list = tehai_com2_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com2]));
        case Com_Num.three:
            tehai_com1_list = tehai_com1_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com1]));
            tehai_com2_list = tehai_com2_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com2]));
            tehai_com3_list = tehai_com3_list.concat(takePaisFromHaiyama(take_num_list[Player_List.com3]));
    }
}