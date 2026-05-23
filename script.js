const endpoints = {
  dog: "https://dog.ceo/api/breeds/image/random",
  cat: "https://api.thecatapi.com/v1/images/search",
  joke: "https://v2.jokeapi.dev/joke/Any?safe-mode",
  advice: "https://api.adviceslip.com/advice",
};

const fallbackPoster =
  "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";

const setStatus = (id, message, isError = false) => {
  const status = document.querySelector(id);
  status.textContent = isError ? message : "";
  status.classList.toggle("error", isError);
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

const stripHtml = (html = "") => {
  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = html;
  return temporaryElement.textContent || "No summary available.";
};

const loadDog = async () => {
  setStatus("#dog-status", "");

  try {
    const data = await fetchJson(endpoints.dog);
    document.querySelector("#dog-image").src = data.message;
    setStatus("#dog-status", "");
  } catch (error) {
    setStatus("#dog-status", "Could not load a dog photo. Try again.", true);
    console.error(error);
  }
};

const loadCat = async () => {
  setStatus("#cat-status", "");

  try {
    const [cat] = await fetchJson(endpoints.cat);
    document.querySelector("#cat-image").src = cat.url;
    setStatus("#cat-status", "");
  } catch (error) {
    setStatus("#cat-status", "Could not load a cat photo. Try again.", true);
    console.error(error);
  }
};

const loadWeather = async (city = "New York") => {
  const output = document.querySelector("#weather-output");
  setStatus("#weather-status", "");
  output.innerHTML = "";

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;
    const geoData = await fetchJson(geoUrl);
    const location = geoData.results?.[0];

    if (!location) {
      throw new Error("City not found");
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const weatherData = await fetchJson(weatherUrl);
    const current = weatherData.current;

    output.innerHTML = `
      <p class="big-number">${Math.round(current.temperature_2m)}&deg;F</p>
      <p class="detail">${location.name}, ${location.country}</p>
      <p class="detail">Wind speed: ${Math.round(current.wind_speed_10m)} mph</p>
    `;
    setStatus("#weather-status", "");
  } catch (error) {
    setStatus("#weather-status", "Could not load weather for that city.", true);
    console.error(error);
  }
};

const loadCurrency = async (amount = 100) => {
  const output = document.querySelector("#currency-output");
  setStatus("#currency-status", "");
  output.innerHTML = "";

  try {
    const data = await fetchJson("https://open.er-api.com/v6/latest/USD");
    const rate = data.rates.EUR;
    const euros = Number(amount) * rate;

    output.innerHTML = `
      <p class="big-number">&euro;${euros.toFixed(2)}</p>
      <p class="detail">$${Number(amount).toFixed(2)} USD equals ${euros.toFixed(
      2
    )} EUR at a rate of ${rate.toFixed(4)}.</p>
      <p class="detail">Last updated: ${new Date(data.time_last_update_utc).toLocaleDateString()}</p>
    `;
    setStatus("#currency-status", "");
  } catch (error) {
    setStatus("#currency-status", "Could not load the exchange rate.", true);
    console.error(error);
  }
};

const loadGitHubUser = async (username = "octocat") => {
  const output = document.querySelector("#github-output");
  setStatus("#github-status", "");
  output.innerHTML = "";

  try {
    const user = await fetchJson(`https://api.github.com/users/${username}`);
    output.innerHTML = `
      <div class="profile-row">
        <img class="avatar" src="${user.avatar_url}" alt="${user.login}'s avatar" />
        <div>
          <p class="profile-name">${user.name || user.login}</p>
          <p class="detail">@${user.login}</p>
          <a href="${user.html_url}" target="_blank" rel="noreferrer">View profile</a>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><strong>${user.public_repos}</strong>Repos</div>
        <div class="stat"><strong>${user.followers}</strong>Followers</div>
      </div>
    `;
    setStatus("#github-status", "");
  } catch (error) {
    setStatus("#github-status", "Could not find that GitHub user.", true);
    console.error(error);
  }
};

const loadJoke = async () => {
  const output = document.querySelector("#joke-output");
  setStatus("#joke-status", "");
  output.textContent = "";

  try {
    const joke = await fetchJson(endpoints.joke);
    output.textContent =
      joke.type === "single" ? joke.joke : `${joke.setup} ${joke.delivery}`;
    setStatus("#joke-status", "");
  } catch (error) {
    setStatus("#joke-status", "Could not load a joke. Try again.", true);
    console.error(error);
  }
};

const loadAdvice = async () => {
  const output = document.querySelector("#advice-output");
  setStatus("#advice-status", "");
  output.textContent = "";

  try {
    const data = await fetchJson(`${endpoints.advice}?timestamp=${Date.now()}`);
    output.textContent = data.slip.advice;
    setStatus("#advice-status", "");
  } catch (error) {
    setStatus("#advice-status", "Could not load advice. Try again.", true);
    console.error(error);
  }
};

const loadShow = async (query = "stranger things") => {
  const output = document.querySelector("#show-output");
  setStatus("#show-status", "");
  output.innerHTML = "";

  try {
    const [result] = await fetchJson(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
    );

    if (!result) {
      throw new Error("Show not found");
    }

    const { show } = result;
    const rating = show.rating.average ? `${show.rating.average}/10` : "No rating yet";

    output.innerHTML = `
      <div class="show-row">
        <img class="poster" src="${show.image?.medium || fallbackPoster}" alt="${show.name} poster" />
        <div>
          <p class="show-name">${show.name}</p>
          <p class="detail">${show.genres.slice(0, 3).join(", ") || "Genre unknown"}</p>
          <a href="${show.url}" target="_blank" rel="noreferrer">View on TVMaze</a>
        </div>
      </div>
      <p class="detail"><strong>Rating:</strong> ${rating}</p>
      <p class="detail">${stripHtml(show.summary).slice(0, 170)}...</p>
    `;
    setStatus("#show-status", "");
  } catch (error) {
    setStatus("#show-status", "Could not find that show.", true);
    console.error(error);
  }
};

const loadAll = () => {
  loadDog();
  loadCat();
  loadWeather(document.querySelector("#city-input").value.trim() || "New York");
  loadCurrency(document.querySelector("#usd-input").value || 100);
  loadGitHubUser(document.querySelector("#github-input").value.trim() || "octocat");
  loadJoke();
  loadAdvice();
  loadShow(document.querySelector("#show-input").value.trim() || "stranger things");
};

document.querySelector("#refresh-all").addEventListener("click", loadAll);

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const loaders = {
      dog: loadDog,
      cat: loadCat,
      joke: loadJoke,
      advice: loadAdvice,
    };

    loaders[action]();
  });
});

document.querySelector("#weather-form").addEventListener("submit", (event) => {
  event.preventDefault();
  loadWeather(document.querySelector("#city-input").value.trim() || "New York");
});

document.querySelector("#currency-form").addEventListener("submit", (event) => {
  event.preventDefault();
  loadCurrency(document.querySelector("#usd-input").value || 100);
});

document.querySelector("#github-form").addEventListener("submit", (event) => {
  event.preventDefault();
  loadGitHubUser(document.querySelector("#github-input").value.trim() || "octocat");
});

document.querySelector("#show-form").addEventListener("submit", (event) => {
  event.preventDefault();
  loadShow(document.querySelector("#show-input").value.trim() || "stranger things");
});

loadAll();
