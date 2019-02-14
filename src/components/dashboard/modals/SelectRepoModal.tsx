import * as React from 'react';
import { Modal, Radio, Spin } from 'antd';
const RadioGroup = Radio.Group;

import { getCurrentUserRepos } from 'src/services/github-api';
import Repository from 'src/models/repository';
import { Maybe } from 'src/utils/maybe';
import { REMOTE_REPOSITORY_URL } from 'src/constants/config';

interface Props {
    accessToken: string;
    visible: boolean;
    close: () => void;
    setSyncRepo: (repo: Maybe<Repository>) => void;
    onOk: () => void;
}

export default function SelectRepoModal(props: Props) {
    const [repos, setRepos] = React.useState<Repository[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [selectedRepoId, setSelectedRepoId] = React.useState(Maybe.nothing<number>());

    const handleOk = () => {
        selectedRepoId
            .safeTansform(repoId => repos.find(repo => repo.id === repoId))
            .safeDo((repo: Repository) => props.setSyncRepo(Maybe.just(repo)))
            .safeDo((repo: Repository) => localStorage.setItem(REMOTE_REPOSITORY_URL, repo.url));
        props.onOk();
        props.close();
    }

    function updateSelectedRepo(event: any) {
        setSelectedRepoId(Maybe.just<number>(event.target.value));
    }

    React.useEffect(() => {
        if (!props.visible) return;

        const closeLoadingSpin = () => setLoading(false);
        getCurrentUserRepos(props.accessToken)
        .subscribe((repos) => {
            repos.safeDo(value => setRepos(value));
        }, () => {
            setRepos([]);
        }, closeLoadingSpin);
        return closeLoadingSpin;
    }, [props.visible]);


    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    };

    return (
        <Modal
            title='Choose a reposity to sync your files'
            visible={props.visible}
            confirmLoading={loading}
            onOk={handleOk}
            onCancel={props.close}>
            <Spin spinning={loading} style={{ position: 'absolute', left: '50%', top: '50%'}} />
            <RadioGroup
                onChange={updateSelectedRepo}
                style={{ height: '300px', width: '100%', overflow: 'scroll' }}>
                {repos.map(repo =>
                    <Radio key={repo.id}
                        style={radioStyle}
                        value={repo.id}>
                        {repo.name}
                    </Radio>)}
            </RadioGroup>
        </Modal>
    );
}