//同種牌の最大枚数
const PAI_MAX = 4;

//テーブルの縦と横の数
const SELECT_TABLE_ROW = 4;
const SELECT_TABLE_COLUMN = 9;

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

//風の種類
const Kaze_Type = {
    ton : 0,
    nan : 1,
    sha : 2,
    pei : 3
}

//アガリ方の種類
const Agari_Kata = {
    tsumo : 0,
    ron : 1
}

//牌種
const Hais_Type = {
    manzu : 0,
    pinzu : 1,
    souzu : 2,
    jihai : 3
}

//待ちの形
const Machi_Type = {
    tanki : 0,
    ryanmen : 1,
    shanpon : 2,
    kanchan : 3,
    penchan : 4
}

//符が付与されるパターン
const Fusuu_Pattern = {
    machi_tanki : 0,
    machi_kanchan : 1,
    machi_penchan : 2,
    chuchan_minko : 3,
    chuchan_anko : 4,
    yaochu_minko : 5,
    yaochu_anko : 6,
    chuchan_minkan : 7,
    chuchan_ankan : 8,
    yaochu_minkan : 9,
    yaochu_ankan : 10,
    yakuhai_janto : 11
}

//立直のタイプ
const Reach_Type = {
    none : 0,
    reach : 1,
    doublereach : 2
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

//アガリ牌を記憶
let agari_hai = 0;

//場風
let bakaze = Kaze_Type.ton;
//自風
let jikaze = Kaze_Type.ton;

//立直の種類
let reach_type = Reach_Type.none;

//鳴きボタンのオブジェクト
let btn_pong = document.getElementById('btn_pong');
let btn_chi = document.getElementById('btn_chi');
let btn_ankan = document.getElementById('btn_ankan');
let btn_minkan = document.getElementById('btn_minkan');

//ダイヤログ用のオブジェクト
let modal_noten = document.getElementById('modal_noten');
let modal_noten_body = document.getElementById('modal_noten_body');
let modal_agari = document.getElementById('modal_agari');
let modal_bakaze = document.getElementById('modal_bakaze');
let modal_jikaze = document.getElementById('modal_jikaze');
let modal_setting = document.getElementById('modal_setting');

//手配入力・結果出力画面のオブジェクト
let input_screen = document.getElementById('input_screen');
let output_screen = document.getElementById('output_screen');

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
    table_pai.setAttribute('src', ScriptCore.generate_pai_src(BACK));
}
//指定したテーブルの牌を表示（表にする）
function visible_table_pai(num){
    let table_pai = document.getElementById(num).firstChild;
    table_pai.setAttribute('src', ScriptCore.generate_pai_src(num));   
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

//手牌をカウントしたものを配列として生成
function countHais(){
    let haisCount = ScriptCore.createCountHaisBase();
    for(let i = 0; i < count_tehai_num() - naki_pais_list.length * 3; i++){
        let pai_num = Number(get_tehai_value(i + 1));
        haisCount[Math.floor((pai_num - 1) / 9)][(pai_num - 1) % 9]++;
    }

    return haisCount;
}

//国士無双13面待ちの手牌を生成
function generateKokushi13Tehai(){
    let haisCount = ScriptCore.createCountHaisBase();
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

//再帰的にアガリ牌をブロックとして分割してブロックを返す
function createAgariHaiBlocksRecursive(hais_count, mentsu_count, toitsu_count, tehai_list){
    let result_list = [];
    for(let i = 0; i < PAI_TYPE_NUM; i++){
        let haishu = Math.floor(i / 9);
        let count = hais_count[haishu][i % 9];
        //雀頭、対子の処理
        if(count >= 2){
            let copied_hais = ScriptCore.copyArray(hais_count);
            copied_hais[haishu][i % 9] -= 2;
            let tehai_list_new = ScriptCore.copyArray(tehai_list);
            tehai_list_new.push([i + 1, i + 1]);
            //再帰呼び出し
            result_list = result_list.concat(createAgariHaiBlocksRecursive(copied_hais, mentsu_count, toitsu_count + 1, tehai_list_new));
        }
        //刻子の処理
        if(count >= 3){
            let copied_hais = ScriptCore.copyArray(hais_count);
            copied_hais[haishu][i % 9] -= 3;
            let tehai_list_new = ScriptCore.copyArray(tehai_list);
            tehai_list_new.push([i + 1, i + 1, i + 1]);
            //再帰呼び出し
            result_list = result_list.concat(createAgariHaiBlocksRecursive(copied_hais, mentsu_count + 1, toitsu_count, tehai_list_new));
        }

        //字牌なら対子、刻子の処理のみで終了させる
        if(i + 1 >= JIHAI[0] && i + 1 <= JIHAI[6]){
            continue;
        }

        //順子（面子）の処理
        if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
            let copied_hais = ScriptCore.copyArray(hais_count);
            copied_hais[haishu][i % 9]--;
            copied_hais[haishu][i % 9 + 1]--;
            copied_hais[haishu][i % 9 + 2]--;
            let tehai_list_new = ScriptCore.copyArray(tehai_list);
            tehai_list_new.push([i + 1, i + 2, i + 3]);
            //再帰呼び出し
            result_list = result_list.concat(createAgariHaiBlocksRecursive(copied_hais, mentsu_count + 1, toitsu_count, tehai_list_new));
        }
    }
    //分割完了時、4面子1雀頭または対子が7つまたは国士無双であればリストに追加
    if((mentsu_count + naki_pais_list.length == 4 && toitsu_count == 1) || toitsu_count == 7){
        result_list.push(tehai_list.sort());
    }

    return result_list;
}

//テスト（分解結果を返す）
function test_getAgariBlockResult(){
    let hais_count = countHais();
    let result_list = new Array(1);
    result_list = createAgariHaiBlocksRecursive(hais_count, 0, 0, []);
    result_list = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);

    for(let i = 0; i < result_list.length; i++){
        //手牌のリストを一定のルールでソートする
        tehaiListSort(result_list[i]);
    }
    
    return result_list;
}

//4面子1雀頭のシャンテン数を判定
function calcIppanteShanten(haisCount){
    //分解結果を記憶する変数
    let result_list = new Array(1);
    result_list = ScriptCore.createTenpaiHaiBlocksRecursive(haisCount, 0, 0, 0, naki_pais_list.length, machihai_list);
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
    if(result_list.length == 0 && ScriptCore.searchNokoriHai(haisCount).length == 1){
        min_shanten = 0;
        machihai_list.push(ScriptCore.searchNokoriHai(haisCount)[0]);
    }

    //最小のシャンテン数を返す
    return min_shanten;
}

//国士無双のシャンテン数を判定
function calcKokushiShanten(haisCount){
    let has_janto = false;
    let yaochu_count = 0;
    let copied_hais = ScriptCore.copyArray(haisCount);

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
    let copied_hais = ScriptCore.copyArray(haisCount);

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
        let machihai = ScriptCore.searchNokoriHai(copied_hais)[0];
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
    set_tehai_img(tehai_current + 1, ScriptCore.generate_pai_src(num));
    set_tehai_value(tehai_current + 1, num);
    tehai_current++;
    tehai_sort();

    //牌の上限の4枚に到達したらテーブル上のその牌を裏返しにする
    if(count_tehai_pai(num) >= PAI_MAX){
        hidden_table_pai(num);
        max_pais_list.push(num);
    }
}

//面前かどうか判定する
function isMenzen(){
    for(let i = 0; i < naki_type_list.length; i++){
        //暗槓以外の鳴きがあれば面前でないとみなす
        if(naki_type_list[i] != Naki_Type.ankan){
            return false;
        }
    }

    return true;
}

//場風の変更
function changeBakaze(bakaze_new){
    let btn_bakaze = document.getElementById('btn_bakaze');
    let btn_ton = document.getElementById('btn_bakaze_ton');
    let btn_nan = document.getElementById('btn_bakaze_nan');
    let btn_sha = document.getElementById('btn_bakaze_sha');
    let btn_pei = document.getElementById('btn_bakaze_pei');
    //現在の場風のボタンを表示させる
    switch (bakaze){
        //東
        case Kaze_Type.ton:
            btn_ton.style.display = "inline";
            break;
        //南
        case Kaze_Type.nan:
            btn_nan.style.display = "inline";
            break;
        //西
        case Kaze_Type.sha:
            btn_sha.style.display = "inline";
            break;
        //北
        case Kaze_Type.pei:
            btn_pei.style.display = "inline";
            break;
    }
    //場風の変更とそのボタンを非表示
    switch (bakaze_new){
        //東
        case Kaze_Type.ton:
            bakaze = bakaze_new;
            btn_bakaze.firstChild.innerText = "場風(東)"
            btn_ton.style.display = "none";
            break;
        //南
        case Kaze_Type.nan:
            bakaze = bakaze_new;
            btn_bakaze.firstChild.innerText = "場風(南)"
            btn_nan.style.display = "none";
            break;
        //西
        case Kaze_Type.sha:
            bakaze = bakaze_new;
            btn_bakaze.firstChild.innerText = "場風(西)"
            btn_sha.style.display = "none";
            break;
        //北
        case Kaze_Type.pei:
            bakaze = bakaze_new;
            btn_bakaze.firstChild.innerText = "場風(北)"
            btn_pei.style.display = "none";
            break;
    }

    //自風のダイヤログを閉じる
    modalBakazeClose();
}

//自風の変更
function changeJikaze(jikaze_new){
    let btn_jikaze = document.getElementById('btn_jikaze');
    let btn_ton = document.getElementById('btn_jikaze_ton');
    let btn_nan = document.getElementById('btn_jikaze_nan');
    let btn_sha = document.getElementById('btn_jikaze_sha');
    let btn_pei = document.getElementById('btn_jikaze_pei');
    //天和、地和のボタンのp要素を取得
    let tenchi_p = document.getElementById('tenchi_p');
    //現在の自風のボタンを表示させる
    switch (jikaze){
        //東
        case Kaze_Type.ton:
            btn_ton.style.display = "inline";
            break;
        //南
        case Kaze_Type.nan:
            btn_nan.style.display = "inline";
            break;
        //西
        case Kaze_Type.sha:
            btn_sha.style.display = "inline";
            break;
        //北
        case Kaze_Type.pei:
            btn_pei.style.display = "inline";
            break;
    }
    //自風の変更とそのボタンを非表示
    switch (jikaze_new){
        //東
        case Kaze_Type.ton:
            jikaze = jikaze_new;
            btn_jikaze.firstChild.innerText = "自風(東)"
            btn_ton.style.display = "none";
            tenchi_p.innerText = "天和";
            break;
        //南
        case Kaze_Type.nan:
            jikaze = jikaze_new;
            btn_jikaze.firstChild.innerText = "自風(南)"
            btn_nan.style.display = "none";
            tenchi_p.innerText = "地和";
            break;
        //西
        case Kaze_Type.sha:
            jikaze = jikaze_new;
            btn_jikaze.firstChild.innerText = "自風(西)"
            btn_sha.style.display = "none";
            tenchi_p.innerText = "地和";
            break;
        //北
        case Kaze_Type.pei:
            jikaze = jikaze_new;
            btn_jikaze.firstChild.innerText = "自風(北)"
            btn_pei.style.display = "none";
            tenchi_p.innerText = "地和";
            break;
    }

    //自風のダイヤログを閉じる
    modalJikazeClose();
}

//風の種類から牌の種類を取得
function kazeTypeToHaishu(kaze_type){
    if(kaze_type == Kaze_Type.ton){
        return JIHAI[0];
    }
    else if(kaze_type == Kaze_Type.nan){
        return JIHAI[1];
    }
    else if(kaze_type == Kaze_Type.sha){
        return JIHAI[2];
    }
    else if(kaze_type == Kaze_Type.pei){
        return JIHAI[3];
    }
    else{
        return -1;
    }
}

//役牌が付く牌かどうか調べる
function isYakuhaiPai(haishu){
    //自風牌
    if(haishu == kazeTypeToHaishu(jikaze)){
        return true;
    }
    //場風牌
    if(haishu == kazeTypeToHaishu(bakaze)){
        return true;
    }
    //三元牌
    if(haishu == JIHAI[4] || haishu == JIHAI[5] || haishu == JIHAI[6]){
        return true;
    }

    //どれにも当てはまらなければ役牌は付かない
    return false;
}

//配列同士が等しいかどうか判定する
function array_equal(a, b){
    if(!Array.isArray(a)) return false;
    if(!Array.isArray(b)) return false;
    if(a.length != b.length) return false;
    for(let i = 0; i < a.length; i++){
        if(a[i] !== b[i]){
            return false;
        }
    }
    return true;
}

//国士無双の雀頭を取得（国士無双成立時のみ使用）
function getKokushiJanto(hais_count){
    for(let i = 0; i < hais_count.length; i++){
        for(let j = 0; j < hais_count[i].length; j++){
            //2枚以上あれば対子として返す
            if(hais_count[i][j] >= 2){
                return (i * 9) + (j + 1);
            }
        }
    }

    return -1;
}

//九連宝燈の一枚多い牌を取得（九連宝燈成立時のみ使用）
function getChurenMuchHai(hais_count){
    //数牌のみ判定
    for(let i = 0; i < hais_count.length - 1; i++){
        for(let j = 0; j < hais_count[i].length; j++){
            //1、9の場合は4枚あれば1枚多い
            if(j == 0 || j == 8){
                if(hais_count[i][j] == 4){
                    return (i * 9) + (j + 1);
                }
            }
            //2～8の場合は2枚あれば1枚多い
            else{
                if(hais_count[i][j] == 2){
                    return (i * 9) + (j + 1);
                }
            }
        }
    }

    return -1;
}

//手配のリストを一定のルールでソートする
function tehaiListSort(tehai_list){
    //数値の小さい面子、対子の順にソートする
    for(let i = 0; i < tehai_list.length - 1; i++){
        let m = i;
        for(let j = i + 1; j < tehai_list.length; j++){
            if(tehai_list[j][0] < tehai_list[m][0]){
                m = j;
            }
        }
        let temp = tehai_list[i];
        tehai_list[i] = tehai_list[m];
        tehai_list[m] = temp;
    }

    //4面子1雀頭の場合のみ雀頭を先頭にソートする
    if(tehai_list.length + naki_pais_list.length == 5){
        let toitsu_index = 0;
        //対子を探す
        for(let i = 0; i < 5; i++){
            //対子があればそのインデックスを取得する
            if(tehai_list[i].length == 2){
                toitsu_index = i;
                break;
            }
        }
        //ソート
        for(let i = toitsu_index; i > 0; i--){
            let temp = tehai_list[i];
            tehai_list[i] = tehai_list[i - 1];
            tehai_list[i - 1] = temp;
        }
    }
}

//配列から指定した個数を取り出した組み合わせを生成する
function getArrayCombination(nums, k){
    let result = [];
    if(nums.length < k){
        return [];
    }
    if(k === 1){
        for(let i = 0; i < nums.length; i++){
            result[i] = [nums[i]];
        }
    }
    else{
        for(let i = 0; i < nums.length - k + 1; i++){
            let row = getArrayCombination(nums.slice(i + 1), k - 1);
            for(let j = 0; j < row.length; j++){
                result.push([nums[i]].concat(row[j]));
            }
        }
    }

    return result;
}

//刻子かどうかを判定
function isCotsu(mentsu_list){
    if(mentsu_list.length != 3){
        return false;
    }
    for(let i = 0; i < mentsu_list.length - 1; i++){
        if(mentsu_list[i] != mentsu_list[i + 1]){
            return false;
        }
    }

    return true;
}

//雀頭かどうか判定
function isJanto(mentsu_list){
    if(mentsu_list.length != 2){
        return false;
    }
    for(let i = 0; i < mentsu_list.length - 1; i++){
        if(mentsu_list[i] != mentsu_list[i + 1]){
            return false;
        }
    }

    return true;
}

//老頭牌かどうか判定
function isRotohai(pai_num){
    if((((pai_num - 1) % 9 == 0 || (pai_num - 1) % 9 == 8) && pai_num < JIHAI[0])){
        return true;
    }
    else{
        return false;
    }
}

//么九牌かどうか判定
function isYaochuhai(pai_num){
    if(((pai_num - 1) % 9 == 0 || (pai_num - 1) % 9 == 8 || (pai_num >= JIHAI[0] && pai_num <= JIHAI[6]))){
        return true;
    }
    else{
        return false;
    }
}

//待ちの形を取得する
function getMachiTypes(agari_list){
    let result_list = [];
    //手牌のみを見る
    for(let i = 0; i < agari_list.length; i++){
        //面子、雀頭の先頭の牌
        let haishu_first = agari_list[i][0];
        //雀頭
        if(isJanto(agari_list[i])){
            //アガリ牌が先頭の牌と一致すれば単騎待ち
            if(agari_hai == haishu_first){
                if(!(result_list.includes(Machi_Type.tanki))){
                    result_list.push(Machi_Type.tanki);
                }
            }
        }
        //刻子
        else if(isCotsu(agari_list[i])){
            //アガリ牌が先頭の牌と一致すればシャンポン待ち
            if(agari_hai == haishu_first){
                if(!(result_list.includes(Machi_Type.shanpon))){
                    result_list.push(Machi_Type.shanpon);
                }
            }
        }
        //順子
        else{
            //2番目の牌
            let haishu_middle = agari_list[i][1];
            //3番目の牌
            let haishu_last = agari_list[i][2];

            //順子のタイプが1,2,3のとき、ペンチャン待ちかどうか調べる
            if(haishu_first % 9 == 1){
                //アガリ牌が数牌の3であればペンチャン待ち
                if(agari_hai == haishu_last){
                    if(!(result_list.includes(Machi_Type.penchan))){
                        result_list.push(Machi_Type.penchan);
                    }
                    continue;
                }
            }
            //順子のタイプが7,8,9のときもペンチャンかどうか調べる
            if(haishu_first % 9 == 7){
                //アガリ牌が数牌の7であればペンチャン待ち
                if(agari_hai == haishu_first){
                    if(!(result_list.includes(Machi_Type.penchan))){
                        result_list.push(Machi_Type.penchan);
                    }
                    continue;
                }
            }

            //カンチャンを調べる
            if(agari_hai == haishu_middle){
                if(!(result_list.includes(Machi_Type.kanchan))){
                    result_list.push(Machi_Type.kanchan);
                }
            }

            //両面を調べる
            if(agari_hai == haishu_first || agari_hai == haishu_last){
                if(!(result_list.includes(Machi_Type.ryanmen))){
                    result_list.push(Machi_Type.ryanmen);
                }
            }
        }
    }

    return result_list;
}

//順子の先頭のリストを生成する
function getShuntsuTopList(agari_list){
    let shuntsu_list = [];
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //順子であれば先頭の牌を格納
        if(!(isCotsu(agari_list[i]) || isJanto(agari_list[i]))){
            let haishu = agari_list[i][0];
            shuntsu_list.push(haishu);
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チーであれば先頭の牌を格納
        if(naki_type_list[i] == Naki_Type.chi){
            let haishu = naki_pais_list[i];
            shuntsu_list.push(haishu);
        }
    }

    //順子のリストを昇順にソート
    shuntsu_list.sort((a, b) => {return a - b});

    return shuntsu_list;
}

//刻子の先頭のリストを生成する
function getKotsuTopList(agari_list){
    let kotsu_list = [];
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //刻子であれば先頭の牌を格納
        if(isCotsu(agari_list[i])){
            let haishu = agari_list[i][0];
            kotsu_list.push(haishu);    
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外であれば先頭の牌を格納
        if(!(naki_type_list[i] == Naki_Type.chi)){
            let haishu = naki_pais_list[i];
            kotsu_list.push(haishu);
        }
    }

    //刻子のリストを昇順にソート
    kotsu_list.sort((a, b) => {return a - b});

    return kotsu_list;
}

//牌種の特定
function getHaishu(pai_num){
    //萬子
    if(pai_num >= MANZU[0] && pai_num <= MANZU[8]){
        return Hais_Type.manzu;
    }
    //筒子
    else if(pai_num >= PINZU[0] && pai_num <= PINZU[8]){
        return Hais_Type.pinzu;
    }
    //索子
    else if(pai_num >= SOUZU[0] && pai_num <= SOUZU[8]){
        return Hais_Type.souzu;
    }
    //字牌
    else if(pai_num >= JIHAI[0] && pai_num <= JIHAI[6]){
        return Hais_Type.jihai;
    }
    else{
        return -1;
    }
}

//天和の判定
function isTenho(){
    let tenchi_flg = document.getElementById('radio_tenchi').checked;
    //天和、地和のラジオボタンがONかつ親であれば天和
    if(tenchi_flg && jikaze == Kaze_Type.ton){
        return true;
    }
    else{
        return false;
    }
}

//地和の判定
function isChiho(){
    let tenchi_flg = document.getElementById('radio_tenchi').checked;
    //天和、地和のラジオボタンがONかつ子であれば天和
    if(tenchi_flg && jikaze != Kaze_Type.ton){
        return true;
    }
    else{
        return false;
    }
}

//四暗刻の判定
function isSuuanko(agari_list, agari_kata){
    //面前役
    if(isMenzen()){
        let anko_count = 0;
        //手牌を見る
        for(let i = 0; i < agari_list.length; i++){
            //面子が刻子かどうか調べる
            if(isCotsu(agari_list[i])){
                //アガリ牌が刻子のロンの場合、暗刻として認めない
                if(!(agari_hai == agari_list[i][0] && agari_kata == Agari_Kata.ron)){
                    anko_count++;
                }
            }
        }
        //鳴き牌を見る
        for(let i = 0; i < naki_type_list.length; i++){
            //暗槓の場合、暗刻としてカウントする
            if(naki_type_list[i] == Naki_Type.ankan){
                anko_count++;
            }
        }

        //暗刻が4個であれば四暗刻
        if(anko_count == 4){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

//大三元の判定
function isDaisangen(agari_list){
    //三元牌があるかどうかのフラグ
    let haku_exist = false;
    let hatsu_exist = false;
    let chun_exist = false;
    
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //面子が刻子かどうか調べる
        if(isCotsu(agari_list[i])){
            let haishu = agari_list[i][0];
            //白かどうか
            if(haishu == JIHAI[4]){
                haku_exist = true;
            }
            //発かどうか
            else if(haishu == JIHAI[5]){
                hatsu_exist = true;
            }
            //中かどうか
            else if(haishu == JIHAI[6]){
                chun_exist = true;
            }
        }
    }
    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合を対象にする
        if(!(naki_type_list[i] == Naki_Type.chi)){
            //白かどうか
            if(naki_pais_list[i] == JIHAI[4]){
                haku_exist = true;
            }
            //発かどうか
            else if(naki_pais_list[i] == JIHAI[5]){
                hatsu_exist = true;
            }
            //中かどうか
            else if(naki_pais_list[i] == JIHAI[6]){
                chun_exist = true;
            }
        }
    }

    //三種類とも含まれていれば役が成立
    if(haku_exist && hatsu_exist && chun_exist){
        return true;
    }
    else{
        return false;
    }
}

//四喜和の判定
function hanteiSushiho(agari_list){
    //四風牌があるかどうかのフラグ
    let ton_exist = false;
    let nan_exist = false;
    let sha_exist = false;
    let pei_exist = false;
    let janto_kazehai = false;

    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let haishu = agari_list[i][0];
        let found_flg = false;
        //東かどうか
        if(haishu == JIHAI[0]){
            ton_exist = true;
            found_flg = true;
        }
        //南かどうか
        else if(haishu == JIHAI[1]){
            nan_exist = true;
            found_flg = true;
        }
        //西かどうか
        else if(haishu == JIHAI[2]){
            sha_exist = true;
            found_flg = true;
        }
        //北かどうか
        else if(haishu == JIHAI[3]){
            pei_exist = true;
            found_flg = true;
        }

        //雀頭であれば雀頭フラグをONにする
        if(found_flg && agari_list[i].length == 2){
            janto_kazehai = true;
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合を対象にする
        if(!(naki_type_list[i] == Naki_Type.chi)){
           //東かどうか
           if(naki_pais_list[i] == JIHAI[0]){
                ton_exist = true;
            }
            //南かどうか
            else if(naki_pais_list[i] == JIHAI[1]){
                nan_exist = true;
            }
            //西かどうか
            else if(naki_pais_list[i] == JIHAI[2]){
                sha_exist = true;
            }
            //北かどうか
            else if(naki_pais_list[i] == JIHAI[3]){
                pei_exist = true;
            }
        }
    }

    //3種類が刻子、1種類が雀頭であれば小四喜が成立
    if(ton_exist && nan_exist && sha_exist && pei_exist && janto_kazehai){
        return 0;
    }
    //4種類とも刻子であれば大四喜が成立
    else if(ton_exist && nan_exist && sha_exist && pei_exist){
        return 1;
    }
    else{
        return -1;
    }
}

//字一色の判定
function isTsuiso(agari_list){
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let haishu = agari_list[i][0];
        //牌の先頭が字牌でなければ字一色でない
        if(!(haishu >= JIHAI[0] && haishu <= JIHAI[6])){
            return false;
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        if(!(naki_pais_list[i] >= JIHAI[0] && naki_pais_list[i] <= JIHAI[6])){
            return false;
        }
    }

    //全て字牌であれば役が成立
    return true;
}

//清老頭の判定
function isChinroto(agari_list){
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //刻子または雀頭の場合
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            let haishu = agari_list[i][0];
            //先頭の牌が老頭牌でなければ不成立
            if(!(isRotohai(haishu))){
                return false;
            }
        }
        //順子の場合は不成立
        else{
            return false;
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            let haishu = naki_pais_list[i];
            //牌が老頭牌でなければ不成立
            if(!(isRotohai(haishu))){
                return false;
            }
        }
        //チーがあれば不成立
        else{
            return false;
        }
    }

    //条件に全て合致すれば役が成立
    return true;
}

//緑一色の判定
function isRyuiso(agari_list){
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let haishu = agari_list[i][0];
        //刻子または雀頭の場合
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            //先頭の牌が索子の2,3,4,6,8または発でなければ不成立
            if(!(haishu == SOUZU[1] || haishu == SOUZU[2] || haishu == SOUZU[3] || haishu == SOUZU[5] || haishu == SOUZU[7] || haishu == JIHAI[5])){
                return false;
            }
        }
        //順子の場合
        else{
            //先頭の牌が索子の2でなければ不成立
            if(!(haishu == SOUZU[1])){
                return false;
            }
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        let haishu = naki_pais_list[i];
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            //牌が索子の2,3,4,6,8または発でなければ不成立
            if(!(haishu == SOUZU[1] || haishu == SOUZU[2] || haishu == SOUZU[3] || haishu == SOUZU[5] || haishu == SOUZU[7] || haishu == JIHAI[5])){
                return false;
            }
        }
        //チーの場合
        else{
            //先頭の牌が索子の2でなければ不成立
            if(!(haishu == SOUZU[1])){
                return false;
            }
        }
    }

    //条件に全て合致すれば役が成立
    return true;
}

//九連宝燈の判定
function isChurenPoto(agari_list){
    //面前の清一色を前提条件とする
    if(hanteiChinitsu(agari_list) == 6){
        let hais_count = new Array(9).fill(0);
        //手牌を見る
        for(let i = 0; i < agari_list.length; i++){
            for(let j = 0; j < agari_list[i].length; j++){
                let pai_num = agari_list[i][j];
                //対応する数牌のカウントを1増やす
                hais_count[(pai_num - 1) % 9]++;
            }
        }
        //牌のカウントを確認
        for(let i = 0; i < hais_count.length; i++){
            //1、9の場合は3枚以上必要
            if(i == 0 || i == 8){
                if(hais_count[i] < 3){
                    return false;
                }
            }
            //2～8は1枚以上必要
            else{
                if(hais_count[i] < 1){
                    return false;
                }
            }
        }

        //すべての条件が成立したら役が成立
        return true;
    }
    else{
        return false;
    }
}

//四槓子の判定
function isSuukantsu(){
    let kan_count = 0;
    //鳴き牌のみを見る
    for(let i = 0; i < naki_type_list.length; i++){
        //暗槓、明槓の両方をカウントする
        if(naki_type_list[i] == Naki_Type.ankan || naki_type_list[i] == Naki_Type.minkan){
            kan_count++;
        }
    }

    //カンが4回あれば役が成立
    if(kan_count == 4){
        return true;
    }
    else{
        return false;
    }
}

//面前清自模（ツモ）の判定
function isMenzenTsumo(agari_kata){
    //ツモかつ面前であれば成立
    if(agari_kata == Agari_Kata.tsumo && isMenzen()){
        return true;
    }
    else{
        return false;
    }
}

//断么九（タンヤオ）の判定
function isTanyao(agari_list){
    let kuitan_flg = false;
    //喰いタンの場合面前役
    if(!kuitan_flg || isMenzen()){
        //手牌を見る
        for(let i = 0; i < agari_list.length; i++){
            let haishu = agari_list[i][0];
            //刻子または雀頭の場合
            if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
                //先頭の牌が么九牌であれば不成立
                if(isYaochuhai(haishu)){
                    return false;
                }
            }
            //順子の場合
            else{
                //先頭の牌が数牌の1、7、または字牌であれば不成立
                if(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) || (haishu >= JIHAI[0] && haishu <= JIHAI[6])){
                    return false;
                }
            }
        }

        //鳴き牌を見る
        for(let i = 0; i < naki_type_list.length; i++){
            let haishu = naki_pais_list[i];
            //チー以外の場合
            if(!(naki_type_list[i] == Naki_Type.chi)){
                //先頭の牌が数牌の1または9でなければ不成立
                if(isYaochuhai(haishu)){
                    return false;
                }
            }
            //チーの場合
            else{
                //先頭の牌が数牌の1または7でなければ不成立
                if(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) || (haishu >= JIHAI[0] && haishu <= JIHAI[6])){
                    return false;
                }
            }
        }

        //すべての条件に合致したら役が成立
        return true;
    }
    else{
        return false;
    }
}

//平和の判定
function isPinfu(agari_list, machitype_list){
    //面前役
    if(isMenzen()){
        let shuntsu_count = 0;
        //手牌のみを見る
        for(let i = 0; i < agari_list.length; i++){
            //雀頭があれば役牌でないかを確認
            if(isJanto(agari_list[i])){
                let haishu = agari_list[i][0];
                //役牌であれば不成立
                if(isYakuhaiPai(haishu)){
                    return false;
                }
            }
            //順子があればカウントする
            if(!(isCotsu(agari_list[i]) || isJanto(agari_list[i]))){
                shuntsu_count++;
            }
        }

        //順子が4つ存在かつ待ちのリストに両面待ちが含まれていれば成立
        if(shuntsu_count == 4 && machitype_list.includes(Machi_Type.ryanmen)){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

//一盃口の判定
function isIpeko(agari_list){
    //二盃口が成立しないこと
    if(isRyanpeko(agari_list)){
        return false;
    }

    //面前役
    if(isMenzen()){
        //順子の先頭の牌のリスト
        let shuntsu_list = getShuntsuTopList(agari_list);

        //順子の数が2面子以下であれば不成立
        if(shuntsu_list.length < 2){
            return false;
        }
        //順子が2個以上の場合
        else{
            //順子のリストから2個ずつ取り出した組み合わせを生成する
            let shuntsu_pattern = getArrayCombination(shuntsu_list, 2);
            let ipeko_flg = false;
            //組み合わせの個数分の判定を行う
            for(let i = 0; i < shuntsu_pattern.length; i++){
                //一盃口が見つかればループを抜ける
                if(shuntsu_pattern[i][0] == shuntsu_pattern[i][1]){
                    ipeko_flg = true;
                    break;
                }
            }

            //一盃口が見つかっていれば役が成立
            if(ipeko_flg){
                return true;
            }
            else{
                return false;
            }
        }
    }
    else{
        return false;
    }
}

//役牌の判定
function isYakuhai(agari_list, yakuhai_type){
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //刻子の場合
        if(isCotsu(agari_list[i])){
            let haishu = agari_list[i][0];
            //先頭の牌が役牌であれば不成立
            if(haishu == yakuhai_type){
                return true;
            }
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            let haishu = naki_pais_list[i];
            //先頭の牌が役牌であれば不成立
            if(haishu == yakuhai_type){
                return true;
            }
        }
    }

    //役牌が見つからなければ不成立
    return false;
}

//清一色の判定
function hanteiChinitsu(agari_list){
    //数牌の牌種を特定する
    let firstHai = agari_list[0][0];
    let hai_type = getHaishu(firstHai);
    //字牌の場合は不成立
    if(hai_type == Hais_Type.jihai || hai_type == -1){
        return 0;
    }

    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let pai_num = agari_list[i][0];
        //萬子の場合
        if(hai_type == Hais_Type.manzu){
            //萬子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.manzu)){
                return 0;
            }
        }
        //筒子の場合
        else if(hai_type == Hais_Type.pinzu){
            //筒子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.pinzu)){
                return 0;
            }
        }
        //索子の場合
        else if(hai_type == Hais_Type.souzu){
            //索子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.souzu)){
                return 0;
            }
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        let pai_num = naki_pais_list[i];
        //萬子の場合
        if(hai_type == Hais_Type.manzu){
            //萬子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.manzu)){
                return 0;
            }
        }
        //筒子の場合
        else if(hai_type == Hais_Type.pinzu){
            //筒子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.pinzu)){
                return 0;
            }
        }
        //索子の場合
        else if(hai_type == Hais_Type.souzu){
            //索子でなければ不成立
            if(!(getHaishu(pai_num) == Hais_Type.souzu)){
                return 0;
            }
        }
    }

    //面前であれば6翻
    if(isMenzen()){
        return 6;
    }
    //面前でなければ5翻
    else{
        return 5;
    }
}

//純全帯么九（純チャン）の判定
function hanteiJyunchan(agari_list){
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let haishu = agari_list[i][0];
        //刻子または雀頭の場合
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            //先頭の牌が数牌の1または9でなければ不成立
            if(!(isRotohai(haishu))){
                return 0;
            }
        }
        //順子の場合
        else{
            //先頭の牌が数牌の1または7でなければ不成立
            if(!(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) && haishu < JIHAI[0])){
                return 0;
            }
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        let haishu = naki_pais_list[i];
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            //先頭の牌が数牌の1または9でなければ不成立
            if(!(isRotohai(haishu))){
                return 0;
            }
        }
        //チーの場合
        else{
            //先頭の牌が数牌の1または7でなければ不成立
            if(!(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) && haishu < JIHAI[0])){
                return 0;
            }
        }
    }

    //面前であれば3翻
    if(isMenzen()){
        return 3;
    }
    //面前でなければ2翻
    else{
        return 2;
    }
}

//二盃口の判定
function isRyanpeko(agari_list){
    //面前かつ鳴きがない役（4面子1雀頭であること）
    if(naki_pais_list.length == 0 && agari_list.length == 5){
        //全ての面子が順子であるかどうか
        for(let i = 0; i < agari_list.length; i++){
            //雀頭はスキップ
            if(isJanto(agari_list[i])){
                continue;
            }
            //刻子なら不成立
            if(isCotsu(agari_list[i])){
                return false;
            }
        }

        //1つ目の順子と2つ目の順子を比較して一致してなければ不成立
        if(!(array_equal(agari_list[1], agari_list[2]))){
            return false;
        }
        //3つ目と4つ目も同様の処理
        if(!(array_equal(agari_list[3], agari_list[4]))){
            return false;
        }

        //すべての条件が成立したら役が成立
        return true;
    }
    //暗槓問わず鳴きが一つでもあれば不成立
    else{
        return false;
    }
}

//混一色の判定
function hanteiHonitsu(agari_list){
    //持ち牌の字牌の数が0であれば不成立
    if(count_zihai_num() == 0){
        return 0;
    }
    //数牌の牌種（数牌が見つかるまでは字牌にしておく）
    let hai_type = Hais_Type.jihai;

    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let pai_num = agari_list[i][0];
        let haishu = getHaishu(pai_num);
        //萬子の場合
        if(hai_type == Hais_Type.manzu){
            //萬子または字牌でなければ不成立
            if(!(haishu == Hais_Type.manzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //筒子の場合
        else if(hai_type == Hais_Type.pinzu){
            //筒子または字牌でなければ不成立
            if(!(haishu == Hais_Type.pinzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //索子の場合
        else if(hai_type == Hais_Type.souzu){
            //索子または字牌でなければ不成立
            if(!(haishu == Hais_Type.souzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //数牌がまだ見つかっていない場合
        else if(hai_type == Hais_Type.jihai){
            //牌種を特定する
            hai_type = getHaishu(pai_num);
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        let pai_num = naki_pais_list[i];
        let haishu = getHaishu(pai_num);
        //萬子の場合
        if(hai_type == Hais_Type.manzu){
            //萬子または字牌でなければ不成立
            if(!(haishu == Hais_Type.manzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //筒子の場合
        else if(hai_type == Hais_Type.pinzu){
            //筒子または字牌でなければ不成立
            if(!(haishu == Hais_Type.pinzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //索子の場合
        else if(hai_type == Hais_Type.souzu){
            //索子または字牌でなければ不成立
            if(!(haishu == Hais_Type.souzu || haishu == Hais_Type.jihai)){
                return 0;
            }
        }
        //数牌がまだ見つかっていない場合
        else if(hai_type == Hais_Type.jihai){
            //牌種を特定する
            hai_type = getHaishu(pai_num);
        }
    }

    //面前であれば3翻
    if(isMenzen()){
        return 3;
    }
    //面前でなければ2翻
    else{
        return 2;
    }
}

//小三元の判定
function isShosangen(agari_list){
    //三元牌があるかどうかのフラグ
    let haku_exist = false;
    let hatsu_exist = false;
    let chun_exist = false;
    let janto_flg = false;
    
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //面子が刻子または順子どうか調べる
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            let haishu = agari_list[i][0];
            let found_flg = false;
            //白かどうか
            if(haishu == JIHAI[4]){
                haku_exist = true;
                found_flg = true;
            }
            //発かどうか
            else if(haishu == JIHAI[5]){
                hatsu_exist = true;
                found_flg = true;
            }
            //中かどうか
            else if(haishu == JIHAI[6]){
                chun_exist = true;
                found_flg = true;
            }

            if(found_flg && isJanto(agari_list[i])){
                janto_flg = true;
            }
        }
    }
    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合を対象にする
        if(!(naki_type_list[i] == Naki_Type.chi)){
            let haishu = naki_pais_list[i];
            //白かどうか
            if(haishu == JIHAI[4]){
                haku_exist = true;
            }
            //発かどうか
            else if(haishu == JIHAI[5]){
                hatsu_exist = true;
            }
            //中かどうか
            else if(haishu == JIHAI[6]){
                chun_exist = true;
            }
        }
    }

    //二種類の刻子と一種類の雀頭の組み合わせであれば役が成立
    if(haku_exist && hatsu_exist && chun_exist && janto_flg){
        return true;
    }
    else{
        return false;
    }
}

//混老頭の判定
function isHonRoto(agari_list){
    //持ち牌の字牌の数が0であれば不成立
    if(count_zihai_num() == 0){
        return false;
    }

    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //刻子または雀頭の場合
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            let haishu = agari_list[i][0];
            //先頭の牌が么九牌でなければ不成立
            if(!(isYaochuhai(haishu))){
                return false;
            }
        }
        //順子の場合は不成立
        else{
            return false;
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            let haishu = naki_pais_list[i];
            //牌が老頭牌でなければ不成立
            if(!(isYaochuhai(haishu))){
                return false;
            }
        }
        //チーがあれば不成立
        else{
            return false;
        }
    }

    //条件に全て合致すれば役が成立
    return true;
}

//混全帯么九（チャンタ）の判定
function haiteiChanta(agari_list){
    //持ち牌の字牌の数が0であれば不成立
    if(count_zihai_num() == 0){
        return 0;
    }
    //順子が含まれているかのフラグ
    let flg_shuntsu = false;

    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        let haishu = agari_list[i][0];
        //刻子または雀頭の場合
        if(isCotsu(agari_list[i]) || isJanto(agari_list[i])){
            //先頭の牌が数牌の1または9でなければ不成立
            if(!(isYaochuhai(haishu))){
                return 0;
            }
        }
        //順子の場合
        else{
            //先頭の牌が数牌の1、7、または字牌でなければ不成立
            if(!(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) || (haishu >= JIHAI[0] && haishu <= JIHAI[6]))){
                return 0;
            }
            flg_shuntsu = true;
        }
    }

    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        let haishu = naki_pais_list[i];
        //チー以外の場合
        if(!(naki_type_list[i] == Naki_Type.chi)){
            //先頭の牌が数牌の1または9でなければ不成立
            if(!(isYaochuhai(haishu))){
                return 0;
            }
        }
        //チーの場合
        else{
            //先頭の牌が数牌の1、7、または字牌でなければ不成立
            if(!(((haishu - 1) % 9 == 0 || (haishu - 1) % 9 == 6) || (haishu >= JIHAI[0] && haishu <= JIHAI[6]))){
                return 0;
            }
            flg_shuntsu = true;
        }
    }

    //順子がなければ混老頭と同じになってしまうので不成立
    if(flg_shuntsu){
        //面前であれば2翻
        if(isMenzen()){
            return 2;
        }
        //面前でなければ1翻
        else{
            return 1;
        }
    }
    else{
        return 0;
    }
}

//三暗刻の判定
function isSananko(agari_list, agari_kata){
    let anko_count = 0;
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //面子が刻子かどうか調べる
        if(isCotsu(agari_list[i])){
            //アガリ牌が刻子のロンの場合、暗刻として認めない
            if(!(agari_hai == agari_list[i][0] && agari_kata == Agari_Kata.ron)){
                anko_count++;
            }
        }
    }
    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //暗槓の場合、暗刻としてカウントする
        if(naki_type_list[i] == Naki_Type.ankan){
            anko_count++;
        }
    }

    //暗刻が3個であれば三暗刻
    if(anko_count == 3){
        return true;
    }
    else{
        return false;
    }
}

//対々和の判定
function isToitoi(agari_list){
    let kotsu_count = 0;
    //手牌を見る
    for(let i = 0; i < agari_list.length; i++){
        //刻子であればカウント
        if(isCotsu(agari_list[i])){
            kotsu_count++;
        }
    }
    //鳴き牌を見る
    for(let i = 0; i < naki_type_list.length; i++){
        //チーでなければカウント
        if(!(naki_type_list[i] == Naki_Type.chi)){
            kotsu_count++;
        }
    }

    //刻子が4つあれば役が成立
    if(kotsu_count == 4){
        return true;
    }
    else{
        return false;
    }
}

//三色同順の判定
function hanteiSanshokuDojyun(agari_list){
    //順子の先頭の牌のリスト
    let shuntsu_list = getShuntsuTopList(agari_list);

    //順子の数が3面子以下であれば不成立
    if(shuntsu_list.length < 3){
        return 0;
    }
    //順子が3個以上の場合
    else{
        //順子のリストから3個ずつ取り出した組み合わせを生成する
        let shuntsu_pattern = getArrayCombination(shuntsu_list, 3);
        let sanshoku_flg = false;
        //組み合わせの個数分の判定を行う
        for(let i = 0; i < shuntsu_pattern.length; i++){
            let count = 0;
            let shuntsu_basis = shuntsu_pattern[i][0];
            for(let j = 1; j < shuntsu_pattern[i].length; j++){
                if(shuntsu_pattern[i][j] == j * 9 + shuntsu_basis){
                    count++;
                }
            }
            //三色が見つかればループを抜ける
            if(count == 2){
                sanshoku_flg = true;
                break;
            }
        }

        //三色が見つかっていれば役が成立
        if(sanshoku_flg){
            //面前であれば2翻
            if(isMenzen()){
                return 2;
            }
            //面前でなければ1翻
            else{
                return 1;
            }
        }
        else{
            return 0;
        }
    }
}

//三色同刻の判定
function isSanshokuDoko(agari_list){
    //刻子の先頭の牌のリスト
    let kotsu_list = getKotsuTopList(agari_list);

    //同種を含めない刻子の数が3面子以下であれば不成立
    if(kotsu_list.length < 3){
        return false;
    }
    //刻子が3個以上の場合
    else{
        //刻子のリストから3個ずつ取り出した組み合わせを生成する
        let kotsu_pattern = getArrayCombination(kotsu_list, 3);
        let doko_flg = false;
        //組み合わせの個数分の判定を行う
        for(let i = 0; i < kotsu_pattern.length; i++){
            let count = 0;
            let kotsu_basis = kotsu_pattern[i][0];
            for(let j = 1; j < kotsu_pattern[i].length; j++){
                if(kotsu_pattern[i][j] == j * 9 + kotsu_basis){
                    count++;
                }
            }
            //三色同刻が見つかればループを抜ける
            if(count == 2){
                doko_flg = true;
                break;
            }
        }

        //三色同刻が見つかっていれば役が成立
        if(doko_flg){
            return true;
        }
        else{
            return false;
        }
    }
}

//一気通貫の判定
function hanteiIkkituukan(agari_list){
    //順子の先頭の牌のリスト
    let shuntsu_list = getShuntsuTopList(agari_list);

    //順子の数が3面子以下であれば不成立
    if(shuntsu_list.length < 3){
        return 0;
    }
    //順子が3個以上の場合
    else{
        //順子のリストから3個ずつ取り出した組み合わせを生成する
        let shuntsu_pattern = getArrayCombination(shuntsu_list, 3);
        let ittu_flg = false;
        //組み合わせの個数分の判定を行う
        for(let i = 0; i < shuntsu_pattern.length; i++){
            let count = 0;
            let shuntsu_basis = shuntsu_pattern[i][0];
            for(let j = 1; j < shuntsu_pattern[i].length; j++){
                if(shuntsu_pattern[i][j] == j * 3 + shuntsu_basis){
                    count++;
                }
            }
            //一通が見つかればループを抜ける
            if(count == 2){
                ittu_flg = true;
                break;
            }
        }

        //一通が見つかっていれば役が成立
        if(ittu_flg){
            //面前であれば2翻
            if(isMenzen()){
                return 2;
            }
            //面前でなければ1翻
            else{
                return 1;
            }
        }
        else{
            return 0;
        }
    }
}

//三槓子の判定
function isSankantsu(){
    let kan_count = 0;
    //鳴き牌のみを見る
    for(let i = 0; i < naki_type_list.length; i++){
        //暗槓、明槓の両方をカウントする
        if(naki_type_list[i] == Naki_Type.ankan || naki_type_list[i] == Naki_Type.minkan){
            kan_count++;
        }
    }

    //カンが3回あれば役が成立
    if(kan_count == 3){
        return true;
    }
    else{
        return false;
    }
}

//役満をまとめて判定
function hanteiYakumans(agari_list, agari_kata, yaku_list){
    //天和
    if(isTenho()){
        yaku_list.push(["役満","天和"]);
    }
    //地和
    else if(isChiho()){
        yaku_list.push(["役満","地和"]);
    }
    //四暗刻
    if(isSuuanko(agari_list, agari_kata)){
        //アガリ牌が雀頭であれば四暗刻単騎
        if(agari_hai == agari_list[0][0]){
            yaku_list.push(["役満","四暗刻単騎待ち"]);
        }
        //通常の四暗刻
        else{
            yaku_list.push(["役満","四暗刻"]);
        }
    }
    //大三元
    if(isDaisangen(agari_list)){
        yaku_list.push(["役満","大三元"]);
    }
    //四喜和
    if(hanteiSushiho(agari_list) == 0){
        yaku_list.push(["役満","小四喜"]);
    }
    else if(hanteiSushiho(agari_list) == 1){
        yaku_list.push(["役満","大四喜"]);
    }
    //字一色
    if(isTsuiso(agari_list)){
        yaku_list.push(["役満","字一色"]);
    }
    //清老頭
    if(isChinroto(agari_list)){
        yaku_list.push(["役満","清老頭"]);
    }
    //緑一色
    if(isRyuiso(agari_list)){
        yaku_list.push(["役満","緑一色"]);
    }
    //九連宝燈
    if(isChurenPoto(agari_list)){
        //1枚多い牌がアガリ牌であれば純正九連宝燈
        if(agari_hai == getChurenMuchHai(countHais())){
            yaku_list.push(["役満","純正九連宝燈"]);
        }
        //通常の九連宝燈
        else{
            yaku_list.push(["役満","九連宝燈"]);
        }
    }
    //四槓子
    if(isSuukantsu()){
        yaku_list.push(["役満","四槓子"]);
    }
}

//点数計算（数値）
function calcTensuu(honsuu, fusuu, yakuman_flg, yakuman_num){
    let tensuu = 0;
    let bairitsu = 1;
    //親の場合、倍率を1.5倍にする
    if(jikaze == Kaze_Type.ton){
        bairitsu = 1.5;
    }

    //1翻以上4翻以下の場合
    if(honsuu >= 1 && honsuu <= 4){
        tensuu = Math.ceil((fusuu * 32 * bairitsu) * (2 ** (honsuu - 1)) / 100) * 100;
        //親の場合12000点、子の場合8000点以上であれば満貫とする
        if(tensuu > 8000 * bairitsu){
            tensuu = 8000 * bairitsu;
        }
    }
    //満貫（5翻）の場合
    else if(honsuu == 5){
        tensuu = 8000 * bairitsu;
    }
    //跳満（6,7翻）の場合
    else if(honsuu >= 6 && honsuu <= 7){
        tensuu = 12000 * bairitsu;
    }
    //倍満（8,9,10翻）の場合
    else if(honsuu >= 8 && honsuu <= 10){
        tensuu = 16000 * bairitsu;
    }
    //三倍満（11,12翻）の場合
    else if(honsuu >= 11 && honsuu <= 12){
        tensuu = 24000 * bairitsu;
    }
    //数え役満（13翻以上）の場合
    else if(honsuu >= 13){
        tensuu = 32000 * bairitsu;
    }
        
    //役満の場合
    if(yakuman_flg){
        tensuu = 32000 * bairitsu * yakuman_num;
    }

    return tensuu;
}

//点数計算（文字列）
function calcTensuuStr(honsuu, fusuu, yakuman_flg, yakuman_num){
    let tensuu_str = "";
    let bairitsu = 1;
    //親の場合、倍率を1.5倍にする
    if(jikaze == Kaze_Type.ton){
        bairitsu = 1.5;
    }

    //1翻以上4翻以下の場合
    if(honsuu >= 1 && honsuu <= 4){
        let tensuu = Math.ceil((fusuu * 32 * bairitsu) * (2 ** (honsuu - 1)) / 100) * 100;
        //親の場合12000点、子の場合8000点以上であれば満貫とする
        if(tensuu > 8000 * bairitsu){
            tensuu_str = "満貫";
        }
        else{
            tensuu_str = honsuu.toString() + "翻" + fusuu.toString() + "符";
        }
    }
    //満貫（5翻）の場合
    else if(honsuu == 5){
        tensuu_str = "満貫";
    }
    //跳満（6,7翻）の場合
    else if(honsuu >= 6 && honsuu <= 7){
        tensuu_str = "跳満";
    }
    //倍満（8,9,10翻）の場合
    else if(honsuu >= 8 && honsuu <= 10){
        tensuu_str = "倍満";
    }
    //三倍満（11,12翻）の場合
    else if(honsuu >= 11 && honsuu <= 12){
        tensuu_str = "三倍満";
    }
    //数え役満（13翻以上）の場合
    else if(honsuu >= 13){
        tensuu_str = "役満";
    }
        
    //役満の場合
    if(yakuman_flg){
        if(yakuman_num == 1){
            tensuu_str = "役満";
        }
        else if(yakuman_num > 1){
            tensuu_str = yakuman_num.toString() + "倍役満";
        }
    }

    //役なしの場合
    if(!yakuman_flg && honsuu == 0){
        tensuu_str = "役なし";
    }

    return tensuu_str;
}

//アガリの判定
function calcAgari(agari_kata){
    //翻数のリスト
    let honsuu_list = [];
    //符数のリスト
    let fusuu_list = [];
    //役のリストのリスト
    let yaku_lists = [];
    //符の概要のリスト
    let fusuu_summary_lists = [];
    //役満のフラグ
    let yakuman_flg_list = [];
    //点数
    let tensuu = -1;
    //点数（文字）
    let tensuu_str = "";
    //最大点数の手牌のインデックス
    let maxtensuu_index = 0;
    //最大点数の符数
    let maxtensuu_fusuu = 0;
    //アガリ牌のリスト
    let agari_lists = [];

    //国士無双のアガリであれば通常役の判定は行わない
    if(calcKokushiShanten(countHais()) == -1){
        let count_hais = countHais();
        let yaku_list = [];
        let agari_list = [];
        let fusuu = 0;
        let fusuu_summary_list = [];

        let janto = getKokushiJanto(countHais());
        //国士無双十三面待ち（アガリ牌が雀頭だった場合）
        if(agari_hai == janto){
            yaku_list.push(["役満","国士無双十三面待ち"]);
        }
        //通常の国士無双
        else{
            yaku_list.push(["役満","国士無双"]);
        }

        //アガリのリストを生成する
        for(let i = 0; i < count_hais.length; i++){
            for(let j = 0; j < count_hais[i].length; j++){
                for(let k = 0; k < count_hais[i][j]; k++){
                    agari_list.push([(i * 9) + (j + 1)]);
                }
            }
        }

        //副底（20符）
        fusuu += 20;
        fusuu_summary_list.push(["20符","副底"]);

        //ツモの場合2符加算
        if(agari_kata == Agari_Kata.tsumo){
            fusuu += 2;
            fusuu_summary_list.push(["2符","ツモ"]);
        }
        //面前ロンの場合10符加算
        if(agari_kata == Agari_Kata.ron && isMenzen()){
            fusuu += 10;
            fusuu_summary_list.push(["10符","面前ロン"]);
        }

        agari_lists.push(agari_list);
        honsuu_list.push(0);
        fusuu_list.push(fusuu);
        yaku_lists.push(yaku_list);
        fusuu_summary_lists.push(fusuu_summary_list);
        yakuman_flg_list.push(true);
    }
    //4面子1雀頭または七対子型のアガリの場合
    else{
        let hais_count = countHais();
        agari_lists = createAgariHaiBlocksRecursive(hais_count, 0, 0, []);
        agari_lists = [...new Set(agari_lists.map(JSON.stringify))].map(JSON.parse);
    
        for(let i = 0; i < agari_lists.length; i++){
            //翻数
            let honsuu = 0;
            //符数
            let fusuu = 0;
            //平和かどうか
            let pinfu_flg = false;
            //面前自模かどうか
            let mentsumo_flg = false;
            //七対子かどうか
            let chitoi_flg = false;
            //役のリスト
            let yaku_list = [];
            //符の概要のリスト
            let fusuu_summary_list = [];
            //手牌のリストを一定のルールでソートする
            tehaiListSort(agari_lists[i]);

            //待ちのリスト
            let machitype_list = getMachiTypes(agari_lists[i]);

            //対子が7個の形の場合は七対子かどうか判別する
            if(agari_lists[i].length == 7){
                if(calcChiitoiShanten(countHais()) == -1){
                    //役満の場合は七対子を付けない
                    if(isTenho() || isChiho() || isTsuiso(agari_lists[i])){
                        if(isTenho()){
                            yaku_list.push(["役満","天和"]);
                        }
                        else if(isChiho()){
                            yaku_list.push(["役満","地和"]);
                        }
                        if(isTsuiso(agari_lists[i])){
                            yaku_list.push(["役満","字一色"]);
                        }
                        yakuman_flg_list.push(true);
                        chitoi_flg = true;
                    }
                    else{
                        chitoi_flg = true;

                        //立直
                        if(reach_type == Reach_Type.reach){
                            honsuu += 1;
                            yaku_list.push(["1翻","立直"]);
                        }
                        //ダブル立直
                        else if(reach_type == Reach_Type.doublereach){
                            honsuu += 2;
                            yaku_list.push(["2翻","ダブル立直"]);
                        }
                        //一発
                        let ippatsu_flg = document.getElementById('radio_ippatsu_true').checked;
                        if(ippatsu_flg){
                            honsuu += 1;
                            yaku_list.push(["1翻","一発"]);
                        }
                        //嶺上開花
                        let rinshan_flg = document.getElementById('radio_rinshan').checked;
                        if(rinshan_flg){
                            honsuu += 1;
                            yaku_list.push(["1翻","嶺上開花"]);
                        }
                        //槍槓
                        let chankan_flg = document.getElementById('radio_chankan').checked;
                        if(chankan_flg){
                            honsuu += 1;
                            yaku_list.push(["1翻","槍槓"]);
                        }
                        //海底撈月
                        let haitei_flg = document.getElementById('radio_haitei').checked;
                        if(haitei_flg){
                            honsuu += 1;
                            yaku_list.push(["1翻","海底撈月"]);
                        }
                        //河底撈魚
                        let houtei_flg = document.getElementById('radio_houtei').checked;
                        if(houtei_flg){
                            honsuu += 1;
                            yaku_list.push(["1翻","河底撈魚"]);
                        }
                        //面前清自模
                        if(isMenzenTsumo(agari_kata)){
                            honsuu += 1;
                            yaku_list.push(["1翻","面前清自模和"]);
                            mentsumo_flg = true;
                        }
                        //断么九
                        if(isTanyao(agari_lists[i])){
                            honsuu += 1;
                            yaku_list.push(["1翻","断么九"]);
                        }

                        //七対子を役として追加
                        honsuu += 2
                        yaku_list.push(["2翻","七対子"]);

                        //混一色
                        if(hanteiHonitsu(agari_lists[i]) == 3){
                            honsuu += 3;
                            yaku_list.push(["3翻","混一色"]);
                        }

                        //混老頭
                        if(isHonRoto(agari_lists[i])){
                            honsuu += 2;
                            yaku_list.push(["2翻","混老頭"]);
                        }

                        //清一色
                        if(hanteiChinitsu(agari_lists[i]) == 6){
                            honsuu += 6;
                            yaku_list.push(["6翻","清一色"]);
                        }

                        //ドラ（役が無い場合は追加しない）
                        if(yaku_list.length != 0){
                            let dora_value = document.getElementById('dora_num').value;
                            if(Number(dora_value) != 0){
                                honsuu += Number(dora_value);
                                yaku_list.push([dora_value + "翻", "ドラ"]);
                            }
                        }
                    }
                }
                else{
                    yakuman_flg_list.push(false);
                }
            }
            //一般手の場合
            else{
                //役満の判定
                hanteiYakumans(agari_lists[i], agari_kata, yaku_list);

                //役満であれば役満フラグをONにする
                if(yaku_list.length > 0){
                    yakuman_flg_list.push(true);
                }
                else{
                    yakuman_flg_list.push(false);
                }

                //役満でない場合、一般役の判定を行う    
                if(yaku_list.length == 0){
                    //立直
                    if(reach_type == Reach_Type.reach){
                        honsuu += 1;
                        yaku_list.push(["1翻","立直"]);
                    }
                    //ダブル立直
                    else if(reach_type == Reach_Type.doublereach){
                        honsuu += 2;
                        yaku_list.push(["2翻","ダブル立直"]);
                    }
                    //一発
                    let ippatsu_flg = document.getElementById('radio_ippatsu_true').checked;
                    if(ippatsu_flg){
                        honsuu += 1;
                        yaku_list.push(["1翻","一発"]);
                    }
                    //嶺上開花
                    let rinshan_flg = document.getElementById('radio_rinshan').checked;
                    if(rinshan_flg){
                        honsuu += 1;
                        yaku_list.push(["1翻","嶺上開花"]);
                    }
                    //槍槓
                    let chankan_flg = document.getElementById('radio_chankan').checked;
                    if(chankan_flg){
                        honsuu += 1;
                        yaku_list.push(["1翻","槍槓"]);
                    }
                    //海底撈月
                    let haitei_flg = document.getElementById('radio_haitei').checked;
                    if(haitei_flg){
                        honsuu += 1;
                        yaku_list.push(["1翻","海底撈月"]);
                    }
                    //河底撈魚
                    let houtei_flg = document.getElementById('radio_houtei').checked;
                    if(houtei_flg){
                        honsuu += 1;
                        yaku_list.push(["1翻","河底撈魚"]);
                    }
                    //面前清自模
                    if(isMenzenTsumo(agari_kata)){
                        honsuu += 1;
                        yaku_list.push(["1翻","面前清自模和"]);
                        mentsumo_flg = true;
                    }
                    //断么九
                    if(isTanyao(agari_lists[i])){
                        honsuu += 1;
                        yaku_list.push(["1翻","断么九"]);
                    }
                    //平和
                    if(isPinfu(agari_lists[i], machitype_list)){
                        honsuu += 1;
                        yaku_list.push(["1翻","平和"]);
                        pinfu_flg = true;
                    }
                    //一盃口
                    if(isIpeko(agari_lists[i])){
                        honsuu += 1;
                        yaku_list.push(["1翻","一盃口"]);
                    }
                    //役牌：自風牌
                    if(isYakuhai(agari_lists[i], kazeTypeToHaishu(jikaze))){
                        honsuu += 1;
                        yaku_list.push(["1翻","役牌：自風牌"]);
                    }
                    //役牌：場風牌
                    if(isYakuhai(agari_lists[i], kazeTypeToHaishu(bakaze))){
                        honsuu += 1;
                        yaku_list.push(["1翻","役牌：場風牌"]);
                    }
                    //役牌：白
                    if(isYakuhai(agari_lists[i], JIHAI[4])){
                        honsuu += 1;
                        yaku_list.push(["1翻","役牌：白"]);
                    }
                    //役牌：発
                    if(isYakuhai(agari_lists[i], JIHAI[5])){
                        honsuu += 1;
                        yaku_list.push(["1翻","役牌：発"]);
                    }
                    //役牌：中
                    if(isYakuhai(agari_lists[i], JIHAI[6])){
                        honsuu += 1;
                        yaku_list.push(["1翻","役牌：中"]);
                    }

                    //小三元
                    if(isShosangen(agari_lists[i])){
                        honsuu += 2;
                        yaku_list.push(["2翻","小三元"]);
                    }
                    //混老頭
                    if(isHonRoto(agari_lists[i])){
                        honsuu += 2;
                        yaku_list.push(["2翻","混老頭"]);
                    }
                    //混全帯么九（チャンタ）
                    let honsuu_chanta = haiteiChanta(agari_lists[i]);
                    if(honsuu_chanta == 2){
                        honsuu += honsuu_chanta;
                        yaku_list.push(["2翻","混全帯么九"]);
                    }
                    else if(honsuu_chanta == 1){
                        honsuu += honsuu_chanta;
                        yaku_list.push(["1翻","混全帯么九"]);                        
                    }
                    //三暗刻
                    if(isSananko(agari_lists[i], agari_kata)){
                        honsuu += 2;
                        yaku_list.push(["2翻","三暗刻"]);
                    }
                    //対々和
                    if(isToitoi(agari_lists[i])){
                        honsuu += 2;
                        yaku_list.push(["2翻","対々和"]);
                    }
                    //三色同順
                    let honsuu_sanshoku = hanteiSanshokuDojyun(agari_lists[i]);
                    if(honsuu_sanshoku == 2){
                        honsuu += honsuu_sanshoku;
                        yaku_list.push(["2翻","三色同順"]);
                    }
                    else if(honsuu_sanshoku == 1){
                        honsuu += honsuu_sanshoku;
                        yaku_list.push(["1翻","三色同順"]);
                    }
                    //三色同刻
                    if(isSanshokuDoko(agari_lists[i])){
                        honsuu += 2;
                        yaku_list.push(["2翻","三色同刻"]);
                    }
                    //一気通貫
                    let honsuu_ittu = hanteiIkkituukan(agari_lists[i]);
                    if(honsuu_ittu == 2){
                        honsuu += honsuu_ittu;
                        yaku_list.push(["2翻","一気通貫"]);                        
                    }
                    else if(honsuu_ittu == 1){
                        honsuu += honsuu_ittu;
                        yaku_list.push(["1翻","一気通貫"]);
                    }
                    //三槓子
                    if(isSankantsu()){
                        honsuu += 2;
                        yaku_list.push(["2翻","三槓子"]);
                    }

                    //純全帯么九（純チャン）
                    let honsuu_jyunchan = hanteiJyunchan(agari_lists[i]);
                    if(honsuu_jyunchan == 3){
                        honsuu += honsuu_jyunchan;
                        yaku_list.push(["3翻","純全帯么九"]);
                    }
                    else if(honsuu_jyunchan == 2){
                        honsuu += honsuu_jyunchan;
                        yaku_list.push(["2翻","純全帯么九"]);
                    }
                    //二盃口
                    if(isRyanpeko(agari_lists[i])){
                        honsuu += 3;
                        yaku_list.push(["3翻","二盃口"]); 
                    }
                    //混一色
                    let honsuu_honitsu = hanteiHonitsu(agari_lists[i]);
                    if(honsuu_honitsu == 3){
                        honsuu += honsuu_honitsu;
                        yaku_list.push(["3翻","混一色"]);
                    }
                    else if(honsuu_honitsu == 2){
                        honsuu += honsuu_honitsu;
                        yaku_list.push(["2翻","混一色"]);
                    }

                    //清一色
                    let honsuu_chinitsu = hanteiChinitsu(agari_lists[i]);
                    if(honsuu_chinitsu == 6){
                        honsuu += honsuu_chinitsu;
                        yaku_list.push(["6翻","清一色"]);
                    }
                    else if(honsuu_chinitsu == 5){
                        honsuu += honsuu_chinitsu;
                        yaku_list.push(["5翻","清一色"]);
                    }

                    //ドラ（役が無い場合は追加しない）
                    if(yaku_list.length != 0){
                        let dora_value = document.getElementById('dora_num').value;
                        if(Number(dora_value) != 0){
                            honsuu += Number(dora_value);
                            yaku_list.push([dora_value + "翻", "ドラ"]);
                        }
                    }
                }
            }

            //符、点数計算

            //ピンフツモの場合は一律20符
            if(pinfu_flg && mentsumo_flg){
                fusuu += 20;
                fusuu_summary_list.push(["20符","平和ツモ"]);
            }
            //七対子の場合は一律25符
            else if(chitoi_flg){
                fusuu += 25;
                fusuu_summary_list.push(["25符","七対子"]);
            }
            //一般手の場合
            else{
                //副底（20符）
                fusuu += 20;
                fusuu_summary_list.push(["20符","副底"]);

                //ツモの場合2符加算
                if(agari_kata == Agari_Kata.tsumo){
                    fusuu += 2;
                    fusuu_summary_list.push(["2符","ツモ"]);
                }
                //面前ロンの場合10符加算
                if(agari_kata == Agari_Kata.ron && isMenzen()){
                    fusuu += 10;
                    fusuu_summary_list.push(["10符","面前ロン"]);
                }

                //待ちの形によって符を加算
                //平和が成立する場合、他に待ち候補があったとしても両面待ちとして扱う
                if(!pinfu_flg){
                    for(let j = 0; j < machitype_list.length; j++){
                        //単騎待ち
                        if(machitype_list[j] == Machi_Type.tanki){
                            fusuu += 2;
                            fusuu_summary_list.push(["2符", Fusuu_Pattern.machi_tanki]);
                            break;
                        }
                        //カンチャン待ち
                        else if(machitype_list[j] == Machi_Type.kanchan){
                            fusuu += 2;
                            fusuu_summary_list.push(["2符", Fusuu_Pattern.machi_kanchan]);
                            break;
                        }
                        //ペンチャン待ち
                        else if(machitype_list[j] == Machi_Type.penchan){
                            fusuu += 2;
                            fusuu_summary_list.push(["2符", Fusuu_Pattern.machi_penchan]);
                            break;
                        }
                    }
                }

                //面子によって符を加算
                //手牌
                for(let j = 0; j < agari_lists[i].length; j++){
                    let haishu = agari_lists[i][j][0];
                    //雀頭の場合、役牌であれば符を追加する
                    if(isJanto(agari_lists[i][j])){
                        if(isYakuhaiPai(haishu)){
                            fusuu += 2;
                            fusuu_summary_list.push(["2符", Fusuu_Pattern.yakuhai_janto, haishu]);
                        }
                    }
                    //刻子の場合
                    else if(isCotsu(agari_lists[i][j])){
                        //アガリ牌が刻子のロンの場合、明刻として計算
                        if(haishu == agari_hai && agari_kata == Agari_Kata.ron){
                            //么九牌明刻の場合
                            if(isYaochuhai(haishu)){
                                fusuu += 4;
                                fusuu_summary_list.push(["4符", Fusuu_Pattern.yaochu_minko, haishu]);
                            }
                            //中張牌明刻の場合
                            else{
                                fusuu += 2;
                                fusuu_summary_list.push(["2符", Fusuu_Pattern.chuchan_minko, haishu]);
                            }
                        }
                        //暗刻の場合
                        else{
                            //么九牌暗刻の場合
                            if(isYaochuhai(haishu)){
                                fusuu += 8;
                                fusuu_summary_list.push(["8符", Fusuu_Pattern.yaochu_anko, haishu]);
                            }
                            //中張牌暗刻の場合
                            else{
                                fusuu += 4;
                                fusuu_summary_list.push(["4符", Fusuu_Pattern.chuchan_anko, haishu]);
                            }
                        }
                    }
                    //順子の場合は符が付かない
                }

                //鳴き牌
                for(let i = 0; i < naki_type_list.length; i++){
                    let haishu = naki_pais_list[i];
                    //ポン（明刻）の場合
                    if(naki_type_list[i] == Naki_Type.pong){
                        //么九牌明刻の場合
                        if(isYaochuhai(haishu)){
                            fusuu += 4;
                            fusuu_summary_list.push(["4符", Fusuu_Pattern.yaochu_minko, haishu]);
                        }
                        //中張牌明刻の場合
                        else{
                            fusuu += 2;
                            fusuu_summary_list.push(["2符", Fusuu_Pattern.chuchan_minko, haishu]);
                        }                       
                    }
                    //明槓の場合
                    else if(naki_type_list[i] == Naki_Type.minkan){
                        //么九牌明槓の場合
                        if(isYaochuhai(haishu)){
                            fusuu += 16;
                            fusuu_summary_list.push(["16符", Fusuu_Pattern.yaochu_minkan, haishu]);
                        }
                        //中張牌明槓の場合
                        else{
                            fusuu += 8;
                            fusuu_summary_list.push(["8符", Fusuu_Pattern.chuchan_minkan, haishu]);
                        }                       
                    }
                    //暗槓の場合
                    else if(naki_type_list[i] == Naki_Type.ankan){
                        //么九牌暗槓の場合
                        if(isYaochuhai(haishu)){
                            fusuu += 32;
                            fusuu_summary_list.push(["32符", Fusuu_Pattern.yaochu_ankan, haishu]);
                        }
                        //中張牌暗槓の場合
                        else{
                            fusuu += 16;
                            fusuu_summary_list.push(["16符", Fusuu_Pattern.chuchan_ankan, haishu]);
                        }                       
                    }                   
                }

                //喰い平和系（鳴きあり20符）の場合、例外的に30符にする
                if(!isMenzen() && fusuu == 20){
                    fusuu_summary_list.length = 0;
                    fusuu_summary_list.push(["30符","喰い平和系"]);
                    fusuu = 30;
                }
            }

            //役をリストに挿入
            yaku_lists.push(yaku_list);
            //翻数をリストに挿入
            honsuu_list.push(honsuu);
            //符数をリストに挿入
            fusuu_list.push(fusuu);
            //符の概要をリストに挿入
            fusuu_summary_lists.push(fusuu_summary_list);
        }
    }

    //点数の決定
    for(let i = 0; i < yaku_lists.length; i++){
        //手牌の点数を計算する
        let fusuu_ceil = 0;
        if(fusuu_list[i] != 25){
            fusuu_ceil = Math.ceil(fusuu_list[i] / 10) * 10;
        }
        else{
            fusuu_ceil = fusuu_list[i];
        }
        let tensuu_candidate = 0;
        let tensuu_str_candidate = "";
        //役満（数え役満を除く）の場合
        if(yakuman_flg_list[i]){
            tensuu_candidate = calcTensuu(honsuu_list[i], fusuu_ceil, true, yaku_lists[i].length);
            tensuu_str_candidate = calcTensuuStr(honsuu_list[i], fusuu_ceil, true, yaku_lists[i].length);
        }
        //通常の役満以外の場合
        else{
            tensuu_candidate = calcTensuu(honsuu_list[i], fusuu_ceil, false, 0);
            tensuu_str_candidate = calcTensuuStr(honsuu_list[i], fusuu_ceil, false, 0);
        }

        //最大の点数であればその点数と添え字を記憶する
        if(tensuu <= tensuu_candidate){
            tensuu = tensuu_candidate;
            tensuu_str = tensuu_str_candidate;
            maxtensuu_index = i;
            maxtensuu_fusuu = fusuu_ceil;
        }
    }

    //入力画面を非表示にして結果出力画面を表示
    input_screen.style.display = "none";
    output_screen.style.display = "block";
    //アガリ牌を画面上に表示
    displayAgarihai(agari_kata);
    //アガリの手牌を画面上に表示
    displayTehaiResult(agari_lists[maxtensuu_index]);
    //点数を画面上に表示
    displayTensuu(tensuu, tensuu_str, agari_kata);
    //翻数と役のリストを画面上に表示
    displayYakuList(honsuu_list[maxtensuu_index], yaku_lists[maxtensuu_index]);
    //符数のリストを画面上に表示
    displayFusuuList(fusuu_list[maxtensuu_index], maxtensuu_fusuu, fusuu_summary_lists[maxtensuu_index]);

    //各リストを表示（テスト）
    /*
    alert(yaku_lists[maxtensuu_index]);
    alert(honsuu_list[maxtensuu_index]);
    alert(fusuu_list[maxtensuu_index]);
    alert(fusuu_summary_lists[maxtensuu_index]);
    alert(maxtensuu_fusuu);
    alert(tensuu);
    */

}

//アガリ牌を画面に表示させる
function displayAgarihai(agari_kata){
    let div_element = document.createElement('div');
    let p_element = document.createElement('p');
    let img_element = document.createElement('img');
    if(agari_kata == Agari_Kata.tsumo){
        p_element.innerText = "ツモ";
    }
    else{
        p_element.innerText = "ロン";
    }
    p_element.style.marginRight = "5px";
    p_element.style.color = "white";
    p_element.style.fontWeight = "bold";
    document.getElementById('tehai_result').appendChild(p_element);

    div_element.style.display = "flex";
    div_element.style.marginRight = "15px";
    div_element.style.backgroundColor = "red";
    img_element.style.width = "40px";
    img_element.style.opacity = "0.8";
    img_element.src = ScriptCore.generate_pai_src(agari_hai);
    div_element.appendChild(img_element);
    document.getElementById('tehai_result').appendChild(div_element);
}


//手牌の結果を画面に表示させる
function displayTehaiResult(agari_list){
    for(let i = 0; i < agari_list.length + naki_pais_list.length; i++){
        let div_element = document.createElement('div');
        div_element.style.display = "flex";
        
        //4面子1雀頭の形であれば面子、雀頭の隙間を確保する
        if(agari_list.length + naki_pais_list.length == 5){
            div_element.style.marginLeft = "10px";
            div_element.style.marginRight = "10px";
        }

        //手牌
        if(i < agari_list.length){
            for(let j = 0; j < agari_list[i].length; j++){
                let img_element = document.createElement('img');
                img_element.style.width = "40px";
                img_element.src = ScriptCore.generate_pai_src(agari_list[i][j]);
                div_element.appendChild(img_element);
            }
        }
        //鳴き牌
        else{
            let pai_num = naki_pais_list[i - agari_list.length];
            let naki_type = naki_type_list[i - agari_list.length];
            //ポンの時
            if(naki_type == Naki_Type.pong){
                generatePongImg(div_element, pai_num, true);
            }
            //チーの時
            else if(naki_type == Naki_Type.chi){
                generateChiImg(div_element, pai_num, true);
            }
            //暗槓の時
            else if(naki_type == Naki_Type.ankan){
                generateAnkanImg(div_element, pai_num, true);
            }
            //明槓の時
            else if(naki_type == Naki_Type.minkan){
                generateMinkanImg(div_element, pai_num, true);
            }
        }
        //鳴き牌
        document.getElementById('tehai_result').appendChild(div_element);
    }
}
//手牌の結果を消去
function deleteTehaiResult(){
    let tehai_result = document.getElementById('tehai_result');
    while(tehai_result.firstChild){
        tehai_result.removeChild(tehai_result.firstChild);
    }
}

//点数を画面に表示させる
function displayTensuu(tensuu, tensuu_str, agari_kata){
    let tensuu_result_div = document.getElementById('tensuu_result');
    let tensuu_str_p = document.createElement('p');
    let tensuu_num_p = document.createElement('p');
    let honba_num = Number(document.getElementById('honba_num').value);
    tensuu_str_p.innerText = tensuu_str;
    tensuu_result_div.appendChild(tensuu_str_p);
    //ツモかつ0点でない場合
    if(agari_kata == Agari_Kata.tsumo && tensuu != 0){
        //親の場合
        if(jikaze == Kaze_Type.ton){
            let tensuu_all = Math.ceil((tensuu / 3) / 100) * 100; 
            tensuu_num_p.innerText = tensuu_all.toString() + "点 ALL";
            //1本場ごとに100点（ALL）追加
            if(honba_num > 0){
                tensuu_num_p.innerText += " + " + honba_num.toString() + "本場" + "(" + (honba_num * 100).toString() + ")";
            }
        }
        //子の場合
        else{
            let tensuu_child = Math.ceil((tensuu / 4) / 100) * 100; 
            let tensuu_parent = Math.ceil((tensuu / 2) / 100) * 100;
            //1本場ごとに子と親の両方に100点ずつ追加
            if(honba_num > 0){
                tensuu_child += honba_num * 100;
                tensuu_parent += honba_num * 100;
            }
            tensuu_num_p.innerText = "子:" + tensuu_child.toString() + "点　親:" + tensuu_parent.toString() + "点";
            //本場のラベルを追加
            if(honba_num > 0){
                tensuu_num_p.innerText += "(" + honba_num.toString() + "本場)";
            }
        }
    }
    //ロンかつ0点でない場合
    else if(agari_kata == Agari_Kata.ron && tensuu != 0){
        tensuu_num_p.innerText = tensuu.toString() + "点";
        //1本場ごとに300点追加
        if(honba_num > 0){
            tensuu_num_p.innerText += " + " + honba_num.toString() + "本場" + "(" + (honba_num * 300).toString() + ")";
        }
    }
    //役なし0点の場合
    else if(tensuu == 0){
        tensuu_num_p.innerText = "0点";
    }

    tensuu_result_div.appendChild(tensuu_num_p);
}

//画面の点数を消去
function deleteTensuu(){
    let tensuu_result_div = document.getElementById('tensuu_result');
    while(tensuu_result_div.firstChild){
        tensuu_result_div.removeChild(tensuu_result_div.firstChild);
    }
}

//翻数と役のリストを画面に表示させる
function displayYakuList(honsuu, yaku_list){
    let table = document.getElementById('yaku_table');
    let thead = document.createElement('thead');
    let row_thead = document.createElement('tr');
    let cell_thead = document.createElement('th');
    let tbody = document.createElement('tbody');
    cell_thead.innerHTML = "翻数：" + honsuu.toString();
    cell_thead.colSpan = "2";
    row_thead.appendChild(cell_thead);
    thead.appendChild(row_thead);
    table.appendChild(thead);

    for(let i = 0; i < yaku_list.length; i++){
        let row = document.createElement('tr');
        let cell_honsuu = document.createElement('td');
        let cell_yaku = document.createElement('td');
        cell_honsuu.className = "width15";
        cell_honsuu.innerText = yaku_list[i][0];
        cell_yaku.innerText = yaku_list[i][1];
        row.appendChild(cell_honsuu);
        row.appendChild(cell_yaku);
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
}
//翻数と役のリストを削除
function deleteYakuList(){
    let table = document.getElementById('yaku_table');
    while(table.firstChild){
        table.removeChild(table.firstChild);
    }
}

//符のパターンから符の詳細に関する文字列を取得
function getFusuuSummaryStr(fusuu_summary){
    //役牌雀頭
    if(fusuu_summary == Fusuu_Pattern.yakuhai_janto){
        return "役牌雀頭"
    }
    //単騎待ち
    else if(fusuu_summary == Fusuu_Pattern.machi_tanki){
        return "単騎待ち";
    }
    //カンチャン待ち
    else if(fusuu_summary == Fusuu_Pattern.machi_kanchan){
        return "間張待ち";
    }
    //ペンチャン待ち
    else if(fusuu_summary == Fusuu_Pattern.machi_penchan){
        return "辺張待ち";
    }
    //中張牌明刻
    else if(fusuu_summary == Fusuu_Pattern.chuchan_minko){
        return "中張牌明刻";
    }
    //中張牌暗刻
    else if(fusuu_summary == Fusuu_Pattern.chuchan_anko){
        return "中張牌暗刻";
    }
    //么九牌明刻
    else if(fusuu_summary == Fusuu_Pattern.yaochu_minko){
        return "么九牌明刻";
    }
    //么九牌暗刻
    else if(fusuu_summary == Fusuu_Pattern.yaochu_anko){
        return "么九牌暗刻";
    }
    //中張牌明槓
    else if(fusuu_summary == Fusuu_Pattern.chuchan_minkan){
        return "中張牌明槓";
    }
    //中張牌暗槓
    else if(fusuu_summary == Fusuu_Pattern.chuchan_ankan){
        return "中張牌暗槓";
    }
    //么九牌明槓
    else if(fusuu_summary == Fusuu_Pattern.yaochu_minkan){
        return "么九牌明槓";
    }
    //么九牌暗槓
    else if(fusuu_summary == Fusuu_Pattern.yaochu_ankan){
        return "么九牌暗槓";
    }
    else{
        return "";
    }
}

//符数のリストを表示させる
function displayFusuuList(fusuu, fusuu_ceil, fusuu_summary_list){
    let table = document.getElementById('fusuu_table');
    let thead = document.createElement('thead');
    let row_thead = document.createElement('tr');
    let cell_thead = document.createElement('th');
    let tbody = document.createElement('tbody');
    cell_thead.innerHTML = "符数：" + fusuu_ceil.toString() + "(" + fusuu.toString() + ")";
    cell_thead.colSpan = "2";
    row_thead.appendChild(cell_thead);
    thead.appendChild(row_thead);
    table.appendChild(thead);

    for(let i = 0; i < fusuu_summary_list.length; i++){
        let row = document.createElement('tr');
        let cell_fusuu = document.createElement('td');
        let cell_summary = document.createElement('td');
        cell_fusuu.className = "width15";
        cell_fusuu.innerText = fusuu_summary_list[i][0];
        row.appendChild(cell_fusuu);

        //符の付き方によって表示を変える
        let fusuu_summary = fusuu_summary_list[i][1];
        cell_summary_img = document.createElement('div');
        //役牌雀頭
        if(fusuu_summary == Fusuu_Pattern.yakuhai_janto){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            for(let j = 0; j < 2; j++){
                let hai_image = document.createElement('img');
                hai_image.src = ScriptCore.generate_pai_src(fusuu_summary_list[i][2]);
                hai_image.style.width = "40px";
                cell_summary_img.appendChild(hai_image);
            }
            cell_summary.appendChild(cell_summary_img);
        }
        //単騎待ち
        else if(fusuu_summary == Fusuu_Pattern.machi_tanki){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            let hai_image_1 = document.createElement('img');
            let hai_image_2 = document.createElement('img');
            hai_image_1.src = ScriptCore.generate_pai_src(agari_hai);
            hai_image_1.style.width = "40px";
            hai_image_2.src = ScriptCore.generate_pai_src(BACK);
            hai_image_2.style.width = "40px";
            cell_summary_img.appendChild(hai_image_1);
            cell_summary_img.appendChild(hai_image_2);
            cell_summary.appendChild(cell_summary_img);
        }
        //カンチャン待ち
        else if(fusuu_summary == Fusuu_Pattern.machi_kanchan){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            for(let j = 0; j < 3; j++){
                let hai_image = document.createElement('img');
                //真ん中を裏返しにする
                if(j != 1){
                    hai_image.src = ScriptCore.generate_pai_src(agari_hai - 1 + j);
                }
                else{
                    hai_image.src = ScriptCore.generate_pai_src(BACK);
                }
                hai_image.style.width = "40px";
                cell_summary_img.appendChild(hai_image);
            }
            cell_summary.appendChild(cell_summary_img);
        }
        //ペンチャン待ち
        else if(fusuu_summary == Fusuu_Pattern.machi_penchan){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            for(let j = 0; j < 3; j++){
                let hai_image = document.createElement('img');
                //アガリ牌が3であれば右を隠す
                if(agari_hai % 9 == 3){
                    if(j == 2){
                        hai_image.src = ScriptCore.generate_pai_src(BACK);
                    }
                    else{
                        hai_image.src = ScriptCore.generate_pai_src(agari_hai - 2 + j);
                    }
                }
                //アガリ牌が7であれば左を隠す
                else if(agari_hai % 9 == 7){
                    if(j == 0){
                        hai_image.src = ScriptCore.generate_pai_src(BACK);
                    }
                    else{
                        hai_image.src = ScriptCore.generate_pai_src(agari_hai + j);
                    }
                }
                hai_image.style.width = "40px";
                cell_summary_img.appendChild(hai_image);
            }
            cell_summary.appendChild(cell_summary_img);
        }
        //刻子
        else if(fusuu_summary == Fusuu_Pattern.chuchan_minko ||
                fusuu_summary == Fusuu_Pattern.chuchan_anko || 
                fusuu_summary == Fusuu_Pattern.yaochu_minko || 
                fusuu_summary == Fusuu_Pattern.yaochu_anko){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            for(let j = 0; j < 3; j++){
                let hai_image = document.createElement('img');
                hai_image.src = ScriptCore.generate_pai_src(fusuu_summary_list[i][2]);
                hai_image.style.width = "40px";
                cell_summary_img.appendChild(hai_image);
            }
            cell_summary.appendChild(cell_summary_img);
        }
        //明槓
        else if(fusuu_summary == Fusuu_Pattern.chuchan_minkan || fusuu_summary == Fusuu_Pattern.yaochu_minkan){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            generateMinkanImg(cell_summary_img, fusuu_summary_list[i][2], true);
            cell_summary.appendChild(cell_summary_img);
        }
        //暗槓
        else if(fusuu_summary == Fusuu_Pattern.chuchan_ankan || fusuu_summary == Fusuu_Pattern.yaochu_ankan){
            cell_summary.innerText = getFusuuSummaryStr(fusuu_summary);
            generateAnkanImg(cell_summary_img, fusuu_summary_list[i][2], true);
            cell_summary.appendChild(cell_summary_img);
        }
        //その他の場合は詳細のみをそのまま表示（画像は無し）
        else{
            cell_summary.innerText = fusuu_summary;
        }

        row.appendChild(cell_summary);

        tbody.appendChild(row);
    }
    table.appendChild(tbody);
}
//符数のリストを削除
function deleteFusuuList(){
    let table = document.getElementById('fusuu_table');
    while(table.firstChild){
        table.removeChild(table.firstChild);
    }
}

//ポンの時のimg要素を生成
function generatePongImg(naki_pais_div, pai_num, size_min_flg){
    for(let i = 0; i < 3; i++){
        let naki_pais_img = document.createElement('img');
        naki_pais_img.setAttribute('src', ScriptCore.generate_pai_src(pai_num));
        if(size_min_flg){
            naki_pais_img.style.width = "40px";
        }
        if(i == 0){
            naki_pais_img.style.transform = "rotate(-90deg)";
            if(size_min_flg){
                naki_pais_img.style.marginLeft = "7px";
                naki_pais_img.style.marginRight = "7px";
            }
            else{
                naki_pais_img.style.marginLeft = "10px";
                naki_pais_img.style.marginRight = "10px";
            }
        }
        naki_pais_div.appendChild(naki_pais_img);
    }
}

//チーの時のimg要素を生成
function generateChiImg(naki_pais_div, pai_num, size_min_flg){
    for(let i = 0; i < 3; i++){
        let naki_pais_img = document.createElement('img');
        naki_pais_img.setAttribute('src', ScriptCore.generate_pai_src(pai_num + i));
        if(size_min_flg){
            naki_pais_img.style.width = "40px";
        }
        if(i == 0){
            naki_pais_img.style.transform = "rotate(-90deg)";
            if(size_min_flg){
                naki_pais_img.style.marginLeft = "7px";
                naki_pais_img.style.marginRight = "7px";
            }
            else{
                naki_pais_img.style.marginLeft = "10px";
                naki_pais_img.style.marginRight = "10px";
            }
        }
        naki_pais_div.appendChild(naki_pais_img);
    }
}

//暗槓の時のimg要素を生成
function generateAnkanImg(naki_pais_div, pai_num, size_min_flg){
    for(let i = 0; i < 4; i++){
        let naki_pais_img = document.createElement('img');
        if(size_min_flg){
            naki_pais_img.style.width = "40px";
        }
        if(i == 0 || i == 3){
            naki_pais_img.setAttribute('src', ScriptCore.generate_pai_src(BACK));
        }
        else{
            naki_pais_img.setAttribute('src', ScriptCore.generate_pai_src(pai_num));
        }
        naki_pais_div.appendChild(naki_pais_img);
    }
}

//明槓の時のimg要素を生成
function generateMinkanImg(naki_pais_div, pai_num, size_min_flg){
    for(let i = 0; i < 4; i++){
        let naki_pais_img = document.createElement('img');
        naki_pais_img.setAttribute('src', ScriptCore.generate_pai_src(pai_num));
        if(size_min_flg){
            naki_pais_img.style.width = "40px";
        }
        if(i == 0){
            naki_pais_img.style.transform = "rotate(-90deg)";
            if(size_min_flg){
                naki_pais_img.style.marginLeft = "7px";
                naki_pais_img.style.marginRight = "7px";
            }
            else{
                naki_pais_img.style.marginLeft = "10px";
                naki_pais_img.style.marginRight = "10px";
            }
        }
        naki_pais_div.appendChild(naki_pais_img);
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
    img_element.src = ScriptCore.generate_pai_src(BACK);
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
                cellimg.src = ScriptCore.generate_pai_src(cell_id);
            }
            //字牌のID
            else{
                let cell_id = (i * SELECT_TABLE_COLUMN) + j;
                cell.id = cell_id
                cellimg.src = ScriptCore.generate_pai_src(cell_id);
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

            //画像を生成
            generatePongImg(naki_pais_div, pai_num, false);

            //鳴いた牌の種類と鳴きのタイプ（ポン）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.pong);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_pong_click();
            clearBtnReach();
            //天和、地和ボタンの無効化
            toggleRadioTenchi(false);
        }
        //チー（チーできるかどうかを調べてから行う）
        else if(mode_current == Mode.chi && isPossible_chi(pai_num) && count_tehai_pai(pai_num) < PAI_MAX){
            //手配3枚を隠す
            hidden_tehai_three();

            //画像を生成
            generateChiImg(naki_pais_div, pai_num, false);

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
            clearBtnReach();
            //天和、地和ボタンの無効化
            toggleRadioTenchi(false);
        }
        //暗槓（手配に1枚以上ある場合は行わない）
        else if(mode_current == Mode.ankan && count_tehai_pai(pai_num) <= 0){
            //手配3枚を隠す
            hidden_tehai_three();

            //画像を生成
            generateAnkanImg(naki_pais_div, pai_num, false);

            //鳴いた牌の種類と鳴きのタイプ（暗槓）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.ankan);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_ankan_click();
            //暗槓の時は立直の解除の必要なし
            //天和、地和ボタンの無効化
            toggleRadioTenchi(false);
            //嶺上開花ボタンの有効化
            toggleRadioRinshan(true);
        }
        //明槓（手配に1枚以上ある場合は行わない）
        else if(mode_current == Mode.minkan && count_tehai_pai(pai_num) <= 0){
            //手配3枚を隠す
            hidden_tehai_three();

            //画像を生成
            generateMinkanImg(naki_pais_div, pai_num, false);

            //鳴いた牌の種類と鳴きのタイプ（明槓）をリストに挿入
            naki_pais_list.push(pai_num);
            naki_type_list.push(Naki_Type.minkan);

            //牌が4枚になったらテーブルの牌を裏返しにする
            if(count_tehai_pai(pai_num) == PAI_MAX){
                hidden_table_pai(pai_num);
                max_pais_list.push(pai_num);
            }

            btn_minkan_click();
            clearBtnReach();
            //天和、地和ボタンの無効化
            toggleRadioTenchi(false);
            //嶺上開花ボタンの有効化
            toggleRadioRinshan(true);
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
            //和了ダイヤログを表示
            modal_agari.style.display = "block";
            //アガリ牌を記憶
            agari_hai = pai_num;
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
                set_tehai_img(i + 1, ScriptCore.generate_pai_src(BACK));
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

            //鳴きリストが0になったら天和、地和ボタンを有効化
            if(naki_pais_list.length == 0){
                toggleRadioTenchi(true);
            }
            //鳴きリストからカンがなくなったら嶺上開花ボタンを無効化
            let kan_count = 0;
            for(let i = 0; i < naki_type_list.length; i++){
                //暗槓、明槓の両方をカウントする
                if(naki_type_list[i] == Naki_Type.ankan || naki_type_list[i] == Naki_Type.minkan){
                    kan_count++;
                }
            }
            if(kan_count == 0){
                toggleRadioRinshan(false);
            }
        }
    });
}

//イベント登録（ノーテン用ダイヤログの閉じるボタン）
let modal_noten_close = document.getElementById('modal_noten_close');
modal_noten_close.addEventListener("click", () =>{
    modalNotenClose();
});
//イベント登録（アガリ用ダイヤログの閉じるボタン）
let modal_agari_close = document.getElementById('modal_agari_close');
modal_agari_close.addEventListener("click", () =>{
    modalAgariClose();
});
//イベント登録（場風用ダイヤログの閉じるボタン）
let modal_bakaze_close = document.getElementById('modal_bakaze_close');
modal_bakaze_close.addEventListener("click", () =>{
    modalBakazeClose();
});
//イベント登録（自風用ダイヤログの閉じるボタン）
let modal_jikaze_close = document.getElementById('modal_jikaze_close');
modal_jikaze_close.addEventListener("click", () =>{
    modalJikazeClose();
});
//イベント登録（設定用ダイヤログの閉じるボタン）
let modal_setting_close = document.getElementById('modal_setting_close');
modal_setting_close.addEventListener("click", () =>{
    modalSettingClose();
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
    //場風変更時
    if(event.target == modal_bakaze){
        modalBakazeClose();
    }
    //自風変更時
    if(event.target == modal_jikaze){
        modalJikazeClose();
    }
    //設定時
    if(event.target == modal_setting){
        modalSettingClose();
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
    modalAgariClose();
    calcAgari(Agari_Kata.tsumo);
}
//ロンボタンをクリックした時
function btn_ron_click(){
    modalAgariClose();
    calcAgari(Agari_Kata.ron);
}
//場風用ダイヤログが閉じたときの処理
function modalBakazeClose(){
    modal_bakaze.style.display = "none";
}
//自風用ダイヤログが閉じたときの処理
function modalJikazeClose(){
    modal_jikaze.style.display = "none";
}
//設定用ダイヤログが閉じたときの処理
function modalSettingClose(){
    modal_setting.style.display = "none";
}

//各種ボタン用関数
//場風
function btn_bakaze_click(){
    //場風ダイヤログを表示する
    modal_bakaze.style.display = "block";
}
function btn_bakaze_ton_click(){
    changeBakaze(Kaze_Type.ton);
}
function btn_bakaze_nan_click(){
    changeBakaze(Kaze_Type.nan);
}
function btn_bakaze_sha_click(){
    changeBakaze(Kaze_Type.sha);
}
function btn_bakaze_pei_click(){
    changeBakaze(Kaze_Type.pei);
}
//自風
function btn_jikaze_click(){
    //自風ダイヤログを表示する
    modal_jikaze.style.display = "block";
}
function btn_jikaze_ton_click(){
    changeJikaze(Kaze_Type.ton);
}
function btn_jikaze_nan_click(){
    changeJikaze(Kaze_Type.nan);
}
function btn_jikaze_sha_click(){
    changeJikaze(Kaze_Type.sha);
}
function btn_jikaze_pei_click(){
    changeJikaze(Kaze_Type.pei);
}
//一発ラジオボタンの切り替え
function toggleRadioIppatsu(flg){
    let radio_ippatsu_false = document.getElementById('radio_ippatsu_false');
    let radio_ippatsu_true = document.getElementById('radio_ippatsu_true');
    radio_ippatsu_false.disabled = !flg;
    radio_ippatsu_true.disabled = !flg;
    //フラグがfalseの時は一発（無し）をチェック状態にする
    if(!flg){
        radio_ippatsu_false.checked = true;
    }
}
//立直ボタンの解除
function clearBtnReach(){
    let btn_reach = document.getElementById('btn_reach');
    btn_reach.style.color = "black";
    btn_reach.firstChild.innerText = "立直";
    reach_type = Reach_Type.none;
    //一発ラジオボタンを無効化
    toggleRadioIppatsu(false);
}
//立直
function btn_reach_click(){
    let btn_reach = document.getElementById('btn_reach');
    //立直OFFの状態かつ面前の状態で押下
    if(reach_type == Reach_Type.none && isMenzen()){
        //立直に切り替える
        btn_reach.style.color = "red";
        reach_type = Reach_Type.reach;
        //一発ラジオボタンを有効化
        toggleRadioIppatsu(true);
    }
    //通常の立直の状態で押下
    else if(reach_type == Reach_Type.reach){
        //ダブル立直に切り替える
        btn_reach.firstChild.innerText = "ダブル立直";
        reach_type = Reach_Type.doublereach;
    }
    //ダブル立直の状態で押下
    else if(reach_type == Reach_Type.doublereach){
        //通常時に戻す
        clearBtnReach();
    }
}
//消去
function btn_delete_click(){
    //鳴きモード時はボタンも戻す
    //ポン
    if(mode_current == Mode.pong){
        btn_pong_click();
    }
    //チー
    if(mode_current == Mode.chi){
        btn_chi_click();
    }
    //暗槓
    if(mode_current == Mode.ankan){
        btn_ankan_click();
    }
    //明槓
    if(mode_current == Mode.minkan){
        btn_minkan_click();
    }

    /*各種変数のリセット*/
    //現在の手配の数
    tehai_current = 0;
    //現在のモード
    mode_current = Mode.normal;
    //鳴いた牌の種類配列
    naki_pais_list = [];
    //鳴きの種類の配列
    naki_type_list = [];
    //テーブル上の裏返しにした牌のリスト
    hidden_pais_list = [];
    //4枚以上使われている牌のリスト
    max_pais_list = [];
    //聴牌時の待ち牌リスト
    machihai_list = [];
    //和了時のアガリ牌リスト
    agarihai_list = [];

    //テロップのリセット
    stateText_change("手配を入力してください(残り14牌)");

    //テーブルのリセット
    visible_table_pai_all();

    //鳴きボタンを表示
    visible_naki_btn();

    //手牌のリセット
    for(let i = 0; i < TEHAI_NUMBER; i++){
        //手牌の画像と値をリセット
        set_tehai_img(i + 1, ScriptCore.generate_pai_src(BACK));
        set_tehai_value(i + 1, BACK);
        //非表示にした牌を表示
        get_tehai_obj(i + 1).style.visibility = "visible";
    }
    //鳴き牌のリセット
    for(let i = 0; i < tehai_nakis.length; i++){
        while(tehai_nakis[i].lastChild){
            tehai_nakis[i].removeChild(tehai_nakis[i].lastChild);
        }
    }

    //特殊役のラジオボタンをリセット
    toggleRadioTenchi(true);
    toggleRadioRinshan(false);
}
//設定
function btn_setting_click(){
    //設定ダイヤログを表示する
    modal_setting.style.display = "block";
}
//ドラのマイナスボタン
function btn_doraminus_click(){
    let dora_num = document.getElementById('dora_num');
    if(!(Number(dora_num.value) == 0)){
        dora_num.value = (Number(dora_num.value) - 1).toString();
    }
}
//ドラのプラスボタン
function btn_doraplus_click(){
    let dora_num = document.getElementById('dora_num');
    if(Number(dora_num.value) < 40){
        dora_num.value = (Number(dora_num.value) + 1).toString();
    }
}
//ドラのリセットボタン
function btn_dorareset_click(){
    let dora_num = document.getElementById('dora_num');
    dora_num.value = "0";
}
//本場のマイナスボタン
function btn_honbaminus_click(){
    let honba_num = document.getElementById('honba_num');
    if(!(Number(honba_num.value) == 0)){
        honba_num.value = (Number(honba_num.value) - 1).toString();
    }
}
//本場のプラスボタン
function btn_honbaplus_click(){
    let honba_num = document.getElementById('honba_num');
    if(Number(honba_num.value) < 20){
        honba_num.value = (Number(honba_num.value) + 1).toString();
    }
}
//本場のリセットボタン
function btn_honbareset_click(){
    let honba_num = document.getElementById('honba_num');
    honba_num.value = "0";
}
//天和、地和ラジオボタンの切り替え
function toggleRadioTenchi(flg){
    let radio_tenchi = document.getElementById('radio_tenchi');
    radio_tenchi.disabled = !flg;
    //フラグがfalseの時は「なし」ボタンに移行する
    if(!flg){
        let radio_none = document.getElementById('radio_none');
        radio_none.checked = true;
    }
}
//嶺上開花ラジオボタンの切り替え
function toggleRadioRinshan(flg){
    let radio_rinshan = document.getElementById('radio_rinshan');
    radio_rinshan.disabled = !flg;
    //フラグがfalseの時は「なし」ボタンに移行する
    if(!flg){
        let radio_none = document.getElementById('radio_none');
        radio_none.checked = true;
    }
}

//鳴きボタン用関数
//ポン
function btn_pong_click(){
    //ポンの状態で押下
    if(mode_current == Mode.normal){
        //鳴けない牌を非表示にする
        hidden_table_naki(Naki_Type.pong);
        
        //ポン以外を隠す
        btn_pong.firstChild.innerText = "解除";
        btn_chi.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_chi.style.visibility = "hidden";
        btn_ankan.style.visibility = "hidden";
        btn_minkan.style.visibility = "hidden";
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
        btn_pong.firstChild.innerText = "ポン";
        btn_chi.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_chi.style.visibility = "visible";
        btn_ankan.style.visibility = "visible";
        btn_minkan.style.visibility = "visible";
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
        btn_chi.firstChild.innerText = "解除";
        btn_pong.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_pong.style.visibility = "hidden";
        btn_ankan.style.visibility = "hidden";
        btn_minkan.style.visibility = "hidden";
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
        btn_chi.firstChild.innerText = "チー";
        btn_pong.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_pong.style.visibility = "visible";
        btn_ankan.style.visibility = "visible";
        btn_minkan.style.visibility = "visible";
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
        btn_ankan.firstChild.innerText = "解除";
        btn_pong.style.cursor = "default";
        btn_chi.style.cursor = "default";
        btn_minkan.style.cursor = "default";
        btn_pong.style.visibility = "hidden";
        btn_chi.style.visibility = "hidden";
        btn_minkan.style.visibility = "hidden";
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
        btn_ankan.firstChild.innerText = "暗槓";
        btn_pong.style.cursor = "pointer";
        btn_chi.style.cursor = "pointer";
        btn_minkan.style.cursor = "pointer";
        btn_pong.style.visibility = "visible";
        btn_chi.style.visibility = "visible";
        btn_minkan.style.visibility = "visible";
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
        btn_minkan.firstChild.innerText = "解除";
        btn_pong.style.cursor = "default";
        btn_chi.style.cursor = "default";
        btn_ankan.style.cursor = "default";
        btn_pong.style.visibility = "hidden";
        btn_chi.style.visibility = "hidden";
        btn_ankan.style.visibility = "hidden";
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
        btn_minkan.firstChild.innerText = "明槓";
        btn_pong.style.cursor = "pointer";
        btn_chi.style.cursor = "pointer";
        btn_ankan.style.cursor = "pointer";
        btn_pong.style.visibility = "visible";
        btn_chi.style.visibility = "visible";
        btn_ankan.style.visibility = "visible";
        //テロップを通常に変更
        stateText_change("手配を入力してください(残り" + (TEHAI_NUMBER - count_tehai_num()).toString() + "牌)");
        //モードを通常へ
        mode_current = Mode.normal;
    }
}

//入力画面に戻るボタン
function btn_backtoinput_click(){
    input_screen.style.display = "inline";
    output_screen.style.display = "none";
    //アガリの手牌を消去
    deleteTehaiResult();
    //点数を消去
    deleteTensuu();
    //翻数と役のリストを消去
    deleteYakuList();
    //符数のリストを消去
    deleteFusuuList();
}
