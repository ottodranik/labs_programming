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

console.log(data)

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
console.log(graph.weights)
console.log(graph.walls)
// graph.walls = [[1, 7], [1, 8], [2, 7], [2, 8], [3, 7], [3, 8]]
// graph.weights = [{vertex}
//   (3, 4), (3, 5), (4, 1), (4, 2),
//                                        (4, 3), (4, 4), (4, 5), (4, 6), 
//                                        (4, 7), (4, 8), (5, 1), (5, 2),
//                                        (5, 3), (5, 4), (5, 5), (5, 6), 
//                                        (5, 7), (5, 8), (6, 2), (6, 3), 
//                                        (6, 4), (6, 5), (6, 6), (6, 7), 
//                                        (7, 3), (7, 4), (7, 5)
// ]

const { came_from, cost_so_far } = AStar( graph, [1, 4], [7, 8] );
draw_grid(data, [1, 4], [7, 8])
console.log(came_from, cost_so_far)


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
    // current = frontier.get()
    current = frontier.dequeue();

    // if current == goal:
    if (current[0] === goal[0] && current[1] === goal[1]) {
      // path = this.shortestPath(smallest, previous, begin);
      break
    }
    
    // for next in graph.neighbors(current):
    let neighbors = G.neighbors(current);
    for (let i = 0; i < neighbors.length; i++) {
        // new_cost = cost_so_far[current] + graph.cost(current, next)
        let new_cost = cost_so_far[current] + G.cost(current, neighbors[i]);
        // if next not in cost_so_far or new_cost < cost_so_far[next]:
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

function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.equal = function(point1, point2) {
  return point1.x === point2.x && point1.y === point2.y;
}

function draw_grid(matrix, from, to) {
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
    }
    // gridLine[i] = Array.from(
    //   { length: grid.width },
    //   (x, j) => grid.walls.length && grid.walls[j][i] ? '#' : '.'
    // );
  }
  console.log(
    gridLine.map(item => item.join(' ')).join('\n')
  )
}