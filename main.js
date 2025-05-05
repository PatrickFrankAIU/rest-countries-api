// Base URL for REST Countries API
const API_URL = "https://restcountries.com/v3.1";

// DOM Elements
let searchButton = document.getElementById("searchButton");
let countryInput = document.getElementById("countryInput");
let regionFilter = document.getElementById("regionFilter");
let loadingElement = document.getElementById("loading");
let errorMessageElement = document.getElementById("errorMessage");
let countryDetailsElement = document.getElementById("countryDetails");
let countriesListElement = document.getElementById("countriesList");
let notFoundElement = document.getElementById("notFound");

// Country info elements
let countryFlag = document.getElementById("countryFlag");
let countryName = document.getElementById("countryName");
let countryCapital = document.getElementById("countryCapital");
let countryRegion = document.getElementById("countryRegion");
let countryPopulation = document.getElementById("countryPopulation");
let countryLanguages = document.getElementById("countryLanguages");
let countryCurrencies = document.getElementById("countryCurrencies");
let countryBorders = document.getElementById("countryBorders");

// Add event listeners when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Make sure country details are completely hidden initially
    hideCountryDetails();
    
    // Ensure the flag image doesn't show a broken link
    countryFlag.style.display = "none";
    countryFlag.src = "";
    
    // Load all countries when the page loads
    getAllCountries();
    
    // Add click event listener to search button
    searchButton.addEventListener("click", searchCountry);
    
    // Add keypress event for Enter key in search input
    countryInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchCountry();
        }
    });
    
    // Add change event for region filter
    regionFilter.addEventListener("change", filterByRegion);
});

// Function to get all countries
async function getAllCountries() {
    // Show loading indicator
    showLoading();
    
    // Make sure country details are hidden initially
    hideCountryDetails();
    hideNotFound();
    clearErrorMessage();
    
    try {
        // Fetch all countries from the API
        let response = await fetch(API_URL + "/all");
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        // Parse the JSON data
        let countries = await response.json();
        
        // Display countries in the grid
        displayCountriesGrid(countries);
        
        // Hide loading
        hideLoading();
    } catch (error) {
        // Hide loading and show error
        hideLoading();
        showError("An error occurred: " + error.message);
    }
}

// Function to search for a country by name
async function searchCountry() {
    // Get the search term from input
    let searchTerm = countryInput.value.trim();
    
    // Check if search term is empty
    if (searchTerm === "") {
        getAllCountries();
        return;
    }
    
    // Show loading, hide results and errors
    showLoading();
    hideCountryDetails();
    hideNotFound();
    clearErrorMessage();
    
    try {
        // Create the API URL with search parameters
        let url = API_URL + "/name/" + encodeURIComponent(searchTerm);
        
        // Fetch data from the API
        let response = await fetch(url);
        
        // Check if the country was found
        if (!response.ok) {
            hideLoading();
            showNotFound();
            return;
        }
        
        // Parse the JSON data
        let countries = await response.json();
        
        // Display countries in the grid
        displayCountriesGrid(countries);
        
        // Hide loading
        hideLoading();
    } catch (error) {
        hideLoading();
        showError("An error occurred: " + error.message);
    }
}

// Function to filter countries by region
async function filterByRegion() {
    // Get the selected region
    let region = regionFilter.value;
    
    // If no region is selected, show all countries
    if (region === "") {
        getAllCountries();
        return;
    }
    
    // Show loading, hide results and errors
    showLoading();
    hideCountryDetails();
    hideNotFound();
    clearErrorMessage();
    
    try {
        // Create the API URL with region parameter
        let url = API_URL + "/region/" + encodeURIComponent(region);
        
        // Fetch data from the API
        let response = await fetch(url);
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        // Parse the JSON data
        let countries = await response.json();
        
        // Display countries in the grid
        displayCountriesGrid(countries);
        
        // Hide loading
        hideLoading();
    } catch (error) {
        hideLoading();
        showError("An error occurred: " + error.message);
    }
}

// Function to display countries in a grid
function displayCountriesGrid(countries) {
    // Clear the countries list
    countriesListElement.innerHTML = "";
    
    // Check if there are countries to display
    if (countries.length === 0) {
        showNotFound();
        return;
    }
    
    // Loop through each country and create a card
    countries.forEach((country) => {
        // Create a card element
        let card = document.createElement("div");
        card.className = "country-card";
        
        // Make the card clickable to show country details
        card.addEventListener("click", () => {
            displayCountryDetails(country);
        });
        
        // Set card content with flag and basic info
        card.innerHTML = "<img src='" + country.flags.png + "' alt='" + country.name.common + " flag'>" +
            "<div class='country-card-info'>" +
            "<h3>" + country.name.common + "</h3>" +
            "<p><strong>Capital:</strong> " + (country.capital && country.capital.length > 0 ? country.capital[0] : "N/A") + "</p>" +
            "<p><strong>Population:</strong> " + formatNumber(country.population) + "</p>" +
            "</div>";
        
        // Add the card to the grid
        countriesListElement.appendChild(card);
    });
}

// Function to display detailed information about a country
function displayCountryDetails(country) {
    // Set flag image and make it visible
    countryFlag.src = country.flags.png;
    countryFlag.alt = country.name.common + " flag";
    countryFlag.style.display = "block";
    
    // Set country name
    countryName.textContent = country.name.common;
    
    // Set capital
    countryCapital.textContent = country.capital && country.capital.length > 0 ? country.capital[0] : "N/A";
    
    // Set region and subregion
    countryRegion.textContent = country.region + (country.subregion ? ", " + country.subregion : "");
    
    // Set population with formatted number
    countryPopulation.textContent = formatNumber(country.population);
    
    // Set languages
    if (country.languages) {
        let languagesList = Object.values(country.languages).join(", ");
        countryLanguages.textContent = languagesList;
    } else {
        countryLanguages.textContent = "N/A";
    }
    
    // Set currencies
    if (country.currencies) {
        let currenciesList = [];
        for (let code in country.currencies) {
            if (country.currencies[code].name) {
                currenciesList.push(country.currencies[code].name + " (" + (country.currencies[code].symbol || code) + ")");
            }
        }
        countryCurrencies.textContent = currenciesList.join(", ");
    } else {
        countryCurrencies.textContent = "N/A";
    }
    
    // Set borders
    if (country.borders && country.borders.length > 0) {
        countryBorders.textContent = country.borders.join(", ");
    } else {
        countryBorders.textContent = "None";
    }
    
    // Show the details section
    countryDetailsElement.classList.remove("hidden");
    
    // Scroll to details
    countryDetailsElement.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Function to format numbers with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to show loading state
function showLoading() {
    loadingElement.classList.remove("hidden");
}

// Function to hide loading state
function hideLoading() {
    loadingElement.classList.add("hidden");
}

// Function to show error message
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove("hidden");
}

// Function to clear error message
function clearErrorMessage() {
    errorMessageElement.textContent = "";
    errorMessageElement.classList.add("hidden");
}

// Function to hide country details
function hideCountryDetails() {
    countryDetailsElement.classList.add("hidden");
    // Also explicitly hide the flag image to prevent broken links
    countryFlag.style.display = "none";
}

// Function to show not found message
function showNotFound() {
    notFoundElement.classList.remove("hidden");
}

// Function to hide not found message
function hideNotFound() {
    notFoundElement.classList.add("hidden");
}
