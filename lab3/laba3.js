const fs = require('fs');
const BmpReader = require('./BmpReader.js');

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const scale = parseInt(process.argv[4]);

if (!inputFile || !outputFile || !scale) {
  console.log("Параметры неверны!");
  return;
}

const fileData = fs.readFileSync(inputFile);
const bmp = new BmpReader(fileData);
const bmpData = bmp.resize(scale);

fs.writeFile(outputFile, bmpData, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("The file was saved!");
  }
});
