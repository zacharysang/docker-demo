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
