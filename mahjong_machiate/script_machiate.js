//待ちの形
const Machi_Type = {
    tanki : 0,
    ryanmen : 1,
    shanpon : 2,
    kanchan : 3,
    penchan : 4
}

//手牌
let tehai_count = ScriptCore.createCountHaisBase();
//待ちのリスト
let machihai_list = [];

generateTehai();
generateMachiList();
displayTehai();

//test
function test(){
    
}

//手牌を画面に表示
function displayTehai(){
    for(i = 0; i < tehai_count[0].length; i++){
        for(let j = 0; j < tehai_count[0][i]; j++){
            let div_element = document.createElement('div');
            let img_element = document.createElement('img');
            div_element.className = "tehai_parts";
            img_element.src = ScriptCore.generate_pai_src(i + 1);
            div_element.appendChild(img_element);
            document.getElementById("tehai").appendChild(div_element);
        }
    }
}

//手牌の生成
function generateTehai(){
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
                if(tehai_count[0][shuntsu_first - 1] < 4 && tehai_count[0][shuntsu_first] < 4 && tehai_count[0][shuntsu_first + 1] < 4){
                    tehai_count[0][shuntsu_first - 1]++;
                    tehai_count[0][shuntsu_first]++;
                    tehai_count[0][shuntsu_first + 1]++;
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
                if(tehai_count[0][kotsu_first - 1] < 2){
                    tehai_count[0][kotsu_first - 1] += 3;
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
            if(tehai_count[0][janto_rand - 1] < 4){
                tehai_count[0][janto_rand - 1]++;
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
            if(tehai_count[0][janto_rand - 1] < 3){
                tehai_count[0][janto_rand - 1] += 2;
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
            if(tehai_count[0][janto_rand - 1] < 3){
                tehai_count[0][janto_rand - 1] += 2;
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
            if(tehai_count[0][kanchan_rand - 1] < 4 && tehai_count[0][kanchan_rand + 1] < 4){
                tehai_count[0][kanchan_rand - 1]++;
                tehai_count[0][kanchan_rand + 1]++;
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
                if(tehai_count[0][0] < 4 && tehai_count[0][1] < 4){
                    tehai_count[0][0]++;
                    tehai_count[0][1]++;
                    break;
                }
                else{
                    continue;
                }
            }
            //2の場合
            else{
                //牌が4つ以上使われていたら再度違う塔子を生成する
                if(tehai_count[0][7] < 4 && tehai_count[0][8] < 4){
                    tehai_count[0][7]++;
                    tehai_count[0][8]++;
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
            if(tehai_count[0][ryanmen_rand] < 4 && tehai_count[0][ryanmen_rand + 1] < 4){
                tehai_count[0][ryanmen_rand]++;
                tehai_count[0][ryanmen_rand + 1]++;
                break;
            }
            else{
                continue;
            }
        }        
    }
}

//待ち牌のリストの生成
function generateMachiList(){
    //待ちの候補を取得する
    ScriptCore.createTenpaiHaiBlocksRecursive(tehai_count, 0, 0, 0, 0, machihai_list);
    //4枚使われている牌は待ちから除外
    for(let i = 0; i < machihai_list.length; i++){
        if(tehai_count[0][machihai_list[i] - 1] >= 4){
            let hai_index = machihai_list.indexOf(machihai_list[i]);
            machihai_list.splice(hai_index, 1);
        }
    }
    //ソートする
    machihai_list.sort();
}


