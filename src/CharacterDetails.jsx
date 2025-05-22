// Componente para exibir os detalhes de um personagem
const CharacterDetails = ({ character, onClose }) => {
  // Se não houver personagem, não renderiza nada
  if (!character) return null

  return (
    <div className="character-details-overlay">
      <div className="character-details">
        {/* Botão para fechar */}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="character-details-content">
          {/* Lado esquerdo - Imagem */}
          <div className="character-image">
            <img src={character.image || "/placeholder.svg"} alt={character.name} />
          </div>

          {/* Lado direito - Informações */}
          <div className="character-info">
            {/* Nome do personagem */}
            <h1>{character.name}</h1>

            {/* Descrição do personagem */}
            <div className="character-description">
              <h3>Descrição:</h3>
              <p>{character.description || "Nenhuma descrição disponível."}</p>
            </div>

            {/* Detalhes do personagem */}
            <div className="character-details-grid">
              {/* ID */}
              <div className="detail-item">
                <strong>ID:</strong>
                <span>{character.id}</span>
              </div>

              {/* Raça */}
              <div className="detail-item">
                <strong>Raça:</strong>
                <span>{character.race || "Desconhecida"}</span>
              </div>

              {/* Gênero */}
              <div className="detail-item">
                <strong>Gênero:</strong>
                <span>{character.gender || "Desconhecido"}</span>
              </div>

              {/* Planeta */}
              <div className="detail-item">
                <strong>Planeta:</strong>
                <span>{character.originPlanet?.name || "Desconhecido"}</span>
              </div>

              {/* Ki */}
              <div className="detail-item">
                <strong>Ki:</strong>
                <span>{character.ki || "Desconhecido"}</span>
              </div>

              {/* Afiliação */}
              <div className="detail-item">
                <strong>Afiliação:</strong>
                <span>{character.affiliation || "Desconhecida"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterDetails