var fs = require('fs'); 
var parse = require('csv-parse');

var csvData=[];

// Асинхронное чтение строк файла
fs.createReadStream('lab1/eurovision.csv')
  .pipe(parse({ delimiter: ',', relax_column_count: true }))
  .on('data', function(csvrow) {
    csvData.push(csvrow);        
  })
  .on('end', function() {
    const count = csvData[0][0];
    const countries = csvData.slice(1);
    main(countries, count);
  });

// Массив оценок
const marks = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

// Главная функция
function main(data, length) {
  const final = {};

  // Проход по всем колонкам
  for (let i = 1; i <= length; i++) {

    // -> сортировка исходного массива по i-ой колонке на каждом проходе
    data.sort((a, b) => b[i] - a[i]);

    // -> каждой стране записать оценку в массив оценок
    for (let j = 0; j < length; j++) {
      if (!final[data[j][0]]) {
        final[data[j][0]] = [];
      }

      // -> для первых 10 стран оценка будет из массива marks
      // -> для последних 10 стране оценка = 0
      final[data[j][0]].push(marks[j] || 0);
    }
  }

  // Подсчёт ТОП-10 победителей
  const results = Object.keys(final).map((country) => {
    return [
      country,
      final[country].reduce((prev, next) => prev + next)
    ]
  }).sort((a, b) => b[1] - a[1]);

  // -> вывод на экран
  console.log(results)

  // -> вывод в файл
  saveInFile(
    ['Країна,Оцінки'].concat(
      results.map(item => '\n'+item.join(','))
    )
  );
};

// Сохранение данных в файл
function saveInFile(data) {
  fs.writeFile('lab1/results.csv', data, 'utf8', function (err) {
    if (err) {
      console.log('Помилка при збереженні даних!');
    } else{
      console.log('Успішно збережено в файл results.csv!');
    }
  });
}