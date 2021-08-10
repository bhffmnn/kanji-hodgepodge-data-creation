const kanaUtil = require("../../util/kana_util");

const createHodgepodge = {
  buildHodgepodge: function (
    kanjidic2,
    unihan,
    joyo,
    radicals,
    wiktionaryReadings
  ) {
    const hodgepodge = [];
    // Get data from kanjidic2
    // utf16 code, literal, on readings, kun readings, nanoris, radical number, english meanings, variants, frequency, grade
    for (let kdk of kanjidic2) {
      const myKanji = new Object();
      myKanji.utf16 = kdk.literal.codePointAt(0);
      myKanji.literal = kdk.literal;
      myKanji.frequency = new Object();
      myKanji.frequency.newspaper = kdk.freq;
      myKanji.grade = kdk.grade;
      if (myKanji.grade >= 9) {
        // 9 and 10
        myKanji.type = "jinmeiyo";
      } else if (myKanji.grade > 0) {
        myKanji.type = "joyo";
      } else {
        myKanji.type = "nonJoyo";
      }
      myKanji.variants = variantsToUtf16(kdk, kanjidic2);
      for (let rad of kdk.radicals) {
        if (rad.type === "classical") {
          myKanji.radical = radicals[rad.value - 1].value;
        }
      }
      myKanji.readingsOn = [];
      for (let r of kdk.readings) {
        if (r.type === "ja_on") {
          const reading = new Object();
          reading.value = r.value;
          reading.isJoyo = false;
          myKanji.readingsOn.push(reading);
        }
      }
      myKanji.readingsKun = [];
      for (let r of kdk.readings) {
        if (r.type === "ja_kun") {
          // Remove pseudo kun readings (= on reading + suru, zuru, jiru, taru or su).
          // 俯す fusu, 差す sasu, 扠す sasu and 扨す sasu are false positives and therefore skipped.
          let isPseudo = false;
          for (let on of myKanji.readingsOn) {
            on = kanaUtil.katakanaToHiragana(on);
            // shrinkTsu() is used to account for possible soku'on (e.g. たつ + する -> たっする)
            if (
              r.value.startsWith(on + ".") ||
              r.value.startsWith(kanaUtil.shrinkTsu(on, on.length - 1) + ".")
            ) {
              if (
                r.value.endsWith(".する") ||
                r.value.endsWith(".じる") ||
                r.value.endsWith(".す") ||
                r.value.endsWith(".ずる") ||
                r.value.endsWith(".たる")
              ) {
                isPseudo = true;
                break;
              }
            }
          }
          if (!isPseudo) {
            const reading = new Object();
            reading.value = r.value;
            reading.isJoyo = false;
            myKanji.readingsKun.push(reading);
          }
        }
      }
      myKanji.nanoris = kdk.nanoris;
      myKanji.meaningsEn = [];
      for (let m of kdk.meanings) {
        if (m.m_lang === "en") {
          myKanji.meaningsEn.push(m.value);
        }
      }
      hodgepodge.push(myKanji);
    }

    // Get variant data from unihan and replace kanjidic2 variants
    // only traditional and simplified variants (for now), and only variants that were already taken from kanjidic2
    for (let mk of hodgepodge) {
      let found = false;
      for (let uk of unihan) {
        if (uk.codepoint === mk.utf16) {
          let newVariants = [];
          for (let v of uk.variants) {
            if (mk.variants.includes(v.codepoint)) {
              let isTraditionalOrSimplified = false;
              if (
                v.type === "kSimplifiedVariant" ||
                v.type === "kTraditionalVariant"
              ) {
                isTraditionalOrSimplified = true;
              }
              let isInKanjidic2 = false;
              for (let mk2 of hodgepodge) {
                if (mk2.utf16 === v.codepoint) {
                  isInKanjidic2 = true;
                  break;
                }
              }
              if (isInKanjidic2 && isTraditionalOrSimplified) {
                const variant = new Object();
                variant.literal = String.fromCodePoint(v.codepoint);
                variant.utf16 = v.codepoint;
                variant.type = v.type;
                variant.sources = v.sources;
                newVariants.push(variant);
              }
            }
          }
          mk.variants = newVariants;
          mk.strokeCount = uk.stroke_count;
          found = true;
          break;
        }
      }
    }

    // Get joyo kanji data: set joyo kanji types, joyo readings, add variants: shinjitai/kyujitai/joyo alternatives(=叱𠮟,填塡,頬頰)
    for (let jk of joyo) {
      for (let mk of hodgepodge) {
        if (jk.standardForm === mk.literal || jk.altForm === mk.literal) {
          mk.type = "joyo";
          if (jk.altForm) {
            // Either add alt variants to joyo standard forms and set joyo type
            if (mk.literal === jk.standardForm) {
              const altVariant = new Object();
              altVariant.literal = jk.altForm;
              altVariant.utf16 = jk.altForm.codePointAt(0);
              altVariant.type = "joyoAlternative";
              altVariant.sources = ["joyo"];
              mk.variants.push(altVariant);
            }
            // Or add standard variants forms joyo alt forms and set joyoAlt
            else {
              // mk.literal === jk.altForm
              const standardVariant = new Object();
              standardVariant.literal = jk.standardForm;
              standardVariant.utf16 = jk.standardForm.codePointAt(0);
              standardVariant.type = "joyoStandard";
              standardVariant.sources = ["joyo"];
              mk.variants.push(standardVariant);

              mk.type = "joyoAlt";
            }
          }
          // Add kyujitai to shinjitai
          if (jk.oldForm) {
            for (let oldForm of jk.oldForm.split(",")) {
              const oldVariant = new Object();
              oldVariant.literal = oldForm;
              oldVariant.utf16 = oldForm.codePointAt(0);
              oldVariant.type = "joyoOld";
              oldVariant.sources = ["joyo"];
              mk.variants.push(oldVariant);
            }
          }
          // Mark joyo readings
          for (let jKun of jk.readingsKun) {
            let hasReading = false;
            for (let mKun of mk.readingsKun) {
              if (jKun.value.replace("-", ".") === mKun.value) {
                mKun.isJoyo = true;
                mKun.specialUse = jKun.specialUse;
                hasReading = true;
                break;
              }
            }
            if (!hasReading) {
              let newReading = new Object();
              newReading.value = jKun.value.replace("-", ".");
              newReading.isJoyo = true;
              newReading.specialUse = jKun.specialUse;
              mk.readingsKun.push(newReading);
            }
          }
          for (let jOn of jk.readingsOn) {
            let hasReading = false;
            for (let mOn of mk.readingsOn) {
              if (jOn.value === mOn.value) {
                mOn.isJoyo = true;
                mOn.specialUse = jOn.specialUse;
                hasReading = true;
                break;
              }
            }
            if (!hasReading) {
              let newReading = new Object();
              newReading.value = jOn.value;
              newReading.isJoyo = true;
              newReading.specialUse = jOn.specialUse;
              mk.readingsOn.push(newReading);
            }
          }
        }
        // Add shinjitai to kyujitai
        if (jk.oldForm.includes(mk.literal)) {
          const newVariant = new Object();
          newVariant.literal = jk.standardForm;
          newVariant.utf16 = jk.standardForm.codePointAt(0);
          newVariant.type = "joyoNew";
          newVariant.sources = ["joyo"];
          mk.variants.push(newVariant);
        }
      }
    }

    // Get rid of duplicate/variant readings
    const delArray = [];
    for (let mk of hodgepodge) {
      const readings = Array.from(mk.readingsKun);
      const delGroup = [];
      while (readings.length > 1) {
        const r1 = readings[0];
        const delIndexes = []; // For removal after each iteration
        const duplicates = []; // Separate arrays because くさ.い　and -くさ.い aren't variants of にお.い and にお.う
        for (let i = 1; i < readings.length; i++) {
          if (areDuplicates(r1.value, readings[i].value)) {
            if (!duplicates.includes(r1.value)) {
              duplicates.push(r1.value);
            }
            duplicates.push(readings[i].value);
            delIndexes.push(i);
          }
        }
        delIndexes.push(0);
        for (let i of delIndexes) {
          readings.splice(i, 1);
        }
        if (duplicates.length !== 0) {
          // Remove the one that should NOT be deleted (example: of [ 'およ.ぶ', 'およ.び' ] the latter is what we want to get rid off at the end)
          const duplicatesCopy = Array.from(duplicates);
          while (duplicatesCopy.length > 1) {
            let deleteIndex = -1;
            // delete if contains - and has duplicate without -
            for (let r1 of duplicatesCopy) {
              if (r1.includes("-")) {
                for (let r2 of duplicatesCopy) {
                  if (!r2.includes("-")) {
                    deleteIndex = duplicatesCopy.indexOf(r1);
                    break;
                  }
                }
                break;
              }
            }
            if (deleteIndex >= 0) {
              duplicatesCopy.splice(deleteIndex, 1);
              continue;
            }
            // delete if ends on i and has duplicate not ending on i
            for (let r1 of duplicatesCopy) {
              if (
                [
                  "い",
                  "き",
                  "ぎ",
                  "し",
                  "ち",
                  "に",
                  "ひ",
                  "び",
                  "み",
                  "り",
                ].includes(r1[r1.length - 1])
              ) {
                for (let r2 of duplicatesCopy) {
                  if (
                    ![
                      "い",
                      "き",
                      "び",
                      "し",
                      "ち",
                      "に",
                      "ひ",
                      "び",
                      "み",
                      "り",
                    ].includes(r2[r2.length - 1])
                  ) {
                    deleteIndex = duplicatesCopy.indexOf(r1);
                    break;
                  }
                }
                break;
              }
            }
            if (deleteIndex >= 0) {
              duplicatesCopy.splice(deleteIndex, 1);
              continue;
            } else {
              console.log(duplicates); // This should not happen
            }
          }
          const baseReadingIndex = duplicates.indexOf(duplicatesCopy[0]);
          duplicates.splice(baseReadingIndex, 1);
          delGroup.push(duplicates);
        }
      }
      delArray.push(delGroup);
    }
    for (let i = 0; i < hodgepodge.length; i++) {
      for (let delGroup of delArray[i]) {
        if (delGroup.length !== 0) {
          while (delGroup.length > 0) {
            for (let ri = 0; ri < hodgepodge[i].readingsKun.length; ri++) {
              if (hodgepodge[i].readingsKun[ri].value === delGroup[0]) {
                hodgepodge[i].readingsKun.splice(ri, 1);
                delGroup.splice(0, 1);
                break;
              }
              if (ri === hodgepodge[i].readingsKun.length - 1) {
                console.log(i); // For some reason there are duplicate duplicates
                delGroup.splice(0, 1);
              }
            }
          }
        }
      }
    }

    // Remove remaining "-"
    for (let mk of hodgepodge) {
      for (let r of mk.readingsKun) {
        r.value = r.value.replace("-", "");
      }
    }

    // Add origin information to on-readings from wiktionary
    for (let wk of wiktionaryReadings) {
      for (let mk of hodgepodge) {
        if (wk.literal === mk.literal) {
          for (let wr of wk.readings) {
            for (let mr of mk.readingsOn) {
              if (wr.value === mr.value) {
                if (!mr.types) {
                  mr.types = [];
                  for (let t of wr.types) {
                    if (t === "呉音") mr.types.push("go");
                    else if (t === "漢音") mr.types.push("kan");
                    else if (t === "唐音") mr.types.push("to");
                    else if (t === "慣用音") mr.types.push("kanyo");
                    else console.log(wk.literal + t); // this should never happen
                  }
                }
                // This is currently necessary because the wiktionary reading objects aren't fully merged:
                else {
                  for (let t of wr.types) {
                    if (t === "呉音") t = "go";
                    else if (t === "漢音") t = "kan";
                    else if (t === "唐音") t = "to";
                    else if (t === "慣用音") t = "kanyo";
                    else console.log(wk.literal + t); // this should never happen
                    if (!mr.types.includes(t)) {
                      mr.types.push(t);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return hodgepodge;

    // This is used to get the variants from kanjidic2
    function variantsToUtf16(kanjidicKanji, kanjidic) {
      const utf16codes = [];
      const variantCps = [];
      // These characters are referenced as variants (ucs) but are not in kanjidic2
      const missingCharacters = [
        "4eb8",
        20152,
        "5785",
        22405,
        "5cbd",
        23741,
        "5d02",
        23810,
        "60ea",
        24810,
        "5386",
        21382,
        "686a",
        26730,
        "5386",
        21382,
        "f94d",
        63821,
        "6e86",
        28294,
        "f93d",
        63805,
        "6710",
        26384,
        "8d56",
        36182,
        "9109",
        37129,
        "f99b",
        63899,
        "98d5",
        39125,
        "9e5a",
        40538,
      ];
      for (v of kanjidicKanji.variants) {
        // kanjidic2 sometimes omits zeros before single-digits, sometimes doesn't. Seems to only cause problem in one
        // direction
        if (v.type === "jis208" || v.type === "jis212") {
          if (v.value.length === 5) {
            variantCps.push({
              value: v.value.substring(0, 3) + v.value.substring(4),
              type: v.type,
            });
          }
          variantCps.push(v);
        }
        // there is exactly one jis213 variant value in kanjidic2 and it has an error being 12-38 instead of 2-12-38
        else if (v.value === "12-38") {
          v.value = "2-12-38";
          variantCps.push(v);
        }
        // Some ucs values differ in case between codepoint and variant
        else {
          variantCps.push(v);
          variantCps.push({ value: v.value.toLowerCase(), type: v.type });
        }
      }
      for (vc of variantCps) {
        if (vc.type === "ucs" && missingCharacters.includes(vc.variant)) {
          // TODO: I used to add these even though they're outside kanjdic2. I should get rid of this.
          utf16codes.push(
            missingCharacters[missingCharacters.indexOf(vc.variant) + 1]
          );
        } else {
          for (kdk of kanjidic) {
            for (cp of kdk.codepoints) {
              if (cp.type === vc.type && cp.value === vc.value) {
                utf16codes.push(kdk.literal.codePointAt(0));
              }
            }
          }
        }
      }
      return utf16codes;
    }
    function areDuplicates(reading1, reading2) {
      if (
        reading1.replace("-", "").length !== reading2.replace("-", "").length
      ) {
        return false;
      } else if (reading2.includes(".") || reading1.includes(".")) {
        if (reading1.match(duplRegOk(reading2))) {
          return true;
        }
        if (reading2.match(duplRegOk(reading1))) {
          return true;
        }
        return false;
      } else {
        if (reading1.match(duplReg(reading2))) {
          return true;
        }
        if (reading2.match(duplReg(reading1))) {
          return true;
        }
        return false;
      }
      // Duplicate regex without okurigana
      function duplReg(str) {
        let regexStr = "";
        for (let i = 0; i < str.length; i++) {
          if (i === 0) {
            regexStr +=
              "^(-*" + str[i] + "|-" + kanaUtil.addDakuten(str[i], 0) + ")";
          } else if (i === str.length - 1) {
            regexStr += str[i] + "-*$";
          } else {
            regexStr += str[i];
          }
        }
        return new RegExp(regexStr);
      }

      // Duplicate regex with okurigana
      function duplRegOk(str) {
        let regexStr = "";
        for (let i = 0; i < str.length; i++) {
          if (i === 0) {
            regexStr +=
              "^(-*" + str[i] + "|-" + kanaUtil.addDakuten(str[i], 0) + ")";
          } else if (i === str.length - 1) {
            regexStr += "[" + str[i] + kanaUtil.uToI(str[i], 0) + "]";
            if (
              regexStr[i - 1].match(
                /[いきぎじちにびみりえけげせぜてでねへべめれ]/g
              )
            ) {
              regexStr += "*";
            }
            regexStr += "-*$";
          } else if (str[i] === ".") {
            regexStr += "\\.";
          } else {
            regexStr += str[i];
          }
        }
        return new RegExp(regexStr);
      }
    }
  },
};
module.exports = createHodgepodge;
