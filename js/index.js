let coffeeData = {};
let selectedContinent = '';
let selectedCity = '';

async function loadData() {
    try {
        document.getElementById('loading').style.display = 'block'; 
        const response = await fetch('./data.json');
        coffeeData = await response.json();
        document.getElementById('loading').style.display = 'none'; 
        console.log("Data loaded successfully", coffeeData);
    } catch (error) {
        document.getElementById('loading').style.display = 'none'; 
        console.error("Error loading data:", error);
        alert("Error loading data. Please try again later.");
    }
}

loadData();

document.getElementById('nextButton').addEventListener('click', checkContinent);
document.getElementById('searchButton').addEventListener('click', findCafes);
document.getElementById('calculateButton').addEventListener('click', calculateTotal);

function capitalizeWords(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function validateInput(input, errorElementId, message) {
    if (!input || input.trim() === '') {
        document.getElementById(errorElementId).textContent = message;
        return false;
    }
    document.getElementById(errorElementId).textContent = ''; 
    return true;
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p class="error">${message}</p>`;
}

function checkContinent() {
    const continentInput = capitalizeWords(document.getElementById('continent').value.trim());
    if (!validateInput(continentInput, 'continentError', 'Please enter a valid continent.')) return;

    if (coffeeData[continentInput.toLowerCase()]) {
        selectedContinent = continentInput;
        document.getElementById('results').innerHTML = `<p>Continent "${continentInput}" found. Now enter your city.</p>`;
        document.getElementById('cityDiv').style.display = "block";
    } else {
        displayError(`No continent found by the name "${continentInput}". Available continents are: ${getAvailableContinents()}`);
    }
}

function findCafes() {
    const cityInput = capitalizeWords(document.getElementById('city').value.trim());
    if (!validateInput(cityInput, 'cityError', 'Please enter a valid city.')) return;

    const continentData = coffeeData[selectedContinent.toLowerCase()];
    if (continentData && continentData[cityInput.toLowerCase()]) {
        selectedCity = cityInput;
        const cityData = continentData[cityInput.toLowerCase()];
        const cafes = cityData.cafes;

        let resultHTML = `<h3>Coffee spots in ${cityInput}, ${selectedContinent}:</h3><ul>`;
        cafes.forEach(cafe => {
            resultHTML += `<li>${cafe}</li>`;
        });
        resultHTML += `</ul>`;
        document.getElementById('results').innerHTML = resultHTML;
        document.getElementById('quantityDiv').style.display = "block";
        animateResults();
    } else {
        displayError(`No coffee spots found in ${cityInput}, ${selectedContinent}. Please check your input.`);
    }
}

function calculateTotal() {
    const quantityInput = parseInt(document.getElementById('quantity').value, 10);
    if (!Number.isInteger(quantityInput) || quantityInput <= 0) {
        document.getElementById('quantityError').textContent = "Please enter a valid quantity.";
        return;
    } else {
        document.getElementById('quantityError').textContent = ''; 
    }

    const cityData = coffeeData[selectedContinent.toLowerCase()][selectedCity.toLowerCase()];
    const price = cityData.price;
    const totalCost = quantityInput * price;

    document.getElementById('results').innerHTML += `<p>Total cost for ${quantityInput} coffee(s): $${totalCost}.</p>`;
    console.log(`User bought ${quantityInput} coffee(s) in ${selectedCity}, ${selectedContinent} for $${totalCost}.`);

    localStorage.setItem('purchase', JSON.stringify({
        continent: selectedContinent,
        city: selectedCity,
        quantity: quantityInput,
        totalCost: totalCost
    }));
}

function animateResults() {
    gsap.from("#results", { opacity: 0, y: 20, duration: 1 });
}

function getAvailableContinents() {
    return Object.keys(coffeeData).map(continent => capitalizeWords(continent)).join(', ');
}
