FROM nginx:stable-alpine
# Use official Nginx image as base (for serving static content)

# Copy our app files into the default Nginx document root (/usr/share/nginx/html)
COPY . /usr/share/nginx/html
# Expose port 80 to the outside world
EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]