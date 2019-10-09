**Radiam API Dev/Deploy Documentation**


** Using docker and docker-compose: introductory tutorials **

docker: https://docs.docker.com/get-started/

docker compose: https://docs.docker.com/compose/gettingstarted/

**Components:**

Elasticsearch.

Django web application server exporting Django REST API.

Postgres for Django backend.

**Instructions for first-time use or setting up on new host:**

1. Install Docker: https://docs.docker.com/install/#supported-platforms

2. Install Docker-Compose: https://docs.docker.com/compose/install/

3. Follow instructions on setting up host production environment for Elasticsearch:
https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html

On linux, it is useful to add your user to the docker group.


**Develop:**

*Case 1*: First-time build:

```text
cd api/
# Build and deploy project
docker-compose up -d --build
# Create admin user (will prompt for password)
docker-compose -f docker-compose.yml -f oneshot.yml run create_admin_user
```

*Case 2*: Changes (yours or from git) to Django code (/radiam directory):

Django will reload with changes automatically.

*Case 3*: Changes to api/Dockerfile OR changes to api/radiam/requirements.txt OR changes to docker-compose.yml
```text
# Take down docker stack and rebuild web image
docker-compose down
docker-compose up -d --build
```

*Case 4*: Nuclear option (delete database and elasticsearch index and all containers and images):
```text
docker-compose down -v --rmi all --remove-orphans
# Follow instructions for first-time build
```

*Case 5:*: Delete elasticsearch index OR django/postgres database.
```text
docker-compose down
# Delete elasticsearch indices.
docker volume rm api_elasticsearch_data_vol
# Delete postgres database.
docker volume rm api_postgres_data_vol

**Use:**

Elasticsearch will be on port 9200

Django running a Django rest app is on 8000:

To query users table via rest call:

```text
curl -H 'Accept: application/json; indent=4' -u \<user\>:\<password\> http://127.0.0.1:8000/users/
```

To browse the API, point your browser at http://localhost:8000 and login with the admin credentials.

**API Documentation**

API Documentation exists at the ```/docs``` endpoint.

**Docker tips**

Modify the external port a service is exposed on by changing the
port mapping in docker-compose. e.g. 8000:8000 can become 80:8000.

Running 'docker-compose logs [-f[' in the same directory as the docker-compose.yml file will tail
the logs from all running services. The same effect can be had by running docker-compose without
the '-d' flag. 'docker logs [-f] *container id*' will show the logs from one container.

'Volumes' are files living on the host filesystem that act as block devices for containers.
They persist even when associated containers are not running, unless explicitly deleted.

A Dockerfile describes how to build an image and run an individual container from that image. 

A docker-compose file describes how to orchestrate the functioning of multiple containers together.

'docker ps' shows all runninng containers.

'docker images' shows all locally stored images.

'docker exec -it *container id* *command*' Runs a command within a container. 
If *command* is /bin/bash or /bin/sh you can get a shell running on the container.

** Common Errors and Fixes **
# Unable to create projects with linux host running docker
1. Click on create project after filling in metadata. Get response of 500 Internal Server Error

2. Reponse starts with:

```
ConnectionError at /api/projects/
ConnectionError(<urllib3.connection.HTTPConnection object at 0x7fb40c012908>: Failed to establish a new connection: [Errno 111] Connection refused) caused by: NewConnectionError(<urllib3.connection.HTTPConnection object at 0x7fb40c012908>: Failed to establish a new connection: [Errno 111] Connection refused)
```

3. Running 'docker-compose ps' gives a result of health: starting for the Elasticsearch container:

```
api_elasticsearch_1   /usr/local/bin/docker-entr ...   Up (health: starting)   0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp
```

4. Running 'docker-compose logs elasticsearch | grep map_count' shows:

```
elasticsearch_1  | [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

5. Run 'sudo sysctl -w vm.max_map_count=262144' to fix it.

** Production Deploy **

The repository: https://github.com/usask-rc/radiam-deploy/ contains all instructions and code for production deployment of this project via Ansible. Any changes made to docker-compose.yml should be ported over to to this project as well.

# Enable Browsable API
To use the browsable api add:
```
environment:
      - SESSIONAUTH=1
```

To the **radiamapi** block in the docker-compose file.

Default project avatars are courtesy https://www.swifticons.com

# Creating fixtures for tests
Get the application in the state that you want the test data to be in using the Admin UI or API then run something like:

```
docker exec radiamapi_1 python manage.py dumpdata api.dataset api.groupmember api.groupviewgrant api.location api.project api.researchgroup api.user api.useragent > ~/radiam/radiam-api/api/radiam/api/fixtures/sort.json
```

Where the list of api.dataset is the list of models you want to dump into the fixture.
