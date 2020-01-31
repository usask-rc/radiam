export const darkTheme = {
  palette: {
    type: "dark" // Switching the dark mode on is a single property value change.
  }
};

export const lightTheme = {
  palette: {
    secondary: {
      light: "#aad4ff",
      main: "#95caff",
      dark: "#688db2",
      contrastText: "#fff"
    }
  },

 overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: '#688db2',
        '&:hover': {
          backgroundColor: "#aad4ff",
        },
      },
    },
  },

  typography: {
    body1: {
      fontSize: 15
    },
    body2: {
      fontSize: 14.5
    },
  },

};
