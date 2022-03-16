# henryk-scheduler
A scheduling system made by a couple of students for the purpose of passing a class

# Setting up a developement enviroment
To start working on this project, you will need a working installation of NodeJS,
as well as a MongoDB server configured and available for the backend portion of this project.

Once you have those two working, all you need is to clone the repo and start the front and back ends
of the project.

To run the backend server, run these commands:
```sh
cd server
npm install --dev
npm run dev
```

To run the frontend server, run these commands:
```sh
cd client
npm install --dev
npm run dev
```

The backend server by default listens at `localhost:2999`, while the frontend server on `localhost:3000`.

# Building for production

To build the frontend, run these commands:
```sh
cd client
npm install
npm run build
```
This should produce `html`/`css`/`js` files in the `dist` directory, which should be served to the world.
Please note, that in order to have the website working properly, you will need to set up a proper index
fallback.

The backend server should be available under the same address, but with the `/api` location prefix.
To run the server, run these commands:
```sh
cd server
npm install
npm run start
```