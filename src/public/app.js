"use strict";
import Exams from "./views/Exams.js";
import ExamView from "./views/ExamView.js";

const parsePath = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
// copied from stack overflow -> purpose of regex is to parse the url route to check for exam ID parameters

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );
  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};

const router = async () => {
  const routes = [
    { path: "/", view: Exams },
    { path: "/exams", view: Exams },
    { path: "/exams/:id", view: ExamView },
  ];
  const matches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(parsePath(route.path)),
    };
  });
  let match = matches.find((potentialMatch) => potentialMatch.result !== null);
  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }
  console.log(location.search);
  const [ sorted, val ] = location.search.split("=")
  const params = getParams(match);
  params.sorted = val;
  const view = new match.route.view(params);
  document.querySelector("#app").innerHTML = await view.getHtml();
};

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }

  });
  router();
});

window.addEventListener("popstate", router); // for back/forward buttons in browser
