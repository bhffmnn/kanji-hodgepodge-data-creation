const kanaUtil = require("../../util/kana_util");

const createKanjiVocabularyList = {
  buildVocabularyList: function (hodgepodge, frequencyDictionary) {
    const allKanjiVocabulary = [];
    for (const h of hodgepodge) {
      let filteredVocab = frequencyDictionary.filter((entry) => {
        return entry.orthForms.find((orthForm) => {
          return orthForm.frequency != 0 && orthForm.value.includes(h.literal);
        });
      });
      let kanjiVocab = [];
      for (const entry of filteredVocab) {
        for (const orthForm of entry.orthForms) {
          if (orthForm.frequency != 0 && orthForm.value.includes(h.literal)) {
            // Split entries into orthForm - reading pairs
            for (const reading of entry.readings) {
              if (
                !reading.noTrueReading &&
                (reading.restrictions.length === 0 ||
                  reading.restrictions.includes(orthForm))
              ) {
                const newEntry = new Object();
                newEntry.form = orthForm.value;
                newEntry.reading = reading;
                newEntry.infos = orthForm.infos;
                newEntry.frequency = orthForm.frequency;
                newEntry.otherForms = [];
                for (const o of entry.orthForms) {
                  if (
                    o.value != orthForm.value &&
                    (reading.restrictions.length === 0 ||
                      reading.restrictions.includes(orthForm))
                  ) {
                    newEntry.otherForms.push(o);
                  }
                }
                newEntry.meanings = [];
                for (const m of entry.meanings) {
                  if (
                    m.kanjiRestrictions.length === 0 ||
                    m.kanjiRestrictions.includes(orthForm)
                  ) {
                    if (
                      m.readingRestrictions.length === 0 ||
                      m.readingRestrictions.includes(reading)
                    ) {
                      newEntry.meanings.push(m);
                    }
                  }
                }
                kanjiVocab.push(newEntry);
              }
            }
          }
        }
      }
      kanjiVocab = kanjiVocab.sort((a, b) => {
        return b.frequency - a.frequency;
      });
      for (const reading of h.readingsOn.concat(h.readingsKun)) {
        for (const vocab of kanjiVocab) {
          if (
            isVocWithKanjiInReading(
              vocab,
              h.literal,
              kanaUtil.hiraganaToKatakana(reading.value)
            )
          ) {
            vocab.kanjiReading = reading.value;
          }
        }
      }
      allKanjiVocabulary.push(kanjiVocab);
    }
    return allKanjiVocabulary;

    function isVocWithKanjiInReading(vocab, kanjiLiteral, katakanaReading) {
      // This is meant to prevent さ replacing さく etc.
      if (
        !vocab.kanjiReading ||
        !kanaUtil
          .hiraganaToKatakana(vocab.kanjiReading)
          .includes(katakanaReading)
      ) {
        let isInReading = false;
        let startsWith = false;
        let endsWith = false;
        let contains = false;
        let readingRegex = "";
        if (vocab.form.startsWith(kanjiLiteral)) {
          startsWith = true;
          readingRegex = readingRegexStart(katakanaReading);
        } else if (vocab.form.endsWith(kanjiLiteral)) {
          endsWith = true;
          readingRegex = readingRegexEnd(katakanaReading);
        }
        // Not in use because of false positives
        /* 
                if (o.includes(kanjiLiteral)) {
                    contains = true;
                    readingRegex = readingRegexMid(katakanaReading);
                    break;
                }*/
        if (startsWith) {
          const katakanaR = kanaUtil.hiraganaToKatakana(vocab.reading.value);
          if (katakanaR.match(readingRegex)) {
            isInReading = true;
          }
        } else if (endsWith) {
          const katakanaR = kanaUtil.hiraganaToKatakana(vocab.reading.value);
          if (katakanaR.match(readingRegex)) {
            isInReading = true;
          }
        }
        //  Not in use because of false positives. Doing it more securely would probably be very complicated
        else if (contains) {
          const katakanaR = kanaUtil.hiraganaToKatakana(vocab.reading.value);
          if (katakanaR.match(readingRegex)) {
            isInReading = true;
          }
        }
        return isInReading;
      } else return false;
      function readingRegexStart(reading) {
        let isVerb = false;
        if (reading.includes(".")) isVerb = true;
        str = reading.replace(".", "");
        let regexStr = "";
        for (let i = 0; i < str.length; i++) {
          if (i === 0) {
            regexStr += "^" + str[i];
          }
          // Nominalization
          else if (i === str.length - 1) {
            if (isVerb) {
              regexStr += "[" + str[i] + kanaUtil.uToI(str[i], 0) + "]";
              // TODO: This could be done more securely by checking pos for ichidan verbs
              if (
                str[i - 1].match(
                  /[いきぎじちにびみりえけげせぜてでねへべめれ]/g
                )
              ) {
                regexStr += "?";
              }
            }
            // Sokuon tsu
            else if (["チ", "ク", "ツ"].includes(str[i])) {
              regexStr += "[" + str[i] + "ッ" + "]";
            } else {
              regexStr += str[i];
            }
          } else {
            regexStr += str[i];
          }
        }
        return new RegExp(regexStr);
      }
      // This function isn't in use right now
      function readingRegexMid(reading) {
        let isVerb = false;
        if (reading.includes(".")) isVerb = true;
        str = reading.replace(".", "");
        let regexStr = "";
        for (let i = 0; i < str.length; i++) {
          if (i === 0) {
            // Sokuon h -> p / rendaku
            regexStr +=
              "[" +
              str[i] +
              kanaUtil.addDakuten(str[i]) +
              kanaUtil.addHandakuten(str[i]) +
              "]";
          } else if (i === str.length - 1) {
            if (isVerb) {
              // Nominalization
              regexStr += "[" + str[i] + kanaUtil.uToI(str[i], 0) + "]";
              // TODO: This could be done more securely by checking pos for ichidan verbs
              if (
                str[i - 1].match(
                  /[いきぎじちにびみりえけげせぜてでねへべめれ]/g
                )
              ) {
                regexStr += "?";
              }
            }
            // Sokuon tsu
            else if (["チ", "ク", "ツ"].includes(str[i])) {
              regexStr += "[" + str[i] + "ッ" + "]";
            } else {
              regexStr += str[i];
            }
          } else {
            regexStr += str[i];
          }
        }
        return new RegExp(regexStr);
      }
      function readingRegexEnd(reading) {
        let isVerb = false;
        if (reading.includes(".")) isVerb = true;
        str = reading.replace(".", "");
        let regexStr = "";
        for (let i = 0; i < str.length; i++) {
          // Sokuon h -> p / rendaku
          if (i === 0) {
            regexStr +=
              "[" +
              str[i] +
              kanaUtil.addDakuten(str[i]) +
              kanaUtil.addHandakuten(str[i]) +
              "]";
          }
          // Nominalization
          else if (i === str.length - 1) {
            if (isVerb) {
              regexStr += "[" + str[i] + kanaUtil.uToI(str[i], 0) + "]" + "$";
              // TODO: This could be done more securely by checking pos for ichidan verbs
              if (
                str[i - 1].match(
                  /[いきぎじちにびみりえけげせぜてでねへべめれ]/g
                )
              ) {
                regexStr += "?";
              }
            } else {
              regexStr += str[i] + "$";
            }
          } else {
            regexStr += str[i];
          }
        }
        return new RegExp(regexStr);
      }
    }
  },
};
module.exports = createKanjiVocabularyList;
