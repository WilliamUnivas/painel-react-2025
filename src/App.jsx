import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [raceFilter, setRaceFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState("https://dragonball-api.com/api/characters?limit=20");
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar personagens
  const fetchCharacters = async (url) => {
    try {
      setIsLoading(true);
      const res = await fetch(url);
      const data = await res.json();
      const newCharacters = data.items || data;

      // Remover duplicados com base no ID
      setCharacters((prev) => {
        const existingIds = new Set(prev.map((char) => char.id));
        const uniqueNew = newCharacters.filter((char) => !existingIds.has(char.id));
        return [...prev, ...uniqueNew];
      });

      setFilteredCharacters((prev) => {
        const existingIds = new Set(prev.map((char) => char.id));
        const uniqueNew = newCharacters.filter((char) => !existingIds.has(char.id));
        return [...prev, ...uniqueNew];
      });

      setNextPageUrl(data.links?.next || null);
    } catch (error) {
      console.error("Erro ao buscar personagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega primeira página
  useEffect(() => {
    fetchCharacters(nextPageUrl);
    // eslint-disable-next-line
  }, []);

  // Aplica filtros
  useEffect(() => {
    const filtered = characters.filter((char) => {
      const raceMatch = raceFilter ? char.race?.toLowerCase().includes(raceFilter.toLowerCase()) : true;
      const genderMatch = genderFilter ? char.gender?.toLowerCase() === genderFilter.toLowerCase() : true;
      return raceMatch && genderMatch;
    });

    setFilteredCharacters(filtered);
  }, [raceFilter, genderFilter, characters]);

  return (
    <div className="App">
      <h1>Painel Dragon Ball</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por raça"
          value={raceFilter}
          onChange={(e) => setRaceFilter(e.target.value)}
        />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="">Todos os Gêneros</option>
          <option value="Male">Masculino</option>
          <option value="Female">Feminino</option>
        </select>
      </div>

      <div className="card-container">
        {filteredCharacters.map((char) => (
          <div key={char.id} className="card">
            <img src={char.image} alt={char.name} />
            <h2>{char.name}</h2>
            <p><strong>Raça:</strong> {char.race || "Desconhecida"}</p>
            <p><strong>Gênero:</strong> {char.gender || "Desconhecido"}</p>
          </div>
        ))}
      </div>

      {nextPageUrl && (
        <button className="load-more" onClick={() => fetchCharacters(nextPageUrl)} disabled={isLoading}>
          {isLoading ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}

export default App;
