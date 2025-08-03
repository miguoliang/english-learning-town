import { ThemeProvider } from 'styled-components';
import { TownScene } from './components/scenes/TownScene';
import { GlobalStyle } from './styles/globalStyles';
import { theme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <TownScene />
    </ThemeProvider>
  );
}

export default App
