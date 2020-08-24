import * as Colors from 'material-ui/core/styles/colors';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { fade } from 'material-ui/utils/colorManipulator';

const getTheme = () => {
  let overwrites = {};
  return getMuiTheme(baseTheme, overwrites);
};

export default getTheme();
