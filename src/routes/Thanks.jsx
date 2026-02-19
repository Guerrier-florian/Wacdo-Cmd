/**
 * Thanks.jsx — Page de confirmation de commande (route /thanks)
 *
 * Affichée après la validation réussie d'une commande.
 * Remercie le client et lui propose de passer une nouvelle commande.
 */
import { useNavigate } from 'react-router'
import Layout from '../components/Layout'
import '../styles/Thanks.css'

const Thanks = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="thanks">
        {/* Message de remerciement */}
        <h1 className="thanks-title">Toute l'équipe vous remercie,</h1>

        {/* Sous-titre avec ponctuation intentionnelle */}
        <p className="thanks-subtitle">
          Et vous souhaite un bon appétit dans nos restaurants ,
        </p>

        {/* Signature manuscrite (font cursive en CSS) */}
        <p className="thanks-signature">A bientôt !</p>

        {/* Bouton pour recommencer une commande depuis zéro */}
        <button
          className="thanks-button"
          onClick={() => navigate('/')}
        >
          Nouvelle commande
        </button>
      </div>
    </Layout>
  )
}

export default Thanks
