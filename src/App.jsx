import { useEffect, useState, useRef, useCallback } from "react"
import axios from "axios"
import "./App.css"
import CharacterDetails from "./CharacterDetails"

function App() {
  // Estado para armazenar todos os personagens
  const [characters, setCharacters] = useState([])

  // Estado para armazenar os personagens filtrados
  const [filteredCharacters, setFilteredCharacters] = useState([])

  // Estados para os filtros
  const [raceFilter, setRaceFilter] = useState("")
  const [genderFilter, setGenderFilter] = useState("")

  // Estado para controlar o carregamento
  const [isLoading, setIsLoading] = useState(false)

  // Estado para armazenar a URL da próxima página
  const [nextPageUrl, setNextPageUrl] = useState("https://dragonball-api.com/api/characters?limit=20")

  // Estado para verificar se há mais páginas para carregar
  const [hasMore, setHasMore] = useState(true)

  // Estado para controlar se todos os personagens foram carregados
  const [allCharactersLoaded, setAllCharactersLoaded] = useState(false)

  // Estado para armazenar o personagem selecionado para detalhes
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  // Estado para armazenar o ID do personagem selecionado
  const [selectedCharacterId, setSelectedCharacterId] = useState(null)

  // Estado para armazenar os detalhes completos do personagem
  const [characterDetails, setCharacterDetails] = useState(null)

  // Referência para o observador de interseção
  const observer = useRef()

  // useEffect para carregar os personagens iniciais
  useEffect(() => {
    // Função para buscar os personagens da API
    const fetchCharacters = async () => {
      // Verifica se há uma URL válida e se não está carregando
      if (!nextPageUrl || isLoading) return

      // Indica que está carregando
      setIsLoading(true)

      try {
        // Faz a requisição usando axios.get com a URL fornecida
        const response = await axios.get(nextPageUrl)

        // Extrai os dados da resposta
        const data = response.data
        const newCharacters = data.items || []

        // Se não houver novos personagens, não há mais para carregar
        if (newCharacters.length === 0) {
          setHasMore(false)
          setAllCharactersLoaded(true)
          return
        }

        // Atualiza o estado com os novos personagens, evitando duplicatas
        setCharacters((prevCharacters) => {
          // Cria um Set com os IDs dos personagens existentes
          const existingIds = new Set(prevCharacters.map((char) => char.id))

          // Filtra apenas os novos personagens que não existem ainda
          const uniqueNewCharacters = newCharacters.filter((char) => !existingIds.has(char.id))

          // Retorna a lista atualizada
          return [...prevCharacters, ...uniqueNewCharacters]
        })

        // Atualiza a URL da próxima página
        setNextPageUrl(data.links?.next || null)

        // Se não houver próxima página, não há mais para carregar
        if (!data.links?.next) {
          setHasMore(false)
          setAllCharactersLoaded(true)
        }
      } catch (error) {
        // Em caso de erro, mostra no console
        console.error("Erro ao buscar personagens:", error)
        setHasMore(false)
      } finally {
        // Finaliza o carregamento
        setIsLoading(false)
      }
    }

    // Chama a função para buscar os personagens
    fetchCharacters()
  }, [nextPageUrl, isLoading]) // Dependências do useEffect

  // useEffect para buscar detalhes do personagem quando o ID muda
  useEffect(() => {
    // Função para buscar detalhes de um personagem específico
    const fetchCharacterDetails = async () => {
      // Se não houver ID selecionado, não faz nada
      if (!selectedCharacterId) return

      try {
        // Faz a requisição usando axios.get para buscar os detalhes do personagem
        const response = await axios.get(`https://dragonball-api.com/api/characters/${selectedCharacterId}`)

        // Atualiza o estado com os detalhes do personagem
        setCharacterDetails(response.data)

        // Atualiza o estado do personagem selecionado com os detalhes completos
        setSelectedCharacter(response.data)
      } catch (error) {
        console.error("Erro ao buscar detalhes do personagem:", error)

        // Se houver erro, usa os dados básicos do personagem
        const basicCharacter = characters.find((char) => char.id === selectedCharacterId)
        if (basicCharacter) {
          setSelectedCharacter(basicCharacter)
        }
      }
    }

    // Chama a função para buscar os detalhes do personagem
    fetchCharacterDetails()
  }, [selectedCharacterId, characters]) // Dependências do useEffect

  // useEffect para carregar mais personagens quando necessário
  useEffect(() => {
    // Função para carregar todos os personagens
    const loadAllCharacters = async () => {
      if (allCharactersLoaded || !hasMore || isLoading) return

      setIsLoading(true)

      try {
        // Continua carregando páginas até que não haja mais
        let currentUrl = nextPageUrl

        while (currentUrl && hasMore) {
          // Faz a requisição usando axios.get
          const response = await axios.get(currentUrl)
          const data = response.data
          const newCharacters = data.items || []

          if (newCharacters.length === 0) break

          // Atualiza o estado com os novos personagens, evitando duplicatas
          setCharacters((prevCharacters) => {
            const existingIds = new Set(prevCharacters.map((char) => char.id))
            const uniqueNewCharacters = newCharacters.filter((char) => !existingIds.has(char.id))
            return [...prevCharacters, ...uniqueNewCharacters]
          })

          // Atualiza a URL da próxima página
          currentUrl = data.links?.next || null

          // Se não houver próxima página, sai do loop
          if (!currentUrl) break
        }

        setAllCharactersLoaded(true)
        setHasMore(false)
      } catch (error) {
        console.error("Erro ao carregar todos os personagens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Se houver poucos personagens filtrados e ainda não carregamos todos,
    // carrega todos os personagens
    if (filteredCharacters.length < 10 && !allCharactersLoaded && hasMore && raceFilter !== "") {
      loadAllCharacters()
    }
  }, [filteredCharacters.length, allCharactersLoaded, hasMore, nextPageUrl, raceFilter, isLoading])

  // useEffect para aplicar os filtros
  useEffect(() => {
    // Filtra os personagens com base nos filtros selecionados
    const filtered = characters.filter((char) => {
      // Verifica se a raça corresponde ao filtro
      const raceMatch = raceFilter ? char.race?.toLowerCase().includes(raceFilter.toLowerCase()) : true

      // Verifica se o gênero corresponde ao filtro
      const genderMatch = genderFilter ? char.gender?.toLowerCase() === genderFilter.toLowerCase() : true

      // Retorna true se ambos os filtros corresponderem
      return raceMatch && genderMatch
    })

    // Atualiza o estado com os personagens filtrados
    setFilteredCharacters(filtered)
  }, [raceFilter, genderFilter, characters])

  // Função para carregar mais personagens (chamada pelo observador de interseção)
  const loadMoreCharacters = useCallback(() => {
    // Não faz nada, apenas aciona o useEffect que carrega mais personagens
    // ao mudar o estado isLoading
    if (nextPageUrl && !isLoading && hasMore) {
      setIsLoading(true)
    }
  }, [nextPageUrl, isLoading, hasMore])

  // Referência para o último elemento da lista
  // Quando este elemento fica visível, carregamos mais personagens
  const lastCharacterElementRef = useCallback(
    (node) => {
      // Se estiver carregando, não faz nada
      if (isLoading) return

      // Desconecta o observador anterior, se existir
      if (observer.current) observer.current.disconnect()

      // Cria um novo observador
      observer.current = new IntersectionObserver((entries) => {
        // Se o elemento estiver visível e houver mais para carregar
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCharacters()
        }
      })

      // Observa o nó, se existir
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore, loadMoreCharacters],
  )

  // Lista de raças comuns em Dragon Ball
  const commonRaces = ["Saiyan", "Human", "Android", "Namekian", "Frieza Race"]

  // Função para aplicar o filtro de raça
  const handleRaceFilter = (race) => {
    setRaceFilter(race)
  }

  // Função para abrir a tela de detalhes do personagem
  const openCharacterDetails = (character) => {
    // Armazena o ID do personagem selecionado para acionar o useEffect
    setSelectedCharacterId(character.id)
  }

  // Função para fechar a tela de detalhes
  const closeCharacterDetails = () => {
    setSelectedCharacter(null)
    setSelectedCharacterId(null)
    setCharacterDetails(null)
  }

  return (
    <div className="App">
      <h1>Painel Dragon Ball</h1>

      {/* Seção de filtros */}
      <div className="filters">
        {/* Filtro de raça */}
        <div className="filter-group">
          <h3>Raça:</h3>
          <div className="filter-buttons">
            {/* Botão para mostrar todos */}
            <button
              className={raceFilter === "" ? "filter-btn active" : "filter-btn"}
              onClick={() => setRaceFilter("")}
            >
              Todos
            </button>

            {/* Botões para cada raça */}
            {commonRaces.map((race) => (
              <button
                key={race}
                className={raceFilter === race ? "filter-btn active" : "filter-btn"}
                onClick={() => handleRaceFilter(race)}
              >
                {race}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de gênero */}
        <div className="filter-group">
          <h3>Gênero:</h3>
          <div className="filter-buttons">
            {/* Botão para mostrar todos */}
            <button
              className={genderFilter === "" ? "filter-btn active" : "filter-btn"}
              onClick={() => setGenderFilter("")}
            >
              Todos
            </button>

            {/* Botão para filtrar por masculino */}
            <button
              className={genderFilter === "Male" ? "filter-btn active" : "filter-btn"}
              onClick={() => setGenderFilter("Male")}
            >
              Masculino
            </button>

            {/* Botão para filtrar por feminino */}
            <button
              className={genderFilter === "Female" ? "filter-btn active" : "filter-btn"}
              onClick={() => setGenderFilter("Female")}
            >
              Feminino
            </button>
          </div>
        </div>
      </div>

      {/* Container de cards com altura mínima para preencher a tela */}
      <div className="card-container">
        {/* Mapeamos os personagens filtrados para criar os cards */}
        {filteredCharacters.length > 0 ? (
          filteredCharacters.map((char, index) => {
            // Se for o último elemento, adicionamos a ref para o infinite scroll
            if (filteredCharacters.length === index + 1) {
              return (
                <div
                  ref={lastCharacterElementRef}
                  key={char.id}
                  className="card"
                  onClick={() => openCharacterDetails(char)}
                >
                  {/* Imagem do personagem */}
                  <img src={char.image || "/placeholder.svg"} alt={char.name} />

                  {/* Nome do personagem */}
                  <h2>{char.name}</h2>

                  {/* ID do personagem */}
                  <p>
                    <strong>ID:</strong> {char.id}
                  </p>

                  {/* Raça do personagem */}
                  <p>
                    <strong>Raça:</strong> {char.race || "Desconhecida"}
                  </p>

                  {/* Gênero do personagem */}
                  <p>
                    <strong>Gênero:</strong> {char.gender || "Desconhecido"}
                  </p>

                  {/* Planeta do personagem */}
                  <p>
                    <strong>Planeta:</strong> {char.originPlanet?.name || "Desconhecido"}
                  </p>

                  {/* Ki do personagem */}
                  <p>
                    <strong>Ki:</strong> {char.ki || "Desconhecido"}
                  </p>
                </div>
              )
            } else {
              return (
                <div key={char.id} className="card" onClick={() => openCharacterDetails(char)}>
                  {/* Imagem do personagem */}
                  <img src={char.image || "/placeholder.svg"} alt={char.name} />

                  {/* Nome do personagem */}
                  <h2>{char.name}</h2>

                  {/* ID do personagem */}
                  <p>
                    <strong>ID:</strong> {char.id}
                  </p>

                  {/* Raça do personagem */}
                  <p>
                    <strong>Raça:</strong> {char.race || "Desconhecida"}
                  </p>

                  
                  {/* Gênero do personagem */}
                  <p>
                    <strong>Gênero:</strong> {char.gender || "Desconhecido"}
                  </p>

                  {/* Planeta do personagem */}
                  <p>
                    <strong>Planeta:</strong> {char.originPlanet?.name || "Desconhecido"}
                  </p>

                  {/* Ki do personagem */}
                  <p>
                    <strong>Ki:</strong> {char.ki || "Desconhecido"}
                  </p>
                </div>
              )
            }
          })
        ) : (
          // Mensagem quando não há resultados
          <div className="no-results">
            <p>Nenhum personagem encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* Indicador de carregamento */}
      {isLoading && <div className="loading">Carregando personagens...</div>}

      {/* Mensagem quando não há mais personagens */}
      {!hasMore && !isLoading && characters.length > 0 && filteredCharacters.length > 0 && (
        <div className="no-more">Todos os personagens foram carregados</div>
      )}

      {/* Tela de detalhes do personagem */}
      {selectedCharacter && <CharacterDetails character={selectedCharacter} onClose={closeCharacterDetails} />}
    </div>
  )
}

export default App