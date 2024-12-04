import PriorityQueue from "js-priority-queue"

class Graph {
  constructor(n) {
    this.size = n;
    this.tileType = {"road": 1, "dirt": 2, "Grass": 3, "water": 5, "Obstacle": Infinity};

    this.graph = [];
    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < n; j++) {
        // default value of 5, grass
        row.push(3);
      } 
      this.graph.push(row);
    }
  }

  updateGraph(data) {
    for (let value of data) {
      this.graph[value["x"]][value["y"]] = this.tileType[value["type"]];
    }
  }

  dijkstra(src, dst) {
    let checkCoords = [src[0], src[1], dst[0], dst[1]];
    for (let c of checkCoords) {
      if (c < 0 || c >= this.size) {
        return [-1, [-1], [-1]];
      }
    }
    if (this.graph[src[0]][src[1]] === Infinity || this.graph[dst[0]][dst[1]] == Infinity) {
      return [-1, [-1], [-1]];
    }

    let output = [-1];
    let visitedVertices = [];
    let path = [];
    let visited = new Set();
    let q = new PriorityQueue({ comparator: function(coord1, coord2) { return coord1[2] - coord2[2]}});
    let p = {};
    let d = {};
    let nei = [[1,0],[0,1],[-1,0],[0,-1]];
    for (let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        p[[i,j].toString()] = [-1,-1];
        d[[i,j].toString()] = Infinity;
      }
    }

    d[src.toString()] = 0;
    let qSrc = src;
    qSrc.push(0);
    q.queue(qSrc);

    while (q.length != 0) {
      let minCoords = q.dequeue();
      let minDist = minCoords.pop();

      if (visited.has(minCoords.toString())) {
        continue;
      } 

      visited.add(minCoords.toString());
      visitedVertices.push(minCoords);

      let x = minCoords[0];
      let y = minCoords[1];

      if (JSON.stringify([x,y]) === JSON.stringify(dst)) {
        output[0] = d[dst.toString()];
        output.push(visitedVertices);

        let parent = p[dst.toString()];
        while (JSON.stringify(parent) !== JSON.stringify([-1,-1])) {
          path.push(parent);
          parent = p[parent.toString()];
        }
        output.push(path);

        return output;
      }

      for (let n of nei) {
        let dx = n[0];
        let dy = n[1];
  
        let nx = x + dx;
        let ny = y + dy;
        
        if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.graph[nx][ny] != Infinity) {
          let nDist = this.graph[nx][ny] + minDist;
          let nQ = [nx,ny,nDist];
          if (nDist < d[[nx,ny].toString()])
            p[[nx,ny].toString()] = [x,y];
            d[[nx,ny].toString()] = nDist;
            q.queue(nQ);
        }
      }
    }
  }


  aStar(src, dst) {
    let checkCoords = [src[0], src[1], dst[0], dst[1]];
    for (let c of checkCoords) {
      if (c < 0 || c >= this.size) {
        return [-1, [-1], [-1]];
      }
    }
    if (this.graph[src[0]][src[1]] === Infinity || this.graph[dst[0]][dst[1]] == Infinity) {
      return [-1, [-1], [-1]];
    }

    let output = [-1];
    let visitedVertices = [];
    let path = [];
    let visited = new Set();
    let q = new PriorityQueue({ comparator: function(coord1, coord2) { return coord1[2] - coord2[2]}});
    let p = {};
    let d = {};
    let nei = [[1,0],[0,1],[-1,0],[0,-1]];
    for (let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        p[[i,j].toString()] = [-1,-1];
        d[[i,j].toString()] = Infinity;
      }
    }

    d[src.toString()] = 0;
    let qSrc = src;
    qSrc.push(0);
    q.queue(qSrc);

    while (q.length != 0) {
      let minCoords = q.dequeue();
      let minDist = minCoords.pop();

      if (visited.has(minCoords.toString())) {
        continue;
      } 

      visited.add(minCoords.toString());
      visitedVertices.push(minCoords);

      let x = minCoords[0];
      let y = minCoords[1];

      if (JSON.stringify([x,y]) === JSON.stringify(dst)) {
        output[0] = d[dst.toString()];
        output.push(visitedVertices);

        let parent = p[dst.toString()];
        while (JSON.stringify(parent) !== JSON.stringify([-1,-1])) {
          path.push(parent);
          parent = p[parent.toString()];
        }
        output.push(path);

        return output;
      }

      for (let n of nei) {
        let dx = n[0];
        let dy = n[1];
  
        let nx = x + dx;
        let ny = y + dy;
        
        if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.graph[nx][ny] != Infinity) {
          let nDist = this.graph[nx][ny] + minDist;

          // difference is calculating the heuristic
          let hScore = Math.max(Math.abs(dst[0] - nx), Math.abs(dst[1] - ny));
          nDist = this.graph[nx][ny] + minDist + hScore;

          let nQ = [nx,ny,nDist];
          if (nDist < d[[nx,ny].toString()])
            p[[nx,ny].toString()] = [x,y];
            d[[nx,ny].toString()] = nDist;
            q.queue(nQ);
        }
      }
    }
  }
}

export {Graph};


// console.log("start now");
// let graph = new Graph(400);

// let data = await readCSV();

// graph.updateGraph(data);
// console.log(graph.dijkstra([99,99],[100,100]))


/* old dijkstrra with no heap
dijkstra(src, dst) {
    let visited = new Set();
    let vMinusS = new Set();
    let p = {};
    let d = {};
    let nei = [[1,0],[0,1],[-1,0],[0,-1]];
    for (let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        p[[i,j].toString()] = [-1,-1];
        d[[i,j].toString()] = Infinity;
        vMinusS.add([i,j].toString());
      }
    }

    d[src.toString()] = 0;
    vMinusS.delete(src.toString())
    visited.add(src.toString());
    for (let n of nei) {
      let dx = parseInt(n[0]);
      let dy = n[1];

      let x = parseInt(src[0]) + dx;
      let y = parseInt(src[1]) + dy;

      if (x >= 0 && x < this.size && y >= 0 && y < this.size && this.graph[x][y] != Infinity) {
        p[[x,y].toString()] = src;
        d[[x,y].toString()] = this.graph[x][y];
      }
    }

    while (vMinusS) {
      let minCoords = "";
      let minDist = Infinity;
      for (let u of vMinusS) {
        if (d[u] < minDist) {
          minDist = d[u];
          minCoords = u;
        }
      }

      vMinusS.delete(minCoords);
      visited.add(minCoords);
      
      // parse numbers from string u
      let comma = minCoords.search(',');
      let x = parseInt(minCoords.substring(0, comma));
      let y = parseInt(minCoords.substring(comma+1));

      if (JSON.stringify([x,y]) === JSON.stringify(dst)) {
        return d[dst.toString()];
      }

      for (let n of nei) {
        let dx = n[0];
        let dy = n[1];
  
        let nx = x + dx;
        let ny = y + dy;
        
        if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.graph[nx][ny] != Infinity) {
          p[[nx,ny].toString()] = [x,y];
          d[[nx,ny].toString()] = this.graph[nx][ny] + minDist;
        }
      }
    }
  }
*/