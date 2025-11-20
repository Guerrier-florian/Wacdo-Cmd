import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import Layout from '../components/Layout'
import '../styles/Thanks.css'

const Thanks = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="thanks">
        <h1 className="thanks-title">Toute l'équipe vous remercie,</h1>
        <p className="thanks-subtitle">Et vous souhaite un bon appétit dans nos restaurants ,</p>
        <p className="thanks-signature">A bientôt !</p>
        
        <button className="thanks-button" onClick={() => navigate('/')}>
          Nouvelle commande
        </button>
      </div>
    </Layout>
  )
}

export default Thanks