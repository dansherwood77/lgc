import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccountCircle } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 400,
            fontFamily: 'Helvetica, Arial, sans-serif',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => navigate('/')}
        >
          Let's Get Coffee!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/campaigns')}
            sx={{ 
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Campaigns
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/campaign-setup')}
            sx={{ 
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            New Campaign
          </Button>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {user ? (
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'secondary.main',
                  fontSize: '1rem'
                }}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {user && (
              <MenuItem 
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
              >
                Profile
              </MenuItem>
            )}
            <Divider />
            <MenuItem 
              onClick={() => {
                handleClose();
                handleLogout();
              }}
              sx={{ color: 'error.main' }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 