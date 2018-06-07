FROM node:9
WORKDIR /workdir/app
ADD package.json /workdir/app
RUN npm i
ADD . /workdir/app

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
    && apt-get install -y --no-install-recommends dialog \
    && apt-get update \
    && apt-get install -y --no-install-recommends openssh-server \
    && echo "$SSH_PASSWD" | chpasswd
COPY sshd_config /etc/ssh/
EXPOSE 80 3978 2222

CMD service ssh start && npm start