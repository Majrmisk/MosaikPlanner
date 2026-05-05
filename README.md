# MosaikPlanner
A modular task management web app where users build personal or shared group dashboards using a variety of interactive widgets.

## Dev setup
1. install dependencies
    ```shell
    pnpm i
    ```

2. create .env
    ```shell
    cp .env.example .env
    ```

3. start local db
    ```shell
    turso dev --db-file dev.db
    ```
    and fill http://localhost:8080 into .env

4. create [GitHub OAuth app](https://github.com/settings/applications/new) and fill `AUTH_GITHUB_ID=` and `AUTH_GITHUB_SECRET=` in .env

5. create auth secret
    ```shell
    npx auth secret
    ```
    and fill `AUTH_SECRET=` in .env

6. start the app
    ```shell
    pnpm dev
    ```
   