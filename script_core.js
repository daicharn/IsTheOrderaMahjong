//手配の数
const TEHAI_NUMBER = 14;
//牌の種類数
const PAI_TYPE_NUM = 34;

//牌を数値として定義
const BACK = 100;
const MANZU = [1,2,3,4,5,6,7,8,9];
const PINZU = [10,11,12,13,14,15,16,17,18];
const SOUZU = [19,20,21,22,23,24,25,26,27];
const JIHAI = [28,29,30,31,32,33,34];

//クラスとして各種関数を定義
class ScriptCore{
    //数値から牌の画像のパスを生成
    static generate_pai_src(num){
        let pai_src = "../images/";
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
        if(num % 9 != 0){
            pai_src += (num % 9).toString() + ".png";
        }
        else{
            pai_src += "9.png";
        }

        return pai_src;
    }

    //牌のカウント配列のベースを生成
    static createCountHaisBase(){
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

    //通常の配列のコピーを生成する
    static copyArray(array){
        let new_array = new Array(array.length);
        for(let i = 0; i < array.length; i++){
            new_array[i] = array[i].slice();
        }
        return new_array;
    }

    //残っている牌を探して一覧をリストとして返す
    static searchNokoriHai(haisCount){
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

    //再帰的に手牌から待ち牌を探す処理
    static createMachihaiListRecursive(hais_count, mentsu_count, taatsu_count, toitsu_count, naki_count, machi_list){
        for(let i = 0; i < PAI_TYPE_NUM; i++){
            let haishu = Math.floor(i / 9);
            let count = hais_count[haishu][i % 9];
            //雀頭、対子の処理（対子1以上かつ面子3以上　または　面子0かつ塔子0の時のみ対子を抜き出す）
            if(count >= 2 && ((toitsu_count > 0 && mentsu_count + naki_count >= 3) || (mentsu_count == 0 && taatsu_count == 0))){
                let copied_hais = this.copyArray(hais_count);
                //面子が3枚で対子が2枚のシャンポン待ちの待ち牌をリストに追加
                if(mentsu_count + naki_count >= 3 && toitsu_count >= 1){
                    let nokoriHais = this.searchNokoriHai(copied_hais);
                    for(let j = 0; j < nokoriHais.length; j++){
                        if(!machi_list.includes(nokoriHais[j])){
                            machi_list.push(nokoriHais[j]);
                        }
                    }
                }
                copied_hais[haishu][i % 9] -= 2;
                //再帰呼び出し
                this.createMachihaiListRecursive(copied_hais, mentsu_count, taatsu_count, toitsu_count + 1, naki_count, machi_list);
            }
            //刻子の処理
            if(count >= 3){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9] -= 3;
                //面子が4枚で単騎待ちの時の待ち牌をリストに追加
                if(mentsu_count + naki_count >= 3){
                    let nokoriHais = this.searchNokoriHai(copied_hais);
                    for(let j = 0; j < nokoriHais.length; j++){
                        if(!machi_list.includes(nokoriHais[j])){
                            machi_list.push(nokoriHais[j]);
                        }
                    }
                }
                //再帰呼び出し
                this.createMachihaiListRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count, naki_count, machi_list)
            }
            //字牌なら対子、刻子の処理のみで終了させる
            if(i + 1 >= JIHAI[0] && i + 1 <= JIHAI[6]){
                continue;
            }
            //順子（面子）の処理
            if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 1]--;
                copied_hais[haishu][i % 9 + 2]--;
                //面子が4枚で単騎待ちの時の待ち牌をリストに追加
                if(mentsu_count + naki_count >= 3){
                    let nokoriHais = this.searchNokoriHai(copied_hais);
                    for(let j = 0; j < nokoriHais.length; j++){
                        if(!machi_list.includes(nokoriHais[j])){
                            machi_list.push(nokoriHais[j]);
                        }
                    }
                }
                //再帰呼び出し
                this.createMachihaiListRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count, naki_count, machi_list);
            }
            //カンチャン（塔子）の処理
            if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 2] >= 1 && mentsu_count + naki_count >= 3){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 2]--;
                //面子が4枚でカンチャン待ちの時の待ち牌をリストに追加
                if(mentsu_count + naki_count >= 3 && toitsu_count >= 1){
                    let kanchanHai = (haishu * 9) + (i % 9 + 1);
                    if(!machi_list.includes(kanchanHai + 1)){
                        machi_list.push(kanchanHai + 1);
                    }
                }
                //再帰呼び出し
                this.createMachihaiListRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count, naki_count, machi_list);
            }
            //ペンチャン、両面の処理
            if(i % 9 < 8 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && mentsu_count + naki_count >= 3){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 1]--;
                //面子が4枚でペンチャンまたは両面待ちの時の待ち牌をリストに追加
                if(mentsu_count + naki_count >= 3 && toitsu_count >= 1){
                    let leftHai = (haishu * 9) + (i % 9);
                    let rightHai = (haishu * 9) + (i % 9 + 1);
                    //両面待ちの場合
                    if(leftHai % 9 != 0 && rightHai % 9 != 8){
                        if(!machi_list.includes(leftHai)){
                            machi_list.push(leftHai);
                        }
                        if(!machi_list.includes(rightHai + 2)){
                            machi_list.push(rightHai + 2);
                        }
                    }
                    //1,2のペンチャンの場合
                    else if(leftHai % 9 == 0){
                        if(!machi_list.includes(rightHai + 2)){
                            machi_list.push(rightHai + 2);
                        }                    
                    }
                    //8,9のペンチャンの場合
                    else if(rightHai % 9 == 8){
                        if(!machi_list.includes(leftHai)){
                            machi_list.push(leftHai);
                        }                    
                    }
                }
                //再帰呼び出し
                this.createMachihaiListRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count, naki_count, machi_list);
            }           
        }
    }

    //再帰的に手牌をブロックとして分割（聴牌判定時のみ使用）
    static createTenpaiHaiBlocksRecursive(hais_count, mentsu_count, taatsu_count, toitsu_count, naki_count){
        let result_list = [];
        for(let i = 0; i < PAI_TYPE_NUM; i++){
            let haishu = Math.floor(i / 9);
            let count = hais_count[haishu][i % 9];
            //雀頭、対子の処理（対子1以上かつ面子3以上　または　面子0かつ塔子0の時のみ対子を抜き出す）
            if(count >= 2 && ((toitsu_count > 0 && mentsu_count + naki_count >= 3) || (mentsu_count == 0 && taatsu_count == 0))){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9] -= 2;
                //再帰呼び出し
                result_list = result_list.concat(this.createTenpaiHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count, toitsu_count + 1, naki_count));
            }
            //刻子の処理
            if(count >= 3){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9] -= 3;
                //再帰呼び出し
                result_list = result_list.concat(this.createTenpaiHaiBlocksRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count, naki_count))
            }
            //字牌なら対子、刻子の処理のみで終了させる
            if(i + 1 >= JIHAI[0] && i + 1 <= JIHAI[6]){
                continue;
            }
            //順子（面子）の処理
            if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 1]--;
                copied_hais[haishu][i % 9 + 2]--;
                //再帰呼び出し
                result_list = result_list.concat(this.createTenpaiHaiBlocksRecursive(copied_hais, mentsu_count + 1, taatsu_count, toitsu_count, naki_count));
            }
            //カンチャン（塔子）の処理
            if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 2]--;
                //再帰呼び出し
                result_list = result_list.concat(this.createTenpaiHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count, naki_count));
            }
            //ペンチャン、両面の処理
            if(i % 9 < 8 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 1]--;
                //再帰呼び出し
                result_list = result_list.concat(this.createTenpaiHaiBlocksRecursive(copied_hais, mentsu_count, taatsu_count + 1, toitsu_count, naki_count));
            }           
        }
        //分解が終了したら結果を記憶する
        if(mentsu_count + taatsu_count + toitsu_count > 0){
            result_list.push([mentsu_count, taatsu_count, toitsu_count]);
        }

        return result_list;
    }

    //再帰的にアガリ牌をブロックに分割して返す
    static createAgariHaiBlocksRecursive(hais_count, mentsu_count, toitsu_count, naki_count, tehai_list){
        let result_list = [];
        for(let i = 0; i < PAI_TYPE_NUM; i++){
            let haishu = Math.floor(i / 9);
            let count = hais_count[haishu][i % 9];
            //雀頭、対子の処理（面子0の時のみ対子を抜き出す）
            if(count >= 2 && mentsu_count == 0){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9] -= 2;
                let tehai_list_new = this.copyArray(tehai_list);
                tehai_list_new.push([i + 1, i + 1]);
                //再帰呼び出し
                result_list = result_list.concat(this.createAgariHaiBlocksRecursive(copied_hais, mentsu_count, toitsu_count + 1, naki_count, tehai_list_new));
            }
            //刻子の処理
            if(count >= 3){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9] -= 3;
                let tehai_list_new = this.copyArray(tehai_list);
                tehai_list_new.push([i + 1, i + 1, i + 1]);
                //再帰呼び出し
                result_list = result_list.concat(this.createAgariHaiBlocksRecursive(copied_hais, mentsu_count + 1, toitsu_count, naki_count, tehai_list_new));
            }

            //字牌なら対子、刻子の処理のみで終了させる
            if(i + 1 >= JIHAI[0] && i + 1 <= JIHAI[6]){
                continue;
            }

            //順子（面子）の処理
            if(i % 9 < 7 && count >= 1 && hais_count[haishu][i % 9 + 1] >= 1 && hais_count[haishu][i % 9 + 2] >= 1){
                let copied_hais = this.copyArray(hais_count);
                copied_hais[haishu][i % 9]--;
                copied_hais[haishu][i % 9 + 1]--;
                copied_hais[haishu][i % 9 + 2]--;
                let tehai_list_new = this.copyArray(tehai_list);
                tehai_list_new.push([i + 1, i + 2, i + 3]);
                //再帰呼び出し
                result_list = result_list.concat(this.createAgariHaiBlocksRecursive(copied_hais, mentsu_count + 1, toitsu_count, naki_count, tehai_list_new));
            }
        }
        //分割完了時、4面子1雀頭または対子が7つであればリストに追加
        if((mentsu_count + naki_count == 4 && toitsu_count == 1) || toitsu_count == 7){
            result_list.push(tehai_list.sort());     
        }

        return result_list;
    }

    //七対子のシャンテン数を判定
    static calcChiitoiShanten(haisCount){
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

        return shanten;
    }

    //七対子の待ちを求める(七対子シャンテン数が0の場合を前提として使用)
    static searchChiitoiMachi(haisCount){
        for(let i = 0; i < haisCount.length; i++){
            for(let j = 0; j < haisCount[i].length; j++){
                //1枚だけ孤立している牌が待ちになる
                if(haisCount[i][j] == 1){
                    return i * 9 + j + 1;
                }
            }
        }
    }
}
