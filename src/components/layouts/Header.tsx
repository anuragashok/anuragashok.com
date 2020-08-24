import { AppBar, Button, IconButton, Link, Toolbar, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import classes from './Layout.module.css';

const Header: React.FC = () => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography
            component="h2"
            variant="h5"
            color="inherit"
            align="center"
            noWrap
            className={classes.toolbarTitle}
          >
            Anurag Ashok
          </Typography>

          <Button variant="outlined" size="small">
            Subscribe
          </Button>
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
