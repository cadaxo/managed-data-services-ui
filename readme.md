# Cadaxo Managed Data Services - Graph App UI

About deploying to ABAP Repository please check
[ui5-task-nwabap-deployer](https://github.com/pfefferf/ui5-nwabap-deployer/tree/master/packages/ui5-task-nwabap-deployer)

## Run project locally
1. clone project to your local folder
2. run 'npm install' in the local/project folder
3. create .env file in local/project folder

Example .env file:
````
PROXY_TARGET=http://cc0.cadaxo.com:8000
PROXY_USERNAME=*******
PROXY_PASSWORD=*******
````

4. run 'npm run start'

## Deploy project to ABAP Repository
1. clone project to your local folder
2. open ui5.yaml
3. edit ui5-task-nwabap-deployer values correctly.
````
      connection:
        server: http://YOUR_SERVER:8000
      authentication:
        user: USER_NAME
        password: USER_PASS
      ui5:
        language: EN
        package: PACKAGE_NAME
        bspContainer: BSP_NAME
        bspContainerText: Cadaxo Managed Data Services UI
        transportNo: TRANSPORT_NO
        calculateApplicationIndex: false
````

4. run 'npm run deploy'

## Credits
This project has been generated with 💙 and [easy-ui5](https://github.com/SAP)
