import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Logo = styled('img')({
    height: 40,
    marginRight: 16,
});

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <StyledAppBar position="static">
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Logo src="/logo.png" alt="Coffee POS Logo" />
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        color="inherit"
                        onClick={handleHome}
                        size="large"
                    >
                        <HomeIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={handleLogout}
                        size="large"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header; 