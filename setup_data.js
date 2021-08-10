const h = require("./data_creation/hodgepodge/create_hodgepodge");
const v = require("./data_creation/vocabulary/create_kanji_vocabulary");
const fs = require("fs");
const { PythonShell } = require('python-shell');
const path = require("path");
const { exit } = require("process");

const srcFolderPath = path.join("data","src");
const targetFolderPath = path.join("data","target");

setupData();

async function setupData() {
  const kanjidicScriptPath = "./data_creation/hodgepodge/kanjidic2_to_json.py";
  const kanjidicSourcePath = path.join(srcFolderPath, "kanjidic2.xml");

  const unihanScriptPath = "./data_creation/hodgepodge/create_my_unihan.py";
  const unihanSources = [path.join(srcFolderPath, "Unihan_Variants.txt"), path.join(srcFolderPath, "Unihan_RadicalStrokeCounts.txt")]

  const wiktionaryScriptPath = "./data_creation/hodgepodge/create_wiktionary_readings.py";
  const wiktionarySourcePath = path.join(srcFolderPath, "jawiktionary-20210301-pages-meta-current.xml");

  const freqDictScriptPath = "./data_creation/vocabulary/create_frequency_dictionary.py"
  const jmdictPath = path.join(srcFolderPath, "JMdict_e");

  console.log("Data is being created. This can take a while.");
  console.log("(1/2) Kanji data:")

  console.log("Step 1/7: Loading joyo_kanji.json...");
  const joyo = JSON.parse(fs.readFileSync(path.join(srcFolderPath, "joyo_kanji.json")));

  console.log("Step 2/7: Loading radicals.json...");
  const radicals = JSON.parse(fs.readFileSync(path.join(srcFolderPath, "radicals.json")));

  console.log("Step 3/7: Creating kanjidic2.json...");
  const kanjidic2 = await getJsonDataFromPythonScript(kanjidicScriptPath, kanjidicSourcePath);
  writeJsonFile(kanjidic2, path.join(targetFolderPath, "kanjidic2.json"));

  console.log("Step 4/7: Creating my_unihan.json...");
  const my_unihan = await getJsonDataFromPythonScript(unihanScriptPath, unihanSources);
  writeJsonFile(my_unihan, path.join(targetFolderPath, "my_unihan.json"));

  console.log("Step 5/7: Creating wiktionary_readings.json...");
  const wiktionary = await getJsonDataFromPythonScript(wiktionaryScriptPath, wiktionarySourcePath);
  writeJsonFile(wiktionary, path.join(targetFolderPath, "wiktionary_readings.json"));

  console.log("Step 6/7: Creating hodgepodge.json...");
  const hodgepodge = h.buildHodgepodge(kanjidic2, my_unihan, joyo, radicals, wiktionary);
  writeJsonFile(hodgepodge, path.join(targetFolderPath, "hodgepodge.json"));

  console.log("Step 7/7: Creating frequency_dictionary.json...");
  const freqDict = await getJsonDataFromPythonScript(freqDictScriptPath, jmdictPath);
  writeJsonFile(freqDict, path.join(targetFolderPath, "frequency_dictionary.json"));

  async function getJsonDataFromPythonScript(scriptPath, arguments) {
    return new Promise((resolve, reject) => {
      PythonShell.run(scriptPath,
        { mode: 'text', args: arguments }, function (err, results) {
          if (err) reject(err);
          resolve(JSON.parse(results));
        });
    });
  }

  function writeJsonFile(object, path) {
    try {
      fs.writeFileSync(path, JSON.stringify(object));
    }
    catch (err) {
      console.error(err);
    }
  }
}