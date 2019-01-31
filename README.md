# Getting Acquainted
## A - Running an executable container
Docker images can be run either as a continuous container, or as an executable container that starts up, performs some action, and then stops. Try running `docker run hello-world`. This will automatically:
* Pull down the `hello-world` image provided by Docker (if not already present locally)
* Run it as an executable container - should print some stuff out
* Stop the container (but will not remove it, can add the `--rm` flag to tell docker to clean up after termination)

## B - Running an interactive container
We can also run a container and gain access to a terminal inside the container. Let's try to run a basic `ubuntu` container and get access to its shell by running: `docker run -it ubuntu`. Instead of running something and terminating like an executable, it will put you into a terminal inside an ubuntu container.

Let's create a file inside this container to see how the filesystem is preserved. Run `echo "this is a file that I made" > test.txt` to make a dummy file.

## C - Dettaching from an interactive container
From inside our ubuntu container, we could run `exit` to exit the container, but this also terminates the container which we may not want to do. To dettach from inside a container's terminal, type `ctrl+p` and then `ctrl+q`.

At this point, we can run `docker ps` to see that our ubuntu container is still running. The output of this command shows all running containers, the container id, image used, and some other status info.

## D - Attaching to a container
Whether it is a container that we have dettached from like we did just a moment ago, or if we started a dettached container using the `-d` flag, we can always attach to a container using the command: `docker attach <containerid>`

## E - Stopping a container
If we dettach from our ubuntu container, we are able to stop the container using the command `docker stop <container_id>`. Now if we run `docker ps` we will not see our container id there anymore. However, if we run `docker ps -a`, we will see that the container has been stopped, but not deleted.

## F - Starting a stopped container
Run `docker start <container_id>` to run the container we just stopped. Next re-attach to the container and check that our dummy file is still there.

## G - Removing a container
Now let's dettach from our ubuntu container again and then remove it using `docker rm <container_id>`. Note: We can only remove a container that has been stopped


# Making a new Docker Image
Before getting started on this section, head over to [DockerHub](http://dockerhub.com) to make an account. This is very similar to GitHub, but is centered around sharing Docker images rather than Git projects. Dockerhub serves as a 'registry' which is used to push/pull docker images to/from.

## H - Create a Dockerfile
To save some time, the files needed for what we are about to do can be downloaded by cloning [this repo](https://github.com/zacharysang/docker-demo.git)

For this demo, we will make a new image using this Dockerfile:
```
FROM node

# Copy in our node app
COPY guestbook_app /root/guestbook_app

# Set the working directory to be inside our node app
WORKDIR /root/guestbook_app

# Install dependencies
RUN npm install

# Make this an executable and specify the entrypoint
CMD npm start

# Declare mount point to save guestbook data to
VOLUME ["/root/data"]

# Make port 8080 available to the host
EXPOSE 8080  
```

In general, below are some of the other things a Dockerfile can typically do (or see [here](https://docs.docker.com/engine/reference/builder/) for an official reference):
* `COPY <src> <dest>` - copy files or directories at `<src>` (relative to our Dockerfile ) to `<dest>` (inside our container)
* `ADD <src> <dest>` - like copy, but `<src>` can also be a url or link to some remote resource
* `RUN <command>` - run a command inside the container. The changes to the filesystem will be preserved. An example of this would be doing something like: `apt install nodejs`, which will make node available in our new image.
* `ENV <key> <val>` - declare an environment variable
* `USER` - declare the user to log into when attaching to the container (must be an existing user)
* `WORKDIR` - declare the directory to start in when attaching to the container
* `EXPOSE` - expose a port to the host container


## I - Building the Docker Image
Once we have these files downloaded, which includes our `Dockerfile`, we can build it into an image using the command: `docker build -t <dockerhub_username>/<image_name> <Dockerfile_path>`. Where `Dockerfile_path` is usually just '.' if we're building in the same directory as Dockerfile.

This will start the builder which will start the specified base image, and incrementally run each command in your Dockerfile. With some exceptions such as `WORKDIR`, `ENV`, each command (eg: `RUN`, `COPY`, `ADD`) will add a new layer to our layered filesystem.

After the image has been built, we can check it out using `docker images`. This will show you information like how recently the image was built and the size of the image.

Additionally, you can use `dodcker history <image_name>` to have a look at the layer sizes for this image. If you run that with the image we just built here, you will be able to see the size of the layer created by running `npm install`, which installed all the dependencies required by our app.

(Optional) To maximize portability and boot time, we usually try to keep our Docker images small. Alpine linux is a base image that is often used with Docker images. It is really barebones which helps it to produce tiny images. In our Dockerfile try editing the first line from `FROM node` to `FROM node:alpine`. Here was have added a 'tag' which will use a different image from before (`:latest` is the default tag). Rebuild after this change and check out how much smaller your image is using `docker images`!

## J - Pushing the Docker Image
Push the image to DockerHub, which is an online registry for sharing docker images (similar to a github for git). We can do this using the command `docker push <dockerhub_username>/<container_name>`. Notice how this pushes different layers at a time.

## K - Starting a Container using our new Docker Image
We can start a container from our new image using  `docker run -d -p 8080:8080 <container_name>`. This will run our container as a daemon (-d), and map the host port 8080 to the container's port 8080 (`-p 8080:8080`). While we could have done this before pushing since we built the image locally, since we pushed, we can now start this container from anywhere (try pulling down your neighbors image!). 

Since our container is running, we will be able to check out the web preview by selecting the `Web Preview` button on the console and selecting `Preview on port 8080`. Here we can see our guestbook, log entries, and see how many other people have signed.

## L - Incorporating volumes
Currently, if we stop and start a new docker container using this image, the memory of past guests will be lost. This is because our container is stateless, which is good since we wouldn't want other people to get the guestbook history if they are starting up the guestbook container themselves using this image.

Having said this, we would like to save this data ourselves so that we can reload it after upgrading containers (requiring moving data to the upgraded container), or if we want to move this data between containers. It turns out that our guestbook app is already set up to write the guestbook data to the container's disk under `/root/data` on each new guest. We can use Docker Volumes to keep this data by simply adding `-v my-volume:/root/data` to the command in the previous step (K). This declares that we are mounting a volume `my-volume` to the directory `/root/data` within the container (if there isn't already a volume with this name, Docker will create a new blank one for us). Because of this mounting, all files that are written to anything under this directory will be saved to the volume, and when starting the container, the contents of the volume will be made available at this location.

So now we can try to start our container again with our updated command. We can populate the guestbook with some data, stop the container, start a new one, and still see our data!
