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

//手牌
let tehai_count = generateTehai();
//待ちのリスト
let machihai_list = generateMachiList(tehai_count);
//待ちが0枚だった場合は再生成
while(machihai_list.length == 0){
    tehai_count = generateTehai();
    machihai_list = generateMachiList(tehai_count);    
}
//4枚使われている牌のリスト
let maxhai_list = generateMaxHaiList(tehai_count);

//テーブルの選択フラグ
let select_flgs = new Array(9).fill(false);

//ダイヤログ用のオブジェクト
let modal_answer = document.getElementById('modal_answer');
let modal_answer_body = document.getElementById('modal_answer_body');

//待ち牌選択用テーブルを生成
let tbl = document.createElement('table');
let tblBody = document.createElement('tbody');
tbl.id = "select_table";
for(let i = 0; i < 3; i++){
    let row = document.createElement('tr');
    for(let j = 0; j < 3; j++){
        let cell = document.createElement('td');
        cell.className = "select_cell";
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
    });
}

//手牌を画面に表示
displayTehai();
//待ち牌洗濯用のテーブルに画像を挿入(初期状態は萬子)
insertImgSelectTable(Hai_Type.manzu);
//4枚使用されている牌のセルの画像を薄くする
thinMaxHaiCell();

//手牌を画面に表示
function displayTehai(){
    for(i = 0; i < tehai_count[0].length; i++){
        for(let j = 0; j < tehai_count[0][i]; j++){
            let div_element = document.createElement('div');
            let img_element = document.createElement('img');
            div_element.className = "tehai_part";
            img_element.src = ScriptCore.generate_pai_src(i + 1);
            div_element.appendChild(img_element);
            document.getElementById('tehai').appendChild(div_element);
        }
    }
}
//手牌を画面から消去
function deleteTehai(){
    let tehai_div = document.getElementById('tehai');
    while(tehai_div.lastChild){
        tehai_div.removeChild(tehai_div.lastChild);
    }
}

//待ち牌選択用のテーブルに画像を挿入
function insertImgSelectTable(hai_type){
    for(let i = 0; i < select_cells.length; i++){
        let cellimg = document.createElement('img');
        cellimg.src = ScriptCore.generate_pai_src(hai_type * 9 + i + 1);
        select_cells[i].appendChild(cellimg);
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
    //待ちの候補を取得する
    ScriptCore.createTenpaiHaiBlocksRecursive(tehai_list, 0, 0, 0, 0, result_list);
    //4枚使われている牌は待ちから除外
    for(let i = 0; i < result_list.length; i++){
        if(tehai_list[0][result_list[i] - 1] >= 4){
            let hai_index = result_list.indexOf(result_list[i]);
            result_list.splice(hai_index, 1);
        }
    }
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

//クリアボタンが押された時
function btn_clear_click(){
    for(let i = 0; i < select_cells.length; i++){
        let cell = select_cells[i];
        if(select_flgs[i]){
            transparentCellImg(cell);
            select_flgs[i] = false;
        }
    }
}
//解答ボタンが表示された時
function btn_answer_click(){
    //実際の解答をモーダルに表示
    let true_answer_p = document.createElement('p');
    true_answer_p.innerText = "実際の解答";
    let true_answer_div = document.createElement('div');
    true_answer_div.style.display = "flex";
    for(let i = 0; i < machihai_list.length; i++){
        let div_element = document.createElement('div');
        let img_element = document.createElement('img');
        img_element.src = ScriptCore.generate_pai_src(machihai_list[i]);
        div_element.appendChild(img_element);
        true_answer_div.appendChild(div_element);
    }
    modal_answer_body.appendChild(true_answer_p);
    modal_answer_body.appendChild(true_answer_div);
    //ユーザの解答をモーダルに表示
    let user_answer_p = document.createElement('p');
    user_answer_p.innerText = "あなたの回答";
    let user_answer_div = document.createElement('div');
    user_answer_div.style.display = "flex";
    for(let i = 0; i < select_flgs.length; i++){
        if(select_flgs[i]){
            let div_element = document.createElement('div');
            let img_element = document.createElement('img');
            img_element.src = ScriptCore.generate_pai_src(i + 1);
            div_element.appendChild(img_element);
            user_answer_div.appendChild(div_element);
        }
    }
    modal_answer_body.appendChild(user_answer_p);
    modal_answer_body.appendChild(user_answer_div);

    //モーダルを表示
    modal_answer.style.display = "block";
}
//次の問題ボタンが押された時
function btn_next_click(){
    //手牌を消去する
    deleteTehai();
    //待ち牌選択用テーブルをリセット
    btn_clear_click();
    normalMaxHaiCell();

    //待ちのリストをリセット
    machihai_list.length = 0;

    //新しい手牌と待ちを再度生成
    while(machihai_list.length == 0){
        //手牌
        tehai_count = generateTehai();
        //待ちのリスト
        machihai_list = generateMachiList(tehai_count);
    }
    //4枚使われている牌のリスト
    maxhai_list = generateMaxHaiList(tehai_count);

    //手牌を画面に表示
    displayTehai();
    //4枚使用されている牌のセルの画像を薄くする
    thinMaxHaiCell();
}

//イベント登録（解答用ダイヤログの閉じるボタン）
let modal_answer_close = document.getElementById('modal_answer_close');
modal_answer_close.addEventListener("click", (event) =>{
    modalAnswerClose();
});
//モーダルコンテンツ以外がクリックされた時のイベントをそれぞれのダイヤログに登録
addEventListener("click", (event) =>{
    //ノーテン時
    if(event.target == modal_answer){
        modalAnswerClose();
    }
});
//解答用ダイヤログが閉じたときの処理
function modalAnswerClose(){
    while(modal_answer_body.firstChild){
        modal_answer_body.removeChild(modal_answer_body.firstChild);
    }
    modal_answer.style.display = "none";
}

//キーボードを押したときのイベント
document.onkeydown = (event) =>{
    //数値キーが押された時、その数値に値する牌を押下したこととして扱う
    if(event.key >= 1 && event.key <= 9){
        //モーダルが開いているときは処理を行わない
        if(modal_answer.style.display != "block"){
            select_cells[Number(event.key) - 1].click();
        }
    }
    //エスケープキーが押された時
    else if(event.key === "Escape"){
        //モーダルが開いているときはそれを閉じる
        if(modal_answer.style.display == "block"){
            modalAnswerClose();
        }
        //通常時は選択した牌をクリア
        else{
            btn_clear_click();
        }
    }
    //スペースキーが押された時、解答を表示
    else if(event.key === " "){
        //モーダルが開いているときは処理を行わない
        if(modal_answer.style.display != "block"){
            btn_answer_click();
        }
    }
    //エンターキーが押された時、次の問題へ
    else if(event.key === "Enter"){
        //モーダルが開いているときは処理を行わない
        if(modal_answer.style.display != "block"){
            btn_next_click();
        }
    }
}

//生成される待ちの個数のテスト
function testGenerateMachi(num){
    let result_list = [];
    for(let i = 0; i < num; i++){
        let machi = 0
        while(machi == 0){
            machi = generateMachiList(generateTehai()).length;
        }
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