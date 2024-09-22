# PeerPrep Frontend - Developer Readme (for now)

## Important commands

The frontend is a **React + TypeScript** project using **Vite**. Note that `yarn` is used as the Node.js package manager here.

### Quick start

This application requires Node.js and the `yarn` package manager to be installed.

The Node.js installation can be done [here](https://nodejs.org/en).

The `yarn` package manager can be installed using the following terminal command once Node.js is installed:

```
npm install --global yarn
```

With `yarn` installed, you can run these two commands from the `./frontend` folder to get the frontend up and running quickly:

- `yarn` (installs all required dependencies used by this frontend)
- `yarn dev` (to run the application)

### Running the application: `yarn dev`

This command runs the application on port 5173. Run this command and visit http://localhost:5173 on your web browser to view the application.

When running the application in the development environment, you can also edit the source React TSX files and view the changes instantaneously on your web browser.

### Adding dependencies: `yarn add PACKAGE_NAME`

To add an NPM dependency to this application, use the `yarn add` command to add the specific desired `npm` package.

For more Yarn commands and their equivalents in terms of the `npm` command, you may refer to this cheatsheet [here](https://shift.infinite.red/npm-vs-yarn-cheat-sheet-8755b092e5cc).