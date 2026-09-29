# Movie Search App

React app for searching movies with the [OMDb API](https://www.omdbapi.com/). Packaged for Docker, Jenkins, Kubernetes (k3s), and Bitbucket Pipelines.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5280/movie-search-app/, then add a free OMDb API key in the app (or set `VITE_OMDB_API_KEY` in `.env`). The dev server is pinned to **5280** so it does not use 5173/9173.

The app is served under `/movie-search-app/` so it matches the Kubernetes ingress path.

## Docker

```bash
docker build --build-arg VITE_APP_VERSION=local -t movie-search-app:latest .
docker run --rm -p 8080:80 movie-search-app:latest
```

Open http://localhost:8080/movie-search-app/

Health check: http://localhost:8080/health

Optional build-time API key:

```bash
docker build --build-arg VITE_OMDB_API_KEY=your-key -t movie-search-app:latest .
```

## Kubernetes (k3s)

```bash
kubectl apply -f k8s/
```

- NodePort: `http://<node-ip>:30082/movie-search-app/`
- Ingress path: `/movie-search-app`

Jenkins and the Bitbucket `deploy-k3s` custom pipeline build the image, import it into k3s, apply `k8s/`, and roll out `deployment/movie-search-app`.
