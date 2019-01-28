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
## H - Create a Dockerfile
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

# Make port 8080 available to the host
EXPOSE 8080
```

See below for some of the other things a Dockerfile can typically do (or see [here](https://docs.docker.com/engine/reference/builder/) for an official reference):
* `COPY <src> <dest>` - copy files or directories at `<src>` (relative to our Dockerfile ) to `<dest>` (inside our container)
* `ADD <src> <dest>` - like copy, but `<src>` can also be a url or link to some remote resource
* `RUN <command>` - run a command inside the container. The changes to the filesystem will be preserved. An example of this would be doing something like: `apt install nodejs`, which will make node available in our new image.
* `ENV <key> <val>` - declare an environment variable
* `USER` - declare the user to log into when attaching to the container (must be an existing user)
* `WORKDIR` - declare the directory to start in when attaching to the container
* `EXPOSE` - expose a port (not too important)


## I - Building the Docker Image
Once we have our Dockerfile sorted, we can build it into an image using the command: `docker build -t <dockerhub_username>/<image_name> <Dockerfile_path (this is usually just '.' if we're building in the same directory as Dockerfile)>`

This will start the builder which will start the specified base image, and incrementally run each command in your Dockerfile. With some exceptions such as `WORKDIR`, `ENV`, each command (eg: `RUN`, `COPY`, `ADD`) will add a new layer to our layered filesystem (more on this later).

After the image has been built, we can check it out using `docker images`. This will show you information like how recently the image was built and the size of the image.

## J - Pushing the Docker Image
Push the image to DockerHub, which is an online registry for sharing docker images (similar to a github for git). We can do this using the command `docker push <container_name>`. Notice how this pushes different layers at a time. However, before we do this, we have to make sure our image follows the naming convention: `<docker_username>/<name>`. If your image does not have this name, simply rebuild it with the new name (notice how quickly Docker can do this since it has all the layers cached locally).

## K - Starting a Container using our new Docker Image
We can start a container from our new image using  `docker run -p <host_port>:8080 <container_name> &`. While we could have done this before pushing since we built the image locally, since we pushed, we can now start this container from anywhere (try pulling down your neighbors image!). 

Also, notice the ampersand at the end of this command. This is just a shortcut to suppress the output from the container. We would do something more polished if we were running this in a production setting.

