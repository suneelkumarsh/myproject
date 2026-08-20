FROM artifactory.devops.telekom.de/hub.docker.com/nginxinc/nginx-unprivileged:alpine-slim
USER nginx

COPY --chown=nginx:nginx dist/frontend/browser /usr/share/nginx/html

# Overwrite existing entrypoint from base image
ENTRYPOINT []
EXPOSE ${NGINX_PORT}
CMD ["nginx", "-g", "daemon off;"]
