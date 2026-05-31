// ==============================|| PRESET THEME - DEFAULT ||============================== //

export default function Default(colors) {
  const { blue, red, gold, cyan, green, grey } = colors;
  const greyColors = {
    0: grey[0],
    50: grey[1],
    100: grey[2],
    200: grey[3],
    300: grey[4],
    400: grey[5],
    500: grey[6],
    600: grey[7],
    700: grey[8],
    800: grey[9],
    900: grey[10],
    A50: grey[15],
    A100: grey[11],
    A200: grey[12],
    A400: grey[13],
    A700: grey[14],
    A800: grey[16]
  };
  const contrastText = '#fff';

  return {
    primary: {
      lighter: '#e6f7f8',
      100: '#b3e5e8',
      200: '#80d3d8',
      light: '#4dc1c8',
      400: '#1aafb8',
      main: '#00606c',
      dark: '#004d56',
      700: '#003a40',
      darker: '#00272a',
      900: '#001415',
      contrastText
    },
    secondary: {
      lighter: greyColors[100],
      100: greyColors[100],
      200: greyColors[200],
      light: greyColors[300],
      400: greyColors[400],
      main: greyColors[500],
      600: greyColors[600],
      dark: greyColors[700],
      800: greyColors[800],
      darker: greyColors[900],
      A100: greyColors[0],
      A200: greyColors.A400,
      A300: greyColors.A700,
      contrastText: greyColors[0]
    },
    error: {
      lighter: red[0],
      light: red[2],
      main: red[4],
      dark: red[7],
      darker: red[9],
      contrastText
    },
    warning: {
      lighter: gold[0],
      light: gold[3],
      main: gold[5],
      dark: gold[7],
      darker: gold[9],
      contrastText: greyColors[100]
    },
    info: {
      lighter: '#f0fdf4',
      light: '#bbf7d0',
      main: '#4ade80',
      dark: '#16a34a',
      darker: '#166534',
      contrastText
    },
    success: {
      lighter: '#f0fdf4',
      light: '#86efac',
      main: '#22c55e',
      dark: '#16a34a',
      darker: '#14532d',
      contrastText
    },
    grey: greyColors
  };
}
