import React from 'react'
import Layout from '../components/Layout'
import '../styles/Home.css'
import { useDispatch } from 'react-redux'
import { setMode } from '../slices/shopping-cart-slice'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleClick = (mode) => {
    dispatch(setMode(mode))
    navigate('/new')
  }

  return (
    <Layout>
      <p>Bonjour</p>
      <p>Souhaitez-vous consommer votre menu sur place ou préférez-vous l'emporter ?</p>
      <span>
        <img onClick={() => handleClick('surplace')} role="button" tabIndex={0} className="illustration-placeholder" src="../../img/images/illustration-sur-place.png" alt="illustration sur place chaise table" />
        <img onClick={() => handleClick('aemporter')} role="button" tabIndex={0} className="illustration-placeholder" src="../../img/images/illustration-a-emporter.png" alt="illustration a emporter sac commande nourriture" />
      </span>
    </Layout>
  )
}
export default Home
