document.addEventListener("DOMContentLoaded", () => {
  const setupBoard = (game) => {
    $parent = $(".board")
    let rows, cols;
    [rows, cols] = game.size()
    for(let i = 0; i < rows; i++){
      let $ul = $("<ul></ul>")
      $ul.addClass("row")
      $parent.append($ul)
      for(let j = 0; j < cols; j++){
        let $li = $("<li></li>")
        $li.addClass("hex")
        $li.data("pos", [i, j])
        $ul.append($li)
      }
    }
  }

  const addClickHandlers = (game) => {
    $(".board").on("click", ".hex", (e) => {
      // alert(`${game.currentPlayer()} moving to ${$(e.target).data('pos')}`)
      game.move($(e.currentTarget).data('pos'))
      render(game)
    })
  }

  const render = (game) => {
    let gameState = game.render()
    console.log(gameState)
    gameState.forEach(row => {
      row.forEach(tile => {
        let displayTile = $($('.board ul').eq(tile.pos[0]).children()[tile.pos[1]])
        displayTile.empty()
        displayTile.removeClass()
        displayTile.addClass('hex')
        displayTile.addClass(tile.color)
        if (tile.army) {
          let $army = $('<army/>')
          $army.addClass(tile.army.color)
          $army.append(`<span>${tile.army.strength}</span>`)
          // change size of circle? or not?
          // $army.css('border-width', 15 + tile.army.strength)
          // $army.css('border-radius', 15 + tile.army.strength)
          displayTile.append($army)
        }
        if (tile.city) {
          let $city = $('<city/>')
          $city.addClass(tile.city.color)
          displayTile.append($city)
        }
        if (tile.selected) {
          displayTile.addClass('selected')
        }
      })
    })
    $('.app').css('backgroundColor', game.currentPlayer().color)
    if(game.won()){
      console.log('won')
      $('.app').css('backgroundColor', 'black')
    }
  }

  class Game {
    constructor(rows, cols){
      this.board = new Board(rows, cols)
      this.players = [new Player("red"), new Player("blue")]
      this.currentIdx = 0
    }

    currentPlayer() {
      return this.players[this.currentIdx]
    }

    endTurn() {
      this.currentPlayer().hasMoved = false
      this.currentIdx++
      if(this.currentIdx >= this.players.length)
        this.currentIdx = 0
      // sees if the current player can make a move,
        // if not, next player's turn
      if (this.players.every(player => player.base) && 
        this.players[this.currentIdx].armies.every(army => army.hasMoved))
        this.endTurn()
    }

    size() {
      return this.board.size
    }

    move(pos) {
      let tile = this.board.get(pos)
      this.currentPlayer().move(tile)
      if(this.currentPlayer().hasMoved)
        this.endTurn()
    }

    won() {
      if(this.players.every(player => player.base))
        return this.players.some(player => player.base.color !== player.color)
    }

    render() {
      return this.board.render()
    }
  }

  class Board {
    constructor(rows, cols){
      this.size = [rows, cols]
      this.tiles = this.addTiles(...this.size)
      this.addCities(...this.size)
    }

    addTiles(rows, cols) {
      const arr = []
      for(let i = 0; i < rows; i++){
        let row = []
        for(let j = 0; j < cols; j++)
          row.push(new Tile(this, [i, j]))
        arr.push(row)
      }
      return arr
    }

    addCities(rows, cols) {
      let maxNumCities = 4
      const odds = maxNumCities / (rows * cols)

      // loop through tiles
        // odds are maxNumCities / numTiles
        // odds on put a city on a given tile
      for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++)
          if(Math.random() < odds)
            this.tiles[i][j].city = new City("black", this.tiles[i][j])
      }
    }

    valid ([row, col]) {
      return (row >= 0 && row < this.size[0] &&
        col >= 0 && col < this.size[1])
    }

    get([row, col]) {
      if(this.valid([row, col]))
        return this.tiles[row][col]
      else return undefined
    }

    render() {
      return this.tiles
    }
  }

  class Army {
    constructor(color, tile, player){
      this.color = color
      this.strength = 1
      this.hasMoved = false
      this.tile = tile
      this.player = player
    }

    move() {
      this.hasMoved = true
    }

    resetMoveStatus() {
      this.hasMoved = false
    }

    increaseStrength(amount) {
      this.strength += amount
    }

    moveTo(newTile) {
      if(this.tile.fullNeighbors().includes(newTile)) {
        this.tile.army = undefined
        this.tile = newTile
        if(this.tile.army){ // runs into another army
          if(this.tile.army.color === this.color) { // same team
            this.tile.army.strength += this.strength
            this.die()
          } else {
            this.increaseStrength(1) // battle logic
            if(this.tile.army.strength > this.strength){ // losing battle
              this.tile.army.strength -= this.strength
              this.die()
            } else { // winning battle
              this.strength -= this.tile.army.strength
              this.tile.army.die()
              this.tile.army = this
              this.tile.color = this.color
              this.tile.neighbors().forEach(neighbor => neighbor.color = this.color)
              if(this.tile.city) {
                this.tile.city.color = this.color
                this.player.cities.push(this.tile.city)
              }
            }
          }
        } else {
          this.tile.army = this
          this.tile.color = this.color
          if(this.tile.city) {
            this.tile.city.color = this.color
            this.player.cities.push(this.tile.city)
          }
          this.tile.neighbors().forEach(neighbor => neighbor.color = this.color)
        }
      } else {
        throw "invalid move"
      }
    }

    die() {
      this.tile = undefined
      this.player.armies = this.player.armies.filter(army => army !== this)
    }
  }

  class Tile {
    constructor (board, pos) {
      this.board = board
      this.pos = pos
      this.army = undefined
      this.city = undefined
      this.color = undefined
      this.selected = false
    }

    fullNeighbors () {
      const x = this.pos[0]
      const y = this.pos[1]
      let neighbors = [
        [x, y-1],
        [x, y+1],
        [x-1, y],
        [x+1, y-1],
        [x+1, y],
        [x+1, y+1]
      ]
      if(y % 2 === 0){
        neighbors[3] = [x-1, y-1]
        neighbors[5] = [x-1, y+1]
      }
      return neighbors.map(pos => this.board.get(pos))
               .filter(neighbor => neighbor)
    }

    neighbors () {
      return this.fullNeighbors()
               .filter(neighbor => !neighbor.army || !neighbor.city)
    }
  }

  class City {
    constructor(color, tile, player) {
      this.color = color
      this.tile = tile
      this.player = player
    }

    naturalGrowth() {
      // if city has an army, army grows by 15
      if (this.tile.army)
        this.tile.army.increaseStrength(15)
      else {
        this.tile.army = new Army(this.color, this.tile, this.player)
        this.player.armies.push(this.tile.army)
      }
    }
  }
  
  class Player {
    constructor(color) {
      this.color = color
      this.base = undefined
      this.armies = []
      this.hasMoved = false
      this.selectedArmy = undefined
      this.cities = []
    }

    setHomeBase(tile) {
      this.base = tile
      tile.color = this.color
      tile.city = new City(this.color, tile, this)
      tile.army = new Army(this.color, tile, this)
      this.armies.push(tile.army)
      this.cities.push(tile.city)
    }

    move(tile) {
      if (this.base === undefined){
        this.setHomeBase(tile)
        tile.neighbors().forEach(tile => tile.color = this.color)
        this.hasMoved = true
      } else {
        if (this.armies.every(army => army.hasMoved)) {
          this.cities.forEach(city => city.naturalGrowth())
          this.hasMoved = true
          this.selectedArmy = undefined
        } else if (this.selectedArmy) {
          // allow user to move army from current location to new location... 
            // if it's a valid move
          try {
            const oldTile = this.selectedArmy.tile
            this.selectedArmy.moveTo(tile)
            this.cities.forEach(city => city.naturalGrowth())
            this.hasMoved = true
            oldTile.selected = false
            this.selectedArmy = undefined
          } catch(err) {
            this.hasMoved = false
          }
        } else if (this.armies.includes(tile.army)){
          // if the tile clicked on has an army and it is one of our armies,
          tile.selected = true
          this.selectedArmy = tile.army
          // tile.neighbors().forEach(tile => tile.color = "white")
        }
      }
    }

    display() {
      return this.color
    }

    toString() { // for console.log purposes
      return this.color
    }
  }

  let game = new Game(5, 11)
  setupBoard(game)
  addClickHandlers(game)
  render(game)
})