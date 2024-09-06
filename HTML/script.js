const apiUrl = 'https://pokeapi.co/api/v2/';
let currentPage = 1;

// Define a mapping between Pokémon types and background colors
const typeColors = {
    fire: '#FF7F50',
    water: '#87CEEB',
    grass: '#98FB98',
    electric: '#FFD700',
    ice: '#ADD8E6',
    fighting: '#FA8072',
    poison: '#DDA0DD',
    ground: '#DEB887',
    flying: '#87CEFA',
    psychic: '#ffe0e9',
    bug: '#A2CD5A',
    rock: '#BDB76B',
    ghost: '#DA70D6',
    dragon: '#c2c2c2',
    dark: '#A9A9A9',
    steel: '#C0C0C0',
    fairy: '#FFB6C1',
    normal: '#D3D3D3'
};

// Fetch a random Pokémon
function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1024) + 1;
    const url = `${apiUrl}pokemon/${randomId}`;

    fetch(url)
        .then(response => response.json())
        .then(pokemon => {
            document.getElementById('random-pokemon-img').src = pokemon.sprites.other.home.front_default;
            document.getElementById('random-pokemon-name').textContent = capitalizeFirstLetter(pokemon.name);
            document.getElementById('random-pokemon').setAttribute('onclick', `showPokemonDetails(${pokemon.id})`);
        })
        .catch(error => {
            console.error('Error fetching random Pokémon:', error);
        });
}

// Fetch Pokémon by name
function fetchPokemonByName() {
    const pokemonName = document.getElementById('pokemon-search').value.toLowerCase();
    const url = `${apiUrl}pokemon/${pokemonName}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Pokémon not found');
            }
        })
        .then(data => {
            displayPokemon([data]);
        })
        .catch(error => {
            alert(error.message);
        });
}

document.getElementById('pokemon-search').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        fetchPokemonByName();
    }
});

// Filter Pokémon by type
function filterByType(type) {
    const url = `${apiUrl}type/${type}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const promises = data.pokemon.slice(0, 50).map(p => fetch(p.pokemon.url).then(res => res.json()));
            return Promise.all(promises);
        })
        .then(pokemons => {
            displayPokemon(pokemons);
        })
        .catch(error => {
            alert('Error fetching Pokémon by type');
            console.error(error);
        });
}

// Fetch all Pokémon for the current page
function fetchAllPokemons() {
    const promises = [];
    const startId = (currentPage - 1) * 25 + 1;
    const endId = startId + 24;

    for (let i = startId; i <= endId; i++) {
        promises.push(fetch(`${apiUrl}pokemon/${i}`).then(res => res.json()));
    }

    Promise.all(promises)
        .then(pokemons => {
            displayPokemon(pokemons);
        })
        .catch(error => {
            alert('Error fetching all Pokémon');
            console.error(error);
        });
}

// Display Pokémon cards with background color based on type and shadow based on experience
function displayPokemon(pokemons) {
    const pokemonDisplay = document.getElementById('pokemon-display');
    pokemonDisplay.innerHTML = pokemons.map(pokemon => {
        const primaryType = pokemon.types[0].type.name;
        const bgColor = typeColors[primaryType] || '#FFF';
        const boxShadow = pokemon.base_experience > 200 ? '0 8px 20px rgba(0, 0, 0, 0.5)' : '0 4px 10px rgba(0, 0, 0, 0.2)';

        return `
            <div class="pokemon-card" onclick="showPokemonDetails(${pokemon.id})" style="background-color: ${bgColor}; box-shadow: ${boxShadow}">
                <img src="${pokemon.sprites.other.home.front_default}" alt="${pokemon.name}">
                <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
                <p>ID: ${pokemon.id}</p>
                <p>Type: ${pokemon.types.map(type => capitalizeFirstLetter(type.type.name)).join(', ')}</p>
            </div>
        `;
    }).join('');
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show detailed Pokémon information in a modal
function showPokemonDetails(pokemonId) {
    const url = `${apiUrl}pokemon/${pokemonId}`;

    fetch(url)
        .then(response => response.json())
        .then(pokemon => {
            const modalContent = document.getElementById('modal-content');
            modalContent.innerHTML = `
                <img src="${pokemon.sprites.other.home.front_default}" alt="${pokemon.name}" style="width: 150px; height: 150px;">
                <h2>${capitalizeFirstLetter(pokemon.name)} (ID: ${pokemon.id})</h2>
                <p>Type: ${pokemon.types.map(type => `<span class="type">${capitalizeFirstLetter(type.type.name)}</span>`).join(' ')}</p>
                <p>Weight: ${pokemon.weight / 10} kg</p>
                <p>Height: ${pokemon.height / 10} m</p>
                <p>Base Experience: ${pokemon.base_experience}</p>
                <p>Abilities: ${pokemon.abilities.map(ability => capitalizeFirstLetter(ability.ability.name)).join(', ')}</p>
                <p>Stats:</p>
                <ul>
                    ${pokemon.stats.map(stat => `
                        <li>${getStatIcon(stat.stat.name)} ${capitalizeFirstLetter(stat.stat.name)}: ${stat.base_stat}</li>
                    `).join('')}
                </ul>
            `;
            document.getElementById('pokemon-modal').style.display = 'block';
        })
        .catch(error => {
            alert('Error fetching Pokémon details');
            console.error(error);
        });
}

// Get corresponding icon for each stat
function getStatIcon(statName) {
    switch (statName) {
        case 'hp': return '❤️'; // Heart for HP
        case 'attack': return '⚔️'; // Sword for Attack
        case 'defense': return '🛡️'; // Shield for Defense
        case 'special-attack': return '🌟'; // Star for Special Attack
        case 'special-defense': return '🔮'; // Crystal Ball for Special Defense
        case 'speed': return '💨'; // Dash for Speed
        default: return ''; // Default case if no match
    }
}

// Close the Pokémon details modal
document.getElementById('close-modal').onclick = function() {
    document.getElementById('pokemon-modal').style.display = 'none';
}

// Go to the next page of Pokémon
function nextPage() {
    currentPage++;
    fetchAllPokemons();
}

// Go to the previous page of Pokémon
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchAllPokemons();
    }
}

// Fetch a random Pokémon when the button is clicked
document.getElementById('random-pokemon-btn').onclick = function() {
    fetchRandomPokemon();
}

// Initial fetch of Pokémon
fetchAllPokemons();
fetchRandomPokemon();
