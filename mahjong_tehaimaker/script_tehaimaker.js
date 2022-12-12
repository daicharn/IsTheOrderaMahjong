//役の定義
//1翻役
const YAKU_1 = {
    tanyao: {value : 0, name : "断么九"},
    pinfu: {value : 1, name : "平和"},
    ipeko: {value : 2, name : "一盃口"},
    yakuhai_ton: {value : 3, name : "東"},
    yakuhai_nan: {value : 4, name : "南"},
    yakuhai_sha: {value : 5, name : "西"},
    yakuhai_pei: {value : 6, name : "北"},
    yakuhai_haku: {value : 7, name : "白"},
    yakuhai_hatsu: {value : 8, name : "発"},
    yakuhai_chun: {value : 9, name : "中"}
}

//役の項目に関する要素を作成
function makeYakuItemDiv(yaku_name){
    let yaku_item_div = document.createElement('div');
    yaku_item_div.className = "yaku_item";
    let label_yaku = document.createElement('label');
    label_yaku.className = "label_yaku";
    label_yaku.innerText = yaku_name;
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.className = "checkbox_yaku";
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
Object.keys(YAKU_1).forEach(key => yaku_list_1_div.appendChild(makeYakuItemDiv(YAKU_1[key].name)));