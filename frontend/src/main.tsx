import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#333333',
            light: '#4f4f4f',
            dark: '#1a1a1a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#dc004e',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
        divider: '#e0e0e0',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderColor: '#e0e0e0',
                },
            },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
