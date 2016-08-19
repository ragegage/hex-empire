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
      game.move($(e.target).data('pos'))
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
        if (tile.city)
          displayTile.append('<city/>')
        if (tile.army)
          displayTile.append('<army/>')
      })
    })
    $('.app').css('backgroundColor', game.currentPlayer().color)
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
      this.currentIdx++
      if(this.currentIdx >= this.players.length)
        this.currentIdx = 0
    }

    size() {
      return this.board.size
    }

    move(pos) {
      let tile = this.board.get(pos)
      this.currentPlayer().move(tile)
      this.endTurn()
    }

    render() {
      return this.board.render()
    }
  }

  class Board {
    constructor(rows, cols){
      this.size = [rows, cols]
      this.tiles = this.addTiles(...this.size)
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

    get([row, col]) {
      return this.tiles[row][col]
    }

    render() {
      return this.tiles
    }
  }

  class Army {
    constructor(color){
      this.color = color
      this.strength = 0
      this.hasMoved = false
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
  }

  class Tile {
    constructor (board, pos) {
      this.board = board
      this.pos = pos
      this.army = undefined
      this.city = undefined
      this.color = undefined
    }
  }
  
  class Player {
    constructor(color) {
      this.color = color
      this.base = undefined
      this.armies = []
    }

    setHomeBase(tile) {
      this.base = tile
      tile.color = this.color
      tile.city = true
      tile.army = new Army(this.color)
    }

    move(tile) {
      if (this.base === undefined)
        this.setHomeBase(tile)
      else
        alert("move not implemented yet")
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
})