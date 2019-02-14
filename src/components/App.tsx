import * as React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { Spin } from 'antd';

import DashBoardPage from './dashboard/Dashboard';
import LoginPage from './login/Login';
import { ACCESS_TOKEN } from 'src/constants/config';
import { requestAccessToken } from 'src/services/github-api';
import { Maybe } from 'src/utils/maybe';
import './App.css';


export function App() {
  const cacheAccessToken = new Maybe<string>(localStorage.getItem(ACCESS_TOKEN));
  const [authorizing, setAuthorizing] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(!cacheAccessToken.isNothing());

  React.useEffect(() => {
    if (authorized || authorizing) {
      return;
    }

    const authorizingFinish = () => {
      setAuthorizing(false);
    };
    const authorizeCode = window.location.search.substr(6);
    if (authorizeCode.length > 0) {
      setAuthorizing(true);
      requestAccessToken(authorizeCode).subscribe(() => {
        setAuthorized(true);
      }, () => { }, authorizingFinish);
    }
  }, [authorized]);

  const authRender = () => (
    !authorized ? (
      !authorizing ? <LoginPage /> : <Spin style={{ position: 'absolute', left: '50%', top: '50%' }} />
    ) : (
      <Redirect to={{pathname: "/dashboard"}} />)
    );

  return (
    <div className='App'>
      <BrowserRouter>
        <Switch>
          <Route path='/dashboard' component={DashBoardPage}/>
          <Route exact={true} path='/' render={authRender} />
        </Switch>
      </BrowserRouter>
    </div>

  );
}

export default App;
