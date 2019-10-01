## Radiam Web GUI

**To start with Docker:**

Clone the RADIAM-API repo and change into the repo directory.

docker-compose up -d --build
(also make sure the API is running on this host)

To stop with Docker:
docker-compose stop

To see if it is running:
docker-compose ps


**To start an independent instance of the GUI in Ubuntu 18:**

1. Clone the repo

    `git clone gitlab@git.computecanada.ca:radiam-gui.git`

2. Enter the directory.

    `cd radiam-gui`

3. We have been using Yarn for this project, though NPM should work as well. Once installed, continue. Installation instructions are here: https://yarnpkg.com/lang/en/docs/install/

    `yarn` or, if you would prefer to use NPM, first delete yarn.lock and then run `npm install`.

4. Once this is finished, start it up. This will spin up the page at http://localhost:3000/#/login

    `yarn start` or `npm start`

5. Start the radiam-api. I'm assuming that if you're here, you have already previously built it.

    `docker-compose up` in the radiam-api/api directory. You will want to set `sysctl -w vm.max_map_count = 262144` as suggested in the elasticsearch documentation.

    Radiam-API should be hosted at http://localhost:8100/api/ along with the most recent version of the GUI from  build.radiam.ca/radiam-gui at http://localhost:8100/

    To change the host port, look in src\_constants\index.js and change the value of 'PORT' to a suitable number.

6. Log in at http://localhost:3000/#/login with a radiam-api username and password.

# Enable Browsable API
To use the browsable api add:
```
environment:
      - SESSIONAUTH=1
      ```

      To the **radiamapi** block in the docker-compose file.

Default project avatars are courtesy https://www.swifticons.com
