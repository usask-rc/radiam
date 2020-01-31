## Radiam

Radiam helps researchers keep track of their data, regardless of where it is stored.  There are multiple components working together, and most of them run within Docker containers.

### Prerequisite: Docker

1. Install Docker: https://docs.docker.com/install/#supported-platforms

2. Install Docker-Compose: https://docs.docker.com/compose/install/

3. Follow instructions on setting up host production environment for Elasticsearch:
https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html

On linux, it is useful to add your user to the docker group. For example to add the ubuntu user to the docker group on Ubuntu:

```
sudo usermod -a -G docker ubuntu
```

### Development Deployment

Check out the code locally, and change directory to the top level of the repo.

First-time build:

```text
# Build and deploy project
docker-compose up -d --build
```
You may get an error about timeout, that's normal for the first build.  Bring the Docker containers down then up again:
```text
# Try again
docker-compose down
docker-compose up -d --build
```
And then run the up command again.  You need to get to the point where the first up command with --build completes successfully.  After that, you can create the administrative user:
```
## Create admin user manually
docker exec -it radiamapi /bin/bash
python manage.py createsuperuser
```
### Uninstalling
If you want to remove the application, including ALL DATA, you can use the nuclear option (delete database and elasticsearch index and all containers and images):
```text
docker-compose down -v --rmi all --remove-orphans
```

### Deleting Data
If you want to delete the elasticsearch index or the postgres database data:
```text
docker-compose down

# Delete elasticsearch indices
docker volume rm api_elasticsearch_data_vol

# Delete postgres database
docker volume rm api_postgres_data_vol
```
### Troubleshooting

If running `docker-compose logs elasticsearch` shows:

```
max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```
Run `sudo sysctl -w vm.max_map_count=262144` to fix it on Ubuntu Linux (other distributions may have a different command).

### API Documentation

API documentation exists at the `/api/docs` endpoint of your running instance (ie: http://localhost:8100/api/docs/ )

**Docker tips**

`docker-compose logs` in the same directory as the docker-compose.yml file will tail the logs from all running services.

`docker logs [-f] *container id*` will show the logs from one container.

`docker ps` shows all running containers.

`docker images` shows all locally stored images.

`docker exec -it *container id* *command*` Runs a command within a container. If *command* is /bin/bash you can get a shell running on the container.

### Enable Browsable API

To use the browsable api add:
```
environment:
      - SESSIONAUTH=1
```

To the `radiamapi` block in the docker-compose file.

To browse the API, point your browser at http://localhost:8100/api and login with the admin credentials.

### Running Tests

You can run all the tests for the API and GUI with this command:

```
docker exec radiamapi python manage.py test
```

A temporary database will be created and all tests will be run, then the temporary database will be removed.

**Creating fixtures for tests**

Get the application in the state that you want the test data to be in using the Admin UI or API then run:

```
docker exec radiamapi python manage.py dumpdata api.dataset api.groupmember api.groupviewgrant api.location api.project api.researchgroup api.user api.useragent > ./api/radiam/api/fixtures/sort.json
```

Where the list is the list of models you want to dump into the fixture.

### Production Deployment

The instructions and code for using Ansible to deploy Radiam via docker stack are in this repository:

https://github.com/usask-rc/radiam-deploy/

### Credits

Default project avatars are courtesy https://www.swifticons.com


