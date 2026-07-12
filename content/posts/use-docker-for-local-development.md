---
title: "Use Docker for local development"
date: 2021-01-03
summary: "Containers are not only for application deployments. They offer many advantages for local development too. Find out how theOverEngineeredBlog uses Docker for local development."
tags: ["docker", "container", "development"]
---

![Use Docker for local development](https://images.ctfassets.net/lybfa03y94yw/31kEfTG8wIqkq8mixJ9skZ/6d86d7f4d0c700179d8eae5b31e01766/Untitled_design.jpg)
*Photo by [Pixabay](https://www.pexels.com/@pixabay?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels) from [Pexels](https://www.pexels.com/photo/business-coffee-composition-computer-265667/?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels)*

Docker/Containers have become the de facto standard for building and deploying applications. The isolation, portability and easy scaling capabilities of containers make them the popular choice for app deployments.

However, containers are not only for application deployments but can also be for local development. They can solve many developer issues. The use of Docker containers during development can have the following advantages.

- runs on my machine = runs anywhere
- there are no cumbersome configuration/version incompatibilities
- The development environment is closer to production
- easy onboarding of new developers

Let's see how I use Docker for the development of this blog.

## Base Image

TheOverEngineeredBlog is built on next.js which needs node. Also, the package manager of choice is yarn. The official node image on docker hub is [here](https://hub.docker.com/_/node). It includes yarn too. This blog uses `node:lts` image to get the latest lts version of node.

## Docker Compose

I created a docker-compose.yml file at the root of the project to define the entire container configuration and add more containers if necessary later.

###### docker-compose.yml [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/d784e3e072e19ae753cbe3fd39c64de86388e851/docker-compose.yml)

```yaml
version: '3.7'

services:
  runner: 
    image: node:lts
    ports: 
      - "$PORT:3000"
      - "$DEBUGPORT:9229"
    volumes:
    - .:/app:cached
    - yarn-cache-volume:/usr/local/share/.cache/yarn/v6:cached
    working_dir: /app
    command: "$COMMAND"

volumes:
  yarn-cache-volume:
```

The compose file defines a service named `runner` using the base image "node:lts".

The `ports` section instructs Docker to expose ports 3000 and 9229 at $PORT and $DEBUGPORT on the host. PORT and DEBUGPORT are environment variables to configure the desired ports on the host.

The `volumes` section defines mounts and named volume. The root directory of the project is mounted to `/app` inside the container. Also, it defines a named persistent volume for yarn cache. Docker manages this volume and persists it through the container stop/start. This cache reduces yarn execution time next time the container starts.

`working_dir` set the current directory to `./app` to avoid changing the directory each time the container starts.

`command` is set to an environment variable $COMMAND. It can be supplied when invoking docker-compose.

## RUN script

I like to have a `run` script to spawn the container using docker-compose to avoid writing the same commands each time.

###### run [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/d784e3e072e19ae753cbe3fd39c64de86388e851/run)

```bash
#!/bin/sh
export PORT=${PORT:-3000}
export DEBUGPORT=${DEBUGPORT:-9229}
export COMMAND=${@:-"yarn dev"}
EXISTING_CONTAINER_ID=""
if [ -n `docker-compose ps -q runner` ]; then
    EXISTING_CONTAINER_ID=`docker-compose ps -q runner`;
elif [ -n `docker ps -q --no-trunc | grep $(docker-compose ps -q runner)` ]; then
    EXISTING_CONTAINER_ID=`docker ps -q --no-trunc | grep $(docker-compose ps -q runner)`;
fi

if [ -z $EXISTING_CONTAINER_ID ]; then
  COMMAND=${@:-"yarn dev"} docker-compose run --service-ports --rm runner
else
  echo "Existing container ${EXISTING_CONTAINER_ID}"
  docker exec -it ${EXISTING_CONTAINER_ID} ${COMMAND}
fi
```

The script is executed like this.

```bash
[PORT=<desired port on host> DEBUGPORT=<desired debug port on host>] ./run [<command>]

DEFAULTS PORT=3000 DEBUGPORT=9229 COMMAND="yarn dev"
```

Sections in `[]` are optional and have defaults set.

To start the application, I need to write `./run` on the shell. It starts the container, exposing the ports 3000 and 9229 on the host and then runs `yarn dev` inside the container.

![Sample Output](https://theoverengineered.blog/docker-local.jpg)

Any command can be executed inside the container by prefixing it with `./run`
E.g. To add a package, run `./run yarn add some-package-name`

You could also do `./run bash` to get a bash shell attached to the container. This bash shell can be used to execute commands inside the container without the prefix './run'

The script also checks if a container is already running for the application and reuses the container to execute the command. Credits to [this answer on ServerFault](https://serverfault.com/a/935674/130937)

We can also write a similar script for windows machines using cmd/PowerShell.

This setup has helped me enormously. I don't have to worry about installing different versions of node/java/python etc. Besides, now the only dependency for local development is, Docker!
