{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_20
    pkgs.mongodb
  ];

  shellHook = ''
    echo "Welcome to MindfulAI development environment!"
    echo "You can start the backend with: node backend/server.js"
    echo "You can start the frontend with: npm start --prefix frontend"
  '';
}