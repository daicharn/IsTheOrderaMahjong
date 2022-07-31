//手配の数
const TEHAI_NUMBER = 14;
//牌の種類数
const PAI_TYPE_NUM = 34;
//同種牌の最大枚数
const PAI_MAX = 4;

//テーブルの縦と横の数
const SELECT_TABLE_ROW = 4;
const SELECT_TABLE_COLUMN = 9;

//牌を数値として定義
const BACK = 100;
const MANZU = [1,2,3,4,5,6,7,8,9];
const PINZU = [10,11,12,13,14,15,16,17,18];
const SOUZU = [19,20,21,22,23,24,25,26,27];
const JIHAI = [28,29,30,31,32,33,34];

//モード
const Mode = {
    normal : 0,
    pong: 1,
    chi: 2,
    ankan: 3,
    minkan: 4,
    tenpai: 5,
    agari: 6
}

//鳴きの種類
const Naki_Type = {
    pong : 0,
    chi : 1,
    ankan : 2,
    minkan : 3
}

//現在の手配の数
let tehai_current = 0;

//テーブル押下時点でのモード
let mode_old = Mode.normal;
//現在のモード
let mode_current = Mode.normal;

//鳴いた牌の種類配列
let naki_pais_list = [];
//鳴きの種類の配列
let naki_type_list = [];

//テーブル上の裏返しにした牌のリスト
let hidden_pais_list = [];

//4枚以上使われている牌のリスト
let max_pais_list = [];

//鳴き牌のイベントの順序
let naki_event_order = [0, 1, 2, 3];

//聴牌時の待ち牌リスト
let machihai_list = [];

//和了時のアガリ牌リスト
let agarihai_list = [];

//前回追加された牌を記憶
let before_addPai = 0;

//鳴きボタンのオブジェクト
let btn_pong = document.getElementById('btn_pong');
let btn_chi = document.getElementById('btn_chi');
let btn_ankan = document.getElementById('btn_ankan');
let btn_minkan = document.getElementById('btn_minkan');
let btn_pong_img = document.getElementById('btn_pong_img');
let btn_chi_img = document.getElementById('btn_chi_img');
let btn_ankan_img = document.getElementById('btn_ankan_img');
let btn_minkan_img = document.getElementById('btn_minkan_img');

//ダイヤログ用のオブジェクト
let modal_noten = document.getElementById('modal_noten');
let modal_noten_body = document.getElementById('modal_noten_body');
let modal_agari = document.getElementById('modal_agari');

//状態テロップの文字を変更
function stateText_change(str){
    let stateText = document.getElementById('state_text');
    stateText.innerHTML = str;
}

//手配のオブジェクトの取得
function get_tehai_obj(num){
    let tehai_div = 'tehai_' + (Math.floor(num)).toString().padStart(2, '0');
    return document.getElementById(tehai_div);
}

//手配の値の取得
function get_tehai_value(num){
    let tehai_value = 'tehai_' + (Math.floor(num)).toString().padStart(2, '0') + "_value";
    return document.getElementById(tehai_value).innerText;
}

//手配の値の設定
function set_tehai_value(i,num){
    let tehai_value = 'tehai_' + (Math.floor(i)).toString().padStart(2, '0') + "_value";
    document.getElementById(tehai_value).innerText = num;
}

//手牌の画像の取得
function get_tehai_img(num){
    let tehai_img = document.getElementById('tehai_' + (Math.floor(num)).toString().padStart(2, '0') + '_image');
    return tehai_img.src;
}
//手牌の画像の設定
function set_tehai_img(i,src){
    let tehai_img = document.getElementById('tehai_' + (Math.floor(i)).toString().padStart(2, '0') + '_image');
    tehai_img.setAttribute('src', src);
}

//指定したテーブルの牌を非表示（裏返しにする）
function hidden_table_pai(num){
    let table_pai = document.getElementById(num).firstChild;
    table_pai.setAttribute('src', generate_pai_src(BACK));
}
//指定したテーブルの牌を表示（表にする）
function visible_table_pai(num){
    let table_pai = document.getElementById(num).firstChild;
    table_pai.setAttribute('src', generate_pai_src(num));   
}

//テーブルの牌すべてを非表示
function hidden_table_pai_all(){
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        hidden_table_pai(i + 1);
    }    
}

//テーブルの牌全てを表示
function visible_table_pai_all(){
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        visible_table_pai(i + 1);
    }
}
//4枚以上使われている牌をテーブルから非表示にする
function hidden_table_pai_max(){
    for(let i = 0; i < max_pais_list.length; i++){
        hidden_table_pai(max_pais_list[i]);
    }
}

//チーで鳴けるかどうかを調べる（既に4枚ある場合は含めないので注意）
function isPossible_chi(num){
    //8以上の牌と字牌の場合は鳴けない
    if(num % SELECT_TABLE_COLUMN == 8 || num % SELECT_TABLE_COLUMN == 0 || (num >= JIHAI[0] && num <= JIHAI[6])){
        return false;
    }
    //対象の牌の右となり2つの牌の数が4枚以上の場合も鳴けない
    else if(count_tehai_pai(num + 1) >= PAI_MAX || count_tehai_pai(num + 2) >= PAI_MAX){
        return false;
    }

    return true;
}

//鳴けない牌を非表示にする（裏返しにする）
function hidden_table_naki(naki_type){
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        //すでに4枚以上で裏返しにされているものは含めない
        if(count_tehai_pai(i + 1) < PAI_MAX){
            //ポンの場合2枚以上あれば非表示
            if(naki_type == Naki_Type.pong){
                if(count_tehai_pai(i + 1) > PAI_MAX - 3){
                    hidden_table_pai(i + 1);
                    hidden_pais_list.push(i + 1);
                }
            }
            //チーの場合、8以上の牌と字牌も対象にする
            else if(naki_type == Naki_Type.chi){
                if(!isPossible_chi(i + 1)){
                    hidden_table_pai(i + 1);
                    hidden_pais_list.push(i + 1);
                }
            }
            //カンの場合、1枚以上あれば非表示
            else if(naki_type == Naki_Type.ankan || naki_type == Naki_Type.minkan){
                if(count_tehai_pai(i + 1) > 0){
                    hidden_table_pai(i + 1);
                    hidden_pais_list.push(i + 1);
                }    
            }
        }
    }
}

//隠していたテーブルの牌を表示（表にする）
function visible_table_hais(){
    for(let i = 0; i < hidden_pais_list.length; i++){
        visible_table_pai(hidden_pais_list[i]);
    }
    //鳴けない牌のリストを初期化
    hidden_pais_list.length = 0;
}

//手配を3枚隠す（鳴き時）
function hidden_tehai_three(){
    //現在の鳴きの回数
    let naki_num = naki_pais_list.length;
    for(let i = 0; i < 3; i++){
        get_tehai_obj((TEHAI_NUMBER - naki_num * 3) - i).style.visibility = "hidden";
    }
}
//手配を3枚表示する（鳴きキャンセル時）
function visible_tehai_three(){
    //現在の鳴きの回数
    let naki_num = naki_pais_list.length;
    for(let i = 0; i < 3; i++){
        get_tehai_obj(TEHAI_NUMBER - (naki_num * 3) + i + 1).style.visibility = "visible";
    }
}

//鳴きボタンを隠す
function hidden_naki_btn(){
    let btnlist_naki = document.getElementById('btnlist_naki');
    btnlist_naki.style.display = "none";
}

//鳴きボタンを表示
function visible_naki_btn(){
    let btnlist_naki = document.getElementById('btnlist_naki');
    btnlist_naki.style.display = "flex";
}

//指定した牌が手牌中にいくつあるかカウント（鳴きも含める）
function count_tehai_pai(num){
    let count = 0;
    //将来的には鳴きの種類、回数を考慮してループ回数を決める
    //手持ちの牌にあるかどうか
    for(let i = 0; i < TEHAI_NUMBER; i++){
        if(get_tehai_value(i + 1) == num){
            count++;
        }
    }
    //鳴き牌にあるかどうか
    for(let i = 0; i < naki_pais_list.length; i++){
        if(naki_pais_list[i] == num){
            //ポンなら3を加算
            if(naki_type_list[i] == Naki_Type.pong){
                count += 3;
            }
            //チーなら1を加算（テーブルで押した牌と同じ場合）
            else if(naki_type_list[i] == Naki_Type.chi){
                count++;
            }
            //カンなら4を加算
            else{
                count += 4;
            }
        }
        //チーかつ押した牌＋1 or 2 の場合
        else if((naki_pais_list[i] + 1 == num || naki_pais_list[i] + 2 == num) && naki_type_list[i] == Naki_Type.chi){
            count++;
        }
    }

    return count;
}

//手牌の数のカウント(カンは3としてカウント)
function count_tehai_num(){
    let count = 0;
    //手持ちの牌
    for(let i = 0; i < TEHAI_NUMBER; i++){
        if(get_tehai_value(i + 1) != BACK){
            count++;
        }
    }
    //鳴き牌のカウント
    for(let i = 0; i < naki_pais_list.length; i++){
        count += 3;
    }

    return count;
}

//手牌のソート
function tehai_sort(){
    for(let i = 1; i < tehai_current; i++){
        let m = i;
        for(let j = i + 1; j < tehai_current + 1; j++){
            if(Number(get_tehai_value(j)) < Number(get_tehai_value(m))){
                m = j;
            }
        }
        //手配の値の入れ替え
        let temp_value = get_tehai_value(i);
        set_tehai_value(i, get_tehai_value(m));
        set_tehai_value(m, temp_value);
        //牌の画像の入れ替え
        let temp_img = get_tehai_img(i);
        set_tehai_img(i, get_tehai_img(m));
        set_tehai_img(m, temp_img);
    }
}

//数値から牌の画像のパスを生成
function generate_pai_src(num){
    let pai_src = "images/";
    //バック
    if(num == BACK){
        pai_src += "back.png";
        return pai_src;
    }
    //萬子
    else if(num >= MANZU[0] && num <= MANZU[8]){
        pai_src += "m_";
    }
    //筒子
    else if(num >= PINZU[0] && num <= PINZU[8]){
        pai_src += "p_";
    }
    //索子
    else if(num >= SOUZU[0] && num <= SOUZU[8]){
        pai_src += "s_";
    }
    //字牌
    else if(num >= JIHAI[0] && num <= JIHAI[6]){
        pai_src += "j_";
    }
    else{
        return "";
    }
    //1～9の数値決め
    if(num % SELECT_TABLE_COLUMN != 0){
        pai_src += (num % SELECT_TABLE_COLUMN).toString() + ".png";
    }
    else{
        pai_src += SELECT_TABLE_COLUMN.toString() + ".png";
    }

    return pai_src;
}

//牌の種類の数を調べる
function count_pai_type(){
    let list_pais = [];
    //手牌
    for(let i = 0; i < count_tehai_num() - naki_pais_list.length * 3; i++){
        let pai_num = Number(get_tehai_value(i + 1));
        if(pai_num != BACK && !list_pais.includes(pai_num)){
            list_pais.push(pai_num);
        }
    }
    //鳴き
    for(let i = 0; i < naki_pais_list.length; i++){
        //チーの場合
        if(naki_type_list[i] == Naki_Type.chi){
            for(let j = 0; j < 3; j++){
                if(!list_pais.includes(naki_pais_list[i] + j)){
                    list_pais.push(naki_pais_list[i] + j);
                }
            }
        }
        //それ以外の鳴きの場合
        else{
            if(!list_pais.includes(naki_pais_list[i])){
                list_pais.push(naki_pais_list[i]);
            }
        }
    }

    return list_pais.length;
}

//手牌の字牌の数を調べる(カンの場合もポンと同じく3として加算)
function count_zihai_num(){
    let count = 0;
    //手牌
    for(let i = 0; i < count_tehai_num() - naki_pais_list.length * 3; i++){
        let pai_num = Number(get_tehai_value(i + 1));
        if(pai_num != BACK && (pai_num >= JIHAI[0] && pai_num <= JIHAI[6])){
            count++;
        }
    }
    //鳴き
    for(let i = 0; i < naki_pais_list.length; i++){
        //チー以外の場合のみ見る
        if(!(naki_type_list[i] == Naki_Type.chi)){
            if((naki_pais_list[i] >= JIHAI[0] && naki_pais_list[i] <= JIHAI[6])){
                count+= 3;
            }
        }
    }
    
    return count;
}

//手牌の字牌の種類の数を調べる
function count_zihai_type(){
    let list_pais = [];
    //手牌
    for(let i = 0; i < count_tehai_num() - naki_pais_list.length * 3; i++){
        let pai_num = Number(get_tehai_value(i + 1));
        if(pai_num != BACK && (pai_num >= JIHAI[0] && pai_num <= JIHAI[6]) && !list_pais.includes(pai_num)){
            list_pais.push(pai_num);
        }
    }
    //鳴き
    for(let i = 0; i < naki_pais_list.length; i++){
        //チー以外の場合のみ見る
        if(!(naki_type_list[i] == Naki_Type.chi)){
            if((naki_pais_list[i] >= JIHAI[0] && naki_pais_list[i] <= JIHAI[6]) && !list_pais.includes(naki_pais_list[i])){
                list_pais.push(naki_pais_list[i]);
            }
        }
    }

    return list_pais.length;
}

//牌のカウント配列のベースを生成
function createCountHaisBase(){
    let array = new Array(4);
    for(let i = 0; i < 4; i++){
        let num = 9;
        if(i == 3){
            num = 7
        }
        array[i] = new Array(num);
        for(let j = 0; j < num; j++){
            array[i][j] = 0;
        }
    }

    return array;
}

//手牌をカウントしたものを配列として生成
function countHais(){
    let haisCount = createCountHaisBase();
    for(let i = 0; i < count_tehai_num() - naki_pais_list.length * 3; i++){
        let pai_num = Number(get_tehai_value(i + 1));
        haisCount[Math.floor((pai_num - 1) / 9)][(pai_num - 1) % 9]++;
    }

    return haisCount;
}

//国士無双13面待ちの手牌を生成
function generateKokushi13Tehai(){
    let haisCount = createCountHaisBase();
    for(let i = 0; i < haisCount.length; i++){
        for(let j = 0; j < haisCount[i].length; j++){
            //ヤオチュー牌であれば1枚追加する
            if(j % 9 == 0 || j % 9 == 8 || i == 3){
                haisCount[i][j]++;
            }
        }
    }

    return haisCount;
}

//配列のコピーを生成する
function copyCountArray(array){
    let new_array = new Array(4);
    for(let i = 0; i < 4; i++){
        new_array[i] = array[i].slice();
    }
    return new_array;
}

//残っている牌を探して一覧をリストとして返す
function searchNokoriHai(haisCount){
    let result_list = [];
    for(let i = 0; i < haisCount.length; i++){
        for(let j = 0; j < haisCount[i].length; j++){
            if(haisCount[i][j] > 0){
                result_list.push(i * 9 + j + 1);
            }
        }
    }

    return result_list;
}

//再帰的に手牌をブロックとして分割
function createHaiBlocksRecursive(hais_count, mentsu_count, taatsu_count, toitsu_count){
    let result_list = [];
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        let haishu = Math.floor(i / 9);
        let count = hais_count[haishu][i % 9];
        //雀頭、対子の処理
        if(count >= 2){
            let copied_hais = copyCountArray(hais_count);
            //面子が3枚で対子が2枚のシャンポン待ちの待ち牌をリストに追加
            if(mentsu_count + naki_pais_list.length >= 3 && toitsu_count >= 1){
                let nokoriHais = searchNokoriHai(copied_hais);
                for(let j = 0; j < nokoriHais.length; j++){
                    if(!machihai_list.includes(nokoriHais[j])){
                        machihai_list.push(nokoriHais[j]);
                    }
                }
            }
            copied_hais[haishu][i % 9] -= 2;
            //再帰呼び出し
            result_list = result_list.concat(createHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count, toitsu_count + 1));
        }
        //刻子の処理
        if(count >= 3){
            let copied_hais = copyCountArray(hais_count);
            copied_hais[haishu][i % 9] -= 3;
            //面子が4枚で単騎待ちの時の待ち牌をリストに追加
            if(mentsu_count + naki_pais_list.length >= 3){
                let nokoriHais = searchNokoriHai(copied_hais);
                for(let j = 0; j < nokoriHais.length; j++){
                    if(!machihai_list.includes(nokoriHais[j])){
                        machihai_list.push(nokoriHais[j]);
                    }
                }
            }
            //再帰呼び出し
            result_list = result_list.concat(createHaiBlocksRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count))
        }
        //字牌なら対子、刻子の処理のみで終了させる
        if(i + 1 >= JIHAI[0] && i + 1 <= JIHAI[6]){
            continue;
        }
        //順子（面子）の処理
        if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
            let copied_hais = copyCountArray(hais_count);
            copied_hais[haishu][i % 9]--;
            copied_hais[haishu][i % 9 + 1]--;
            copied_hais[haishu][i % 9 + 2]--;
            //面子が4枚で単騎待ちの時の待ち牌をリストに追加
            if(mentsu_count + naki_pais_list.length >= 3){
                let nokoriHais = searchNokoriHai(copied_hais);
                for(let j = 0; j < nokoriHais.length; j++){
                    if(!machihai_list.includes(nokoriHais[j])){
                        machihai_list.push(nokoriHais[j]);
                    }
                }
            }
            //再帰呼び出し
            result_list = result_list.concat(createHaiBlocksRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count));
        }
        //カンチャン（塔子）の処理
        if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
            let copied_hais = copyCountArray(hais_count);
            copied_hais[haishu][i % 9]--;
            copied_hais[haishu][i % 9 + 2]--;
            //面子が4枚でカンチャン待ちの時の待ち牌をリストに追加
            if(mentsu_count + naki_pais_list.length >= 3 && toitsu_count >= 1){
                let kanchanHai = (haishu * 9) + (i % 9 + 1);
                if(!machihai_list.includes(kanchanHai + 1)){
                    machihai_list.push(kanchanHai + 1);
                }
            }
            //再帰呼び出し
            result_list = result_list.concat(createHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count));
        }
        //ペンチャン、両面の処理
        if(i % 9 < 8 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1){
            let copied_hais = copyCountArray(hais_count);
            copied_hais[haishu][i % 9]--;
            copied_hais[haishu][i % 9 + 1]--;
            //面子が4枚でペンチャンまたは両面待ちの時の待ち牌をリストに追加
            if(mentsu_count + naki_pais_list.length >= 3 && toitsu_count >= 1){
                let leftHai = (haishu * 9) + (i % 9);
                let rightHai = (haishu * 9) + (i % 9 + 1);
                //両面待ちの場合
                if(leftHai % 9 != 0 && rightHai % 9 != 8){
                    if(!machihai_list.includes(leftHai)){
                        machihai_list.push(leftHai);
                    }
                    if(!machihai_list.includes(rightHai + 2)){
                        machihai_list.push(rightHai + 2);
                    }
                }
                //1,2のペンチャンの場合
                else if(leftHai % 9 == 0){
                    if(!machihai_list.includes(rightHai + 2)){
                        machihai_list.push(rightHai + 2);
                    }                    
                }
                //8,9のペンチャンの場合
                else if(rightHai % 9 == 8){
                    if(!machihai_list.includes(leftHai)){
                        machihai_list.push(leftHai);
                    }                    
                }
            }
            //再帰呼び出し
            result_list = result_list.concat(createHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count));
        }           
    }
    //分解が終了したら結果を記憶する
    if(mentsu_count + taatsu_count + toitsu_count > 0){
        result_list.push([mentsu_count, taatsu_count, toitsu_count]);
    }

    return result_list;
}

//テスト（分解結果を返す）
function test_getBlockResult(){
    let hais_count = countHais();
    let result_list = new Array(1);
    result_list = createHaiBlocksRecursive(hais_count, 0, 0, 0);
    result_list = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);

    return result_list;
}

//4面子1雀頭のシャンテン数を判定
function calcIppanteShanten(haisCount){
    //分解結果を記憶する変数
    let result_list = new Array(1);
    result_list = createHaiBlocksRecursive(haisCount, 0, 0, 0);
    result_list = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);

    //最小のシャンテン数を探す
    let min_shanten = 8;

    //ブロックを総当たりで調べる
    for(let i = 0; i < result_list.length; i++){
        let mentsu = result_list[i][0];
        let taatsu = result_list[i][1];
        let toitsu = result_list[i][2];
        let has_janto = false;

        //鳴き牌を面子として加算
        mentsu += naki_pais_list.length;

        //対子があれば1つを雀頭にし、全ての対子の数から1つ減らしたものを塔子に加算
        if(toitsu > 0){
            has_janto = true;
            taatsu += toitsu - 1;
        }

        //面子と塔子の合計が4より大きい場合、面子の余りを塔子とする
        if(mentsu + taatsu > 4){
            taatsu = 4 - mentsu;
        }
        //雀頭があればシャンテン数を1減らせる
        let janto = (has_janto ? 1 : 0);

        //シャンテン数を計算
        let shanten = 8 - mentsu * 2 - taatsu - janto;

        //手牌が全て字牌だったらシャンテン数を減少させる
        if(count_zihai_num() >= 13 && count_zihai_type() < 5){
            shanten += 5 - count_zihai_type();
        }

        //最小のシャンテン数なら記憶する
        if(min_shanten > shanten){
            min_shanten = shanten;
        }
        //最小のシャンテン数が0以下なら処理を終了
        if(min_shanten <= -1){
            return min_shanten;
        }
    }

    //裸単騎の場合は特殊な処理を行う
    if(result_list.length == 0 && searchNokoriHai(haisCount).length == 1){
        min_shanten = 0;
        machihai_list.push(searchNokoriHai(haisCount)[0]);
    }

    //最小のシャンテン数を返す
    return min_shanten;
}

//国士無双のシャンテン数を判定
function calcKokushiShanten(haisCount){
    let has_janto = false;
    let yaochu_count = 0;
    let copied_hais = copyCountArray(haisCount);

    for(let i = 0; i < copied_hais.length; i++){
        for(let j = 0; j < copied_hais[i].length; j++){
            //ヤオチュー牌以外は無視
            if(i < 3 && (j != 0 && j != 8)){
                continue;
            }

            let count = copied_hais[i][j];
            //0枚のものも無視
            if(count == 0){
                continue;
            }
            //雀頭があるかどうか判定
            if(!has_janto && count >= 2){
                has_janto = true;
                //待ち判定のために1枚だけ抜く
                copied_hais[i][j]--;
            }

            yaochu_count++;
        }
    }

    let shanten = 13 - yaochu_count - (has_janto ? 1 : 0);
    //聴牌であれば待ちをリストに挿入
    if(shanten == 0){
        let kokushi13Hais = generateKokushi13Tehai();
        let machihai = 0;
        let flg_13men = true;
        for(let i = 0; i < copied_hais.length; i++){
            for(let j = 0; j < copied_hais[i].length; j++){
                if(copied_hais[i][j] != kokushi13Hais[i][j]){
                    machihai = i * 9 + j + 1;
                    flg_13men = false;
                }
            }
        }
        //国士無双13面待ち
        if(flg_13men){
            for(let i = 0; i < haisCount.length; i++){
                for(let j = 0; j < haisCount[i].length; j++){
                    //ヤオチュー牌であれば待ちに追加する
                    if(j % 9 == 0 || j % 9 == 8 || i == 3){
                        machihai = i * 9 + j + 1;
                        if(!machihai_list.includes(machihai)){
                            machihai_list.push(machihai);
                        }
                    }
                }
            }
        }
        //通常の国士無双
        else{
            if(!machihai_list.includes(machihai)){
                machihai_list.push(machihai);
            }
        }
    }

    return shanten;
}

//七対子のシャンテン数を判定
function calcChiitoiShanten(haisCount){
    let toitsu_count = 0;
    let haishu_count = 0;
    let copied_hais = copyCountArray(haisCount);

    for(let i = 0; i < copied_hais.length; i++){
        for(let j = 0; j < copied_hais[i].length; j++){
            //1枚でもあれば牌の種類としてカウント
            if(copied_hais[i][j] >= 1){
                haishu_count++;
            }
            //2枚以上あれば対子としてカウント
            if(copied_hais[i][j] >= 2){
                toitsu_count++;
                copied_hais[i][j] -= 2;
            }
        }
    }

    let shanten = 6 - toitsu_count;
    //牌の種類と対子の数が7種類未満のとき
    if(toitsu_count < 7 && haishu_count < 7){
        //7 - 牌の種類の数をシャンテン数に加算する
        shanten += 7 - haishu_count;
    }

    //聴牌であれば待ち牌を求めてリストに挿入
    if(shanten == 0){
        let machihai = searchNokoriHai(copied_hais)[0];
        if(!machihai_list.includes(machihai)){
            machihai_list.push(machihai);
        }
    }

    return shanten;
}

//現在のシャンテン数を計算する
function calc_shanten(){
    let hais_count = countHais();

    let kokushi_shanten = 99;
    let chitoitsu_shanten = 99;
    let normal_shanten = 99;

    //待ち牌リストを初期化
    machihai_list.length = 0;

    //以下の2つについてはあらゆる鳴きがない場合のみ計算する
    if(naki_pais_list.length == 0){
        kokushi_shanten = calcKokushiShanten(hais_count);
        chitoitsu_shanten = calcChiitoiShanten(hais_count);
    }

    //国士無双聴牌以外の場合、一般手のシャンテン数を求める
    if(kokushi_shanten != 0){
        //一般手のシャンテン数を求める
        normal_shanten = calcIppanteShanten(hais_count);
    }
    

    return Math.min(normal_shanten, chitoitsu_shanten, kokushi_shanten);
}

//聴牌時の一連の処理
function tenpai_shori(){
    let shanten = calc_shanten();
    //聴牌の場合
    if(shanten == 0){
        //一度テーブルの牌を全て表示する
        visible_table_pai_all();
        //4枚以上使われている牌を非表示にする
        hidden_table_pai_max();
        //待ち牌以外の牌を隠す
        for(let i = 0; i < PAI_TYPE_NUM; i++){
            //待ち牌リストに含まれなければ隠す（4枚以上使われてて既に隠れている牌は待ち牌として表示しない）
            if(!machihai_list.includes(i + 1) && count_tehai_pai(i + 1) < PAI_MAX){
                hidden_table_pai(i + 1);
                hidden_pais_list.push(i + 1);
            }
        }
        //モードを聴牌にする
        mode_current = Mode.tenpai;
        //テロップを聴牌に変更する
        stateText_change("聴牌：最後の牌を選択してください");
    }
    else{
        //ノーテンを知らせるダイヤログを表示させる
        let modal_text = document.createElement('p');
        modal_text.innerText = "現在の手牌は" + shanten + "向聴です。聴牌の状態を入力してください。";
        modal_noten_body.appendChild(modal_text);
        modal_noten.style.display = "block";
        //テロップを残り1枚に変更する
        stateText_change("手配を入力してください(残り1牌)");
    }
}

//アガリ牌候補をリストとして抜き出す
function get_agariHai_list(){
    let count_hais = countHais();
    let result_list = [];
    for(let i = 0; i < count_hais.length; i++){
        for(let j = 0; j < count_hais[i].length; j++){
            if(count_hais[i][j] > 0){
                result_list.push(i * 9 + j + 1);
            }
        }
    }

    return result_list;
}

//指定した牌が手牌を左から数えて何番目にあるか
function tehai_pai_index(num){
    let count_hais = countHais();
    let count = 0;
    for(let i = 0; i < count_hais.length; i++){
        for(let j = 0; j < count_hais[i].length; j++){
            if(count_hais[i][j] > 0){
                if(i * 9 + j + 1 == num){
                    return count;
                }
                else{
                    count += count_hais[i][j];
                }  
            }
        }
    }

    return -1;
}

//指定した牌を手牌にセットする一連の処理
function tehai_set(num){
    set_tehai_img(tehai_current + 1, generate_pai_src(num));
    set_tehai_value(tehai_current + 1, num);
    tehai_current++;
    tehai_sort();

    //牌の上限の4枚に到達したらテーブル上のその牌を裏返しにする
    if(count_tehai_pai(num) >= PAI_MAX){
        hidden_table_pai(num);
        max_pais_list.push(num);
    }
}

//初期手配（全て裏返しの状態）の生成
for(i = 0; i < TEHAI_NUMBER; i++){
    let div_element = document.createElement('div');
    let img_element = document.createElement('img');
    let p_element = document.createElement('p');
    let div_id_name = "tehai_" + (i + 1).toString().padStart(2, '0');
    div_element.className = "tehai_parts";
    div_element.id = div_id_name;
    document.getElementById("tehai").appendChild(div_element);
    img_element.id = div_id_name + "_image";
    img_element.src = "images/back.png";
    document.getElementById(div_id_name).appendChild(img_element);
    p_element.className = "tehai_value";
    p_element.id = div_id_name + "_value";
    p_element.innerText = BACK;
    document.getElementById(div_id_name).appendChild(p_element);
}

//牌選択用テーブルの生成
let select_table = document.getElementById('select');
let tbl = document.createElement('table');
let tblBody = document.createElement('tbody');
tbl.id = "select_table";
for (let i = 0; i < SELECT_TABLE_ROW; i++){
    let row = document.createElement('tr');
    for (let j = 0; j < SELECT_TABLE_COLUMN; j++){
        let cell = document.createElement('td');
        let cellimg = document.createElement('img');
        let cellimg_flg = false;
        //数牌の場合
        if(i != 3){
            cellimg_flg = true;
        }
        //字牌の場合
        else{
            //端の二つは使用しない
            if(!(j == 0 || j == 8)){
                cellimg_flg = true;
            }
        }
        if(cellimg_flg){
            //数牌のID
            if(i != 3){
                let cell_id = (i * SELECT_TABLE_COLUMN) + (j + 1);
                cell.id = cell_id
                cellimg.src = generate_pai_src(cell_id);
            }
            //字牌のID
            else{
                let cell_id = (i * SELECT_TABLE_COLUMN) + j;
                cell.id = cell_id
                cellimg.src = generate_pai_src(cell_id);
            }
            cell.className = "table_pai";
            cell.appendChild(cellimg);
        }
        row.appendChild(cell);
    }
    tblBody.appendChild(row);
}
tbl.appendChild(tblBody);
select_table.appendChild(tbl);

//イベント登録（テーブル）
let table_pais = document.getElementsByClassName('table_pai');
for(let i = 0; i < table_pais.length; i++){
    table_pais[i].addEventListener("click",(event) => {
        //押された牌の種類を番号として取得
        let pai_num = Number(table_pais[i].id);
        let naki_pais_div = document.getElementById('naki_' + (naki_pais_list.length + 1));
        let naki_pais_img_1 = document.createElement('img');
        let naki_pais_img_2 = document.createElement('img');
        let naki_pais_img_3 = document.createElement('img');
        let naki_pais_img_4 = document.createElement('img');
        //テーブル押下時点でのモードを記憶
        mode_old = mode_current;

        //通常時は牌を1枚ずつ追加する
        if(mode_current == Mode.normal && count_tehai_pai(pai_num) < PAI_MAX){
            tehai_set(pai_num);
            //押された牌の種類を記憶
            before_addPai = pai_num;
        }
        //ポン（手配に2枚以上ある場合は行わない）
        else if(mode_current == Mode.pong && count_tehai_pai(pai_num) <= PAI_MAX - 3){
            //手配3枚を隠す
            hidden_tehai_three();

            naki_pais_img_1.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_2.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_3.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_1.style.transform = "rotate(-90deg)";
            naki_pais_img_1.style.marginLeft = "10px";
            naki_pais_img_1.style.marginRight = "10px";
            naki_pais_div.appendChild(naki_pais_img_1);
            naki_pais_div.appendChild(naki_pais_img_2);
            naki_pais_div.appendChild(naki_pais_img_3);

            //鳴いた牌の種類と鳴きのタイプ（ポン）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.pong);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_pong_click();
        }
        //チー（チーできるかどうかを調べてから行う）
        else if(mode_current == Mode.chi && isPossible_chi(pai_num) && count_tehai_pai(pai_num) < PAI_MAX){
            //手配3枚を隠す
            hidden_tehai_three();

            naki_pais_img_1.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_2.setAttribute('src', generate_pai_src(pai_num + 1));
            naki_pais_img_3.setAttribute('src', generate_pai_src(pai_num + 2));
            naki_pais_img_1.style.transform = "rotate(-90deg)";
            naki_pais_img_1.style.marginLeft = "10px";
            naki_pais_img_1.style.marginRight = "10px";
            naki_pais_div.appendChild(naki_pais_img_1);
            naki_pais_div.appendChild(naki_pais_img_2);
            naki_pais_div.appendChild(naki_pais_img_3);

            //鳴いた牌の種類と鳴きのタイプ（チー）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.chi);

            //牌が4枚になったらテーブルの牌を裏返しにする(右隣2つの牌についても処理)
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }
            if(count_tehai_pai(pai_num + 1) == PAI_MAX){
                hidden_table_pai(pai_num + 1);
                max_pais_list.push(pai_num + 1);
            }
            if(count_tehai_pai(pai_num + 2) == PAI_MAX){
                hidden_table_pai(pai_num + 2);
                max_pais_list.push(pai_num + 2);
            }

            btn_chi_click();
        }
        //暗槓（手配に1枚以上ある場合は行わない）
        else if(mode_current == Mode.ankan && count_tehai_pai(pai_num) <= 0){
            //手配3枚を隠す
            hidden_tehai_three();

            naki_pais_img_1.setAttribute('src', generate_pai_src(BACK));
            naki_pais_img_2.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_3.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_4.setAttribute('src', generate_pai_src(BACK));
            naki_pais_div.appendChild(naki_pais_img_1);
            naki_pais_div.appendChild(naki_pais_img_2);
            naki_pais_div.appendChild(naki_pais_img_3);
            naki_pais_div.appendChild(naki_pais_img_4);

            //鳴いた牌の種類と鳴きのタイプ（暗槓）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.ankan);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_ankan_click();
        }
        //明槓（手配に1枚以上ある場合は行わない）
        else if(mode_current == Mode.minkan && count_tehai_pai(pai_num) <= 0){
            //手配3枚を隠す
            hidden_tehai_three();

            naki_pais_img_1.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_2.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_3.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_4.setAttribute('src', generate_pai_src(pai_num));
            naki_pais_img_1.style.transform = "rotate(-90deg)";
            naki_pais_img_1.style.marginLeft = "10px";
            naki_pais_img_1.style.marginRight = "10px";
            naki_pais_div.appendChild(naki_pais_img_1);
            naki_pais_div.appendChild(naki_pais_img_2);
            naki_pais_div.appendChild(naki_pais_img_3);
            naki_pais_div.appendChild(naki_pais_img_4);

            //鳴いた牌の種類と鳴きのタイプ（明槓）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.minkan);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_minkan_click();
        }
        //聴牌の場合
        else if(mode_current == Mode.tenpai && count_tehai_pai(pai_num) < PAI_MAX && machihai_list.includes(pai_num)){
            //入力した手牌をセットする（これで14枚のアガリ手が完成する）
            tehai_set(pai_num);
            //アガリ牌の候補を取得
            agarihai_list = get_agariHai_list();
            //一度すべての牌を隠す
            hidden_table_pai_all();
            //アガリ牌のみ表示させる
            for(let i = 0; i < agarihai_list.length; i++){
                visible_table_pai(agarihai_list[i]);
            }
            //モードを和了に変更
            mode_current = Mode.agari;
            //テロップを和了に変更
            stateText_change("和了：アガリ牌を選択してください");
        }
        //和了の場合
        else if(mode_current == Mode.agari && agarihai_list.includes(pai_num)){
            modal_agari.style.display = "block";
        }

        //手牌の空きが2枚以上であれば状態テロップの枚数を減らす（通常モード時のみ）
        if(count_tehai_num() <= TEHAI_NUMBER - 2 && mode_current == Mode.normal){
            stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        }

        //手配の空きが残り3枚以下になったら鳴きボタンを非表示にする
        if(count_tehai_num() >= TEHAI_NUMBER - 3){
            hidden_naki_btn();
        }
        //手配の空きが残り1枚になったら聴牌判定の処理を行う
        if(count_tehai_num() == TEHAI_NUMBER - 1){
            tenpai_shori();
        }
    });
}

//イベント登録（手配）
let tehai_pais = document.getElementsByClassName('tehai_parts');
for(let i = 0; i < tehai_pais.length; i++){
    tehai_pais[i].addEventListener("click",(event) => {
        //現在は通常時のみ作動
        if(mode_current == Mode.normal || mode_current == Mode.tenpai || mode_current == Mode.agari){
            let pai_num = Number(get_tehai_value(i + 1));
            //すでに牌があれば消去する
            if(pai_num != BACK){
                //消去前に4枚であればテーブルの牌を表に戻す
                if(count_tehai_pai(pai_num) == PAI_MAX){
                    visible_table_pai(pai_num);
                    let max_pai_index = max_pais_list.indexOf(pai_num);
                    max_pais_list.splice(max_pai_index, 1);
                }
                set_tehai_value(i + 1, BACK);
                set_tehai_img(i + 1, generate_pai_src(BACK));
                tehai_sort();
                tehai_current--;
            }
        }

        //手牌の空きが2枚以上であれば状態テロップの枚数を増やす
        if(count_tehai_num() <= TEHAI_NUMBER - 2){
            stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        }

        //手配の空きが残り4枚以上になったら鳴きボタンを表示する
        if(count_tehai_num() < TEHAI_NUMBER - 3){
            visible_naki_btn();
        }
        //手牌の空きが残り2枚以上になったら待ち牌以外の牌をテーブルに表示して、待ち牌リストを空にする
        if(count_tehai_num() < TEHAI_NUMBER - 1){
            visible_table_hais();
            machihai_list.length = 0;
            //モードを通常に戻す
            mode_current = Mode.normal;
        }
        //手配の空きが残り1枚になったら聴牌判定の処理を行う
        if(count_tehai_num() == TEHAI_NUMBER - 1){
            tenpai_shori();
        }
    });
}

//イベント登録（鳴き牌）
let tehai_naki_parent = document.getElementById('tehai_naki');
let tehai_nakis = document.getElementsByClassName('naki_pais');
for(let i = 0; i < tehai_nakis.length; i++){
    tehai_nakis[i].addEventListener("click",(event) => {
        if(mode_current == Mode.normal || mode_current == Mode.tenpai){
            let pai_index = naki_event_order.indexOf(i);
            let pai_num = naki_pais_list[pai_index];
            //手配3枚を元に戻す
            visible_tehai_three();
            //押下した鳴き牌を削除
            let naki_pais_div = tehai_nakis[pai_index];
            while(naki_pais_div.lastChild){
                naki_pais_div.removeChild(naki_pais_div.lastChild);
            }
            //鳴き牌をソート
            for(let j = pai_index; j < naki_pais_list.length - 1; j++){
                let naki_pais_id = tehai_nakis[j].id;
                let naki_index_temp = naki_event_order[j];
                naki_event_order[j] = naki_event_order[j + 1];
                naki_event_order[j + 1] = naki_index_temp;
                tehai_naki_parent.insertBefore(tehai_nakis[j + 1], tehai_nakis[j]);
                tehai_nakis[j + 1].id = tehai_nakis[j].id;
                tehai_nakis[j].id = naki_pais_id;
            }
            //テーブルの牌を表に戻す
            visible_table_pai(pai_num);
            let max_pai_index_0 = max_pais_list.indexOf(pai_num);
            max_pais_list.splice(max_pai_index_0, 1);
            //チーの時は右隣2つの牌も表に戻す
            if(naki_type_list[pai_index] == Naki_Type.chi){
                visible_table_pai(pai_num + 1);
                visible_table_pai(pai_num + 2);
                let max_pai_index_1 = max_pais_list.indexOf(pai_num + 1);
                let max_pai_index_2 = max_pais_list.indexOf(pai_num + 2);
                max_pais_list.splice(max_pai_index_1, 1);
                max_pais_list.splice(max_pai_index_2, 1);
            }

            //鳴きリストから削除
            naki_pais_list.splice(pai_index, 1);
            naki_type_list.splice(pai_index, 1);

            //状態テロップの枚数を増やす
            stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");

            //手配の空きが残り4枚以上になったら鳴きボタンを表示する
            if(count_tehai_num() < TEHAI_NUMBER - 3){
                visible_naki_btn();
            }
            //手牌の空きが残り2枚以上になったら待ち牌以外の牌をテーブルに表示して、待ち牌リストを空にする
            if(count_tehai_num() < TEHAI_NUMBER - 1){
                visible_table_hais();
                machihai_list.length = 0;
                //モードを通常に戻す
                mode_current = Mode.normal;
            }
        }
    });
}

//イベント登録（ノーテン用ダイヤログの閉じるボタン）
let modal_noten_close = document.getElementById('modal_noten_close');
modal_noten_close.addEventListener("click", (event) =>{
    modalNotenClose();
});
//イベント登録（アガリ用ダイヤログの閉じるボタン）
let modal_agari_close = document.getElementById('modal_agari_close');
modal_agari_close.addEventListener("click", (event) =>{
    modalAgariClose();
});
//モーダルコンテンツ以外がクリックされた時のイベントをそれぞれのダイヤログに登録
addEventListener("click", (event) =>{
    //ノーテン時
    if(event.target == modal_noten){
        modalNotenClose();
    }
    //アガリ時
    if(event.target == modal_agari){
        modalAgariClose();
    }
});
//ノーテン用ダイヤログが閉じたときの処理
function modalNotenClose(){
    while(modal_noten_body.firstChild){
        modal_noten_body.removeChild(modal_noten_body.firstChild);
    }
    modal_noten.style.display = "none";

    //テスト
    //tehai_pais[0].click();
    //テーブル押下時に通常モードだった場合
    if(mode_old == Mode.normal){
        tehai_pais[tehai_pai_index(before_addPai)].click();
    }
    //テーブル押下時に鳴きモードだった場合
    else if(mode_old == Mode.pong || mode_old == Mode.chi || mode_old == Mode.ankan || mode_old == Mode.minkan){
        tehai_nakis[naki_pais_list.length - 1].click();
    }
}
//アガリ用ダイヤログが閉じたときの処理
function modalAgariClose(){
    modal_agari.style.display = "none";
}
//ツモボタンをクリックした時
function btn_tsumo_click(){
}
//ロンボタンをクリックした時
function btn_ron_click(){
}

//鳴きボタン用関数
//ポン
function btn_pong_click(){
    //ポンの状態で押下
    if(mode_current == Mode.normal){
        //鳴けない牌を非表示にする
        hidden_table_naki(Naki_Type.pong);
        
        //ポン以外を隠す
        btn_pong_img.setAttribute('src', "images/btn/btn_kaijyo.png");
        btn_chi.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_chi_img.style.visibility = "hidden";
        btn_ankan_img.style.visibility = "hidden";
        btn_minkan_img.style.visibility = "hidden";
        //テロップをポンに変更
        stateText_change("ポン：ポンする牌を選択してください");
        //モードをポンへ
        mode_current = Mode.pong;
    }
    //解除の状態で押下
    else if(mode_current == Mode.pong){
        //非表示にしたテーブル上の牌を元に戻す
        visible_table_hais();
        //ボタンを元に戻す
        btn_pong_img.setAttribute('src', "images/btn/btn_pong.png");
        btn_chi.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_chi_img.style.visibility = "visible";
        btn_ankan_img.style.visibility = "visible";
        btn_minkan_img.style.visibility = "visible";
        //テロップを通常に変更
        stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        //モードを通常へ
        mode_current = Mode.normal;
    }
}
//チー
function btn_chi_click(){
    //チーの状態で押下
    if(mode_current == Mode.normal){
        //鳴けない牌を非表示にする
        hidden_table_naki(Naki_Type.chi);
        //チー以外を隠す
        btn_chi_img.setAttribute('src', "images/btn/btn_kaijyo.png");
        btn_pong.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_pong_img.style.visibility = "hidden";
        btn_ankan_img.style.visibility = "hidden";
        btn_minkan_img.style.visibility = "hidden";
        //テロップをチーに変更
        stateText_change("チー：最小の牌を選択してください");
        //モードをチーへ
        mode_current = Mode.chi;
    }
    //解除の状態で押下
    else if(mode_current == Mode.chi){
        //非表示にしたテーブル上の牌を元に戻す
        visible_table_hais();
        //ボタンを元に戻す
        btn_chi_img.setAttribute('src', "images/btn/btn_chi.png");
        btn_pong.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_pong_img.style.visibility = "visible";
        btn_ankan_img.style.visibility = "visible";
        btn_minkan_img.style.visibility = "visible";
        //テロップを通常に変更
        stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        //モードを通常へ
        mode_current = Mode.normal;
    }
}
//暗槓
function btn_ankan_click(){
    //暗槓の状態で押下
    if(mode_current == Mode.normal){
        //鳴けない牌を非表示にする
        hidden_table_naki(Naki_Type.ankan);
        //暗槓以外を隠す
        btn_ankan_img.setAttribute('src', "images/btn/btn_kaijyo.png");
        btn_pong.style.cursor = "default";
        btn_chi.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_pong_img.style.visibility = "hidden";
        btn_chi_img.style.visibility = "hidden";
        btn_minkan_img.style.visibility = "hidden";
        //テロップを暗槓に変更
        stateText_change("暗槓：暗槓する牌を選択してください");
        //モードを暗槓へ
        mode_current = Mode.ankan;
    }
    //解除の状態で押下
    else if(mode_current == Mode.ankan){
        //非表示にしたテーブル上の牌を元に戻す
        visible_table_hais();
        //ボタンを元に戻す
        btn_ankan_img.setAttribute('src', "images/btn/btn_ankan.png");
        btn_pong.style.cursor = "pointer";
        btn_chi.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_pong_img.style.visibility = "visible";
        btn_chi_img.style.visibility = "visible";
        btn_minkan_img.style.visibility = "visible";
        //テロップを通常に変更
        stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        //モードを通常へ
        mode_current = Mode.normal;
    }
}
//明槓
function btn_minkan_click(){
    //明槓の状態で押下
    if(mode_current == Mode.normal){
        //鳴けない牌を非表示にする
        hidden_table_naki(Naki_Type.minkan);
        //明槓以外を隠す
        btn_minkan_img.setAttribute('src', "images/btn/btn_kaijyo.png");
        btn_pong.style.cursor = "default";
        btn_chi.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_pong_img.style.visibility = "hidden";
        btn_chi_img.style.visibility = "hidden";
        btn_ankan_img.style.visibility = "hidden";
        //テロップを明槓に変更
        stateText_change("明槓：明槓する牌を選択してください");
        //モードを明槓へ
        mode_current = Mode.minkan;
    }
    //解除の状態で押下
    else if(mode_current == Mode.minkan){
        //非表示にしたテーブル上の牌を元に戻す
        visible_table_hais();        
        //ボタンを元に戻す
        btn_minkan_img.setAttribute('src', "images/btn/btn_minkan.png");
        btn_pong.style.cursor = "pointer";
        btn_chi.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_pong_img.style.visibility = "visible";
        btn_chi_img.style.visibility = "visible";
        btn_ankan_img.style.visibility = "visible";
        //テロップを通常に変更
        stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        //モードを通常へ
        mode_current = Mode.normal;
    }
}
