help: ## Affiche l'aide de ce Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

deploy: ## Deploie l'application sur heroku
	heroku container:push web --arg http_proxy=${http_proxy},https_proxy=${https_proxy}
	heroku container:release web
	heroku open

deploy-local: ## Deploie l'application en local
	docker build -t sentier-ps-2-gpx --build-arg http_proxy=${http_proxy} --build-arg https_proxy=${https_proxy} -f Dockerfile-local .
	docker run -e PORT=5000 -e DATA_GOUV_NC_APIKEY=${DATA_GOUV_NC_APIKEY} -e http_proxy=${http_proxy} -e https_proxy=${https_proxy} -p 5000:5000 sentier-ps-2-gpx
