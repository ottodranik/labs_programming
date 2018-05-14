var fs = require('fs'); 
const PriorityQueue = require('./PriorityQueue.js');

var graphData=[];

const fileData = fs.readFileSync('./matrix.txt'); // Прочитать данные из файла
const data = fileData
  .toString()
  .split("\n")
  .filter(str => str) // Разложить данные файла по строкам и удалить пустые строки
  .reduce((prex, cur, i, res) => {
    res[i] = cur.split(',').map(item => +item || -1);
    return res;
  }, [])

printMatrix(data)

// Построить сетку по данным из файла
class SquareGrid {

  constructor(data) {
    this.width = data.length;
    this.height = data[0].length;
    this.walls = [];
    this.weights = [];

    // Наполнить веса и стены данными
    data.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value !== -1) {
          this.weights.push({ point: [i, j], priority: value })
        } else {
          this.walls.push([i, j])
        }
      })
    })
  }
  
  // Проверить находится ли вершина в зоне досягаемости
  inReachZone(id) {
    const [x, y] = id;
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  
  // Проверить не находится ли на месте вершины стена
  isCanPass(id) {
    return !this.walls.filter(wall => wall[0] === id[0] && wall[1] === id[1]).length;
  }

  // Просчёт весов
  cost(fromNode, toNode) {
    const node = this.weights.filter(
      item => item.point[0] === toNode[0] && item.point[1] === toNode[1]
    )[0]
    return node ? node.priority : 1;
  }
  
  // Поиск по соседним вершинам (диагонали запрещены)
  neighbors(id) {
    const [x, y] = id
    let results = [[x+1, y], [x, y-1], [x-1, y], [x, y+1]]
    if ((x + y) % 2 === 0) {
      results.reverse() // ради эстетики
    }
    results = results.filter(this.inReachZone.bind(this));
    results = results.filter(this.isCanPass.bind(this));
    return results
  }
}

const graph = new SquareGrid(data);

const { costs } = AStar(graph, [1, 4], [7, 8]);
console.log('----------------------------')
drawGrid(data, [1, 4], [7, 8])
console.log('----------------------------')
drawGrid(data, [1, 4], [7, 8], costs)
console.log('----------------------------')

// Эристика "Манхэттен"
function heuristic(a, b) {
  const [x1, y1] = a
  const [x2, y2] = b
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function AStar(G, start, goal) {
  const Q = new PriorityQueue()
  Q.enqueue(start, 0)
  const cameFrom = {}
  const costs = {}
  cameFrom[start] = null;
  costs[start] = 0;

  // Пока очередь не пуста
  while (!Q.isEmpty()) {
    current = Q.dequeue();

    // if current == goal:
    if (current[0] === goal[0] && current[1] === goal[1]) {
      break
    }
    
    let neighbors = G.neighbors(current);
    
    for (let i = 0; i < neighbors.length; i++) {

      if (neighbors[i][0] === start[0] && neighbors[i][1] === start[1]) {
        continue;
      }
      
      let newCost = costs[current] + G.cost(current, neighbors[i]);
      
      if (!costs[neighbors[i]] || newCost < costs[neighbors[i]]) {
        costs[neighbors[i]] = newCost
        priority = newCost + heuristic(goal, neighbors[i])
        Q.enqueue(neighbors[i], priority)
        cameFrom[neighbors[i]] = current
      }
    }
  }
  return {
    cameFrom,
    costs
  }
}

// Нарисовать сетку в консоли
function drawGrid(matrix, from, to, costs) {
  const gridLine = [];
  for (let i = 0; i < matrix.length; i++) {
    gridLine[i] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      gridLine[i][j] = matrix[i][j] === -1 ? '#' : '.';
      if (i === from[0] && j === from[1]) {
        gridLine[i][j] = 'A';
      }
      if (i === to[0] && j === to[1]) {
        gridLine[i][j] = 'Z';
      }
      if (costs && costs[i+','+j]) {
        gridLine[i][j] = costs[i+','+j];
      }
    }
  }
  const grid = gridLine.map(row => {
    return row.reduce((res, val) => {
      res += val;
      res += val.toString().length === 2 ? ' ' : '  ';
      return res;
    }, '')
  })
  console.log(grid.join('\n'))
}

// Вывести матрицу
function printMatrix(matrix) {
  matrix.forEach(item => {
    console.log(item.join('\t'));
  });
};
