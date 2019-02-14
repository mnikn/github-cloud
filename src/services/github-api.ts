import { Observable } from 'rxjs';
import * as request from 'request';

import { ACCESS_TOKEN, APP_CONFIGS } from 'src/constants/config';
import { parseQueryKeyValue } from 'src/utils/query';
import Repository from 'src/models/repository';
import { Maybe } from 'src/utils/maybe';
import RepositoryContent from 'src/models/repository-content';
import { requestGet } from 'src/utils/request';

const BASE_API_URL = 'https://api.github.com';
const BASE_OAUTH_API_URL = 'https://github.com/login/oauth';

export function requestAccessToken(authorizeCode: string): Observable<Maybe<string>> {
    return new Observable((observer) => {
        if (!authorizeCode) {
            observer.next(Maybe.nothing<string>());
            return;
        }

        request.post(`${BASE_OAUTH_API_URL}/access_token`, {
            body: JSON.stringify({
                client_id: APP_CONFIGS.clientId,
                client_secret: APP_CONFIGS.clientSecret,
                code: authorizeCode
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, (error, response, body) => {
            if (response.statusCode !== 200 && response.statusCode !== 304) {
                observer.error(error);
                observer.next(Maybe.nothing<string>());
                return;
            }

            const accessToken = parseQueryKeyValue(body)['access_token'];
            if (accessToken) {
                localStorage.setItem(ACCESS_TOKEN, accessToken);
            }
            observer.next(Maybe.just(accessToken));
            observer.complete();
        });
    });
}

export function redirectToAuthorizePage() {
    const url = `${BASE_OAUTH_API_URL}/authorize?client_id=${APP_CONFIGS.clientId}&redirect_uri=${'http://localhost:3000/'}&scope=repo`;
    window.location.href = url;
}

export function getCurrentUserRepos(accessToken: string): Observable<Maybe<Repository[]>> {
    const url = `${BASE_API_URL}/user/repos?access_token=${accessToken}`;
    return requestGet<Repository[]>(url);

    // return new Observable((observer) => {
    //     const url = `${BASE_API_URL}/user/repos?access_token=${accessToken}`;
    //     requestGet(url);
    //     request.get(url, (error, response, body) => {
    //         const repos = JSON.parse(body) as Repository[];
    //         if (response.statusCode !== 200 && response.statusCode !== 304) {
    //             observer.error(error);
    //         } else {
    //             observer.next(repos);
    //         }
    //         observer.complete();
    //     });
    // });
}

export function getRepositoryContents(repoUrl: string): Observable<Maybe<RepositoryContent[]>> {
    const url = `${repoUrl}&access_token=${localStorage.getItem(ACCESS_TOKEN)}`;
    return requestGet<RepositoryContent[]>(url);
    // return new Observable((observer) => {
    //     request.get(`${repoUrl}&access_token=${localStorage.getItem(ACCESS_TOKEN)}`, (error, response, body) => {
    //         if (response.statusCode !== 200 && response.statusCode !== 304) {
    //             observer.error(error);
    //         } else {
    //             const contents = JSON.parse(body) as RepositoryContent[];
    //             observer.next(contents);
    //         }
    //     });
    // });
}

export function uploadFile(file: any): Observable<RepositoryContent[]> {
    return new Observable((observer) => {

    });
}