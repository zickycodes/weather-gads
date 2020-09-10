const App = {
  searchBox: document.querySelector("#searchbox"),
  locationName: document.querySelector(".location h3"),
  date: document.querySelector(".date"),
  temp: document.querySelector(".temperature"),
  weather: document.querySelector(".weather"),
  range: document.querySelector(".hi-lo"),
  searchBtn: document.querySelector("#searchBtn"),
  loader: document.querySelector(".loader"),
  tsbx: document.querySelector(".toastbox"),
  daily: document.querySelector(".daily-weather-container"),
  icon: document.querySelector(".icon"),
  store: JSON.parse(localStorage.getItem("oweather")),
  recentSearch: document.querySelector(".recent-search"),
  sideToggle: document.querySelector(".side-toggle"),
  side: document.querySelector(".side"),
  sideOverlay: document.querySelector(".side-overlay"),
  details: document.querySelector("details"),
  clear: document.querySelector(".clear"),
  api: {
    key:"d5c5f62780a4d329efe68c35e32ec2a7",
    baseurl: "https://api.openweathermap.org/data/2.5/",
    dataurl:
      "https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,daily&appid={ YOUR API KEY }",
  },

  async fetchWeather(searchterm) {
    this.searchBox.value = "";
    try {
      this.loader.style.display = "flex";
      let response = await fetch(
        `${this.api.baseurl}weather?q=${searchterm}&units=metric&APPID=${this.api.key}`
      );
      let data = await response.json();
      if (data.cod == 404 || data.cod == 400) {
        this.showToast(data.message, "brickred");
        this.loader.style.display = "none";
      } else {
        this.store.push(searchterm);
        localStorage.setItem("oweather", JSON.stringify(this.store));
        this.checkStore();
        this.displayCurrentResults(data);

        this.fetchComplete(data.coord);
        this.loader.style.display = "none";
      }
    } catch (error) {
      console.log(error);
      this.showToast("Your internet may be disconnected, please retry", "red");
      this.loader.style.display = "none";
    }
  },

  async fetchComplete(coord) {
    try {
      let api = `${this.api.baseurl}onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly&units=metric&appid=${this.api.key}`;
      let response = await fetch(api);
      let data = await response.json();
      if (data.cod == 404 || data.cod == 400) {
        this.showToast(data.message, "brickred");
      } else {
        this.displayDailyResults(data);
      }
    } catch (error) {
      console.log(error);
      this.showToast(error, "red");
    }
  },

  displayCurrentResults(data) {
    this.locationName.innerText = data.name + ", " + data.sys.country;
    let now = new Date();
    this.date.innerText = this.builddate(now);
    this.temp.innerHTML = `${Math.round(data.main.temp)}<span>&deg;C</span>`;
    this.weather.innerText = data.weather[0].description;
    this.icon.innerHTML = `<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" />`;
    this.range.innerHTML = `${data.main.temp_min}<span>&deg;</span>C / ${data.main.temp_max}<span>&deg;</span>C`;
  },

  displayDailyResults(data) {
    this.daily.innerHTML = "";
    data.daily.forEach((res) => {
      let li = document.createElement("li");
      li.innerHTML = `
      <div class="daily-date">${this.builddate(new Date(res.dt * 1000))}</div>
      <div class="daily-icon">
      <img src="https://openweathermap.org/img/w/${res.weather[0].icon
      }.png"/>
      </div>
      <div class="daily-weather-desc">${res.weather[0].description}</div>
      <div class="daily-hi-lo">${res.temp.min}<span>&deg;</span>C / ${
        res.temp.max
      }<span>&deg;</span>C</div>
      `;
      this.daily.appendChild(li);
    });
  },
  builddate(d) {
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    return `${day} ${date} ${month} ${year}`;
  },
  mapRecent(store) {
    this.recentSearch.innerHTML = "";
    const unique = (value, index, self) => {
      return self.indexOf(value) === index;
    };

    store.filter(unique).forEach((item) => {
      let li = document.createElement("li");
      li.textContent = item;
      this.recentSearch.appendChild(li);
    });
  },
  checkStore() {
    let dt = JSON.parse(localStorage.getItem("oweather"));
    if (dt !== null) {
      this.store = dt;
      this.mapRecent(dt);
    } else {
      this.recentSearch.innerHTML = "";
    }
  },
  startApp() {
    if (this.store !== null) {
      this.mapRecent(this.store);
    } else {
      this.store = [];
    }

    this.searchBox.addEventListener("keypress", (event) => {
      if (
        (this.searchBox.value !== "" && event.keyCode == 13) ||
        (this.searchBox.value !== "" && event.key == "Enter")
      ) {
        this.fetchWeather(this.searchBox.value);
      }
    });

    this.searchBtn.addEventListener("click", () => {
      if (this.searchBox.value === "") {
        return;
      } else {
        this.fetchWeather(this.searchBox.value);
      }
    });
    this.sideToggle.addEventListener("click", () => {
      this.toggleSide();
    });
    this.sideOverlay.addEventListener("click", () => {
      this.toggleSide();
    });
    this.side.addEventListener("click", (e) => {
            e.stopPropagation();

      this.handleSideClick(e);
    }, false);
    this.clear.addEventListener("click", () => {
      this.clearStore();
    });
  },
  showToast(msg, color) {
    const toastbx = document.createElement("div");
    toastbx.classList.add("toastbx");
    toastbx.textContent = msg;
    toastbx.style.backgroundColor = color;
    this.tsbx.appendChild(toastbx);
    requestAnimationFrame(() => toastbx.classList.add("sh-toastbx"));
    setTimeout(() => {
      requestAnimationFrame(() => {
        toastbx.classList.remove("sh-toastbx");
      });
      setTimeout(() => {
        requestAnimationFrame(() => this.tsbx.removeChild(toastbx));
      }, 500);
    }, 3300);
  },
  toggleSide() {
    this.details.open = true;
    this.side.classList.toggle("show-side");
    this.sideOverlay.classList.toggle("show-overlay");
  },
  handleSideClick(e) {
    if (e.target.tagName == "LI") {
      this.fetchWeather(e.target.textContent);
      if (this.side.classList.contains('show-side') && this.sideOverlay.classList.contains('show-overlay')) {
            this.side.classList.remove("show-side");
            this.sideOverlay.classList.remove("show-overlay");
      }
    }
  },
  clearStore() {
    localStorage.removeItem("oweather");
    this.checkStore();
  },
};
App.startApp();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}
