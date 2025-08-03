import { ThemeProvider } from 'styled-components';
import { Game } from './Game';
import { GlobalStyle } from './styles/globalStyles';
import { theme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Game />
    </ThemeProvider>
  );
}

export default App
