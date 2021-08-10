const fs = require("fs");
const hodgepodge = JSON.parse(
  fs.readFileSync("./data/hodgepodge/hodgepodge.json")
);
const freqdict = JSON.parse(
  fs.readFileSync("./data/vocabulary/frequency_dictionary.json")
);
const v = require("./data_creation/vocabulary/create_kanji_vocabulary");

const kanjiVocabularyList = v.buildVocabularyList(hodgepodge, freqdict);

for (let i = 0; i < hodgepodge.length; i++) {
  hodgepodge[i].vocabulary = kanjiVocabularyList[i];
}
fs.writeFileSync("hodgepodge_with_vocab.json", JSON.stringify(hodgepodge));
