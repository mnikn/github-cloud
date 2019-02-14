import * as React from 'react';
import { Observable } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';
import { Layout, Menu, Breadcrumb, Icon, List, Button, Upload, message } from 'antd';
const { Header, Content, Sider } = Layout;

import SelectRepoModal from './modals/SelectRepoModal';
import Repository from 'src/models/repository';
import { Maybe } from 'src/utils/maybe';
import { REMOTE_REPOSITORY_URL, ACCESS_TOKEN } from 'src/constants/config';
import { getRepositoryContents, uploadFile } from 'src/services/github-api';
import RepositoryContent from 'src/models/repository-content';
import SettingsModal from './modals/SettingsModal';
import './Dashboard.css';

interface Props {
}

export default function DashBoardPage(props: Props) {
    const cacheRepo = Maybe
        .just(localStorage.getItem(REMOTE_REPOSITORY_URL))
        .safeTansform((url: string) => {
            let tmp = new Repository();
            tmp.url = url;
            return tmp;
        });
    const [repo, setRepo] = React.useState(cacheRepo);
    const [repoContents, setRepoContents] = React.useState<RepositoryContent[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [repoModalVisible, setRepoModalVisible] = React.useState(repo.isNothing());
    const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
    const [repoPath, setRepoPath] = React.useState<string[]>(['/']);
    const [uploadFiles, setUploadFiles] = React.useState<any[]>([]);
    const accessToken = localStorage.getItem(ACCESS_TOKEN) as string;


    React.useEffect(() => {
        repo.safeTansform(value => value.url)
            .asyncSafeTansform((url: string) => {
                setLoading(true);
                return new Observable<RepositoryContent[]>((observer) => {
                    getRepositoryContents(`${url}/contents?ref=master`).subscribe(contents => {
                        contents.safeDo(value => observer.next(value), []);
                    });
                });
            })
            .subscribe(contents => {
                contents.safeDo(setRepoContents);
                setLoading(false);
            });
    }, [repo]);

    function requestRepoContent(url: string, path: string[]) {
        setLoading(true);
        getRepositoryContents(url).subscribe(contents => {
            contents.safeDo(value => setRepoContents(value));
            setRepoPath(path);
            setLoading(false);
        });
    }

    const closeSelectRepoModal = () => setRepoModalVisible(false);
    const openSettingsModal = () => setSettingsModalVisible(true);
    const closeSettingsModal = () => setSettingsModalVisible(false);
    const onChangeRepo = () => {
        setRepoPath([]);
    };

    const navigateTo = (dir: string) => {
        const path = ['/'].concat(dir.split('/').filter(s => s !== ''));
        repo.safeTansform(value => `${value.url}/contents${dir}`)
            .safeDo(url => requestRepoContent(url, path));
    };

    const renderListItem = (content: RepositoryContent) => {
        const load = () => {
            if (content.type === 'dir') {
                requestRepoContent(content.url, repoPath.concat(content.name));
            } else {
                // Todo
                setLoading(false);
            }
        };
        return (
            <List.Item className='list-item' onClick={load}>
                <Icon type={content.type === 'file' ? 'file' : 'folder'} />
                <span style={{ marginLeft: '16px' }}>{content.name}</span>
            </List.Item>);
    };

    // const uploadFile = () => {
    // };

    const uploadConfig = {
        name: 'file',
        action: '//jsonplaceholder.typicode.com/posts/',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info: any) {
            switch (info.file.status) {
                case 'uploading':
                    break;
                case 'done':
                    message.success(`${info.file.name} file uploaded successfully`);
                    break;
                case 'error':
                    message.error(`${info.file.name} file upload failed.`);
                    break;
                default:
                    uploadFile(info.file).subscribe(contents => {
                        setUploadFiles(uploadFiles.concat(info.file));

                    });
            }
        },
        beforeUpload: () => false,
        showUploadList: true,
        fileList: uploadFiles
    };

    return (
        <Layout style={{ height: '100%' }}>
            <Sider>
                <Menu theme="dark" mode="vertical" defaultSelectedKeys={['user']}>
                    <Menu.Item key="user">
                        <span>
                            <Icon type="file" />
                            <span className="nav-text">All Files</span>
                        </span>
                    </Menu.Item>
                </Menu>
                <Button
                    shape='circle'
                    icon='setting'
                    onClick={openSettingsModal}
                    style={{ position: 'absolute', bottom: '32px', left: '45%' }} />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: '16px', display: 'flex' }}>
                    {/* <Button shape='circle' icon='left' disabled={repoPath.length <= 0} /> */}
                    {/* <Button shape='circle' icon='right' disabled={true} /> */}
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '12px 0' }}>
                        {repoPath.map((dir, i) => {
                            const navigate = () => navigateTo(repoPath.slice(0, repoPath.lastIndexOf(dir) + 1 as number).join('/'));
                            return <Breadcrumb.Item key={i}>
                                <span className='breadcrumb-item' onClick={navigate}>{dir}</span>
                            </Breadcrumb.Item>
                        })}
                    </Breadcrumb>

                    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                        <Upload {...uploadConfig}>
                            <Button disabled={loading}
                                style={{ marginBottom: '16px' }}>
                                <Icon type='upload' />
                                Upload file
                            </Button>
                        </Upload>
                        <List
                            bordered={true}
                            loading={loading}
                            dataSource={repoContents}
                            renderItem={renderListItem} />
                    </div>
                </Content>
            </Layout>
            <SelectRepoModal
                accessToken={accessToken}
                visible={repoModalVisible}
                close={closeSelectRepoModal}
                setSyncRepo={setRepo}
                onOk={onChangeRepo} />
            <SettingsModal
                accessToken={accessToken}
                setSyncRepo={setRepo}
                visible={settingsModalVisible}
                close={closeSettingsModal}
                onChangeRepo={onChangeRepo} />
        </Layout>
    );
}