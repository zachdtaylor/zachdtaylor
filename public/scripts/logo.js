import { e } from "/scripts/react-helpers.js"

function Logo() {
  return e(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "-3 -3 18 18",
      className: "logo",
    },
    [
      e("polygon", {
        points: "9.59,-.41 -.41,9.59 2.41,12.41 12.41,2.41",
        className: "inner",
      }),
      e("circle", { cx: "1", cy: "1", r: "2", className: "outer" }),
      e("circle", { cx: "11", cy: "1", r: "2", className: "outer" }),
      e("circle", { cx: "1", cy: "11", r: "2", className: "outer" }),
      e("circle", { cx: "11", cy: "11", r: "2", className: "outer" }),
      e("polygon", { points: "1,-1 11,-1 11,3 1,3", className: "outer" }),
      e("polygon", { points: "1,9 11,9 11,13 1,13", className: "outer" }),
    ]
  )
}

ReactDOM.render(e(Logo), document.getElementById("logo"))
