import * as React from 'react';
import { Modal, Button, Spin } from 'antd';

import { redirectToAuthorizePage } from 'src/services/github-api';
import SelectRepoModal from './SelectRepoModal';
import { Maybe } from 'src/utils/maybe';
import Repository from 'src/models/repository';

interface Props {
    accessToken: string;
    visible: boolean;
    close: () => void;
    setSyncRepo: (repo: Maybe<Repository>) => void;
    onChangeRepo: () => void;
}

export default function SettingsModal(props: Props) {
    const [loading, setLoading] = React.useState(false);
    const [repoModalVisible, setRepoModalVisible] = React.useState(false);

    const buttonStyle = { margin: '16px' };
    const clearCache = () => {
        localStorage.clear();
        setLoading(true);
        redirectToAuthorizePage();
    };
    const openRepoModal = () => setRepoModalVisible(true);
    const closeRepoModal = () => setRepoModalVisible(false);

    return (
        <Modal
            title='Settings'
            visible={props.visible}
            onOk={props.close}
            cancelButtonProps={{ hidden: true }}
            okButtonProps={{ hidden: loading }}
            closable={false}>
            <Spin spinning={loading} style={{ position: 'absolute', left: '50%', top: '50%' }} />
            <div hidden={loading} style={{ display: 'flex', flexDirection: 'column' }}>
                <Button style={buttonStyle} onClick={openRepoModal}>
                    Change sync repository
                </Button>
                <Button type='danger' style={buttonStyle} onClick={clearCache}>
                    Clear cache
                </Button>
            </div>
            <SelectRepoModal
                visible={repoModalVisible}
                close={closeRepoModal}
                accessToken={props.accessToken}
                setSyncRepo={props.setSyncRepo}
                onOk={props.onChangeRepo} />
        </Modal>
    );
}
