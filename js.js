document.addEventListener("DOMContentLoaded", () => {
  const setupBoard = () => {
    $parent = $(".board")
    for(let i = 0; i < 6; i++){
      let $ul = $("<ul></ul>")
      $ul.addClass("row")
      $parent.append($ul)
      for(let j = 0; j < 12; j++){
        let $li = $("<li></li>")
        $li.addClass("hex")
        $li.data("pos", [i, j])
        $ul.append($li)
      }
    }
  }

  const addClickHandlers = () => {
    $(".board").on("click", ".hex", (e) => {
      alert($(e.target).data("pos"))
    })
  }

  class Game {
    constructor(){
      this.board = new Board()
      this.players = [new Player(), new Player()]
    }
  }

  class Army {
    constructor(color){
      this.color = color
      this.strength = 0
      this.hasMoved = false
    }
  }

  class Tile {
    constructor (pos) {
      this.pos = pos
      this.army = undefined
      this.city = undefined
    }
  }
  
  setupBoard()
  addClickHandlers()
})