/**
 * Notfound.jsx — Page d'erreur / page non trouvée
 *
 * Affichée dans deux cas :
 *  1. L'utilisateur accède à une URL inconnue (route "*" dans App.jsx)
 *  2. L'utilisateur tente d'accéder à /new sans avoir sélectionné de mode
 *     (sur place ou à emporter) depuis la page d'accueil
 *
 * Propose un bouton pour revenir à l'accueil et recommencer correctement.
 */
import Layout from '../components/Layout'
import { useNavigate } from 'react-router'
import '../styles/Notfound.css'

const Notfound = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      {/* Message d'erreur explicatif */}
      <h3>
        Merci de préciser si vous souhaitez commander sur place ou à emporter.
      </h3>

      {/* Bouton de retour vers l'accueil */}
      <button
        className="Nf-button"
        onClick={() => navigate('/')}
      >
        Nouvelle commande
      </button>
    </Layout>
  )
}

export default Notfound
