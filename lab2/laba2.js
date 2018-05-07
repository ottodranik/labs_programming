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

class SquareGrid {

  constructor(data) {
    this.width = data.length;
    this.height = data[0].length;
    this.walls = [];
    this.weights = [];

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
  
  in_bounds(id) {
    const [x, y] = id;
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  
  passable(id) {
    return !this.walls.filter(wall => wall[0] === id[0] && wall[1] === id[1]).length;
  }

  cost(from_node, to_node) {
    const node = this.weights.filter(
      item => item.point[0] === to_node[0] && item.point[1] === to_node[1]
    )[0]
    return node ? node.priority : 1;
  }
  
  neighbors(id) {
    const [x, y] = id
    let results = [[x+1, y], [x, y-1], [x-1, y], [x, y+1]]
    if ((x + y) % 2 === 0) {
      results.reverse() // ради эстетики
    }
    results = results.filter(this.in_bounds.bind(this));
    results = results.filter(this.passable.bind(this));
    return results
  }
}

const graph = new SquareGrid(data);

const { came_from, cost_so_far } = AStar( graph, [1, 4], [7, 8] );
console.log('----------------------------')
draw_grid(data, [1, 4], [7, 8])
console.log('----------------------------')
draw_grid(data, [1, 4], [7, 8], cost_so_far)
console.log('----------------------------')

function heuristic(a, b) {
  const [x1, y1] = a
  const [x2, y2] = b
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function AStar(G, start, goal) {
  const frontier = new PriorityQueue()
  frontier.enqueue(start, 0)
  const came_from = {}
  const cost_so_far = {}
  came_from[start] = null;
  cost_so_far[start] = 0;

  while (!frontier.isEmpty()) {
    current = frontier.dequeue();

    // if current == goal:
    if (current[0] === goal[0] && current[1] === goal[1]) {
      break
    }
    
    let neighbors = G.neighbors(current);
    
    for (let i = 0; i < neighbors.length; i++) {

      if (neighbors[i][0] === start[0] && neighbors[i][1] === start[1]) {
        continue;
      }
      
      let new_cost = cost_so_far[current] + G.cost(current, neighbors[i]);
      
      if (!cost_so_far[neighbors[i]] || new_cost < cost_so_far[neighbors[i]]) {
        cost_so_far[neighbors[i]] = new_cost
        priority = new_cost + heuristic(goal, neighbors[i])
        frontier.enqueue(neighbors[i], priority)
        came_from[neighbors[i]] = current
      }
    }
  }
  return {
    came_from,
    cost_so_far
  }
}

function draw_grid(matrix, from, to, cost_so_far) {
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
      if (cost_so_far && cost_so_far[i+','+j]) {
        gridLine[i][j] = cost_so_far[i+','+j];
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
