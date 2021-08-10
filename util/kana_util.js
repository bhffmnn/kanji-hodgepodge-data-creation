const hiragana = [
  "ぁ",
  "あ",
  "ぃ",
  "い",
  "ぅ",
  "う",
  "ぇ",
  "え",
  "ぉ",
  "お",
  "か",
  "が",
  "き",
  "ぎ",
  "く",
  "ぐ",
  "け",
  "げ",
  "こ",
  "ご",
  "さ",
  "ざ",
  "し",
  "じ",
  "す",
  "ず",
  "せ",
  "ぜ",
  "そ",
  "ぞ",
  "た",
  "だ",
  "ち",
  "ぢ",
  "っ",
  "つ",
  "づ",
  "て",
  "で",
  "と",
  "ど",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ば",
  "ぱ",
  "ひ",
  "び",
  "ぴ",
  "ふ",
  "ぶ",
  "ぷ",
  "へ",
  "べ",
  "ぺ",
  "ほ",
  "ぼ",
  "ぽ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "ゃ",
  "や",
  "ゅ",
  "ゆ",
  "ょ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "ゎ",
  "わ",
  "ゐ",
  "ゑ",
  "を",
  "ん",
  "ゔ",
  "ゕ",
  "ゖ",
  "ゝ",
  "ゞ",
];
const katakana = [
  "ァ",
  "ア",
  "ィ",
  "イ",
  "ゥ",
  "ウ",
  "ェ",
  "エ",
  "ォ",
  "オ",
  "カ",
  "ガ",
  "キ",
  "ギ",
  "ク",
  "グ",
  "ケ",
  "ゲ",
  "コ",
  "ゴ",
  "サ",
  "ザ",
  "シ",
  "ジ",
  "ス",
  "ズ",
  "セ",
  "ゼ",
  "ソ",
  "ゾ",
  "タ",
  "ダ",
  "チ",
  "ヂ",
  "ッ",
  "ツ",
  "ヅ",
  "テ",
  "デ",
  "ト",
  "ド",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ",
  "ハ",
  "バ",
  "パ",
  "ヒ",
  "ビ",
  "ピ",
  "フ",
  "ブ",
  "プ",
  "ヘ",
  "ベ",
  "ペ",
  "ホ",
  "ボ",
  "ポ",
  "マ",
  "ミ",
  "ム",
  "メ",
  "モ",
  "ャ",
  "ヤ",
  "ュ",
  "ユ",
  "ョ",
  "ヨ",
  "ラ",
  "リ",
  "ル",
  "レ",
  "ロ",
  "ヮ",
  "ワ",
  "ヰ",
  "ヱ",
  "ヲ",
  "ン",
  "ヴ",
  "ヵ",
  "ヶ",
  "ヽ",
  "ヾ",
];

const uiPairs = [
  "う",
  "い",
  "く",
  "き",
  "ぐ",
  "ぎ",
  "す",
  "し",
  "ず",
  "じ",
  "つ",
  "ち",
  "づ",
  "ぢ",
  "ぬ",
  "に",
  "ふ",
  "ひ",
  "ぶ",
  "び",
  "ぷ",
  "ぴ",
  "む",
  "み",
  "る",
  "り",
  "ウ",
  "イ",
  "ク",
  "キ",
  "グ",
  "ギ",
  "ス",
  "シ",
  "ズ",
  "ジ",
  "ツ",
  "チ",
  "ヅ",
  "ヂ",
  "ヌ",
  "ニ",
  "フ",
  "ヒ",
  "ブ",
  "ビ",
  "プ",
  "ピ",
  "ム",
  "ミ",
  "ル",
  "リ",
];

const dakuten = [
  "か",
  "が",
  "き",
  "ぎ",
  "く",
  "ぐ",
  "け",
  "げ",
  "こ",
  "ご",
  "さ",
  "ざ",
  "し",
  "じ",
  "す",
  "ず",
  "せ",
  "ぜ",
  "そ",
  "ぞ",
  "た",
  "だ",
  "ち",
  "ぢ",
  "つ",
  "づ",
  "て",
  "で",
  "と",
  "ど",
  "は",
  "ば",
  "ひ",
  "び",
  "ふ",
  "ぶ",
  "へ",
  "べ",
  "ほ",
  "ぼ",
  "ゝ",
  "ゞ",
  "う",
  "ゔ",
  "カ",
  "ガ",
  "キ",
  "ギ",
  "ク",
  "グ",
  "ケ",
  "ゲ",
  "コ",
  "ゴ",
  "サ",
  "ザ",
  "シ",
  "ジ",
  "ス",
  "ズ",
  "セ",
  "ゼ",
  "ソ",
  "ゾ",
  "タ",
  "ダ",
  "チ",
  "ヂ",
  "ツ",
  "ヅ",
  "テ",
  "デ",
  "ト",
  "ド",
  "ハ",
  "バ",
  "ヒ",
  "ビ",
  "フ",
  "ブ",
  "ヘ",
  "ベ",
  "ホ",
  "ボ",
  "ヽ",
  "ヾ",
  "ウ",
  "ヴ",
];
const handakuten = [
  "は",
  "ぱ",
  "ひ",
  "ぴ",
  "ふ",
  "ぷ",
  "へ",
  "ぺ",
  "ほ",
  "ぽ",
  "ハ",
  "パ",
  "ヒ",
  "ピ",
  "フ",
  "プ",
  "ヘ",
  "ペ",
  "ホ",
  "ポ",
];

var kanaUtils = {
  addDakuten: function (str) {
    const charArray = Array.from(str);
    let newStr = "";
    for (let c of charArray) {
      let indexOf = dakuten.indexOf(c);
      if (indexOf % 2 === 0) {
        newStr += dakuten[indexOf + 1];
      } else {
        newStr += c;
      }
    }
    return newStr;
  },
  addHandakuten: function (str) {
    const charArray = Array.from(str);
    let newStr = "";
    for (let c of charArray) {
      let indexOf = handakuten.indexOf(c);
      if (indexOf % 2 === 0) {
        newStr += handakuten[indexOf + 1];
      } else {
        newStr += c;
      }
    }
    return newStr;
  },
  kanaEquals: function (str1, str2) {
    hiraganaStr1 = this.katakanaToHiragana(str1);
    hiraganaStr2 = this.katakanaToHiragana(str2);
    return hiraganaStr1 === hiraganaStr2;
  },
  katakanaToHiragana: function (str) {
    let newStr = str;
    for (let i = 0; i < str.length; i++) {
      let kanaIndex = katakana.indexOf(str[i]);
      if (kanaIndex + 1) {
        newStr =
          newStr.substring(0, i) +
          hiragana[kanaIndex] +
          newStr.substring(i + 1);
      }
    }
    return newStr;
  },
  hiraganaToKatakana: function (str) {
    let newStr = str;
    for (let i = 0; i < str.length; i++) {
      let kanaIndex = hiragana.indexOf(str[i]);
      if (kanaIndex + 1) {
        newStr =
          newStr.substring(0, i) +
          katakana[kanaIndex] +
          newStr.substring(i + 1);
      }
    }
    return newStr;
  },
  isHiragana: function (str) {
    if (!str || typeof str != "string") return false;
    for (c of str) {
      if (!hiragana.includes(c)) {
        return false;
      }
    }
    return true;
  },
  isKatakana: function (str) {
    if (!str || typeof str != "string") return false;
    for (c of str) {
      if (!katakana.includes(c)) {
        return false;
      }
    }
    return true;
  },
  shrinkTsu: function (str, index) {
    let newStr = str;
    if (str[index] === "つ") {
      newStr = newStr.substring(0, index) + "っ" + newStr.substring(index + 1);
    }
    return newStr;
  },
  uToI: function (str, index) {
    const charArray = Array.from(str);
    let newStr = "";
    let indexOf = uiPairs.indexOf(charArray[index]);
    if (indexOf % 2 === 0) {
      charArray[index] = uiPairs[indexOf + 1];
    }
    for (let c of charArray) {
      newStr += c;
    }
    return newStr;
  },
};
module.exports = kanaUtils;
