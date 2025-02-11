# Use Node.js for building the Vue app
FROM node:18 as builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project and build it
COPY . .
RUN npm run build

# Use Nginx for serving the built frontend
FROM nginx:latest

# Copy the built files to Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx config if needed
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
