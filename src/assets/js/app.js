const $list = document.getElementById("list");
const $pagination = document.getElementById("pagination");
const $progressBar = document.getElementById("progress-bar");
const $heading = document.getElementById("heading");
const $formInfo = document.getElementById("form-info");
const api = "https://swapi.dev/api/";
const fieldsUrls = [
  "species",
  "homeworld",
  "starships",
  "vehicles",
  "films",
  "pilots",
  "people",
  "characters",
  "planets",
  "residents"
];

// set all events listeners
document.addEventListener("click", e => {
  // fetch list and render
  if (e.target.closest("[data-url]")) {
    const target = e.target.closest("[data-url]");
    const url = target.getAttribute("data-url");
    const heading = target.getAttribute("data-heading") || $heading.textContent;
    fetchProgress(fetchData(url), data => {
      listRender(data, heading);
      // pagination render
      if (
        target.getAttribute("data-card") &&
        data.count > data.results.length
      ) {
        $pagination.innerHTML = "";
        paginationRender(data);
      }
    });
    // reset active dot
    if (target.classList.contains("dot")) {
      const active = $pagination.querySelector(".active");
      active.classList.remove("active");
      target.classList.add("active");
    }
  }
  // close form info by click outside it
  if (
    !$formInfo.classList.contains("hidden") &&
    !e.target.closest("#form-info") &&
    !e.target.closest("[data-info-url]")
  ) {
    $formInfo.classList.add("hidden");
  }
  // fetch main list
  if (e.target.closest("[data-type='home']")) {
    fetchProgress(fetchData(api), homePageRender);
  }
  //fetch info
  if (e.target.closest("[data-info-url]")) {
    const urls = e.target
      .closest("[data-info-url]")
      .getAttribute("data-info-url");
    fetchProgress(fetchAllData(urls), infoRender);
  }
});
// the first letters of all words are capitalized
function toCamelCase(str) {
  const arrStr = str.split(" ");
  const result = arrStr.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return result.join(" ");
}
// the first letter of first word is capitalized
function formatFieldName(fieldName) {
  const words = fieldName.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
// ------ Templates ------//
const buttonInfoTemplate = (text, urls) => {
  let queries = [];
  !Array.isArray(urls) ? queries.push(urls) : (queries = urls);
  return `
    <button
      data-info-url=${JSON.stringify(queries)}
      class="middle w-max none center rounded-xl p-4 bg-gradient-to-tr from-pink-600 to-deep-purple-900 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
      ${text}
    </button>`;
};

function itemTemplate(item) {
  const buttons = [];
  for (let key in item) {
    if (item[key] === null) continue;
    if (fieldsUrls.includes(key) && item[key].length !== 0) {
      buttons.push(buttonInfoTemplate(formatFieldName(key), item[key]));
    }
  }
  buttons.push(buttonInfoTemplate("Info", item.url));
  return `
     <li class='bg-gray-100 bg-opacity-10 px-4 backdrop-blur-lg backdrop-saturate-200 relative flex w-full flex-col rounded-xl bg-transparent backdrop-filter bg-clip-border text-gray-700 shadow shadow-deep-purple-700'>
      <h5 class='p-6 mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-500 antialiased'>
        ${item.name || item.title} 
      </h5>
      <div class='p-6 pt-0 flex flex-wrap gap-2'>
         ${buttons.join(" ")}
      </div>
    </li> `;
}

function mainCardTemplate(name, url) {
  return `
     <li class="relative flex w-full flex-col rounded-xl bg-transparent backdrop-filter bg-clip-border text-gray-700 shadow shadow-deep-purple-700">
      <h5
        class="mb-2 p-6 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-500 antialiased">
        ${name}
      </h5>
      <button
        data-url="${url}"
        data-heading="${name}"
        data-card="true"
        class="m-4 middle none center rounded-lg bg-gradient-to-tr from-pink-600 to-deep-purple-900 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40">
        Show More
      </button>
    </li>`;
}

function paginationDotTemplate(url, num, isActive = false) {
  return `
    <li>
      <button
        class="${
          isActive && "active"
        } dot mx-1 flex h-9 w-9 items-center justify-center rounded-full border border-blue-gray-100 bg-transparent p-0 text-sm text-blue-gray-500 transition duration-150 ease-in-out hover:bg-light-300"
        data-url="${url}" >
        ${num}
      </button>
    </li>`;
}
// ------ Render ------//
function paginationRender(data) {
  const length = Math.ceil(data.count / data.results.length);
  for (let i = 1; i <= length; i++) {
    const url = data.next.slice(0, -1) + i;
    $pagination.insertAdjacentHTML(
      "beforeend",
      paginationDotTemplate(url, i, i === 1)
    );
  }
}

function listRender(data, heading) {
  $heading.textContent = heading;
  $list.innerHTML = "";
  for (let i = 0; i < data.results.length; i++) {
    $list.insertAdjacentHTML("beforeend", itemTemplate(data.results[i]));
  }
}

function infoRender(data) {
  const describe = $formInfo.querySelector("p");
  describe.innerHTML = "";
  data.forEach(item => {
    const $wrapper = document.createElement("p");
    const { created, edited, url, opening_crawl, ...info } = item;
    for (let key in info) {
      if (info[key] === "") continue;
      if (!fieldsUrls.includes(key)) {
        const $p = document.createElement("p");
        $p.textContent = `${formatFieldName(key)}: ${item[key]}`;
        $wrapper.append($p);
      }
    }
    describe.append($wrapper);
  });
  $formInfo.classList.remove("hidden");
}

function homePageRender(data) {
  $heading.textContent = "Home";
  $list.innerHTML = "";
  $pagination.innerHTML = "";
  for (let key in data) {
    $list.insertAdjacentHTML(
      "beforeend",
      mainCardTemplate(toCamelCase(key), data[key])
    );
  }
}
// ------ fetch Data ------//
function fetchData(url) {
  return new Promise((resolve, reject) => {
    $progressBar.classList.add("loaded");
    axios
      .get(url)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function fetchAllData(urls) {
  let queries = JSON.parse(urls);
  const dataPromises = queries.map(url => fetchData(url));
  return Promise.all(dataPromises);
}

function fetchProgress(fetchFunc, successFunc) {
  fetchFunc
    .then(data => {
      $progressBar.classList.add("completed");
      successFunc(data);
    })
    .then(() => {
      $progressBar.classList.remove("loaded");
      setTimeout(() => $progressBar.classList.remove("completed"), 500);
    })
    .catch(err => {
      $progressBar.classList.remove("loaded");
      $progressBar.classList.remove("completed");
      console.error(err);
    });
}
// init Home Page
fetchProgress(fetchData(api), homePageRender);
