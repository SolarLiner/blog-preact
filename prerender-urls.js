const { generateFileList } = require("./src/crawler");
const { join } = require("path");
const fs = require("fs");
const parseMD = require("parse-md").default;


/*
const [blogs] = generateFileList(join(__dirname, "content")).nodes;
module.exports = () => {
  const pages = [
    {
      url: "/",
      seo: {
        cover: "/assets/profile.jpg"
      },
      data: blogs
    },
    { url: "/blogs/", data: blogs },
    { url: "/contact/" },
    { url: "/contact/success" }
  ];

  // adding all blog pages
  pages.push(
    ...blogs.edges.map(blog => {
      let data;
      if (blog.format === "md") {
        const { content } = parseMD(fs.readFileSync(join("content", "blog", blog.id), "utf-8"));
        data = content;
      }
      else {
        data = fs.readFileSync(join("content", "blog", blog.id), "utf-8").replace(/---(.*(\r)?\n)*---/, "");
      }
      return {
        url: `/blogs/${blog.id}`,
        seo: blog.details,
        data: {
          details: blog.details,
          content: data
        }
      };
    })
  );

  return pages;
};
*/

module.exports = async () => {
  require("ts-node/register");
  const data = await require("./crawler").default(join(__dirname, "content", "blog"));
  const blogs = data.map(({ filename, ...f }) => ({ ...f, blogTitle: f.title, url: join("/blogs", f.id) }));
  return [
    { url: "/", blogs },
    { url: "/blogs", blogs },
    ...blogs
  ];
};
