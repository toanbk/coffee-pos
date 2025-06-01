import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
    maxWidth: 600,
    margin: 'auto',
    marginTop: theme.spacing(8),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const Logo = styled('img')({
    width: 200,
    height: 'auto',
    marginBottom: 24,
});

const ButtonContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 300,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1.5),
    fontSize: '1.1rem',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        boxShadow: 'none',
    },
}));

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container>
            <StyledPaper>
                <Logo src="/logo.png" alt="Coffee POS Logo" />
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Coffee POS
                </Typography>
                <ButtonContainer>
                    <StyledButton
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => navigate('/order')}
                        fullWidth
                    >
                        Sale
                    </StyledButton>
                    {isAdmin && (
                        <StyledButton
                            variant="contained"
                            color="secondary"
                            startIcon={<AssessmentIcon />}
                            onClick={() => navigate('/report')}
                            fullWidth
                        >
                            Report
                        </StyledButton>
                    )}
                    <StyledButton
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        fullWidth
                    >
                        Logout
                    </StyledButton>
                </ButtonContainer>
            </StyledPaper>
        </Container>
    );
};

export default Home; 