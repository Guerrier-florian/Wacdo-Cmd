/**
 * Home.jsx — Page d'accueil (route /)
 *
 * Premier écran affiché à l'utilisateur.
 * Permet de choisir le mode de consommation :
 *  - "Sur place"  : le client mange au restaurant (nécessite un numéro de chevalet)
 *  - "À emporter" : le client repart avec sa commande
 *
 * Le mode choisi est sauvegardé dans Redux, puis l'utilisateur
 * est redirigé vers la page de commande (/new).
 */
import Layout from '../components/Layout'
import '../styles/Home.css'
import { useDispatch } from 'react-redux'
import { setMode } from '../slices/shopping-cart-slice'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  /**
   * Enregistre le mode de consommation dans Redux et redirige vers /new.
   * @param {'surplace'|'aemporter'} mode - Le mode sélectionné par l'utilisateur
   */
  const handleClick = (mode) => {
    dispatch(setMode(mode))   // Sauvegarde le mode dans le store Redux
    navigate('/new')          // Redirige vers la page de commande
  }

  return (
    <Layout>
      <p>Bonjour</p>
      <p>Souhaitez-vous consommer votre menu sur place ou préférez-vous l'emporter ?</p>

      {/* Conteneur des deux options cliquables */}
      <span>
        {/* Option "Sur place" : avec le numéro de chevalet */}
        <img
          onClick={() => handleClick('surplace')}
          role="button"
          tabIndex={0}
          className="illustration-placeholder"
          src="/img/images/illustration-sur-place.png"
          alt="Illustration sur place : chaise et table"
          onKeyDown={(e) => e.key === 'Enter' && handleClick('surplace')}
        />

        {/* Option "À emporter" : commande directement emballée */}
        <img
          onClick={() => handleClick('aemporter')}
          role="button"
          tabIndex={0}
          className="illustration-placeholder"
          src="/img/images/illustration-a-emporter.png"
          alt="Illustration à emporter : sac de commande"
          onKeyDown={(e) => e.key === 'Enter' && handleClick('aemporter')}
        />
      </span>
    </Layout>
  )
}

export default Home
