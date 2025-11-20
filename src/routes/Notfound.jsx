import React from 'react'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router'
import '../styles/Notfound.css'

const Notfound = () => {
  const navigate = useNavigate()
  return (
    <Layout>
      <h3>Merci de préciser si vous souhaitez commander sur place ou à emporter.</h3>
      <button className="Nf-button" onClick={() => navigate('/')}>
          Nouvelle commande
      </button>
    </Layout>
  )
}

export default Notfound