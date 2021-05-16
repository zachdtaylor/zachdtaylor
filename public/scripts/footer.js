import { e } from "/scripts/react-helpers.js"

function Footer() {
  return e(React.Fragment, null, [
    e("p", null, [
      e("a", { href: "https://twitter.com/_zachdtaylor" }, "Twitter"),
      "\xA0\u2022\xA0",
      e("a", { href: "https://github.com/zachtylr21" }, "GitHub"),
      "\xA0\u2022\xA0",
      e(
        "a",
        {
          href: "https://www.linkedin.com/in/%F0%9F%9A%80-zach-taylor-82410b129/",
        },
        "LinkedIn"
      ),
    ]),
    e("p", { className: "copyright" }, "\xA9 2021 Zach Taylor"),
  ])
}

ReactDOM.render(e(Footer), document.getElementById("footer"))
