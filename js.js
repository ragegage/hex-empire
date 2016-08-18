document.addEventListener("DOMContentLoaded", () => {
  setupBoard()
})

const setupBoard = () => {
  $parent = $(".board")
  for(let i = 0; i < 6; i++){
    let $ul = $("<ul></ul>")
    $ul.addClass("row")
    $parent.append($ul)
    for(let j = 0; j < 12; j++){
      let $li = $("<li></li>")
      $li.addClass("hex") 
      $ul.append($li)
    }
  }
}