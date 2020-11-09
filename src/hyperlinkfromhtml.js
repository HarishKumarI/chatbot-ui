import React from "react";
import "./styles.css";

const showdown = require("showdown");
const json2md = require("json2md");

const converter = new showdown.Converter();

const json = [
  [
    [
      {
        p:
          "Payment package. Payment through post or courier. You can send a cheque/dd/mo along with your matrimony id to any of our addresses. Please send cheques in the local currency of the office to which it is sent. [click here for addresses. ](https://www.bharatmatrimony.com/contact-us.php)   payments sent to india  cheque or dd to be taken in favour of consim info pvt ltd. Indian offices. For paid registration, login to [www.bharatmatrimony.com](https://www.bharatmatrimony.com). Provide name, age, gender, e-mail id. Click on register link and you will have to enter details of the person intending to get married. Choose package for the required period. Click on join now link and you will find a page on which you could enter the details of the person intending to get married. You shall have a matrimony id generated for further references and login purposes. "
      }
    ],
    [
      {
        p:
          "For free registration, login to [www.bharatmatrimony.com](https://www.bharatmatrimony.com). Provide name, age, gender, e-mail id. Click on register link and you will have to enter on a couple of pages the details of the person intending to get married. After you submit your information, your profile will be automatically created and you shall be given a matrimony id generated for future references and login purposes. "
      }
    ]
  ]
];

let answerElement = converter.makeHtml(json2md(json));
answerElement = answerElement.replace(
  /<a href="/g,
  '<a target="_blank" href="'
);

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      links: [],
      link_details: []
    };

    this.getDetails = this.getDetails.bind(this);
  }

  componentDidMount() {
    const regex = /<a(?<link>[^>]+)>(?<text>(?:.(?!<\/a>))*.)<\/a>/g;
    const match = answerElement.match(regex);
    const links = {};
    match.forEach((anchor_tag) => {
      const text = anchor_tag.substring(
        anchor_tag.indexOf(">") + 1,
        anchor_tag.substr(1).indexOf("<") + 1
      );

      const href_index = anchor_tag.indexOf('href="');
      const href_text = anchor_tag.substr(href_index + 6);

      links[href_text.substring(0, href_text.indexOf('"'))] = text;
    });

    this.setState({ links });

    // console.log(links);

    Object.keys(links).forEach((link) => {
      this.getDetails(link);
    });
  }

  async getDetails(link) {
    await fetch(link)
      .then((data) => data.text())
      .then((data) => {
        let newDoc = document.createElement("document");
        newDoc.innerHTML = data;
        let favicon_link = "";
        let desc = "";
        Array.from(newDoc.getElementsByTagName("link")).forEach((link) => {
          if (link.rel === "icon") {
            favicon_link = link.href;
          }
        });

        Array.from(newDoc.getElementsByTagName("meta")).forEach((meta) => {
          if (meta.name === "description") {
            desc = meta.content;
          }
        });

        let { link_details } = this.state;
        link_details.push({
          icon: favicon_link,
          title: newDoc.getElementsByTagName("title")[0].innerText,
          desc: desc,
          link: link
        });
        // console.log(
        //   favicon_link +
        //     "\n" +
        //     desc +
        //     "\n" +
        //     newDoc.getElementsByTagName("title")[0].innerText
        // );
        this.setState({ link_details });
      });
  }

  render() {
    return (
      <div className="App">
        <div dangerouslySetInnerHTML={{ __html: answerElement }} />
        <ul>
          {this.state.link_details.map((link_data, idx) => {
            return (
              <li key={idx}>
                <a href={link_data.link} target="_blank" rel="noreferrer">
                  <div>
                    {link_data.icon !== "" ? (
                      <img
                        src={link_data.icon}
                        width="30px"
                        height="30px"
                        alt="img"
                      />
                    ) : null}
                  </div>
                  <div>
                    <div className="title">{link_data.title}</div>
                    {/* <div className="link">{link_data.icon}</div> */}
                    <div className="desc">{link_data.desc}</div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}



// read more and less html
// import React, { useState } from "react";
// import "./styles.css";

// const json2md = require("json2md");
// const showdown = require("showdown");

// const converter = new showdown.Converter({ noHeaderId: "true" });
// const markdownJson = [
//   { p: "Alto STD" },
//   { p: "Alto STD (O)" },
//   { p: "Alto LXi" },
//   { p: "Alto LXi (O)" },
//   { p: "Alto VXi" },
//   { p: "Alto VXi Plus" },
//   { p: "Alto LXi (O) CNG" },
//   { p: "Alto LXi CNG" }
// ];

// export default function App() {
//   const [readMore, setreadMore] = useState(false);

//   const html = converter.makeHtml(json2md(markdownJson));
//   let dom = document.createElement("div");
//   dom.innerHTML = html;

//   return (
//     <div className="App">
//       <div
//         dangerouslySetInnerHTML={{
//           __html: Array.from(dom.children)
//             .slice(0, readMore ? dom.children.length : 5)
//             .map((tag) => {
//               return tag.outerHTML;
//             })
//             .join("\n")
//         }}
//       />
//       <a href="#/" onClick={(e) => setreadMore(!readMore)}>
//         {readMore ? "Less" : "More"}...
//       </a>
//     </div>
//   );
// }
