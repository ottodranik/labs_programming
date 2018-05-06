// Очередь приоритетов на JS
class PriorityQueue {
  
  constructor() {
    this.Q = [];
  };

  enqueue(vertex, priority) {
    this.Q.push({ vertex, priority });
    this.Q.sort((a, b) => { // сортировка по приоритету
      return a.priority - b.priority;
    }); 
  };

  dequeue() {
    return this.Q.shift().vertex;
  };
  
  isEmpty() {
    return !this.Q.length;
  };
}

module.exports = PriorityQueue; // Экспорт для использования во внешних файлах