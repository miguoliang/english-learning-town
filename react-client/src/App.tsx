import { ThemeProvider } from 'styled-components';
import { ECSGameApp } from './components/ECSGameApp';
import { GlobalStyle } from './styles/globalStyles';
import { theme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ECSGameApp />
    </ThemeProvider>
  );
}

export default App
