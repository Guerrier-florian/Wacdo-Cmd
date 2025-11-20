import "../styles/Layout.css"

const Layout = ({ children }) => {
  return (
    <div className="layout">
        <div className="content-layout">
            {children}
        </div>
    </div>
  )
}

export default Layout