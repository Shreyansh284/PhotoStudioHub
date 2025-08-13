# Photo Studio Backend API

This is the backend API for a photo studio management application. It provides a complete solution for a single admin to manage clients, create photo galleries (called "Spaces"), upload photos to Cloudinary, organize them into collections, and share these spaces with clients via a unique, public link.

## Features

-   **Admin Authentication**: Secure login for the admin using JSON Web Tokens (JWT).
-   **Client Management**: CRUD operations for managing clients.
-   **Spaces (Galleries)**: Create, read, update, and delete spaces for each client.
-   **Collections**: Organize photos within a space into named collections (e.g., "Candid", "Edited").
-   **Photo Uploads**: Upload multiple photos to Cloudinary, organized by collection.
-   **Photo Management**: Delete individual photos from a collection.
-   **Shareable Links**: Generate unique, public links for each space to share with clients.
-   **Layered Architecture**: Clean and organized codebase with a service-controller-repository pattern.
-   **Error Handling**: Global error handling middleware.

## Technologies Used

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Image Hosting**: Cloudinary
-   **Authentication**: JSON Web Tokens (JWT), bcryptjs
-   **File Handling**: Multer, streamifier
-   **Other**: dotenv, cors, nanoid

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later)
-   [MongoDB](https://www.mongodb.com/try/download/community)
-   A [Cloudinary](https://cloudinary.com/) account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Shreyansh284/PhotoStudioHub.git
    cd photo-studio-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the `photo-studio-backend` directory and add the following variables.

    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/photo-studio
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRES_IN=90d

    # Cloudinary Credentials
    CLOUD_NAME=your_cloudinary_cloud_name
    API_KEY=your_cloudinary_api_key
    API_SECRET=your_cloudinary_api_secret

    # Default Admin User (created on first startup)
    DEFAULT_ADMIN_EMAIL=admin@example.com
    DEFAULT_ADMIN_PASSWORD=adminpassword
    ```

### Running the Application

-   **Development Mode:**
    This will run the server with `nodemon`, which automatically restarts the server on file changes.
    ```bash
    npm run dev
    ```

-   **Production Mode:**
    ```bash
    npm start
    ```

The server will start on the port specified in your `.env` file (default is 3000).

## API Endpoints

The base URL for all endpoints is `/api/v1`.

### Authentication

| Method | Endpoint      | Description        | Access |
| :----- | :------------ | :----------------- | :----- |
| `POST` | `/auth/login` | Logs in the admin. | Public |

### Clients

| Method   | Endpoint       | Description                 | Access |
| :------- | :------------- | :-------------------------- | :----- |
| `POST`   | `/clients`     | Create a new client.        | Admin  |
| `GET`    | `/clients`     | Get all clients.            | Admin  |
| `GET`    | `/clients/:id` | Get a single client by ID.  | Admin  |
| `PATCH`  | `/clients/:id` | Update a client.            | Admin  |
| `DELETE` | `/clients/:id` | Delete a client.            | Admin  |

### Spaces

| Method   | Endpoint          | Description               | Access |
| :------- | :---------------- | :------------------------ | :----- |
| `POST`   | `/spaces`         | Create a new space.       | Admin  |
| `GET`    | `/spaces/:spaceId`| Get a single space by ID. | Admin  |
| `PATCH`  | `/spaces/:spaceId`| Update a space.           | Admin  |
| `DELETE` | `/spaces/:spaceId`| Delete a space.           | Admin  |
| `GET`    | `/spaces/share/:shareableLink` | Get a space for public viewing. | Public |

### Collections

| Method   | Endpoint                                  | Description                     | Access |
| :------- | :---------------------------------------- | :------------------------------ | :----- |
| `POST`   | `/spaces/:spaceId/collections`            | Create a new collection in a space. | Admin  |
| `GET`    | `/spaces/:spaceId/collections/:collectionId` | Get a single collection by ID. | Admin  |
| `PATCH`  | `/spaces/:spaceId/collections/:collectionId` | Update a collection.            | Admin  |
| `DELETE` | `/spaces/:spaceId/collections/:collectionId` | Delete a collection.            | Admin  |

### Photos

| Method   | Endpoint                                           | Description                       | Access |
| :------- | :------------------------------------------------- | :-------------------------------- | :----- |
| `POST`   | `/spaces/:spaceId/collections/:collectionId/photos`| Upload photos to a collection.    | Admin  |
| `DELETE` | `/spaces/:spaceId/collections/:collectionId/photos/:photoId` | Delete a photo from a collection. | Admin  |
