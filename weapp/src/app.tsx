import { AuthProvider } from './contexts/AuthContext';
import './app.scss';

function App({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default App;
