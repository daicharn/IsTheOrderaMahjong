//役の定義
//1翻役
const YAKU_1 = {
    tanyao: {id : "tanyao", name : "断么九", weight : TEHAI_NUMBER},
    pinfu: {id : "pinfu", name : "平和", weight : TEHAI_NUMBER},
    ipeko: {id : "ipeko", name : "一盃口", weight : 6},
    yakuhai_ton: {id : "yakuhai_ton", name : "東", weight : 3},
    yakuhai_nan: {id : "yakuhai_nan", name : "南", weight : 3},
    yakuhai_sha: {id : "yakuhai_sha", name : "西", weight : 3},
    yakuhai_pei: {id : "yakuhai_pei", name : "北", weight : 3},
    yakuhai_haku: {id : "yakuhai_haku", name : "白", weight : 3},
    yakuhai_hatsu: {id : "yakuhai_hatsu", name : "発", weight : 3},
    yakuhai_chun: {id : "yakuhai_chun", name : "中", weight : 3}
}
//2翻役
const YAKU_2 = {
    chitoi: {id : "chitoi", name : "七対子", weight : TEHAI_NUMBER},
    toitoi: {id : "toitoi", name : "対々和", weight : TEHAI_NUMBER},
    sananko: {id : "sananko", name : "三暗刻", weight : 9},
    doukou: {id : "doukou", name : "三色同刻", weight : 9},
    sanshoku: {id : "sanshoku", name : "三色同順", weight : 9},
    honroto: {id : "honroto", name : "混老頭", weight : TEHAI_NUMBER},
    ikkituukan: {id : "ikkituukan", name : "一気通貫", weight : 9},
    chanta: {id : "chanta", name : "混全帯么九", weight : TEHAI_NUMBER},
    shosangen: {id : "shosangen", name : "小三元", weight : 8},
    sankantsu: {id : "sankantsu", name : "三槓子", weight : 9}
}
//3翻役
const YAKU_3 = {
    honitsu: {id : "honitsu", name : "混一色", weight : TEHAI_NUMBER},
    jyunchan: {id : "jyunchan", name : "純全帯么九", weight : TEHAI_NUMBER},
    ryanpeko: {id : "ryanpeko", name : "二盃口", weight : 12}
}
//6翻役
const YAKU_6 = {
    chinitsu: {id : "chinitsu", name : "清一色", weight : TEHAI_NUMBER}
}
//役満
const YAKUMAN = {
    suanko: {id : "suanko", name : "四暗刻", weight : TEHAI_NUMBER},
    kokushi: {id : "kokushi", name : "国士無双", weight : TEHAI_NUMBER},
    daisangen: {id : "daisangen", name : "大三元", weight : 9},
    shosushi: {id : "shosushi", name : "小四喜", weight : 11},
    daisushi: {id : "daisushi", name : "大四喜", weight : 12},
    tsuiso: {id : "tsuiso", name : "字一色", weight : TEHAI_NUMBER},
    chinroto: {id : "chinroto", name : "清老頭", weight : TEHAI_NUMBER},
    ryuiso: {id : "ryuiso", name : "緑一色", weight : TEHAI_NUMBER},
    churen: {id : "churen", name : "九蓮宝燈", weight : TEHAI_NUMBER},
    sukantsu: {id : "sukantsu", name : "四槓子", weight : 12}
}
//複合役に関する情報の定義を追加
const FUKUGOU_KEY = "fukugou";
//1翻役
YAKU_1.tanyao[FUKUGOU_KEY] = [YAKU_1.pinfu.id, YAKU_1.ipeko.id, 
                              YAKU_2.sanshoku.id, YAKU_2.sananko.id, YAKU_2.chitoi.id, YAKU_2.toitoi.id, YAKU_2.doukou.id, YAKU_2.sankantsu.id,
                              YAKU_3.ryanpeko.id, YAKU_6.chinitsu.id];

//その他定数など
const CHECKBOX_YAKU_NAME = "checkbox_yaku";                             

//役の項目に関する要素を作成
function makeYakuItemDiv(yaku_id, yaku_name){
    let yaku_item_div = document.createElement('div');
    yaku_item_div.className = "yaku_item";
    let label_yaku = document.createElement('span');
    label_yaku.className = "label_yaku";
    label_yaku.innerText = yaku_name;
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.className = CHECKBOX_YAKU_NAME;
    checkbox.id = yaku_id;
    yaku_item_div.appendChild(label_yaku);
    yaku_item_div.appendChild(checkbox);

    return yaku_item_div;
}

//手牌の基盤を生成
for(i = 0; i < TEHAI_NUMBER; i++){
    let div_element = document.createElement('div');
    let img_element = document.createElement('img');
    img_element.src = ScriptCore.generate_pai_src(BACK);
    div_element.className = "tehai_part";
    div_element.appendChild(img_element);
    document.getElementById('tehai').appendChild(div_element);
}

//役の項目に関する要素を役の定義に沿って作成
//1翻役
let yaku_list_1_div = document.getElementById('yaku_list_1');
Object.keys(YAKU_1).forEach(key => yaku_list_1_div.appendChild(makeYakuItemDiv(YAKU_1[key].id, YAKU_1[key].name)));
//2翻役
let yaku_list_2_div = document.getElementById('yaku_list_2');
Object.keys(YAKU_2).forEach(key => yaku_list_2_div.appendChild(makeYakuItemDiv(YAKU_2[key].id, YAKU_2[key].name)));
//3翻役
let yaku_list_3_div = document.getElementById('yaku_list_3');
Object.keys(YAKU_3).forEach(key => yaku_list_3_div.appendChild(makeYakuItemDiv(YAKU_3[key].id, YAKU_3[key].name)));
//6翻役
let yaku_list_6_div = document.getElementById('yaku_list_6');
Object.keys(YAKU_6).forEach(key => yaku_list_6_div.appendChild(makeYakuItemDiv(YAKU_6[key].id, YAKU_6[key].name)));
//役満
let yaku_list_yakuman = document.getElementById('yaku_list_yakuman');
Object.keys(YAKUMAN).forEach(key => yaku_list_yakuman.appendChild(makeYakuItemDiv(YAKUMAN[key].id, YAKUMAN[key].name)));

//チェックボックスのリストを生成
let checkbox_yaku_list = Array.from(document.getElementsByClassName(CHECKBOX_YAKU_NAME));

//役のIDから役の情報を取得
function getYakuInfoFromYakuID(yaku_id){
    let yaku_lists = [YAKU_1, YAKU_2, YAKU_3, YAKU_6, YAKUMAN];
    let yaku_info = "";
    yaku_lists.forEach(yaku_list => {
        if (yaku_list[yaku_id] != undefined) yaku_info = yaku_list[yaku_id];
    });

    return yaku_info;
}

//チェックボックスの状態に応じて他のチェックボックスを制御
function controlCheckBoxes(flg, yaku_id){
    //チェックボックスがONになったとき
    if(flg){
        console.log(getYakuInfoFromYakuID(yaku_id));
    }
    //チェックボックスがOFFになったとき
    else{

    }
}

//チェックボックスのクリック時のイベント追加
checkbox_yaku_list.forEach(checkbox_yaku => {
    checkbox_yaku.addEventListener("change", () => controlCheckBoxes(checkbox_yaku.checked, checkbox_yaku.id));
});