import * as React from 'react';
import { Button } from 'antd';

import { redirectToAuthorizePage } from 'src/services/github-api';

interface Props {
    // setAuthorizing: (authorizing: boolean) => void;
}

export default function LoginPage(props: Props) {
    const handleLoginClick = () => {
        redirectToAuthorizePage();
        // props.setAuthorizing(true);
    };
    return (
        <div className='center'>
            <Button onClick={handleLoginClick}>
                Login
            </Button>
        </div>
    );
};