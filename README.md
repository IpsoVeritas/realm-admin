# RealmAdminNg

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.3.

It replaces the older react realm UI. 


Title: binding first with secret
client->realm: join-realm & accuire admin mandate
client->realmadmin: login (token mandate used in api)
client->realmadmin: add service via binding-url 
realmadmin->controller: GET controller /descriptor
realmadmin->controller: GET actions servicesURI
realmadmin->controller: POST add-binding/ binding-id = default\nsecret=[from log]
controller->realmadmin: ... { descriptor url with new binding }
realmadmin->controller: GET /descriptor?binding+secret
realmadmin->realm: POST: bind this controller
realm->realmadmin: controller-binding
realmadmin->controller: POST /descriptor?binding+secret


## Development config

Run `npm run config` to populate the angular dev enviroment file with values from your local .env

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Deployment to staging

Each branch is deployed to staging. The URL to each branch deployment is:

`https://actions.brickchain.com/realm-admin-ng/[BRANCH]/#/[STAGING REALM]/login`

To create staging realms simply go to:

[http://brickchain-sites.s3-website.eu-central-1.amazonaws.com/plusintegrity.com/master/realm/](http://brickchain-sites.s3-website.eu-central-1.amazonaws.com/plusintegrity.com/master/realm/)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
