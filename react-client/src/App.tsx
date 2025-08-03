import { ThemeProvider } from 'styled-components';
import { GameApp } from './components/GameApp';
import { GlobalStyle } from './styles/globalStyles';
import { theme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GameApp />
    </ThemeProvider>
  );
}

export default App
