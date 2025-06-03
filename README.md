# 2025 NYCU Cloud Native Course Final Project

This repository contains the final project for the 2025 NYCU Cloud Native Course.

## Project Structure

The repository is organized as follows:

```
cloud-native-2025-final/
├── frontend/           # Frontend application (UI, static assets)
├── backend/            # Backend application (API, business logic)
├── k8s/                # Kubernetes manifests and deployment files
├── docs/               # Documentation and design files
├── tests/              # Automated tests
├── scripts/            # Utility and setup scripts
└── README.md           # Project overview and instructions
```

- `frontend/`: Contains all frontend source code and assets.
- `backend/`: Contains backend source code and related files.
- `k8s/`: Contains Kubernetes manifests for deploying the platform components.

Each main directory may include its own `README.md` with more details about its contents, as well as a Dockerfile for its container.

## Development Flow

We follow the **GitHub Flow** for development:

1. **Clone** the repository to your local environment:
    ```bash
    git clone https://github.com/crescendoCat/2025-NYCU-Cloud-Native-Final.git
    cd 2025-NYCU-Cloud-Native-Final
    ```
2. **Create a new branch** for your work:
    - For new features:
        ```bash
        git checkout -b feat/new-feature
        ```
    - For bug fixes:
        ```bash
        git checkout -b fix/bug-to-fix
        ```
3. **Push** your branch to the remote repository:
    ```bash
    git push origin feat/new-feature
    # or
    git push origin fix/bug-to-fix
    ```
4. **Create a Pull Request (PR)** for code review on GitHub.

## Contribution Guidelines

- Always work on a separate branch.
- Submit a PR for every change.
- Wait for review and approval before merging.

## Docker Compose
1. **Build and run the entire application stack** using Docker Compose:
    ```bash
    docker compose up --build -d
    ```
2. **Generate debug mock data** for the backend:
    ```bash
    docker compose exec app flask gen-mock-data
    ```

## Docker Build & Run
1. **Backend**
    ```bash
    cd backend
    sudo docker build -t backend .
    sudo docker run -d --name backend -p 5000:5000 backend
    curl http://localhost:5000/hello # test API
    ```