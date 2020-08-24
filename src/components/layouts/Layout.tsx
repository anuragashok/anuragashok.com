import { Container } from '@material-ui/core';

import Header from './Header';
import Meta from './Meta';

type Props = {
  children: React.ReactNode;
  sidebar: boolean;
};

const Layout: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <>
      <Meta />

      <div className="min-h-screen">
        <Container maxWidth="lg">
          <Header />
          <main>
            {children} {sidebar.toString()}
          </main>
        </Container>
      </div>
    </>
  );
};

Layout.defaultProps = {
  sidebar: true,
};

export default Layout;
