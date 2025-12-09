import { usePrivy } from '@privy-io/react-auth'
import './App.css'

function App() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) {
    return (
      <div className="app-container">
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {!authenticated ? (
        <div className="login-box">
          <h1>GIRO SCROLL</h1>
          <p className="subtitle">Autenticação Web3</p>
          <button className="login-button" onClick={login}>
            Conectar Carteira
          </button>
        </div>
      ) : (
        <div className="welcome-box">
          <h2>Bem-vindo!</h2>
          <div className="user-info">
            {user?.wallet?.address && (
              <p className="wallet-address">
                Carteira: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </p>
            )}
            {user?.email?.address && (
              <p className="user-email">Email: {user.email.address}</p>
            )}
          </div>
          <button className="logout-button" onClick={logout}>
            Desconectar
          </button>
        </div>
      )}
    </div>
  )
}

export default App
