import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B4E3E', // Warm brown color
      light: '#8B6B5B',
      dark: '#4B2E1E',
    },
    secondary: {
      main: '#D4A59A', // Soft pink
      light: '#E4B5AA',
      dark: '#C4958A',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    h1: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    h2: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    h3: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    h4: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    h5: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    h6: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    subtitle1: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    subtitle2: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    body1: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
      textTransform: 'none',
    },
    caption: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
    overline: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 400,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
        },
      },
    },
  },
});

export default theme; 