const fs = require("fs");

let groupings = JSON.parse(fs.readFileSync('./data/krad/krad.json')).map(krad => krad.components);

groupings = groupings.sort((a, b) => b.length - a.length);

let x = -1;
while (x < groupings.length - 1) {
  x++;
  let deletionIndexes = []
  for (let y = 0; y < groupings.length; y++) {
    if (groupings[x].length > groupings[y].length) {
      let found = groupings[y].every(c => groupings[x].includes(c));
      if (found) {
        deletionIndexes.push(y);
      }
    }
  }
  if (deletionIndexes.length > 0) {
    for (let i of deletionIndexes) {
      groupings.splice(i, 1);
    }
    x = 0;
    console.log(groupings.length)
  }
}
fs.writeFileSync("possible_groups.json", JSON.stringify(groupings))