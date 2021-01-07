FROM node:alpine

# Install toolset for building nextjs app
RUN apk add --update --no-cache \
    --repository http://dl-3.alpinelinux.org/alpine/edge/testing \
    vips-dev fftw-dev gcc g++ make libc6-compat bash

# Create workdir
RUN mkdir -p /usr/src
# Set container workdir
WORKDIR /usr/src
# Copy source files to workdir
COPY . /usr/src

# Install app deps
RUN npm install
# Install sharp for building nextjs app
RUN npm install sharp

# Remove unnecessary deps to minimize image size
RUN apk del gcc g++ make fftw-dev && \
    rm -rf /var/cache/apk/*

# Build nextjs app
RUN npm run build
# Expose port for running the app
EXPOSE 3000
# Run the app
CMD npm run start