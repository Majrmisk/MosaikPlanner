# MosaikPlanner
A modular task management web app where users build personal or shared group dashboards using a variety of interactive widgets.

## Specification
The main page is a dashboard of overview widget panes that you can add / remove / reorder.

When you add a widget, you can choose between a personal widget or a shared widget for members of a group. You can either create a new shared widget or add an existing one made by another group member. A shared widget is updated for the whole group live when a member interacts with it. When you click on a widget, it opens a full-screen page with all its interactive features.

Widget types:
- Notes: Basic notes with a title and raw text.
- Calendar: You can manually add events or choose which other widgets to show data from. 
- Checklist: You can select due dates for items, which can then be shown in the calendar.
- Spinner: Cycles between a set of items for an event. When you click it, it moves to the next item. You can choose how often the event should happen, and it can also be shown on the calendar.
  - Example: The items are roommates, and the spinner cycles through whose turn it is to take out the trash / clean.
- Expenses: (The complexity of this widget will depend on how hard it is to implement the rest of the app). Members can add shared expenses, and the widget can show graphs, overviews, calculations, and the settling of those expenses.

Extra considered features:
- email notifications
- multiple overview screens
- different color themes

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

6. run db migration
    ```shell
    pnpm run db:migrate
    ```

7. start the app
    ```shell
    pnpm dev
    ```
   