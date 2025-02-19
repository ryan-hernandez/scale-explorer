import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Fretboard from './components/Fretboard';
import Controls from './components/Controls';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [bpm, setBpm] = React.useState(120);
  const [selectedScale, setSelectedScale] = React.useState('C');
  const [playDown, setPlayDown] = React.useState(false);
  const [loop, setLoop] = React.useState(false);
  const [showAllPositions, setShowAllPositions] = React.useState(false);
  const [volume, setVolume] = React.useState(-12); // Default volume in dB

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <h1 style={{ color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
            Scale Explorer
          </h1>
          <Fretboard
            scale={selectedScale}
            isPlaying={isPlaying}
            volume={volume}
          />
          <Controls
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            bpm={bpm}
            setBpm={setBpm}
            selectedScale={selectedScale}
            setSelectedScale={setSelectedScale}
            playDown={playDown}
            setPlayDown={setPlayDown}
            loop={loop}
            setLoop={setLoop}
            showAllPositions={showAllPositions}
            setShowAllPositions={setShowAllPositions}
            volume={volume}
            setVolume={setVolume}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
