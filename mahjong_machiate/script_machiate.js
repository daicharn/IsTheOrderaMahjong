//待ちの形
const Machi_Type = {
    tanki : 0,
    ryanmen : 1,
    shanpon : 2,
    kanchan : 3,
    penchan : 4
}

//牌の種類
const Hai_Type = {
    manzu : 0,
    pinzu : 1,
    souzu : 2
}

//モード
const Mode = {
    normal : 0,
    makeprob : 1
}

//手牌
let tehai_count = generateTehai();
//待ちのリスト
let machihai_list = generateMachiList(tehai_count);
//4枚使われている牌のリスト
let maxhai_list = generateMaxHaiList(tehai_count);
//待ちが0枚だった場合は再生成
while(machihai_list.filter(i => maxhai_list.indexOf(i) == -1).length == 0){
    tehai_count = generateTehai();
    machihai_list = generateMachiList(tehai_count);
    maxhai_list = generateMaxHaiList(tehai_count);
}
//問題作成用の手牌のリスト
let tehai_list_makeprob = [];

//テーブルの選択フラグ
let select_flgs = new Array(9).fill(false);

//表示する牌種(初期値は萬子)
let display_haishu = Hai_Type.manzu;

//モード
let mode = Mode.normal;

//ダイヤログ用のオブジェクト
let modal_answer = document.getElementById('modal_answer');
let modal_answer_body = document.getElementById('modal_answer_body');
let modal_haishu = document.getElementById('modal_haishu');
let modal_marker = document.getElementById('modal_marker');
let modal_setting = document.getElementById('modal_setting');

//手牌の基盤を生成
for(i = 0; i < 13; i++){
    let div_element = document.createElement('div');
    let img_element = document.createElement('img');
    div_element.className = "tehai_part";
    div_element.appendChild(img_element);
    document.getElementById('tehai').appendChild(div_element);
}
//問題作成用の手牌の基盤を生成
for(i = 0; i < 13; i++){
    let div_element = document.createElement('div');
    let img_element = document.createElement('img');
    img_element.src = ScriptCore.generate_pai_src(BACK);
    div_element.className = "tehai_part_makeprob";
    div_element.style.cursor = "pointer";
    div_element.appendChild(img_element);
    document.getElementById('tehai_makeprob').appendChild(div_element);
}

//手牌のリスト
let tehai_parts = document.getElementsByClassName('tehai_part');
//クリック時のイベント登録
for(let i = 0; i < tehai_parts.length; i++){
    tehai_parts[i].addEventListener("click", () =>{
        //通常モード時
        if(mode == Mode.normal){
            let marker_enabled = document.getElementById('checkbox_marker').checked
            //マーカーが有効の時
            if(marker_enabled){
                //色がついていなければ色を付ける
                if(tehai_parts[i].style.backgroundColor == ""){
                    let color = document.getElementById('color_marker').value;
                    tehai_parts[i].style.backgroundColor = color;
                    tehai_parts[i].firstChild.style.opacity = "0.5";
                }
                //色がついていれば色を消す
                else{
                    tehai_parts[i].style.backgroundColor = "";
                    tehai_parts[i].firstChild.style.opacity = "1";
                }
            }
        }
    });
}

//問題作成用の手牌のリスト
let tehai_parts_makeprob = document.getElementsByClassName('tehai_part_makeprob');
//クリック時のイベント登録
for(let i = 0; i < tehai_parts_makeprob.length; i++){
    tehai_parts_makeprob[i].addEventListener("click", () =>{
        //問題作成モード時
        if(mode == Mode.makeprob){
            //牌があれば消去する
            if(i < tehai_list_makeprob.length){
                let tehai_num = tehai_list_makeprob[i];
                //消去前に4枚であればテーブルの牌を表に戻す
                if(tehai_list_makeprob.filter(n => n === tehai_num).length == 4){
                    select_cells[tehai_num - 1].firstChild.src = ScriptCore.generate_pai_src(display_haishu * 9 + tehai_num);
                }
                //牌の消去処理
                tehai_list_makeprob[i] = BACK;
                setTehaimakeprobimg(i + 1, BACK);
                sortTehaimakeprob();
                tehai_list_makeprob.pop();
            }
        }
    });
}

//待ち牌選択用テーブルを生成
let tbl = document.createElement('table');
let tblBody = document.createElement('tbody');
tbl.id = "select_table";
for(let i = 0; i < 3; i++){
    let row = document.createElement('tr');
    for(let j = 0; j < 3; j++){
        let cell = document.createElement('td');
        let cellimg = document.createElement('img');
        cell.className = "select_cell";
        cell.appendChild(cellimg);
        row.appendChild(cell);
    }
    tblBody.appendChild(row);
}
tbl.appendChild(tblBody);
document.getElementById('select_div').appendChild(tbl);

//待ち牌選択用テーブルのセルのリスト
let select_cells = document.getElementsByClassName('select_cell');
//クリック時のイベント登録
for(let i = 0; i < select_cells.length; i++){
    select_cells[i].addEventListener("click", () =>{
        //通常モード時
        if(mode == Mode.normal){
            //4枚使われている牌はクリックを無効
            if(!maxhai_list.includes(i + 1)){
                let cell = select_cells[i];
                //対象のボタンのフラグがONの時
                if(select_flgs[i]){
                    //セルの牌を赤くする
                    transparentCellImg(cell);
                    //フラグをOFFにする
                    select_flgs[i] = false;
                }
                //対象のボタンのフラグがOFFの時
                else{
                    //セルの牌を透明にする
                    redCellImg(cell);
                    //フラグをONにする
                    select_flgs[i] = true;
                }
            }
        }
        //問題作成モード時
        else if(mode == Mode.makeprob){
            //問題作成用の手牌内に存在するクリックされた牌の個数
            let pai_count = tehai_list_makeprob.filter(n => n === i + 1).length;
            //4枚以上使用されていなければ手牌追加の処理を行う
            if(pai_count < 4){
                //現在の手牌の数を計算する
                let tehai_current = tehai_list_makeprob.length;
                //手牌が13枚より少ない場合のみ実行
                if(tehai_current < 13){
                    //画像の差し替え
                    setTehaimakeprobimg(tehai_current + 1, display_haishu * 9 + i + 1);
                    //手牌に追加
                    tehai_list_makeprob.push(i + 1);
                    //手牌のソート
                    sortTehaimakeprob();

                    //牌の上限の4枚に到達したらテーブル上のその牌を裏返しにする
                    if(pai_count >= 3){
                        select_cells[i].firstChild.src = ScriptCore.generate_pai_src(BACK);
                    }   
                }
            }
        }
    });
}

//手牌の画像を画面に挿入
insertTehaiImage(display_haishu);
//待ち牌洗濯用のテーブルに画像を挿入(初期状態は萬子)
insertImgSelectTable(display_haishu);
//4枚使用されている牌のセルの画像を薄くする
thinMaxHaiCell();
//実際の解答をモーダルに表示
viewTrueAnswerOnModal();

//問題作成用の手牌の画像の設定
function setTehaimakeprobimg(i, src){
    let tehai_img = tehai_parts_makeprob[i - 1].firstChild;
    tehai_img.src = ScriptCore.generate_pai_src(src);
}
//問題作成用の手牌のソート
function sortTehaimakeprob(){
    for(let i = 0; i < tehai_list_makeprob.length - 1; i++){
        let m = i;
        for(let j = i + 1; j < tehai_list_makeprob.length; j++){
            if(tehai_list_makeprob[j] < tehai_list_makeprob[m]){
                m = j;
            }
        }
        //手牌の画像の入れ替え（どちらかが裏返しの牌だった場合は処理を配慮する）
        if(tehai_list_makeprob[m] === BACK){
            setTehaimakeprobimg(i + 1, BACK);
            setTehaimakeprobimg(m + 1, display_haishu * 9 + tehai_list_makeprob[i]);
        }
        else if(tehai_list_makeprob[i] === BACK){
            setTehaimakeprobimg(i + 1, display_haishu * 9 + tehai_list_makeprob[m]);
            setTehaimakeprobimg(m + 1, BACK);
        }
        //どちらも裏返しでない場合
        else{
            setTehaimakeprobimg(i + 1, display_haishu * 9 + tehai_list_makeprob[m]);
            setTehaimakeprobimg(m + 1, display_haishu * 9 + tehai_list_makeprob[i]);
        }
        //手牌の値の入れ替え
        let temp_value = tehai_list_makeprob[i];
        tehai_list_makeprob[i] = tehai_list_makeprob[m];
        tehai_list_makeprob[m] = temp_value;
    }
}


//手牌の画像を画面に挿入
function insertTehaiImage(hai_type){
    let count = 0;
    for(i = 0; i < tehai_count.length; i++){
        for(j = 0; j < tehai_count[i].length; j++){
            for(let k = 0; k < tehai_count[i][j]; k++){
                let img_element = tehai_parts[count].firstChild;
                //字牌でない場合
                if(i != 3){
                    img_element.src = ScriptCore.generate_pai_src(hai_type * 9 + j + 1);
                }
                //字牌の場合
                else{
                    img_element.src = ScriptCore.generate_pai_src(27 + j + 1);
                }
                count++;
            }
        }
    }
}

//問題作成用の手牌を初期化する
function initTehaiMakeprobImage(){
    for(let i = 0; i < tehai_parts_makeprob.length; i++){
        let tehai_part_image = tehai_parts_makeprob[i].firstChild;
        tehai_part_image.src = ScriptCore.generate_pai_src(BACK);
    }
}

//手牌のマーカーを全て消去する
function removeTehaiMarker(){
    for(i = 0; i < 13; i++){
        if(!(tehai_parts[i].style.backgroundColor == "")){
            tehai_parts[i].style.backgroundColor = "";
            tehai_parts[i].firstChild.style.opacity = "1";
        }
    }    
}

//待ち牌選択用のテーブルに画像を挿入
function insertImgSelectTable(hai_type){
    for(let i = 0; i < select_cells.length; i++){
        let cellimg = select_cells[i].firstChild;
        cellimg.src = ScriptCore.generate_pai_src(hai_type * 9 + i + 1);
    }
}

//4枚使用されている牌のセルの画像を薄くする
function thinMaxHaiCell(){
    for(let i = 0; i < maxhai_list.length; i++){
        let cellimg = select_cells[maxhai_list[i] - 1].firstChild;
        cellimg.style.opacity = "0.5";
    }
}
//4枚使用されている牌のセルの画像の薄くしたのを元に戻す
function normalMaxHaiCell(){
    for(let i = 0; i < maxhai_list.length; i++){
        let cellimg = select_cells[maxhai_list[i] - 1].firstChild;
        cellimg.style.opacity = "1";
    }
}

//押下されたセルの牌を赤くする
function redCellImg(cell){
    let cellimg = cell.firstChild;
    //背景色を赤、透過率を0.8にする
    cell.style.backgroundColor = "red";
    cellimg.style.opacity = "0.8";
}

//押下されたセルの牌を透明にする
function transparentCellImg(cell){
    let cellimg = cell.firstChild;
    //背景色と透過率を元に戻す
    cell.style.backgroundColor = "transparent";
    cellimg.style.opacity = "1"; 
}

//手牌の生成
function generateTehai(){
    //手牌のリストのひな形を生成
    let result_list = ScriptCore.createCountHaisBase();

    let machi_rand = Math.random();
    let machi_type = 0;
    let mentsu_num = 0;
    //両面待ち（80%）
    if(machi_rand < 0.8){
        machi_type = Machi_Type.ryanmen;
    }
    //単騎待ち（5%）
    else if(machi_rand < 0.85){
        machi_type = Machi_Type.tanki;
    }
    //シャンポン待ち（5%）
    else if(machi_rand < 0.9){
        machi_type = Machi_Type.shanpon;
    }
    //カンチャン待ち（5%）
    else if(machi_rand < 0.95){
        machi_type = Machi_Type.kanchan;
    }
    //ペンチャン待ち（5%）
    else{
        machi_type = Machi_Type.penchan;
    }

    //単騎以外は面子を3つ生成する
    if(machi_type != Machi_Type.tanki){
        mentsu_num = 3;
    }
    else{
        mentsu_num = 4;
    }

    //字牌の刻子の指定がある場合は先に追加する
    let radios_jihai = document.getElementsByClassName('radio_jihai');
    let jihai_num = 0;
    for(let i = 0; i < radios_jihai.length; i++){
        if(radios_jihai[i].checked){
            jihai_num = i;
        }
    }
    //字牌の刻子の数だけ通常の面子の数を減らす
    mentsu_num -= jihai_num;
    //字牌の刻子を生成する
    for(let i = 0; i < jihai_num; i++){
        while(true){
            //1から7までをランダムに生成
            let jihai_rand = Math.floor(Math.random() * 7) + 1;
            //牌が一つでも使われていたら再度違う刻子を生成する
            if(result_list[3][jihai_rand - 1] < 1){
                result_list[3][jihai_rand - 1] += 3;
                break;
            }
            else{
                continue;
            }
        }
    }

    //面子を生成する
    for(let i = 0; i < mentsu_num; i++){
        while(true){
            let mentsu_rand = Math.random();
            //順子（90%）
            if(mentsu_rand < 0.9){
                //1から7までをランダムに生成
                let shuntsu_first = Math.floor(Math.random() * 7) + 1;
                //牌が4つ以上使われていたら再度違う面子を生成する
                if(result_list[0][shuntsu_first - 1] < 4 && result_list[0][shuntsu_first] < 4 && result_list[0][shuntsu_first + 1] < 4){
                    result_list[0][shuntsu_first - 1]++;
                    result_list[0][shuntsu_first]++;
                    result_list[0][shuntsu_first + 1]++;
                    break;
                }
                else{
                    continue;
                }
            }
            //刻子（10%）
            else{
                //1から9までをランダムに生成
                let kotsu_first = Math.floor(Math.random() * 9) + 1;
                //牌が2つ以上使われていたら再度違う面子を生成する
                if(result_list[0][kotsu_first - 1] < 2){
                    result_list[0][kotsu_first - 1] += 3;
                    break;
                }
                else{
                    continue;
                }
            }
        }
    }

    //雀頭の追加

    //単騎待ちの場合は雀頭となる牌を1枚追加
    if(machi_type == Machi_Type.tanki){
        while(true){
            //1から9までをランダムに生成
            let janto_rand = Math.floor(Math.random() * 9) + 1;
            //牌が4つ以上使われていたら再度違う雀頭を生成する
            if(result_list[0][janto_rand - 1] < 4){
                result_list[0][janto_rand - 1]++;
                break;
            }
            else{
                continue;
            }
        }
    }
    //単騎待ち以外の場合は雀頭を1つ追加
    else{
        while(true){
            //1から9までをランダムに生成
            let janto_rand = Math.floor(Math.random() * 9) + 1;
            //牌が3つ以上使われていたら再度違う雀頭を生成する
            if(result_list[0][janto_rand - 1] < 3){
                result_list[0][janto_rand - 1] += 2;
                break;
            }
            else{
                continue;
            }
        }
    }

    //塔子の追加

    //シャンポン待ちの場合は対子を1つ追加
    if(machi_type == Machi_Type.shanpon){
        while(true){
            //1から9までをランダムに生成
            let janto_rand = Math.floor(Math.random() * 9) + 1;
            //牌が3つ以上使われていたら再度違う対子を生成する
            if(result_list[0][janto_rand - 1] < 3){
                result_list[0][janto_rand - 1] += 2;
                break;
            }
            else{
                continue;
            }
        }
    }
    //カンチャン待ちの場合はカンチャン塔子を1つ追加
    else if(machi_type == Machi_Type.kanchan){
        while(true){
            //1から7までをランダムに生成
            let kanchan_rand = Math.floor(Math.random() * 7) + 1;
            //牌が4つ以上使われていたら再度違う塔子を生成する
            if(result_list[0][kanchan_rand - 1] < 4 && result_list[0][kanchan_rand + 1] < 4){
                result_list[0][kanchan_rand - 1]++;
                result_list[0][kanchan_rand + 1]++;
                break;
            }
            else{
                continue;
            }
        }
    }
    //ペンチャン待ちの場合はペンチャン塔子を1つ追加
    else if(machi_type == Machi_Type.penchan){
        while(true){
            //1か2をランダムに生成
            let penchan_rand = Math.floor(Math.random() * 2) + 1;
            //1の場合
            if(penchan_rand == 1){
                //牌が4つ以上使われていたら再度違う塔子を生成する
                if(result_list[0][0] < 4 && result_list[0][1] < 4){
                    result_list[0][0]++;
                    result_list[0][1]++;
                    break;
                }
                else{
                    continue;
                }
            }
            //2の場合
            else{
                //牌が4つ以上使われていたら再度違う塔子を生成する
                if(result_list[0][7] < 4 && result_list[0][8] < 4){
                    result_list[0][7]++;
                    result_list[0][8]++;
                    break;
                }
                else{
                    continue;
                }
            }
        }
    }
    //両面待ちの場合は両面塔子を1つ追加
    else if(machi_type == Machi_Type.ryanmen){
        while(true){
            //1から6までをランダムに生成
            let ryanmen_rand = Math.floor(Math.random() * 6) + 1;
            //牌が4つ以上使われていたら再度違う塔子を生成する
            if(result_list[0][ryanmen_rand] < 4 && result_list[0][ryanmen_rand + 1] < 4){
                result_list[0][ryanmen_rand]++;
                result_list[0][ryanmen_rand + 1]++;
                break;
            }
            else{
                continue;
            }
        }        
    }

    return result_list;
}

//手牌の生成(8面待ち)
function generateTehai8Men(){
    //8面待ちのリスト(16通り)
    let tehai_lists = ["1112223456777","1112345666678","1113334567888","1233334567888",
                       "2223334567888","2223344556777","2223445566777","2223456677778",
                       "2223456777789","2223456777888","2223456777999","2333344567888",
                       "2344445678999","3334455667888","3334556677888","3334567888999"];
    
    //手牌のリストのひな形を生成
    let result_list = ScriptCore.createCountHaisBase();
    //リストからランダムに1つ取り出す
    let tehai_rand = Math.floor(Math.random() * tehai_lists.length);
    //手牌のリストに値を挿入
    for(let i = 0; i < tehai_lists[tehai_rand].length; i++){
        result_list[0][Number(tehai_lists[tehai_rand][i]) - 1]++;
    }

    return result_list;
}

//手牌の生成(9面待ち、純正九連)
function generateTehai9Men(){
    let tehai = "1112345678999";
    //手牌のリストのひな形を生成
    let result_list = ScriptCore.createCountHaisBase();
    //手牌のリストに値を挿入
    for(let i = 0; i < tehai.length; i++){
        result_list[0][Number(tehai[i]) - 1]++;
    }

    return result_list;
}

//待ち牌のリストの生成
function generateMachiList(tehai_list){
    let result_list = [];
    //待ちの候補を取得する（一般手について）
    ScriptCore.createMachihaiListRecursive(tehai_list, 0, 0, 0, 0, result_list);
    //七対子の場合の待ちについても取得
    if(ScriptCore.calcChiitoiShanten(tehai_list) == 0){
        let machi_chiitoi = ScriptCore.searchChiitoiMachi(tehai_list);
        if(!result_list.includes(machi_chiitoi)){
            result_list.push(machi_chiitoi);
        }
    }

    //テスト（4枚使っている牌を除外する）
    //result_list = result_list.filter(i => generateMaxHaiList(tehai_list).indexOf(i) == -1);

    //ソートする
    result_list.sort();

    return result_list;
}

//4枚使用されている牌のリストを生成
function generateMaxHaiList(tehai_list){
    let result_list = [];
    for(let i = 0; i < tehai_list[0].length; i++){
        if(tehai_list[0][i] >= 4){
            result_list.push(i + 1);
        }
    }

    return result_list;
}

//受け入れ枚数の計算
function getUkeireMaisuu(){
    let result = 0;
    for(let i = 0; i < machihai_list.length; i++){
        result += 4 - tehai_count[0][machihai_list[i] - 1];
    }
    return result;
}

//状態テキストの変更
function changeStateText(str){
    let state_text_div = document.getElementById('state_text');
    state_text_div.innerText = str;
}
//セルの選択（画像）を表示
function viewSelectCellsImg(){
    for(let i = 0; i < select_cells.length; i++){
        let cell = select_cells[i];
        if(select_flgs[i]){
            redCellImg(cell);
        }
    }
}
//セルの選択（画像）をクリア
function clearSelectCellsImg(){
    for(let i = 0; i < select_cells.length; i++){
        let cell = select_cells[i];
        if(select_flgs[i]){
            transparentCellImg(cell);
        }
    }
}
//セルの選択（フラグ）をクリア
function clearSelectCellsflg(){
    for(let i = 0; i < select_cells.length; i++){
        let cell = select_cells[i];
        if(select_flgs[i]){
            select_flgs[i] = false;
        }
    }
}

//実際の解答をモーダルに表示
function viewTrueAnswerOnModal(){
    let true_answer_div = document.getElementById('true_answer_div');
    //削除処理
    while(true_answer_div.firstChild){
        true_answer_div.removeChild(true_answer_div.firstChild);
    }
    //追加処理
    for(let i = 0; i < machihai_list.length; i++){
        //現段階では4枚以上ある牌を隠す
        if(!maxhai_list.includes(machihai_list[i])){
            let div_element = document.createElement('div');
            let img_element = document.createElement('img');
            img_element.src = ScriptCore.generate_pai_src(display_haishu * 9 + machihai_list[i]);
            div_element.appendChild(img_element);
            true_answer_div.appendChild(div_element);
        }
    }
}

//ユーザの回答をモーダルに表示
function viewUserAnswerOnModal(){
    let user_answer_div = document.getElementById('user_answer_div');
    //一つもテーブルが選択されていなければ未回答と表示
    if(select_flgs.every(value => value == false)){
        let no_answer_p = document.createElement('p');
        no_answer_p.innerText = "未回答";
        no_answer_p.style.fontSize = 20;
        no_answer_p.style.marginTop = 0;
        no_answer_p.style.marginBottom = 10;
        user_answer_div.appendChild(no_answer_p);
    }
    //解答があった場合はその牌を表示
    else{
        for(let i = 0; i < select_flgs.length; i++){
            if(select_flgs[i]){
                let div_element = document.createElement('div');
                let img_element = document.createElement('img');
                img_element.src = ScriptCore.generate_pai_src(display_haishu * 9 + i + 1);
                div_element.appendChild(img_element);
                user_answer_div.appendChild(div_element);
            }
        }
    }
    //受け入れ枚数の表示
    let ukeire_p = document.getElementById('ukeire_p');
    ukeire_p.innerText = "（" + machihai_list.filter(i => maxhai_list.indexOf(i) == -1).length.toString() + "種" + getUkeireMaisuu().toString() + "牌）";
}
//ユーザの回答をモーダルから削除
function deleteUserAnswerOnModal(){
    let user_answer_div = document.getElementById('user_answer_div');
    while(user_answer_div.firstChild){
        user_answer_div.removeChild(user_answer_div.firstChild);
    }
}

//クリアボタンが押された時
function btn_clear_click(){
    clearSelectCellsImg();
    clearSelectCellsflg();
}
//解答ボタンが押された時
function btn_answer_click(){
    //ユーザの回答をモーダルに表示
    viewUserAnswerOnModal();
    //モーダルを表示
    modal_answer.style.display = "block";
}
//次の問題ボタンが押された時
function btn_next_click(){
    //待ち牌選択用テーブルをリセット
    btn_clear_click();
    normalMaxHaiCell();
    removeTehaiMarker();

    //待ちのリストをリセット
    machihai_list.length = 0;

    //新しい手牌と待ちを再度生成
    while(machihai_list.filter(i => maxhai_list.indexOf(i) == -1).length == 0){
        //手牌
        tehai_count = generateTehai();
        //待ちのリスト
        machihai_list = generateMachiList(tehai_count);
        //4枚使われている牌のリスト
        maxhai_list = generateMaxHaiList(tehai_count);
    }
    //手牌の画像を画面に挿入
    insertTehaiImage(display_haishu);
    //4枚使用されている牌のセルの画像を薄くする
    thinMaxHaiCell();
    //実際の解答をモーダルに表示
    viewTrueAnswerOnModal();
}
//牌種の変更ボタンが押された時
function btn_haishu_click(){
    let haishu_radios = document.getElementsByClassName('haishu_radio');
    haishu_radios[display_haishu].checked = true;
    modal_haishu.style.display = "block";
}
//牌種の変更時、キャンセルボタンが押された時
function btn_haishu_cancel_click(){
    //モーダルを閉じる
    modalHaishuClose();
}
//牌種の変更時、決定ボタンが押された時
function btn_haishu_enter_click(){
    //ラジオボタンで選択された牌種を取得
    let new_haishu = 0;
    let haishu_radios = document.getElementsByClassName('haishu_radio');
    for(let i = 0; i < haishu_radios.length; i++){
        if(haishu_radios[i].checked){
            new_haishu = i;
        }
    }
    //モーダルを閉じる
    modalHaishuClose();
    
    //現在の牌種と選択された牌種が異なれば変更を行う
    if(display_haishu != new_haishu){
        //手牌の画像を画面に挿入
        insertTehaiImage(new_haishu);
        //選択用テーブルの変更
        insertImgSelectTable(new_haishu);
        //牌種の変更
        display_haishu = new_haishu;
    }
}
//マーカーボタンが押された時
function btn_marker_click(){
    modal_marker.style.display = "block";
}
//設定ボタンが押された時
function btn_setting_click(){
    modal_setting.style.display = "block";
}
//問題を作成ボタンが押された時
function btn_makeprob_click(){
    let btnlist_normal = document.getElementById('btnlist_normal');
    let btnlist_makeprob = document.getElementById('btnlist_makeprob');
    let tehai_div = document.getElementById('tehai');
    let tehai_makeprob_div = document.getElementById('tehai_makeprob');
    btnlist_normal.style.display = "none";
    btnlist_makeprob.style.display = "flex";
    tehai_div.style.zIndex = "0";
    tehai_makeprob_div.style.zIndex = "1";
    //状態テキストの変更
    changeStateText("手牌を入力してください");
    //4枚使われている牌の半透明化を解除
    normalMaxHaiCell();
    //テーブルの選択を解除
    clearSelectCellsImg();
    //問題作成モードに変更
    mode = Mode.makeprob;
}
//問題作成中のキャンセルボタンが押された時
function btn_cancel_makeprob_click(){
    let btnlist_normal = document.getElementById('btnlist_normal');
    let btnlist_makeprob = document.getElementById('btnlist_makeprob');
    let tehai_div = document.getElementById('tehai');
    let tehai_makeprob_div = document.getElementById('tehai_makeprob');
    btnlist_normal.style.display = "block";
    btnlist_makeprob.style.display = "none";
    tehai_div.style.zIndex = "1";
    tehai_makeprob_div.style.zIndex = "0";
    //状態テキストの変更
    changeStateText("待ち牌を選択してください");
    //4枚使われている牌を再度半透明化
    thinMaxHaiCell();
    //テーブルの選択状態を元に戻す
    viewSelectCellsImg();
    //テーブルの牌を元に戻す（裏返しになったものを表にする）
    insertImgSelectTable(display_haishu);
    //問題作成用の手牌を初期化
    tehai_list_makeprob.length = 0;
    initTehaiMakeprobImage();
    //通常モードに変更
    mode = Mode.normal;
}
//問題作成中の決定ボタンが押された時
function btn_enter_makeprob_click(){
    //手牌が13枚入力されているとき
    if(tehai_list_makeprob.length >= TEHAI_NUMBER - 1){
        //手牌のリストから手牌の配列を作成
        let tehai_count_makeprob = ScriptCore.createCountHaisBase();
        for(let i = 0; i < tehai_list_makeprob.length; i++){
            tehai_count_makeprob[0][tehai_list_makeprob[i] - 1]++
        }

        //待ちのリストを仮生成
        machihai_list_temp = generateMachiList(tehai_count_makeprob);
        //4枚存在する牌を除去した待ちのリスト
        machihai_list_true = machihai_list_temp.filter(i => generateMaxHaiList(tehai_count_makeprob).indexOf(i) == -1)

        //待ち牌が一枚も存在しない場合は追加の確認ダイアログを表示する
        if(machihai_list_true.length === 0){
            //キャンセルが押された場合問題の作成を中止
            if(!confirm("待ち牌が一枚も存在しませんが問題を作成してよろしいでしょうか。")){
                return;
            }
        }

        //確認ダイヤログを表示する
        if(!confirm("現在の問題は消去されますがよろしいでしょうか。")){
            return;
        }

        //以下、問題作成の処理
        tehai_count = ScriptCore.copyArray(tehai_count_makeprob);
        //手牌のマーカーを消去
        removeTehaiMarker();

        //仮作成した待ちのリストを使用（4枚を除去していないもの）
        machihai_list = machihai_list_temp.slice();
        //4枚使われている牌のリスト
        maxhai_list = generateMaxHaiList(tehai_count);
        //手牌の画像を画面に挿入
        insertTehaiImage(display_haishu);
        //4枚使用されている牌のセルの画像を薄くする
        thinMaxHaiCell();
        //実際の解答をモーダルに表示
        viewTrueAnswerOnModal();

        //テーブルのフラグを削除する
        clearSelectCellsflg();
        //テーブルの牌を元に戻す（裏返しになったものを表にする）
        insertImgSelectTable(display_haishu);
        //問題作成用の手牌を初期化
        tehai_list_makeprob.length = 0;
        initTehaiMakeprobImage();

        let btnlist_normal = document.getElementById('btnlist_normal');
        let btnlist_makeprob = document.getElementById('btnlist_makeprob');
        let tehai_div = document.getElementById('tehai');
        let tehai_makeprob_div = document.getElementById('tehai_makeprob');
        btnlist_normal.style.display = "block";
        btnlist_makeprob.style.display = "none";
        tehai_div.style.zIndex = "1";
        tehai_makeprob_div.style.zIndex = "0";
        //状態テキストの変更
        changeStateText("待ち牌を選択してください");

        //通常モードに変更
        mode = Mode.normal;

        //字牌の刻子を0個にする
        let radio_jihai_0 = document.getElementById('radio_jihai_0');
        radio_jihai_0.checked = true;
    }
    //手牌が13枚ない場合
    else{
        alert("手牌を13枚入力してください。");
    }
}

//イベント登録（解答用ダイヤログの閉じるボタン）
let modal_answer_close = document.getElementById('modal_answer_close');
modal_answer_close.addEventListener("click", () =>{
    modalAnswerClose();
});
//イベント登録（牌種選択用ダイヤログの閉じるボタン）
let modal_haishu_close = document.getElementById('modal_haishu_close');
modal_haishu_close.addEventListener("click", () =>{
    modalHaishuClose();
});
//イベント登録（マーカー用ダイヤログの閉じるボタン）
let modal_marker_close = document.getElementById('modal_marker_close');
modal_marker_close.addEventListener("click", () => {
    modalMarkerClose();
})
//イベント登録（設定用ダイヤログの閉じるボタン）
let modal_setting_close = document.getElementById('modal_setting_close');
modal_setting_close.addEventListener("click", () => {
    modalSettingClose();
})
//モーダルコンテンツ以外がクリックされた時のイベントをそれぞれのダイヤログに登録
addEventListener("click", (event) =>{
    //解答時
    if(event.target == modal_answer){
        modalAnswerClose();
    }
    //牌種洗濯時
    else if(event.target == modal_haishu){
        modalHaishuClose();
    }
    //マーカー時
    else if(event.target == modal_marker){
        modalMarkerClose();
    }
    //設定時
    else if(event.target == modal_setting){
        modalSettingClose();
    }
});
//解答用ダイヤログが閉じたときの処理
function modalAnswerClose(){
    deleteUserAnswerOnModal();
    modal_answer.style.display = "none";
}
//牌種選択用ダイヤログが閉じたときの処理
function modalHaishuClose(){
    modal_haishu.style.display = "none";
}
//マーカー用ダイヤログが閉じたときの処理
function modalMarkerClose(){
    modal_marker.style.display = "none";
}
//設定用ダイヤログが閉じたときの処理
function modalSettingClose(){
    modal_setting.style.display = "none";
}

//モーダルが開いているかどうか確認する
function isModalOpen(){
    let modals = document.getElementsByClassName('modal');
    for(let i = 0; i < modals.length; i++){
        if(modals[i].style.display == "block"){
            return true;
        }
    }

    return false;
}

//キーボードを押したときのイベント
document.onkeydown = (event) =>{
    //数値キーが押された時、その数値に値する牌を押下したこととして扱う
    if(event.key >= 1 && event.key <= 9){
        //モーダルが開いているときは処理を行わない
        if(!isModalOpen()){
            select_cells[Number(event.key) - 1].click();
        }
    }
    //エスケープキーが押された時
    else if(event.key === "Escape"){
        //モーダルが開いているときはそれを閉じる
        if(modal_answer.style.display == "block"){
            modalAnswerClose();
        }
        else if(modal_haishu.style.display == "block"){
            modalHaishuClose();
        }
        else if(modal_marker.style.display == "block"){
            modalMarkerClose();
        }
        else if(modal_setting.style.display == "block"){
            modalSettingClose();
        }
        //問題作成モードの時はキャンセルボタンを押す処理を行う
        else if(mode == Mode.makeprob){
            btn_cancel_makeprob_click();
        }
        //通常時は選択した牌をクリア
        else{
            btn_clear_click();
        }
    }
    //スペースキーが押された時、解答を表示
    else if(event.key === " "){
        //モーダルが開いているとき、問題作成モードの時は処理を行わない
        if(!isModalOpen() && mode != Mode.makeprob){
            btn_answer_click();
        }
    }
    //エンターキーが押された時、次の問題へ
    else if(event.key === "Enter"){
        //モーダルが開いているとき、問題作成モードの時は処理を行わない
        if(!isModalOpen() && mode != Mode.makeprob){
            btn_next_click();
        }
        //問題作成モードの時は決定ボタンを押す処理を行う
        else if(mode == Mode.makeprob){
            btn_enter_makeprob_click();
        }
    }
}

//生成される待ちの個数のテスト
function testGenerateMachi(num){
    let result_list = [];
    for(let i = 0; i < num; i++){
        let machi = generateMachiList(generateTehai()).length;
        result_list.push(machi);
    }

    return result_list;
}

//指定した待ちの個数が出るまで試行するテスト
function testMakeAppearMachi(num){
    while(true){
        btn_next_click();
        if(machihai_list.length == num){
            break;
        }
    }
}

//指定した牌姿を設定するテスト関数
function testSetHaishi(haishi){
    //長さが13の文字列のみ受け付ける
    if(haishi.length == "13" && typeof(haishi) == "string"){
        //手牌のリストのひな形を生成
        let result_list = ScriptCore.createCountHaisBase();
        for(let i = 0; i < haishi.length; i++){
            let num = Number(haishi[i]);
            if(num >= 1 && num <= 9){
                result_list[0][num - 1]++;
            }
            //数字の1から9以外の場合除外
            else{
                return;
            }
        }

        //同じ数字が4つ以上あった場合は除外
        for(let i = 0; i < result_list[0].length; i++){
            if(result_list[0][i] > 4){
                return;
            }
        }

        tehai_count = ScriptCore.copyArray(result_list);

        //待ち牌選択用テーブルをリセット
        btn_clear_click();
        normalMaxHaiCell();
        removeTehaiMarker();

        //待ちのリストをリセット
        machihai_list.length = 0;

        //待ちのリストを生成
        machihai_list = generateMachiList(tehai_count);

        //4枚使われている牌のリスト
        maxhai_list = generateMaxHaiList(tehai_count);

        //手牌の画像を画面に挿入
        insertTehaiImage(display_haishu);
        //4枚使用されている牌のセルの画像を薄くする
        thinMaxHaiCell();
        //実際の解答をモーダルに表示
        viewTrueAnswerOnModal();

        //字牌の刻子を0個にする
        let radio_jihai_0 = document.getElementById('radio_jihai_0');
        radio_jihai_0.checked = true;
    }
}

//受け入れ枚数が0枚の手牌を生成
function testGenerateNonMachitehai(){
    let tehai_count_test = generateTehai();
    let machihai_list_test = generateMachiList(tehai_count_test);
    let maxhai_list_test = generateMaxHaiList(tehai_count_test);
    while(machihai_list_test.filter(i => maxhai_list_test.indexOf(i) == -1).length != 0){
        tehai_count_test = generateTehai();
        machihai_list_test = generateMachiList(tehai_count_test);
        maxhai_list_test = generateMaxHaiList(tehai_count_test);
    }

    let tehai_str = "";
    for(let i = 0; i < tehai_count_test[0].length; i++){
        for(let j = 0; j < tehai_count_test[0][i]; j++){
                tehai_str += (i + 1).toString();
        }
    }

    return tehai_str;
}

//待ち牌計算にかかる時間を測定
function testMeasureCalcMachihai(){
    let tehai_count_test = generateTehai();
    //時間の計測を開始
    const startTime = performance.now();
    generateMachiList(tehai_count_test);
    const endTime = performance.now();

    return endTime - startTime;
}