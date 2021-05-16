MathJax = {
  tex: {
    inlineMath: {
      "[+]": [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
    },
  },
}

document.addEventListener("zero-md-rendered", function (e) {
  MathJax.typeset()
})
